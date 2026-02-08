/**
 * Market Lab — Canvas rendering for supply/demand visualization.
 */

import type { MarketState } from './types.ts'
import type { ParamValues } from '@/engine/types.ts'

const ACCENT_COLOR = '#2a9d8f'
const CONSUMER_SURPLUS_COLOR = 'rgba(76, 175, 80, 0.3)' // Green
const PRODUCER_SURPLUS_COLOR = 'rgba(33, 150, 243, 0.3)' // Blue
const EQUILIBRIUM_COLOR = '#ff5722'
const PRICE_LINE_COLOR = '#9c27b0'
const GRID_COLOR = 'rgba(255, 255, 255, 0.1)'

/**
 * Render the market simulation on the canvas.
 */
export function renderMarketLab(
  ctx: CanvasRenderingContext2D,
  state: MarketState,
  _params: ParamValues,
  width: number,
  height: number,
): void {
  // Clear canvas
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, width, height)

  // Split canvas: supply/demand chart (top 60%), price history (bottom 40%)
  const chartHeight = height * 0.6
  const historyHeight = height * 0.4

  // Render supply/demand chart
  renderSupplyDemandChart(ctx, state, width, chartHeight)

  // Render price history chart
  renderPriceHistory(ctx, state, width, historyHeight, chartHeight)

  // Render HUD
  renderHUD(ctx, state, width, height)
}

/**
 * Render the supply and demand curves with equilibrium and current price.
 */
