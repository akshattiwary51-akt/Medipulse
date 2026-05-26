# Root-level entry point for the Flask REST API
from app import create_app, db
from app.models import Admin, Patient, Doctor, Appointment

app = create_app()

if __name__ == '__main__':
    # Enable debugging and host on 0.0.0.0 for localhost access on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
