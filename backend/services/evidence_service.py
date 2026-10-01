import json
from database import get_db_connection

class EvidenceService:
    @staticmethod
    def save_evidence(user_id: int, evidence_id: str, filename: str, file_type: str, file_size: int, sha256: str, storage_path: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO evidence (user_id, evidence_id, filename, file_type, file_size, sha256, storage_path, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ANALYZED')
        ''', (user_id, evidence_id, filename, file_type, file_size, sha256, storage_path))
        conn.commit()
        conn.close()

    @staticmethod
    def save_analysis_result(evidence_id: str, ai_indicator: str, ai_confidence: float, forensic_status: str, metadata_status: str, reference_status: str, assessment: str, evidence_quality: str, provider: str, demo_mode: bool, why_json: dict, resilience_json: dict):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO analysis_results
            (evidence_id, ai_indicator, ai_confidence, forensic_status, metadata_status, reference_status, assessment, evidence_quality, provider, demo_mode, why_json, resilience_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (evidence_id, ai_indicator, ai_confidence, forensic_status, metadata_status, reference_status, assessment, evidence_quality, provider, int(demo_mode), json.dumps(why_json), json.dumps(resilience_json)))
        conn.commit()
        conn.close()

    @staticmethod
    def save_reference(evidence_id: str, original_sha256: str, reference_filename: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO evidence_references (evidence_id, original_sha256, reference_filename)
            VALUES (?, ?, ?)
        ''', (evidence_id, original_sha256, reference_filename))
        conn.commit()
        conn.close()

    @staticmethod
    def get_reference_by_evidence_id(evidence_id: str):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM evidence_references WHERE evidence_id = ? ORDER BY id DESC LIMIT 1', (evidence_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_evidence_detail(evidence_id: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM evidence WHERE evidence_id = ?', (evidence_id,))
        ev_row = cursor.fetchone()
        if not ev_row:
            conn.close()
            return None

        evidence = dict(ev_row)
        cursor.execute('SELECT * FROM analysis_results WHERE evidence_id = ?', (evidence_id,))
        an_row = cursor.fetchone()
        analysis = dict(an_row) if an_row else {}

        if analysis.get("why_json"):
            try:
                analysis["why_json"] = json.loads(analysis["why_json"])
            except Exception:
                pass
        if analysis.get("resilience_json"):
            try:
                analysis["resilience_json"] = json.loads(analysis["resilience_json"])
            except Exception:
                pass

        cursor.execute('SELECT * FROM metadata_results WHERE evidence_id = ?', (evidence_id,))
        meta_row = cursor.fetchone()
        metadata = dict(meta_row) if meta_row else {}
        if metadata.get("raw_json"):
            try:
                metadata["raw_json"] = json.loads(metadata["raw_json"])
            except Exception:
                pass

        cursor.execute('SELECT * FROM forensic_results WHERE evidence_id = ?', (evidence_id,))
        forensic_row = cursor.fetchone()
        forensic = dict(forensic_row) if forensic_row else {}
        if forensic.get("raw_json"):
            try:
                forensic["raw_json"] = json.loads(forensic["raw_json"])
            except Exception:
                pass

        cursor.execute('SELECT * FROM video_frames WHERE evidence_id = ? ORDER BY frame_num ASC', (evidence_id,))
        raw_frames = [dict(r) for r in cursor.fetchall()]
        frames = []
        for f in raw_frames:
            sec = f.get("timestamp_sec", 0.0) or 0.0
            mins = int(sec // 60)
            secs = int(sec % 60)
            f["timestamp_str"] = f"{mins:02d}:{secs:02d}"
            frames.append(f)

        cursor.execute('SELECT * FROM suspicious_intervals WHERE evidence_id = ?', (evidence_id,))
        intervals = [dict(r) for r in cursor.fetchall()]

        conn.close()

        return {
            "evidence": evidence,
            "analysis": analysis,
            "metadata": metadata,
            "forensic": forensic,
            "video_frames": frames,
            "suspicious_intervals": intervals
        }

    @staticmethod
    def get_evidence_history(user_id: int = None, search: str = None, filter_type: str = None) -> list:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = '''
            SELECT e.evidence_id, e.filename, e.file_type, e.file_size, e.sha256, e.upload_timestamp,
                   a.assessment, a.ai_indicator, a.ai_confidence, a.reference_status
            FROM evidence e
            LEFT JOIN analysis_results a ON e.evidence_id = a.evidence_id
            WHERE 1=1
        '''
        params = []
        if user_id:
            query += " AND e.user_id = ?"
            params.append(user_id)
        if search:
            query += " AND (e.evidence_id LIKE ? OR e.filename LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])
        if filter_type and filter_type.upper() != "ALL":
            query += " AND UPPER(e.file_type) = ?"
            params.append(filter_type.upper())

        query += " ORDER BY e.id DESC"
        cursor.execute(query, params)
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def get_admin_statistics() -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM evidence")
        total_evidence = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM evidence WHERE LOWER(file_type) IN ('jpg','jpeg','png','webp','image')")
        image_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM evidence WHERE LOWER(file_type) IN ('mp4','mov','webm','video')")
        video_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM evidence WHERE LOWER(file_type) = 'pdf'")
        pdf_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM analysis_results WHERE assessment IN ('NEEDS REVIEW', 'MULTIPLE INDICATORS')")
        needs_review_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM analysis_results WHERE reference_status = 'REFERENCE MISMATCH'")
        reference_mismatches = cursor.fetchone()[0]

        conn.close()

        return {
            "total_evidence": total_evidence,
            "image_analyses": image_count,
            "video_analyses": video_count,
            "pdf_analyses": pdf_count,
            "needs_review": needs_review_count,
            "reference_mismatches": reference_mismatches
        }
