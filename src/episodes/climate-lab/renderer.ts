/**
 * Climate Lab — Canvas rendering for Earth climate visualization.
 *
 * Renders a visual representation of Earth's climate state:
 * - Temperature-driven color gradients
 * - Ice coverage at poles
 * - Atmosphere thickness based on CO2
 * - Energy balance indicators
 */

import type { ClimateState } from './types.ts'
import type { ParamValues } from '@/engine/types.ts'

/**
 * Convert temperature to a color representing hot/cold.
 * Blue (cold) → Green (baseline) → Yellow (warm) → Red (hot)
 */
function temperatureToColor(tempC: number): string {
  // Normalize temperature to color range
  // -20°C = blue, 0°C = green, +20°C = yellow, +40°C+ = red
  const normalized = Math.max(-20, Math.min(60, tempC))

  if (normalized <= -10) {
    // Deep cold: blue to light blue
    const intensity = Math.max(0, (normalized + 20) / 10)
    return `hsl(220, 100%, ${20 + intensity * 30}%)`
  } else if (normalized <= 0) {
    // Cold to baseline: blue to green
    const progress = (normalized + 10) / 10
    const hue = 220 + progress * (120 - 220) // Blue to green
    return `hsl(${hue}, 70%, 40%)`
  } else if (normalized <= 15) {
    // Baseline to warm: green to yellow
    const progress = normalized / 15
    const hue = 120 + progress * (60 - 120) // Green to yellow
    return `hsl(${hue}, 70%, 50%)`
  } else if (normalized <= 35) {
    // Warm to hot: yellow to orange
    const progress = (normalized - 15) / 20
    const hue = 60 - progress * 30 // Yellow to orange
    return `hsl(${hue}, 80%, 55%)`
  } else {
    // Very hot: orange to red
    const progress = Math.min(1, (normalized - 35) / 25)
    const hue = 30 - progress * 30 // Orange to red
    return `hsl(${hue}, 90%, 50%)`
  }
}

/**
 * Draw Earth with temperature-based coloring and ice caps.
 */
function drawEarth(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  state: ClimateState,
) {
  // Draw main Earth body with temperature color
  const earthColor = temperatureToColor(state.temperature)
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.fillStyle = earthColor
  ctx.fill()

  // Draw ice caps if ice extent > 0.2
  if (state.iceExtent > 0.2) {
    const iceRadius = radius * state.iceExtent * 0.8
    ctx.fillStyle = 'white'

    // North pole ice cap
    ctx.beginPath()
    ctx.arc(centerX, centerY - radius * 0.7, iceRadius, 0, 2 * Math.PI)
    ctx.fill()

    // South pole ice cap
    ctx.beginPath()
    ctx.arc(centerX, centerY + radius * 0.7, iceRadius, 0, 2 * Math.PI)
    ctx.fill()
  }

  // Draw continent outlines for visual reference
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.stroke()
}

/**
 * Draw atmosphere layer around Earth.
 */
function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  state: ClimateState,
) {
  const atmosphereRadius = radius + state.atmosphereThickness * 30
  const opacity = 0.2 + state.atmosphereThickness * 0.3

  // Create gradient for atmosphere
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius,
    centerX,
    centerY,
    atmosphereRadius,
  )
  gradient.addColorStop(0, `rgba(135, 206, 250, ${opacity})`) // Sky blue
  gradient.addColorStop(1, 'rgba(135, 206, 250, 0)')

  ctx.beginPath()
  ctx.arc(centerX, centerY, atmosphereRadius, 0, 2 * Math.PI)
  ctx.fillStyle = gradient
  ctx.fill()
}

/**
 * Draw energy balance arrows and indicators.
 */
