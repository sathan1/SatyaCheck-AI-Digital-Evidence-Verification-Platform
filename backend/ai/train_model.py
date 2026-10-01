import os
import glob
import json
import math
import cv2
import numpy as np
from PIL import Image

def extract_forensic_features(file_path):
    """
    Extracts 8 distinct forensic feature signals from an image file.
    """
    try:
        # 1. EXIF Check
        has_exif = 0.0
        try:
            with Image.open(file_path) as pil_img:
                exif = pil_img._getexif()
                if exif and (271 in exif or 272 in exif):
                    has_exif = 1.0
        except Exception:
            pass

        # Read image using OpenCV
        img = cv2.imread(file_path)
        if img is None:
            return None

        h, w, c = img.shape
        if h < 10 or w < 10:
            return None

        # 2. Laplacian Noise Variance
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # 3. ELA (Error Level Analysis)
        # Resave as temp JPEG with quality=90 and compare diff
        _, encoded = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 90])
        resaved = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
        diff = cv2.absdiff(img, resaved)
        ela_mean = float(np.mean(diff))
        ela_max = float(np.max(diff))

        # 4. 2D FFT Energy Ratio
        f = np.fft.fft2(gray.astype(np.float32))
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-5)
        cy, cx = h // 2, w // 2
        r = min(15, cy - 1, cx - 1)
        if r > 0:
            center_energy = np.mean(magnitude_spectrum[cy-r:cy+r, cx-r:cx+r])
        else:
            center_energy = np.mean(magnitude_spectrum)
        total_energy = np.mean(magnitude_spectrum) + 1e-5
        fft_ratio = float(center_energy / total_energy)

        # 5. Color Saturation Standard Deviation & Hue Entropy
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        sat_std = float(np.std(hsv[:, :, 1]))
        
        hist, _ = np.histogram(hsv[:, :, 0], bins=18, range=(0, 180), density=True)
        hist = hist[hist > 0]
        hue_entropy = float(-np.sum(hist * np.log2(hist))) if len(hist) > 0 else 0.0

        # 6. Blue-Red Channel Ratio Variance
        b, g, r_ch = cv2.split(img)
        br_ratio = float(np.std(b.astype(float) - r_ch.astype(float)))

        return [
            ela_mean,
            ela_max,
            laplacian_var,
            fft_ratio,
            sat_std,
            hue_entropy,
            br_ratio,
            has_exif
        ]
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def train_satya_model():
    print("Starting SatyaCheck AI Model Training on FAKE Dataset...")

    fake_dir = r"C:\Users\Kavinaya\Downloads\archive\test\FAKE"
    sample_dir = r"f:\satya check\backend\samples"

    fake_files = glob.glob(os.path.join(fake_dir, "*.jpg")) + glob.glob(os.path.join(fake_dir, "*.png"))
    authentic_files = glob.glob(os.path.join(sample_dir, "*.jpg")) + glob.glob(os.path.join(sample_dir, "*.png"))

    print(f"Found {len(fake_files)} FAKE training images in dataset.")
    print(f"Found {len(authentic_files)} AUTHENTIC sample images.")

    # Limit to 500 images for super fast training
    training_fake = fake_files[:500]
    training_auth = authentic_files

    X = []
    y = []

    print("Extracting features from FAKE dataset...")
    for f in training_fake:
        feats = extract_forensic_features(f)
        if feats is not None:
            X.append(feats)
            y.append(1.0) # FAKE = 1

    print("Extracting features from AUTHENTIC dataset...")
    for f in training_auth:
        feats = extract_forensic_features(f)
        if feats is not None:
            X.append(feats)
            y.append(0.0) # AUTHENTIC = 0

    X = np.array(X, dtype=np.float64)
    y = np.array(y, dtype=np.float64)

    print(f"Total training samples processed: {len(y)} (FAKE: {int(np.sum(y))}, REAL: {len(y) - int(np.sum(y))})")

    # Compute Feature Normalization (Mean & Std)
    means = np.mean(X, axis=0)
    stds = np.std(X, axis=0)
    stds[stds == 0] = 1.0

    X_scaled = (X - means) / stds

    # Train Logistic Regression Model via Gradient Descent
    n_samples, n_features = X_scaled.shape
    weights = np.zeros(n_features)
    bias = 0.0
    lr = 0.1
    epochs = 300

    for epoch in range(epochs):
        linear_model = np.dot(X_scaled, weights) + bias
        y_pred = 1.0 / (1.0 + np.exp(-np.clip(linear_model, -15, 15)))

        dw = (1 / n_samples) * np.dot(X_scaled.T, (y_pred - y))
        db = (1 / n_samples) * np.sum(y_pred - y)

        weights -= lr * dw
        bias -= lr * db

    # Verify predictions on training data
    y_final = 1.0 / (1.0 + np.exp(-np.clip(np.dot(X_scaled, weights) + bias, -15, 15)))
    accuracy = np.mean((y_final >= 0.5) == y) * 100
    print(f"Training Complete! Model Accuracy: {accuracy:.2f}%")

    model_payload = {
        "model_name": "SatyaCheck Deepfake Logistic Classifier v1.0",
        "dataset_trained_on": fake_dir,
        "sample_count": len(y),
        "accuracy_pct": round(accuracy, 2),
        "feature_names": ["ela_mean", "ela_max", "laplacian_var", "fft_ratio", "sat_std", "hue_entropy", "br_ratio", "has_exif"],
        "means": means.tolist(),
        "stds": stds.tolist(),
        "weights": weights.tolist(),
        "bias": float(bias)
    }

    output_path = os.path.join(r"f:\satya check\backend\ai", "model_weights.json")
    with open(output_path, "w") as f:
        json.dump(model_payload, f, indent=2)

    print(f"Model checkpoint saved successfully to {output_path}")

if __name__ == "__main__":
    train_satya_model()
