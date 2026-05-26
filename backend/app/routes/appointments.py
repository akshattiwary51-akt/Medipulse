from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models import Appointment, Patient, Doctor
from .. import db

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('', methods=['GET'])
def get_appointments():
    try:
        appointments = Appointment.query.order_by(Appointment.date.desc(), Appointment.time.desc()).all()
        return jsonify([a.to_dict() for a in appointments]), 200
    except Exception as e:
        return jsonify({'message': 'Error retrieving appointments', 'error': str(e)}), 500


@appointments_bp.route('', methods=['POST'])
def book_appointment():
    data = request.get_json() or {}
    
    required = ['patient_id', 'doctor_id', 'date', 'time']
    missing = [f for f in required if f not in data or str(data[f]).strip() == '']
    if missing:
        return jsonify({'message': f'Missing fields: {", ".join(missing)}'}), 400

    patient_id = data['patient_id']
    doctor_id = data['doctor_id']
    date_str = data['date'].strip()
    time_str = data['time'].strip()
    status = data.get('status', 'Scheduled').strip()

    # Validate patient and doctor exist
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'message': f'Patient with ID {patient_id} does not exist'}), 404
        
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'message': f'Doctor with ID {doctor_id} does not exist'}), 404

    try:
        # Parse date and time
        # Support both YYYY-MM-DD and human inputs, but standard HTML5 input returns YYYY-MM-DD
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Support HH:MM:SS or HH:MM
        try:
            appointment_time = datetime.strptime(time_str, '%H:%M:%S').time()
        except ValueError:
            appointment_time = datetime.strptime(time_str, '%H:%M').time()

        new_appointment = Appointment(
            patient_id=int(patient_id),
            doctor_id=int(doctor_id),
            date=appointment_date,
            time=appointment_time,
            status=status
        )
        db.session.add(new_appointment)
        db.session.commit()
        return jsonify({
            'message': 'Appointment booked successfully',
            'appointment': new_appointment.to_dict()
        }), 201
    except ValueError as ve:
        return jsonify({'message': 'Invalid date or time format. Use YYYY-MM-DD and HH:MM', 'error': str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error booking appointment', 'error': str(e)}), 500


@appointments_bp.route('/<int:id>', methods=['DELETE'])
def delete_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    try:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({'message': 'Appointment cancelled/deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting appointment', 'error': str(e)}), 500
