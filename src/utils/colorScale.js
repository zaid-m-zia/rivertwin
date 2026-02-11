// Simple color scale utility: value 0-100 -> hex color
export function heatColor(value) {
  const v = Math.max(0, Math.min(100, value)) / 100
  const r = Math.round(255 * Math.min(1, 2 * v))
  const g = Math.round(255 * Math.min(1, 2 * (1 - v)))
  const b = 0
  return `rgb(${r},${g},${b})`
}
