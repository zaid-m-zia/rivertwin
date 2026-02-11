// Simple placeholder AI logic for flood risk calculation
export function calculateRisk({ rainfall, elevation, distanceToRiver }) {
  // Dummy heuristic: higher rainfall and lower elevation increases risk
  const rainFactor = Math.min(rainfall / 200, 1)
  const elevFactor = 1 - Math.min(Math.max(elevation / 1000, 0), 1)
  const distanceFactor = 1 - Math.min(distanceToRiver / 5000, 1)

  const score = Math.round(100 * (0.5 * rainFactor + 0.3 * elevFactor + 0.2 * distanceFactor))
  return Math.max(0, Math.min(100, score))
}
