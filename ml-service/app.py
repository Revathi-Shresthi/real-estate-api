from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import logging

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ── App setup ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)   # allow cross-origin requests from the Node.js API

# ── Load model & encoders ──────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

try:
    model       = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
    le_city     = joblib.load(os.path.join(MODEL_DIR, "le_city.pkl"))
    le_state    = joblib.load(os.path.join(MODEL_DIR, "le_state.pkl"))
    le_type     = joblib.load(os.path.join(MODEL_DIR, "le_type.pkl"))
    le_category = joblib.load(os.path.join(MODEL_DIR, "le_category.pkl"))
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Failed to load models: {e}")
    raise


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health-check endpoint — required by Docker Compose depends_on."""
    return jsonify({"status": "ok", "service": "ml-service"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts JSON body:
      { city, state, type, category, bedrooms, bathrooms, area }
    Returns:
      { estimated_price, price_range: { low, high }, currency }
    """
    data = request.get_json(force=True)

    # ── Validate required fields ───────────────────────────────────────────────
    required = ["city", "state", "type", "category", "bedrooms", "bathrooms", "area"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        features = np.array([[
            le_city.transform([data["city"]])[0],
            le_state.transform([data["state"]])[0],
            le_type.transform([data["type"]])[0],
            le_category.transform([data["category"]])[0],
            int(data["bedrooms"]),
            int(data["bathrooms"]),
            float(data["area"]),
        ]])

        price = model.predict(features)[0]

        return jsonify({
            "estimated_price": round(price),
            "price_range": {
                "low":  round(price * 0.9),
                "high": round(price * 1.1),
            },
            "currency": "INR",
        }), 200

    except ValueError as e:
        # e.g. unseen label passed to LabelEncoder
        return jsonify({"error": f"Invalid input value: {e}"}), 422
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": "Internal server error"}), 500


# ── Entry point ────────────────────────────────────────────────────────────────
#   host='0.0.0.0' is REQUIRED for Docker — without it Flask binds to
#   127.0.0.1 (inside the container only) and port 5001 is unreachable.

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    logger.info(f"Starting ML service on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)