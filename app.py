from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
import random
import os
import json
import re
from google import genai as google_genai
from google.genai import types as genai_types
import anthropic

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///flowfund.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "flowfund-secret-2025"
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB upload limit

db = SQLAlchemy(app)

class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(100), nullable=False)
    email    = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created  = db.Column(db.DateTime, default=datetime.utcnow)

class Budget(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name    = db.Column(db.String(100), nullable=False)
    limit   = db.Column(db.Float, nullable=False)
    created = db.Column(db.DateTime, default=datetime.utcnow)

class Transaction(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    category    = db.Column(db.String(100), nullable=False)
    date        = db.Column(db.String(20),  nullable=False)
    amount      = db.Column(db.Float,       nullable=False)
    created     = db.Column(db.DateTime, default=datetime.utcnow)

class UserContext(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    context = db.Column(db.Text, nullable=False, default='')
    updated = db.Column(db.DateTime, default=datetime.utcnow)

# Gemini helper 
VALID_CATEGORIES = {'Food','Transport','Housing','Entertainment','Health','Shopping','Education','Subscriptions','Other'}
GEMINI_MODEL     = 'gemini-2.5-flash'

def get_gemini_client():
    api_key = os.environ.get('GEMINI_API_KEY', '')
    if not api_key:
        return None
    return google_genai.Client(api_key=api_key)

def normalize_category(cat):
    for v in VALID_CATEGORIES:
        if cat.strip().lower() == v.lower():
            return v
    return 'Other'

def extract_json(text):
    """Strip markdown code fences and return the raw JSON string."""
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if match:
        return match.group(1).strip()
    return text

with app.app_context():
    db.create_all()

    # Create test users only if they do not already exist
    test_users = [
        {
            "name": "Roma Test",
            "email": "roma@test.com",
            "password": "password123"
        },
        {
            "name": "Student Demo",
            "email": "student@test.com",
            "password": "password123"
        },
        {
            "name": "FlowFund User",
            "email": "user@test.com",
            "password": "password123"
        }
    ]

    for u in test_users:
        existing_user = User.query.filter_by(email=u["email"]).first()

        if not existing_user:
            user = User(
                name=u["name"],
                email=u["email"],
                password=generate_password_hash(u["password"], method="pbkdf2:sha256")
            )
            db.session.add(user)

    db.session.commit()
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def current_user():
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None

@app.route("/")
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template("index.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name     = request.form["name"].strip()
        email    = request.form["email"].strip().lower()
        password = request.form["password"]
        confirm  = request.form["confirm"]
        if not name or not email or not password:
            return render_template("register.html", error="All fields are required.")
        if password != confirm:
            return render_template("register.html", error="Passwords do not match.")
        if len(password) < 6:
            return render_template("register.html", error="Password must be at least 6 characters.")
        if User.query.filter_by(email=email).first():
            return render_template("register.html", error="An account with that email already exists.")
        user = User(name=name, email=email, password=generate_password_hash(password, method="pbkdf2:sha256"))
        db.session.add(user)
        db.session.commit()
        session['user_id']   = user.id
        session['user_name'] = user.name
        return redirect(url_for('dashboard'))
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email    = request.form["email"].strip().lower()
        password = request.form["password"]
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            return render_template("login.html", error="Invalid email or password.")
        session['user_id']   = user.id
        session['user_name'] = user.name
        return redirect(url_for('dashboard'))
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('home'))

@app.route("/dashboard")
@login_required
def dashboard():
    uid          = session['user_id']
    transactions = Transaction.query.filter_by(user_id=uid).order_by(Transaction.created.desc()).all()
    budgets      = Budget.query.filter_by(user_id=uid).all()
    total_spent  = sum(t.amount for t in transactions)
    cat_totals   = {}
    for t in transactions:
        cat_totals[t.category] = cat_totals.get(t.category, 0) + t.amount
    return render_template("dashboard.html", transactions=transactions, budgets=budgets,
                           total_spent=total_spent, cat_totals=cat_totals, user=current_user())

@app.route("/transactions")
@login_required
def transactions_page():
    uid          = session['user_id']
    transactions = Transaction.query.filter_by(user_id=uid).order_by(Transaction.created.desc()).all()
    budgets      = Budget.query.filter_by(user_id=uid).all()
    categories   = [b.name for b in budgets]
    return render_template("transactions.html", transactions=transactions,
                           categories=categories, user=current_user())

@app.route("/add-transaction", methods=["POST"])
@login_required
def add_transaction():
    t = Transaction(user_id=session['user_id'], description=request.form["description"],
                    category=request.form["category"], date=request.form["date"],
                    amount=float(request.form["amount"]))
    db.session.add(t)
    db.session.commit()
    return redirect(url_for("transactions_page"))

@app.route("/delete-transaction/<int:tid>", methods=["POST"])
@login_required
def delete_transaction(tid):
    t = Transaction.query.filter_by(id=tid, user_id=session['user_id']).first_or_404()
    db.session.delete(t)
    db.session.commit()
    return redirect(url_for("transactions_page"))

@app.route("/budgets")
@login_required
def budgets_page():
    uid          = session['user_id']
    budgets      = Budget.query.filter_by(user_id=uid).all()
    transactions = Transaction.query.filter_by(user_id=uid).all()
    cat_totals   = {}
    for t in transactions:
        cat_totals[t.category] = cat_totals.get(t.category, 0) + t.amount
    return render_template("budgets.html", budgets=budgets, cat_totals=cat_totals, user=current_user())

@app.route("/add-budget", methods=["POST"])
@login_required
def add_budget():
    b = Budget(user_id=session['user_id'], name=request.form["name"], limit=float(request.form["limit"]))
    db.session.add(b)
    db.session.commit()
    return redirect(url_for("budgets_page"))

@app.route("/delete-budget/<int:bid>", methods=["POST"])
@login_required
def delete_budget(bid):
    b = Budget.query.filter_by(id=bid, user_id=session['user_id']).first_or_404()
    db.session.delete(b)
    db.session.commit()
    return redirect(url_for("budgets_page"))

@app.route("/api/me")
@login_required
def api_me():
    user = current_user()
    return jsonify({"id": user.id, "name": user.name, "email": user.email})

@app.route("/api/transactions", methods=["GET"])
@login_required
def api_transactions_get():
    uid = session['user_id']
    txns = Transaction.query.filter_by(user_id=uid).order_by(Transaction.created.desc()).all()
    return jsonify({"transactions": [
        {"id": t.id, "description": t.description, "category": t.category, "date": t.date, "amount": t.amount}
        for t in txns
    ]})

@app.route("/api/transactions", methods=["POST"])
@login_required
def api_transactions_post():
    data = request.get_json()
    t = Transaction(
        user_id=session['user_id'],
        description=data.get("description", ""),
        category=data.get("category", "Other"),
        date=data.get("date", ""),
        amount=float(data.get("amount", 0))
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({"id": t.id}), 201

@app.route("/api/transactions/<int:tid>", methods=["DELETE"])
@login_required
def api_transactions_delete(tid):
    t = Transaction.query.filter_by(id=tid, user_id=session['user_id']).first_or_404()
    db.session.delete(t)
    db.session.commit()
    return jsonify({"ok": True})

@app.route("/api/chat", methods=["POST"])
@login_required
def chat():
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY environment variable is not set"}), 500

    data    = request.get_json()
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "No message provided"}), 400

    uid = session['user_id']

    # Build financial profile from transactions
    transactions = Transaction.query.filter_by(user_id=uid).order_by(Transaction.date.desc()).all()
    if transactions:
        total = sum(t.amount for t in transactions)
        cat_totals = {}
        for t in transactions:
            cat_totals[t.category] = cat_totals.get(t.category, 0) + t.amount
        cat_breakdown = "\n".join(
            f"  - {cat}: ${amt:,.2f}" for cat, amt in sorted(cat_totals.items(), key=lambda x: -x[1])
        )
        tx_lines = "\n".join(
            f"  - {t.date} | {t.description} | {t.category} | ${t.amount:,.2f}"
            for t in transactions
        )
        financial_profile = (
            f"Total spent (all time): ${total:,.2f}\n"
            f"Number of transactions: {len(transactions)}\n\n"
            f"Spending by category:\n{cat_breakdown}\n\n"
            f"Full transaction list (newest first):\n{tx_lines}"
        )
    else:
        financial_profile = "No transactions logged yet."

    # Pull any uploaded document context
    ctx_row   = UserContext.query.filter_by(user_id=uid).first()
    rag_chunks = ctx_row.context if ctx_row and ctx_row.context else "No documents uploaded yet."

    current_date = datetime.utcnow().strftime('%B %d, %Y')

    system_prompt = f"""You are Pluto, a friendly and knowledgeable financial assistant for college students.
You work inside a personal finance app where students upload their financial documents
(bank statements, loan documents, federal aid letters, subscriptions, etc.).

You are NOT a licensed financial advisor. For major financial decisions, always recommend
the user consult their university's financial aid office or a certified financial advisor.

---

## USER FINANCIAL PROFILE
{financial_profile}

## RETRIEVED DOCUMENT CONTEXT
{rag_chunks}

## TODAY'S DATE
{current_date}

---

## YOUR JOB
Answer the user's questions about their personal finances using ONLY the data provided
above. Be specific, always reference actual numbers from their data rather than giving
generic advice. If the answer isn't in the provided context, say so honestly.

## PRIORITIES
- Flag anything time-sensitive first (loan payments due soon, low balance warnings)
- Be specific and cite numbers: "you spent $143 on food delivery in March" not "you spend a lot on food"
- Give one clear, actionable takeaway per response
- Keep responses concise; students skim. Use bullet points for breakdowns.

## TONE
- Non-judgmental and encouraging, never shame spending choices
- Peer-like, not authoritative, you're a knowledgeable friend, not a banker
- If you detect signs of financial hardship (overdrafts, missed payments),
  be empathetic and mention campus resources like the financial aid office

## DO NOT
- Make up numbers or fill gaps with assumptions. say "I don't have that data"
- Give investment advice
- Answer questions unrelated to the user's personal finances
- Repeat the entire financial profile back unprompted

---

## RESPONSE FORMAT
1. Lead with the direct answer or key insight
2. Support it with specific numbers from their data
3. End with one actionable suggestion

For breakdowns, use bullet points with dollar amounts.
For warnings, bold the key figure."""

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": message}],
    )
    reply = response.content[0].text
    return jsonify({"reply": reply})

@app.route("/api/upload/transactions", methods=["POST"])
@login_required
def upload_transactions():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are supported"}), 400

    client = get_gemini_client()
    if not client:
        return jsonify({"error": "GEMINI_API_KEY environment variable is not set"}), 500

    pdf_bytes = file.read()
    prompt = (
        "You are a financial data extractor. Parse this bank statement or financial document "
        "and extract ALL expense/debit transactions (skip income or credit entries).\n\n"
        "Return ONLY a valid JSON array; no markdown, no explanation. Each object must have:\n"
        '  "description": string (merchant or description)\n'
        '  "amount": number (positive value)\n'
        '  "category": one of: Food, Transport, Housing, Entertainment, Health, Shopping, Education, Subscriptions, Other\n'
        '  "date": string in YYYY-MM-DD format\n\n'
        "If a date is unclear use today's date. Example:\n"
        '[{"description":"Netflix","amount":15.99,"category":"Subscriptions","date":"2024-03-01"}]'
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                genai_types.Part.from_bytes(data=pdf_bytes, mime_type='application/pdf'),
                prompt,
            ],
        )
        raw = extract_json(response.text)
        parsed = json.loads(raw)

        uid   = session['user_id']
        today = datetime.utcnow().strftime('%Y-%m-%d')
        added = []
        for tx in parsed:
            amt = float(tx.get('amount', 0))
            if amt <= 0:
                continue
            t = Transaction(
                user_id=uid,
                description=str(tx.get('description', 'Unknown'))[:200],
                category=normalize_category(str(tx.get('category', 'Other'))),
                date=str(tx.get('date', today)),
                amount=amt,
            )
            db.session.add(t)
            added.append({"description": t.description, "amount": t.amount,
                          "category": t.category, "date": t.date})
        db.session.commit()
        return jsonify({"imported": len(added), "transactions": added})

    except json.JSONDecodeError as e:
        return jsonify({"error": f"Could not parse Gemini response as JSON: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/upload/context", methods=["POST"])
@login_required
def upload_context():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']

    client = get_gemini_client()
    if not client:
        return jsonify({"error": "GEMINI_API_KEY environment variable is not set"}), 500

    filename  = file.filename.lower()
    file_bytes = file.read()
    mime = 'application/pdf' if filename.endswith('.pdf') else 'text/plain'

    prompt = (
        "Extract and summarize all financial information from this document that would be "
        "useful context for a personal finance AI assistant. Include balances, income, "
        "financial goals, account details, or any other relevant financial data."
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                genai_types.Part.from_bytes(data=file_bytes, mime_type=mime),
                prompt,
            ],
        )
        extracted = response.text.strip()
        uid = session['user_id']
        timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
        entry = f"[Document uploaded {timestamp} — {file.filename}]\n{extracted}"
        ctx = UserContext.query.filter_by(user_id=uid).first()
        if ctx:
            ctx.context = ctx.context + "\n\n---\n\n" + entry
            ctx.updated = datetime.utcnow()
        else:
            ctx = UserContext(user_id=uid, context=entry)
            db.session.add(ctx)
        db.session.commit()
        return jsonify({"ok": True, "preview": extracted[:300]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)