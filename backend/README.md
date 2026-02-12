# RiverTwin AI - Backend API

Flask backend for long-term flood vulnerability prediction using a pre-trained RandomForest model.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. POST /predict

Make a flood vulnerability prediction based on geographic and hydrological features.

**Request:**
```json
{
    "Rainfall": 150.5,
    "Elevation": 100.0,
    "Slope": 5.2,
    "distance": 2.3,
    "Latitude": 28.6139,
    "Longitude": 77.2090
}
```

**Response (Success 200):**
```json
{
    "prediction": 1,
    "probability": 0.85,
    "probabilities": {
        "not_prone": 0.15,
        "prone": 0.85
    }
}
```

**Response (Error 400):**
```json
{
    "error": "Missing required features: ['Rainfall']"
}
```

### 2. GET /health

Check if the backend is running and the model is loaded.

**Response:**
```json
{
    "status": "healthy",
    "model_loaded": true,
    "expected_features": ["Rainfall", "Elevation", "Slope", "distance", "Latitude", "Longitude"]
}
```

### 3. GET /

Get API information and available endpoints.

**Response:**
```json
{
    "service": "RiverTwin AI - Flood Vulnerability Prediction API",
    "version": "1.0.0",
    "endpoints": {
        "POST /predict": "Make flood vulnerability prediction",
        "GET /health": "Check backend health status"
    },
    "features_required": ["Rainfall", "Elevation", "Slope", "distance", "Latitude", "Longitude"]
}
```

## Features Used for Prediction

- **Rainfall** (mm): Total rainfall amount
- **Elevation** (m): Ground elevation
- **Slope** (degrees): Terrain slope
- **distance** (km): Distance to water source
- **Latitude** (degrees): Geographic latitude
- **Longitude** (degrees): Geographic longitude

## Model Information

- **Model Type**: RandomForestClassifier (200 trees with depth control)
- **Output**: Binary classification (0 = Not Prone, 1 = Prone)
- **Accuracy**: ~80% on test set
- **Cross-Validation**: ~81% (5-fold)

## Frontend Integration (React)

```javascript
const predictFloodVulnerability = async (features) => {
    const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
    });
    return await response.json();
};

// Usage
const result = await predictFloodVulnerability({
    Rainfall: 150,
    Elevation: 100,
    Slope: 5,
    distance: 2,
    Latitude: 28.6,
    Longitude: 77.2
});
console.log(result); // { prediction: 1, probability: 0.85, ... }
```

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Successful prediction
- **400**: Bad request (missing/invalid features)
- **500**: Server error (model not loaded, prediction error)

All errors return JSON with descriptive messages for debugging.

## Development

The backend is configured with:
- CORS enabled for React frontend communication
- Error handling for missing/invalid inputs
- Debug mode for development
- Structured logging for troubleshooting
