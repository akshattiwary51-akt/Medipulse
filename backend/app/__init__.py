from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from .config import Config

# Initialize extensions
cors = CORS()
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions with app
    # Allow CORS for API routes and health check so frontend health-checks don't get blocked
    cors.init_app(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})
    db.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.patients import patients_bp
    from .routes.doctors import doctors_bp
    from .routes.appointments import appointments_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(patients_bp, url_prefix="/api/patients")
    app.register_blueprint(doctors_bp, url_prefix="/api/doctors")
    app.register_blueprint(appointments_bp, url_prefix="/api/appointments")

    @app.route('/')
    def health_check():
        return {"status": "ok"}

    return app
