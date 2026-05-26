from flask import Blueprint, request, jsonify
from ..models import Doctor
from .. import db

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('', methods=['GET'])
def get_doctors():
    try:
        doctors = Doctor.query.order_by(Doctor.id.desc()).all()
        return jsonify([d.to_dict() for d in doctors]), 200
    except Exception as e:
        return jsonify({'message': 'Error retrieving doctors', 'error': str(e)}), 500


@doctors_bp.route('/<int:id>', methods=['GET'])
def get_doctor(id):
    doctor = Doctor.query.get_or_404(id)
    return jsonify(doctor.to_dict()), 200


@doctors_bp.route('', methods=['POST'])
def add_doctor():
    data = request.get_json() or {}
    
    # Required field validation
    required = ['name', 'specialization', 'department', 'phone']
    missing = [f for f in required if f not in data or str(data[f]).strip() == '']
    if missing:
        return jsonify({'message': f'Missing fields: {", ".join(missing)}'}), 400

    try:
        new_doctor = Doctor(
            name=data['name'].strip(),
            specialization=data['specialization'].strip(),
            department=data['department'].strip(),
            phone=data['phone'].strip()
        )
        db.session.add(new_doctor)
        db.session.commit()
        return jsonify({
            'message': 'Doctor added successfully',
            'doctor': new_doctor.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating doctor', 'error': str(e)}), 500


@doctors_bp.route('/<int:id>', methods=['PUT'])
def edit_doctor(id):
    doctor = Doctor.query.get_or_404(id)
    data = request.get_json() or {}

    try:
        if 'name' in data and data['name'].strip():
            doctor.name = data['name'].strip()
        if 'specialization' in data and data['specialization'].strip():
            doctor.specialization = data['specialization'].strip()
        if 'department' in data and data['department'].strip():
            doctor.department = data['department'].strip()
        if 'phone' in data and data['phone'].strip():
            doctor.phone = data['phone'].strip()
            
        db.session.commit()
        return jsonify({
            'message': 'Doctor updated successfully',
            'doctor': doctor.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating doctor', 'error': str(e)}), 500


@doctors_bp.route('/<int:id>', methods=['DELETE'])
def delete_doctor(id):
    doctor = Doctor.query.get_or_404(id)
    try:
        db.session.delete(doctor)
        db.session.commit()
        return jsonify({'message': 'Doctor deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting doctor', 'error': str(e)}), 500
