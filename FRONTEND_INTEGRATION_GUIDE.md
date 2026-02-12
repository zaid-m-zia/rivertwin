# Frontend-Backend Integration Guide

## Overview

Successfully integrated React Vite frontend with Flask ML backend for flood vulnerability prediction.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Vite Frontend                       │
├─────────────────────────────────────────────────────────────┤
│  App.jsx                   CesiumViewer.jsx                 │
│  ├─ State Management       ├─ Map Click Handler             │
│  ├─ analyzeZone()          ├─ Prediction Overlay            │
│  └─ Backend Calls          └─ Location Capture              │
│                                                              │
│  Sidebar.jsx               RiskPanel.jsx                    │
│  ├─ Analyze Zone Button    ├─ ML Risk Visualization        │
│  ├─ Location Display       ├─ Confidence Score             │
│  └─ Prediction Result      └─ Risk Status                  │
└─────────────────────────────────────────────────────────────┘
           ↓↑ (HTTP POST /predict)
┌─────────────────────────────────────────────────────────────┐
│                   Flask Backend (Port 5000)                 │
├─────────────────────────────────────────────────────────────┤
│  app.py                                                      │
│  ├─ GET /              (health check)                       │
│  ├─ GET /health        (model status)                       │
│  └─ POST /predict      (ML prediction)                      │
│                                                              │
│  Model: RandomForestClassifier                              │
│  ├─ File: ml/flood_model.pkl                                │
│  ├─ Features: 6 (Rainfall, Elevation, Slope, etc.)         │
│  └─ Output: Binary (0=safe, 1=high risk)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Updated Files

### 1. **App.jsx** - Main Application Component

**New State Variables:**
```javascript
const [prediction, setPrediction] = useState(null)
const [probability, setProbability] = useState(null)  
const [selectedLocation, setSelectedLocation] = useState(null)
const [isAnalyzing, setIsAnalyzing] = useState(false)
const [analysisError, setAnalysisError] = useState(null)
```

**New Function: `analyzeZone()`**
```javascript
const analyzeZone = async () => {
  // 1. Validates selectedLocation exists
  // 2. Creates payload with location + rainfall data
  // 3. Sends POST to http://127.0.0.1:5000/predict
  // 4. Updates prediction & probability state
  // 5. Handles errors gracefully
}
```

**Data Flow:**
- User → CesiumViewer (click map) → App (setSelectedLocation)
- User → Sidebar button → App (analyzeZone) → Backend

---

### 2. **CesiumViewer.jsx** - 3D Map Component

**New Props:**
```javascript
prediction        // ML prediction result (0 or 1)
probability       // Confidence score
selectedLocation  // {lat, lon} from map click
onLocationSelect  // Callback to send location to parent
```

**New Features:**

#### Map Click Handler
```javascript
viewer.screenSpaceEventHandler.setInputAction((click) => {
  const cartesian = viewer.scene.pickPosition(click.position)
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
  
  // Send lat/lon to parent
  onLocationSelect({
    lat: Cesium.Math.toDegrees(cartographic.latitude),
    lon: Cesium.Math.toDegrees(cartographic.longitude)
  })
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
```

#### Prediction Overlay
```javascript
// Effect: Updates when selectedLocation or prediction changes
if (prediction !== null && selectedLocation) {
  const circleColor = prediction === 1 
    ? Cesium.Color.RED.withAlpha(0.5)
    : Cesium.Color.GREEN.withAlpha(0.5)
  
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    ellipse: {
      semiMinorAxis: 500,
      semiMajorAxis: 500,
      material: circleColor
    }
  })
}
```

---

### 3. **Sidebar.jsx** - Control Panel

**New Props & Features:**

Added "ML Analysis" panel with:
- **Location Display**: Shows selected coordinates (Lat/Lon)
- **Analyze Zone Button**: Triggers backend prediction
  - Disabled until location is selected
  - Shows loading state during analysis
