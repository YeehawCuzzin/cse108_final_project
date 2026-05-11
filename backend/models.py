from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    profile_svg = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'profile_svg': self.profile_svg,
            'created_at': self.created_at.isoformat()
        }


class UserContext(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('user.id'),
        unique=True,
        nullable=False,
        index=True
    )
    context = db.Column(db.Text, nullable=False, default='')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship(
        'User',
        backref=db.backref('document_context', uselist=False)
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'context': self.context,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
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
