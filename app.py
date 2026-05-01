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
    data    = request.get_json()
    message = (data.get("message") or "").lower()
    uid     = session['user_id']
    transactions = Transaction.query.filter_by(user_id=uid).all()
    total        = sum(t.amount for t in transactions)
    cat_totals   = {}
    for t in transactions:
        cat_totals[t.category] = cat_totals.get(t.category, 0) + t.amount
    top_cat = max(cat_totals, key=cat_totals.get) if cat_totals else None
    if "total" in message or "spent" in message:
        reply = f"You've spent ${total:,.2f} across {len(transactions)} transactions."
    elif "top" in message or "biggest" in message:
        reply = f"Your biggest category is {top_cat} at ${cat_totals[top_cat]:,.2f}." if top_cat else "No transactions yet!"
    elif "save" in message or "budget" in message:
        reply = "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings."
    elif "categor" in message:
        breakdown = ", ".join(f"{k}: ${v:,.2f}" for k, v in sorted(cat_totals.items(), key=lambda x: -x[1])) if cat_totals else "none yet"
        reply = f"Spending by category — {breakdown}."
    else:
        reply = random.choice([
            "Set a monthly budget for each category to stay on track.",
            "A $5 daily coffee is $1,825/year — small habits matter!",
            "Review your subscriptions monthly and cut unused ones.",
            "Aim for an emergency fund of 3–6 months of expenses.",
        ])
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
        "Return ONLY a valid JSON array — no markdown, no explanation. Each object must have:\n"
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
        ctx = UserContext.query.filter_by(user_id=uid).first()
        if ctx:
            ctx.context = extracted
            ctx.updated = datetime.utcnow()
        else:
            ctx = UserContext(user_id=uid, context=extracted)
            db.session.add(ctx)
        db.session.commit()
        return jsonify({"ok": True, "preview": extracted[:300]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)