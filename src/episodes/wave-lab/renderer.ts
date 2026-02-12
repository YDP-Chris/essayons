/**
 * Canvas rendering for the Wave Lab episode.
 *
 * Renders animated standing wave patterns on vibrating strings with
 * nodes, antinodes, harmonic indicators, and responsive HUD. Optimized
 * for 60fps performance with smooth wave animation and visual feedback.
 */

import type { WaveState } from './types.ts'
import { drawResponsiveHud, type HudCell } from '@/engine/hud-utils.ts'

// ---------------------------------------------------------------------------
// Constants and Configuration
// ---------------------------------------------------------------------------

/** Physics accent color for Wave Lab */
const ACCENT_COLOR = '#00D4AA'

/** Rendering configuration */
const RENDER_CONFIG = {
  background: '#0B1426', // Deep space blue
  stringColor: '#FFD700', // Golden yellow for string
  waveColorLow: '#4F46E5', // Indigo for low amplitude
  waveColorHigh: '#06FFA5', // Bright mint for high amplitude
  nodeColor: '#EF4444', // Red for nodes
  antinodeColor: '#22C55E', // Green for antinodes
  gridColor: 'rgba(255,255,255,0.1)',
  resonanceGlow: '#FFD700', // Gold glow for resonance
  harmonicMarkers: '#94A3B8', // Muted color for harmonic markers
}

/** String rendering properties */
const STRING_CONFIG = {
  thickness: 4, // Base string thickness
  maxThickness: 8, // Max thickness at resonance
  yOffset: 0.5, // Vertical position (0.5 = center)
  amplitudeScale: 100, // Scale factor for wave displacement
}

/** Node and antinode marker properties */
const MARKER_CONFIG = {
  nodeRadius: 6,
  antinodeRadius: 8,
  pulseSpeed: 3, // Animation speed for pulsing
  glowRadius: 12,
}

/** Grid and reference lines */
const GRID_CONFIG = {
  showGrid: true,
  gridSpacing: 0.2, // Grid line spacing in meters
  showRuler: true,
}

// ---------------------------------------------------------------------------
// Color and Style Utilities
// ---------------------------------------------------------------------------

/**
 * Interpolate between two colors based on a parameter t (0-1)
 */
function lerpColor(color1: string, color2: string, t: number): string {
  // Simple RGB interpolation for hex colors
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')

  const r1 = parseInt(hex1.substr(0, 2), 16)
  const g1 = parseInt(hex1.substr(2, 2), 16)
  const b1 = parseInt(hex1.substr(4, 2), 16)

  const r2 = parseInt(hex2.substr(0, 2), 16)
  const g2 = parseInt(hex2.substr(2, 2), 16)
  const b2 = parseInt(hex2.substr(4, 2), 16)

  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)

  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Get wave color based on amplitude and resonance level
 */
function getWaveColor(normalizedAmplitude: number, resonanceLevel: number): string {
  // Blend base wave color with resonance color
  const baseColor = lerpColor(
    RENDER_CONFIG.waveColorLow,
    RENDER_CONFIG.waveColorHigh,
    normalizedAmplitude,
  )
  if (resonanceLevel > 0.5) {
    return lerpColor(baseColor, RENDER_CONFIG.resonanceGlow, resonanceLevel * 0.5)
  }
  return baseColor
}

// ---------------------------------------------------------------------------
// Coordinate System
// ---------------------------------------------------------------------------

/**
 * Convert world coordinates to screen coordinates
 */
function worldToScreen(
  x: number,
  y: number,
  width: number,
  height: number,
  stringLength: number,
): { sx: number; sy: number } {
  const margin = 60
  const stringY = height * STRING_CONFIG.yOffset

  return {
    sx: margin + (x / stringLength) * (width - 2 * margin),
    sy: stringY - y * STRING_CONFIG.amplitudeScale,
  }
}

/**
 * Get the string baseline Y coordinate
 */
function getStringBaseline(height: number): number {
  return height * STRING_CONFIG.yOffset
}

