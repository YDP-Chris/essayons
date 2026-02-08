/**
 * Canvas rendering for the Orbit Lab episode.
 *
 * Draws the planet, satellite, orbit trail, and optional velocity/gravity
 * force vectors. Uses auto-fitting to keep both planet and satellite visible
 * with appropriate padding.
 */

import type { OrbitalState } from './physics.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SATELLITE_MIN_RADIUS = 4
const SATELLITE_GLOW_MULTIPLIER = 3
const VECTOR_SCALE = 0.00004
const TRAIL_LINE_WIDTH = 1.5
const VIEW_PADDING = 1.3

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  background: '#0a0a1a',
  planet: '#2563eb',
  planetGlow: 'rgba(37, 99, 235, 0.15)',
  planetAtmosphere: 'rgba(100, 180, 255, 0.08)',
  surfaceRing: 'rgba(100, 180, 255, 0.25)',
  satellite: '#f59e0b',
  satelliteGlow: 'rgba(245, 158, 11, 0.6)',
  trailStart: 'rgba(245, 158, 11, 0.8)',
  trailEnd: 'rgba(245, 158, 11, 0.0)',
  velocityVector: '#22c55e',
  gravityVector: '#ef4444',
  crashFlash: 'rgba(239, 68, 68, 0.3)',
  text: '#e2e8f0',
  textDim: '#94a3b8',
} as const

// ---------------------------------------------------------------------------
// Coordinate Transforms
// ---------------------------------------------------------------------------

interface ViewTransform {
  readonly scale: number
  readonly offsetX: number
  readonly offsetY: number
  readonly planetScreenRadius: number
}

function computeViewTransform(state: OrbitalState, width: number, height: number): ViewTransform {
  const { satellite, planet, trail } = state

  // Find the max distance from center across trail + current satellite position.
  // This gives a stable view that encompasses the full orbit path so far.
  let maxDist = Math.sqrt(satellite.x * satellite.x + satellite.y * satellite.y)
  for (const point of trail) {
    const d = Math.sqrt(point.x * point.x + point.y * point.y)
    if (d > maxDist) maxDist = d
  }

  // Ensure the planet is always fully visible with a small margin
  maxDist = Math.max(maxDist, planet.radius * 1.05)

  const viewExtent = maxDist * VIEW_PADDING
  const minDimension = Math.min(width, height)
  const scale = minDimension / (2 * viewExtent)

  return {
    scale,
    offsetX: width / 2,
    offsetY: height / 2,
    planetScreenRadius: planet.radius * scale,
  }
}

function worldToScreen(
  wx: number,
  wy: number,
  transform: ViewTransform,
): { sx: number; sy: number } {
  return {
    sx: transform.offsetX + wx * transform.scale,
    sy: transform.offsetY - wy * transform.scale, // flip Y for screen coords
  }
}

// ---------------------------------------------------------------------------
// Drawing Functions
// ---------------------------------------------------------------------------

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // Draw some stars
  const starSeed = 42
  const starCount = 100
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  for (let i = 0; i < starCount; i++) {
    // Deterministic pseudo-random positions using seed
    const px = ((starSeed * (i + 1) * 7919) % 10000) / 10000
    const py = ((starSeed * (i + 1) * 6271) % 10000) / 10000
    const size = ((starSeed * (i + 1) * 3571) % 10000) / 10000
    ctx.beginPath()
    ctx.arc(px * width, py * height, 0.5 + size * 1.5, 0, 2 * Math.PI)
    ctx.fill()
  }
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  const { planet } = state
  const center = worldToScreen(planet.x, planet.y, transform)
  // Use true-scale radius — no artificial minimum
  const displayRadius = transform.planetScreenRadius

  // Atmosphere glow (outer)
  const atmosphereGradient = ctx.createRadialGradient(
    center.sx,
    center.sy,
    displayRadius * 0.9,
    center.sx,
    center.sy,
    displayRadius * 1.3,
  )
  atmosphereGradient.addColorStop(0, COLORS.planetAtmosphere)
  atmosphereGradient.addColorStop(1, 'transparent')
  ctx.fillStyle = atmosphereGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, displayRadius * 1.3, 0, 2 * Math.PI)
  ctx.fill()

  // Planet glow
  const glowGradient = ctx.createRadialGradient(
    center.sx,
    center.sy,
    displayRadius * 0.5,
    center.sx,
    center.sy,
    displayRadius * 1.1,
  )
  glowGradient.addColorStop(0, COLORS.planetGlow)
  glowGradient.addColorStop(1, 'transparent')
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, displayRadius * 1.1, 0, 2 * Math.PI)
  ctx.fill()

  // Planet body with gradient
  const bodyGradient = ctx.createRadialGradient(
    center.sx - displayRadius * 0.3,
    center.sy - displayRadius * 0.3,
    displayRadius * 0.1,
    center.sx,
    center.sy,
    displayRadius,
  )
  bodyGradient.addColorStop(0, '#4a90d9')
  bodyGradient.addColorStop(0.5, COLORS.planet)
  bodyGradient.addColorStop(1, '#1a3a6b')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
  ctx.fill()

  // Surface ring — thin line at the planet's edge for altitude reference
  ctx.strokeStyle = COLORS.surfaceRing
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.setLineDash([])
}

