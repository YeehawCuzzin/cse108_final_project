from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pathlib import Path
from sqlalchemy import inspect, text
from models import db
import os
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

load_dotenv(PROJECT_ROOT / '.env')
load_dotenv(BACKEND_DIR / '.env')

from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.transactions import transactions_bp
from routes.uploads import uploads_bp


def ensure_schema():
    inspector = inspect(db.engine)
    user_columns = {column['name'] for column in inspector.get_columns('user')}

    if 'profile_svg' not in user_columns:
        db.session.execute(text('ALTER TABLE user ADD COLUMN profile_svg TEXT'))
        db.session.commit()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///flowfundai.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-change-in-production')

    CORS(app)
    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')

    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok', 'message': 'FlowFundAI backend is running'}, 200

    with app.app_context():
        db.create_all()
        ensure_schema()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