// ---------------------------------------------------------------------------
// Background and Grid
// ---------------------------------------------------------------------------

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Background
  ctx.fillStyle = RENDER_CONFIG.background
  ctx.fillRect(0, 0, width, height)

  if (GRID_CONFIG.showGrid) {
    drawGrid(ctx, width, height)
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const margin = 60
  const stringY = getStringBaseline(height)

  ctx.strokeStyle = RENDER_CONFIG.gridColor
  ctx.lineWidth = 1
  ctx.setLineDash([2, 4])

  // Horizontal reference lines
  const lines = [-0.05, -0.025, 0.025, 0.05] // Displacement levels in meters
  for (const y of lines) {
    const screenY = stringY - y * STRING_CONFIG.amplitudeScale
    if (screenY > 20 && screenY < height - 20) {
      ctx.beginPath()
      ctx.moveTo(margin, screenY)
      ctx.lineTo(width - margin, screenY)
      ctx.stroke()
    }
  }

  ctx.setLineDash([])
}

function drawRuler(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stringLength: number,
): void {
  if (!GRID_CONFIG.showRuler) return

  const margin = 60
  const rulerY = height - 30
  const stringWidth = width - 2 * margin

  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '10px monospace'
  ctx.textAlign = 'center'
  ctx.lineWidth = 1

  // Ruler line
  ctx.beginPath()
  ctx.moveTo(margin, rulerY)
  ctx.lineTo(width - margin, rulerY)
  ctx.stroke()

  // Ruler marks
  const numMarks = Math.floor(stringLength / GRID_CONFIG.gridSpacing) + 1
  for (let i = 0; i < numMarks; i++) {
    const x = margin + ((i * GRID_CONFIG.gridSpacing) / stringLength) * stringWidth
    const markHeight = i % 5 === 0 ? 8 : 4

    ctx.beginPath()
    ctx.moveTo(x, rulerY)
    ctx.lineTo(x, rulerY + markHeight)
    ctx.stroke()

    if (i % 5 === 0) {
      const label = (i * GRID_CONFIG.gridSpacing).toFixed(1) + 'm'
      ctx.fillText(label, x, rulerY + markHeight + 12)
    }
  }
}

// ---------------------------------------------------------------------------
// Wave and String Rendering
// ---------------------------------------------------------------------------

function drawString(
  ctx: CanvasRenderingContext2D,
  state: WaveState,
  width: number,
  height: number,
): void {
  const { positions, displacement, resonanceLevel } = state
  const stringLength = state.stringParams.length

  // String thickness based on resonance
  const thickness =
    STRING_CONFIG.thickness +
    (STRING_CONFIG.maxThickness - STRING_CONFIG.thickness) * resonanceLevel

  // String endpoints (fixed boundaries)
  const startPoint = worldToScreen(0, 0, width, height, stringLength)
  const endPoint = worldToScreen(stringLength, 0, width, height, stringLength)

  // Draw string supports (fixed ends)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  const supportWidth = 4
  const supportHeight = 30
  ctx.fillRect(
    startPoint.sx - supportWidth / 2,
    startPoint.sy - supportHeight / 2,
    supportWidth,
    supportHeight,
  )
  ctx.fillRect(
    endPoint.sx - supportWidth / 2,
    endPoint.sy - supportHeight / 2,
    supportWidth,
    supportHeight,
  )

  // Draw the vibrating string
  ctx.lineWidth = thickness
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Draw the wave displacement
  ctx.beginPath()
  for (let i = 0; i < positions.length; i++) {
    const point = worldToScreen(positions[i]!, displacement[i]!, width, height, stringLength)

    if (i === 0) {
      ctx.moveTo(point.sx, point.sy)
    } else {
      ctx.lineTo(point.sx, point.sy)
    }
  }

  // Color based on amplitude and resonance
  const maxAmplitude = Math.max(...displacement.map(Math.abs))
  const normalizedAmplitude = maxAmplitude / 0.05 // Normalize to typical maximum
  ctx.strokeStyle = getWaveColor(normalizedAmplitude, resonanceLevel)
  ctx.stroke()

  // Resonance glow effect
  if (resonanceLevel > 0.3) {
    ctx.shadowColor = RENDER_CONFIG.resonanceGlow
    ctx.shadowBlur = 15 * resonanceLevel
    ctx.stroke()
    ctx.shadowBlur = 0
  }
}

