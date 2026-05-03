from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat()
        }


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('user.id'),
        nullable=False,
        index=True
    )

    description = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), nullable=False, default='Other')
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship(
        'User',
        backref=db.backref('transactions', lazy=True)
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'description': self.description,
            'category': self.category,
            'amount': self.amount,
            'date': self.date,
            'created_at': self.created_at.isoformat()
        }