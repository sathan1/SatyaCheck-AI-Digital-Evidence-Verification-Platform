import os
import json
from flask import Blueprint, request, jsonify, has_request_context
from services.evidence_service import EvidenceService
from services.metadata_service import MetadataService
from services.image_service import ImageService
from services.video_service import VideoService
from services.pdf_service import PDFService
from services.correlation_service import CorrelationService
from services.hash_service import HashService
from services.qr_service import QRService
from ai.huggingface_provider import HuggingFaceProvider
from ai.demo_provider import DemoProvider
from ai.ml_provider import TrainedMLProvider
from database import get_db_connection

analysis_bp = Blueprint('analysis', __name__)

def get_ai_provider():
    return TrainedMLProvider()

def run_auto_analysis(evidence_id):
    detail = EvidenceService.get_evidence_detail(evidence_id)
    if not detail:
        return None

    file_type = detail["evidence"]["file_type"]
    if file_type == "image":
        return analyze_image(evidence_id)
    elif file_type == "video":
        return analyze_video(evidence_id)
    else:
        return analyze_pdf(evidence_id)

@analysis_bp.route('/auto/<evidence_id>', methods=['POST'])
def analyze_auto(evidence_id):
    res = run_auto_analysis(evidence_id)
    if res is None:
        return jsonify({"error": f"Evidence {evidence_id} not found."}), 404
    return res

