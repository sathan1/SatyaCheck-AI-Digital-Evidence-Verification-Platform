import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance
from config import Config

class ImageService:
    @staticmethod
    def calculate_ela(file_path: str, quality: int = 90) -> tuple[float, np.ndarray]:
        """
        Error Level Analysis (ELA).
        Re-saves image at quality=90, computes pixel difference with original.
        Returns (ela_score, ela_diff_image_bgr)
        """
        temp_ela_path = file_path + ".ela_tmp.jpg"
        try:
            with Image.open(file_path) as img:
                img = img.convert('RGB')
                img.save(temp_ela_path, 'JPEG', quality=quality)
            
            orig = cv2.imread(file_path)
            resaved = cv2.imread(temp_ela_path)
            
            if os.path.exists(temp_ela_path):
                os.remove(temp_ela_path)
                
            if orig is None or resaved is None:
                return 0.0, np.zeros((100, 100, 3), dtype=np.uint8)

            if orig.shape != resaved.shape:
                resaved = cv2.resize(resaved, (orig.shape[1], orig.shape[0]))

            diff = cv2.absdiff(orig, resaved)
            # Scale diff for visibility
            diff_scaled = cv2.multiply(diff, 10)
            ela_score = round(float(np.mean(diff)), 4)
            return ela_score, diff_scaled
        except Exception:
            if os.path.exists(temp_ela_path):
                os.remove(temp_ela_path)
            return 0.0, np.zeros((100, 100, 3), dtype=np.uint8)

    @staticmethod
    def calculate_noise_variance(img_bgr: np.ndarray) -> float:
        """
        Calculate noise variance of high-frequency components.
        """
        try:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            noise = cv2.absdiff(gray, blur)
            return round(float(np.var(noise)), 4)
        except Exception:
            return 0.0

    @staticmethod
    def calculate_fft_score(img_bgr: np.ndarray) -> float:
        """
        Frequency spectrum analysis for periodic artifacts.
        """
        try:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            f = np.fft.fft2(gray)
            fshift = np.fft.fftshift(f)
            magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-5)
            h, w = gray.shape
            cy, cx = h // 2, w // 2
            # High frequency ratio
            high_freq = np.mean(magnitude_spectrum[cy-20:cy+20, cx-20:cx+20])
            total_freq = np.mean(magnitude_spectrum)
            ratio = float(high_freq / (total_freq + 1e-5))
            return round(ratio, 4)
        except Exception:
            return 0.0

    @staticmethod
    def generate_suspicious_heatmap(file_path: str, evidence_id: str, ai_confidence: float) -> tuple[str, bool]:
        """
        Generates a heatmap image with red/yellow/green regions.
        Saves heatmap image to uploads directory and returns (heatmap_rel_url, has_heatmap)
        """
        try:
            img = cv2.imread(file_path)
            if img is None:
                return "", False

            h, w, _ = img.shape
            
            # Create a 2D density map based on ELA and high-gradient features
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            magnitude = cv2.magnitude(grad_x, grad_y)

            # ELA component
            ela_score, ela_diff = ImageService.calculate_ela(file_path)
            ela_gray = cv2.cvtColor(ela_diff, cv2.COLOR_BGR2GRAY)

            # Combine signals
            combined = cv2.addWeighted(magnitude, 0.5, ela_gray.astype(np.float64), 0.5, 0)
            combined_blur = cv2.GaussianBlur(combined, (31, 31), 0)

            # Normalize to 0-255
            norm_map = cv2.normalize(combined_blur, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
            
            # Apply COLORMAP_JET (Blue->Green->Yellow->Red)
            color_heatmap = cv2.applyColorMap(norm_map, cv2.COLORMAP_JET)

            # Blend with original image
            overlay = cv2.addWeighted(img, 0.6, color_heatmap, 0.4, 0)

            heatmap_filename = f"heatmap_{evidence_id}.jpg"
            heatmap_full_path = os.path.join(Config.UPLOAD_FOLDER, heatmap_filename)
            cv2.imwrite(heatmap_full_path, overlay)

            return f"/uploads/{heatmap_filename}", True
        except Exception as e:
            return "", False

    @staticmethod
    def run_resilience_check(file_path: str, ai_provider) -> dict:
        """
        Tests prediction stability across compression levels (Original, JPEG 95, 75, 50, Resize 80%).
        """
        resilience_results = []
        
        # 1. Original
        orig_res = ai_provider.analyze_image(file_path)
        orig_conf = orig_res.get("confidence", 0.5)
        resilience_results.append({
            "stage": "Original",
            "confidence": orig_conf,
            "status": orig_res.get("ai_indicator", "Low")
        })

        # 2. Test compressions
        try:
            with Image.open(file_path) as img:
                rgb_img = img.convert('RGB')
                
                for q in [95, 75, 50]:
                    tmp_name = f"{file_path}_q{q}.jpg"
                    rgb_img.save(tmp_name, 'JPEG', quality=q)
                    res = ai_provider.analyze_image(tmp_name)
                    resilience_results.append({
                        "stage": f"JPEG {q}",
                        "confidence": res.get("confidence", orig_conf),
                        "status": res.get("ai_indicator", "Low")
                    })
                    if os.path.exists(tmp_name):
                        os.remove(tmp_name)

                # Resize test
                w, h = rgb_img.size
                resized = rgb_img.resize((int(w * 0.8), int(h * 0.8)), Image.Resampling.LANCZOS)
                tmp_resize = f"{file_path}_resize.jpg"
                resized.save(tmp_resize, 'JPEG', quality=90)
                res_resize = ai_provider.analyze_image(tmp_resize)
                resilience_results.append({
                    "stage": "Resize 80%",
                    "confidence": res_resize.get("confidence", orig_conf),
                    "status": res_resize.get("ai_indicator", "Low")
                })
                if os.path.exists(tmp_resize):
                    os.remove(tmp_resize)
        except Exception:
            pass

        # Compute max shift
        confidences = [r["confidence"] for r in resilience_results]
        max_diff = max(confidences) - min(confidences) if confidences else 0.0

        if max_diff < 0.15:
            stability = "HIGH"
            advisory = "The model prediction remained highly stable after post-processing."
        elif max_diff < 0.30:
            stability = "MEDIUM"
            advisory = "The model prediction showed moderate shift across re-compression levels."
        else:
            stability = "LOW"
            advisory = "The model prediction changed substantially after post-processing. Treat the AI assessment cautiously."

        return {
            "stability": stability,
            "max_confidence_delta": round(max_diff, 4),
            "advisory": advisory,
            "breakdown": resilience_results
        }
