import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'super-secret-key')
    # Defaulting to root with password (or empty password) on localhost for MySQL
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        'mysql+pymysql://root:password@localhost/hospital_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
