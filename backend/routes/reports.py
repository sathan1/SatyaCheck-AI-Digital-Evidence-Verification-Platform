import os
from flask import Blueprint, jsonify, send_file
from config import Config
from services.evidence_service import EvidenceService
from services.report_service import ReportService
from database import get_db_connection

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/<evidence_id>/generate', methods=['POST'])
def generate_report(evidence_id):
    detail = EvidenceService.get_evidence_detail(evidence_id)
    if not detail:
        return jsonify({"error": f"Evidence {evidence_id} not found."}), 404

    ev = detail["evidence"]
    an = detail["analysis"]

    report_filename = f"satya_report_{evidence_id}.pdf"
    report_output_path = os.path.join(Config.REPORT_FOLDER, report_filename)

    try:
        ReportService.generate_pdf_report(
            evidence_detail=detail,
            output_path=report_output_path
        )

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO reports (evidence_id, report_path)
            VALUES (?, ?)
        ''', (evidence_id, report_output_path))
        conn.commit()
        conn.close()

        return jsonify({
            "message": "Forensic PDF report generated successfully.",
            "evidence_id": evidence_id,
            "report_url": f"/api/report/{evidence_id}"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Report generation failed: {str(e)}"}), 500

@reports_bp.route('/<evidence_id>', methods=['GET'])
def download_report(evidence_id):
    report_filename = f"satya_report_{evidence_id}.pdf"
    report_path = os.path.join(Config.REPORT_FOLDER, report_filename)

    if not os.path.exists(report_path):
        # Try generating on the fly
        detail = EvidenceService.get_evidence_detail(evidence_id)
        if detail:
            try:
                ReportService.generate_pdf_report(
                    evidence_detail=detail,
                    output_path=report_path
                )
            except Exception:
                pass

    if os.path.exists(report_path):
        return send_file(report_path, mimetype='application/pdf', as_attachment=True, download_name=report_filename)
    
    return jsonify({"error": "Report file not found."}), 404
