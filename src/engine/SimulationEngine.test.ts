/**
 * Unit tests for the SimulationEngine.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SimulationEngine } from './SimulationEngine.ts'
import type { EpisodeDefinition, PhysicsState, ParamValues, ObjectiveStatus } from './types.ts'

/**
 * Manually manage requestAnimationFrame callbacks for deterministic testing.
 * We intercept rAF so we can fire callbacks at precise timestamps.
 */
let rafCallbacks: Array<FrameRequestCallback> = []
let rafIdCounter = 0

function installFakeRaf(): void {
  rafCallbacks = []
  rafIdCounter = 0

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
    rafIdCounter++
    rafCallbacks.push(cb)
    return rafIdCounter
  })

  vi.stubGlobal('cancelAnimationFrame', (_id: number): void => {
    // For simplicity, we just clear all pending. In these tests we don't
    // rely on cancellation targeting a specific ID.
  })
}

/** Fire the most recently registered rAF callback with the given timestamp. */
function fireRaf(timestamp: number): void {
  const cb = rafCallbacks[rafCallbacks.length - 1]
  if (cb) {
    // Clear before firing so new rAF registrations from inside the callback
    // appear fresh.
    rafCallbacks = []
    cb(timestamp)
  }
}

/** Create a minimal episode definition for testing. */
function createTestEpisode(overrides?: Partial<EpisodeDefinition>): EpisodeDefinition {
  return {
    id: 'test-episode',
    name: 'Test Episode',
    description: 'A test episode',
    accentColor: '#ff0000',
    parameters: [],
    missions: [],
    init: vi.fn(),
    createInitialState: vi.fn(() => ({ position: 0, velocity: 1 })),
    update: vi.fn((state: PhysicsState, _params: ParamValues, dt: number) => {
      const pos = state['position'] as number
      const vel = state['velocity'] as number
      return { position: pos + vel * dt, velocity: vel }
    }),
    render: vi.fn(),
    cleanup: vi.fn(),
    ...overrides,
  }
}