- **Error Messages**: Displays validation errors
- **Prediction Result**: Shows:
  - 🔴 "HIGH RISK" (red) if prediction === 1
  - 🟢 "LOW RISK" (green) if prediction === 0  
  - Confidence: `{probability * 100}%`

---

### 4. **RiskPanel.jsx** - Risk Visualization

**Enhanced Features:**

```javascript
// Now accepts ML prediction data
export default function RiskPanel({ 
  riskScore,      // Global risk (rainfall-based)
  prediction,     // ML prediction (0 or 1)
  probability     // ML confidence score
})
```

**Display Logic:**
```javascript
// Use ML prediction if available, otherwise global risk
const displayScore = prediction !== null 
  ? Math.round(probability * 100) 
  : riskScore

// Title changes
// "Flood Risk" (global) → "ML Flood Risk" (prediction)

// Shows status indicator
{prediction !== null && (
  "⚠️ HIGH RISK ZONE" | "✓ LOW RISK ZONE"
)}
```

---

## How It Works - Step by Step

### Workflow

```
1. USER CLICKS ON MAP
   ↓
   CesiumViewer captures latitude & longitude
   ↓
   onLocationSelect() callback fires
   ↓
   App.jsx updates selectedLocation state
   ↓
   Sidebar displays: "Lat: X, Lon: Y"

2. USER CLICKS "ANALYZE ZONE" BUTTON
   ↓
   analyzeZone() function called
   ↓
   Creates payload:
   {
     Rainfall: 20,           // from slider
     Elevation: 15,          // static
     Slope: 2,               // static
     distance: 0.5,          // static
     Latitude: 28.7041,      // from map click
     Longitude: 77.1025      // from map click
   }
   ↓
   POST http://127.0.0.1:5000/predict

3. BACKEND PROCESSING (Flask)
   ↓
   Model.predict([Rainfall, Elevation, Slope, distance, Lat, Lon])
   ↓
   Returns: {"prediction": 0 or 1, "probability": 0.XX}

4. FRONTEND UPDATE
   ↓
   setPrediction(response.prediction)
   setProbability(response.probability)
   ↓
   CesiumViewer adds overlay circle:
   - RED (high risk) if prediction === 1
   - GREEN (low risk) if prediction === 0
   ↓
   RiskPanel updates to show:
   - ML Flood Risk title
   - Confidence percentage
   - Risk status indicator
```

---

## Backend API Reference

### Endpoint: `POST /predict`

**URL:** `http://127.0.0.1:5000/predict`

**Request Body:**
```json
{
  "Rainfall": 1200,
  "Elevation": 15,
  "Slope": 2,
  "distance": 0.5,
  "Latitude": 28.7041,
  "Longitude": 77.1025
}
```

**Response Success (200):**
```json
{
  "prediction": 0,
  "probability": 0.684
}
```

**Response Error (400):**
```json
{
  "error": "Missing fields: ['Rainfall']"
}
```

---

## Testing the Integration

### Prerequisites

1. **Backend Running:**
   ```bash
   cd backend
   python3 app.py
   ```
   Should show:
   ```
   [SUCCESS] ✓ Model loaded successfully!
   Server running at: http://127.0.0.1:5000
   ```

2. **Frontend Running:**
   ```bash
   npm run dev
   ```
   Should start Vite dev server

### Test Scenario

1. **Open Browser:** http://localhost:5173

2. **Verify Sidebar:** 
   - ✓ Rainfall slider exists
   - ✓ Risk panel visible
   - ✓ Layer toggles present
   - ✓ "ML Analysis" panel visible

3. **Test Map Click:**
   - Click on map
   - Check Sidebar "ML Analysis" section
   - Should show coordinates: "Lat: 28.XXXX, Lon: 77.XXXX"
   - Check browser console: `[Cesium] Map click - Lat: ...`

