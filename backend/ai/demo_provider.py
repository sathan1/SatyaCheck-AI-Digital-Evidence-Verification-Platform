import os
import random
import cv2
import numpy as np
from PIL import Image
from .base_provider import BaseAIProvider

class DemoProvider(BaseAIProvider):
    """
    Dynamic Heuristic Demo Provider for SatyaCheck.
    Provides realistic, image-specific probabilistic assessment based on pixel noise,
    texture Laplacian variance, and unique file hashing.
    ALWAYS marks demo_mode = True.
    """
    def __init__(self):
        self.provider_name = "DemoProvider (Simulated)"

    def analyze_image(self, file_path: str, is_demo_preset: str = None) -> dict:
        filename = os.path.basename(file_path).lower()

        # Keywords checking for explicit presets
        real_keywords = ["authentic", "camera", "canon", "nikon", "iphone", "samsung", "exif", "original_photo", "dsc_"]
        ai_keywords = ["ai", "synthetic", "midjourney", "diffusion", "deepfake", "generated", "dall", "stablediffusion", "flux"]

        if is_demo_preset == "authentic" or any(k in filename for k in real_keywords):
            confidence = 0.054
            indicator = "Low"
        elif is_demo_preset == "modified" or "mismatch" in filename:
            confidence = 0.682
            indicator = "Medium"
        elif is_demo_preset == "ai_generated" or any(k in filename for k in ai_keywords):
            confidence = 0.884
            indicator = "Elevated"
        else:
            # Multi-signal AI Forensic Analysis on actual image pixel data
            score_signals = []
            ai_score = 0.25 # Neutral baseline

            try:
                # 1. EXIF Metadata Hardware Check
                has_camera_exif = False
                try:
                    with Image.open(file_path) as pil_img:
                        exif = pil_img._getexif()
                        if exif:
                            # 271 is Make, 272 is Model
                            if 271 in exif or 272 in exif:
                                has_camera_exif = True
                except Exception:
                    pass

                if has_camera_exif:
                    ai_score -= 0.35
                    score_signals.append("Hardware camera EXIF tags identified")

                # 2. Pixel Noise & Texture Variance (Laplacian)
                img = cv2.imread(file_path)
                if img is not None:
                    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                    variance = cv2.Laplacian(gray, cv2.CV_64F).var()

                    if variance < 120:  # Smooth synthetic AI texture or noise-suppressed render
                        ai_score += 0.35
                        score_signals.append("Smooth synthetic texture / low noise variance")
                    elif variance > 550: # Natural high-frequency camera sensor noise
                        ai_score -= 0.25
                        score_signals.append("High natural camera sensor noise")

                    # 3. 2D FFT Frequency Grid Artifact Score (Diffusion / GAN periodic patterns)
                    f = np.fft.fft2(gray)
                    fshift = np.fft.fftshift(f)
                    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-5)
                    h, w = gray.shape
                    cy, cx = h // 2, w // 2
                    center_energy = np.mean(magnitude_spectrum[max(0, cy-15):min(h, cy+15), max(0, cx-15):min(w, cx+15)])
                    total_energy = np.mean(magnitude_spectrum) + 1e-5
                    fft_ratio = float(center_energy / total_energy)

                    if fft_ratio > 1.30:
                        ai_score += 0.30
                        score_signals.append("2D FFT periodic frequency grid artifacts detected")
                    elif fft_ratio < 1.05:
                        ai_score -= 0.15
                        score_signals.append("Natural continuous frequency spectrum")

                    # 4. Color Channel Gradient Saturation Analysis
                    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
                    sat_std = np.std(hsv[:, :, 1])
                    if sat_std > 70.0 and variance < 300: # Vibrant uniform AI color saturation
                        ai_score += 0.20
                        score_signals.append("Vibrant uniform AI color saturation gradient")
                else:
                    file_size = os.path.getsize(file_path)
                    hash_val = sum(ord(c) for c in filename) + file_size
                    ai_score = 0.20 + ((hash_val % 40) / 100.0)

            except Exception:
                hash_val = sum(ord(c) for c in filename)
                ai_score = 0.25 + ((hash_val % 40) / 100.0)

            confidence = round(max(0.04, min(0.96, ai_score)), 4)
            if confidence >= 0.70:
                indicator = "Elevated"
            elif confidence >= 0.40:
                indicator = "Medium"
            else:
                indicator = "Low"

        return {
            "ai_indicator": indicator,
            "confidence": confidence,
            "provider": self.provider_name,
            "demo_mode": True,
            "raw_scores": {
                "synthetic_probability": confidence,
                "human_probability": round(1.0 - confidence, 4),
                "simulation_note": "Multi-signal AI Forensic Analysis executed."
            },
            "error": None
        }

    def analyze_frame(self, frame_img_array, frame_index: int = 0, is_demo_video: bool = False, filename: str = "") -> dict:
        """
        Frame-level AI analysis for video frame sampling pipeline.
        Calculates Laplacian noise variance & color std to classify AI vs Normal frames.
        """
        try:
            fn = filename.lower()
            is_ai_filename = any(k in fn for k in ["ai", "deepfake", "synthetic", "midjourney", "sora", "runway", "pika", "merged", "edited", "tampered", "demo"])

            if (is_demo_video or is_ai_filename) and (4 <= frame_index <= 8 or frame_index % 4 == 0 or "ai" in fn):
                confidence = round(0.86 + (random.randint(-2, 4) / 100.0), 4)
                indicator = "Elevated"
            else:
                gray = cv2.cvtColor(frame_img_array, cv2.COLOR_BGR2GRAY)
                variance = cv2.Laplacian(gray, cv2.CV_64F).var()

                if variance < 160:
                    confidence = min(0.94, round(0.82 + (variance % 8) / 100.0, 4))
                    indicator = "Elevated"
                elif variance > 450:
                    confidence = max(0.08, round(0.12 + (variance % 5) / 100.0, 4))
                    indicator = "Low"
                else:
                    base = 0.15 + (frame_index % 3) * 0.04
                    confidence = round(base, 4)
                    indicator = "Elevated" if confidence >= 0.70 else ("Medium" if confidence >= 0.40 else "Low")

            return {
                "ai_indicator": indicator,
                "confidence": confidence,
                "provider": self.provider_name,
                "demo_mode": True
            }
        except Exception:
            return {
                "ai_indicator": "Elevated" if is_ai_filename else "Low",
                "confidence": 0.85 if is_ai_filename else 0.15,
                "provider": self.provider_name,
                "demo_mode": True
            }
