import requests
import os
from .base_provider import BaseAIProvider
from config import Config

class HuggingFaceProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or Config.HF_API_KEY
        self.model = model or Config.HF_MODEL
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def analyze_image(self, file_path: str) -> dict:
        if not self.is_configured():
            return {
                "ai_indicator": "Low",
                "confidence": 0.0,
                "provider": "HuggingFaceProvider (Not Configured)",
                "demo_mode": False,
                "raw_scores": {},
                "error": "HF_API_KEY is not set in environment."
            }

        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            with open(file_path, "rb") as f:
                data = f.read()

            response = requests.post(self.api_url, headers=headers, data=data, timeout=12)
            if response.status_code == 200:
                results = response.json()
                # Typical format: [{"label": "artificial", "score": 0.87}, {"label": "human", "score": 0.13}]
                ai_score = 0.0
                if isinstance(results, list):
                    for item in results:
                        label = item.get("label", "").lower()
                        score = item.get("score", 0.0)
                        if any(k in label for k in ["artificial", "ai", "synthetic", "fake", "generated"]):
                            ai_score = max(ai_score, score)

                indicator = "Low"
                if ai_score >= 0.70:
                    indicator = "Elevated"
                elif ai_score >= 0.40:
                    indicator = "Medium"

                return {
                    "ai_indicator": indicator,
                    "confidence": round(ai_score, 4),
                    "provider": f"Hugging Face ({self.model})",
                    "demo_mode": False,
                    "raw_scores": results,
                    "error": None
                }
            else:
                return {
                    "ai_indicator": "Low",
                    "confidence": 0.0,
                    "provider": "Hugging Face",
                    "demo_mode": False,
                    "raw_scores": {},
                    "error": f"HF API returned status {response.status_code}: {response.text[:100]}"
                }
        except Exception as e:
            return {
                "ai_indicator": "Low",
                "confidence": 0.0,
                "provider": "Hugging Face",
                "demo_mode": False,
                "raw_scores": {},
                "error": str(e)
            }

    def analyze_frame(self, frame_img_array) -> dict:
        # Frame-by-frame live API calls might rate limit, so return default or fallback
        return {
            "ai_indicator": "Inconclusive",
            "confidence": 0.0,
            "provider": "Hugging Face",
            "demo_mode": False,
            "error": "Batch frame API calls not supported"
        }
