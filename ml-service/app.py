from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

model = None
le_city = None
le_state = None
le_type = None
le_category = None

def load_models():
    global model, le_city, le_state, le_type, le_category
    try:
        model = joblib.load('model/model.pkl')
        le_city = joblib.load('model/le_city.pkl')
        le_state = joblib.load('model/le_state.pkl')
        le_type = joblib.load('model/le_type.pkl')
        le_category = joblib.load('model/le_category.pkl')
        print("Models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "ml-price-estimator"
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        required = ['city', 'state', 'type', 'category',
                   'bedrooms', 'bathrooms', 'area']

        for field in required:
            if field not in data:
                return jsonify({
                    "error": f"Missing field: {field}"
                }), 400

        try:
            city_encoded = le_city.transform([data['city']])[0]
        except ValueError:
            city_encoded = 0

        try:
            state_encoded = le_state.transform([data['state']])[0]
        except ValueError:
            state_encoded = 0

        try:
            type_encoded = le_type.transform([data['type']])[0]
        except ValueError:
            type_encoded = 0

        try:
            category_encoded = le_category.transform([data['category']])[0]
        except ValueError:
            category_encoded = 0

        features = np.array([[
            city_encoded,
            state_encoded,
            type_encoded,
            category_encoded,
            int(data['bedrooms']),
            int(data['bathrooms']),
            float(data['area'])
        ]])

        predicted_price = model.predict(features)[0]
        predicted_price = max(0, predicted_price)

        low = predicted_price * 0.9
        high = predicted_price * 1.1

        return jsonify({
            "estimated_price": round(predicted_price),
            "price_range": {
                "low": round(low),
                "high": round(high)
            },
            "currency": "INR",
            "message": "Price estimate based on market data"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    load_models()
    app.run(host='0.0.0.0', port=5001, debug=True)