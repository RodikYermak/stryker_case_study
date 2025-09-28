# from flask import Flask, request, jsonify, make_response, render_template
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS
# from os import environ


# import json
# import PyPDF2
# from openai import OpenAI
# from keys import OPENAI_API_KEY

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes
# app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL')
# db = SQLAlchemy(app)

# client = OpenAI(api_key=OPENAI_API_KEY)

# #Prompt template for extraction
# EXTRACTION_PROMPT = """
# You are a financial assistant that extracts structured data from invoices.

# Extract the following fields from the text:
# - vendor_name
# - invoice_number
# - invoice_date
# - due_date
# - line_items: [{description, quantity, unit_price, total}]
# - subtotal
# - tax
# - total

# Always respond with valid JSON only, no extra text.
# """

# def extract_text_from_pdf(pdf_file):
#   reader = PyPDF2.PdfReader(pdf_file)
#   text = ""
#   for page in reader.pages:
#     text += page.extract_text() + "\n"
#   return text

# @app.route("/", methods=["GET", "POST"])
# def index():
#   extracted_data = None
#   raw_text = None
#   if request.method == "POST":
#     pdf_file = request.files["invoice"]
#     if pdf_file:
#       raw_text = extract_text_from_pdf(pdf_file)

#       # Call GPT-4o-mini to structure the text
#       response = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[
#           {"role": "system", "content": EXTRACTION_PROMPT},
#           {"role": "user", "content": raw_text},
#         ],
#         temperature=0
#       )

#       try:
#         extracted_data = json.loads(response.choices[0].message.content)
#       except Exception as e:
#         extracted_data = {"error": f"Failed to parse JSON: {str(e)}"}

#   return render_template("index.html", data=extracted_data, text=raw_text)



# class User(db.Model):
#   __tablename__ = 'users'
#   id = db.Column(db.Integer, primary_key=True)
#   name = db.Column(db.String(80), unique=True, nullable=False)
#   email = db.Column(db.String(120), unique=True, nullable=False)

#   def json(self):
#     return {'id': self.id,'name': self.name, 'email': self.email}

# db.create_all()

# # create a test route
# @app.route('/test', methods=['GET'])
# def test():
#   return jsonify({'message': 'The server is running'})

# # create a user
# @app.route('/api/flask/users', methods=['POST'])
# def create_user():
#   try:
#     data = request.get_json()
#     new_user = User(name=data['name'], email=data['email'])
#     db.session.add(new_user)
#     db.session.commit()

#     return jsonify({
#         'id': new_user.id,
#         'name': new_user.name,
#         'email': new_user.email
#     }), 201

#   except Exception as e:
#     return make_response(jsonify({'message': 'error creating user', 'error': str(e)}), 500)

# # get all users
# @app.route('/api/flask/users', methods=['GET'])
# def get_users():
#   try:
#     users = User.query.all()
#     users_data = [{'id': user.id, 'name': user.name, 'email': user.email} for user in users]
#     return jsonify(users_data), 200
#   except Exception as e:
#     return make_response(jsonify({'message': 'error getting users', 'error': str(e)}), 500)

# # get a user by id
# @app.route('/api/flask/users/<id>', methods=['GET'])
# def get_user(id):
#   try:
#     user = User.query.filter_by(id=id).first() # get the first user with the id
#     if user:
#       return make_response(jsonify({'user': user.json()}), 200)
#     return make_response(jsonify({'message': 'user not found'}), 404)
#   except Exception as e:
#     return make_response(jsonify({'message': 'error getting user', 'error': str(e)}), 500)

# # update a user by id
# @app.route('/api/flask/users/<id>', methods=['PUT'])
# def update_user(id):
#   try:
#     user = User.query.filter_by(id=id).first()
#     if user:
#       data = request.get_json()
#       user.name = data['name']
#       user.email = data['email']
#       db.session.commit()
#       return make_response(jsonify({'message': 'user updated'}), 200)
#     return make_response(jsonify({'message': 'user not found'}), 404)
#   except Exception as e:
#       return make_response(jsonify({'message': 'error updating user', 'error': str(e)}), 500)

