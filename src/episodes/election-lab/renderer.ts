/**
 * Election Lab — Canvas rendering for election visualization.
 */

import type { ElectionState } from './types.ts'
import type { ParamValues } from '@/engine/types.ts'
import { drawResponsiveHud, type HudCell } from '@/engine/hud-utils.ts'

const ACCENT_COLOR = '#E63946'
const BACKGROUND_COLOR = '#1a1a1a'
const TEXT_COLOR = '#ffffff'
const DISTRICT_STROKE_COLOR = 'rgba(255, 255, 255, 0.3)'

/**
 * Render the election simulation on the canvas.
 */
export function renderElectionLab(
  ctx: CanvasRenderingContext2D,
  state: ElectionState,
  _params: ParamValues,
  width: number,
  height: number,
): void {
  // Clear canvas
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, width, height)

  // Split canvas: political map (left 60%), results chart (right 40%)
  const mapWidth = width * 0.6
  const resultsWidth = width * 0.4

  // Render political space map with voters and candidates
  renderPoliticalMap(ctx, state, mapWidth, height)

  // Render voting results
  renderResults(ctx, state, resultsWidth, height, mapWidth)

  // Render HUD
  renderHUD(ctx, state, width, height)
}

/**
 * Render the 2D political space with voters, candidates, and districts.
 */
function renderPoliticalMap(
  ctx: CanvasRenderingContext2D,
  state: ElectionState,
  width: number,
  height: number,
): void {
  const padding = 40
  const mapWidth = width - 2 * padding
  const mapHeight = height - 2 * padding - 80 // Leave space for HUD

  // Helper: convert political position to canvas coordinates
  const toX = (pos: number) => padding + pos * mapWidth
  const toY = (pos: number) => padding + (1 - pos) * mapHeight // Flip Y for intuitive top-bottom

  // Draw title
  ctx.fillStyle = TEXT_COLOR
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Political Space', padding, padding - 10)

  // Draw axes labels
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Economic Issues', padding + mapWidth / 2, padding + mapHeight + 30)

  ctx.save()
  ctx.translate(padding - 30, padding + mapHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('Social Issues', 0, 0)
  ctx.restore()

  // Draw district boundaries if enabled
  if (state.gerrymanderingEnabled) {
    for (const district of state.districts) {
      if (district.boundaries.length > 2) {
        ctx.strokeStyle = DISTRICT_STROKE_COLOR
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()

        const firstPoint = district.boundaries[0]
        if (firstPoint) {
          ctx.moveTo(toX(firstPoint.x), toY(firstPoint.y))

          for (let i = 1; i < district.boundaries.length; i++) {
            const point = district.boundaries[i]
            if (point) {
              ctx.lineTo(toX(point.x), toY(point.y))
            }
          }

          ctx.closePath()
          ctx.stroke()
        }

        ctx.setLineDash([])

        // Draw district label
        if (district.center) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`D${district.id + 1}`, toX(district.center.x), toY(district.center.y))
        }
      }
    }
  }

  // Draw voters as small dots
  for (const voter of state.voters) {
    const x = toX(voter.position.x)
    const y = toY(voter.position.y)

    // Color voter by their top preference
    const topChoice = voter.preferences[0]
    let voterColor = 'rgba(255, 255, 255, 0.4)'

    if (topChoice !== undefined) {
      const candidate = state.candidates[topChoice]
      if (candidate) {
        voterColor = candidate.color + '80' // Add transparency
      }
    }

    ctx.fillStyle = voterColor
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw candidates as larger circles with labels
  for (const candidate of state.candidates) {
    const x = toX(candidate.position.x)
    const y = toY(candidate.position.y)

    // Draw candidate circle
    ctx.fillStyle = candidate.color
    ctx.beginPath()
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.fill()

    // Draw candidate border
    ctx.strokeStyle = TEXT_COLOR
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw candidate name
    ctx.fillStyle = TEXT_COLOR
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    const firstName = candidate.name.split(' ')[0] ?? 'Unknown'
    ctx.fillText(firstName, x, y - 18) // First name only

    // Show vote count if results available
    if (state.results && state.votingSystem !== 'proportional') {
      const votes = state.results.candidateVotes[candidate.id] || 0
      ctx.font = '9px sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillText(`${votes}`, x, y + 25)
    }

    // Show seat count for proportional representation
    if (state.results && state.votingSystem === 'proportional') {
      const seats = state.results.candidateSeats[candidate.id] || 0
      ctx.font = '9px sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillText(`${seats} seats`, x, y + 25)
    }
  }

  // Draw voting system info
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  let systemName = state.votingSystem.charAt(0).toUpperCase() + state.votingSystem.slice(1)
  if (systemName === 'Ranked-choice') systemName = 'Ranked Choice'
  ctx.fillText(`System: ${systemName}`, padding, padding + mapHeight + 50)
}

