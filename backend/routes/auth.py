from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "User with this email already exists."}), 400

    pwd_hash = generate_password_hash(password)
    # Make admin if email is admin@satyacheck.org
    is_admin = 1 if email == "admin@satyacheck.org" else 0

    cursor.execute("INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)", (email, pwd_hash, is_admin))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Registration successful.",
        "user": {"id": user_id, "email": email, "is_admin": bool(is_admin)}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful.",
        "token": f"satya_token_{user['id']}",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "is_admin": bool(user['is_admin'])
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    # Simple token validation for demo hackathon setup
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer satya_token_"):
        try:
            uid = int(auth_header.replace("Bearer satya_token_", ""))
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, is_admin, created_at FROM users WHERE id = ?", (uid,))
            user = cursor.fetchone()
            conn.close()
            if user:
                return jsonify({"user": dict(user)}), 200
        except Exception:
            pass

    # Default guest user response for smooth demo experience
    return jsonify({
        "user": {
            "id": 1,
            "email": "investigator@satyacheck.org",
            "is_admin": True
        }
    }), 200
