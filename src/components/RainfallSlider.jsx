import React from 'react'

export default function RainfallSlider({ value = 20, onChange = () => {} }) {
  return (
    <div className="panel">
      <label>Rainfall Intensity: {value} mm/hr</label>
      <input
        type="range"
        min="0"
        max="200"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
