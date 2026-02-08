/**
 * Unit tests for dev-mode performance utilities:
 * - FPS calculation logic (rolling window)
 * - Memory monitor tracking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  installMemoryMonitor,
  uninstallMemoryMonitor,
  getMemoryMetrics,
  getListenerCount,
  resetListenerCount,
} from './memory-monitor.ts'

// ---------------------------------------------------------------------------
// FPS Calculation Logic (unit-test the algorithm directly)
// ---------------------------------------------------------------------------

describe('FPS rolling-window calculation', () => {
  /**
   * Replicate the rolling-window FPS algorithm used by the PerformanceOverlay.
   * The overlay uses requestAnimationFrame timestamps; here we test the
   * pure math with synthetic data.
   */
  function calculateFps(frameDeltasMs: number[], windowSize: number): number {
    const window: number[] = []
    let fps = 0

    for (const delta of frameDeltasMs) {
      window.push(delta)
      if (window.length > windowSize) {
        window.shift()
      }
      const avgMs = window.reduce((sum, t) => sum + t, 0) / window.length
      fps = avgMs > 0 ? 1000 / avgMs : 0
    }

    return fps
  }

  it('should calculate 60 FPS for 16.67ms frame deltas', () => {
    const deltas = Array.from({ length: 60 }, () => 16.667)
    const fps = calculateFps(deltas, 60)
    expect(fps).toBeGreaterThan(58)
    expect(fps).toBeLessThan(62)
  })

  it('should calculate 30 FPS for 33.33ms frame deltas', () => {
    const deltas = Array.from({ length: 60 }, () => 33.333)
    const fps = calculateFps(deltas, 60)
    expect(fps).toBeGreaterThan(28)
    expect(fps).toBeLessThan(32)
  })

  it('should converge to new FPS after window fills with new values', () => {
    // Start at 60fps then drop to 30fps
    const deltas60 = Array.from({ length: 60 }, () => 16.667)
    const deltas30 = Array.from({ length: 60 }, () => 33.333)
    const allDeltas = [...deltas60, ...deltas30]
    const fps = calculateFps(allDeltas, 60)
    // After the window is fully replaced, should be ~30
    expect(fps).toBeGreaterThan(28)
    expect(fps).toBeLessThan(32)
  })

  it('should handle very short window sizes', () => {
    const deltas = [16.667, 16.667, 16.667]
    const fps = calculateFps(deltas, 3)
    expect(fps).toBeGreaterThan(58)
    expect(fps).toBeLessThan(62)
  })

  it('should return 0 for zero-delta frames', () => {
    const fps = calculateFps([0, 0, 0], 60)
    // avgMs is 0, so the ternary returns 0 (safe guard against division by zero)
    expect(fps).toBe(0)
  })

  it('should handle single frame', () => {
    const fps = calculateFps([16.667], 60)
    expect(fps).toBeGreaterThan(58)
    expect(fps).toBeLessThan(62)
  })
})

// ---------------------------------------------------------------------------
// Memory Monitor Tests
// ---------------------------------------------------------------------------

describe('MemoryMonitor', () => {
  beforeEach(() => {
    uninstallMemoryMonitor()
  })

  afterEach(() => {
    uninstallMemoryMonitor()
  })

  it('should start with zero listener count', () => {
    installMemoryMonitor()
    expect(getListenerCount()).toBe(0)
  })

  it('should track addEventListener calls', () => {
    installMemoryMonitor()

    const div = document.createElement('div')
    const handler = () => {}
    div.addEventListener('click', handler)

    expect(getListenerCount()).toBe(1)

    div.removeEventListener('click', handler)
    expect(getListenerCount()).toBe(0)
  })

  it('should track multiple listeners', () => {
    installMemoryMonitor()

    const div = document.createElement('div')
    const h1 = () => {}
    const h2 = () => {}
    const h3 = () => {}

    div.addEventListener('click', h1)
    div.addEventListener('mousemove', h2)
    div.addEventListener('keydown', h3)

    expect(getListenerCount()).toBe(3)

    div.removeEventListener('click', h1)
    expect(getListenerCount()).toBe(2)

    div.removeEventListener('mousemove', h2)
    div.removeEventListener('keydown', h3)
    expect(getListenerCount()).toBe(0)
  })

  it('should not go below zero on extra removeEventListener calls', () => {
    installMemoryMonitor()

    const div = document.createElement('div')
    div.removeEventListener('click', () => {})

    expect(getListenerCount()).toBe(0)
  })

  it('should emit warning when threshold is exceeded', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    installMemoryMonitor(5) // low threshold for testing

    const div = document.createElement('div')
    for (let i = 0; i < 6; i++) {
      div.addEventListener('click', () => {})
    }

    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy.mock.calls[0]![0]).toContain('Event listener count')

    warnSpy.mockRestore()
  })

  it('should report metrics correctly', () => {
    installMemoryMonitor(10)

    const div = document.createElement('div')
    for (let i = 0; i < 5; i++) {
      div.addEventListener('click', () => {})
    }

    const metrics = getMemoryMetrics()
    expect(metrics.listenerCount).toBe(5)
    expect(metrics.warningThreshold).toBe(10)
    expect(metrics.isOverThreshold).toBe(false)
  })

  it('should report over threshold correctly', () => {
    installMemoryMonitor(3)

    const div = document.createElement('div')
    for (let i = 0; i < 5; i++) {
      div.addEventListener('click', () => {})
    }

    const metrics = getMemoryMetrics()
    expect(metrics.isOverThreshold).toBe(true)
  })

  it('should only install once', () => {
    installMemoryMonitor()
    const div = document.createElement('div')
    div.addEventListener('click', () => {})
    expect(getListenerCount()).toBe(1)

    // Install again — should be a no-op
    installMemoryMonitor()
    div.addEventListener('click', () => {})
    expect(getListenerCount()).toBe(2) // not reset
  })

  it('should restore original prototypes on uninstall', () => {
    const origAdd = EventTarget.prototype.addEventListener
    installMemoryMonitor()
    expect(EventTarget.prototype.addEventListener).not.toBe(origAdd)

    uninstallMemoryMonitor()
    expect(EventTarget.prototype.addEventListener).toBe(origAdd)
  })

  it('should reset count on uninstall', () => {
    installMemoryMonitor()
    const div = document.createElement('div')
    div.addEventListener('click', () => {})
    expect(getListenerCount()).toBe(1)

    uninstallMemoryMonitor()
    expect(getListenerCount()).toBe(0)
  })

  it('should support resetListenerCount', () => {
    installMemoryMonitor()
    const div = document.createElement('div')
    div.addEventListener('click', () => {})
    div.addEventListener('click', () => {})
    expect(getListenerCount()).toBe(2)

    resetListenerCount()
    expect(getListenerCount()).toBe(0)
  })
})