# # delete a user by id
# @app.route('/api/flask/users/<id>', methods=['DELETE'])
# def delete_user(id):
#   try:
#     user = User.query.filter_by(id=id).first()
#     if user:
#       db.session.delete(user)
#       db.session.commit()
#       return make_response(jsonify({'message': 'user deleted'}), 200)
#     return make_response(jsonify({'message': 'user not found'}), 404)
#   except Exception as e:
#     return make_response(jsonify({'message': 'error deleting user', 'error': str(e)}), 500)


# if __name__ == "__main__":
#   app.run(debug=True)

# app.py
import os
from flask import Flask, request, jsonify, make_response, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import PyPDF2
from openai import OpenAI
from keys import OPENAI_API_KEY

app = Flask(__name__)
CORS(app)

# DB config (normalize URL + sane defaults)
raw_url = os.environ.get("DATABASE_URL", "")
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql+psycopg://", 1)
elif raw_url.startswith("postgresql://") and "+psycopg" not in raw_url:
    raw_url = raw_url.replace("postgresql://", "postgresql+psycopg://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = raw_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}

db = SQLAlchemy(app)
client = OpenAI(api_key=OPENAI_API_KEY)

EXTRACTION_PROMPT = """You are a financial assistant that extracts structured data from invoices.
Extract the following fields from the text:
- vendor_name
- invoice_number
- invoice_date
- due_date
- line_items: [{description, quantity, unit_price, total}]
- subtotal
- tax
- total
Always respond with valid JSON only, no extra text.
"""

def extract_text_from_pdf(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text += page_text + "\n"
    return text

# --- Models ---
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def json(self):
        return {"id": self.id, "name": self.name, "email": self.email}

# Create tables INSIDE an app context
with app.app_context():
    db.create_all()

# --- Routes ---
@app.route("/", methods=["GET", "POST"])
def index():
    extracted_data = None
    raw_text = None
    if request.method == "POST":
        pdf_file = request.files.get("invoice")
        if pdf_file:
            raw_text = extract_text_from_pdf(pdf_file)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": EXTRACTION_PROMPT},
                    {"role": "user", "content": raw_text},
                ],
                temperature=0
            )
            try:
                extracted_data = json.loads(response.choices[0].message.content.strip())
            except Exception as e:
                extracted_data = {"error": f"Failed to parse JSON: {str(e)}"}
    return render_template("index.html", data=extracted_data, text=raw_text)

@app.get("/test")
def test():
    return jsonify({"message": "The server is running"})

@app.post("/api/flask/users")
def create_user():
    try:
        data = request.get_json(force=True)
        new_user = User(name=data["name"], email=data["email"])
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.json()), 201
    except Exception as e:
        return make_response(jsonify({"message": "error creating user", "error": str(e)}), 500)

@app.get("/api/flask/users")
def get_users():
    try:
        users = User.query.all()
        return jsonify([u.json() for u in users]), 200
    except Exception as e:
        return make_response(jsonify({"message": "error getting users", "error": str(e)}), 500)

@app.get("/api/flask/users/<int:id>")
def get_user(id):
    try:
        user = User.query.get(id)
        if user:
            return jsonify({"user": user.json()}), 200
        return jsonify({"message": "user not found"}), 404
    except Exception as e:
        return make_response(jsonify({"message": "error getting user", "error": str(e)}), 500)

@app.put("/api/flask/users/<int:id>")
def update_user(id):
    try:
        user = User.query.get(id)
        if not user:
            return jsonify({"message": "user not found"}), 404
        data = request.get_json(force=True)
        user.name = data["name"]
        user.email = data["email"]
        db.session.commit()
        return jsonify({"message": "user updated"}), 200
    except Exception as e:
        return make_response(jsonify({"message": "error updating user", "error": str(e)}), 500)

@app.delete("/api/flask/users/<int:id>")
def delete_user(id):
    try:
        user = User.query.get(id)
        if not user:
            return jsonify({"message": "user not found"}), 404
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "user deleted"}), 200
    except Exception as e:
        return make_response(jsonify({"message": "error deleting user", "error": str(e)}), 500)

if __name__ == "__main__":
    app.run(debug=True)