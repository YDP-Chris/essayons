/**
 * Canvas rendering for the Orbit Lab episode.
 *
 * Uses a fixed base scale (planet always visible) with user-controlled
 * zoom and pan. Draws altitude reference grid, speed-coded trail,
 * twinkling stars, orbit projection, rocket ship, and telemetry HUD.
 */

import { G } from './physics.ts'
import type { OrbitalState } from './physics.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VECTOR_SCALE = 0.00004
const TRAIL_LINE_WIDTH = 1.5
const PROJECTION_STEPS = 360

// ---------------------------------------------------------------------------
// Planet Visual Profiles
// ---------------------------------------------------------------------------

interface PlanetVisual {
  readonly bodyColors: [string, string, string] // gradient: highlight, mid, shadow
  readonly atmoColor: string // atmosphere glow tint
  readonly hasRings: boolean
  readonly hasBands: boolean
  readonly bandColor: string
  readonly hasCraters: boolean
}

const PLANET_VISUALS: Readonly<Record<string, PlanetVisual>> = {
  Moon: {
    bodyColors: ['#d4d4d4', '#a0a0a0', '#606060'],
    atmoColor: 'rgba(200,200,200,0.03)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: true,
  },
  Mars: {
    bodyColors: ['#e8845a', '#c4522a', '#6b2010'],
    atmoColor: 'rgba(230,140,80,0.06)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: false,
  },
  Earth: {
    bodyColors: ['#2196F3', '#1565C0', '#0a2744'],
    atmoColor: 'rgba(60,160,255,0.08)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: false,
  },
  Venus: {
    bodyColors: ['#f5e6b8', '#d4a843', '#8a6b20'],
    atmoColor: 'rgba(245,220,160,0.12)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: false,
  },
  Jupiter: {
    bodyColors: ['#e8c88a', '#c49a5a', '#7a5530'],
    atmoColor: 'rgba(200,160,100,0.06)',
    hasRings: false,
    hasBands: true,
    bandColor: '#b87a40',
    hasCraters: false,
  },
  Saturn: {
    bodyColors: ['#f0d898', '#d4b060', '#8a7030'],
    atmoColor: 'rgba(220,190,120,0.06)',
    hasRings: true,
    hasBands: true,
    bandColor: '#c8a050',
    hasCraters: false,
  },
}

