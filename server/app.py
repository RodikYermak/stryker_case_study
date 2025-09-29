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

from datetime import datetime
from decimal import Decimal, InvalidOperation
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import IntegrityError

def _parse_date(s: str | None):
    if not s:
        return None
    # accept "YYYY-MM-DD" or "MM/DD/YYYY"
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        try:
            return datetime.strptime(s, "%m/%d/%Y").date()
        except ValueError:
            return None

def _to_decimal(s):
    if s is None:
        return None
    try:
        return Decimal(str(s))
    except (InvalidOperation, ValueError, TypeError):
        return None

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

# --- Models ---
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def json(self):
        return {"id": self.id, "name": self.name, "email": self.email}

class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    vendor_name = db.Column(db.String(255), nullable=False)
    invoice_number = db.Column(db.String(64), unique=True, nullable=False)
    invoice_date = db.Column(db.Date, nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    # [{description, quantity, unit_price, total}]
    line_items = db.Column(JSONB, nullable=False, default=list)
    subtotal = db.Column(db.Numeric(12, 2), nullable=True)
    tax = db.Column(db.Numeric(12, 2), nullable=True)
    total = db.Column(db.Numeric(12, 2), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "vendor_name": self.vendor_name,
            "invoice_number": self.invoice_number,
            "invoice_date": self.invoice_date.isoformat() if self.invoice_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "line_items": self.line_items or [],
            "subtotal": str(self.subtotal) if self.subtotal is not None else None,
            "tax": str(self.tax) if self.tax is not None else None,
            "total": str(self.total) if self.total is not None else None,
        }

# Create tables INSIDE an app context
with app.app_context():
    db.create_all()

# --- Routes ---
@app.get("/test")
def test():
    return jsonify({"message": "The server is running"})


@app.post("/api/flask/invoices")
def create_invoice():
    try:
        data = request.get_json(force=True) or {}

        inv = Invoice(
            vendor_name=data.get("vendor_name", "").strip(),
            invoice_number=data.get("invoice_number", "").strip(),
            invoice_date=_parse_date(data.get("invoice_date")),
            due_date=_parse_date(data.get("due_date")),
            line_items=data.get("line_items") or [],
            subtotal=_to_decimal(data.get("subtotal")),
            tax=_to_decimal(data.get("tax")),
            total=_to_decimal(data.get("total")),
        )

        if not inv.vendor_name or not inv.invoice_number:
            return make_response(jsonify({"message": "vendor_name and invoice_number are required"}), 400)

        db.session.add(inv)
        db.session.commit()
        return jsonify(inv.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"message": "error creating invoice", "error": str(e)}), 500)

@app.get("/api/flask/invoices")
def list_invoices():
    try:
        rows = Invoice.query.order_by(Invoice.id.desc()).all()
        return jsonify([r.to_dict() for r in rows]), 200
    except Exception as e:
        return make_response(jsonify({"message": "error getting invoices", "error": str(e)}), 500)

@app.get("/api/flask/invoices/<int:id>")
def get_invoice(id):
    try:
        row = Invoice.query.get(id)
        if not row:
            return jsonify({"message": "invoice not found"}), 404
        return jsonify(row.to_dict()), 200
    except Exception as e:
        return make_response(jsonify({"message": "error getting invoice", "error": str(e)}), 500)

@app.put("/api/flask/invoices/<int:id>")
def update_invoice(id: int):
    """Full replace: all mutable fields expected in body."""
    try:
        inv = Invoice.query.get(id)
        if not inv:
            return jsonify({"message": "invoice not found"}), 404

        data = request.get_json(force=True) or {}

        # required fields for a full update
        vendor_name   = (data.get("vendor_name") or "").strip()
        invoice_number= (data.get("invoice_number") or "").strip()
        if not vendor_name or not invoice_number:
            return jsonify({"message": "vendor_name and invoice_number are required"}), 400

        inv.vendor_name    = vendor_name
        inv.invoice_number = invoice_number
        inv.invoice_date   = _parse_date(data.get("invoice_date"))
        inv.due_date       = _parse_date(data.get("due_date"))
        inv.line_items     = data.get("line_items") or []
        inv.subtotal       = _to_decimal(data.get("subtotal"))
        inv.tax            = _to_decimal(data.get("tax"))
        inv.total          = _to_decimal(data.get("total"))

        db.session.commit()
        return jsonify(inv.to_dict()), 200
    except IntegrityError as ie:
        db.session.rollback()
        return jsonify({"message": "invoice_number must be unique", "error": str(ie)}), 409
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"message": "error updating invoice", "error": str(e)}), 500)


@app.patch("/api/flask/invoices/<int:id>")
def patch_invoice(id: int):
    """Partial update: only provided fields are changed."""
    try:
        inv = Invoice.query.get(id)
        if not inv:
            return jsonify({"message": "invoice not found"}), 404

        data = request.get_json(force=True) or {}

        if "vendor_name" in data:
            vn = (data.get("vendor_name") or "").strip()
            if not vn:
                return jsonify({"message": "vendor_name cannot be empty"}), 400
            inv.vendor_name = vn

        if "invoice_number" in data:
            inum = (data.get("invoice_number") or "").strip()
            if not inum:
                return jsonify({"message": "invoice_number cannot be empty"}), 400
            inv.invoice_number = inum

        if "invoice_date" in data:
            inv.invoice_date = _parse_date(data.get("invoice_date"))

        if "due_date" in data:
            inv.due_date = _parse_date(data.get("due_date"))

        if "line_items" in data:
            inv.line_items = data.get("line_items") or []

        for money_field in ("subtotal", "tax", "total"):
            if money_field in data:
                setattr(inv, money_field, _to_decimal(data.get(money_field)))

        db.session.commit()
        return jsonify(inv.to_dict()), 200
    except IntegrityError as ie:
        db.session.rollback()
        return jsonify({"message": "invoice_number must be unique", "error": str(ie)}), 409
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"message": "error patching invoice", "error": str(e)}), 500)


@app.delete("/api/flask/invoices/<int:id>")
def delete_invoice(id: int):
    try:
        inv = Invoice.query.get(id)
        if not inv:
            return jsonify({"message": "invoice not found"}), 404
        db.session.delete(inv)
        db.session.commit()
        return jsonify({"message": "invoice deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"message": "error deleting invoice", "error": str(e)}), 500)

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




# {
#   "vendor_name": "Acme Corp",
#   "invoice_number": "INV-1001",
#   "invoice_date": "2025-06-16",
#   "due_date": "2025-06-30",
#   "line_items": [
#     {
#       "description": "Widget A",
#       "quantity": 2,
#       "unit_price": 19.99,
#       "total": 39.98
#     },
#     {
#       "description": "Widget B",
#       "quantity": 1,
#       "unit_price": 10.0,
#       "total": 10.0
#     }
#   ],
#   "subtotal": 49.98,
#   "tax": 4.0,
#   "total": 53.98
# }

# {
#   "vendor_name": "Global Supplies Ltd.",
#   "invoice_number": "INV-2002",
#   "invoice_date": "2025-07-01",
#   "due_date": "2025-07-15",
#   "line_items": [
#     {
#       "description": "Office Chairs",
#       "quantity": 5,
#       "unit_price": 85.50,
#       "total": 427.50
#     },
#     {
#       "description": "Standing Desks",
#       "quantity": 2,
#       "unit_price": 299.99,
#       "total": 599.98
#     }
#   ],
#   "subtotal": 1027.48,
#   "tax": 82.20,
#   "total": 1109.68
# }