from flask import Blueprint, request, jsonify
from ..models import Patient
from .. import db

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('', methods=['GET'])
def get_patients():
    try:
        patients = Patient.query.order_by(Patient.id.desc()).all()
        return jsonify([p.to_dict() for p in patients]), 200
    except Exception as e:
        return jsonify({'message': 'Error retrieving patients', 'error': str(e)}), 500


@patients_bp.route('/<int:id>', methods=['GET'])
def get_patient(id):
    patient = Patient.query.get_or_404(id)
    return jsonify(patient.to_dict()), 200


@patients_bp.route('', methods=['POST'])
def add_patient():
    data = request.get_json() or {}
    
    # Required field validation
    required = ['name', 'age', 'gender', 'blood_group', 'phone', 'address']
    missing = [f for f in required if f not in data or str(data[f]).strip() == '']
    if missing:
        return jsonify({'message': f'Missing fields: {", ".join(missing)}'}), 400

    try:
        new_patient = Patient(
            name=data['name'].strip(),
            age=int(data['age']),
            gender=data['gender'].strip(),
            blood_group=data['blood_group'].strip(),
            phone=data['phone'].strip(),
            address=data['address'].strip()
        )
        db.session.add(new_patient)
        db.session.commit()
        return jsonify({
            'message': 'Patient added successfully',
            'patient': new_patient.to_dict()
        }), 201
    except ValueError:
        return jsonify({'message': 'Age must be a valid integer'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating patient', 'error': str(e)}), 500


@patients_bp.route('/<int:id>', methods=['PUT'])
def edit_patient(id):
    patient = Patient.query.get_or_404(id)
    data = request.get_json() or {}

    try:
        if 'name' in data and data['name'].strip():
            patient.name = data['name'].strip()
        if 'age' in data:
            patient.age = int(data['age'])
        if 'gender' in data and data['gender'].strip():
            patient.gender = data['gender'].strip()
        if 'blood_group' in data and data['blood_group'].strip():
            patient.blood_group = data['blood_group'].strip()
        if 'phone' in data and data['phone'].strip():
            patient.phone = data['phone'].strip()
        if 'address' in data and data['address'].strip():
            patient.address = data['address'].strip()
            
        db.session.commit()
        return jsonify({
            'message': 'Patient updated successfully',
            'patient': patient.to_dict()
        }), 200
    except ValueError:
        return jsonify({'message': 'Age must be a valid integer'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating patient', 'error': str(e)}), 500


@patients_bp.route('/<int:id>', methods=['DELETE'])
def delete_patient(id):
    patient = Patient.query.get_or_404(id)
    try:
        db.session.delete(patient)
        db.session.commit()
        return jsonify({'message': 'Patient deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting patient', 'error': str(e)}), 500
