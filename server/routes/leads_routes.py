from flask import Blueprint, jsonify, request
from services.lead_service import run_scan, _lead_to_dict
from services.message_service import generate_message
from repositories.lead_repository import get_all_leads, get_lead_by_id

leads_bp = Blueprint("leads", __name__)


@leads_bp.route("/api/leads/scan", methods=["POST"])
def scan_leads():
    body = request.get_json(silent=True) or {}
    location = body.get("location")
    if not location:
        return jsonify({"error": "location is required"}), 400

    radius_km = body.get("radius_km", 5)
    min_rating = body.get("min_rating", 0)
    max_rating = body.get("max_rating", 5)
    category = body.get("category") or None  # empty string → None (search all types)

    try:
        result = run_scan(location, radius_km, min_rating, max_rating, category)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@leads_bp.route("/api/leads", methods=["GET"])
def list_leads():
    leads = get_all_leads()
    return jsonify([_lead_to_dict(l) for l in leads]), 200


@leads_bp.route("/api/leads/<int:lead_id>", methods=["GET"])
def get_lead(lead_id):
    lead = get_lead_by_id(lead_id)
    if not lead:
        return jsonify({"error": "Lead not found"}), 404
    return jsonify(_lead_to_dict(lead)), 200


@leads_bp.route("/api/leads/<int:lead_id>/generate-message", methods=["POST"])
def generate_lead_message(lead_id):
    lead = get_lead_by_id(lead_id)
    if not lead:
        return jsonify({"error": "Lead not found"}), 404

    body = request.get_json(silent=True) or {}
    method = body.get("method")
    if method not in ("sms", "email"):
        return jsonify({"error": "method must be 'sms' or 'email'"}), 400

    try:
        result = generate_message(lead, method)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
