import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ExifTags
from config import Config
from database import init_db
from services.hash_service import HashService
from services.evidence_service import EvidenceService

def create_sample_files():
    Config.init_folders()
    init_db()

    sample_dir = Config.SAMPLE_FOLDER
    upload_dir = Config.UPLOAD_FOLDER

    # 1. Authentic Photograph with EXIF
    auth_path = os.path.join(sample_dir, "sample_authentic.jpg")
    img_auth = Image.new('RGB', (1280, 720), color=(30, 41, 59))
    draw = ImageDraw.Draw(img_auth)
    draw.rectangle([100, 100, 1180, 620], outline=(0, 180, 216), width=4)
    draw.text((200, 300), "SATYACHECK SAMPLE EXHIBIT A: Authentic Photo", fill=(255, 255, 255))
    draw.text((200, 350), "Camera: Canon EOS R5 | Lens: RF 50mm f/1.2", fill=(6, 214, 160))
    
    # Save authentic image
    img_auth.save(auth_path, "JPEG", quality=95)

    # 2. AI-Generated Image Sample
    ai_path = os.path.join(sample_dir, "sample_ai_generated.jpg")
    img_ai = Image.new('RGB', (1280, 720), color=(15, 23, 42))
    draw = ImageDraw.Draw(img_ai)
    draw.ellipse([300, 150, 980, 570], fill=(124, 58, 237), outline=(239, 68, 68), width=6)
    draw.text((420, 340), "SATYACHECK SAMPLE EXHIBIT B: Synthetic Render", fill=(255, 255, 255))
    draw.text((450, 400), "Model Assessment: 88% Synthetic Indicator", fill=(255, 183, 3))
    img_ai.save(ai_path, "JPEG", quality=90)

    # 3. Modified Document Sample
    mod_path = os.path.join(sample_dir, "sample_modified.jpg")
    img_mod = Image.new('RGB', (1280, 720), color=(248, 250, 252))
    draw = ImageDraw.Draw(img_mod)
    draw.rectangle([50, 50, 1230, 670], outline=(30, 41, 59), width=2)
    draw.text((100, 100), "EVIDENCE CONTRACT DOCUMENT v2.1", fill=(15, 23, 42))
    draw.rectangle([100, 250, 800, 320], fill=(254, 226, 226))
    draw.text((120, 270), "[ALTERED AMOUNT]: $250,000.00 USD", fill=(185, 28, 28))
    img_mod.save(mod_path, "JPEG", quality=85)

    # 4. Short Sample Video MP4 using OpenCV
    vid_path = os.path.join(sample_dir, "sample_video.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(vid_path, fourcc, 30.0, (640, 360))

    for sec in range(10): # 10 seconds = 300 frames
        for f in range(30):
            frame = np.zeros((360, 640, 3), dtype=np.uint8)
            # Background gradient
            frame[:, :] = (sec * 20 % 255, 40, 80)
            
            # Draw frame text
            ts = f"00:0{sec}"
            cv2.putText(frame, f"EVIDENCE VIDEO - TIMESTAMP {ts}", (40, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            # Anomaly injected at 00:04 to 00:07
            if 4 <= sec <= 7:
                cv2.rectangle(frame, (200, 100), (440, 260), (0, 0, 255), -1)
                cv2.putText(frame, "SUSPICIOUS FRAME", (220, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            else:
                cv2.circle(frame, (320, 180), 80, (0, 255, 160), -1)

            out.write(frame)
    out.release()

    print("Sample media files seeded successfully in samples directory.")

if __name__ == "__main__":
    create_sample_files()
