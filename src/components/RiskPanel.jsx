import React from 'react'

export default function RiskPanel({ riskScore = 0 }) {
  return (
    <div className="panel">
      <h3>Flood Risk Score</h3>
      <div className="risk-score">{riskScore}</div>
    </div>
  )
}
