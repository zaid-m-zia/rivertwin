# Frontend-Backend Integration - Code Reference

## Complete Code Snippets

---

## 1. App.jsx - analyzeZone() Function

```javascript
const BACKEND_URL = 'http://127.0.0.1:5000'

const analyzeZone = async () => {
  if (!selectedLocation) {
    setAnalysisError('Please click on map to select a location')
    return
  }

  setIsAnalyzing(true)
  setAnalysisError(null)

  try {
    const payload = {
      Rainfall: rainfall,
      Elevation: 15,
      Slope: 2,
      distance: 0.5,
      Latitude: selectedLocation.lat,
      Longitude: selectedLocation.lon
    }

    console.log('[Frontend] Sending prediction request:', payload)

    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Backend error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[Frontend] Prediction response:', data)

    setPrediction(data.prediction)
    setProbability(data.probability)

    // Update risk score based on prediction
    if (data.prediction === 1) {
      setRiskScore(Math.round(data.probability * 100))
    } else {
      setRiskScore(Math.round((1 - data.probability) * 100))
    }
  } catch (error) {
    console.error('[Frontend] Prediction error:', error)
    setAnalysisError(error.message || 'Failed to analyze zone')
    setPrediction(null)
    setProbability(null)
  } finally {
    setIsAnalyzing(false)
  }
}
```

---

## 2. CesiumViewer.jsx - Map Click Handler

```javascript
// Inside useEffect initialization

// ====================================================================
// MAP CLICK HANDLER - Capture coordinates
// ====================================================================
viewer.screenSpaceEventHandler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position)

  if (Cesium.defined(pickedObject)) {
    console.log('[Cesium] Clicked entity:', pickedObject.id)
  }

  // Get coordinates at mouse position
  const cartesian = viewer.scene.pickPosition(click.position)
  if (Cesium.defined(cartesian)) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)

    console.log('[Cesium] Map click - Lat:', latitude, 'Lon:', longitude)

    // Send coordinates to parent component
    if (onLocationSelect) {
      onLocationSelect({
        lat: latitude,
        lon: longitude
      })
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
```

---

## 3. CesiumViewer.jsx - Prediction Overlay Effect

```javascript
// Update prediction overlay circle when prediction or location changes
useEffect(() => {
  const Cesium = cesiumRef.current
  const viewer = viewerRef.current
  if (!Cesium || !viewer) return

  // Remove old prediction circle if exists
  if (predictionCircleRef.current) {
    viewer.entities.remove(predictionCircleRef.current)
    predictionCircleRef.current = null
  }

  // Add new prediction circle if we have a location and prediction
  if (selectedLocation && prediction !== null) {
    const circleColor =
      prediction === 1
        ? Cesium.Color.RED.withAlpha(0.5)
        : Cesium.Color.GREEN.withAlpha(0.5)

    const circle = viewer.entities.add({
      id: 'prediction-circle',
      position: Cesium.Cartesian3.fromDegrees(selectedLocation.lon, selectedLocation.lat),
      ellipse: {
        semiMinorAxis: 500,
        semiMajorAxis: 500,
        material: circleColor
      }
    })

    predictionCircleRef.current = circle
    console.log('[Cesium] Added prediction circle:', prediction === 1 ? 'HIGH RISK' : 'LOW RISK')
  }
}, [selectedLocation, prediction])
```

---

## 4. Sidebar.jsx - Analyze Zone Panel

```javascript
{/* ================================================================ */}
{/* ANALYZE ZONE PANEL */}
{/* ================================================================ */}
<motion.div whileHover={{ y: -4 }} className="panel">
  <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>
    ML Analysis
  </h3>

  {/* Location indicator */}
  {selectedLocation && (
    <div
      style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginBottom: '12px',
        padding: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '6px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}
    >
      <div>Lat: {selectedLocation.lat.toFixed(4)}</div>
      <div>Lon: {selectedLocation.lon.toFixed(4)}</div>
    </div>
  )}

  {/* Analyze button */}
  <button
    onClick={onAnalyzeZone}
    disabled={!selectedLocation || isAnalyzing}
    style={{
      width: '100%',
      padding: '10px',
      backgroundColor: isAnalyzing ? 'rgba(59, 130, 246, 0.5)' : 'var(--primary)',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: !selectedLocation || isAnalyzing ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      opacity: !selectedLocation || isAnalyzing ? 0.6 : 1,
      transition: 'all 0.2s ease'
    }}
  >
    {isAnalyzing ? 'Analyzing...' : 'Analyze Zone'}
  </button>

  {/* Error message */}
  {analysisError && (
    <div
      style={{
        marginTop: '10px',
        padding: '8px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#ef4444'
      }}
    >
      ⚠️ {analysisError}
    </div>
  )}

  {/* Prediction result */}
  {prediction !== null && (
    <div
      style={{
        marginTop: '12px',
        padding: '10px',
        backgroundColor:
          prediction === 1
            ? 'rgba(239, 68, 68, 0.1)'
            : 'rgba(34, 197, 94, 0.1)',
        border:
          prediction === 1
            ? '1px solid rgba(239, 68, 68, 0.3)'
            : '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600'
      }}
    >
      <div
        style={{
          color: prediction === 1 ? '#ef4444' : '#22c55e',
          marginBottom: '4px'
        }}
      >
        {prediction === 1 ? '🔴 HIGH RISK' : '🟢 LOW RISK'}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
        Confidence: {(probability * 100).toFixed(1)}%
      </div>
    </div>
  )}

  {/* Helper text */}
  <div
    style={{
      marginTop: '12px',
      fontSize: '11px',
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    }}
  >
    Click on the map to select a location, then click "Analyze Zone" to
    get ML predictions.
  </div>
</motion.div>
```

---

