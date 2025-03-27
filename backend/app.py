from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import ApplicationConfig


app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config.from_object(ApplicationConfig)

db = SQLAlchemy(app)

import routes
import routesResearch

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)