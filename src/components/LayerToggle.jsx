import React from 'react'

export default function LayerToggle({
  showTerrain = true,
  setShowTerrain = () => {},
  showFloodZones = true,
  setShowFloodZones = () => {}
}) {
  return (
    <div className="panel">
      <h3>Layers</h3>
      <label>
        <input
          type="checkbox"
          checked={showTerrain}
          onChange={() => setShowTerrain((v) => !v)}
        />
        Terrain
      </label>
      <label>
        <input
          type="checkbox"
          checked={showFloodZones}
          onChange={() => setShowFloodZones((v) => !v)}
        />
        Flood Zones
      </label>
    </div>
  )
}
