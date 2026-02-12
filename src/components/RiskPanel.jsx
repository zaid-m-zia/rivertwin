import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function RiskPanel({ riskScore = 0, prediction = null, probability = null }) {
  const radius = 48
  const stroke = 10

  // Use prediction-based score if available, otherwise use global risk score
  const displayScore =
    prediction !== null ? Math.round(probability * 100) : riskScore
  const normalized = Math.max(0, Math.min(100, displayScore)) / 100
  const circumference = 2 * Math.PI * radius
  const [display, setDisplay] = useState(0)
  const progressRef = useRef(0)

  // Animate numeric counter smoothly
  useEffect(() => {
    const start = progressRef.current || 0
    const end = displayScore
    const duration = 700
    const startTime = performance.now()
    let raf = null

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration)
      const val = Math.round(start + (end - start) * t)
      setDisplay(val)
      if (t < 1) raf = requestAnimationFrame(step)
      else progressRef.current = end
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [displayScore])

  const dashOffset = circumference * (1 - normalized)

  // choose color based on thresholds (use strict theme)
  let color = 'var(--low)'
  if (displayScore >= 70) color = 'var(--high)'
  else if (displayScore >= 40) color = 'var(--med)'

  return (
    <div className="panel risk-panel">
      <h3 style={{ color: 'var(--text)' }}>
        {prediction !== null ? 'ML Flood Risk' : 'Flood Risk'}
      </h3>
      <div className="risk-meter">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g transform="translate(60,60)">
            <circle
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={stroke}
            />
            <motion.circle
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ filter: 'url(#glow)' }}
              transform="rotate(-90)"
            />
            <text
              x="0"
              y="6"
              textAnchor="middle"
              className="risk-number"
              style={{ fill: 'var(--text)' }}
            >
              {display}%
            </text>
          </g>
        </svg>
      </div>

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
