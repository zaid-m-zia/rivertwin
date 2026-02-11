import React from 'react'
import RainfallSlider from './RainfallSlider'
import RiskPanel from './RiskPanel'
import LayerToggle from './LayerToggle'

export default function Sidebar({
  rainfall,
  setRainfall,
  riskScore,
  showTerrain,
  setShowTerrain,
  showFloodZones,
  setShowFloodZones
}) {
  return (
    <aside className="sidebar">
      <h2>RiverTwin AI</h2>
      <RainfallSlider value={rainfall} onChange={setRainfall} />
      <RiskPanel riskScore={riskScore} />
      <LayerToggle
        showTerrain={showTerrain}
        setShowTerrain={setShowTerrain}
        showFloodZones={showFloodZones}
        setShowFloodZones={setShowFloodZones}
      />
    </aside>
  )
}
