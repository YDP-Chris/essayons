/**
 * Canvas rendering for the Bridge Lab episode.
 *
 * Draws the truss bridge with stress-colored beams, nodes, support indicators,
 * load arrows, and HUD statistics.
 */

import type { BridgeState } from './types.ts'
import { MATERIALS } from './physics.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_RADIUS = 6
const SUPPORT_SIZE = 12
const BEAM_WIDTH = 3
const WORLD_PADDING = 2 // meters

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  background: '#1a1a2e',
  safe: '#22c55e', // Green (stress < 30%)
  warning: '#f59e0b', // Yellow (stress 30-70%)
  danger: '#ef4444', // Red (stress > 70%)
  broken: '#7f1d1d', // Dark red for broken beams
  node: '#e2e8f0',
  support: '#94a3b8',
  load: '#ff6b35',
  forceVector: '#3b82f6',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  grid: 'rgba(148, 163, 184, 0.1)',
} as const

// ---------------------------------------------------------------------------
// Coordinate Transform
// ---------------------------------------------------------------------------

interface ViewTransform {
  readonly scale: number
  readonly offsetX: number
  readonly offsetY: number
}

function computeViewTransform(state: BridgeState, width: number, height: number): ViewTransform {
  // Find bounding box of all nodes
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const node of state.nodes) {
    const x = node.x + node.dx
    const y = node.y + node.dy
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  // Add padding
  minX -= WORLD_PADDING
  maxX += WORLD_PADDING
  minY -= WORLD_PADDING
  maxY += WORLD_PADDING

  const worldWidth = maxX - minX
  const worldHeight = maxY - minY

  // Compute scale to fit in canvas
  const scaleX = width / worldWidth
  const scaleY = height / worldHeight
  const scale = Math.min(scaleX, scaleY) * 0.9 // 90% to leave margin

  // Center the view
  const worldCenterX = (minX + maxX) / 2
  const worldCenterY = (minY + maxY) / 2

  const offsetX = width / 2 - worldCenterX * scale
  const offsetY = height / 2 + worldCenterY * scale // flip Y

  return { scale, offsetX, offsetY }
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
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  _state: BridgeState,
  transform: ViewTransform,
  _width: number,
  _height: number,
): void {
  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 1

  // Draw horizontal grid lines every 2 meters
  for (let y = 0; y <= 10; y += 2) {
    const start = worldToScreen(0, y, transform)
    const end = worldToScreen(25, y, transform)
    ctx.beginPath()
    ctx.moveTo(start.sx, start.sy)
    ctx.lineTo(end.sx, end.sy)
    ctx.stroke()
  }

  // Draw vertical grid lines
  for (let x = 0; x <= 25; x += 5) {
    const start = worldToScreen(x, -2, transform)
    const end = worldToScreen(x, 10, transform)
    ctx.beginPath()
    ctx.moveTo(start.sx, start.sy)
    ctx.lineTo(end.sx, end.sy)
    ctx.stroke()
  }
}

function getBeamColor(
  beam: { readonly stress: number; readonly broken: boolean; readonly material: string },
  yieldStrength: number,
): string {
  if (beam.broken) {
    return COLORS.broken
  }

  const stressRatio = beam.stress / yieldStrength

  if (stressRatio < 0.3) {
    return COLORS.safe
  } else if (stressRatio < 0.7) {
    return COLORS.warning
  } else {
    return COLORS.danger
  }
}

function drawBeams(
  ctx: CanvasRenderingContext2D,
  state: BridgeState,
  transform: ViewTransform,
  showStress: boolean,
): void {
  const material = state.beams[0]?.material ?? 'steel'
  const materialProps = MATERIALS[material]

  for (const beam of state.beams) {
    const nodeA = state.nodes[beam.nodeA]
    const nodeB = state.nodes[beam.nodeB]

    if (!nodeA || !nodeB) continue

    const ax = nodeA.x + nodeA.dx
    const ay = nodeA.y + nodeA.dy
    const bx = nodeB.x + nodeB.dx
    const by = nodeB.y + nodeB.dy

    const start = worldToScreen(ax, ay, transform)
    const end = worldToScreen(bx, by, transform)

    // Determine beam color
    const color = showStress ? getBeamColor(beam, materialProps.yieldStrength) : materialProps.color

    ctx.strokeStyle = color
    ctx.lineWidth = BEAM_WIDTH

    // Draw dashed if broken
    if (beam.broken) {
      ctx.setLineDash([8, 4])
    } else {
      ctx.setLineDash([])
    }

    ctx.beginPath()
    ctx.moveTo(start.sx, start.sy)
    ctx.lineTo(end.sx, end.sy)
    ctx.stroke()
  }

  ctx.setLineDash([]) // Reset dash
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  state: BridgeState,
  transform: ViewTransform,
): void {
  for (const node of state.nodes) {
    const x = node.x + node.dx
    const y = node.y + node.dy
    const pos = worldToScreen(x, y, transform)

    if (node.fixed) {
      // Draw support as triangle
      ctx.fillStyle = COLORS.support
      ctx.beginPath()
      ctx.moveTo(pos.sx, pos.sy - SUPPORT_SIZE / 2)
      ctx.lineTo(pos.sx - SUPPORT_SIZE / 2, pos.sy + SUPPORT_SIZE / 2)
      ctx.lineTo(pos.sx + SUPPORT_SIZE / 2, pos.sy + SUPPORT_SIZE / 2)
      ctx.closePath()
      ctx.fill()
    } else {
      // Draw free node as circle
      ctx.fillStyle = COLORS.node
      ctx.beginPath()
      ctx.arc(pos.sx, pos.sy, NODE_RADIUS, 0, 2 * Math.PI)
      ctx.fill()
    }
  }
}

