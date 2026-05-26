from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import Admin
from .. import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    admin = Admin.query.filter_by(username=username).first()

    if admin and check_password_hash(admin.password_hash, password):
        return jsonify({
            'message': 'Login successful',
            'user': admin.to_dict()
        }), 200

    return jsonify({'message': 'Invalid username or password'}), 401


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')

    if not username or not password or not name:
        return jsonify({'message': 'Username, password and name are required'}), 400

    existing_admin = Admin.query.filter_by(username=username).first()
    if existing_admin:
        return jsonify({'message': 'Username already exists'}), 400

    hashed_pw = generate_password_hash(password)
    new_admin = Admin(username=username, password_hash=hashed_pw, name=name)
    
    db.session.add(new_admin)
    db.session.commit()

    return jsonify({
        'message': 'Admin registered successfully',
        'user': new_admin.to_dict()
    }), 201
