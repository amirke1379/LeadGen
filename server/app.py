from flask import Flask, jsonify
from flask_cors import CORS
from database import init_db
from config import FLASK_PORT
from routes.leads_routes import leads_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(leads_bp)


@app.route('/')
def health_check():
    return jsonify({"status": "ok"})


init_db()

if __name__ == '__main__':
    app.run(port=FLASK_PORT, debug=True)
