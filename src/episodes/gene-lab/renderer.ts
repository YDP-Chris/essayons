/**
 * Canvas renderer for Gene Lab.
 *
 * Displays population grid, allele frequency charts, phenotype ratios,
 * Hardy-Weinberg deviation indicator, and historical trends.
 */

import type { GeneLabState } from './types.ts'
import type { GeneLabParams } from './simulation.ts'

const ACCENT_COLOR = '#8ac926' // Biology accent color (dominant phenotype)
const RECESSIVE_COLOR = '#94a3b8' // Muted gray (recessive phenotype)
const BACKGROUND_COLOR = '#1a1a1a'
const TEXT_COLOR = '#e0e0e0'
const GRID_COLOR = '#333333'

/**
 * Main render function for Gene Lab canvas.
 */
export function renderGeneLabCanvas(
  ctx: CanvasRenderingContext2D,
  state: GeneLabState,
  params: GeneLabParams,
  width: number,
  height: number,
): void {
  // Clear canvas
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, width, height)

  // Layout regions
  const padding = 20
  const populationRegion = {
    x: padding,
    y: padding,
    width: width * 0.6 - padding * 2,
    height: height * 0.7 - padding,
  }
  const statsRegion = {
    x: width * 0.6 + padding,
    y: padding,
    width: width * 0.4 - padding * 2,
    height: height * 0.7 - padding,
  }
  const historyRegion = {
    x: padding,
    y: height * 0.7 + padding,
    width: width - padding * 2,
    height: height * 0.3 - padding * 2,
  }

  // Render components
  renderPopulationGrid(ctx, state, params, populationRegion)
  renderStats(ctx, state, statsRegion)
  renderHistory(ctx, state, historyRegion)
}

/**
 * Render population as a grid of colored circles.
 */
