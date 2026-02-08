/**
 * Canvas rendering for the Orbit Lab episode.
 *
 * Uses a fixed base scale (planet always visible) with user-controlled
 * zoom and pan. Draws altitude reference grid, speed-coded trail,
 * twinkling stars, apogee/perigee markers, and telemetry HUD.
 */

import { EARTH_RADIUS } from './physics.ts'
import type { OrbitalState } from './physics.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SATELLITE_MIN_RADIUS = 4
const SATELLITE_GLOW_MULTIPLIER = 3
const VECTOR_SCALE = 0.00004
const TRAIL_LINE_WIDTH = 1.5

/** Altitude grid rings: [altitude in meters, label, color, lineWidth] */
const GRID_RINGS: Array<[number, string, string, number]> = [
  [0, 'Surface', 'rgba(100,180,255,0.12)', 1],
  [100_000, 'Atmo', 'rgba(255,255,255,0.04)', 0.5],
  [400_000, 'LEO', 'rgba(255,255,255,0.04)', 0.5],
  [1_000_000, '1000km', 'rgba(255,255,255,0.04)', 0.5],
  [2_000_000, '2000km', 'rgba(255,255,255,0.04)', 0.5],
  [5_000_000, '5000km', 'rgba(255,255,255,0.04)', 0.5],
  [35_786_000, 'GEO', 'rgba(255,255,255,0.04)', 0.5],
]

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  background: '#070b14',
  planet: '#2563eb',
  planetGlow: 'rgba(37, 99, 235, 0.15)',
  planetAtmosphere: 'rgba(100, 180, 255, 0.08)',
  surfaceRing: 'rgba(100, 180, 255, 0.25)',
  satellite: '#f59e0b',
  satelliteGlow: 'rgba(245, 158, 11, 0.6)',
  velocityVector: '#22c55e',
  gravityVector: '#ef4444',
  crashFlash: 'rgba(239, 68, 68, 0.3)',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  accent: '#00e5ff',
} as const

// ---------------------------------------------------------------------------
// Module-level camera state (persists across frames)
// ---------------------------------------------------------------------------

let _zoom = 1
let _camX = 0
let _camY = 0
let _dragging = false
let _dragStartX = 0
let _dragStartY = 0
let _camStartX = 0
let _camStartY = 0
let _attachedCanvas: HTMLCanvasElement | null = null

// Deterministic star field (generated once)
const _stars: Array<{
  x: number
  y: number
  r: number
  brightness: number
  speed: number
  phase: number
}> = []

function ensureStars(): void {
  if (_stars.length > 0) return
  for (let i = 0; i < 140; i++) {
    _stars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.1,
      brightness: 0.3 + Math.random() * 0.7,
      speed: 0.5 + Math.random() * 2,
      phase: Math.random() * 6.28,
    })
  }
}

/** Reset camera state (called on episode reset). */
export function resetOrbitLabCamera(): void {
  _zoom = 1
  _camX = 0
  _camY = 0
}

// ---------------------------------------------------------------------------
// Event listeners — lazily attached to canvas
// ---------------------------------------------------------------------------

function attachInteractions(canvas: HTMLCanvasElement): void {
  if (_attachedCanvas === canvas) return
  detachInteractions()
  _attachedCanvas = canvas

  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  // Touch pan
  canvas.addEventListener('touchstart', onTouchStart, { passive: false })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd)
}

function detachInteractions(): void {
  if (!_attachedCanvas) return
  _attachedCanvas.removeEventListener('wheel', onWheel)
  _attachedCanvas.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  _attachedCanvas.removeEventListener('touchstart', onTouchStart)
  _attachedCanvas.removeEventListener('touchmove', onTouchMove)
  _attachedCanvas.removeEventListener('touchend', onTouchEnd)
  _attachedCanvas = null
}

function onWheel(e: WheelEvent): void {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
  _zoom = Math.max(0.05, Math.min(50, _zoom * factor))
}

function onMouseDown(e: MouseEvent): void {
  _dragging = true
  _dragStartX = e.clientX
  _dragStartY = e.clientY
  _camStartX = _camX
  _camStartY = _camY
}

function onMouseMove(e: MouseEvent): void {
  if (!_dragging || !_attachedCanvas) return
  const w = _attachedCanvas.clientWidth
  const h = _attachedCanvas.clientHeight
  const bsc = Math.min(w, h) / (EARTH_RADIUS * 6)
  const sc = bsc * _zoom
  _camX = _camStartX + (e.clientX - _dragStartX) / sc
  _camY = _camStartY - (e.clientY - _dragStartY) / sc
}

function onMouseUp(): void {
  _dragging = false
}

let _lastTouchDist = 0

function onTouchStart(e: TouchEvent): void {
  if (e.touches.length === 1) {
    _dragging = true
    _dragStartX = e.touches[0]!.clientX
    _dragStartY = e.touches[0]!.clientY
    _camStartX = _camX
    _camStartY = _camY
  } else if (e.touches.length === 2) {
    _lastTouchDist = Math.hypot(
      e.touches[0]!.clientX - e.touches[1]!.clientX,
      e.touches[0]!.clientY - e.touches[1]!.clientY,
    )
  }
}

