/**
 * Shared responsive HUD utilities for canvas-rendered telemetry bars.
 *
 * On narrow canvases (< 480px), shows a compact layout with only core
 * metrics. On wider canvases, renders the full horizontal bar.
 *
 * Tap-to-expand support: tapping the HUD bar region on narrow canvases
 * toggles between compact (4 core metrics) and expanded (all metrics)
 * views.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HudCell {
  readonly label: string
  readonly value: string
  readonly color: string
  /** Default width in full layout. Compact layout overrides this. */
  readonly width: number
  /** Whether this cell is a "core" metric shown in compact mode. */
  readonly core?: boolean
}

export interface HudConfig {
  /** All metric cells to display. */
  readonly cells: readonly HudCell[]
  /** Optional status badge text (e.g., "CRASHED", "ESCAPED"). */
  readonly statusText?: string
  /** Optional status badge color (e.g., "#ef4444"). */
  readonly statusColor?: string
}

// ---------------------------------------------------------------------------
// Module-level expand/collapse state
// ---------------------------------------------------------------------------

let _hudExpanded = false

/** Get the current HUD bar height (for layout calculations). */
export function getHudBarHeight(canvasWidth: number): number {
  if (canvasWidth < 480) {
    return _hudExpanded ? 68 : 36
  }
  return 44
}

/** Reset HUD expand state (call on episode reset). */
export function resetHudState(): void {
  _hudExpanded = false
}

/**
 * Handle a tap/click at coordinates (x, y) on the canvas.
 * Returns true if the tap was inside the HUD bar region.
 */
export function handleHudTap(_x: number, y: number, canvasWidth: number): boolean {
  if (canvasWidth >= 480) return false
  const barHeight = getHudBarHeight(canvasWidth)
  if (y <= barHeight) {
    _hudExpanded = !_hudExpanded
    return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Compact Layout
// ---------------------------------------------------------------------------

function drawCompactHud(
  ctx: CanvasRenderingContext2D,
  cells: readonly HudCell[],
  width: number,
): number {
  const coreCells = cells.filter((c) => c.core)
  const displayCells = _hudExpanded ? cells : coreCells

  const labelFont = '8px monospace'
  const valueFont = 'bold 11px monospace'

  if (_hudExpanded && displayCells.length > 4) {
    // Two-row layout
    const barHeight = 68
    const halfLen = Math.ceil(displayCells.length / 2)
    const row1 = displayCells.slice(0, halfLen)
    const row2 = displayCells.slice(halfLen)

    // Background
    ctx.fillStyle = 'rgba(5, 8, 18, 0.8)'
    ctx.fillRect(0, 0, width, barHeight)
    ctx.fillStyle = 'rgba(100, 180, 255, 0.08)'
    ctx.fillRect(0, barHeight - 1, width, 1)

    // Row 1
    const cellWidth1 = width / row1.length
    for (let i = 0; i < row1.length; i++) {
      const cell = row1[i]!
      const cx = i * cellWidth1
      drawCompactCell(ctx, cell, cx, 2, cellWidth1, labelFont, valueFont)
    }

    // Row 2
    const cellWidth2 = width / Math.max(1, row2.length)
    for (let i = 0; i < row2.length; i++) {
      const cell = row2[i]!
      const cx = i * cellWidth2
      drawCompactCell(ctx, cell, cx, 34, cellWidth2, labelFont, valueFont)
    }

    return barHeight
  }

  // Single-row compact layout
  const barHeight = 36

  ctx.fillStyle = 'rgba(5, 8, 18, 0.8)'
  ctx.fillRect(0, 0, width, barHeight)
  ctx.fillStyle = 'rgba(100, 180, 255, 0.08)'
  ctx.fillRect(0, barHeight - 1, width, 1)

  const cellWidth = width / displayCells.length
  for (let i = 0; i < displayCells.length; i++) {
    const cell = displayCells[i]!
    const cx = i * cellWidth
    drawCompactCell(ctx, cell, cx, 2, cellWidth, labelFont, valueFont)
  }

  return barHeight
}

function drawCompactCell(
  ctx: CanvasRenderingContext2D,
  cell: HudCell,
  x: number,
  y: number,
  cellWidth: number,
  labelFont: string,
  valueFont: string,
): void {
  const pad = 4

  // Left accent
  ctx.fillStyle = cell.color
  ctx.globalAlpha = 0.3
  ctx.fillRect(x + 1, y + 3, 2, 26)
  ctx.globalAlpha = 1

  // Label
  ctx.font = labelFont
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  const labelText = cell.label.length > 4 ? cell.label.slice(0, 4) : cell.label
  ctx.fillText(labelText, x + pad, y + 11)

  // Value
  ctx.font = valueFont
  ctx.fillStyle = cell.color
  // Truncate value if too wide
  const maxValWidth = cellWidth - pad * 2
  let val = cell.value
  while (ctx.measureText(val).width > maxValWidth && val.length > 2) {
    val = val.slice(0, -1)
  }
  ctx.fillText(val, x + pad, y + 26)
}

// ---------------------------------------------------------------------------
// Full Layout
// ---------------------------------------------------------------------------

function drawFullHud(
  ctx: CanvasRenderingContext2D,
  cells: readonly HudCell[],
  width: number,
): number {
  const barHeight = 44
  const barPad = 8
  const cellGap = 2
  const totalCellWidth = cells.reduce((sum, c) => sum + c.width + cellGap, 0)
  const barLeft = Math.max(0, (width - totalCellWidth) / 2)

  // Background bar
  ctx.fillStyle = 'rgba(5, 8, 18, 0.75)'
  ctx.fillRect(0, 0, width, barHeight)
  ctx.fillStyle = 'rgba(100, 180, 255, 0.08)'
  ctx.fillRect(0, barHeight - 1, width, 1)

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

  return barHeight
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function drawStatusBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  barHeight: number,
  text: string,
  color: string,
): void {
  const bg = color === '#ef4444' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'

  ctx.font = 'bold 14px monospace'
  const tw = ctx.measureText(text).width
  const badgeW = tw + 24
  const badgeX = (width - badgeW) / 2
  const badgeY = barHeight + 12

  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, badgeW, 28, 6)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, badgeW, 28, 6)
  ctx.stroke()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText(text, width / 2, badgeY + 20)
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Render a responsive HUD bar across the top of the canvas.
 *
 * @returns The height of the HUD bar in pixels (for downstream layout).
 */
export function drawResponsiveHud(
  ctx: CanvasRenderingContext2D,
  config: HudConfig,
  width: number,
): number {
  const barHeight =
    width < 480 ? drawCompactHud(ctx, config.cells, width) : drawFullHud(ctx, config.cells, width)

  if (config.statusText && config.statusColor) {
    drawStatusBadge(ctx, width, barHeight, config.statusText, config.statusColor)
  }

  return barHeight
}
