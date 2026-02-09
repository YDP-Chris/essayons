import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  drawResponsiveHud,
  getHudBarHeight,
  handleHudTap,
  resetHudState,
  type HudCell,
} from './hud-utils'

function createMockCtx(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 40 }),
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

const coreCells: HudCell[] = [
  { label: 'ALT', value: '100 km', color: '#e2e8f0', width: 90, core: true },
  { label: 'VEL', value: '500 m/s', color: '#e2e8f0', width: 90, core: true },
  { label: 'ORBITS', value: '3', color: '#e2e8f0', width: 55, core: true },
  { label: 'TIME', value: '1.5m', color: '#aaa', width: 55, core: true },
]

const allCells: HudCell[] = [
  ...coreCells,
  { label: 'BODY', value: 'Earth', color: '#88bbdd', width: 70 },
  { label: 'ECC', value: '0.02', color: '#00D4AA', width: 72 },
  { label: 'APO', value: '6500 km', color: '#00D4AA', width: 78 },
  { label: 'PER', value: '6400 km', color: '#00D4AA', width: 78 },
  { label: 'PERIOD', value: '1.5m', color: '#e2e8f0', width: 68 },
]

describe('hud-utils', () => {
  beforeEach(() => {
    resetHudState()
  })

  describe('drawResponsiveHud', () => {
    it('renders compact layout at width 375', () => {
      const ctx = createMockCtx()
      const height = drawResponsiveHud(ctx, { cells: allCells }, 375)
      // Compact layout: 36px single row for core metrics
      expect(height).toBe(36)
      // Should have drawn fillRect for background
      expect(ctx.fillRect).toHaveBeenCalled()
    })

    it('renders full layout at width 1024', () => {
      const ctx = createMockCtx()
      const height = drawResponsiveHud(ctx, { cells: allCells }, 1024)
      // Full layout: 44px bar
      expect(height).toBe(44)
    })

    it('renders status badge when provided', () => {
      const ctx = createMockCtx()
      drawResponsiveHud(
        ctx,
        { cells: coreCells, statusText: 'CRASHED', statusColor: '#ef4444' },
        1024,
      )
      expect(ctx.roundRect).toHaveBeenCalled()
    })
  })

  describe('getHudBarHeight', () => {
    it('returns 36 for narrow canvas (compact collapsed)', () => {
      expect(getHudBarHeight(375)).toBe(36)
    })

    it('returns 44 for wide canvas', () => {
      expect(getHudBarHeight(1024)).toBe(44)
    })
  })

  describe('handleHudTap', () => {
    it('returns false for wide canvas', () => {
      expect(handleHudTap(100, 10, 1024)).toBe(false)
    })

    it('returns true for tap inside HUD bar on narrow canvas', () => {
      expect(handleHudTap(100, 10, 375)).toBe(true)
    })

    it('returns false for tap below HUD bar on narrow canvas', () => {
      expect(handleHudTap(100, 100, 375)).toBe(false)
    })

    it('toggles expanded state on narrow canvas', () => {
      // First tap: expand
      handleHudTap(100, 10, 375)
      // Now height should be 68 (expanded 2-row)
      expect(getHudBarHeight(375)).toBe(68)

      // Second tap: collapse
      handleHudTap(100, 10, 375)
      expect(getHudBarHeight(375)).toBe(36)
    })
  })

  describe('resetHudState', () => {
    it('resets expanded state', () => {
      handleHudTap(100, 10, 375) // expand
      expect(getHudBarHeight(375)).toBe(68)

      resetHudState()
      expect(getHudBarHeight(375)).toBe(36)
    })
  })
})
