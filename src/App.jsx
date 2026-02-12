import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CesiumViewer from './cesium/CesiumViewer'
import Sidebar from './components/Sidebar'
import { calculateRisk } from './ai/riskEngine'
import './styles/global.css'

const BACKEND_URL = 'http://127.0.0.1:5000'

export default function App() {
  const [rainfall, setRainfall] = useState(20)
  const [riskScore, setRiskScore] = useState(0)
  const [showTerrain, setShowTerrain] = useState(true)
  const [showFloodZones, setShowFloodZones] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  
  // ML prediction state
  const [prediction, setPrediction] = useState(null)
  const [probability, setProbability] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)

  // Recalculate risk whenever rainfall changes
  useEffect(() => {
    setRiskScore(calculateRisk(rainfall))
  }, [rainfall])

  /**
   * Analyze selected zone for flood vulnerability
   * Calls Flask backend /predict endpoint with location and features
   */
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

  return (
    <div className="app-container">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        rainfall={rainfall}
        setRainfall={setRainfall}
        riskScore={riskScore}
        showTerrain={showTerrain}
        setShowTerrain={setShowTerrain}
        showFloodZones={showFloodZones}
        setShowFloodZones={setShowFloodZones}
        prediction={prediction}
        probability={probability}
        selectedLocation={selectedLocation}
        isAnalyzing={isAnalyzing}
        analysisError={analysisError}
        onAnalyzeZone={analyzeZone}
      />

      <div className="map-wrapper">
        <div className="map-panel">
          <div className="map-container">
            <CesiumViewer
              rainfall={rainfall}
              riskScore={riskScore}
              showTerrain={showTerrain}
              showFloodZones={showFloodZones}
              prediction={prediction}
              probability={probability}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />

            {/* subtle top gradient overlay for depth */}
            <div className="map-top-gradient" aria-hidden />
          </div>
        </div>

        <motion.section
          className="about-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="about-inner">
            <h2>About RiverTwin AI</h2>
            <p>
              A Web-Based Digital Twin for Urban–River Interaction using LiDAR and AI-driven flood risk
              simulation.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

