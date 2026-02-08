/**
 * Canvas renderer for the Citizen Lab episode.
 *
 * Renders a visual representation of the legislative state machine,
 * showing current state, transitions, vote counts, and decision history.
 */

import type { ParamValues } from '@/engine/types.ts'
import type { CivicsSimulationState, LegislativeState } from './types.ts'

// Civics accent color
const ACCENT_COLOR = '#e63946'
const ACTIVE_COLOR = '#f1faee'
const INACTIVE_COLOR = '#a8dadc'
const TEXT_COLOR = '#1d3557'
const BG_COLOR = '#f1faee'
const EDGE_COLOR = '#457b9d'

// ---------------------------------------------------------------------------
// State Machine Layout
// ---------------------------------------------------------------------------

interface StateNode {
  x: number
  y: number
  label: string
  state: LegislativeState
}

/**
 * Layout the state machine nodes in a flow diagram.
 */
function layoutStateMachine(width: number, _height: number): StateNode[] {
  const centerX = width / 2
  const startY = 80
  const verticalSpacing = 100

  return [
    { x: centerX, y: startY, label: 'Proposal', state: 'PROPOSAL' },
    { x: centerX, y: startY + verticalSpacing, label: 'Committee', state: 'COMMITTEE' },
    { x: centerX, y: startY + verticalSpacing * 2, label: 'Floor Debate', state: 'FLOOR_DEBATE' },
    { x: centerX, y: startY + verticalSpacing * 3, label: 'Vote', state: 'VOTE' },
    {
      x: centerX - 150,
      y: startY + verticalSpacing * 4,
      label: 'Passed',
      state: 'PASSED',
    },
    {
      x: centerX + 150,
      y: startY + verticalSpacing * 4,
      label: 'Vetoed',
      state: 'VETOED',
    },
    {
      x: centerX + 150,
      y: startY + verticalSpacing * 5,
      label: 'Override Attempt',
      state: 'OVERRIDE_ATTEMPT',
    },
    {
      x: centerX + 300,
      y: startY + verticalSpacing * 6,
      label: 'Override Success',
      state: 'OVERRIDE_SUCCESS',
    },
    {
      x: centerX,
      y: startY + verticalSpacing * 6,
      label: 'Override Failed',
      state: 'OVERRIDE_FAILED',
    },
    {
      x: centerX - 150,
      y: startY + verticalSpacing * 2.5,
      label: 'Rejected',
      state: 'REJECTED',
    },
  ]
}

// ---------------------------------------------------------------------------
// Drawing Utilities
// ---------------------------------------------------------------------------

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): void {
  const headLength = 10
  const angle = Math.atan2(toY - fromY, toX - fromX)

  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6),
  )
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6),
  )
  ctx.stroke()
}

function drawStateNode(ctx: CanvasRenderingContext2D, node: StateNode, isActive: boolean): void {
  const radius = 40

  // Draw circle
  ctx.beginPath()
  ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
  ctx.fillStyle = isActive ? ACCENT_COLOR : INACTIVE_COLOR
  ctx.fill()
  ctx.strokeStyle = TEXT_COLOR
  ctx.lineWidth = isActive ? 3 : 2
  ctx.stroke()

  // Draw label
  ctx.fillStyle = isActive ? ACTIVE_COLOR : TEXT_COLOR
  ctx.font = isActive ? 'bold 12px sans-serif' : '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Split label into multiple lines if needed
  const words = node.label.split(' ')
  if (words.length > 1) {
    ctx.fillText(words[0] ?? '', node.x, node.y - 6)
    ctx.fillText(words.slice(1).join(' '), node.x, node.y + 6)
  } else {
    ctx.fillText(node.label, node.x, node.y)
  }
}

function drawGauge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  value: number,
  label: string,
  unit: string,
): void {
  // Background
  ctx.fillStyle = '#e0e0e0'
  ctx.fillRect(x, y, width, height)

  // Fill
  const fillWidth = (value / 100) * width
  ctx.fillStyle = ACCENT_COLOR
  ctx.fillRect(x, y, fillWidth, height)

  // Border
  ctx.strokeStyle = TEXT_COLOR
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, width, height)

  // Label
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(label, x, y - 5)

  // Value
  ctx.textAlign = 'right'
  ctx.fillText(`${value}${unit}`, x + width, y - 5)
}

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

