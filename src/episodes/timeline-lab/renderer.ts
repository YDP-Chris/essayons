import type { RenderContext } from '../../engine/types'
import type { TimelineState } from './types'
import type { ParamValues } from '../../engine/types'
import {
  checkIndustrialSuccess,
  checkRomanSurvival,
  checkSpaceSuccess,
  checkButterflyEffect,
} from './simulation'

const ACCENT_COLOR = '#E9C46A' // History domain color
const ACTUAL_TIMELINE_COLOR = '#8B8B8B'
const ALTERNATE_TIMELINE_COLOR = ACCENT_COLOR
const BACKGROUND_COLOR = '#1A1A1A'
const TEXT_COLOR = '#FFFFFF'
const GRID_COLOR = '#333333'

export function renderTimeline(
  ctx: RenderContext,
  state: TimelineState,
  _params: ParamValues,
  width: number = 800,
  height: number = 600,
): void {
  const context = ctx.ctx

  // Clear canvas
  context.fillStyle = BACKGROUND_COLOR
  context.fillRect(0, 0, width, height)

  // Set up drawing area
  const margin = 60
  const timelineY = height / 2
  const timelineWidth = width - 2 * margin
  const timelineHeight = 200

  // Draw timeline background
  drawTimelineBackground(
    context,
    margin,
    timelineY - timelineHeight / 2,
    timelineWidth,
    timelineHeight,
    state,
  )

  // Draw actual and alternate timelines
  drawHistoryTracks(context, margin, timelineY, timelineWidth, state)

  // Draw events
  drawEvents(context, margin, timelineY, timelineWidth, state)

  // Draw metrics dashboard
  drawMetricsDashboard(context, 20, 20, 200, 150, state)

  // Draw current year indicator
  drawCurrentYearIndicator(context, margin, timelineY, timelineWidth, state)

  // Draw mission progress
  drawMissionProgress(context, width - 220, 20, 200, 100, state)
}

function drawTimelineBackground(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  state: TimelineState,
): void {
  // Timeline background
  context.fillStyle = '#2A2A2A'
  context.fillRect(x, y, width, height)

  // Year grid lines
  const yearRange = state.endYear - state.startYear
  const yearStep = yearRange > 200 ? 50 : yearRange > 100 ? 25 : 10

  context.strokeStyle = GRID_COLOR
  context.lineWidth = 1
  context.font = '12px Arial'
  context.fillStyle = TEXT_COLOR

  for (let year = state.startYear; year <= state.endYear; year += yearStep) {
    const yearX = x + ((year - state.startYear) / yearRange) * width

    // Grid line
    context.beginPath()
    context.moveTo(yearX, y)
    context.lineTo(yearX, y + height)
    context.stroke()

    // Year label
    context.textAlign = 'center'
    context.fillText(year.toString(), yearX, y + height + 15)
  }
}

function drawHistoryTracks(
  context: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  state: TimelineState,
): void {
  const yearRange = state.endYear - state.startYear
  const trackHeight = 60

  // Draw actual history track (top)
  context.fillStyle = ACTUAL_TIMELINE_COLOR
  context.fillRect(x, centerY - trackHeight - 10, width, 4)

  // Draw alternate history track (bottom)
  const progressWidth = ((state.currentYear - state.startYear) / yearRange) * width
  context.fillStyle = ALTERNATE_TIMELINE_COLOR
  context.fillRect(x, centerY + trackHeight + 6, progressWidth, 4)

  // Labels
  context.font = '14px Arial'
  context.fillStyle = TEXT_COLOR
  context.textAlign = 'left'
  context.fillText('Actual History', x, centerY - trackHeight + 5)
  context.fillText('Your Timeline', x, centerY + trackHeight + 25)
}

function drawEvents(
  context: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  state: TimelineState,
): void {
  const yearRange = state.endYear - state.startYear

  // Draw actual historical events
  for (const event of state.actualEvents) {
    if (event.year >= state.startYear && event.year <= state.endYear) {
      const eventX = x + ((event.year - state.startYear) / yearRange) * width

      context.fillStyle = ACTUAL_TIMELINE_COLOR
      context.beginPath()
      context.arc(eventX, centerY - 70, 6, 0, 2 * Math.PI)
      context.fill()

      // Event label (only for major events to avoid clutter)
      if (event.impact.technology || 0 > 5 || (event.impact.population || 0) < -10) {
        context.font = '10px Arial'
        context.fillStyle = TEXT_COLOR
        context.textAlign = 'center'
        context.fillText(event.title, eventX, centerY - 85)
      }
    }
  }

  // Draw triggered alternate events
  for (const event of state.triggeredEvents) {
    if (event.year >= state.startYear && event.year <= state.endYear) {
      const eventX = x + ((event.year - state.startYear) / yearRange) * width

      context.fillStyle = event.actual ? ACTUAL_TIMELINE_COLOR : ALTERNATE_TIMELINE_COLOR
      context.beginPath()
      context.arc(eventX, centerY + 70, 6, 0, 2 * Math.PI)
      context.fill()

      // Alternate event marker
      if (!event.actual) {
        context.strokeStyle = ALTERNATE_TIMELINE_COLOR
        context.lineWidth = 2
        context.stroke()
      }
    }
  }
}

function drawCurrentYearIndicator(
  context: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  width: number,
  state: TimelineState,
): void {
  const yearRange = state.endYear - state.startYear
  const currentX = x + ((state.currentYear - state.startYear) / yearRange) * width

  // Current year line
  context.strokeStyle = ACCENT_COLOR
  context.lineWidth = 3
  context.setLineDash([5, 5])
  context.beginPath()
  context.moveTo(currentX, centerY - 100)
  context.lineTo(currentX, centerY + 100)
  context.stroke()
  context.setLineDash([])

  // Current year label
  context.font = 'bold 16px Arial'
  context.fillStyle = ACCENT_COLOR
  context.textAlign = 'center'
  context.fillText(state.currentYear.toString(), currentX, centerY - 110)
}

