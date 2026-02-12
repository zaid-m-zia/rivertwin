import React from 'react'
import { motion } from 'framer-motion'
import RainfallSlider from './RainfallSlider'
import RiskPanel from './RiskPanel'
import LayerToggle from './LayerToggle'

export default function Sidebar({
  collapsed = false,
  onToggleCollapsed = () => {},
  rainfall,
  setRainfall,
  riskScore,
  showTerrain,
  setShowTerrain,
  showFloodZones,
  setShowFloodZones,
  prediction,
  probability,
  selectedLocation,
  isAnalyzing,
  analysisError,
  onAnalyzeZone
}) {
  const width = collapsed ? 72 : 320

  return (
    <motion.aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      initial={false}
      animate={{ width }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      aria-expanded={!collapsed}
    >
      <div className="sidebar-top">
        <button
          className="collapse-btn"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={collapsed}
        >
          {collapsed ? '»' : '«'}
        </button>
        {!collapsed && (
          <motion.h1
            className="title"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            RiverTwin
          </motion.h1>
        )}
      </div>

      <div className="sidebar-content" aria-hidden={collapsed}>
        <motion.div whileHover={{ y: -4 }} className="panel">
          <RainfallSlider value={rainfall} onChange={setRainfall} />
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="panel">
          <RiskPanel
            riskScore={riskScore}
            prediction={prediction}
            probability={probability}
          />
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="panel">
          <LayerToggle
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
            showFloodZones={showFloodZones}
            setShowFloodZones={setShowFloodZones}
          />
        </motion.div>

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
            onMouseEnter={(e) => {
              if (selectedLocation && !isAnalyzing) {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--primary)'
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
      </div>
    </motion.aside>
  )
