// Simple risk engine for hackathon scaffolding
export function calculateRisk(rainfall) {
  const baseRisk = 30
  let risk = baseRisk + rainfall * 0.8
  if (risk > 100) risk = 100
  if (risk < 0) risk = 0
  return Math.round(risk)
}