// ---------------------------------------------------------------------------
// Nodes and Antinodes
// ---------------------------------------------------------------------------

function drawNodes(
  ctx: CanvasRenderingContext2D,
  state: WaveState,
  width: number,
  height: number,
  showNodes: boolean,
): void {
  if (!showNodes || state.nodePositions.length === 0) return

  const stringLength = state.stringParams.length
  const time = state.time
  const pulse = 0.5 + 0.5 * Math.sin(time * MARKER_CONFIG.pulseSpeed)

  ctx.fillStyle = RENDER_CONFIG.nodeColor
  ctx.strokeStyle = RENDER_CONFIG.nodeColor
  ctx.lineWidth = 2

  for (const nodeX of state.nodePositions) {
    const point = worldToScreen(nodeX, 0, width, height, stringLength)

    // Pulsing circle for node
    const radius = MARKER_CONFIG.nodeRadius + pulse * 2
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.arc(point.sx, point.sy, radius, 0, 2 * Math.PI)
    ctx.fill()

    // Inner dot
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.arc(point.sx, point.sy, 2, 0, 2 * Math.PI)
    ctx.fill()

    // Label
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('N', point.sx, point.sy - radius - 8)
  }

  ctx.globalAlpha = 1
}

function drawAntinodes(
  ctx: CanvasRenderingContext2D,
  state: WaveState,
  width: number,
  height: number,
  showAntinodes: boolean,
): void {
  if (!showAntinodes || state.antinodePositions.length === 0) return

  const stringLength = state.stringParams.length
  const time = state.time
  const pulse = 0.5 + 0.5 * Math.sin(time * MARKER_CONFIG.pulseSpeed + Math.PI)

  ctx.strokeStyle = RENDER_CONFIG.antinodeColor
  ctx.lineWidth = 3

  for (const antinodeX of state.antinodePositions) {
    const point = worldToScreen(antinodeX, 0, width, height, stringLength)

    // Pulsing diamond for antinode
    const size = MARKER_CONFIG.antinodeRadius + pulse * 2
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.moveTo(point.sx, point.sy - size)
    ctx.lineTo(point.sx + size, point.sy)
    ctx.lineTo(point.sx, point.sy + size)
    ctx.lineTo(point.sx - size, point.sy)
    ctx.closePath()
    ctx.stroke()

    // Label
    ctx.globalAlpha = 1
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = RENDER_CONFIG.antinodeColor
    ctx.fillText('A', point.sx, point.sy - size - 8)
  }

  ctx.globalAlpha = 1
}

// ---------------------------------------------------------------------------
// Harmonic Markers
// ---------------------------------------------------------------------------

function drawHarmonicMarkers(
  ctx: CanvasRenderingContext2D,
  state: WaveState,
  _width: number,
  _height: number,
  showHarmonics: boolean,
): void {
  if (!showHarmonics) return

  const margin = 60
  const markerY = 20

  ctx.font = '11px monospace'
  ctx.textAlign = 'left'
  ctx.fillStyle = RENDER_CONFIG.harmonicMarkers

  // Show first few harmonics
  const harmonicsToShow = Math.min(5, state.harmonics.length)
  for (let i = 0; i < harmonicsToShow; i++) {
    const harmonic = state.harmonics[i]!
    const x = margin + i * 80
    const text = `${i + 1}: ${harmonic.toFixed(1)} Hz`

    // Highlight if close to driving frequency
    const diff = Math.abs(harmonic - state.driving.frequency)
    if (diff <= 2) {
      ctx.fillStyle = ACCENT_COLOR
    } else {
      ctx.fillStyle = RENDER_CONFIG.harmonicMarkers
    }

    ctx.fillText(text, x, markerY)
  }
}

// ---------------------------------------------------------------------------
// HUD and Status Display
// ---------------------------------------------------------------------------

