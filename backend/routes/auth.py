from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
import bcrypt

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user = User(username=username, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'error': 'account_not_found'}), 401

    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid password'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