function renderPopulationGrid(
  ctx: CanvasRenderingContext2D,
  state: GeneLabState,
  params: GeneLabParams,
  region: { x: number; y: number; width: number; height: number },
): void {
  const { population } = state
  const showGenotypes = params['show-genotypes']

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(population.length))
  const rows = Math.ceil(population.length / cols)
  const cellSize = Math.min(region.width / cols, region.height / rows)
  const radius = cellSize * 0.35

  ctx.save()
  ctx.translate(region.x, region.y)

  // Draw organisms
  for (let i = 0; i < population.length; i++) {
    const organism = population[i]!
    const col = i % cols
    const row = Math.floor(i / cols)

    const x = col * cellSize + cellSize / 2
    const y = row * cellSize + cellSize / 2

    // Draw circle
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = organism.phenotype === 'dominant' ? ACCENT_COLOR : RECESSIVE_COLOR
    ctx.fill()

    // Draw genotype label if enabled
    if (showGenotypes) {
      const [allele1, allele2] = organism.genotype
      const label = `${allele1}${allele2}`

      ctx.fillStyle = '#000000'
      ctx.font = `${radius * 0.8}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, x, y)
    }
  }

  ctx.restore()
}

/**
 * Render statistics panel with allele frequencies, ratios, and HW deviation.
 */
function renderStats(
  ctx: CanvasRenderingContext2D,
  state: GeneLabState,
  region: { x: number; y: number; width: number; height: number },
): void {
  const { generation, alleleFrequency, phenotypeRatio, hwChiSquare } = state

  ctx.save()
  ctx.translate(region.x, region.y)

  let yOffset = 0
  const lineHeight = 24

  // Generation counter
  ctx.fillStyle = TEXT_COLOR
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`Generation ${generation}`, 0, yOffset)
  yOffset += lineHeight * 1.5

  // Phenotype ratio
  ctx.font = '16px sans-serif'
  ctx.fillText('Phenotype Ratio:', 0, yOffset)
  yOffset += lineHeight

  ctx.font = '14px sans-serif'
  ctx.fillStyle = ACCENT_COLOR
  ctx.fillText(`■ Dominant: ${phenotypeRatio.dominant}`, 10, yOffset)
  yOffset += lineHeight

  ctx.fillStyle = RECESSIVE_COLOR
  ctx.fillText(`■ Recessive: ${phenotypeRatio.recessive}`, 10, yOffset)
  yOffset += lineHeight * 1.5

  // Allele frequency bars
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '16px sans-serif'
  ctx.fillText('Allele Frequencies:', 0, yOffset)
  yOffset += lineHeight

  const barWidth = region.width - 20
  const barHeight = 20

  // A allele bar
  ctx.fillStyle = ACCENT_COLOR
  ctx.fillRect(10, yOffset, barWidth * alleleFrequency.A, barHeight)
  ctx.strokeStyle = GRID_COLOR
  ctx.strokeRect(10, yOffset, barWidth, barHeight)
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '12px sans-serif'
  ctx.fillText(`A: ${(alleleFrequency.A * 100).toFixed(1)}%`, 15, yOffset + 15)
  yOffset += barHeight + 10

  // a allele bar
  ctx.fillStyle = RECESSIVE_COLOR
  ctx.fillRect(10, yOffset, barWidth * alleleFrequency.a, barHeight)
  ctx.strokeStyle = GRID_COLOR
  ctx.strokeRect(10, yOffset, barWidth, barHeight)
  ctx.fillStyle = TEXT_COLOR
  ctx.fillText(`a: ${(alleleFrequency.a * 100).toFixed(1)}%`, 15, yOffset + 15)
  yOffset += barHeight + lineHeight * 1.5

  // Hardy-Weinberg deviation
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '16px sans-serif'
  ctx.fillText('Hardy-Weinberg:', 0, yOffset)
  yOffset += lineHeight

  ctx.font = '14px sans-serif'
  const deviation = hwChiSquare < 1 ? 'Low' : hwChiSquare < 5 ? 'Moderate' : 'High'
  const deviationColor = hwChiSquare < 1 ? ACCENT_COLOR : hwChiSquare < 5 ? '#f4a261' : '#e63946'
  ctx.fillStyle = deviationColor
  ctx.fillText(`χ² = ${hwChiSquare.toFixed(2)} (${deviation})`, 10, yOffset)

  ctx.restore()
}

/**
 * Render historical allele frequency line chart.
 */
function renderHistory(
  ctx: CanvasRenderingContext2D,
  state: GeneLabState,
  region: { x: number; y: number; width: number; height: number },
): void {
  const { history } = state

  if (history.length < 2) {
    return
  }

  ctx.save()
  ctx.translate(region.x, region.y)

  // Draw border
  ctx.strokeStyle = GRID_COLOR
  ctx.strokeRect(0, 0, region.width, region.height)

  // Chart area
  const chartPadding = 40
  const chartWidth = region.width - chartPadding * 2
  const chartHeight = region.height - chartPadding * 2

  ctx.translate(chartPadding, chartPadding)

  // Draw axes
  ctx.strokeStyle = GRID_COLOR
  ctx.beginPath()
  ctx.moveTo(0, chartHeight)
  ctx.lineTo(chartWidth, chartHeight)
  ctx.moveTo(0, 0)
  ctx.lineTo(0, chartHeight)
  ctx.stroke()

  // Axis labels
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Generation', chartWidth / 2, chartHeight + 30)

  ctx.save()
  ctx.translate(-30, chartHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('Allele Frequency', 0, 0)
  ctx.restore()

  // Plot lines
  const maxGeneration = Math.max(history[history.length - 1]!.generation, 1)
  const yScale = chartHeight

  // A allele line
  ctx.strokeStyle = ACCENT_COLOR
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < history.length; i++) {
    const point = history[i]!
    const x = (point.generation / maxGeneration) * chartWidth
    const y = chartHeight - point.freqA * yScale
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()

  // a allele line
  ctx.strokeStyle = RECESSIVE_COLOR
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < history.length; i++) {
    const point = history[i]!
    const x = (point.generation / maxGeneration) * chartWidth
    const y = chartHeight - point.freqa * yScale
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()

  // Legend
  ctx.fillStyle = ACCENT_COLOR
  ctx.fillRect(chartWidth - 100, -20, 15, 15)
  ctx.fillStyle = TEXT_COLOR
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('A allele', chartWidth - 80, -8)

  ctx.fillStyle = RECESSIVE_COLOR
  ctx.fillRect(chartWidth - 100, 0, 15, 15)
  ctx.fillStyle = TEXT_COLOR
  ctx.fillText('a allele', chartWidth - 80, 12)

  ctx.restore()
}