/**
 * Render voting results chart.
 */
function renderResults(
  ctx: CanvasRenderingContext2D,
  state: ElectionState,
  width: number,
  _height: number,
  offsetX: number,
): void {
  if (!state.results) return

  const padding = 20
  const chartWidth = width - 2 * padding
  const chartHeight = _height - 160 // Leave space for HUD and labels
  const startX = offsetX + padding
  const startY = 60

  // Draw title
  ctx.fillStyle = TEXT_COLOR
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Results', startX, startY - 10)

  const { results } = state

  if (state.votingSystem === 'proportional') {
    // Render seat allocation chart
    renderSeatChart(ctx, state, startX, startY, chartWidth, chartHeight)
  } else {
    // Render vote count bar chart
    renderVoteChart(ctx, state, startX, startY, chartWidth, chartHeight)
  }

  // Show winner(s)
  ctx.fillStyle = ACCENT_COLOR
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  let winnerText = 'Winner: '

  if (results.winners.length > 0) {
    const winnerNames = results.winners.map((id) => {
      const candidate = state.candidates[id]
      return candidate ? candidate.name.split(' ')[0] : 'Unknown'
    })
    winnerText += winnerNames.join(', ')
  } else {
    winnerText += 'None'
  }

  ctx.fillText(winnerText, startX, startY + chartHeight + 30)

  // Show special conditions
  let alertY = startY + chartHeight + 50

  if (results.spoilerPresent) {
    ctx.fillStyle = '#ff9800'
    ctx.font = '12px sans-serif'
    ctx.fillText('⚠ Spoiler effect detected!', startX, alertY)
    alertY += 20
  }

  if (results.condorcetWinner !== null && !results.winners.includes(results.condorcetWinner)) {
    const candidate = state.candidates[results.condorcetWinner]
    const condorcetName = candidate?.name.split(' ')[0] ?? 'Unknown'
    ctx.fillStyle = '#ff6b35'
    ctx.font = '12px sans-serif'
    ctx.fillText(`⚠ Condorcet winner: ${condorcetName}`, startX, alertY)
    alertY += 20
  }

  if (state.condorcetParadoxExists) {
    ctx.fillStyle = '#e63946'
    ctx.font = '12px sans-serif'
    ctx.fillText('⚠ Condorcet paradox!', startX, alertY)
  }
}

/**
 * Render bar chart for vote counts.
 */
function renderVoteChart(
  ctx: CanvasRenderingContext2D,
  state: ElectionState,
  startX: number,
  startY: number,
  width: number,
  _height: number,
): void {
  if (!state.results) return

  const { results } = state
  const maxVotes = Math.max(...results.candidateVotes)
  const barHeight = 30
  const barSpacing = 10

  results.candidateVotes.forEach((votes, candidateId) => {
    const candidate = state.candidates[candidateId]
    if (!candidate) return

    const y = startY + candidateId * (barHeight + barSpacing)
    const barWidth = maxVotes > 0 ? (votes / maxVotes) * width : 0

    // Draw bar
    ctx.fillStyle = candidate.color
    ctx.fillRect(startX, y, barWidth, barHeight)

    // Draw bar outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(startX, y, width, barHeight)

    // Draw candidate name
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    const firstName = candidate.name.split(' ')[0] ?? 'Unknown'
    ctx.fillText(firstName, startX + 5, y + barHeight / 2 + 4)

    // Draw vote count
    ctx.textAlign = 'right'
    ctx.fillText(`${votes}`, startX + width - 5, y + barHeight / 2 + 4)
  })

  // Draw vote chart title
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Votes', startX, startY - 5)
}

