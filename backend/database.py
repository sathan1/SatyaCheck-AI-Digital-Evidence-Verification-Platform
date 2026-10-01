import sqlite3
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH, timeout=30.0)
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
    except Exception:
        pass
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    Config.init_folders()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Evidence Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            evidence_id TEXT UNIQUE NOT NULL,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            sha256 TEXT NOT NULL,
            upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'PENDING',
            storage_path TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # References Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS evidence_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT NOT NULL,
            original_sha256 TEXT NOT NULL,
            reference_filename TEXT,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
        )
    ''')

    # Analysis Results Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT UNIQUE NOT NULL,
            ai_indicator TEXT NOT NULL,
            ai_confidence REAL NOT NULL,
            forensic_status TEXT NOT NULL,
            metadata_status TEXT NOT NULL,
            reference_status TEXT NOT NULL,
            assessment TEXT NOT NULL,
            evidence_quality TEXT NOT NULL,
            analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            provider TEXT NOT NULL,
            demo_mode BOOLEAN NOT NULL,
            why_json TEXT,
            resilience_json TEXT,
            FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
        )
    ''')

    # Metadata Results Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS metadata_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT UNIQUE NOT NULL,
            camera_make TEXT,
            camera_model TEXT,
            software TEXT,
            date_taken TEXT,
            gps_lat REAL,
            gps_lng REAL,
            raw_json TEXT,
            FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
        )
    ''')

    # Forensic Results Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS forensic_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT UNIQUE NOT NULL,
            noise_score REAL,
            ela_score REAL,
            edge_score REAL,
            fft_score REAL,
            heatmap_path TEXT,
            raw_json TEXT,
            FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
        )
    ''')

    # Video Frames Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS video_frames (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT NOT NULL,
            frame_num INTEGER NOT NULL,
            timestamp_sec REAL NOT NULL,
            ai_indicator TEXT NOT NULL,
            confidence REAL NOT NULL,
            frame_path TEXT,
            status TEXT NOT NULL,
            FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
        )
    ''')

    # Suspicious Intervals Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suspicious_intervals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            frame_range TEXT NOT NULL,
            reason TEXT NOT NULL,
            FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
        )
    ''')

    # Reports Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT UNIQUE NOT NULL,
            report_path TEXT NOT NULL,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
        )
    ''')

    # Rate Limiting Tracker Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rate_limits (
            user_key TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )
    ''')

    # File Hashes Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS file_hashes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT NOT NULL,
            hash TEXT NOT NULL,
            uploaded_by TEXT NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Verification Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS verification_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            who TEXT NOT NULL,
            which_file TEXT NOT NULL,
            result TEXT NOT NULL,
            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
