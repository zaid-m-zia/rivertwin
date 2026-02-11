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
  setShowFloodZones
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
          <RiskPanel riskScore={riskScore} />
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="panel">
          <LayerToggle
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
            showFloodZones={showFloodZones}
            setShowFloodZones={setShowFloodZones}
          />
        </motion.div>
      </div>
    </motion.aside>
  )
}
