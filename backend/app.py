"""
RiverTwin AI - Flood Vulnerability Prediction Backend
Serves a pre-trained RandomForest model for long-term flood-prone classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'flood_model.pkl')
try:
    model = joblib.load(MODEL_PATH)
    print(f"✓ Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"✗ Error: Model file not found at {MODEL_PATH}")
    model = None

# Expected features in the same order as training
EXPECTED_FEATURES = ['Rainfall', 'Elevation', 'Slope', 'distance', 'Latitude', 'Longitude']


@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint for flood vulnerability prediction.
    
    Accepts POST request with JSON body containing:
    {
        "Rainfall": float,
        "Elevation": float,
        "Slope": float,
        "distance": float,
        "Latitude": float,
        "Longitude": float
    }
    
    Returns:
    {
        "prediction": 0 (not prone) or 1 (prone),
        "probability": float between 0 and 1
    }
    """
    
    # Check if model is loaded
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        # Parse JSON request
        data = request.get_json()
        
        if data is None:
            return jsonify({"error": "Request body must be JSON"}), 400
        
        # Validate all required features are present
        missing_features = [f for f in EXPECTED_FEATURES if f not in data]
        if missing_features:
            return jsonify({
                "error": f"Missing required features: {missing_features}"
            }), 400
        
        # Extract features in the correct order
        features = np.array([[
            data['Rainfall'],
            data['Elevation'],
            data['Slope'],
            data['distance'],
            data['Latitude'],
            data['Longitude']
        ]])
        
        # Make prediction
        prediction = model.predict(features)[0]  # 0 or 1
        probability = model.predict_proba(features)[0]  # [prob_class_0, prob_class_1]
        
        # Return result
        # If prediction is 1 (prone), return probability of class 1
        # If prediction is 0 (not prone), return probability of class 0
        result_probability = float(probability[int(prediction)])
        
        return jsonify({
            "prediction": int(prediction),
            "probability": result_probability,
            "probabilities": {
                "not_prone": float(probability[0]),
                "prone": float(probability[1])
            }
        }), 200
    
    except KeyError as e:
        return jsonify({"error": f"Invalid feature: {str(e)}"}), 400
    
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Feature values must be numeric: {str(e)}"}), 400
    
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500


@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint to verify backend is running.
    """
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "expected_features": EXPECTED_FEATURES
    }), 200


@app.route('/', methods=['GET'])
def index():
    """
    Root endpoint with API information.
    """
    return jsonify({
        "service": "RiverTwin AI - Flood Vulnerability Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "POST /predict": "Make flood vulnerability prediction",
            "GET /health": "Check backend health status"
        },
        "features_required": EXPECTED_FEATURES
    }), 200


if __name__ == '__main__':
    # Run Flask app on port 5000 with debug mode
    app.run(host='0.0.0.0', port=5000, debug=True)