function drawMetricsDashboard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  state: TimelineState,
): void {
  // Dashboard background
  context.fillStyle = 'rgba(42, 42, 42, 0.9)'
  context.fillRect(x, y, width, height)

  // Title
  context.font = 'bold 14px Arial'
  context.fillStyle = TEXT_COLOR
  context.textAlign = 'left'
  context.fillText('Metrics', x + 10, y + 20)

  const metrics = getScenarioMetrics(state)
  let currentY = y + 40

  for (const metric of metrics) {
    // Metric name
    context.font = '12px Arial'
    context.fillStyle = TEXT_COLOR
    context.fillText(metric.name, x + 10, currentY)

    // Metric bar
    const barX = x + 80
    const barWidth = 100
    const barHeight = 8

    context.fillStyle = '#444444'
    context.fillRect(barX, currentY - 6, barWidth, barHeight)

    const fillWidth = Math.min(barWidth, (metric.value / metric.max) * barWidth)
    context.fillStyle = metric.color
    context.fillRect(barX, currentY - 6, fillWidth, barHeight)

    // Value
    context.font = '10px Arial'
    context.fillStyle = TEXT_COLOR
    context.textAlign = 'right'
    context.fillText(`${Math.round(metric.value)}${metric.unit}`, x + width - 10, currentY)

    currentY += 18
  }
}

function drawMissionProgress(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  state: TimelineState,
): void {
  // Mission background
  context.fillStyle = 'rgba(42, 42, 42, 0.9)'
  context.fillRect(x, y, width, height)

  // Title
  context.font = 'bold 14px Arial'
  context.fillStyle = TEXT_COLOR
  context.textAlign = 'left'
  context.fillText('Missions', x + 10, y + 20)

  // Mission status indicators
  const missions = getMissionStatus(state)
  let currentY = y + 40

  for (const mission of missions) {
    // Status indicator
    context.fillStyle = mission.completed ? '#4CAF50' : '#666666'
    context.beginPath()
    context.arc(x + 15, currentY - 3, 4, 0, 2 * Math.PI)
    context.fill()

    // Mission name
    context.font = '11px Arial'
    context.fillStyle = mission.completed ? '#4CAF50' : TEXT_COLOR
    context.textAlign = 'left'
    context.fillText(mission.name, x + 25, currentY)

    currentY += 16
  }

  // Divergence score
  currentY += 10
  context.font = '12px Arial'
  context.fillStyle = TEXT_COLOR
  context.fillText(`Divergence: ${Math.round(state.divergenceScore)}%`, x + 10, currentY)
}

function getScenarioMetrics(state: TimelineState) {
  switch (state.scenario) {
    case 'industrial':
      return [
        { name: 'Population', value: state.population, max: 2000, unit: 'M', color: '#4CAF50' },
        { name: 'Technology', value: state.technology, max: 100, unit: '%', color: '#2196F3' },
        { name: 'Economy', value: state.economy, max: 300, unit: '', color: '#FF9800' },
        { name: 'Military', value: state.military, max: 100, unit: '', color: '#F44336' },
        { name: 'Culture', value: state.culture, max: 100, unit: '%', color: '#9C27B0' },
      ]
    case 'roman':
      return [
        { name: 'Population', value: state.population, max: 100, unit: 'M', color: '#4CAF50' },
        { name: 'Technology', value: state.technology, max: 100, unit: '%', color: '#2196F3' },
        { name: 'Economy', value: state.economy, max: 150, unit: '', color: '#FF9800' },
        { name: 'Military', value: state.military, max: 120, unit: '', color: '#F44336' },
        { name: 'Culture', value: state.culture, max: 100, unit: '%', color: '#9C27B0' },
        { name: 'Territory', value: state.territory, max: 40, unit: 'M km²', color: '#795548' },
      ]
    case 'space':
      return [
        { name: 'Support', value: state.population, max: 100, unit: '%', color: '#4CAF50' },
        { name: 'Technology', value: state.technology, max: 100, unit: '%', color: '#2196F3' },
        { name: 'Budget', value: state.economy, max: 200, unit: 'B', color: '#FF9800' },
        { name: 'Program', value: state.military, max: 100, unit: '%', color: '#F44336' },
        { name: 'Culture', value: state.culture, max: 100, unit: '%', color: '#9C27B0' },
        { name: 'Cooperation', value: state.territory, max: 100, unit: '%', color: '#607D8B' },
      ]
    default:
      return []
  }
}

function getMissionStatus(state: TimelineState) {
  return [
    {
      name: 'Rewrite Industrial',
      completed: checkIndustrialSuccess(state),
    },
    {
      name: 'Save Rome',
      completed: checkRomanSurvival(state),
    },
    {
      name: 'Space Race Early',
      completed: checkSpaceSuccess(state),
    },
    {
      name: 'Butterfly Effect',
      completed: checkButterflyEffect(state),
    },
  ].filter((mission) => {
    // Only show relevant missions for current scenario
    if (state.scenario === 'industrial' && mission.name === 'Rewrite Industrial') return true
    if (state.scenario === 'roman' && mission.name === 'Save Rome') return true
    if (state.scenario === 'space' && mission.name === 'Space Race Early') return true
    if (mission.name === 'Butterfly Effect') return true
    return false
  })
}