/** Generate altitude grid rings relative to planet radius. */
function computeGridRings(planetRadius: number): Array<[number, string, string, number]> {
  const fmt = (m: number): string => {
    if (m >= 1_000_000) return `${(m / 1_000_000).toFixed(m >= 10_000_000 ? 0 : 1)}k km`
    if (m >= 1_000) return `${(m / 1_000).toFixed(0)} km`
    return `${m.toFixed(0)} m`
  }
  const R = planetRadius
  return [
    [0, 'Surface', 'rgba(100,200,255,0.25)', 1.5],
    [R * 0.015, fmt(R * 0.015), 'rgba(255,255,255,0.10)', 0.5],
    [R * 0.06, fmt(R * 0.06), 'rgba(255,255,255,0.10)', 0.5],
    [R * 0.15, fmt(R * 0.15), 'rgba(255,255,255,0.10)', 0.5],
    [R * 0.5, fmt(R * 0.5), 'rgba(255,255,255,0.10)', 0.5],
    [R * 1.0, fmt(R * 1.0), 'rgba(255,255,255,0.10)', 0.5],
    [R * 3.0, fmt(R * 3.0), 'rgba(255,255,255,0.08)', 0.5],
  ]
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  background: '#070b14',
  planet: '#2563eb',
  planetAtmosphere: 'rgba(100, 180, 255, 0.08)',
  velocityVector: '#22c55e',
  gravityVector: '#ef4444',
  crashFlash: 'rgba(239, 68, 68, 0.3)',
  text: '#e2e8f0',
  projection: 'rgba(255,255,255,0.12)',
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
let _currentPlanetRadius = 6.371e6 // updated each frame from state

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
  const bsc = Math.min(w, h) / (_currentPlanetRadius * 6)
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
    const bsc = Math.min(w, h) / (_currentPlanetRadius * 6)
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
  if (follow && !state.crashed) {
    _camX = -state.satellite.x
    _camY = -state.satellite.y
  }

  const bsc = Math.min(width, height) / (state.planet.radius * 6)
  const scale = bsc * _zoom

  return {
    scale,
    offsetX: width / 2 + _camX * scale,
    offsetY: height / 2 - _camY * scale,
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
  const rings = computeGridRings(state.planet.radius)

  ctx.textAlign = 'left'

  for (const [alt, label, color, lineWidth] of rings) {
    const radius = (state.planet.radius + alt) * transform.scale
    if (radius < 5) continue

    ctx.beginPath()
    ctx.arc(center.sx, center.sy, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    if (alt > 0) ctx.setLineDash([4, 8])
    ctx.stroke()
    ctx.setLineDash([])

    if (radius > 25) {
      // Draw label with background for readability
      ctx.font = '11px monospace'
      const textWidth = ctx.measureText(label).width
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(center.sx + radius + 2, center.sy - 12, textWidth + 6, 16)
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.fillText(label, center.sx + radius + 5, center.sy)
    }
  }
}

// ---------------------------------------------------------------------------
// Orbit Projection — predicted path from current state vectors
// ---------------------------------------------------------------------------

function drawOrbitProjection(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  if (state.crashed || state.escaped) return

  const { satellite, planet } = state
  const mu = G * planet.mass
  const x = satellite.x - planet.x
  const y = satellite.y - planet.y
  const vx = satellite.vx
  const vy = satellite.vy

  const r = Math.sqrt(x * x + y * y)
  const v = Math.sqrt(vx * vx + vy * vy)
  if (r < 1 || v < 1) return

  // Angular momentum (scalar, 2D)
  const h = x * vy - y * vx

  // Semi-latus rectum
  const p = (h * h) / mu
  if (p < 1) return

  // Eccentricity vector
  const ex = (vy * h) / mu - x / r
  const ey = -(vx * h) / mu - y / r
  const e = Math.sqrt(ex * ex + ey * ey)

  // Argument of periapsis (angle of eccentricity vector)
  const omega = Math.atan2(ey, ex)

  // Determine theta range
  let thetaMin: number
  let thetaMax: number

  if (e < 1) {
    // Ellipse: full orbit
    thetaMin = 0
    thetaMax = 2 * Math.PI
  } else {
    // Hyperbola: limited range where r > 0
    const thetaLimit = Math.acos(-1 / e) - 0.01
    thetaMin = -thetaLimit
    thetaMax = thetaLimit
  }

  // Draw the projected conic
  ctx.beginPath()
  ctx.setLineDash([6, 6])
  ctx.strokeStyle = COLORS.projection
  ctx.lineWidth = 1

  let started = false
  for (let i = 0; i <= PROJECTION_STEPS; i++) {
    const theta = thetaMin + ((thetaMax - thetaMin) * i) / PROJECTION_STEPS
    const denom = 1 + e * Math.cos(theta)
    if (denom <= 0.01) continue

    const rTheta = p / denom

    // Skip if orbit goes inside planet (would crash)
    if (rTheta < planet.radius) continue

    // Clip extremely far points (don't draw beyond 15x planet radius)
    if (rTheta > planet.radius * 30) continue

    const wx = rTheta * Math.cos(theta + omega) + planet.x
    const wy = rTheta * Math.sin(theta + omega) + planet.y

    const pt = worldToScreen(wx, wy, transform)

    if (!started) {
      ctx.moveTo(pt.sx, pt.sy)
      started = true
    } else {
      ctx.lineTo(pt.sx, pt.sy)
    }
  }

  ctx.stroke()
  ctx.setLineDash([])
}

// ---------------------------------------------------------------------------
// Planet
// ---------------------------------------------------------------------------

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
  planetName: string,
): void {
  const { planet } = state
  const center = worldToScreen(planet.x, planet.y, transform)
  const displayRadius = transform.planetScreenRadius
  const vis = PLANET_VISUALS[planetName] ?? PLANET_VISUALS['Earth']!

  // Atmosphere glow
  const atmoRadius = displayRadius * 1.15
  const atmosphereGradient = ctx.createRadialGradient(
    center.sx,
    center.sy,
    displayRadius * 0.8,
    center.sx,
    center.sy,
    atmoRadius,
  )
  atmosphereGradient.addColorStop(0, 'rgba(0,0,0,0)')
  atmosphereGradient.addColorStop(0.5, vis.atmoColor)
  atmosphereGradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = atmosphereGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, atmoRadius, 0, 2 * Math.PI)
  ctx.fill()

  // Saturn rings (behind planet body)
  if (vis.hasRings && displayRadius > 4) {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(center.sx, center.sy, displayRadius * 2.2, displayRadius * 0.5, -0.15, 0, Math.PI)
    ctx.strokeStyle = 'rgba(210,190,140,0.35)'
    ctx.lineWidth = Math.max(2, displayRadius * 0.15)
    ctx.stroke()
    // Inner ring
    ctx.beginPath()
    ctx.ellipse(center.sx, center.sy, displayRadius * 1.7, displayRadius * 0.4, -0.15, 0, Math.PI)
    ctx.strokeStyle = 'rgba(190,170,120,0.25)'
    ctx.lineWidth = Math.max(1, displayRadius * 0.08)
    ctx.stroke()
    ctx.restore()
  }

  // Planet body
  const bodyGradient = ctx.createRadialGradient(
    center.sx - displayRadius * 0.3,
    center.sy - displayRadius * 0.3,
    0,
    center.sx,
    center.sy,
    displayRadius,
  )
  bodyGradient.addColorStop(0, vis.bodyColors[0])
  bodyGradient.addColorStop(0.5, vis.bodyColors[1])
  bodyGradient.addColorStop(1, vis.bodyColors[2])
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
  ctx.fill()

  // Jupiter/Saturn horizontal bands
  if (vis.hasBands && displayRadius > 8) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
    ctx.clip()
    const bandCount = 6
    for (let i = 0; i < bandCount; i++) {
      const yOff = ((i / bandCount) * 2 - 1) * displayRadius * 0.9
      const bandH = displayRadius * 0.12
      ctx.fillStyle = i % 2 === 0 ? `rgba(0,0,0,0.12)` : `rgba(255,255,255,0.06)`
      ctx.fillRect(
        center.sx - displayRadius,
        center.sy + yOff - bandH / 2,
        displayRadius * 2,
        bandH,
      )
    }
    ctx.restore()
  }

  // Moon craters
  if (vis.hasCraters && displayRadius > 10) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
    ctx.clip()
    const craters = [
      [0.25, -0.3, 0.12],
      [-0.35, 0.15, 0.08],
      [0.1, 0.35, 0.06],
      [-0.15, -0.2, 0.1],
      [0.4, 0.1, 0.05],
    ]
    for (const [cx, cy, cr] of craters) {
      ctx.beginPath()
      ctx.arc(
        center.sx + cx! * displayRadius,
        center.sy + cy! * displayRadius,
        cr! * displayRadius,
        0,
        2 * Math.PI,
      )
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
    ctx.restore()
  }

  // Earth continents (green landmasses)
  if (planetName === 'Earth' && displayRadius > 10) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
    ctx.clip()
    const landmasses = [
      [-0.1, -0.25, 0.22, 0.18],
      [0.2, -0.05, 0.15, 0.12],
      [-0.3, 0.15, 0.18, 0.1],
      [0.35, 0.25, 0.1, 0.1],
    ]
    for (const [lx, ly, lw, lh] of landmasses) {
      ctx.beginPath()
      ctx.ellipse(
        center.sx + lx! * displayRadius,
        center.sy + ly! * displayRadius,
        lw! * displayRadius,
        lh! * displayRadius,
        0.3,
        0,
        2 * Math.PI,
      )
      ctx.fillStyle = 'rgba(34,139,34,0.25)'
      ctx.fill()
    }
    // Cloud wisps
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(
      center.sx + displayRadius * 0.15,
      center.sy - displayRadius * 0.1,
      displayRadius * 0.35,
      displayRadius * 0.06,
      0.2,
      0,
      2 * Math.PI,
    )
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(
      center.sx - displayRadius * 0.2,
      center.sy + displayRadius * 0.3,
      displayRadius * 0.25,
      displayRadius * 0.05,
      -0.3,
      0,
      2 * Math.PI,
    )
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.restore()
  }

  // Venus thick atmosphere swirl
  if (planetName === 'Venus' && displayRadius > 10) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
    ctx.clip()
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#fff'
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.ellipse(
        center.sx + Math.sin(i * 1.5) * displayRadius * 0.3,
        center.sy + (i / 4 - 0.5) * displayRadius * 1.2,
        displayRadius * 0.6,
        displayRadius * 0.08,
        i * 0.2,
        0,
        2 * Math.PI,
      )
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  // Mars polar ice caps
  if (planetName === 'Mars' && displayRadius > 10) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
    ctx.clip()
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.beginPath()
    ctx.ellipse(
      center.sx,
      center.sy - displayRadius * 0.85,
      displayRadius * 0.35,
      displayRadius * 0.12,
      0,
      0,
      2 * Math.PI,
    )
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(
      center.sx,
      center.sy + displayRadius * 0.88,
      displayRadius * 0.28,
      displayRadius * 0.09,
      0,
      0,
      2 * Math.PI,
    )
    ctx.fill()
    ctx.restore()
  }

  // Saturn rings (in front of planet body — top half)
  if (vis.hasRings && displayRadius > 4) {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(
      center.sx,
      center.sy,
      displayRadius * 2.2,
      displayRadius * 0.5,
      -0.15,
      Math.PI,
      2 * Math.PI,
    )
    ctx.strokeStyle = 'rgba(210,190,140,0.35)'
    ctx.lineWidth = Math.max(2, displayRadius * 0.15)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(
      center.sx,
      center.sy,
      displayRadius * 1.7,
      displayRadius * 0.4,
      -0.15,
      Math.PI,
      2 * Math.PI,
    )
    ctx.strokeStyle = 'rgba(190,170,120,0.25)'
    ctx.lineWidth = Math.max(1, displayRadius * 0.08)
    ctx.stroke()
    ctx.restore()
  }

  // Atmosphere edge glow
  const atmoEdge = displayRadius * 1.05
  const edgeGradient = ctx.createRadialGradient(
    center.sx,
    center.sy,
    displayRadius - 1,
    center.sx,
    center.sy,
    atmoEdge,
  )
  edgeGradient.addColorStop(0, vis.atmoColor)
  edgeGradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = edgeGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, atmoEdge, 0, 2 * Math.PI)
  ctx.fill()

  // Planet name label
  if (displayRadius > 20) {
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText(planetName, center.sx, center.sy + displayRadius + 16)
  }
}

