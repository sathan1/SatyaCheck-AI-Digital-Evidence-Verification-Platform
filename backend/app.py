import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

from config import Config
from database import init_db

from routes.auth import auth_bp
from routes.evidence import evidence_bp
from routes.analysis import analysis_bp
from routes.tamper import tamper_bp
from routes.reports import reports_bp
from routes.admin import admin_bp
from routes.demo import demo_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend Vite dev server (http://localhost:5173 or 127.0.0.1)
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})

    # Initialize SQLite database and folders
    init_db()

    # Seed samples if not already present
    try:
        from seed_samples import create_sample_files
        create_sample_files()
    except Exception as e:
        print("Sample seeding note:", e)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(evidence_bp, url_prefix='/api/evidence')
    app.register_blueprint(analysis_bp, url_prefix='/api/analyze')
    app.register_blueprint(tamper_bp, url_prefix='/api/reference')
    app.register_blueprint(reports_bp, url_prefix='/api/report')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(demo_bp, url_prefix='/api/demo')

    # Static file serving for uploads and reports
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    @app.route('/samples/<path:filename>')
    def serve_sample(filename):
        return send_from_directory(Config.SAMPLE_FOLDER, filename)

    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        from flask import redirect
        return redirect('http://localhost:5173')

    # Root health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "SatyaCheck Digital Evidence Verification API",
            "version": "1.0.0-hackathon",
            "ai_provider": "Hugging Face" if Config.HF_API_KEY else "DemoProvider (Simulated Mode)"
        }), 200

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting SatyaCheck Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
