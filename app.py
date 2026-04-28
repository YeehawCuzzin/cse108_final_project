from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
import random

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///flowfund.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "flowfund-secret-2025"

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)