/**
 * Render seat allocation chart for proportional representation.
 */
function renderSeatChart(
  ctx: CanvasRenderingContext2D,
  state: ElectionState,
  startX: number,
  startY: number,
  width: number,
  _height: number,
): void {
  if (!state.results) return

  const { results } = state
  const totalSeats = results.candidateSeats.reduce((sum, seats) => sum + seats, 0)

  if (totalSeats === 0) return

  // Draw seat visualization as a grid
  const seatsPerRow = Math.ceil(Math.sqrt(totalSeats))
  const seatSize = Math.min(width / seatsPerRow, _height / seatsPerRow) - 2

  let seatIndex = 0

  for (let candidateId = 0; candidateId < state.candidates.length; candidateId++) {
    const candidate = state.candidates[candidateId]
    const seats = results.candidateSeats[candidateId] || 0

    if (!candidate || seats === 0) continue

    for (let seat = 0; seat < seats; seat++) {
      const row = Math.floor(seatIndex / seatsPerRow)
      const col = seatIndex % seatsPerRow

      const x = startX + col * (seatSize + 2)
      const y = startY + row * (seatSize + 2)

      ctx.fillStyle = candidate.color
      ctx.fillRect(x, y, seatSize, seatSize)

      seatIndex++
    }
  }

  // Draw legend
  let legendY = startY + Math.ceil(totalSeats / seatsPerRow) * (seatSize + 2) + 20

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Seats', startX, legendY - 5)

  for (let candidateId = 0; candidateId < state.candidates.length; candidateId++) {
    const candidate = state.candidates[candidateId]
    const seats = results.candidateSeats[candidateId] || 0

    if (!candidate || seats === 0) continue

    // Color square
    ctx.fillStyle = candidate.color
    ctx.fillRect(startX, legendY, 12, 12)

    // Name and seat count
    ctx.fillStyle = TEXT_COLOR
    ctx.font = '11px sans-serif'
    const firstName = candidate.name.split(' ')[0] ?? 'Unknown'
    ctx.fillText(`${firstName}: ${seats}`, startX + 18, legendY + 9)

    legendY += 20
  }
}

/**
 * Render the heads-up display with election stats.
 */
function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: ElectionState,
  width: number,
  _height: number,
): void {
  const cells: HudCell[] = [
    { label: 'STEP', value: `${state.step}`, color: '#e2e8f0', width: 55, core: true },
    {
      label: 'SYSTEM',
      value: state.votingSystem.toUpperCase().replace('-', ' '),
      color: ACCENT_COLOR,
      width: 110,
      core: true,
    },
    { label: 'VOTERS', value: `${state.voters.length}`, color: '#e2e8f0', width: 70, core: true },
    {
      label: 'CANDS',
      value: `${state.candidates.length}`,
      color: '#e2e8f0',
      width: 65,
      core: true,
    },
  ]

  if (state.results) {
    const totalVotes = state.results.totalVotes
    cells.push({
      label: 'VOTES',
      value: `${totalVotes}`,
      color: '#10b981',
      width: 65,
    })

    if (state.votingSystem === 'proportional') {
      const totalSeats = state.results.candidateSeats.reduce((sum, seats) => sum + seats, 0)
      cells.push({
        label: 'SEATS',
        value: `${totalSeats}`,
        color: '#8b5cf6',
        width: 65,
      })
    }
  }

  if (state.gerrymanderingEnabled) {
    cells.push({
      label: 'GERR',
      value: 'ON',
      color: '#ff6b35',
      width: 50,
    })
  }

  drawResponsiveHud(ctx, { cells }, width)
}