function drawLoadArrow(
  ctx: CanvasRenderingContext2D,
  state: BridgeState,
  transform: ViewTransform,
  loadWeight: number,
): void {
  // Draw load arrow at center-bottom node
  const centerBottomNodeIndex = Math.floor(state.nodes.length / 4)
  const node = state.nodes[centerBottomNodeIndex]

  if (!node) return

  const x = node.x + node.dx
  const y = node.y + node.dy
  const pos = worldToScreen(x, y, transform)

  // Arrow shaft
  const arrowLength = 40
  ctx.strokeStyle = COLORS.load
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(pos.sx, pos.sy - 20)
  ctx.lineTo(pos.sx, pos.sy - 20 - arrowLength)
  ctx.stroke()

  // Arrowhead
  ctx.fillStyle = COLORS.load
  ctx.beginPath()
  ctx.moveTo(pos.sx, pos.sy - 20)
  ctx.lineTo(pos.sx - 8, pos.sy - 28)
  ctx.lineTo(pos.sx + 8, pos.sy - 28)
  ctx.closePath()
  ctx.fill()

  // Label
  ctx.fillStyle = COLORS.load
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`${loadWeight} kg`, pos.sx, pos.sy - 70)
}

function drawForceVectors(
  ctx: CanvasRenderingContext2D,
  state: BridgeState,
  transform: ViewTransform,
): void {
  const scale = 0.00005 // Scale down forces for visibility

  for (const node of state.nodes) {
    if (node.fixed) continue

    const forceMag = Math.sqrt(node.fx * node.fx + node.fy * node.fy)
    if (forceMag < 1) continue

    const x = node.x + node.dx
    const y = node.y + node.dy
    const pos = worldToScreen(x, y, transform)

    const vecLength = forceMag * scale * transform.scale
    const maxLength = 50
    const len = Math.min(vecLength, maxLength)

    const dirX = node.fx / forceMag
    const dirY = node.fy / forceMag

    const endX = pos.sx + dirX * len
    const endY = pos.sy - dirY * len // flip Y

    // Shaft
    ctx.strokeStyle = COLORS.forceVector
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pos.sx, pos.sy)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Arrowhead
    const angle = Math.atan2(-dirY, dirX)
    const headLen = 6

    ctx.fillStyle = COLORS.forceVector
    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - headLen * Math.cos(angle - Math.PI / 6),
      endY + headLen * Math.sin(angle - Math.PI / 6),
    )
    ctx.lineTo(
      endX - headLen * Math.cos(angle + Math.PI / 6),
      endY + headLen * Math.sin(angle + Math.PI / 6),
    )
    ctx.closePath()
    ctx.fill()
  }
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  state: BridgeState,
  width: number,
  _height: number,
): void {
  ctx.font = '12px monospace'
  ctx.textAlign = 'right'

  const lines = [
    `Weight: ${state.totalWeight.toFixed(0)} kg`,
    `Max Stress: ${(state.maxStress / 1e6).toFixed(1)} MPa`,
    `Safety Factor: ${state.safetyFactor === Infinity ? '∞' : state.safetyFactor.toFixed(2)}`,
    `Deflection: ${(state.maxDeflection * 100).toFixed(1)} cm`,
    `Broken Beams: ${state.brokenBeams}`,
    `Time: ${state.simTime.toFixed(1)} s`,
  ]

  const x = width - 16
  let y = 24

  for (const line of lines) {
    const isBroken = line.includes('Broken') && state.brokenBeams > 0

    ctx.fillStyle = isBroken ? COLORS.danger : COLORS.textDim
    ctx.fillText(line, x, y)
    y += 18
  }

  // Draw stress color legend
  ctx.textAlign = 'left'
  const legendX = 16
  let legendY = 24

  ctx.fillStyle = COLORS.text
  ctx.fillText('Stress Legend:', legendX, legendY)
  legendY += 20

  const legendItems = [
    { color: COLORS.safe, label: '< 30%' },
    { color: COLORS.warning, label: '30-70%' },
    { color: COLORS.danger, label: '> 70%' },
    { color: COLORS.broken, label: 'Broken' },
  ]

  for (const item of legendItems) {
    ctx.fillStyle = item.color
    ctx.fillRect(legendX, legendY - 8, 20, 3)
    ctx.fillStyle = COLORS.textDim
    ctx.fillText(item.label, legendX + 28, legendY)
    legendY += 16
  }
}

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

/**
 * Render the complete Bridge Lab scene onto a canvas.
 */
export function renderBridgeLab(
  ctx: CanvasRenderingContext2D,
  state: BridgeState,
  params: Record<string, unknown>,
  width: number,
  height: number,
): void {
  const transform = computeViewTransform(state, width, height)

  const showStress = (params['show-stress'] as boolean | undefined) ?? true
  const showForces = (params['show-forces'] as boolean | undefined) ?? false
  const loadWeight = (params['load-weight'] as number | undefined) ?? 1000

  // 1. Background
  drawBackground(ctx, width, height)

  // 2. Grid
  drawGrid(ctx, state, transform, width, height)

  // 3. Beams
  drawBeams(ctx, state, transform, showStress)

  // 4. Nodes
  drawNodes(ctx, state, transform)

  // 5. Load arrow
  drawLoadArrow(ctx, state, transform, loadWeight)

  // 6. Force vectors (optional)
  if (showForces) {
    drawForceVectors(ctx, state, transform)
  }

  // 7. HUD
  drawHud(ctx, state, width, height)
}
