/**
 * Canvas renderer for Circuit Lab episode.
 *
 * Renders electrical components on a grid with visual indicators for
 * current flow, voltage levels, and power dissipation. Uses color coding
 * and animated particles to show electrical behavior.
 */

import type { CircuitState, CircuitComponent } from './types.ts'
import { CELL_SIZE } from './physics.ts'

// ---------------------------------------------------------------------------
// Rendering Constants
// ---------------------------------------------------------------------------

/** Engineering domain accent color */
const ACCENT_COLOR = '#FF6B35'

/** Color scheme for voltage visualization */
const VOLTAGE_COLORS = {
  high: '#FF4444',
  medium: '#FFAA44',
  low: '#44FF44',
  zero: '#4444FF',
  negative: '#8844FF',
}

/** Color scheme for current visualization */
const CURRENT_COLORS = {
  high: '#FF2222',
  medium: '#FF8822',
  low: '#22FF22',
  zero: '#CCCCCC',
}

/** Grid colors */
const GRID_COLORS = {
  major: '#333333',
  minor: '#1A1A1A',
  background: '#0A0A0A',
}

/** Component colors */
const COMPONENT_COLORS = {
  resistor: '#DDA0DD',
  capacitor: '#87CEEB',
  battery: '#FFD700',
  switch: '#FFA500',
  bulb: '#FFFF99',
  wire: '#C0C0C0',
  selected: '#FF6B35',
  drag: 'rgba(255, 107, 53, 0.5)',
}

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

/**
 * Render the complete circuit visualization.
 */
export function renderCircuitLab(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  params: Record<string, unknown>,
  width: number,
  height: number,
): void {
  // Clear canvas
  ctx.fillStyle = GRID_COLORS.background
  ctx.fillRect(0, 0, width, height)

  // Calculate viewport and grid offset
  const gridSize = state.gridSize
  const gridWidth = gridSize * CELL_SIZE
  const gridHeight = gridSize * CELL_SIZE
  const offsetX = (width - gridWidth) / 2
  const offsetY = (height - gridHeight) / 2

  // Save context for clipping
  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.rect(0, 0, gridWidth, gridHeight)
  ctx.clip()

  // Render grid
  renderGrid(ctx, gridSize, gridWidth, gridHeight)

  // Render connections (wires)
  renderConnections(ctx, state, params)

  // Render components
  renderComponents(ctx, state, params)

  // Render current flow animation
  const showCurrent = (params['show-current'] as boolean | undefined) ?? true
  if (showCurrent) {
    renderCurrentFlow(ctx, state, params)
  }

  // Render voltage indicators
  const showVoltage = (params['show-voltage'] as boolean | undefined) ?? true
  if (showVoltage) {
    renderVoltageIndicators(ctx, state, params)
  }

  // Render power indicators
  const showPower = (params['show-power'] as boolean | undefined) ?? false
  if (showPower) {
    renderPowerIndicators(ctx, state, params)
  }

  // Render component values
  const showValues = (params['show-values'] as boolean | undefined) ?? true
  if (showValues) {
    renderComponentValues(ctx, state, params)
  }

  ctx.restore()

  // Render circuit analysis info
  renderAnalysisInfo(ctx, state, width, height)
}

// ---------------------------------------------------------------------------
// Grid Rendering
// ---------------------------------------------------------------------------