// ---------------------------------------------------------------------------
// Speed-coded Trail
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Apogee / Perigee Markers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Rocket Ship
// ---------------------------------------------------------------------------

function drawRocket(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  transform: ViewTransform,
): void {
  if (state.crashed) return

  const { satellite } = state
  const pos = worldToScreen(satellite.x, satellite.y, transform)
  const speed = Math.sqrt(satellite.vx * satellite.vx + satellite.vy * satellite.vy)

  // Heading angle in screen space (note: screen Y is flipped)
  const heading = speed > 0 ? Math.atan2(-satellite.vy, satellite.vx) : 0

  const SIZE = 10 // half-length of rocket body

  ctx.save()
  ctx.translate(pos.sx, pos.sy)
  ctx.rotate(heading)

  // --- Engine flame (animated, drawn behind rocket) ---
  if (speed > 100) {
    const t = performance.now() / 80
    const flicker = 0.7 + 0.3 * Math.sin(t * 3.7)
    const flameLen = SIZE * (0.8 + flicker * 0.6)

    // Outer flame (orange/red)
    const flameGrad = ctx.createLinearGradient(-SIZE, 0, -SIZE - flameLen, 0)
    flameGrad.addColorStop(0, 'rgba(255,200,50,0.9)')
    flameGrad.addColorStop(0.4, 'rgba(255,120,20,0.6)')
    flameGrad.addColorStop(1, 'rgba(255,40,0,0)')
    ctx.fillStyle = flameGrad

    ctx.beginPath()
    ctx.moveTo(-SIZE, -3)
    ctx.lineTo(-SIZE - flameLen, 0)
    ctx.lineTo(-SIZE, 3)
    ctx.closePath()
    ctx.fill()

    // Inner flame (white-hot core)
    const coreLen = flameLen * 0.5
    const coreGrad = ctx.createLinearGradient(-SIZE, 0, -SIZE - coreLen, 0)
    coreGrad.addColorStop(0, 'rgba(255,255,255,0.8)')
    coreGrad.addColorStop(1, 'rgba(255,200,100,0)')
    ctx.fillStyle = coreGrad

    ctx.beginPath()
    ctx.moveTo(-SIZE, -1.5)
    ctx.lineTo(-SIZE - coreLen, 0)
    ctx.lineTo(-SIZE, 1.5)
    ctx.closePath()
    ctx.fill()
  }

  // --- Rocket body ---
  // Main body (white/light gray capsule)
  ctx.fillStyle = '#e8ecf0'
  ctx.beginPath()
  ctx.moveTo(SIZE + 6, 0) // nose tip
  ctx.lineTo(SIZE, -4) // nose shoulder top
  ctx.lineTo(-SIZE, -4) // body top
  ctx.lineTo(-SIZE, 4) // body bottom
  ctx.lineTo(SIZE, 4) // nose shoulder bottom
  ctx.closePath()
  ctx.fill()

  // Nose cone accent (darker tip)
  ctx.fillStyle = '#c0c8d0'
  ctx.beginPath()
  ctx.moveTo(SIZE + 6, 0)
  ctx.lineTo(SIZE, -4)
  ctx.lineTo(SIZE, 4)
  ctx.closePath()
  ctx.fill()

  // Window (small blue circle)
  ctx.fillStyle = '#4fc3f7'
  ctx.beginPath()
  ctx.arc(SIZE * 0.3, 0, 2, 0, 2 * Math.PI)
  ctx.fill()

  // --- Fins ---
  ctx.fillStyle = '#ef5350'
  // Top fin
  ctx.beginPath()
  ctx.moveTo(-SIZE, -4)
  ctx.lineTo(-SIZE - 4, -9)
  ctx.lineTo(-SIZE + 3, -4)
  ctx.closePath()
  ctx.fill()
  // Bottom fin
  ctx.beginPath()
  ctx.moveTo(-SIZE, 4)
  ctx.lineTo(-SIZE - 4, 9)
  ctx.lineTo(-SIZE + 3, 4)
  ctx.closePath()
  ctx.fill()

  // --- Body stripe ---
  ctx.fillStyle = '#ef5350'
  ctx.fillRect(-SIZE * 0.2, -4, 3, 8)

  ctx.restore()

  // Glow around rocket
  ctx.beginPath()
  ctx.arc(pos.sx, pos.sy, 14, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(0,229,255,0.1)'
  ctx.fill()
}

// ---------------------------------------------------------------------------
// Vectors
// ---------------------------------------------------------------------------

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
    const forceMag = (G * planet.mass) / (dist * dist)
    const fx = forceMag * (dx / dist)
    const fy = forceMag * (dy / dist)

    drawVector(ctx, satellite.x, satellite.y, fx * 1e6, fy * 1e6, COLORS.gravityVector, transform)
  }
}