describe('SimulationEngine', () => {
  let engine: SimulationEngine

  beforeEach(() => {
    installFakeRaf()
    engine = new SimulationEngine({
      fixedTimestep: 1 / 60,
      maxTicksPerFrame: 10,
      targetFps: 30,
    })
  })

  afterEach(() => {
    engine.destroy()
    vi.restoreAllMocks()
  })

  describe('start/stop', () => {
    it('should not be running initially', () => {
      expect(engine.running).toBe(false)
      expect(engine.getSnapshot().running).toBe(false)
    })

    it('should be running after start', () => {
      engine.start()
      expect(engine.running).toBe(true)
      expect(engine.getSnapshot().running).toBe(true)
    })

    it('should not be running after stop', () => {
      engine.start()
      engine.stop()
      expect(engine.running).toBe(false)
      expect(engine.getSnapshot().running).toBe(false)
    })

    it('should not double-start', () => {
      engine.start()
      const countAfterFirst = rafIdCounter
      engine.start()
      // Second start should not register another rAF
      expect(rafIdCounter).toBe(countAfterFirst)
    })
  })

  describe('fixed timestep accumulator', () => {
    it('should call episode update with the fixed timestep', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)
      engine.start()

      // First callback establishes baseline (no delta yet)
      fireRaf(0)

      // Second callback: 32ms delta => ~2 ticks at 60fps
      fireRaf(32)

      // update should have been called at least once
      expect(episode.update).toHaveBeenCalled()

      // Each call should receive the fixed timestep dt
      const updateCalls = vi.mocked(episode.update).mock.calls
      for (const call of updateCalls) {
        expect(call[2]).toBeCloseTo(1 / 60, 5)
      }
    })

    it('should cap ticks per frame to maxTicksPerFrame', () => {
      const episode = createTestEpisode()
      const limitedEngine = new SimulationEngine({
        fixedTimestep: 1 / 60,
        maxTicksPerFrame: 3,
        targetFps: 30,
      })
      limitedEngine.loadEpisode(episode)
      limitedEngine.start()

      // Baseline
      fireRaf(0)

      // Advance by 1 second (would be 60 ticks but capped at 3)
      fireRaf(1000)

      expect(vi.mocked(episode.update).mock.calls.length).toBeLessThanOrEqual(3)

      limitedEngine.destroy()
    })
  })

  describe('episode update', () => {
    it('should pass physics state through episode update', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)
      engine.start()

      // Baseline
      fireRaf(0)

      // ~1 tick
      fireRaf(16.67)

      // The initial state should have been passed to update
      const firstCall = vi.mocked(episode.update).mock.calls[0]
      if (firstCall) {
        expect(firstCall[0]).toEqual({ position: 0, velocity: 1 })
      }
    })
  })

  describe('speed multiplier', () => {
    it('should affect simulation time advancement', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)
      engine.time.setSpeed(10)
      engine.start()

      // Baseline
      fireRaf(0)

      // 100ms wall clock at 10x => 1000ms sim time => ~60 ticks
      // But capped at maxTicksPerFrame (10)
      fireRaf(100)

      expect(vi.mocked(episode.update).mock.calls.length).toBeLessThanOrEqual(10)
      expect(vi.mocked(episode.update).mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('pause', () => {
    it('should not advance physics when paused', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)
      engine.time.pause()
      engine.start()

      // Baseline
      fireRaf(0)

      // Advance 100ms while paused
      fireRaf(100)

      // update should NOT have been called
      expect(vi.mocked(episode.update).mock.calls.length).toBe(0)
    })

    it('should report paused state in snapshot', () => {
      engine.time.pause()
      // The engine snapshot is rebuilt on notify. Pause triggers notify in TimeController,
      // but the engine snapshot updates lazily. Force a snapshot rebuild by reading it
      // after a state change that also notifies:
      expect(engine.getSnapshot().paused).toBe(true)
    })
  })

  describe('mission evaluation', () => {
    it('should transition mission to success when all objectives are completed', () => {
      let tickCount = 0
      const episode = createTestEpisode({
        missions: [
          {
            id: 'mission-1',
            name: 'Test Mission',
            description: 'Complete the test',
            objectives: [{ id: 'obj-1', label: 'Do the thing' }],
            evaluate: () => {
              tickCount++
              return [{ id: 'obj-1', status: 'completed' as ObjectiveStatus }]
            },
          },
        ],
      })

      engine.loadEpisode(episode)
      expect(engine.missions.phase).toBe('active')

      engine.start()

      // Baseline
      fireRaf(0)

      // Advance one tick
      fireRaf(16.67)

      expect(tickCount).toBeGreaterThan(0)
      expect(engine.missions.phase).toBe('success')
    })

    it('should transition mission to failed when an objective fails', () => {
      const episode = createTestEpisode({
        missions: [
          {
            id: 'mission-1',
            name: 'Test Mission',
            description: 'Fail the test',
            objectives: [{ id: 'obj-1', label: 'Do the thing' }],
            evaluate: () => {
              return [{ id: 'obj-1', status: 'failed' as ObjectiveStatus }]
            },
          },
        ],
      })

      engine.loadEpisode(episode)
      engine.start()

      fireRaf(0)
      fireRaf(16.67)

      expect(engine.missions.phase).toBe('failed')
    })
  })

  describe('FPS tracking', () => {
    it('should track FPS based on frame timing', () => {
      engine.start()

      // Baseline
      fireRaf(0)

      // Run several frames at ~60fps (16.67ms apart)
      for (let i = 1; i <= 10; i++) {
        fireRaf(i * 16.67)
      }

      // FPS should be approximately 60
      expect(engine.fps).toBeGreaterThan(50)
      expect(engine.fps).toBeLessThan(70)
    })
  })

  describe('reset', () => {
    it('should reset to initial state', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)
      engine.start()

      // Run some frames
      fireRaf(0)
      fireRaf(100)

      engine.reset()

      expect(engine.running).toBe(false)
      expect(engine.getSnapshot().simulationTime).toBe(0)
      expect(engine.getSnapshot().speedMultiplier).toBe(1)
      expect(engine.getSnapshot().paused).toBe(false)
    })
  })

  describe('subscription', () => {
    it('should notify subscribers on state changes', () => {
      const listener = vi.fn()
      engine.subscribe(listener)

      engine.start()
      expect(listener).toHaveBeenCalled()
    })

    it('should unsubscribe correctly', () => {
      const listener = vi.fn()
      const unsubscribe = engine.subscribe(listener)

      unsubscribe()
      listener.mockClear()

      engine.start()
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('loadEpisode', () => {
    it('should call episode init with the engine interface', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)

      expect(episode.init).toHaveBeenCalledWith(engine)
    })

    it('should call createInitialState', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)

      expect(episode.createInitialState).toHaveBeenCalled()
      expect(engine.physicsState).toEqual({ position: 0, velocity: 1 })
    })

    it('should cleanup previous episode on new load', () => {
      const episode1 = createTestEpisode({ id: 'ep1' })
      const episode2 = createTestEpisode({ id: 'ep2' })

      engine.loadEpisode(episode1)
      engine.loadEpisode(episode2)

      expect(episode1.cleanup).toHaveBeenCalled()
    })
  })

  describe('headless operation', () => {
    it('should work without a canvas attached', () => {
      const episode = createTestEpisode()
      engine.loadEpisode(episode)
      engine.start()

      fireRaf(0)
      fireRaf(16.67)

      // Should not throw and update should be called
      expect(episode.update).toHaveBeenCalled()
    })
  })
})
