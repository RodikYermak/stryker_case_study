import os
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import PyPDF2
from openai import OpenAI

from datetime import datetime
from decimal import Decimal, InvalidOperation
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import IntegrityError
import re

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
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            re.compile(r"https://.*\.vercel\.app")  # previews + prod
        ]
    }
})

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

client = OpenAI() # will use env OPENAI_API_KEY

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
Output STRICT JSON only, no commentary.
"""

def _extract_text_from_pdf(file_storage):
    try:
        reader = PyPDF2.PdfReader(file_storage)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"
        return text.strip()
    except Exception:
        return ""

@app.post("/api/flask/invoices/extract")
def extract_invoice_from_file():
    """
    Accepts multipart/form-data with 'file'.
    For PDFs: extracts text, sends to OpenAI to get structured JSON.
    Returns JSON dict suitable for your Invoice form.
    """
    try:
        f = request.files.get("file")
        if not f:
            return jsonify({"message": "No file uploaded. Use 'file' field."}), 400

        # Handle PDFs (recommended path)
        text = ""
        if f.mimetype == "application/pdf" or (f.filename or "").lower().endswith(".pdf"):
            text = _extract_text_from_pdf(f)
            if not text:
                return jsonify({"message": "Could not read text from PDF"}), 415
        else:
            # You can add image OCR here if you want (e.g., Tesseract or OpenAI Vision).
            return jsonify({"message": "Only PDF invoices supported for extraction at this time"}), 415

        # Call OpenAI to transform raw text -> structured JSON
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": EXTRACTION_PROMPT},
                {"role": "user", "content": text[:100_000]},  # keep request reasonable
            ],
            temperature=0,
        )

        raw = completion.choices[0].message.content or "{}"

        # Try parse; if it fails, wrap as error
        try:
            data = json.loads(raw)
        except Exception as e:
            return jsonify({"message": "Failed to parse extraction JSON", "raw": raw, "error": str(e)}), 502

        # Normalize for your form (strings for money/date are fine; server will coerce on save)
        normalized = {
            "id": None,
            "vendor_name": (data.get("vendor_name") or "").strip(),
            "invoice_number": (data.get("invoice_number") or "").strip(),
            "invoice_date": data.get("invoice_date") or None,  # "YYYY-MM-DD" or "MM/DD/YYYY" OK
            "due_date": data.get("due_date") or None,
            "line_items": data.get("line_items") if isinstance(data.get("line_items"), list) else [],
            "subtotal": str(data.get("subtotal")) if data.get("subtotal") is not None else "",
            "tax": str(data.get("tax")) if data.get("tax") is not None else "",
            "total": str(data.get("total")) if data.get("total") is not None else "",
        }

        return jsonify(normalized), 200

    except Exception as e:
        return make_response(jsonify({"message": "error extracting invoice", "error": str(e)}), 500)

# --- Models ---
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

if __name__ == "__main__":
    app.run(debug=True)