function drawHud(ctx: CanvasRenderingContext2D, state: WaveState, width: number): void {
  const cells: HudCell[] = [
    {
      label: 'FREQ',
      value: `${state.driving.frequency.toFixed(1)} Hz`,
      color: '#e2e8f0',
      width: 90,
      core: true,
    },
    {
      label: 'FUND',
      value: `${state.fundamentalFreq.toFixed(1)} Hz`,
      color: ACCENT_COLOR,
      width: 90,
      core: true,
    },
    {
      label: 'LENGTH',
      value: `${state.stringParams.length.toFixed(2)} m`,
      color: '#e2e8f0',
      width: 80,
    },
    {
      label: 'TENSION',
      value: `${state.stringParams.tension.toFixed(0)} N`,
      color: '#e2e8f0',
      width: 80,
    },
    {
      label: 'DENSITY',
      value: `${(state.stringParams.linearDensity * 1000).toFixed(1)} g/m`,
      color: '#e2e8f0',
      width: 85,
    },
  ]

  // Resonance indicator
  let statusText: string | undefined
  let statusColor: string | undefined
  if (state.resonanceLevel > 0.8) {
    statusText = 'RESONANCE!'
    statusColor = '#22c55e'
  } else if (state.resonanceLevel > 0.5) {
    statusText = 'Near Resonance'
    statusColor = '#f59e0b'
  }

  drawResponsiveHud(ctx, { cells, statusText, statusColor }, width)
}

function drawFrequencyIndicator(
  ctx: CanvasRenderingContext2D,
  state: WaveState,
  width: number,
  _height: number,
): void {
  const centerX = width / 2
  const indicatorY = _height - 80
  const barWidth = 300
  const barHeight = 8

  // Background bar
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fillRect(centerX - barWidth / 2, indicatorY, barWidth, barHeight)

  // Frequency range (show fundamental ± 50% for context)
  const fund = state.fundamentalFreq
  const minFreq = fund * 0.5
  const maxFreq = fund * 1.5
  const range = maxFreq - minFreq

  // Current driving frequency position
  const currentPos = ((state.driving.frequency - minFreq) / range) * barWidth
  ctx.fillStyle = state.resonanceLevel > 0.8 ? '#22c55e' : '#3b82f6'
  ctx.fillRect(centerX - barWidth / 2 + currentPos - 2, indicatorY - 2, 4, barHeight + 4)

  // Harmonic markers
  for (let i = 0; i < Math.min(3, state.harmonics.length); i++) {
    const harmonic = state.harmonics[i]!
    if (harmonic >= minFreq && harmonic <= maxFreq) {
      const pos = ((harmonic - minFreq) / range) * barWidth
      ctx.fillStyle = ACCENT_COLOR
      ctx.fillRect(centerX - barWidth / 2 + pos - 1, indicatorY - 4, 2, barHeight + 8)

      // Label
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${i + 1}`, centerX - barWidth / 2 + pos, indicatorY - 8)
    }
  }

  // Labels
  ctx.font = '11px monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#e2e8f0'
  ctx.fillText(
    `Driving Frequency: ${state.driving.frequency.toFixed(1)} Hz`,
    centerX,
    indicatorY + 25,
  )
}

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

export function renderWaveLab(
  ctx: CanvasRenderingContext2D,
  state: WaveState,
  params: Record<string, unknown>,
  width: number,
  height: number,
): void {
  // Get display parameters
  const showNodes = (params['show-nodes'] as boolean | undefined) ?? true
  const showAntinodes = (params['show-antinodes'] as boolean | undefined) ?? true
  const showHarmonics = (params['show-harmonics'] as boolean | undefined) ?? false

  // Clear and draw background
  drawBackground(ctx, width, height)

  // Draw ruler and grid
  drawRuler(ctx, width, height, state.stringParams.length)

  // Draw harmonic frequency markers
  drawHarmonicMarkers(ctx, state, width, height, showHarmonics)

  // Draw the vibrating string with wave pattern
  drawString(ctx, state, width, height)

  // Draw node and antinode markers
  drawNodes(ctx, state, width, height, showNodes)
  drawAntinodes(ctx, state, width, height, showAntinodes)

  // Draw frequency indicator at bottom
  drawFrequencyIndicator(ctx, state, width, height)

  // Draw HUD with physics data
  drawHud(ctx, state, width)
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Reset any persistent renderer state */
export function resetWaveLabRenderer(): void {
  // No persistent state to reset currently
}