function drawEnergyIndicators(
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  state: ClimateState,
) {
  const margin = 20
  const arrowLength = 60

  // Energy in arrow (from sun)
  if (state.energyIn > 0) {
    const energyInColor = 'gold'
    const thickness = Math.max(2, Math.min(10, state.energyIn / 50))

    ctx.strokeStyle = energyInColor
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.moveTo(margin, margin)
    ctx.lineTo(margin + arrowLength, margin)

    // Arrow head
    ctx.lineTo(margin + arrowLength - 10, margin - 5)
    ctx.moveTo(margin + arrowLength, margin)
    ctx.lineTo(margin + arrowLength - 10, margin + 5)
    ctx.stroke()

    // Label
    ctx.fillStyle = energyInColor
    ctx.font = '12px monospace'
    ctx.fillText(`Energy In: ${state.energyIn.toFixed(1)} W/m²`, margin, margin + 20)
  }

  // Energy out arrow (to space)
  if (state.energyOut > 0) {
    const energyOutColor = 'purple'
    const thickness = Math.max(2, Math.min(10, state.energyOut / 50))
    const startX = width - margin - arrowLength
    const y = margin

    ctx.strokeStyle = energyOutColor
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(startX + arrowLength, y)

    // Arrow head
    ctx.lineTo(startX + arrowLength - 10, y - 5)
    ctx.moveTo(startX + arrowLength, y)
    ctx.lineTo(startX + arrowLength - 10, y + 5)
    ctx.stroke()

    // Label
    ctx.fillStyle = energyOutColor
    ctx.font = '12px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`Energy Out: ${state.energyOut.toFixed(1)} W/m²`, width - margin, margin + 20)
    ctx.textAlign = 'left' // Reset
  }
}

/**
 * Draw temperature and other key metrics.
 */
function drawMetrics(
  ctx: CanvasRenderingContext2D,
  _width: number,
  height: number,
  state: ClimateState,
) {
  const margin = 20
  const lineHeight = 20
  let y = height - margin - lineHeight * 4

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px monospace'
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 3

  // Temperature (most important)
  const tempText = `Temperature: ${(state.temperature + state.baselineTemperature).toFixed(1)}°C (${state.temperature > 0 ? '+' : ''}${state.temperature.toFixed(1)}°C)`
  ctx.strokeText(tempText, margin, y)
  ctx.fillText(tempText, margin, y)
  y += lineHeight

  // Energy balance
  const balanceColor = Math.abs(state.energyBalance) <= 0.5 ? 'lightgreen' : 'orange'
  ctx.fillStyle = balanceColor
  const balanceText = `Energy Balance: ${state.energyBalance > 0 ? '+' : ''}${state.energyBalance.toFixed(1)} W/m²`
  ctx.strokeText(balanceText, margin, y)
  ctx.fillText(balanceText, margin, y)
  y += lineHeight

  // CO2 level
  ctx.fillStyle = 'lightblue'
  const co2Text = `CO₂: ${state.co2Concentration.toFixed(0)} ppm`
  ctx.strokeText(co2Text, margin, y)
  ctx.fillText(co2Text, margin, y)
  y += lineHeight

  // Ice coverage
  ctx.fillStyle = 'white'
  const iceText = `Ice Coverage: ${(state.iceExtent * 100).toFixed(0)}%`
  ctx.strokeText(iceText, margin, y)
  ctx.fillText(iceText, margin, y)
}

/**
 * Main render function for Climate Lab.
 */
export function renderClimateLab(
  ctx: CanvasRenderingContext2D,
  state: ClimateState,
  _params: ParamValues,
  width: number,
  height: number,
): void {
  // Clear canvas with space background
  ctx.fillStyle = '#000011'
  ctx.fillRect(0, 0, width, height)

  // Calculate Earth position and size
  const earthRadius = Math.min(width, height) * 0.2
  const centerX = width / 2
  const centerY = height / 2

  // Draw atmosphere first (behind Earth)
  drawAtmosphere(ctx, centerX, centerY, earthRadius, state)

  // Draw Earth with temperature coloring and ice
  drawEarth(ctx, centerX, centerY, earthRadius, state)

  // Draw energy flow indicators
  drawEnergyIndicators(ctx, width, height, state)

  // Draw temperature and metrics
  drawMetrics(ctx, width, height, state)

  // Draw step counter
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '12px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`Step: ${state.step}`, width - 20, 30)
  ctx.textAlign = 'left' // Reset alignment
}
