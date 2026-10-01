# SatyaCheck – AI Digital Evidence Verification Platform 🛡️

**SatyaCheck** is an AI-powered digital evidence verification platform designed to detect AI-generated, tampered, and suspicious images, videos, and documents using advanced forensic analysis, metadata inspection, cryptographic hashing, and chain-of-custody evidence integrity checks.

---

## 🌟 Key Features

1. **AI Generation & Deepfake Detection**
   - Detects synthetic and AI-generated imagery and altered frames.
   - Confidence scoring and heuristic anomaly detection.

2. **Forensic Image & Document Analysis**
   - **Error Level Analysis (ELA)** to uncover altered or spliced image regions.
   - EXIF and document metadata verification for tampering signatures.
   - QR code data consistency and cryptographic signature validation.

3. **Cryptographic Integrity & Tamper Checking**
   - Instant SHA-256 digital fingerprinting.
   - Reference baseline comparison for official certificate/document verification.
   - Immutable audit logs.

4. **Automated Forensic Reports**
   - Downloadable court-ready PDF verification reports with embedded forensic heatmaps and analysis metrics.

---

## 🏗️ Project Architecture

```
satya-check/
├── backend/                   # Python Flask Forensic API
│   ├── app.py                 # Application entry point
│   ├── config.py              # Environment and path settings
│   ├── database.py            # SQLite database initialization
│   ├── requirements.txt       # Python dependencies (OpenCV, PyMuPDF, ReportLab, etc.)
│   ├── ai/                    # AI analysis & detection logic
│   ├── routes/                # Modular API endpoints (auth, evidence, reports, admin)
│   └── services/              # Forensic processing services (ELA, metadata, hashing)
│
├── frontend/                  # React (Vite) + Tailwind CSS Dashboard
│   ├── src/                   # React components, pages, and services
│   ├── package.json           # Frontend dependencies (React 19, Lucide, Axios, etc.)
│   ├── vite.config.js         # Vite configuration & dev proxy
│   └── vercel.json            # Vercel deployment rewrites
│
├── .gitignore                 # Excludes node_modules, temp databases, and caches
└── README.md                  # Project documentation
```

---

## 🚀 Local Development Setup (For Team Members)

Follow these steps when you clone this repository to run it on your local machine:

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Git**

### 2. Backend Setup
In a new terminal:
```bash
# Navigate to backend
cd backend

# Create Python virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows CMD:
venv\Scripts\activate
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python app.py
```
> The backend server will run on `http://127.0.0.1:5000`.

### 3. Frontend Setup
In a second terminal:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> The frontend application will run on `http://localhost:5173`.

---

## 👥 Team Git Collaboration Workflow

To ensure smooth collaboration without overwriting each other's work:

1. **Before starting to code every day:**
   ```bash
   git pull origin main
   ```
2. **Work on your feature or create a feature branch:**
   ```bash
   git checkout -b feature/your-name-feature
   ```
3. **Commit and push your work:**
   ```bash
   git add .
   git commit -m "feat: describe changes clearly"
   git push origin main
   # OR if on a branch:
   # git push origin feature/your-name-feature
   ```

---

## 🌐 Cloud Deployment

- **Frontend on Vercel**:
  - Connect your GitHub repository to [Vercel](https://vercel.com).
  - Set **Root Directory** to `frontend`.
  - Set Framework Preset to `Vite`.
  - Add Environment Variable:
    - `VITE_API_BASE_URL` = `https://<your-render-backend-url>.onrender.com/api`

- **Backend on Render**:
  - Create a new **Web Service** on [Render](https://render.com).
  - Connect the GitHub repository.
  - Set **Root Directory** to `backend`.
  - Set Environment to `Python 3`.
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `gunicorn app:app` (or `python app.py`)