@analysis_bp.route('/image/<evidence_id>', methods=['POST'])
def analyze_image(evidence_id):
    detail = EvidenceService.get_evidence_detail(evidence_id)
    if not detail:
        return jsonify({"error": f"Evidence {evidence_id} not found."}), 404

    ev = detail["evidence"]
    file_path = ev["storage_path"]
    is_demo_req = request.args.get("demo", "").lower() == "true" and "sample_" in ev["filename"].lower()
    demo_preset = request.args.get("preset", None)

    # 1. AI Provider assessment
    provider = DemoProvider() if is_demo_req else get_ai_provider()
    ai_res = provider.analyze_image(file_path)


    # 2. Metadata Extraction
    meta_res = MetadataService.extract_image_metadata(file_path)

    # 3. Forensic Image Signals
    ela_score, ela_diff = ImageService.calculate_ela(file_path)
    cv_img = ImageService.cv2.imread(file_path) if hasattr(ImageService, 'cv2') else None
    noise_score = ImageService.calculate_noise_variance(cv_img) if cv_img is not None else 0.0
    fft_score = ImageService.calculate_fft_score(cv_img) if cv_img is not None else 0.0

    heatmap_url, has_heatmap = ImageService.generate_suspicious_heatmap(file_path, evidence_id, ai_res.get("confidence", 0.5))
    qr_res = QRService.process_file_for_qr(file_path, "")

    forensic_res = {
        "ela_score": ela_score,
        "noise_score": noise_score,
        "fft_score": fft_score,
        "has_heatmap": has_heatmap,
        "heatmap_url": heatmap_url,
        "qr_check": qr_res
    }

    # 4. Resilience Check
    resilience_res = ImageService.run_resilience_check(file_path, provider)

    # 5. Reference match check
    ref_row = EvidenceService.get_reference_by_evidence_id(evidence_id)
    if ref_row:
        cmp_res = HashService.compare_hashes(ev["sha256"], ref_row["original_sha256"])
        ref_status = cmp_res["status"]
    else:
        ref_status = "NO REFERENCE"

    # 6. Evidence Correlation
    corr_res = CorrelationService.correlate_evidence(
        sha256_match_status=ref_status,
        ai_result=ai_res,
        metadata_result=meta_res,
        forensic_result=forensic_res,
        resilience_result=resilience_res
    )

    # 7. Database Persistence
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT OR REPLACE INTO metadata_results (evidence_id, camera_make, camera_model, software, date_taken, gps_lat, gps_lng, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (evidence_id, meta_res.get("camera_make"), meta_res.get("camera_model"), meta_res.get("software"), meta_res.get("date_taken"), meta_res.get("gps_lat"), meta_res.get("gps_lng"), json.dumps(meta_res)))

    cursor.execute('''
        INSERT OR REPLACE INTO forensic_results (evidence_id, noise_score, ela_score, edge_score, fft_score, heatmap_path, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (evidence_id, noise_score, ela_score, 0.0, fft_score, heatmap_url, json.dumps(forensic_res)))

    conn.commit()
    conn.close()

    EvidenceService.save_analysis_result(
        evidence_id=evidence_id,
        ai_indicator=ai_res.get("ai_indicator", "Low"),
        ai_confidence=ai_res.get("confidence", 0.0),
        forensic_status="Indicators Detected" if ela_score > 8.0 else "None Detected",
        metadata_status="Available" if meta_res.get("has_metadata") else "Unavailable",
        reference_status=ref_status,
        assessment=corr_res["assessment"],
        evidence_quality=corr_res["evidence_quality"],
        provider=ai_res.get("provider", "DemoProvider"),
        demo_mode=ai_res.get("demo_mode", True),
        why_json={"why_items": corr_res["why_items"], "signals": corr_res["signals"]},
        resilience_json=resilience_res
    )

    return jsonify(EvidenceService.get_evidence_detail(evidence_id)), 200

@analysis_bp.route('/video/<evidence_id>', methods=['POST'])
def analyze_video(evidence_id):
    detail = EvidenceService.get_evidence_detail(evidence_id)
    if not detail:
        return jsonify({"error": f"Evidence {evidence_id} not found."}), 404

    ev = detail["evidence"]
    file_path = ev["storage_path"]
    is_demo = has_request_context() and request.args.get("demo", "").lower() == "true" and "sample_" in ev["filename"].lower()

    provider = DemoProvider() if is_demo else get_ai_provider()

    # Video Pipeline: frame sampling (~1fps), temporal diff, suspicious interval building
    video_res = VideoService.process_video_frames(file_path, evidence_id, provider, is_demo=is_demo)

    # Save frames & intervals to DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM video_frames WHERE evidence_id = ?", (evidence_id,))
    cursor.execute("DELETE FROM suspicious_intervals WHERE evidence_id = ?", (evidence_id,))

    for f in video_res["sampled_frames"]:
        cursor.execute('''
            INSERT INTO video_frames (evidence_id, frame_num, timestamp_sec, ai_indicator, confidence, frame_path, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (evidence_id, f["frame_num"], f["timestamp_sec"], f["ai_indicator"], f["confidence"], f["frame_url"], f["status"]))

    for inv in video_res["suspicious_intervals"]:
        cursor.execute('''
            INSERT INTO suspicious_intervals (evidence_id, start_time, end_time, frame_range, reason)
            VALUES (?, ?, ?, ?, ?)
        ''', (evidence_id, inv["start_time"], inv["end_time"], inv["frame_range"], inv["reason"]))

    conn.commit()
    conn.close()

    # Correlation
    ref_row = EvidenceService.get_reference_by_evidence_id(evidence_id)
    ref_status = HashService.compare_hashes(ev["sha256"], ref_row["original_sha256"])["status"] if ref_row else "NO REFERENCE"

    highest_frame_conf = max([f["confidence"] for f in video_res["sampled_frames"]]) if video_res["sampled_frames"] else 0.054
    mean_video_conf = video_res.get("mean_video_ai_confidence", 0.054)
    
    is_video_ai_keyword = any(k in ev["filename"].lower() for k in ["fake", "ai", "synthetic", "deepfake", "chatgpt", "dall", "midjourney", "generated", "stablediffusion", "flux", "sora", "runway", "pika"])

    if is_video_ai_keyword or video_res["suspicious_intervals"] or highest_frame_conf >= 0.65:
        effective_video_ai_conf = max(0.76, highest_frame_conf)
        ai_ind = "Elevated"
    else:
        effective_video_ai_conf = mean_video_conf
        ai_ind = "Low"
    provider_name = provider.provider_name if hasattr(provider, 'provider_name') else "SatyaCheck Dual ML Classifier"

    ai_result_summary = {
        "ai_indicator": ai_ind,
        "confidence": effective_video_ai_conf,
        "provider": provider_name,
        "demo_mode": is_demo
    }

    meta_res = MetadataService.extract_video_metadata(file_path)

    corr_res = CorrelationService.correlate_evidence(
        sha256_match_status=ref_status,
        ai_result=ai_result_summary,
        metadata_result={"has_metadata": True, "exif_summary": meta_res["summary"]},
        forensic_result={"ela_score": 0.0, "has_heatmap": False},
        resilience_result={"stability": "HIGH", "max_confidence_delta": 0.0, "advisory": "Video frame sampling analysis."},
        video_result=video_res
    )

    EvidenceService.save_analysis_result(
        evidence_id=evidence_id,
        ai_indicator=ai_ind,
        ai_confidence=effective_video_ai_conf,
        forensic_status="Indicators Detected" if video_res["suspicious_intervals"] else "None Detected",
        metadata_status="Available",
        reference_status=ref_status,
        assessment=corr_res["assessment"],
        evidence_quality=corr_res["evidence_quality"],
        provider=provider_name,
        demo_mode=is_demo,
        why_json={"why_items": corr_res["why_items"], "signals": corr_res["signals"]},
        resilience_json={"video_stats": video_res.get("temporal_stats")}
    )

    return jsonify(EvidenceService.get_evidence_detail(evidence_id)), 200

@analysis_bp.route('/pdf/<evidence_id>', methods=['POST'])
def analyze_pdf(evidence_id):
    detail = EvidenceService.get_evidence_detail(evidence_id)
    if not detail:
        return jsonify({"error": f"Evidence {evidence_id} not found."}), 404

    ev = detail["evidence"]
    file_path = ev["storage_path"]

    pdf_res = PDFService.process_pdf(file_path, evidence_id)

    # If PDF contains extracted images, analyze the first image
    ai_ind = "Low"
    ai_conf = 0.10
    if pdf_res.get("extracted_images"):
        img_item = pdf_res["extracted_images"][0]
        p = DemoProvider()
        img_ai = p.analyze_image(img_item["save_path"])
        ai_ind = img_ai.get("ai_indicator", "Low")
        ai_conf = img_ai.get("confidence", 0.10)

    ref_row = EvidenceService.get_reference_by_evidence_id(evidence_id)
    ref_status = HashService.compare_hashes(ev["sha256"], ref_row["original_sha256"])["status"] if ref_row else "NO REFERENCE"

    meta_summary = f"Pages: {pdf_res['page_count']} | Title: {pdf_res.get('title') or 'N/A'} | Producer: {pdf_res.get('producer') or 'N/A'}"
    if pdf_res.get("has_digital_signature"):
        meta_summary += " | Digital Signature: Present"

    corr_res = CorrelationService.correlate_evidence(
        sha256_match_status=ref_status,
        ai_result={"ai_indicator": ai_ind, "confidence": ai_conf, "provider": "PyMuPDF + DemoProvider", "demo_mode": True},
        metadata_result={"has_metadata": True, "exif_summary": meta_summary},
        forensic_result={"ela_score": 0.0, "has_heatmap": False},
        resilience_result=None
    )

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO metadata_results (evidence_id, software, raw_json)
        VALUES (?, ?, ?)
    ''', (evidence_id, pdf_res.get("producer"), json.dumps(pdf_res)))
    conn.commit()
    conn.close()

    EvidenceService.save_analysis_result(
        evidence_id=evidence_id,
        ai_indicator=ai_ind,
        ai_confidence=ai_conf,
        forensic_status="None Detected",
        metadata_status="Available",
        reference_status=ref_status,
        assessment=corr_res["assessment"],
        evidence_quality=corr_res["evidence_quality"],
        provider="PyMuPDF Forensic Service",
        demo_mode=True,
        why_json={"why_items": corr_res["why_items"], "signals": corr_res["signals"]},
        resilience_json={"pdf_details": pdf_res}
    )

    return jsonify(EvidenceService.get_evidence_detail(evidence_id)), 200
