import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CesiumViewer from './cesium/CesiumViewer'
import Sidebar from './components/Sidebar'
import { calculateRisk } from './ai/riskEngine'
import './styles/global.css'

export default function App() {
  const [rainfall, setRainfall] = useState(20)
  const [riskScore, setRiskScore] = useState(0)
  const [showTerrain, setShowTerrain] = useState(true)
  const [showFloodZones, setShowFloodZones] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  // Recalculate risk whenever rainfall changes
  useEffect(() => {
    setRiskScore(calculateRisk(rainfall))
  }, [rainfall])

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
      />

      <div className="map-wrapper">
        <div className="map-panel">
          <div className="map-container">
            <CesiumViewer
              rainfall={rainfall}
              riskScore={riskScore}
              showTerrain={showTerrain}
              showFloodZones={showFloodZones}
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

