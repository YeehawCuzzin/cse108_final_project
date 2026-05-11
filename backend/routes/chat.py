from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import Transaction, User, UserContext

chat_bp = Blueprint('chat', __name__)

CHAT_MODEL = 'claude-sonnet-4-5'
MAX_HISTORY_MESSAGES = 12


def build_financial_profile(transactions):
    if not transactions:
        return 'No transactions logged yet.'

    total_spent = sum(float(transaction.amount or 0) for transaction in transactions)
    category_totals = {}

    for transaction in transactions:
        category_totals[transaction.category] = category_totals.get(transaction.category, 0) + float(transaction.amount or 0)

    category_breakdown = '\n'.join(
        f'  - {category}: ${amount:,.2f}'
        for category, amount in sorted(category_totals.items(), key=lambda item: -item[1])
    )

    recent_transactions = '\n'.join(
        f'  - {transaction.date} | {transaction.description} | {transaction.category} | ${float(transaction.amount or 0):,.2f}'
        for transaction in transactions[:25]
    )

    return (
        f'Total spent (all time): ${total_spent:,.2f}\n'
        f'Number of transactions: {len(transactions)}\n\n'
        f'Spending by category:\n{category_breakdown}\n\n'
        f'Recent transaction list (newest first, capped at 25):\n{recent_transactions}'
    )


def normalize_history(raw_history):
    normalized = []

    for item in raw_history[:MAX_HISTORY_MESSAGES]:
        if not isinstance(item, dict):
            continue

        role = item.get('role')
        content = (item.get('content') or '').strip()

        if role not in {'user', 'assistant'} or not content:
            continue

        normalized.append({
            'role': role,
            'content': content[:2000],
        })

    return normalized


def build_document_context(user_id):
    row = UserContext.query.filter_by(user_id=user_id).first()
    raw_context = (row.context or '').strip() if row else ''

    if not raw_context:
        return 'No uploaded document context is available yet.'

    return raw_context[-12000:]


@chat_bp.route('', methods=['POST'])
@jwt_required()
def chat():
    try:
        from anthropic import Anthropic
    except ImportError:
        return jsonify({'error': 'Anthropic SDK is not installed on the backend yet'}), 503

    api_key = request.environ.get('ANTHROPIC_API_KEY') or None
    if not api_key:
        import os
        api_key = os.environ.get('ANTHROPIC_API_KEY', '').strip()

    if not api_key:
        return jsonify({'error': 'ANTHROPIC_API_KEY is not set on the backend'}), 503

    data = request.get_json(silent=True) or {}
    message = (data.get('message') or '').strip()
    history = normalize_history(data.get('history') or [])

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    transactions = (
        Transaction.query
        .filter_by(user_id=user_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .all()
    )

    financial_profile = build_financial_profile(transactions)
    current_date = datetime.utcnow().strftime('%B %d, %Y')

    document_context = build_document_context(user_id)

    system_prompt = f"""You are Pluto, a friendly and knowledgeable financial assistant inside FlowFund.
You have access to the user's transaction history and any uploaded document context stored in the app.
If the uploaded document context is missing or incomplete, say so honestly.

USER: {user.username}

USER FINANCIAL PROFILE
{financial_profile}

DOCUMENT CONTEXT
{document_context}

TODAY'S DATE
{current_date}

YOUR JOB
- Answer the user's personal-finance questions using only the data provided above and the current conversation.
- Be specific and reference actual categories, counts, and dollar amounts from the transactions when possible.
- If the user asks for something that needs missing data, say so clearly.
- End with one actionable next step whenever it makes sense.

TONE
- Encouraging, direct, and non-judgmental.
- Helpful like a thoughtful product copilot, not a bank disclaimer wall.
- Keep answers concise enough to fit naturally in a chat rail.
"""

    messages = [
        *history,
        {'role': 'user', 'content': message},
    ]

    client = Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model=CHAT_MODEL,
            max_tokens=700,
            system=system_prompt,
            messages=messages,
        )
    except Exception as error:
        return jsonify({'error': f'Pluto could not reach Claude: {error}'}), 502

    reply = ''
    for block in response.content:
        text = getattr(block, 'text', '')
        if text:
            reply += text

    if not reply.strip():
        return jsonify({'error': 'Claude returned an empty response'}), 502

    return jsonify({'reply': reply.strip()}), 200
