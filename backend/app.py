"""
================================================================================
  RiverTwin AI - Flood Vulnerability Prediction Backend
================================================================================

TESTING INSTRUCTIONS:

1. Start the backend:
   cd backend
   pip install -r requirements.txt
   python app.py

2. Test if server is alive (should see JSON response):
   curl http://127.0.0.1:5000/

3. Test health check:
   curl http://127.0.0.1:5000/health

4. Test prediction with sample data:
   curl -X POST http://127.0.0.1:5000/predict \
     -H "Content-Type: application/json" \
     -d '{"Rainfall":1200,"Elevation":15,"Slope":2,"distance":0.5,"Latitude":28.6,"Longitude":77.1}'

Expected response:
   {"prediction": 0 or 1, "probability": 0.XX}

================================================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

# ============================================================================
# INITIALIZE FLASK APP & CORS
# ============================================================================

app = Flask(__name__)
CORS(app)

print("\n" + "="*80)
print("RIVERTWIN AI - BACKEND INITIALIZING")
print("="*80 + "\n")

# ============================================================================
# LOAD MODEL
# ============================================================================

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'flood_model.pkl')
print(f"[INFO] Loading model from: {MODEL_PATH}")

try:
    model = joblib.load(MODEL_PATH)
    print(f"[SUCCESS] ✓ Model loaded successfully!\n")
except FileNotFoundError:
    print(f"[ERROR] ✗ Model file NOT found at: {MODEL_PATH}\n")
    model = None
except Exception as e:
    print(f"[ERROR] ✗ Failed to load model: {str(e)}\n")
    model = None

# ============================================================================
# EXPECTED FEATURES (IN CORRECT ORDER)
# ============================================================================

EXPECTED_FEATURES = ['Rainfall', 'Elevation', 'Slope', 'distance', 'Latitude', 'Longitude']
print(f"[INFO] Expected features: {EXPECTED_FEATURES}\n")


# ============================================================================
# ROUTE 1: ROOT ENDPOINT (GET /)
# ============================================================================

@app.route("/", methods=["GET"])
def health_check():
    """
    Root endpoint - returns backend status info
    """
    print("[REQUEST] GET /")
    return jsonify({"status": "RiverTwin AI Backend Running Successfully"})


# ============================================================================
# ROUTE 2: HEALTH CHECK (GET /health)
# ============================================================================

@app.route("/health", methods=["GET"])
def health():
    """
    Health check endpoint
    """
    print("[REQUEST] GET /health")
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "expected_features": EXPECTED_FEATURES
    })


# ============================================================================
# ROUTE 3: PREDICT ENDPOINT (POST /predict)
# ============================================================================

@app.route("/predict", methods=["POST"])
def predict():
    """
    Flood vulnerability prediction endpoint.
    
    Expects JSON with 6 features:
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
        "prediction": 0 (safe) or 1 (flood prone),
        "probability": probability value
    }
    """
    
    print("\n" + "-"*80)
    print("[REQUEST] POST /predict - Request received!")
    print("-"*80)
    
    # ========================================================================
    # CHECK IF MODEL IS LOADED
    # ========================================================================
    
    if model is None:
        print("[ERROR] Model is not loaded!")
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        # ====================================================================
        # PARSE JSON
        # ====================================================================
        
        data = request.get_json()
        print(f"[DEBUG] Incoming JSON: {data}")
        
        if data is None:
            print("[ERROR] No JSON received!")
            return jsonify({"error": "Request body must be JSON"}), 400
        
        # ====================================================================
        # VALIDATE REQUIRED FIELDS
        # ====================================================================
        
        missing_fields = [f for f in EXPECTED_FEATURES if f not in data]
        
        if missing_fields:
            print(f"[ERROR] Missing fields: {missing_fields}")
            return jsonify({"error": f"Missing fields: {missing_fields}"}), 400
        
        print(f"[DEBUG] All required fields present ✓")
        
        # ====================================================================
        # CONVERT TO NUMPY ARRAY (IN CORRECT ORDER)
        # ====================================================================
        
        features_list = [
            float(data['Rainfall']),
            float(data['Elevation']),
            float(data['Slope']),
            float(data['distance']),
            float(data['Latitude']),
            float(data['Longitude'])
        ]
        
        print(f"[DEBUG] Feature values: {features_list}")
        
        features_array = np.array([features_list])
        print(f"[DEBUG] Feature array shape: {features_array.shape}")
        
        # ====================================================================
        # MAKE PREDICTION
        # ====================================================================
        
        print("[DEBUG] Running model.predict()...")
        prediction = model.predict(features_array)[0]
        
        print("[DEBUG] Running model.predict_proba()...")
        probabilities = model.predict_proba(features_array)[0]
        
        print(f"[DEBUG] Prediction: {prediction}")
        print(f"[DEBUG] Probabilities: {probabilities}")
        
        # ====================================================================
        # PREPARE RESPONSE
        # ====================================================================
        
        response = {
            "prediction": int(prediction),
            "probability": float(probabilities[int(prediction)])
        }
        
        print(f"[SUCCESS] Response: {response}")
        print("-"*80 + "\n")
        
        return jsonify(response), 200
    
    except ValueError as e:
        error_msg = f"Feature values must be numeric: {str(e)}"
        print(f"[ERROR] {error_msg}")
        print("-"*80 + "\n")
        return jsonify({"error": error_msg}), 400
    
    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        print(f"[ERROR] {error_msg}")
        print("-"*80 + "\n")
        return jsonify({"error": error_msg}), 500


# ============================================================================
# GLOBAL ERROR HANDLER
# ============================================================================

@app.errorhandler(Exception)
def handle_exception(e):
    """
    Catch-all error handler for unhandled exceptions
    """
    error_msg = str(e)
    print(f"[ERROR] Unhandled exception occurred: {error_msg}")
    return jsonify({"error": error_msg}), 500


# ============================================================================
# MAIN - RUN SERVER
# ============================================================================

if __name__ == "__main__":
    print("="*80)
    print("STARTING FLASK SERVER")
    print("="*80)
    print("\nServer running at: http://127.0.0.1:5000")
    print("Debug mode: ON\n")
    
    # Run on localhost:5000 with debug enabled
    app.run(host="127.0.0.1", port=5000, debug=True)