function renderSupplyDemandChart(
  ctx: CanvasRenderingContext2D,
  state: MarketState,
  width: number,
  height: number,
): void {
  const padding = 60
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Determine scale
  const maxQuantity = Math.max(state.buyers.length, state.sellers.length)
  const maxPrice = 200

  const scaleX = chartWidth / maxQuantity
  const scaleY = chartHeight / maxPrice

  // Helper: convert quantity and price to canvas coordinates
  const toX = (q: number) => padding + q * scaleX
  const toY = (p: number) => padding + chartHeight - p * scaleY

  // Draw grid
  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth = 1
  for (let q = 0; q <= maxQuantity; q += 10) {
    ctx.beginPath()
    ctx.moveTo(toX(q), padding)
    ctx.moveTo(toX(q), padding + chartHeight)
    ctx.stroke()
  }
  for (let p = 0; p <= maxPrice; p += 20) {
    ctx.beginPath()
    ctx.moveTo(padding, toY(p))
    ctx.lineTo(padding + chartWidth, toY(p))
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, padding + chartHeight)
  ctx.lineTo(padding + chartWidth, padding + chartHeight)
  ctx.stroke()

  // Axis labels
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Quantity', padding + chartWidth / 2, padding + chartHeight + 40)
  ctx.save()
  ctx.translate(padding - 40, padding + chartHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('Price ($)', 0, 0)
  ctx.restore()

  // Draw demand curve (buyers sorted high to low)
  ctx.strokeStyle = ACCENT_COLOR
  ctx.lineWidth = 3
  ctx.beginPath()
  state.buyers.forEach((buyer, i) => {
    const x = toX(i)
    const y = toY(buyer.willingnessToPay)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw supply curve (sellers sorted low to high)
  ctx.strokeStyle = '#ff9800'
  ctx.lineWidth = 3
  ctx.beginPath()
  state.sellers.forEach((seller, i) => {
    const x = toX(i)
    const y = toY(seller.cost)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Shade consumer surplus (green area above price, below demand)
  if (state.quantityTraded > 0) {
    ctx.fillStyle = CONSUMER_SURPLUS_COLOR
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(state.price))
    for (let i = 0; i < state.quantityTraded && i < state.buyers.length; i++) {
      const buyer = state.buyers[i]
      if (buyer) {
        ctx.lineTo(toX(i), toY(buyer.willingnessToPay))
      }
    }
    ctx.lineTo(toX(state.quantityTraded), toY(state.price))
    ctx.closePath()
    ctx.fill()
  }

  // Shade producer surplus (blue area below price, above supply)
  if (state.quantityTraded > 0) {
    ctx.fillStyle = PRODUCER_SURPLUS_COLOR
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(state.price))
    for (let i = 0; i < state.quantityTraded && i < state.sellers.length; i++) {
      const seller = state.sellers[i]
      if (seller) {
        ctx.lineTo(toX(i), toY(seller.cost))
      }
    }
    ctx.lineTo(toX(state.quantityTraded), toY(state.price))
    ctx.closePath()
    ctx.fill()
  }

  // Draw equilibrium point
  ctx.fillStyle = EQUILIBRIUM_COLOR
  ctx.beginPath()
  ctx.arc(toX(state.equilibriumQuantity), toY(state.equilibriumPrice), 6, 0, Math.PI * 2)
  ctx.fill()

  // Draw equilibrium label
  ctx.fillStyle = EQUILIBRIUM_COLOR
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(
    `Equilibrium: $${state.equilibriumPrice.toFixed(1)}`,
    toX(state.equilibriumQuantity) + 10,
    toY(state.equilibriumPrice) - 10,
  )

  // Draw current price line (horizontal dashed line)
  if (state.day > 0) {
    ctx.strokeStyle = PRICE_LINE_COLOR
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding, toY(state.price))
    ctx.lineTo(padding + chartWidth, toY(state.price))
    ctx.stroke()
    ctx.setLineDash([])

    // Price label
    ctx.fillStyle = PRICE_LINE_COLOR
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`$${state.price.toFixed(1)}`, padding - 10, toY(state.price) + 4)
  }

  // Draw legend
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  let legendY = padding + 20
  ctx.fillStyle = ACCENT_COLOR
  ctx.fillText('Demand', padding + chartWidth - 150, legendY)
  legendY += 20
  ctx.fillStyle = '#ff9800'
  ctx.fillText('Supply', padding + chartWidth - 150, legendY)
  legendY += 20
  ctx.fillStyle = EQUILIBRIUM_COLOR
  ctx.fillText('Equilibrium', padding + chartWidth - 150, legendY)
  legendY += 20
  ctx.fillStyle = PRICE_LINE_COLOR
  ctx.fillText('Current Price', padding + chartWidth - 150, legendY)
}

/**
 * Render the price history line chart.
 */
function renderPriceHistory(
  ctx: CanvasRenderingContext2D,
  state: MarketState,
  width: number,
  height: number,
  offsetY: number,
): void {
  if (state.priceHistory.length === 0) return

  const padding = 60
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  const maxPrice = 200
  const maxDays = 100

  const scaleX = chartWidth / maxDays
  const scaleY = chartHeight / maxPrice

  const toX = (day: number) => padding + day * scaleX
  const toY = (price: number) => offsetY + padding + chartHeight - price * scaleY

  // Draw axes
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, offsetY + padding)
  ctx.lineTo(padding, offsetY + padding + chartHeight)
  ctx.lineTo(padding + chartWidth, offsetY + padding + chartHeight)
  ctx.stroke()

  // Axis labels
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Day', padding + chartWidth / 2, offsetY + padding + chartHeight + 30)

  // Draw equilibrium price reference line
  ctx.strokeStyle = EQUILIBRIUM_COLOR
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(padding, toY(state.equilibriumPrice))
  ctx.lineTo(padding + chartWidth, toY(state.equilibriumPrice))
  ctx.stroke()
  ctx.setLineDash([])

  // Draw price history line
  ctx.strokeStyle = ACCENT_COLOR
  ctx.lineWidth = 2
  ctx.beginPath()
  state.priceHistory.forEach((price, i) => {
    const x = toX(i)
    const y = toY(price)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Price History', padding, offsetY + padding - 10)
}

/**
 * Render the heads-up display with simulation stats.
 */
function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: MarketState,
  width: number,
  height: number,
): void {
  const hudX = 20
  const hudY = height - 120

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(hudX - 10, hudY - 10, 250, 110)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`Day: ${state.day}`, hudX, hudY)
  ctx.fillText(`Price: $${state.price.toFixed(2)}`, hudX, hudY + 20)
  ctx.fillText(`Quantity Traded: ${state.quantityTraded}`, hudX, hudY + 40)
  ctx.fillText(`Consumer Surplus: $${state.consumerSurplus.toFixed(0)}`, hudX, hudY + 60)
  ctx.fillText(`Producer Surplus: $${state.producerSurplus.toFixed(0)}`, hudX, hudY + 80)

  // Show surplus/shortage indicator
  if (state.surplus !== 0) {
    const hudX2 = width - 220
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(hudX2 - 10, hudY - 10, 210, 50)

    ctx.fillStyle = state.surplus > 0 ? '#ff9800' : '#2196f3'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    if (state.surplus > 0) {
      ctx.fillText(`Excess Supply: ${state.surplus}`, hudX2, hudY)
    } else {
      ctx.fillText(`Excess Demand: ${-state.surplus}`, hudX2, hudY)
    }
    if (state.deadweightLoss > 0) {
      ctx.fillStyle = '#f44336'
      ctx.fillText(`Deadweight Loss: $${state.deadweightLoss.toFixed(0)}`, hudX2, hudY + 20)
    }
  }
}
