from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Transaction

transactions_bp = Blueprint('transactions', __name__)


@transactions_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())

    transactions = (
        Transaction.query
        .filter_by(user_id=user_id)
        .order_by(Transaction.created_at.desc())
        .all()
    )

    return jsonify({
        'transactions': [transaction.to_dict() for transaction in transactions]
    }), 200


@transactions_bp.route('', methods=['POST'])
@jwt_required()
def add_transaction():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    description = data.get('description', '').strip()
    category = data.get('category', 'Other').strip() or 'Other'
    date = data.get('date', '').strip()
    amount = data.get('amount')

    if not description:
        return jsonify({'error': 'Description is required'}), 400

    if not date:
        return jsonify({'error': 'Date is required'}), 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({'error': 'Amount must be a number'}), 400

    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400

    transaction = Transaction(
        user_id=user_id,
        description=description,
        category=category,
        amount=amount,
        date=date
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        'message': 'Transaction created',
        'transaction': transaction.to_dict()
    }), 201


@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = int(get_jwt_identity())

    transaction = Transaction.query.filter_by(
        id=transaction_id,
        user_id=user_id
    ).first()

    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404

    db.session.delete(transaction)
    db.session.commit()

    return jsonify({'message': 'Transaction deleted'}), 200