function onTouchMove(e: TouchEvent): void {
  e.preventDefault()
  if (e.touches.length === 1 && _dragging && _attachedCanvas) {
    const w = _attachedCanvas.clientWidth
    const h = _attachedCanvas.clientHeight
    const bsc = Math.min(w, h) / (EARTH_RADIUS * 6)
    const sc = bsc * _zoom
    _camX = _camStartX + (e.touches[0]!.clientX - _dragStartX) / sc
    _camY = _camStartY - (e.touches[0]!.clientY - _dragStartY) / sc
  } else if (e.touches.length === 2 && _lastTouchDist > 0) {
    const dist = Math.hypot(
      e.touches[0]!.clientX - e.touches[1]!.clientX,
      e.touches[0]!.clientY - e.touches[1]!.clientY,
    )
    const factor = dist / _lastTouchDist
    _zoom = Math.max(0.05, Math.min(50, _zoom * factor))
    _lastTouchDist = dist
  }
}

function onTouchEnd(): void {
  _dragging = false
  _lastTouchDist = 0
}

// ---------------------------------------------------------------------------
// Coordinate Transforms (fixed base scale)
// ---------------------------------------------------------------------------

interface ViewTransform {
  readonly scale: number
  readonly offsetX: number
  readonly offsetY: number
  readonly planetScreenRadius: number
}

function computeViewTransform(
  state: OrbitalState,
  width: number,
  height: number,
  follow: boolean,
): ViewTransform {
  // Follow mode: camera tracks satellite
  if (follow && !state.crashed) {
    _camX = -state.satellite.x
    _camY = -state.satellite.y
  }

  // Fixed base scale: planet radius * 3 on each side of center
  const bsc = Math.min(width, height) / (state.planet.radius * 6)
  const scale = bsc * _zoom

  return {
    scale,
    offsetX: width / 2 + _camX * scale,
    offsetY: height / 2 - _camY * scale, // flip Y
    planetScreenRadius: state.planet.radius * scale,
  }
}

function worldToScreen(
  wx: number,
  wy: number,
  transform: ViewTransform,
): { sx: number; sy: number } {
  return {
    sx: transform.offsetX + wx * transform.scale,
    sy: transform.offsetY - wy * transform.scale,
  }
}

// ---------------------------------------------------------------------------
// Drawing Functions
// ---------------------------------------------------------------------------

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // Twinkling stars
  ensureStars()
  const t = performance.now() / 1000
  for (const star of _stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(t * star.speed + star.phase)
    ctx.globalAlpha = star.brightness * (0.6 + 0.4 * twinkle)
    ctx.fillStyle = '#cde'
    ctx.fillRect(star.x * width, star.y * height, star.r, star.r)
  }
  ctx.globalAlpha = 1
}

function drawAltitudeGrid(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  const center = worldToScreen(state.planet.x, state.planet.y, transform)

  ctx.font = '9px monospace'
  ctx.textAlign = 'left'

  for (const [alt, label, color, lineWidth] of GRID_RINGS) {
    const radius = (state.planet.radius + alt) * transform.scale
    if (radius < 5) continue

    ctx.beginPath()
    ctx.arc(center.sx, center.sy, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    if (alt > 0) ctx.setLineDash([4, 8])
    ctx.stroke()
    ctx.setLineDash([])

    if (radius > 30) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.fillText(label, center.sx + radius + 4, center.sy - 2)
    }
  }
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  const { planet } = state
  const center = worldToScreen(planet.x, planet.y, transform)
  const displayRadius = transform.planetScreenRadius

  // Atmosphere glow (outer)
  const atmoRadius = (planet.radius + 300_000) * transform.scale
  const atmosphereGradient = ctx.createRadialGradient(
    center.sx,
    center.sy,
    displayRadius * 0.8,
    center.sx,
    center.sy,
    atmoRadius,
  )
  atmosphereGradient.addColorStop(0, 'rgba(60,160,255,0)')
  atmosphereGradient.addColorStop(0.5, 'rgba(60,160,255,0.04)')
  atmosphereGradient.addColorStop(1, 'rgba(60,160,255,0)')
  ctx.fillStyle = atmosphereGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, atmoRadius, 0, 2 * Math.PI)
  ctx.fill()

  // Planet body with gradient
  const bodyGradient = ctx.createRadialGradient(
    center.sx - displayRadius * 0.3,
    center.sy - displayRadius * 0.3,
    0,
    center.sx,
    center.sy,
    displayRadius,
  )
  bodyGradient.addColorStop(0, '#2196F3')
  bodyGradient.addColorStop(0.5, '#1565C0')
  bodyGradient.addColorStop(1, '#0a2744')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
  ctx.fill()

  // Thin atmosphere ring at planet's edge
  const atmoEdge = (planet.radius + 100_000) * transform.scale
  const edgeGradient = ctx.createRadialGradient(
    center.sx,
    center.sy,
    displayRadius - 1,
    center.sx,
    center.sy,
    atmoEdge,
  )
  edgeGradient.addColorStop(0, 'rgba(100,200,255,0.15)')
  edgeGradient.addColorStop(1, 'rgba(100,200,255,0)')
  ctx.fillStyle = edgeGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, atmoEdge, 0, 2 * Math.PI)
  ctx.fill()
}

