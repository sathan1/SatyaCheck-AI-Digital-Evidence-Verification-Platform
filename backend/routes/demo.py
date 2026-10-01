import os
from flask import Blueprint, jsonify
from config import Config
from services.hash_service import HashService
from services.evidence_service import EvidenceService

demo_bp = Blueprint('demo', __name__)

@demo_bp.route('/samples', methods=['GET'])
def get_demo_samples():
    """
    Returns pre-configured demo cases for immediate hackathon judge testing.
    """
    samples = [
        {
            "id": "demo-authentic-photo",
            "title": "Demo 1: Authentic Photograph",
            "type": "image",
            "description": "Captured via DSLR camera with intact EXIF provenance, high noise consistency, and low AI indicators.",
            "expected_assessment": "LIKELY AUTHENTIC",
            "demo_preset": "authentic",
            "sample_file": "sample_authentic.jpg"
        },
        {
            "id": "demo-ai-generated",
            "title": "Demo 2: AI-Generated Image (Diffusion / Midjourney)",
            "type": "image",
            "description": "Synthetic image exhibit with elevated AI model indicators, missing camera metadata, and localized texture anomalies.",
            "expected_assessment": "MULTIPLE INDICATORS",
            "demo_preset": "ai_generated",
            "sample_file": "sample_ai_generated.jpg"
        },
        {
            "id": "demo-tampered-mismatch",
            "title": "Demo 3: Modified Document / Image (Reference Mismatch)",
            "type": "image",
            "description": "Uploaded image compared against registered original reference hash resulting in SHA-256 mismatch.",
            "expected_assessment": "REFERENCE MISMATCH",
            "demo_preset": "modified",
            "sample_file": "sample_modified.jpg"
        },
        {
            "id": "demo-deepfake-video",
            "title": "Demo 4: Short Video Exhibit",
            "type": "video",
            "description": "Video file analyzed frame-by-frame (~1 FPS). Highlights suspicious temporal interval from 00:04 to 00:08.",
            "expected_assessment": "NEEDS REVIEW",
            "demo_preset": "video",
            "sample_file": "sample_video.mp4"
        }
    ]
    return jsonify({"demo_samples": samples}), 200
