from abc import ABC, abstractmethod

class BaseAIProvider(ABC):
    @abstractmethod
    def analyze_image(self, file_path: str) -> dict:
        """
        Analyze image file and return:
        {
            "ai_indicator": "Low" | "Elevated" | "High" | "Inconclusive",
            "confidence": float (0.0 to 1.0),
            "provider": str,
            "demo_mode": bool,
            "raw_scores": dict,
            "error": str or None
        }
        """
        pass

    @abstractmethod
    def analyze_frame(self, frame_img_array) -> dict:
        """
        Analyze a single video frame array (OpenCV / numpy array)
        """
        pass