export function renderCitizenLab(
  ctx: CanvasRenderingContext2D,
  state: CivicsSimulationState,
  _params: ParamValues,
  width: number,
  height: number,
): void {
  // Clear canvas
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, width, height)

  // Layout nodes
  const nodes = layoutStateMachine(width, height)

  // Draw edges (transitions)
  ctx.strokeStyle = EDGE_COLOR
  ctx.lineWidth = 2

  const transitions = [
    ['PROPOSAL', 'COMMITTEE'],
    ['COMMITTEE', 'FLOOR_DEBATE'],
    ['COMMITTEE', 'REJECTED'],
    ['FLOOR_DEBATE', 'VOTE'],
    ['FLOOR_DEBATE', 'REJECTED'],
    ['VOTE', 'PASSED'],
    ['VOTE', 'VETOED'],
    ['VETOED', 'OVERRIDE_ATTEMPT'],
    ['OVERRIDE_ATTEMPT', 'OVERRIDE_SUCCESS'],
    ['OVERRIDE_ATTEMPT', 'OVERRIDE_FAILED'],
  ]

  for (const [from, to] of transitions) {
    const fromNode = nodes.find((n) => n.state === from)
    const toNode = nodes.find((n) => n.state === to)
    if (fromNode && toNode) {
      // Calculate edge start/end points (on circle perimeter)
      const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)
      const radius = 40
      const startX = fromNode.x + radius * Math.cos(angle)
      const startY = fromNode.y + radius * Math.sin(angle)
      const endX = toNode.x - radius * Math.cos(angle)
      const endY = toNode.y - radius * Math.sin(angle)

      drawArrow(ctx, startX, startY, endX, endY)
    }
  }

  // Draw nodes
  for (const node of nodes) {
    const isActive = node.state === state.legislativeState
    drawStateNode(ctx, node, isActive)
  }

  // Draw parameter gauges on the right side
  const gaugeX = width - 220
  const gaugeY = 20
  const gaugeWidth = 200
  const gaugeHeight = 20
  const gaugeSpacing = 40

  drawGauge(
    ctx,
    gaugeX,
    gaugeY,
    gaugeWidth,
    gaugeHeight,
    state.partyComposition,
    'Party Composition',
    '%',
  )
  drawGauge(
    ctx,
    gaugeX,
    gaugeY + gaugeSpacing,
    gaugeWidth,
    gaugeHeight,
    state.publicApproval,
    'Public Approval',
    '%',
  )
  drawGauge(
    ctx,
    gaugeX,
    gaugeY + gaugeSpacing * 2,
    gaugeWidth,
    gaugeHeight,
    state.lobbyingPressure,
    'Lobbying Pressure',
    '%',
  )
  drawGauge(
    ctx,
    gaugeX,
    gaugeY + gaugeSpacing * 3,
    gaugeWidth,
    gaugeHeight,
    state.mediaCoverage,
    'Media Coverage',
    '%',
  )

  // Draw vote count if in VOTE state or beyond
  if (
    state.legislativeState === 'VOTE' ||
    state.legislativeState === 'PASSED' ||
    state.legislativeState === 'VETOED' ||
    state.legislativeState === 'OVERRIDE_ATTEMPT' ||
    state.legislativeState === 'OVERRIDE_SUCCESS' ||
    state.legislativeState === 'OVERRIDE_FAILED'
  ) {
    const voteX = 20
    const voteY = height - 120

    ctx.fillStyle = TEXT_COLOR
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Vote Count', voteX, voteY)

    ctx.font = '12px sans-serif'
    ctx.fillText(`Yea: ${state.voteCount.yea}`, voteX, voteY + 20)
    ctx.fillText(`Nay: ${state.voteCount.nay}`, voteX, voteY + 40)

    // Show required thresholds
    ctx.fillStyle = '#666'
    ctx.font = '11px sans-serif'
    ctx.fillText('(Simple majority: 51)', voteX, voteY + 60)
    ctx.fillText('(Supermajority: 67)', voteX, voteY + 75)
  }

  // Draw statistics
  const statsX = 20
  const statsY = 20

  ctx.fillStyle = TEXT_COLOR
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Legislative Stats', statsX, statsY)

  ctx.font = '11px sans-serif'
  ctx.fillText(`Bills Processed: ${state.billsProcessed}`, statsX, statsY + 20)
  ctx.fillText(`Vetoes: ${state.vetoCount}`, statsX, statsY + 35)
  ctx.fillText(`Override Attempts: ${state.overrideAttempts}`, statsX, statsY + 50)
  ctx.fillText(`Override Successes: ${state.overrideSuccesses}`, statsX, statsY + 65)

  // Draw current bill title
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = ACCENT_COLOR
  ctx.fillText(state.billTitle, width / 2, 30)

  // Draw decision history timeline at bottom
  if (state.decisionHistory.length > 0) {
    const timelineY = height - 40
    const timelineX = 20
    const timelineWidth = width - 40

    ctx.strokeStyle = TEXT_COLOR
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(timelineX, timelineY)
    ctx.lineTo(timelineX + timelineWidth, timelineY)
    ctx.stroke()

    // Draw recent events (last 10)
    const recentEvents = state.decisionHistory.slice(-10)
    const eventSpacing = timelineWidth / Math.max(recentEvents.length - 1, 1)

    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    recentEvents.forEach((event, index) => {
      const x = timelineX + index * eventSpacing
      ctx.fillStyle = ACCENT_COLOR
      ctx.beginPath()
      ctx.arc(x, timelineY, 4, 0, Math.PI * 2)
      ctx.fill()

      // Event label (abbreviated)
      ctx.fillStyle = TEXT_COLOR
      const shortLabel = event.event.split('_').slice(0, 2).join(' ')
      ctx.fillText(shortLabel, x, timelineY + 15)
    })
  }
}
