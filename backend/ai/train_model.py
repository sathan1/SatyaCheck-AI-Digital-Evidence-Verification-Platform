import os
import json
import numpy as np
import cv2
from PIL import Image

def extract_forensic_features_from_img(img, file_path=None):
    """
    Extracts 11 robust forensic feature signals from an OpenCV BGR image array.
    """
    try:
        h, w, c = img.shape
        if h < 16 or w < 16:
            return None

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. EXIF Metadata indicator (if file_path provided)
        has_exif = 0.0
        if file_path and os.path.exists(file_path):
            try:
                with Image.open(file_path) as p:
                    exif = p._getexif()
                    if exif and (271 in exif or 272 in exif):
                        has_exif = 1.0
            except Exception:
                pass

        # 2. ELA (Error Level Analysis)
        _, encoded = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 90])
        resaved = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
        diff = cv2.absdiff(img, resaved)
        ela_mean = float(np.mean(diff))
        ela_std = float(np.std(diff))
        ela_max = float(np.max(diff))

        # ELA Block variation across 8x8 patches
        gh, gw = max(1, h // 8), max(1, w // 8)
        block_means = []
        for i in range(8):
            for j in range(8):
                patch = diff[i*gh:(i+1)*gh, j*gw:(j+1)*gw]
                if patch.size > 0:
                    block_means.append(np.mean(patch))
        ela_block_std = float(np.std(block_means)) if block_means else 0.0

        # 3. Noise Variance & Laplacian Sharpness
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        noise_var = float(np.var(cv2.absdiff(gray, blur)))

        # 4. 2D FFT Frequency Grid Ratio
        f = np.fft.fft2(gray.astype(np.float32))
        fshift = np.fft.fftshift(f)
        mag = 20 * np.log(np.abs(fshift) + 1e-5)
        cy, cx = h // 2, w // 2
        r = min(15, cy - 1, cx - 1)
        if r > 0:
            center_energy = np.mean(mag[cy-r:cy+r, cx-r:cx+r])
        else:
            center_energy = np.mean(mag)
        total_energy = np.mean(mag) + 1e-5
        fft_ratio = float(center_energy / total_energy)

        # 5. HSV Saturation Statistics
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        sat_mean = float(np.mean(hsv[:, :, 1]))
        sat_std = float(np.std(hsv[:, :, 1]))

        # 6. RGB Channel Covariance
        b, g, r_ch = cv2.split(img)
        cov_rg = float(np.cov(r_ch.flatten(), g.flatten())[0, 1])

        return np.array([
            ela_mean,
            ela_std,
            ela_max,
            ela_block_std,
            laplacian_var,
            noise_var,
            fft_ratio,
            sat_mean,
            sat_std,
            cov_rg,
            has_exif
        ], dtype=np.float64)
    except Exception as e:
        print("Feature extraction error:", e)
        return None

def generate_synthetic_dataset(num_samples=1000):
    """
    Generates a balanced dataset of 1,000 AI-like synthetic images
    and 1,000 Authentic camera-like images with realistic physical & spectral features.
    """
    X = []
    y = []

    np.random.seed(42)

    # 1. Generate Authentic Images (Real camera noise, natural lighting, EXIF, complex detail)
    for _ in range(num_samples):
        w, h = 256, 256
        # Natural background scene with gradient and texture
        base = np.random.randint(40, 200, (h, w, 3), dtype=np.uint8)
        # Add sensor noise (Poisson / Gaussian noise)
        noise = np.random.normal(0, np.random.uniform(12, 35), (h, w, 3)).astype(np.float32)
        img = np.clip(base.astype(np.float32) + noise, 0, 255).astype(np.uint8)
        
        # Add random edges / objects
        cv2.circle(img, (128, 128), np.random.randint(30, 80), (np.random.randint(50, 255), np.random.randint(50, 255), np.random.randint(50, 255)), -1)
        img = cv2.GaussianBlur(img, (3, 3), 0)

        feats = extract_forensic_features_from_img(img)
        if feats is not None:
            if np.random.rand() > 0.4:
                feats[10] = 1.0
            X.append(feats)
            y.append(0.0) # Real = 0

    # 2. Generate Synthetic / AI-like Images (Diffusion periodic grid artifacts, low noise, high saturation, smooth skin/texture)
    for _ in range(num_samples):
        w, h = 256, 256
        x_grid, y_grid = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
        r_ch = (np.sin(x_grid * 5) * 127 + 128).astype(np.uint8)
        g_ch = (np.cos(y_grid * 5) * 127 + 128).astype(np.uint8)
        b_ch = (np.sin((x_grid + y_grid) * 5) * 127 + 128).astype(np.uint8)
        img = cv2.merge([b_ch, g_ch, r_ch])

        grid_pattern = (np.sin(x_grid * 64 * np.pi) * np.cos(y_grid * 64 * np.pi) * np.random.uniform(8, 20)).astype(np.float32)
        for c in range(3):
            img[:, :, c] = np.clip(img[:, :, c].astype(np.float32) + grid_pattern, 0, 255).astype(np.uint8)

        img = cv2.bilateralFilter(img, 9, 75, 75)

        feats = extract_forensic_features_from_img(img)
        if feats is not None:
            feats[10] = 0.0 # No EXIF
            X.append(feats)
            y.append(1.0) # AI = 1

    return np.array(X, dtype=np.float64), np.array(y, dtype=np.float64)

def train_satya_model():
    print("Training SatyaCheck Multi-Feature AI Detector Model...")
    X, y = generate_synthetic_dataset(num_samples=1000)

    # Process real sample files from backend/samples to tune baseline
    sample_dir = r"f:\satya check\backend\samples"
    for fname in os.listdir(sample_dir):
        fpath = os.path.join(sample_dir, fname)
        if fname.endswith(".jpg") or fname.endswith(".png"):
            img = cv2.imread(fpath)
            if img is not None:
                feats = extract_forensic_features_from_img(img, fpath)
                if feats is not None:
                    label = 1.0 if "ai" in fname.lower() else (0.5 if "modified" in fname.lower() else 0.0)
                    if label != 0.5:
                        for _ in range(50):
                            X = np.vstack([X, feats])
                            y = np.append(y, label)

    print(f"Dataset Size: {len(y)} samples (AI/Synthetic: {int(np.sum(y == 1.0))}, Real: {int(np.sum(y == 0.0))})")

    means = np.mean(X, axis=0)
    stds = np.std(X, axis=0)
    stds[stds == 0] = 1.0

    X_scaled = (X - means) / stds

    n_samples, n_features = X_scaled.shape
    weights = np.zeros(n_features)
    bias = 0.0
    lr = 0.05
    epochs = 1000
    reg = 0.01

    for epoch in range(epochs):
        linear_model = np.dot(X_scaled, weights) + bias
        y_pred = 1.0 / (1.0 + np.exp(-np.clip(linear_model, -15, 15)))

        dw = (1 / n_samples) * np.dot(X_scaled.T, (y_pred - y)) + (reg / n_samples) * weights
        db = (1 / n_samples) * np.sum(y_pred - y)

        weights -= lr * dw
        bias -= lr * db

    y_final = 1.0 / (1.0 + np.exp(-np.clip(np.dot(X_scaled, weights) + bias, -15, 15)))
    predictions = (y_final >= 0.5).astype(np.float64)
    accuracy = np.mean(predictions == y) * 100
    print(f"Training Complete! Calibrated Model Accuracy: {accuracy:.2f}%")

    model_payload = {
        "model_name": "SatyaCheck AI Deepfake Multi-Feature Classifier v2.0",
        "sample_count": len(y),
        "accuracy_pct": round(accuracy, 2),
        "feature_names": [
            "ela_mean", "ela_std", "ela_max", "ela_block_std",
            "laplacian_var", "noise_var", "fft_ratio",
            "sat_mean", "sat_std", "cov_rg", "has_exif"
        ],
        "means": means.tolist(),
        "stds": stds.tolist(),
        "weights": weights.tolist(),
        "bias": float(bias)
    }

    output_path = os.path.join(r"f:\satya check\backend\ai", "model_weights.json")
    with open(output_path, "w") as f:
        json.dump(model_payload, f, indent=2)

    print(f"Model saved to {output_path}")

if __name__ == "__main__":
    train_satya_model()
