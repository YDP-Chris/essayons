/**
 * Canvas rendering for the Orbit Lab episode.
 *
 * Uses a fixed base scale (planet always visible) with user-controlled
 * zoom and pan. Draws altitude reference grid, speed-coded trail,
 * twinkling stars, orbit projection, rocket ship, and telemetry HUD.
 *
 * Planet rendering features:
 * - Lit-sphere shading (directional highlight + shadow overlays)
 * - Animated rotation driven by simTime
 * - Multi-layered atmospheres per planet
 * - Enhanced surface features: Bezier continents (Earth), Great Red Spot
 *   (Jupiter), Cassini division (Saturn), mare regions (Moon), Valles
 *   Marineris (Mars), layered clouds (Venus)
 */

import { G } from './physics.ts'
import type { OrbitalState } from './physics.ts'
import { drawResponsiveHud, type HudCell } from '@/engine/hud-utils.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VECTOR_SCALE = 0.00004
const TRAIL_LINE_WIDTH = 1.5
const PROJECTION_STEPS = 360

/** Progressive detail thresholds based on displayRadius in pixels. */
const DETAIL_LEVEL_BASIC = 4
const DETAIL_LEVEL_SURFACE = 15
const DETAIL_LEVEL_FINE = 25

// ---------------------------------------------------------------------------
// Planet Visual Profiles
// ---------------------------------------------------------------------------

interface AtmosphereLayer {
  readonly radiusMultiplier: number
  readonly color: string
  readonly opacity: number
}

interface LightResponse {
  readonly highlightIntensity: number // 0-1, how bright the specular highlight
  readonly shadowIntensity: number // 0-1, how dark the shadow side
}

interface PlanetVisual {
  readonly bodyColors: [string, string, string] // gradient: highlight, mid, shadow
  readonly atmoColor: string // atmosphere glow tint
  readonly hasRings: boolean
  readonly hasBands: boolean
  readonly bandColor: string
  readonly hasCraters: boolean
  readonly atmosphereLayers: readonly AtmosphereLayer[]
  readonly rotationRate: number // revolutions per 60s of sim time
  readonly lightResponse: LightResponse
}