function renderGrid(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  width: number,
  height: number,
): void {
  ctx.strokeStyle = GRID_COLORS.minor
  ctx.lineWidth = 0.5

  // Vertical lines
  for (let i = 0; i <= gridSize; i++) {
    const x = i * CELL_SIZE
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    const y = i * CELL_SIZE
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Major grid lines every 5 cells
  ctx.strokeStyle = GRID_COLORS.major
  ctx.lineWidth = 1

  for (let i = 0; i <= gridSize; i += 5) {
    const x = i * CELL_SIZE
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()

    const y = i * CELL_SIZE
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

// ---------------------------------------------------------------------------
// Component Rendering
// ---------------------------------------------------------------------------

function renderComponents(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  _params: Record<string, unknown>,
): void {
  for (const component of state.components) {
    const x = component.position.x * CELL_SIZE
    const y = component.position.y * CELL_SIZE
    const isSelected = component.id === state.selectedComponent

    ctx.save()
    ctx.translate(x + CELL_SIZE / 2, y + CELL_SIZE / 2)
    ctx.rotate((component.rotation * Math.PI) / 180)

    renderComponent(ctx, component, isSelected)
    ctx.restore()
  }

  // Render dragged component
  if (state.draggedComponent) {
    const x = state.draggedComponent.position.x * CELL_SIZE
    const y = state.draggedComponent.position.y * CELL_SIZE

    ctx.save()
    ctx.translate(x + CELL_SIZE / 2, y + CELL_SIZE / 2)
    ctx.globalAlpha = 0.7
    renderComponent(ctx, state.draggedComponent, false)
    ctx.restore()
  }
}

function renderComponent(
  ctx: CanvasRenderingContext2D,
  component: CircuitComponent,
  isSelected: boolean,
): void {
  const size = CELL_SIZE * 0.8
  const halfSize = size / 2

  // Selection highlight
  if (isSelected) {
    ctx.strokeStyle = COMPONENT_COLORS.selected
    ctx.lineWidth = 3
    ctx.strokeRect(-halfSize - 2, -halfSize - 2, size + 4, size + 4)
  }

  // Component-specific rendering
  ctx.lineWidth = 2
  ctx.fillStyle = COMPONENT_COLORS[component.type] || '#CCCCCC'
  ctx.strokeStyle = '#000000'

  switch (component.type) {
    case 'resistor':
      renderResistor(ctx, halfSize)
      break
    case 'capacitor':
      renderCapacitor(ctx, halfSize)
      break
    case 'battery':
      renderBattery(ctx, halfSize)
      break
    case 'switch':
      renderSwitch(ctx, halfSize, component.value > 0.5)
      break
    case 'bulb':
      renderBulb(ctx, halfSize)
      break
    case 'wire':
      renderWire(ctx, halfSize)
      break
  }
}

function renderResistor(ctx: CanvasRenderingContext2D, halfSize: number): void {
  ctx.fillRect(-halfSize, -halfSize * 0.3, halfSize * 2, halfSize * 0.6)
  ctx.strokeRect(-halfSize, -halfSize * 0.3, halfSize * 2, halfSize * 0.6)

  // Zigzag pattern
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1
  ctx.beginPath()
  const segments = 6
  for (let i = 0; i <= segments; i++) {
    const x = -halfSize + (i * halfSize * 2) / segments
    const y = ((i % 2) - 0.5) * halfSize * 0.4
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
}

function renderCapacitor(ctx: CanvasRenderingContext2D, halfSize: number): void {
  ctx.lineWidth = 3
  ctx.strokeStyle = COMPONENT_COLORS.capacitor

  // Two parallel plates
  ctx.beginPath()
  ctx.moveTo(-halfSize * 0.2, -halfSize)
  ctx.lineTo(-halfSize * 0.2, halfSize)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(halfSize * 0.2, -halfSize)
  ctx.lineTo(halfSize * 0.2, halfSize)
  ctx.stroke()

  // Connection lines
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-halfSize, 0)
  ctx.lineTo(-halfSize * 0.2, 0)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(halfSize * 0.2, 0)
  ctx.lineTo(halfSize, 0)
  ctx.stroke()
}

function renderBattery(ctx: CanvasRenderingContext2D, halfSize: number): void {
  ctx.fillRect(-halfSize, -halfSize * 0.8, halfSize * 2, halfSize * 1.6)
  ctx.strokeRect(-halfSize, -halfSize * 0.8, halfSize * 2, halfSize * 1.6)

  // Plus and minus symbols
  ctx.fillStyle = '#000000'
  ctx.font = `${halfSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('+', -halfSize * 0.5, 0)
  ctx.fillText('-', halfSize * 0.5, 0)
}

function renderSwitch(ctx: CanvasRenderingContext2D, halfSize: number, closed: boolean): void {
  ctx.strokeStyle = COMPONENT_COLORS.switch
  ctx.lineWidth = 3

  // Connection points
  ctx.beginPath()
  ctx.arc(-halfSize * 0.8, 0, 2, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(halfSize * 0.8, 0, 2, 0, Math.PI * 2)
  ctx.stroke()

  // Switch arm
  ctx.beginPath()
  ctx.moveTo(-halfSize * 0.8, 0)
  if (closed) {
    ctx.lineTo(halfSize * 0.8, 0)
  } else {
    ctx.lineTo(halfSize * 0.4, -halfSize * 0.4)
  }
  ctx.stroke()
}

function renderBulb(ctx: CanvasRenderingContext2D, halfSize: number): void {
  // Bulb outline
  ctx.fillStyle = COMPONENT_COLORS.bulb
  ctx.beginPath()
  ctx.arc(0, 0, halfSize * 0.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Filament
  ctx.strokeStyle = '#FFA500'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-halfSize * 0.3, -halfSize * 0.3)
  ctx.lineTo(halfSize * 0.3, halfSize * 0.3)
  ctx.moveTo(-halfSize * 0.3, halfSize * 0.3)
  ctx.lineTo(halfSize * 0.3, -halfSize * 0.3)
  ctx.stroke()
}

function renderWire(ctx: CanvasRenderingContext2D, halfSize: number): void {
  ctx.strokeStyle = COMPONENT_COLORS.wire
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(-halfSize, 0)
  ctx.lineTo(halfSize, 0)
  ctx.stroke()
}

// ---------------------------------------------------------------------------
// Connection Rendering
// ---------------------------------------------------------------------------

function renderConnections(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  params: Record<string, unknown>,
): void {
  const wireThickness = (params['wire-thickness'] as number | undefined) ?? 3

  ctx.strokeStyle = COMPONENT_COLORS.wire
  ctx.lineWidth = wireThickness

  for (const connection of state.connections) {
    const fromComponent = state.components.find((c) => c.id === connection.fromComponent)
    const toComponent = state.components.find((c) => c.id === connection.toComponent)

    if (!fromComponent || !toComponent) continue

    const fromX = fromComponent.position.x * CELL_SIZE + CELL_SIZE / 2
    const fromY = fromComponent.position.y * CELL_SIZE + CELL_SIZE / 2
    const toX = toComponent.position.x * CELL_SIZE + CELL_SIZE / 2
    const toY = toComponent.position.y * CELL_SIZE + CELL_SIZE / 2

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
  }
}

// ---------------------------------------------------------------------------
// Current Flow Animation
// ---------------------------------------------------------------------------

function renderCurrentFlow(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  params: Record<string, unknown>,
): void {
  const animationSpeed = (params['animation-speed'] as number | undefined) ?? 1.0
  const time = state.time * animationSpeed

  for (const connection of state.connections) {
    const fromComponent = state.components.find((c) => c.id === connection.fromComponent)
    const toComponent = state.components.find((c) => c.id === connection.toComponent)

    if (!fromComponent || !toComponent) continue

    const componentState = state.analysis.components.get(fromComponent.id)
    if (!componentState || Math.abs(componentState.current) < 0.001) continue

    const current = componentState.current
    const fromX = fromComponent.position.x * CELL_SIZE + CELL_SIZE / 2
    const fromY = fromComponent.position.y * CELL_SIZE + CELL_SIZE / 2
    const toX = toComponent.position.x * CELL_SIZE + CELL_SIZE / 2
    const toY = toComponent.position.y * CELL_SIZE + CELL_SIZE / 2

    // Draw animated particles showing current flow
    const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2)
    const numParticles = Math.ceil(distance / 20)

    for (let i = 0; i < numParticles; i++) {
      const progress = (time * 0.5 + i / numParticles) % 1

      // Current direction determines particle direction
      const actualProgress = current > 0 ? progress : 1 - progress
      const particleX = fromX + (toX - fromX) * actualProgress
      const particleY = fromY + (toY - fromY) * actualProgress

      // Color based on current magnitude
      const currentMag = Math.abs(current)
      const color = getCurrentColor(currentMag)
      const size = Math.max(2, Math.min(6, currentMag * 2))

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function getCurrentColor(current: number): string {
  if (current < 0.001) return CURRENT_COLORS.zero
  if (current < 0.1) return CURRENT_COLORS.low
  if (current < 1.0) return CURRENT_COLORS.medium
  return CURRENT_COLORS.high
}

// ---------------------------------------------------------------------------
// Voltage Indicators
// ---------------------------------------------------------------------------

function renderVoltageIndicators(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  _params: Record<string, unknown>,
): void {
  for (const component of state.components) {
    const componentState = state.analysis.components.get(component.id)
    if (!componentState) continue

    const x = component.position.x * CELL_SIZE + CELL_SIZE / 2
    const y = component.position.y * CELL_SIZE + CELL_SIZE / 2
    const voltage = componentState.voltage

    // Color-code component background by voltage
    const color = getVoltageColor(voltage)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    ctx.arc(x, y, CELL_SIZE * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1.0
  }
}

function getVoltageColor(voltage: number): string {
  if (Math.abs(voltage) < 0.1) return VOLTAGE_COLORS.zero
  if (voltage < 0) return VOLTAGE_COLORS.negative
  if (voltage < 3) return VOLTAGE_COLORS.low
  if (voltage < 6) return VOLTAGE_COLORS.medium
  return VOLTAGE_COLORS.high
}

// ---------------------------------------------------------------------------
// Power Indicators
// ---------------------------------------------------------------------------

function renderPowerIndicators(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  _params: Record<string, unknown>,
): void {
  for (const component of state.components) {
    const componentState = state.analysis.components.get(component.id)
    if (!componentState || componentState.power < 0.001) continue

    const x = component.position.x * CELL_SIZE
    const y = component.position.y * CELL_SIZE - 20
    const power = componentState.power

    ctx.fillStyle = '#FF4444'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${power.toFixed(3)}W`, x + CELL_SIZE / 2, y)
  }
}

// ---------------------------------------------------------------------------
// Component Values
// ---------------------------------------------------------------------------

function renderComponentValues(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  _params: Record<string, unknown>,
): void {
  ctx.font = '10px Arial'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'

  for (const component of state.components) {
    const x = component.position.x * CELL_SIZE + CELL_SIZE / 2
    const y = component.position.y * CELL_SIZE + CELL_SIZE + 15

    let valueText = ''
    switch (component.type) {
      case 'resistor':
      case 'bulb':
        valueText = `${component.value}Ω`
        break
      case 'capacitor':
        valueText = `${(component.value * 1000).toFixed(1)}mF`
        break
      case 'battery':
        valueText = `${component.value}V`
        break
      case 'switch':
        valueText = component.value > 0.5 ? 'CLOSED' : 'OPEN'
        break
      case 'wire':
        valueText = `${(component.value * 1000).toFixed(1)}mΩ`
        break
    }

    if (valueText) {
      ctx.fillText(valueText, x, y)
    }
  }
}

// ---------------------------------------------------------------------------
// Analysis Info Panel
// ---------------------------------------------------------------------------

function renderAnalysisInfo(
  ctx: CanvasRenderingContext2D,
  state: CircuitState,
  width: number,
  _height: number,
): void {
  const panelWidth = 200
  const panelHeight = 120
  const panelX = width - panelWidth - 10
  const panelY = 10

  // Panel background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight)

  ctx.strokeStyle = ACCENT_COLOR
  ctx.lineWidth = 2
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

  // Panel content
  ctx.font = '12px Arial'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'left'

  let yOffset = panelY + 20

  ctx.fillText('Circuit Analysis', panelX + 10, yOffset)
  yOffset += 20

  if (state.analysis.valid) {
    ctx.fillStyle = '#44FF44'
    ctx.fillText('✓ Valid', panelX + 10, yOffset)
    yOffset += 15

    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`Total Power: ${state.analysis.totalPower.toFixed(2)}W`, panelX + 10, yOffset)
    yOffset += 15

    ctx.fillText(`Components: ${state.components.length}`, panelX + 10, yOffset)
    yOffset += 15

    ctx.fillText(`Time: ${state.time.toFixed(1)}s`, panelX + 10, yOffset)
  } else {
    ctx.fillStyle = '#FF4444'
    ctx.fillText('✗ Invalid', panelX + 10, yOffset)
    yOffset += 15

    ctx.fillStyle = '#FFAA44'
    ctx.font = '10px Arial'
    for (const error of state.analysis.errors) {
      ctx.fillText(error.substring(0, 25) + '...', panelX + 10, yOffset)
      yOffset += 12
      if (yOffset > panelY + panelHeight - 10) break
    }
  }
}