/**
 * Interpolate between blue (slow) and red (fast) based on a 0-1 factor.
 * 0 = blue (#3b82f6), 1 = red (#ef4444).
 */
function speedColor(t: number): { r: number; g: number; b: number } {
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

  const drawMarker = (idx: number, label: string) => {
    const pt = trail[idx]!
    const pos = worldToScreen(pt.x, pt.y, transform)

    ctx.fillStyle = ACCENT
    ctx.beginPath()
    ctx.moveTo(pos.sx, pos.sy - MARKER_SIZE)
    ctx.lineTo(pos.sx + MARKER_SIZE, pos.sy)
    ctx.lineTo(pos.sx, pos.sy + MARKER_SIZE)
    ctx.lineTo(pos.sx - MARKER_SIZE, pos.sy)
    ctx.closePath()
    ctx.fill()

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

  // Glow halo
  ctx.beginPath()
  ctx.arc(pos.sx, pos.sy, 9, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(0,229,255,0.25)'
  ctx.fill()

  // Body (bright white dot like POC)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(pos.sx, pos.sy, radius, 0, 2 * Math.PI)
  ctx.fill()

  // Direction indicator
  const speed = Math.sqrt(satellite.vx * satellite.vx + satellite.vy * satellite.vy)
  if (speed > 0) {
    const dirX = satellite.vx / speed
    const dirY = satellite.vy / speed
    ctx.strokeStyle = COLORS.satellite
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pos.sx, pos.sy)
    ctx.lineTo(pos.sx + dirX * glowRadius, pos.sy - dirY * glowRadius)
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
  const toSy = from.sy - dirY * len

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(from.sx, from.sy)
  ctx.lineTo(toSx, toSy)
  ctx.stroke()

  const headLen = 8
  const headAngle = Math.PI / 6
  const angle = Math.atan2(-dirY, dirX)

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

  drawVector(
    ctx,
    satellite.x,
    satellite.y,
    satellite.vx,
    satellite.vy,
    COLORS.velocityVector,
    transform,
  )

  const dx = planet.x - satellite.x
  const dy = planet.y - satellite.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist > 0) {
    const forceMag = (6.674e-11 * planet.mass) / (dist * dist)
    const fx = forceMag * (dx / dist)
    const fy = forceMag * (dy / dist)

    drawVector(ctx, satellite.x, satellite.y, fx * 1e6, fy * 1e6, COLORS.gravityVector, transform)
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

  const lines: Array<{ text: string; color?: string }> = [
    { text: `Alt: ${(altitude / 1000).toFixed(1)} km` },
    { text: `Vel: ${speed.toFixed(0)} m/s` },
    { text: `Orbits: ${state.orbitsCompleted}` },
    { text: `Time: ${state.simTime.toFixed(1)} s` },
  ]

  if (state.orbitalPeriod > 0 && !state.escaped) {
    lines.push({ text: `Period: ${(state.orbitalPeriod / 60).toFixed(1)} min` })
  }

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

function drawZoomControls(ctx: CanvasRenderingContext2D, height: number): void {
  ctx.font = '9px monospace'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText(`${_zoom.toFixed(1)}x  Scroll to zoom \u00B7 Drag to pan`, 16, height - 12)
}

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

export function renderOrbitLab(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  params: Record<string, unknown>,
  width: number,
  height: number,
): void {
  // Lazily attach interaction listeners
  attachInteractions(ctx.canvas)

  const showTrail = (params['show-trail'] as boolean | undefined) ?? true
  const showVectors = (params['show-vectors'] as boolean | undefined) ?? false
  const showMetrics = (params['show-metrics'] as boolean | undefined) ?? true
  const showGrid = (params['show-grid'] as boolean | undefined) ?? true
  const follow = (params['follow'] as boolean | undefined) ?? false

  const transform = computeViewTransform(state, width, height, follow)

  // 1. Background + stars
  drawBackground(ctx, width, height)

  // 2. Altitude grid (behind everything)
  if (showGrid) {
    drawAltitudeGrid(ctx, state, transform)
  }

  // 3. Trail
  if (showTrail) {
    drawTrail(ctx, state, transform)
  }

  // 4. Apogee/perigee markers
  if (showTrail) {
    drawApseMarkers(ctx, state, transform)
  }

  // 5. Planet
  drawPlanet(ctx, state, transform)

  // 6. Satellite
  drawSatellite(ctx, state, transform)

  // 7. Vectors
  if (showVectors) {
    drawVectors(ctx, state, transform)
  }

  // 8. Crash effect
  if (state.crashed) {
    drawCrashEffect(ctx, width, height)
  }

  // 9. HUD
  drawHud(ctx, state, width, showMetrics)

  // 10. Zoom info
  drawZoomControls(ctx, height)
}