const PLANET_VISUALS: Readonly<Record<string, PlanetVisual>> = {
  Moon: {
    bodyColors: ['#d4d4d4', '#a0a0a0', '#606060'],
    atmoColor: 'rgba(200,200,200,0.03)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: true,
    atmosphereLayers: [],
    rotationRate: 0.3,
    lightResponse: { highlightIntensity: 0.15, shadowIntensity: 0.4 },
  },
  Mars: {
    bodyColors: ['#e8845a', '#c4522a', '#6b2010'],
    atmoColor: 'rgba(230,140,80,0.06)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: false,
    atmosphereLayers: [{ radiusMultiplier: 1.06, color: 'rgba(230,140,80', opacity: 0.06 }],
    rotationRate: 1.0,
    lightResponse: { highlightIntensity: 0.2, shadowIntensity: 0.35 },
  },
  Earth: {
    bodyColors: ['#2196F3', '#1565C0', '#0a2744'],
    atmoColor: 'rgba(60,160,255,0.08)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: false,
    atmosphereLayers: [
      { radiusMultiplier: 1.12, color: 'rgba(60,160,255', opacity: 0.06 },
      { radiusMultiplier: 1.06, color: 'rgba(100,200,255', opacity: 0.08 },
    ],
    rotationRate: 1.0,
    lightResponse: { highlightIntensity: 0.35, shadowIntensity: 0.3 },
  },
  Venus: {
    bodyColors: ['#f5e6b8', '#d4a843', '#8a6b20'],
    atmoColor: 'rgba(245,220,160,0.12)',
    hasRings: false,
    hasBands: false,
    bandColor: '',
    hasCraters: false,
    atmosphereLayers: [
      { radiusMultiplier: 1.22, color: 'rgba(245,220,160', opacity: 0.05 },
      { radiusMultiplier: 1.14, color: 'rgba(240,210,140', opacity: 0.08 },
      { radiusMultiplier: 1.07, color: 'rgba(255,230,170', opacity: 0.1 },
    ],
    rotationRate: 0.5,
    lightResponse: { highlightIntensity: 0.25, shadowIntensity: 0.25 },
  },
  Jupiter: {
    bodyColors: ['#e8c88a', '#c49a5a', '#7a5530'],
    atmoColor: 'rgba(200,160,100,0.06)',
    hasRings: false,
    hasBands: true,
    bandColor: '#b87a40',
    hasCraters: false,
    atmosphereLayers: [{ radiusMultiplier: 1.08, color: 'rgba(200,160,100', opacity: 0.05 }],
    rotationRate: 1.5,
    lightResponse: { highlightIntensity: 0.2, shadowIntensity: 0.3 },
  },
  Saturn: {
    bodyColors: ['#f0d898', '#d4b060', '#8a7030'],
    atmoColor: 'rgba(220,190,120,0.06)',
    hasRings: true,
    hasBands: true,
    bandColor: '#c8a050',
    hasCraters: false,
    atmosphereLayers: [{ radiusMultiplier: 1.08, color: 'rgba(220,190,120', opacity: 0.05 }],
    rotationRate: 1.3,
    lightResponse: { highlightIntensity: 0.2, shadowIntensity: 0.3 },
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
// Planet — Enhanced rendering with lit-sphere shading, animated rotation,
//          multi-layer atmospheres, and detailed surface features
// ---------------------------------------------------------------------------

/**
 * Compute rotation phase from simTime and per-planet rotation rate.
 * Returns radians representing how far features have rotated.
 * One full revolution = 2*PI, default rate = 1 revolution per 60s sim time.
 */
function computeRotationPhase(simTime: number, rotationRate: number): number {
  return ((simTime * rotationRate) / 60) * 2 * Math.PI
}

/**
 * Apply rotation offset to a normalized X position (-1 to 1).
 * Returns the new X position wrapped to [-1, 1] range.
 * Returns null if the feature is on the far side (not visible).
 */
function rotateFeatureX(baseX: number, rotationPhase: number): number | null {
  // Map rotation phase to a -1..1 offset using cosine for natural wrapping
  const offset = Math.sin(rotationPhase) * 0.8
  let newX = baseX + offset
  // Wrap around
  while (newX > 1) newX -= 2
  while (newX < -1) newX += 2
  // Only visible if within the disc (with foreshortening margin)
  if (newX < -0.85 || newX > 0.85) return null
  return newX
}

/** Draw multi-layer atmosphere system from PLANET_VISUALS config. */
function drawAtmosphereLayers(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  displayRadius: number,
  layers: readonly AtmosphereLayer[],
): void {
  // Draw from outermost to innermost so inner layers overlay outer
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i]!
    const layerRadius = displayRadius * layer.radiusMultiplier
    const grad = ctx.createRadialGradient(
      centerX,
      centerY,
      displayRadius * 0.85,
      centerX,
      centerY,
      layerRadius,
    )
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(0.4, `${layer.color},${layer.opacity})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(centerX, centerY, layerRadius, 0, 2 * Math.PI)
    ctx.fill()
  }
}

/** Draw lit-sphere highlight overlay (light from upper-left). */
function drawHighlightOverlay(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  displayRadius: number,
  intensity: number,
): void {
  if (displayRadius < DETAIL_LEVEL_BASIC) return
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, centerY, displayRadius, 0, 2 * Math.PI)
  ctx.clip()

  const hlGrad = ctx.createRadialGradient(
    centerX - displayRadius * 0.4,
    centerY - displayRadius * 0.4,
    0,
    centerX - displayRadius * 0.1,
    centerY - displayRadius * 0.1,
    displayRadius * 0.9,
  )
  hlGrad.addColorStop(0, `rgba(255,255,255,${(0.35 * intensity).toFixed(3)})`)
  hlGrad.addColorStop(0.5, `rgba(255,255,255,${(0.08 * intensity).toFixed(3)})`)
  hlGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hlGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, displayRadius, 0, 2 * Math.PI)
  ctx.fill()

  ctx.restore()
}

/** Draw lit-sphere shadow overlay (shadow on lower-right). */
function drawShadowOverlay(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  displayRadius: number,
  intensity: number,
): void {
  if (displayRadius < DETAIL_LEVEL_BASIC) return
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, centerY, displayRadius, 0, 2 * Math.PI)
  ctx.clip()

  const shGrad = ctx.createRadialGradient(
    centerX + displayRadius * 0.3,
    centerY + displayRadius * 0.3,
    displayRadius * 0.2,
    centerX + displayRadius * 0.15,
    centerY + displayRadius * 0.15,
    displayRadius * 1.1,
  )
  shGrad.addColorStop(0, `rgba(0,0,0,${(0.5 * intensity).toFixed(3)})`)
  shGrad.addColorStop(0.6, `rgba(0,0,0,${(0.2 * intensity).toFixed(3)})`)
  shGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, displayRadius, 0, 2 * Math.PI)
  ctx.fill()

  ctx.restore()
}

// ---------------------------------------------------------------------------
// Per-Planet Surface Feature Renderers
// ---------------------------------------------------------------------------

/** Draw Earth surface features: Bezier continents, ocean highlight, clouds. */
function drawEarthFeatures(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  phase: number,
): void {
  if (r < DETAIL_LEVEL_SURFACE) return

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.clip()

  // --- Ocean specular highlight ---
  const hlGrad = ctx.createRadialGradient(
    cx - r * 0.35,
    cy - r * 0.35,
    0,
    cx - r * 0.35,
    cy - r * 0.35,
    r * 0.3,
  )
  hlGrad.addColorStop(0, 'rgba(255,255,255,0.18)')
  hlGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hlGrad
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.3, cy - r * 0.3, r * 0.25, r * 0.18, 0.3, 0, 2 * Math.PI)
  ctx.fill()

  // --- Bezier continent: Eurasia-like mass ---
  const eurasiaX = rotateFeatureX(-0.05, phase)
  if (eurasiaX !== null) {
    const bx = cx + eurasiaX * r
    const by = cy - r * 0.25
    ctx.fillStyle = 'rgba(34,139,34,0.3)'
    ctx.beginPath()
    ctx.moveTo(bx - r * 0.15, by - r * 0.05)
    ctx.bezierCurveTo(
      bx - r * 0.08,
      by - r * 0.15,
      bx + r * 0.1,
      by - r * 0.12,
      bx + r * 0.2,
      by - r * 0.04,
    )
    ctx.bezierCurveTo(
      bx + r * 0.22,
      by + r * 0.02,
      bx + r * 0.15,
      by + r * 0.08,
      bx + r * 0.05,
      by + r * 0.1,
    )
    ctx.bezierCurveTo(
      bx - r * 0.05,
      by + r * 0.12,
      bx - r * 0.18,
      by + r * 0.06,
      bx - r * 0.15,
      by - r * 0.05,
    )
    ctx.closePath()
    ctx.fill()
  }

  // --- Bezier continent: Africa-like mass ---
  const africaX = rotateFeatureX(0.1, phase)
  if (africaX !== null) {
    const bx = cx + africaX * r
    const by = cy + r * 0.05
    ctx.fillStyle = 'rgba(34,139,34,0.3)'
    ctx.beginPath()
    ctx.moveTo(bx, by - r * 0.08)
    ctx.bezierCurveTo(bx + r * 0.06, by - r * 0.06, bx + r * 0.08, by, bx + r * 0.05, by + r * 0.12)
    ctx.bezierCurveTo(
      bx + r * 0.02,
      by + r * 0.16,
      bx - r * 0.04,
      by + r * 0.14,
      bx - r * 0.06,
      by + r * 0.08,
    )
    ctx.bezierCurveTo(bx - r * 0.07, by + r * 0.02, bx - r * 0.04, by - r * 0.06, bx, by - r * 0.08)
    ctx.closePath()
    ctx.fill()
  }

  // --- Bezier continent: Americas-like mass ---
  const americasX = rotateFeatureX(-0.4, phase)
  if (americasX !== null) {
    const bx = cx + americasX * r
    const by = cy - r * 0.1
    ctx.fillStyle = 'rgba(34,139,34,0.28)'
    ctx.beginPath()
    // North America blob
    ctx.moveTo(bx - r * 0.06, by - r * 0.15)
    ctx.bezierCurveTo(
      bx + r * 0.02,
      by - r * 0.18,
      bx + r * 0.08,
      by - r * 0.1,
      bx + r * 0.04,
      by - r * 0.02,
    )
    // Central America bridge
    ctx.bezierCurveTo(
      bx + r * 0.02,
      by + r * 0.02,
      bx + r * 0.03,
      by + r * 0.06,
      bx + r * 0.05,
      by + r * 0.1,
    )
    // South America blob
    ctx.bezierCurveTo(
      bx + r * 0.07,
      by + r * 0.18,
      bx - r * 0.02,
      by + r * 0.22,
      bx - r * 0.04,
      by + r * 0.15,
    )
    ctx.bezierCurveTo(
      bx - r * 0.06,
      by + r * 0.08,
      bx - r * 0.08,
      by - r * 0.05,
      bx - r * 0.06,
      by - r * 0.15,
    )
    ctx.closePath()
    ctx.fill()
  }

  // --- Bezier continent: Antarctica smudge ---
  const antarcticaX = rotateFeatureX(0.0, phase)
  if (antarcticaX !== null) {
    ctx.fillStyle = 'rgba(220,220,220,0.2)'
    ctx.beginPath()
    ctx.ellipse(cx + antarcticaX * r, cy + r * 0.85, r * 0.3, r * 0.08, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  // --- Multi-layer clouds ---
  const cloudLayers = [
    { xOff: 0.15, yOff: -0.15, w: 0.38, h: 0.06, angle: 0.15, alpha: 0.15, phaseShift: 0 },
    { xOff: -0.25, yOff: 0.25, w: 0.3, h: 0.05, angle: -0.2, alpha: 0.12, phaseShift: 0.3 },
    { xOff: 0.05, yOff: 0.5, w: 0.35, h: 0.05, angle: 0.1, alpha: 0.1, phaseShift: 0.6 },
  ]
  ctx.fillStyle = '#fff'
  for (const cl of cloudLayers) {
    const cloudX = rotateFeatureX(cl.xOff, phase + cl.phaseShift)
    if (cloudX === null) continue
    ctx.globalAlpha = cl.alpha
    ctx.beginPath()
    ctx.ellipse(cx + cloudX * r, cy + cl.yOff * r, cl.w * r, cl.h * r, cl.angle, 0, 2 * Math.PI)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.restore()
}

/** Draw Mars surface features: terrain variation, Valles Marineris, Olympus Mons, ice caps. */
function drawMarsFeatures(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  phase: number,
): void {
  if (r < DETAIL_LEVEL_SURFACE) return

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.clip()

  // --- Terrain color variation: dark and light patches ---
  const darkPatches = [
    { x: -0.2, y: 0.1, w: 0.2, h: 0.15 },
    { x: 0.3, y: -0.2, w: 0.18, h: 0.12 },
    { x: -0.1, y: -0.35, w: 0.15, h: 0.1 },
  ]
  for (const dp of darkPatches) {
    const px = rotateFeatureX(dp.x, phase)
    if (px === null) continue
    ctx.fillStyle = 'rgba(100,40,15,0.2)'
    ctx.beginPath()
    ctx.ellipse(cx + px * r, cy + dp.y * r, dp.w * r, dp.h * r, 0.4, 0, 2 * Math.PI)
    ctx.fill()
  }
  const lightPatches = [
    { x: 0.1, y: 0.25, w: 0.15, h: 0.1 },
    { x: -0.35, y: -0.1, w: 0.12, h: 0.08 },
  ]
  for (const lp of lightPatches) {
    const px = rotateFeatureX(lp.x, phase)
    if (px === null) continue
    ctx.fillStyle = 'rgba(230,160,100,0.15)'
    ctx.beginPath()
    ctx.ellipse(cx + px * r, cy + lp.y * r, lp.w * r, lp.h * r, -0.3, 0, 2 * Math.PI)
    ctx.fill()
  }

  // --- Valles Marineris: dark diagonal line across equator ---
  const vmStartX = rotateFeatureX(-0.3, phase)
  const vmEndX = rotateFeatureX(0.2, phase)
  if (vmStartX !== null && vmEndX !== null) {
    ctx.strokeStyle = 'rgba(80,25,10,0.35)'
    ctx.lineWidth = Math.max(1, r * 0.02)
    ctx.beginPath()
    ctx.moveTo(cx + vmStartX * r, cy + r * 0.05)
    ctx.bezierCurveTo(
      cx + (vmStartX + (vmEndX - vmStartX) * 0.3) * r,
      cy - r * 0.02,
      cx + (vmStartX + (vmEndX - vmStartX) * 0.7) * r,
      cy + r * 0.08,
      cx + vmEndX * r,
      cy + r * 0.02,
    )
    ctx.stroke()
  }

  // --- Olympus Mons: circular feature in northern hemisphere ---
  if (r > DETAIL_LEVEL_FINE) {
    const omX = rotateFeatureX(-0.15, phase)
    if (omX !== null) {
      const omCx = cx + omX * r
      const omCy = cy - r * 0.35
      const omR = r * 0.08
      // Caldera (darker center)
      ctx.fillStyle = 'rgba(90,35,15,0.25)'
      ctx.beginPath()
      ctx.arc(omCx, omCy, omR, 0, 2 * Math.PI)
      ctx.fill()
      // Bright rim
      ctx.strokeStyle = 'rgba(220,160,100,0.3)'
      ctx.lineWidth = Math.max(1, r * 0.015)
      ctx.beginPath()
      ctx.arc(omCx, omCy, omR, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }

  // --- Polar ice caps ---
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.ellipse(cx, cy - r * 0.85, r * 0.35, r * 0.12, 0, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + r * 0.88, r * 0.28, r * 0.09, 0, 0, 2 * Math.PI)
  ctx.fill()

  ctx.restore()
}

/** Draw Moon surface features: mare regions, craters with rim highlights. */
function drawMoonFeatures(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  phase: number,
): void {
  if (r < DETAIL_LEVEL_SURFACE) return

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.clip()

  // --- Mare regions (dark flat basalt plains) ---
  const mare = [
    { x: -0.2, y: -0.25, w: 0.2, h: 0.18, name: 'Imbrium' },
    { x: 0.1, y: -0.15, w: 0.13, h: 0.12, name: 'Serenitatis' },
    { x: 0.2, y: 0.05, w: 0.15, h: 0.13, name: 'Tranquillitatis' },
    { x: -0.35, y: 0.0, w: 0.18, h: 0.2, name: 'Procellarum' },
  ]
  for (const m of mare) {
    const mx = rotateFeatureX(m.x, phase)
    if (mx === null) continue
    ctx.fillStyle = 'rgba(60,60,70,0.2)'
    ctx.beginPath()
    ctx.ellipse(cx + mx * r, cy + m.y * r, m.w * r, m.h * r, 0.2, 0, 2 * Math.PI)
    ctx.fill()
  }

  // --- Craters with rim highlights ---
  const craters = [
    { x: 0.25, y: -0.3, size: 0.12 },
    { x: -0.35, y: 0.15, size: 0.08 },
    { x: 0.1, y: 0.35, size: 0.06 },
    { x: -0.15, y: -0.2, size: 0.1 },
    { x: 0.4, y: 0.1, size: 0.05 },
    { x: -0.05, y: 0.5, size: 0.07 },
    { x: 0.3, y: -0.05, size: 0.04 },
    { x: -0.4, y: -0.35, size: 0.06 },
    { x: 0.15, y: 0.15, size: 0.09 },
    { x: -0.25, y: 0.4, size: 0.05 },
  ]
  for (const cr of craters) {
    const crX = rotateFeatureX(cr.x, phase)
    if (crX === null) continue
    const crCx = cx + crX * r
    const crCy = cy + cr.y * r
    const crR = cr.size * r

    // Crater floor (dark)
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.beginPath()
    ctx.arc(crCx, crCy, crR, 0, 2 * Math.PI)
    ctx.fill()

    if (r > DETAIL_LEVEL_FINE) {
      // Bright rim arc (upper-left, lit side)
      ctx.strokeStyle = 'rgba(200,200,200,0.3)'
      ctx.lineWidth = Math.max(1, crR * 0.15)
      ctx.beginPath()
      ctx.arc(crCx, crCy, crR, Math.PI * 0.9, Math.PI * 1.6)
      ctx.stroke()

      // Dark rim arc (lower-right, shadow side)
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.lineWidth = Math.max(1, crR * 0.12)
      ctx.beginPath()
      ctx.arc(crCx, crCy, crR, Math.PI * -0.1, Math.PI * 0.6)
      ctx.stroke()
    }
  }

  ctx.restore()
}

/** Draw Jupiter surface features: wavy bands, varied colors, Great Red Spot. */
function drawJupiterFeatures(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  phase: number,
): void {
  if (r < DETAIL_LEVEL_BASIC * 2) return

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.clip()

  // Band definitions: yPosition (normalized -1 to 1), height, color
  const bands: Array<{ y: number; h: number; color: string }> = [
    { y: -0.75, h: 0.14, color: 'rgba(180,120,60,0.2)' }, // dark brown
    { y: -0.52, h: 0.12, color: 'rgba(230,210,170,0.15)' }, // cream
    { y: -0.3, h: 0.15, color: 'rgba(170,100,50,0.22)' }, // rust
    { y: -0.05, h: 0.13, color: 'rgba(220,200,160,0.12)' }, // tan
    { y: 0.18, h: 0.16, color: 'rgba(160,90,40,0.2)' }, // ochre
    { y: 0.42, h: 0.12, color: 'rgba(230,215,175,0.14)' }, // cream-light
    { y: 0.62, h: 0.15, color: 'rgba(140,80,35,0.18)' }, // dark ochre
  ]

  // Draw wavy bands
  const segCount = 24
  for (const band of bands) {
    const bandTop = cy + (band.y - band.h / 2) * r
    const bandBot = cy + (band.y + band.h / 2) * r
    const amplitude = r * 0.02
    const freq = 3 + band.y * 2 // vary frequency per band

    ctx.fillStyle = band.color
    ctx.beginPath()

    // Top edge (wavy)
    for (let s = 0; s <= segCount; s++) {
      const t = s / segCount
      const sx = cx - r + t * 2 * r
      const sy = bandTop + amplitude * Math.sin(freq * t * Math.PI * 2 + phase * 0.5 + band.y * 4)
      if (s === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    }
    // Bottom edge (wavy, reversed)
    for (let s = segCount; s >= 0; s--) {
      const t = s / segCount
      const sx = cx - r + t * 2 * r
      const sy =
        bandBot + amplitude * Math.sin(freq * t * Math.PI * 2 + phase * 0.5 + band.y * 4 + 1.5)
      ctx.lineTo(sx, sy)
    }
    ctx.closePath()
    ctx.fill()
  }

  // --- Great Red Spot ---
  if (r > DETAIL_LEVEL_SURFACE) {
    const grsBaseX = 0.2
    const grsX = rotateFeatureX(grsBaseX, phase)
    if (grsX !== null) {
      const grsCx = cx + grsX * r
      const grsCy = cy + r * 0.25
      const grsW = r * 0.12
      const grsH = r * 0.08

      // Spot gradient
      const grsGrad = ctx.createRadialGradient(grsCx, grsCy, 0, grsCx, grsCy, grsW)
      grsGrad.addColorStop(0, 'rgba(180,60,30,0.35)')
      grsGrad.addColorStop(0.6, 'rgba(200,80,40,0.25)')
      grsGrad.addColorStop(1, 'rgba(180,100,60,0)')
      ctx.fillStyle = grsGrad
      ctx.beginPath()
      ctx.ellipse(grsCx, grsCy, grsW, grsH, 0.1, 0, 2 * Math.PI)
      ctx.fill()

      // Spot rim
      ctx.strokeStyle = 'rgba(160,50,20,0.2)'
      ctx.lineWidth = Math.max(1, r * 0.01)
      ctx.beginPath()
      ctx.ellipse(grsCx, grsCy, grsW, grsH, 0.1, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }

  ctx.restore()
}

/**
 * Draw Saturn ring system with C, B, A rings and Cassini division.
 * @param half 'back' draws the far-side half (behind planet), 'front' draws near-side.
 */
function drawSaturnRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  half: 'back' | 'front',
): void {
  if (r < DETAIL_LEVEL_BASIC) return

  const tilt = -0.15 // ring tilt angle
  const startAngle = half === 'back' ? 0 : Math.PI
  const endAngle = half === 'back' ? Math.PI : 2 * Math.PI

  // Ring definitions: inner/outer radius multipliers, color, opacity
  const rings = [
    // C ring (innermost, faint)
    { inner: 1.25, outer: 1.5, color: '180,170,150', opacity: 0.12 },
    // B ring (brightest)
    { inner: 1.55, outer: 1.9, color: '220,200,160', opacity: 0.35 },
    // Cassini division (gap)
    { inner: 1.9, outer: 1.97, color: '10,10,20', opacity: 0.4 },
    // A ring (outer, golden)
    { inner: 1.97, outer: 2.3, color: '210,185,120', opacity: 0.28 },
  ]

  ctx.save()
  for (const ring of rings) {
    const outerRx = r * ring.outer
    const outerRy = r * ring.outer * 0.23
    const innerRx = r * ring.inner
    const innerRy = r * ring.inner * 0.23
    const ringWidth = outerRx - innerRx
    const midRx = (outerRx + innerRx) / 2
    const midRy = (outerRy + innerRy) / 2

    ctx.strokeStyle = `rgba(${ring.color},${ring.opacity})`
    ctx.lineWidth = Math.max(1, ringWidth)
    ctx.beginPath()
    ctx.ellipse(cx, cy, midRx, midRy, tilt, startAngle, endAngle)
    ctx.stroke()
  }
  ctx.restore()
}

/** Draw Saturn band features: subtle horizontal bands similar to Jupiter but muted. */
function drawSaturnBands(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  phase: number,
): void {
  if (r < DETAIL_LEVEL_BASIC * 2) return

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.clip()

  const bands = [
    { y: -0.6, h: 0.15, color: 'rgba(190,160,90,0.12)' },
    { y: -0.3, h: 0.12, color: 'rgba(210,185,120,0.1)' },
    { y: 0.0, h: 0.14, color: 'rgba(180,150,80,0.12)' },
    { y: 0.3, h: 0.12, color: 'rgba(200,175,110,0.1)' },
    { y: 0.6, h: 0.13, color: 'rgba(170,140,75,0.12)' },
  ]

  const segCount = 20
  for (const band of bands) {
    const bandTop = cy + (band.y - band.h / 2) * r
    const bandBot = cy + (band.y + band.h / 2) * r
    const amplitude = r * 0.012
    const freq = 2.5

    ctx.fillStyle = band.color
    ctx.beginPath()
    for (let s = 0; s <= segCount; s++) {
      const t = s / segCount
      const sx = cx - r + t * 2 * r
      const sy = bandTop + amplitude * Math.sin(freq * t * Math.PI * 2 + phase * 0.4)
      if (s === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    }
    for (let s = segCount; s >= 0; s--) {
      const t = s / segCount
      const sx = cx - r + t * 2 * r
      const sy = bandBot + amplitude * Math.sin(freq * t * Math.PI * 2 + phase * 0.4 + 1.0)
      ctx.lineTo(sx, sy)
    }
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

/** Draw Venus surface features: multiple swirling cloud layers, thick atmosphere. */
function drawVenusFeatures(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  phase: number,
): void {
  if (r < DETAIL_LEVEL_SURFACE) return

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.clip()

  // --- Semi-opaque cloud deck to obscure surface ---
  ctx.fillStyle = 'rgba(220,200,150,0.15)'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.fill()

  // --- Multiple swirling cloud bands at different angles ---
  const cloudBands = [
    { yOff: -0.45, w: 0.7, h: 0.09, angle: 0.15, alpha: 0.18, speed: 1.0 },
    { yOff: -0.15, w: 0.65, h: 0.08, angle: -0.1, alpha: 0.15, speed: 0.8 },
    { yOff: 0.1, w: 0.72, h: 0.1, angle: 0.2, alpha: 0.2, speed: 1.2 },
    { yOff: 0.35, w: 0.6, h: 0.07, angle: -0.15, alpha: 0.14, speed: 0.9 },
    { yOff: 0.6, w: 0.55, h: 0.08, angle: 0.08, alpha: 0.16, speed: 1.1 },
  ]

  for (const cb of cloudBands) {
    const xShift = Math.sin(phase * cb.speed + cb.yOff * 3) * 0.15
    ctx.globalAlpha = cb.alpha
    ctx.fillStyle = 'rgba(255,245,220,1)'
    ctx.beginPath()
    ctx.ellipse(
      cx + xShift * r,
      cy + cb.yOff * r,
      cb.w * r,
      cb.h * r,
      cb.angle + Math.sin(phase * cb.speed * 0.3) * 0.05,
      0,
      2 * Math.PI,
    )
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // --- Yellowish atmospheric glow (inner glow) ---
  const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.0)
  glowGrad.addColorStop(0, 'rgba(0,0,0,0)')
  glowGrad.addColorStop(0.5, 'rgba(245,220,130,0.08)')
  glowGrad.addColorStop(1, 'rgba(245,220,130,0.12)')
  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.fill()

  ctx.restore()
}

// ---------------------------------------------------------------------------
// Main Planet Draw Function
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

  // Compute rotation phase from simTime
  const rotationPhase = computeRotationPhase(state.simTime, vis.rotationRate)

  // --- Multi-layer atmosphere (outer layers first) ---
  if (vis.atmosphereLayers.length > 0) {
    drawAtmosphereLayers(ctx, center.sx, center.sy, displayRadius, vis.atmosphereLayers)
  } else {
    // Fallback: single atmosphere glow for planets without layers defined
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
  }

  // --- Saturn rings (behind planet body) ---
  if (vis.hasRings) {
    drawSaturnRings(ctx, center.sx, center.sy, displayRadius, 'back')
  }

  // --- Planet body with directional lit-sphere gradient ---
  const bodyGradient = ctx.createRadialGradient(
    center.sx - displayRadius * 0.35,
    center.sy - displayRadius * 0.35,
    0,
    center.sx + displayRadius * 0.05,
    center.sy + displayRadius * 0.05,
    displayRadius,
  )
  bodyGradient.addColorStop(0, vis.bodyColors[0])
  bodyGradient.addColorStop(0.45, vis.bodyColors[1])
  bodyGradient.addColorStop(1, vis.bodyColors[2])
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.arc(center.sx, center.sy, displayRadius, 0, 2 * Math.PI)
  ctx.fill()

  // --- Planet-specific surface features ---
  if (planetName === 'Jupiter') {
    drawJupiterFeatures(ctx, center.sx, center.sy, displayRadius, rotationPhase)
  } else if (planetName === 'Saturn') {
    drawSaturnBands(ctx, center.sx, center.sy, displayRadius, rotationPhase)
  }

  if (planetName === 'Moon') {
    drawMoonFeatures(ctx, center.sx, center.sy, displayRadius, rotationPhase)
  }

  if (planetName === 'Earth') {
    drawEarthFeatures(ctx, center.sx, center.sy, displayRadius, rotationPhase)
  }

  if (planetName === 'Venus') {
    drawVenusFeatures(ctx, center.sx, center.sy, displayRadius, rotationPhase)
  }

  if (planetName === 'Mars') {
    drawMarsFeatures(ctx, center.sx, center.sy, displayRadius, rotationPhase)
  }

  // --- Lit-sphere shading overlays ---
  drawHighlightOverlay(
    ctx,
    center.sx,
    center.sy,
    displayRadius,
    vis.lightResponse.highlightIntensity,
  )
  drawShadowOverlay(ctx, center.sx, center.sy, displayRadius, vis.lightResponse.shadowIntensity)

  // --- Saturn rings (in front of planet body — near-side half) ---
  if (vis.hasRings) {
    drawSaturnRings(ctx, center.sx, center.sy, displayRadius, 'front')
  }

  // --- Atmosphere edge glow ---
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

  // --- Planet name label ---
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
  const cells: HudCell[] = [
    { label: 'BODY', value: planetName, color: '#88bbdd', width: 70 },
    {
      label: 'ALT',
      value: `${(altitude / 1000).toFixed(1)} km`,
      color: '#e2e8f0',
      width: 90,
      core: true,
    },
    { label: 'VEL', value: `${speed.toFixed(0)} m/s`, color: '#e2e8f0', width: 90, core: true },
    { label: 'ORBITS', value: `${state.orbitsCompleted}`, color: '#e2e8f0', width: 55, core: true },
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
    core: true,
  })

  // --- Status ---
  let statusText: string | undefined
  let statusColor: string | undefined
  if (state.crashed) {
    statusText = 'CRASHED'
    statusColor = '#ef4444'
  } else if (state.escaped) {
    statusText = 'ESCAPED'
    statusColor = '#22c55e'
  }

  drawResponsiveHud(ctx, { cells, statusText, statusColor }, width)
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
