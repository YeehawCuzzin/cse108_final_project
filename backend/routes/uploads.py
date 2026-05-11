import json
import os
import re
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import UserContext, Transaction, db

uploads_bp = Blueprint('uploads', __name__)

VALID_CATEGORIES = {'Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Subscriptions', 'Other'}
GEMINI_MODEL = 'gemini-2.5-flash'


def get_gemini_client():
    api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if not api_key:
        return None, None, 'GEMINI_API_KEY is not set on the backend'

    try:
        from google import genai as google_genai
        from google.genai import types as genai_types
    except ImportError:
        return None, None, 'Google GenAI SDK is not installed on the backend yet'

    return google_genai.Client(api_key=api_key), genai_types, None


def normalize_category(category):
    for valid_category in VALID_CATEGORIES:
        if (category or '').strip().lower() == valid_category.lower():
            return valid_category
    return 'Other'


def extract_json(text):
    cleaned = (text or '').strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', cleaned)
    if match:
        return match.group(1).strip()
    return cleaned


def context_summary(row):
    raw_context = (row.context or '').strip() if row else ''
    preview = raw_context[:400]

    return {
        'has_context': bool(raw_context),
        'preview': preview,
        'updated_at': row.updated_at.isoformat() if row and row.updated_at else None,
        'total_characters': len(raw_context),
    }


def integration_status(row, user_id):
    return {
        'backend_status': 'ok',
        'anthropic_configured': bool(os.environ.get('ANTHROPIC_API_KEY', '').strip()),
        'gemini_configured': bool(os.environ.get('GEMINI_API_KEY', '').strip()),
        'has_context': bool((row.context or '').strip()) if row else False,
        'transaction_count': Transaction.query.filter_by(user_id=user_id).count(),
    }


@uploads_bp.route('/status', methods=['GET'])
@jwt_required()
def get_upload_status():
    user_id = int(get_jwt_identity())
    row = UserContext.query.filter_by(user_id=user_id).first()
    return jsonify(integration_status(row, user_id)), 200


@uploads_bp.route('/context', methods=['GET'])
@jwt_required()
def get_context():
    user_id = int(get_jwt_identity())
    row = UserContext.query.filter_by(user_id=user_id).first()
    return jsonify(context_summary(row)), 200


@uploads_bp.route('/context', methods=['POST'])
@jwt_required()
def upload_context():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file or not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    client, genai_types, error = get_gemini_client()
    if error:
        return jsonify({'error': error}), 503

    filename = file.filename
    lowered = filename.lower()
    if not (lowered.endswith('.pdf') or lowered.endswith('.txt') or lowered.endswith('.md')):
        return jsonify({'error': 'Only PDF, TXT, and MD files are supported for Pluto context'}), 400

    file_bytes = file.read()
    mime_type = 'application/pdf' if lowered.endswith('.pdf') else 'text/plain'

    prompt = (
        'Extract and summarize all financial information from this document that would be useful '
        'context for a personal finance AI assistant. Include balances, income, obligations, '
        'financial goals, account details, and any other relevant financial data.'
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                genai_types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                prompt,
            ],
        )
    except Exception as request_error:
        return jsonify({'error': f'Gemini could not process the document: {request_error}'}), 502

    extracted = (response.text or '').strip()
    if not extracted:
        return jsonify({'error': 'Gemini returned an empty document summary'}), 502

    user_id = int(get_jwt_identity())
    timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
    entry = f'[Document uploaded {timestamp} - {filename}]\n{extracted}'

    row = UserContext.query.filter_by(user_id=user_id).first()
    if row:
        row.context = f'{row.context}\n\n---\n\n{entry}'.strip()
        row.updated_at = datetime.utcnow()
    else:
        row = UserContext(user_id=user_id, context=entry, updated_at=datetime.utcnow())
        db.session.add(row)

    db.session.commit()

    return jsonify({
        'message': 'Document uploaded for Pluto',
        'preview': extracted[:300],
        **context_summary(row),
    }), 200


@uploads_bp.route('/context', methods=['DELETE'])
@jwt_required()
def clear_context():
    user_id = int(get_jwt_identity())
    row = UserContext.query.filter_by(user_id=user_id).first()

    if row:
        db.session.delete(row)
        db.session.commit()

    return jsonify({
        'message': 'Pluto document context cleared',
        'has_context': False,
        'preview': '',
        'updated_at': None,
        'total_characters': 0,
    }), 200


@uploads_bp.route('/transactions', methods=['POST'])
@jwt_required()
def upload_transactions():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file or not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported for transaction import'}), 400

    client, genai_types, error = get_gemini_client()
    if error:
        return jsonify({'error': error}), 503

    pdf_bytes = file.read()
    prompt = (
        'You are a financial data extractor. Parse this bank statement or financial document and '
        'extract all expense or debit transactions. Skip income and credit entries.\n\n'
        'Return only a valid JSON array with objects that include:\n'
        '  "description": string\n'
        '  "amount": number (positive value)\n'
        '  "category": one of Food, Transport, Housing, Entertainment, Health, Shopping, Education, Subscriptions, Other\n'
        '  "date": string in YYYY-MM-DD format\n'
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                genai_types.Part.from_bytes(data=pdf_bytes, mime_type='application/pdf'),
                prompt,
            ],
        )
        parsed = json.loads(extract_json(response.text))
    except json.JSONDecodeError as parse_error:
        return jsonify({'error': f'Could not parse Gemini transaction output: {parse_error}'}), 502
    except Exception as request_error:
        return jsonify({'error': f'Gemini could not process the PDF: {request_error}'}), 502

    if not isinstance(parsed, list):
        return jsonify({'error': 'Gemini did not return a transaction list'}), 502

    user_id = int(get_jwt_identity())
    today = datetime.utcnow().strftime('%Y-%m-%d')
    imported = []

    for raw_transaction in parsed:
        if not isinstance(raw_transaction, dict):
            continue

        try:
            amount = float(raw_transaction.get('amount', 0))
        except (TypeError, ValueError):
            continue

        if amount <= 0:
            continue

        transaction = Transaction(
            user_id=user_id,
            description=str(raw_transaction.get('description', 'Unknown'))[:200],
            category=normalize_category(str(raw_transaction.get('category', 'Other'))),
            date=str(raw_transaction.get('date', today))[:20],
            amount=amount,
        )
        db.session.add(transaction)
        imported.append(transaction)

    db.session.commit()

    return jsonify({
        'message': 'Transactions imported',
        'imported': len(imported),
        'transactions': [transaction.to_dict() for transaction in imported[:10]],
    }), 200