4. **Test Prediction:**
   - With location selected, click "Analyze Zone"
   - Sidebar button shows "Analyzing..."
   - After ~1s, button returns to "Analyze Zone"
   - Should see red or green circle on map
   - Risk panel shows confidence percentage
   - Check console: `[Frontend] Prediction response: ...`

5. **Test Error Handling:**
   - Click "Analyze Zone" without selecting location
   - Should see error: "Please click on map to select a location"
   - Try moving backend port - should see error message

---

## Debug Logging

### Frontend Console Logs

```javascript
// Map click
[Cesium] Map click - Lat: 28.7041, Lon: 77.1025

// Sending request
[Frontend] Sending prediction request: {Rainfall: 20, ...}

// Response received
[Frontend] Prediction response: {prediction: 1, probability: 0.684}

// Errors
[Frontend] Prediction error: Failed to analyze zone
```

### Backend Console Logs

```
[REQUEST] POST /predict - Request received!
[DEBUG] Incoming JSON: {'Rainfall': 20, ...}
[DEBUG] All required fields present ✓
[DEBUG] Running model.predict()...
[DEBUG] Prediction: 1
[SUCCESS] Response: {'prediction': 1, 'probability': 0.684}
```

---

## Features Preserved

✅ Dark blue theme  
✅ Glassmorphism effects  
✅ Sidebar collapse functionality  
✅ Rainfall slider  
✅ Risk meter visualization  
✅ Terrain/flood zone toggles  
✅ Cesium 3D map with terrain  
✅ About section  

---

## Key Implementation Details

### State Management
- **selectedLocation** stored in App.jsx (single source of truth)
- Passed down to CesiumViewer via props
- Passed to Sidebar for display

### Error Handling
- Missing location: User-friendly message
- Backend errors: Parsed and displayed
- Network errors: Caught and logged
- Loading states: Button disabled during analysis

### Performance
- Map click doesn't re-render entire app
- Prediction requests debounced by user action
- Cesium entities properly cleaned up
- No infinite re-renders

### CORS
- Backend has `CORS(app)` enabled
- Frontend requests from localhost:5173 → localhost:5000
- Cross-origin requests allowed

---

## Troubleshooting

### Issue: "Analyze Zone" button is disabled

**Solution:** Click on map first to select location

### Issue: No circle appears on map after clicking "Analyze Zone"

**Possible causes:**
1. Backend not running (check http://127.0.0.1:5000/health)
2. Model not loaded (check backend logs)
3. Check browser console for network errors

### Issue: Backend returns 400 error

**Solution:** Ensure request includes all 6 required fields:
- Rainfall, Elevation, Slope, distance, Latitude, Longitude

### Issue: Slow predictions

**Normal:** RandomForest with 200 trees takes ~100-200ms  
**Check:** Backend console for slowness or errors

---

## Next Steps

Potential enhancements:
- [ ] Integrate with real elevation/slope data from API
- [ ] Add historical flood data overlay
- [ ] Implement batch prediction for multiple points
- [ ] Add prediction confidence threshold controls
- [ ] Deploy backend to AWS/Heroku
- [ ] Add real-time rainfall stream integration
- [ ] Implement prediction history/tracking

---

## Files Modified

```
src/App.jsx                    ← Main state + analyzeZone()
src/cesium/CesiumViewer.jsx   ← Map click handler + overlay
src/components/Sidebar.jsx     ← Analyze Zone button + panel
src/components/RiskPanel.jsx   ← ML result display
backend/app.py                 ← Already working ✓
backend/requirements.txt        ← Already complete ✓
```

---

## Summary

✅ **Frontend fully integrated with backend**  
✅ **Map click captures coordinates**  
✅ **ML predictions displayed on map with red/green overlays**  
✅ **Risk panel shows confidence scores**  
✅ **Error handling prevents silent failures**  
✅ **Debug logging for troubleshooting**  
✅ **Theme and design preserved**  

**Status: Ready for production testing and deployment**