// ---------------------------------------------------------------------------
// Effects & HUD
// ---------------------------------------------------------------------------

function drawCrashEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = COLORS.crashFlash
  ctx.fillRect(0, 0, width, height)
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  width: number,
  showMetrics: boolean,
  planetName: string,
): void {
  const { satellite, planet } = state
  const dist = Math.sqrt((satellite.x - planet.x) ** 2 + (satellite.y - planet.y) ** 2)
  const altitude = dist - planet.radius
  const speed = Math.sqrt(satellite.vx ** 2 + satellite.vy ** 2)
  const isBound = state.specificEnergy < 0 && !state.escaped

  // --- Build metric cells ---
  interface Cell {
    label: string
    value: string
    color: string
    width: number
  }

  const cells: Cell[] = [
    { label: 'BODY', value: planetName, color: '#88bbdd', width: 70 },
    { label: 'ALT', value: `${(altitude / 1000).toFixed(1)} km`, color: '#e2e8f0', width: 90 },
    { label: 'VEL', value: `${speed.toFixed(0)} m/s`, color: '#e2e8f0', width: 90 },
    { label: 'ORBITS', value: `${state.orbitsCompleted}`, color: '#e2e8f0', width: 55 },
  ]

  if (state.orbitalPeriod > 0 && !state.escaped) {
    cells.push({
      label: 'PERIOD',
      value: `${(state.orbitalPeriod / 60).toFixed(1)}m`,
      color: '#e2e8f0',
      width: 68,
    })
  }

  if (showMetrics && isBound) {
    cells.push({
      label: 'ECC',
      value: state.eccentricity.toFixed(4),
      color: '#00D4AA',
      width: 72,
    })
    cells.push({
      label: 'APO',
      value: `${(state.apogee / 1000).toFixed(0)} km`,
      color: '#00D4AA',
      width: 78,
    })
    cells.push({
      label: 'PER',
      value: `${(state.perigee / 1000).toFixed(0)} km`,
      color: '#00D4AA',
      width: 78,
    })
  }

  cells.push({
    label: 'TIME',
    value:
      state.simTime >= 3600
        ? `${(state.simTime / 3600).toFixed(1)}h`
        : `${(state.simTime / 60).toFixed(1)}m`,
    color: 'rgba(255,255,255,0.5)',
    width: 55,
  })

  // --- Layout: horizontal bar across the top ---
  const barHeight = 44
  const barPad = 8
  const cellGap = 2
  const totalCellWidth = cells.reduce((sum, c) => sum + c.width + cellGap, 0)
  const barLeft = Math.max(0, (width - totalCellWidth) / 2)

  // Background bar
  ctx.fillStyle = 'rgba(5, 8, 18, 0.75)'
  ctx.fillRect(0, 0, width, barHeight)
  // Bottom edge highlight
  ctx.fillStyle = 'rgba(100, 180, 255, 0.08)'
  ctx.fillRect(0, barHeight - 1, width, 1)

  // Draw each cell
  let cx = barLeft
  for (const cell of cells) {
    // Cell background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.fillRect(cx, 3, cell.width, barHeight - 6)
    // Left accent line
    ctx.fillStyle = cell.color
    ctx.globalAlpha = 0.3
    ctx.fillRect(cx, 6, 2, barHeight - 12)
    ctx.globalAlpha = 1

    // Label
    ctx.font = '9px monospace'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.fillText(cell.label, cx + barPad, 16)

    // Value
    ctx.font = 'bold 13px monospace'
    ctx.fillStyle = cell.color
    ctx.fillText(cell.value, cx + barPad, 34)

    cx += cell.width + cellGap
  }

  // --- Status badge (CRASHED / ESCAPED) ---
  if (state.crashed || state.escaped) {
    const statusText = state.crashed ? 'CRASHED' : 'ESCAPED'
    const statusColor = state.crashed ? '#ef4444' : '#22c55e'
    const statusBg = state.crashed ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'

    ctx.font = 'bold 14px monospace'
    const tw = ctx.measureText(statusText).width
    const badgeW = tw + 24
    const badgeX = (width - badgeW) / 2
    const badgeY = barHeight + 12

    // Badge background
    ctx.fillStyle = statusBg
    ctx.beginPath()
    ctx.roundRect(badgeX, badgeY, badgeW, 28, 6)
    ctx.fill()
    // Badge border
    ctx.strokeStyle = statusColor
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(badgeX, badgeY, badgeW, 28, 6)
    ctx.stroke()
    // Badge text
    ctx.fillStyle = statusColor
    ctx.textAlign = 'center'
    ctx.fillText(statusText, width / 2, badgeY + 20)
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
  attachInteractions(ctx.canvas)
  _currentPlanetRadius = state.planet.radius

  const showTrail = (params['show-trail'] as boolean | undefined) ?? true
  const showVectors = (params['show-vectors'] as boolean | undefined) ?? false
  const showMetrics = (params['show-metrics'] as boolean | undefined) ?? true
  const showGrid = (params['show-grid'] as boolean | undefined) ?? true
  const follow = (params['follow'] as boolean | undefined) ?? false
  const planetName = (params['planet'] as string | undefined) ?? 'Earth'

  const transform = computeViewTransform(state, width, height, follow)

  // 1. Background + stars
  drawBackground(ctx, width, height)

  // 2. Altitude grid
  if (showGrid) {
    drawAltitudeGrid(ctx, state, transform)
  }

  // 3. Orbit projection (predicted path — behind trail)
  drawOrbitProjection(ctx, state, transform)

  // 4. Trail
  if (showTrail) {
    drawTrail(ctx, state, transform)
  }

  // 5. Apogee/perigee markers
  if (showTrail) {
    drawApseMarkers(ctx, state, transform)
  }

  // 6. Planet
  drawPlanet(ctx, state, transform, planetName)

  // 7. Rocket
  drawRocket(ctx, state, transform)

  // 8. Vectors
  if (showVectors) {
    drawVectors(ctx, state, transform)
  }

  // 9. Crash effect
  if (state.crashed) {
    drawCrashEffect(ctx, width, height)
  }

  // 10. HUD
  drawHud(ctx, state, width, showMetrics, planetName)

  // 11. Zoom info
  drawZoomControls(ctx, height)
}
