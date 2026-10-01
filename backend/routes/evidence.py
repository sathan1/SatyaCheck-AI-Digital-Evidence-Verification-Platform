import os
import time
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from config import Config
from services.hash_service import HashService
from services.evidence_service import EvidenceService
from database import get_db_connection

evidence_bp = Blueprint('evidence', __name__)

def check_rate_limit(user_key: str) -> bool:
    """
    Rate limiting: Maximum 10 uploads/minute/user
    """
    now = int(time.time())
    one_minute_ago = now - 60
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clean old records
    cursor.execute("DELETE FROM rate_limits WHERE timestamp < ?", (one_minute_ago,))
    cursor.execute("SELECT COUNT(*) FROM rate_limits WHERE user_key = ? AND timestamp >= ?", (user_key, one_minute_ago))
    count = cursor.fetchone()[0]

    if count >= Config.MAX_UPLOADS_PER_MINUTE:
        conn.close()
        return False

    cursor.execute("INSERT INTO rate_limits (user_key, timestamp) VALUES (?, ?)", (user_key, now))
    conn.commit()
    conn.close()
    return True

@evidence_bp.route('/upload', methods=['POST'])
def upload_file():
    user_ip = request.remote_addr or "127.0.0.1"
    if not check_rate_limit(user_ip):
        return jsonify({"error": "Rate limit exceeded. Maximum 10 uploads per minute allowed."}), 429

    if 'file' not in request.files:
        return jsonify({"error": "No file part in request."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected."}), 400

    orig_filename = secure_filename(file.filename) or "evidence_file"
    ext = orig_filename.rsplit('.', 1)[-1].lower() if '.' in orig_filename else ''

    all_allowed = Config.ALLOWED_IMAGE_EXT | Config.ALLOWED_VIDEO_EXT | Config.ALLOWED_DOC_EXT
    if ext not in all_allowed:
        return jsonify({
            "error": f"Unsupported file extension '.{ext}'. Supported extensions: JPG, PNG, WEBP, MP4, MOV, WEBM, PDF"
        }), 400

    # Read bytes for size check
    file_bytes = file.read()
    file_size = len(file_bytes)

    if file_size > Config.MAX_FILE_SIZE:
        return jsonify({
            "error": f"File size ({round(file_size / (1024*1024), 2)} MB) exceeds maximum limit of 20 MB."
        }), 400

    # Determine core category
    if ext in Config.ALLOWED_IMAGE_EXT:
        file_category = "image"
    elif ext in Config.ALLOWED_VIDEO_EXT:
        file_category = "video"
    else:
        file_category = "pdf"

    # Save file with unique randomized storage name
    evidence_id = HashService.generate_evidence_id()
    saved_filename = f"{evidence_id}_{orig_filename}"
    storage_path = os.path.join(Config.UPLOAD_FOLDER, saved_filename)

    with open(storage_path, "wb") as f_out:
        f_out.write(file_bytes)

    # Calculate SHA-256 cryptographic fingerprint immediately
    sha256 = HashService.calculate_sha256(storage_path)

    # User ID fallback
    user_id = 1

    # Save Evidence record in SQLite
    EvidenceService.save_evidence(
        user_id=user_id,
        evidence_id=evidence_id,
        filename=orig_filename,
        file_type=file_category,
        file_size=file_size,
        sha256=sha256,
        storage_path=storage_path
    )

    # Automatically register SHA-256 hash in file_hashes table for instant tamper verification
    try:
        from datetime import datetime
        conn = get_db_connection()
        cursor = conn.cursor()
        upload_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("SELECT id FROM file_hashes WHERE file_name = ? LIMIT 1", (orig_filename,))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO file_hashes (file_name, hash, uploaded_by, upload_date) VALUES (?, ?, ?, ?)",
                (orig_filename, sha256, "user@satyacheck.org", upload_date)
            )
            conn.commit()
        conn.close()
    except Exception as e:
        print("Auto hash store note:", e)

    return jsonify({
        "message": "File uploaded and fingerprinted successfully.",
        "evidence_id": evidence_id,
        "filename": orig_filename,
        "file_type": file_category,
        "file_size": file_size,
        "sha256": sha256,
        "storage_url": f"/uploads/{saved_filename}"
    }), 201

@evidence_bp.route('/<evidence_id>', methods=['GET'])
def get_evidence(evidence_id):
    detail = EvidenceService.get_evidence_detail(evidence_id)
    if not detail:
        return jsonify({"error": f"Evidence record {evidence_id} not found."}), 404
    return jsonify(detail), 200

@evidence_bp.route('/history', methods=['GET'])
def history():
    search = request.args.get('search', '').strip()
    filter_type = request.args.get('type', '').strip()
    rows = EvidenceService.get_evidence_history(search=search, filter_type=filter_type)
    return jsonify({"history": rows}), 200
