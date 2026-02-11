import React, { useState, useEffect } from 'react'
import CesiumViewer from './cesium/CesiumViewer'
import Sidebar from './components/Sidebar'
import { calculateRisk } from './ai/riskEngine'
import './styles/app.css'

export default function App() {
  const [rainfall, setRainfall] = useState(20)
  const [riskScore, setRiskScore] = useState(0)
  const [showTerrain, setShowTerrain] = useState(true)
  const [showFloodZones, setShowFloodZones] = useState(true)

  // Recalculate risk whenever rainfall changes
  useEffect(() => {
    const score = calculateRisk(rainfall)
    setRiskScore(score)
  }, [rainfall])

  return (
    <div className="app-root">
      <Sidebar
        rainfall={rainfall}
        setRainfall={setRainfall}
        riskScore={riskScore}
        showTerrain={showTerrain}
        setShowTerrain={setShowTerrain}
        showFloodZones={showFloodZones}
        setShowFloodZones={setShowFloodZones}
      />

      <main className="viewer-area">
        <CesiumViewer
          rainfall={rainfall}
          riskScore={riskScore}
          showTerrain={showTerrain}
          showFloodZones={showFloodZones}
        />
      </main>
    </div>
  )
}