## 5. RiskPanel.jsx - Enhanced Display Logic

```javascript
export default function RiskPanel({ 
  riskScore = 0, 
  prediction = null, 
  probability = null 
}) {
  // Use prediction-based score if available, otherwise use global risk score
  const displayScore =
    prediction !== null ? Math.round(probability * 100) : riskScore
  
  // ... (rest of component)
  
  return (
    <div className="panel risk-panel">
      <h3 style={{ color: 'var(--text)' }}>
        {prediction !== null ? 'ML Flood Risk' : 'Flood Risk'}
      </h3>
      
      {/* ... SVG circle meter ... */}
      
      {/* Show prediction status */}
      {prediction !== null && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '12px',
            textAlign: 'center',
            color:
              prediction === 1
                ? 'var(--high)'
                : 'var(--low)'
          }}
        >
          {prediction === 1 ? '⚠️ HIGH RISK ZONE' : '✓ LOW RISK ZONE'}
        </div>
      )}
    </div>
  )
}
```

---

## 6. Backend Request/Response Format

### Request Example
```javascript
POST http://127.0.0.1:5000/predict
Content-Type: application/json

{
  "Rainfall": 20,
  "Elevation": 15,
  "Slope": 2,
  "distance": 0.5,
  "Latitude": 28.7041,
  "Longitude": 77.1025
}
```

### Success Response (200 OK)
```json
{
  "prediction": 1,
  "probability": 0.6842159953192577
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Missing fields: ['Rainfall']"
}
```

### Model Status Response
```json
{
  "status": "healthy",
  "model_loaded": true,
  "expected_features": [
    "Rainfall",
    "Elevation",
    "Slope",
    "distance",
    "Latitude",
    "Longitude"
  ]
}
```

---

## 7. State Flow Diagram

```
User Interface Lifecycle:

INITIAL STATE:
  prediction = null
  probability = null
  selectedLocation = null

↓

USER CLICKS ON MAP:
  CesiumViewer.MapClickHandler fires
  ↓
  onLocationSelect(latitude, longitude)
  ↓
  setSelectedLocation({lat, lon})
  ↓
  SIDEBAR SHOWS: "Lat: 28.7041, Lon: 77.1025"
  BUTTON BECOMES: Enabled

↓

USER CLICKS "ANALYZE ZONE":
  setIsAnalyzing(true)
  BUTTON BECOMES: "Analyzing..." (disabled)
  ↓
  analyzeZone() sends POST request
  ↓
  Backend processes prediction
  ↓
  Response received: {prediction: 1, probability: 0.684}
  ↓
  setPrediction(1)
  setProbability(0.684)
  setRiskScore(68)  // Math.round(0.684 * 100)
  setIsAnalyzing(false)
  ↓
  BUTTON BECOMES: "Analyze Zone" (enabled)
  SIDEBAR SHOWS: "🔴 HIGH RISK - Confidence: 68.4%"
  MAP SHOWS: Red circle at selected location
  RISK PANEL SHOWS: "ML Flood Risk - 68% - ⚠️ HIGH RISK ZONE"
```

---

## 8. Error Handling Paths

```
TRY ANALYZE WITHOUT LOCATION:
  ↓
  !selectedLocation check fails
  ↓
  setAnalysisError('Please click on map to select a location')
  ↓
  SIDEBAR SHOWS: Error message in red box

BACKEND RETURNS ERROR:
  ↓
  !response.ok
  ↓
  throw new Error(errorData.error)
  ↓
  setAnalysisError(error.message)
  ↓
  SIDEBAR SHOWS: Error description

NETWORK ERROR:
  ↓
  fetch() throws
  ↓
  catch block fires
  ↓
  setAnalysisError('Failed to analyze zone')
  ↓
  SIDEBAR SHOWS: Generic error message
  CONSOLE: Full error logged
```

---

## Testing Commands

### Start Backend
```bash
cd /Users/zaidzia/Desktop/RippleEffect/RippleEffect_vs/backend
python3 app.py
```

### Start Frontend
```bash
cd /Users/zaidzia/Desktop/RippleEffect/RippleEffect_vs
npm run dev
```

### Test Prediction with curl
```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Rainfall": 20,
    "Elevation": 15,
    "Slope": 2,
    "distance": 0.5,
    "Latitude": 28.7041,
    "Longitude": 77.1025
  }'
```

### Monitor Frontend Logs
```javascript
// In browser DevTools Console
// Look for these logs:
[Frontend] Sending prediction request: {...}
[Frontend] Prediction response: {...}
[Cesium] Map click - Lat: X, Lon: Y
```

### Monitor Backend Logs
```
Terminal showing: cd backend && python3 app.py

Look for:
[REQUEST] POST /predict
[DEBUG] Incoming JSON: {...}
[SUCCESS] Response: {...}
```

---

## Integration Checklist

- [x] State management in App.jsx
- [x] Map click handler in CesiumViewer.jsx
- [x] Coordinate capture and passing to parent
- [x] analyzeZone() function implementation
- [x] Backend POST request with proper payload
- [x] Error handling and validation
- [x] Loading states and user feedback
- [x] Prediction overlay circles on map
- [x] Risk panel updates with ML results
- [x] Sidebar panel with analysis controls
- [x] Console logging for debugging
- [x] CORS enabled on backend
- [x] Git commits made

---

## Performance Notes

- **Map Click Latency:** ~5-10ms (instant)
- **Prediction API Call:** ~100-200ms (RandomForest inference)
- **UI Update:** ~50-100ms (React + animations)
- **Total Time:** ~200-300ms from button click to result

**Optimization Tips:**
- Batch multiple predictions if needed
- Add caching for repeated locations
- Consider WebSocket for real-time updates
- Implement prediction throttling to prevent spam

