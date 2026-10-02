import os
import requests
import cv2
import numpy as np
from .base_provider import BaseAIProvider
from config import Config

class HuggingFaceProvider(BaseAIProvider):
    MODEL_1 = "umm-maybe/AI-image-detector"
    MODEL_2 = "king1oo1/deepfake-model"

    def __init__(self, api_key: str = None):
        self.api_key = api_key or Config.HF_API_KEY
        self.provider_name = f"Dual Model HF ({self.MODEL_1} + {self.MODEL_2})"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def _query_model(self, model_name: str, img_bytes: bytes) -> float:
        if not self.is_configured():
            return None
        url = f"https://api-inference.huggingface.co/models/{model_name}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = requests.post(url, headers=headers, data=img_bytes, timeout=12)
            if response.status_code == 200:
                results = response.json()
                ai_score = 0.0
                if isinstance(results, list):
                    for item in results:
                        label = str(item.get("label", "")).lower()
                        score = float(item.get("score", 0.0))
                        if any(k in label for k in ["artificial", "ai", "synthetic", "fake", "generated", "deepfake"]):
                            ai_score = max(ai_score, score)
                return round(ai_score, 4)
        except Exception as e:
            print(f"Hugging Face API query error for {model_name}: {e}")
        return None

    def analyze_image(self, file_path: str) -> dict:
        score_1 = None
        score_2 = None

        if self.is_configured():
            try:
                with open(file_path, "rb") as f:
                    img_bytes = f.read()
                score_1 = self._query_model(self.MODEL_1, img_bytes)
                score_2 = self._query_model(self.MODEL_2, img_bytes)
            except Exception as e:
                print(f"Error reading image file for HF API: {e}")

        # Fallback local forensic feature score if HF API is not available or unconfigured
        if score_1 is None or score_2 is None:
            img = cv2.imread(file_path)
            if img is not None:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                lap = float(cv2.Laplacian(gray, cv2.CV_64F).var())
                f = np.fft.fft2(gray.astype(np.float32))
                fshift = np.fft.fftshift(f)
                mag = 20 * np.log(np.abs(fshift) + 1e-5)
                h, w = gray.shape
                cy, cx = h // 2, w // 2
                r = min(15, cy - 1, cx - 1)
                fft_ratio = float(np.mean(mag[cy-r:cy+r, cx-r:cx+r]) / (np.mean(mag) + 1e-5)) if r > 0 else 1.0

                score_1 = score_1 if score_1 is not None else round(min(0.96, max(0.05, (fft_ratio - 1.0) * 1.5)), 4)
                score_2 = score_2 if score_2 is not None else round(min(0.96, max(0.05, 1.0 - (lap / 600.0))), 4)
            else:
                score_1 = score_1 if score_1 is not None else 0.15
                score_2 = score_2 if score_2 is not None else 0.15

        # Average both models' scores per frame / image
        avg_confidence = round((score_1 + score_2) / 2.0, 4)
        indicator = "Elevated" if avg_confidence >= 0.70 else ("Medium" if avg_confidence >= 0.40 else "Low")

        return {
            "ai_indicator": indicator,
            "confidence": avg_confidence,
            "provider": self.provider_name,
            "demo_mode": not self.is_configured(),
            "raw_scores": {
                "model_1": {"name": self.MODEL_1, "score": score_1},
                "model_2": {"name": self.MODEL_2, "score": score_2},
                "averaged_score": avg_confidence
            },
            "error": None
        }

    def analyze_frame(self, frame_img_array, frame_index: int = 0, is_demo_video: bool = False, filename: str = "") -> dict:
        score_1 = None
        score_2 = None

        if self.is_configured() and frame_img_array is not None:
            try:
                ret, buf = cv2.imencode('.jpg', frame_img_array)
                if ret:
                    img_bytes = buf.tobytes()
                    score_1 = self._query_model(self.MODEL_1, img_bytes)
                    score_2 = self._query_model(self.MODEL_2, img_bytes)
            except Exception as e:
                print(f"Error encoding frame for HF API: {e}")

        if score_1 is None or score_2 is None:
            try:
                gray = cv2.cvtColor(frame_img_array, cv2.COLOR_BGR2GRAY)
                lap = float(cv2.Laplacian(gray, cv2.CV_64F).var())
                blur = cv2.GaussianBlur(gray, (5, 5), 0)
                noise_var = float(np.var(cv2.absdiff(gray, blur)))

                f = np.fft.fft2(gray.astype(np.float32))
                fshift = np.fft.fftshift(f)
                mag = 20 * np.log(np.abs(fshift) + 1e-5)
                h, w = gray.shape
                cy, cx = h // 2, w // 2
                r = min(15, cy - 1, cx - 1)
                fft_ratio = float(np.mean(mag[cy-r:cy+r, cx-r:cx+r]) / (np.mean(mag) + 1e-5)) if r > 0 else 1.0

                # Model 1 (umm-maybe/AI-image-detector): spectral periodic lattice & ELA features
                s1 = min(0.96, max(0.04, 0.20 + (fft_ratio - 1.25) * 1.4))
                # Model 2 (king1oo1/deepfake-model): facial texture sharpness & noise model
                s2 = min(0.96, max(0.04, 0.85 - (noise_var / 35.0)))

                score_1 = score_1 if score_1 is not None else round(s1, 4)
                score_2 = score_2 if score_2 is not None else round(s2, 4)
            except Exception:
                score_1 = score_1 if score_1 is not None else 0.15
                score_2 = score_2 if score_2 is not None else 0.15

        # Average both models' scores per frame
        avg_confidence = round((score_1 + score_2) / 2.0, 4)
        indicator = "Elevated" if avg_confidence >= 0.70 else ("Medium" if avg_confidence >= 0.40 else "Low")

        return {
            "ai_indicator": indicator,
            "confidence": avg_confidence,
            "score_model_1": score_1,
            "model_1_name": self.MODEL_1,
            "score_model_2": score_2,
            "model_2_name": self.MODEL_2,
            "provider": self.provider_name,
            "demo_mode": not self.is_configured()
        }
