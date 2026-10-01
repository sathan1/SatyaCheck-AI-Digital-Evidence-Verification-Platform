import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "satya-check-cyber-forensics-secret-key-2026")
    DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "satyacheck.db"))
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "uploads"))
    REPORT_FOLDER = os.getenv("REPORT_FOLDER", str(BASE_DIR / "reports"))
    SAMPLE_FOLDER = os.getenv("SAMPLE_FOLDER", str(BASE_DIR / "samples"))
    
    # AI Model Settings
    HF_API_KEY = os.getenv("HF_API_KEY", "")
    HF_MODEL = os.getenv("HF_MODEL", "umm-maybe/AI-image-detector")
    
    # Validation Rules
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 20971520)) # 20MB
    ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png", "webp"}
    ALLOWED_VIDEO_EXT = {"mp4", "mov", "webm"}
    ALLOWED_DOC_EXT = {"pdf"}
    
    # Rate Limiting
    MAX_UPLOADS_PER_MINUTE = 10

    @classmethod
    def init_folders(cls):
        for path in [cls.UPLOAD_FOLDER, cls.REPORT_FOLDER, cls.SAMPLE_FOLDER]:
            os.makedirs(path, exist_ok=True)