/**
 * Interpolate between blue (slow) and red (fast) based on a 0-1 factor.
 * 0 = blue (#3b82f6), 1 = red (#ef4444).
 */
function speedColor(t: number): { r: number; g: number; b: number } {
  // Blue: rgb(59, 130, 246)  Red: rgb(239, 68, 68)
  return {
    r: Math.round(59 + (239 - 59) * t),
    g: Math.round(130 + (68 - 130) * t),
    b: Math.round(246 + (68 - 246) * t),
  }
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  const { trail } = state
  if (trail.length < 2) return

  // Find min/max speed across trail for color normalization
  let minSpeed = Infinity
  let maxSpeed = -Infinity
  for (const pt of trail) {
    if (pt.speed < minSpeed) minSpeed = pt.speed
    if (pt.speed > maxSpeed) maxSpeed = pt.speed
  }
  const speedRange = maxSpeed - minSpeed

  ctx.lineWidth = TRAIL_LINE_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 1; i < trail.length; i++) {
    const prev = trail[i - 1]!
    const curr = trail[i]!

    const alpha = (i / trail.length) * 0.8
    const t = speedRange > 0 ? (curr.speed - minSpeed) / speedRange : 0.5
    const c = speedColor(t)
    ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`
    ctx.beginPath()

    const p1 = worldToScreen(prev.x, prev.y, transform)
    const p2 = worldToScreen(curr.x, curr.y, transform)
    ctx.moveTo(p1.sx, p1.sy)
    ctx.lineTo(p2.sx, p2.sy)
    ctx.stroke()
  }
}

function drawApseMarkers(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  const { trail, planet } = state
  // Only show markers when at least half an orbit has been swept
  if (Math.abs(state.totalAngle) < Math.PI) return
  if (trail.length < 2) return

  let apogeeIdx = 0
  let perigeeIdx = 0
  let maxDist = -Infinity
  let minDist = Infinity

  for (let i = 0; i < trail.length; i++) {
    const pt = trail[i]!
    const d = Math.sqrt((pt.x - planet.x) ** 2 + (pt.y - planet.y) ** 2)
    if (d > maxDist) {
      maxDist = d
      apogeeIdx = i
    }
    if (d < minDist) {
      minDist = d
      perigeeIdx = i
    }
  }

  const ACCENT = '#00D4AA'
  const MARKER_SIZE = 5

  // Draw diamond marker + label for a given trail point
  const drawMarker = (idx: number, label: string) => {
    const pt = trail[idx]!
    const pos = worldToScreen(pt.x, pt.y, transform)

    // Diamond shape
    ctx.fillStyle = ACCENT
    ctx.beginPath()
    ctx.moveTo(pos.sx, pos.sy - MARKER_SIZE)
    ctx.lineTo(pos.sx + MARKER_SIZE, pos.sy)
    ctx.lineTo(pos.sx, pos.sy + MARKER_SIZE)
    ctx.lineTo(pos.sx - MARKER_SIZE, pos.sy)
    ctx.closePath()
    ctx.fill()

    // Label
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = ACCENT
    ctx.fillText(label, pos.sx, pos.sy - MARKER_SIZE - 4)
  }

  drawMarker(apogeeIdx, 'AP')
  drawMarker(perigeeIdx, 'PE')
}

function drawSatellite(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  if (state.crashed) return

  const { satellite } = state
  const pos = worldToScreen(satellite.x, satellite.y, transform)
  const radius = Math.max(SATELLITE_MIN_RADIUS, 3)
  const glowRadius = radius * SATELLITE_GLOW_MULTIPLIER

  // Glow
  const glowGradient = ctx.createRadialGradient(pos.sx, pos.sy, 0, pos.sx, pos.sy, glowRadius)
  glowGradient.addColorStop(0, COLORS.satelliteGlow)
  glowGradient.addColorStop(1, 'transparent')
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(pos.sx, pos.sy, glowRadius, 0, 2 * Math.PI)
  ctx.fill()

  // Body
  ctx.fillStyle = COLORS.satellite
  ctx.beginPath()
  ctx.arc(pos.sx, pos.sy, radius, 0, 2 * Math.PI)
  ctx.fill()

  // Direction indicator (small line in direction of travel)
  const speed = Math.sqrt(satellite.vx * satellite.vx + satellite.vy * satellite.vy)
  if (speed > 0) {
    const dirX = satellite.vx / speed
    const dirY = satellite.vy / speed
    ctx.strokeStyle = COLORS.satellite
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pos.sx, pos.sy)
    ctx.lineTo(
      pos.sx + dirX * glowRadius,
      pos.sy - dirY * glowRadius, // flip Y
    )
    ctx.stroke()
  }
}

function drawVector(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  vecX: number,
  vecY: number,
  color: string,
  transform: ViewTransform,
): void {
  const from = worldToScreen(fromX, fromY, transform)
  const magnitude = Math.sqrt(vecX * vecX + vecY * vecY)

  if (magnitude < 1e-10) return

  const screenLen = magnitude * VECTOR_SCALE * transform.scale
  const maxLen = 100
  const len = Math.min(screenLen, maxLen)

  const dirX = vecX / magnitude
  const dirY = vecY / magnitude

  const toSx = from.sx + dirX * len
  const toSy = from.sy - dirY * len // flip Y

  // Shaft
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(from.sx, from.sy)
  ctx.lineTo(toSx, toSy)
  ctx.stroke()

  // Arrowhead
  const headLen = 8
  const headAngle = Math.PI / 6
  const angle = Math.atan2(-dirY, dirX) // screen space angle

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(toSx, toSy)
  ctx.lineTo(
    toSx - headLen * Math.cos(angle - headAngle),
    toSy + headLen * Math.sin(angle - headAngle),
  )
  ctx.lineTo(
    toSx - headLen * Math.cos(angle + headAngle),
    toSy + headLen * Math.sin(angle + headAngle),
  )
  ctx.closePath()
  ctx.fill()
}

function drawVectors(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  if (state.crashed || state.escaped) return

  const { satellite, planet } = state

  // Velocity vector
  drawVector(
    ctx,
    satellite.x,
    satellite.y,
    satellite.vx,
    satellite.vy,
    COLORS.velocityVector,
    transform,
  )

  // Gravity force vector (direction toward planet)
  const dx = planet.x - satellite.x
  const dy = planet.y - satellite.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist > 0) {
    const forceMag = (6.674e-11 * planet.mass) / (dist * dist)
    const fx = forceMag * (dx / dist)
    const fy = forceMag * (dy / dist)

    drawVector(
      ctx,
      satellite.x,
      satellite.y,
      fx * 1e6,
      fy * 1e6, // scale up force for visibility
      COLORS.gravityVector,
      transform,
    )
  }
}

function drawCrashEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = COLORS.crashFlash
  ctx.fillRect(0, 0, width, height)
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  width: number,
  showMetrics: boolean,
): void {
  const { satellite, planet } = state
  const dist = Math.sqrt((satellite.x - planet.x) ** 2 + (satellite.y - planet.y) ** 2)
  const altitude = dist - planet.radius
  const speed = Math.sqrt(satellite.vx ** 2 + satellite.vy ** 2)

  ctx.font = '13px monospace'
  ctx.textAlign = 'right'

  // Basic telemetry (always shown)
  const lines: Array<{ text: string; color?: string }> = [
    { text: `Alt: ${(altitude / 1000).toFixed(1)} km` },
    { text: `Vel: ${speed.toFixed(0)} m/s` },
    { text: `Orbits: ${state.orbitsCompleted}` },
    { text: `Time: ${state.simTime.toFixed(1)} s` },
  ]

  if (state.orbitalPeriod > 0 && !state.escaped) {
    lines.push({ text: `Period: ${(state.orbitalPeriod / 60).toFixed(1)} min` })
  }

  // Expanded metrics (when toggle is on)
  if (showMetrics) {
    const isBound = state.specificEnergy < 0 && !state.escaped

    lines.push({
      text: `Ecc: ${isBound ? state.eccentricity.toFixed(4) : '---'}`,
      color: '#00D4AA',
    })
    lines.push({
      text: `Apogee: ${isBound ? (state.apogee / 1000).toFixed(1) + ' km' : '---'}`,
      color: '#00D4AA',
    })
    lines.push({
      text: `Perigee: ${isBound ? (state.perigee / 1000).toFixed(1) + ' km' : '---'}`,
      color: '#00D4AA',
    })
    // Energy in MJ/kg (specific energy / 1e6)
    const energyMJ = state.specificEnergy / 1e6
    const sign = energyMJ >= 0 ? '+' : ''
    lines.push({
      text: `Energy: ${sign}${energyMJ.toFixed(2)} MJ/kg`,
      color: '#00D4AA',
    })
    lines.push({
      text: `Accel: ${state.acceleration.toFixed(2)} m/s\u00B2`,
      color: '#00D4AA',
    })
  }

  if (state.crashed) {
    lines.push({ text: 'STATUS: CRASHED', color: '#ef4444' })
  } else if (state.escaped) {
    lines.push({ text: 'STATUS: ESCAPED', color: '#22c55e' })
  }

  const x = width - 16
  let y = 24

  // Background for readability
  const lineHeight = 18
  const boxHeight = lines.length * lineHeight + 8
  const boxWidth = 220
  ctx.fillStyle = 'rgba(10, 10, 26, 0.7)'
  ctx.fillRect(x - boxWidth, y - 14, boxWidth + 8, boxHeight)

  for (const line of lines) {
    ctx.fillStyle = line.color ?? COLORS.text
    ctx.fillText(line.text, x, y)
    y += lineHeight
  }
}

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

/**
 * Render the complete Orbit Lab scene onto a canvas.
 */
export function renderOrbitLab(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  params: Record<string, unknown>,
  width: number,
  height: number,
): void {
  const transform = computeViewTransform(state, width, height)

  const showTrail = (params['show-trail'] as boolean | undefined) ?? true
  const showVectors = (params['show-vectors'] as boolean | undefined) ?? false
  const showMetrics = (params['show-metrics'] as boolean | undefined) ?? true

  // 1. Background
  drawBackground(ctx, width, height)

  // 2. Trail (behind planet)
  if (showTrail) {
    drawTrail(ctx, state, transform)
  }

  // 3. Apogee/perigee markers (on top of trail, behind planet)
  if (showTrail) {
    drawApseMarkers(ctx, state, transform)
  }

  // 4. Planet
  drawPlanet(ctx, state, transform)

  // 5. Satellite
  drawSatellite(ctx, state, transform)

  // 6. Vectors
  if (showVectors) {
    drawVectors(ctx, state, transform)
  }

  // 7. Crash effect
  if (state.crashed) {
    drawCrashEffect(ctx, width, height)
  }

  // 8. HUD
  drawHud(ctx, state, width, showMetrics)
}
