from flask import Blueprint, request, jsonify
from services.evidence_service import EvidenceService
from database import get_db_connection

admin_bp = Blueprint('admin', __name__)

def check_admin_role():
    role_header = request.headers.get("X-User-Role", "").lower()
    if role_header == "user":
        return False

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer satya_token_"):
        try:
            uid = int(auth_header.replace("Bearer satya_token_", ""))
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT is_admin FROM users WHERE id = ?", (uid,))
            user = cursor.fetchone()
            conn.close()
            if user:
                return bool(user['is_admin'])
        except Exception:
            pass
    return True

@admin_bp.route('/statistics', methods=['GET'])
def get_admin_stats():
    if not check_admin_role():
        return jsonify({"error": "403 Access Denied: Admin privileges required."}), 403

    stats = EvidenceService.get_admin_statistics()
    recent = EvidenceService.get_evidence_history()[:10]
    return jsonify({
        "statistics": stats,
        "recent_verifications": recent
    }), 200

@admin_bp.route('/file_hashes', methods=['GET'])
def get_file_hashes():
    if not check_admin_role():
        return jsonify({"error": "403 Access Denied: Admin privileges required."}), 403

    search_query = request.args.get('search', '').strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    if search_query:
        cursor.execute(
            "SELECT * FROM file_hashes WHERE file_name LIKE ? OR uploaded_by LIKE ? OR hash LIKE ? ORDER BY upload_date DESC",
            (f'%{search_query}%', f'%{search_query}%', f'%{search_query}%')
        )
    else:
        cursor.execute("SELECT * FROM file_hashes ORDER BY upload_date DESC")

    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({"file_hashes": rows}), 200

@admin_bp.route('/verification_logs', methods=['GET'])
def get_verification_logs():
    if not check_admin_role():
        return jsonify({"error": "403 Access Denied: Admin privileges required."}), 403

    search_query = request.args.get('search', '').strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    if search_query:
        cursor.execute(
            "SELECT * FROM verification_logs WHERE who LIKE ? OR which_file LIKE ? OR result LIKE ? ORDER BY time DESC",
            (f'%{search_query}%', f'%{search_query}%', f'%{search_query}%')
        )
    else:
        cursor.execute("SELECT * FROM verification_logs ORDER BY time DESC")

    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({"verification_logs": rows}), 200

@admin_bp.route('/file_hashes/<int:record_id>', methods=['DELETE'])
def delete_file_hash_record(record_id):
    if not check_admin_role():
        return jsonify({"error": "403 Access Denied: Admin privileges required."}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM file_hashes WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Record {record_id} deleted successfully."}), 200

@admin_bp.route('/evidence/<evidence_id>', methods=['DELETE'])
def delete_evidence_record(evidence_id):
    if not check_admin_role():
        return jsonify({"error": "403 Access Denied: Admin privileges required."}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM evidence WHERE evidence_id = ?", (evidence_id,))
    cursor.execute("DELETE FROM analysis_results WHERE evidence_id = ?", (evidence_id,))
    cursor.execute("DELETE FROM forensic_results WHERE evidence_id = ?", (evidence_id,))
    cursor.execute("DELETE FROM metadata_results WHERE evidence_id = ?", (evidence_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Record {evidence_id} deleted successfully."}), 200
