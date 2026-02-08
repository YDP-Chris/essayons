/**
 * Time controller managing simulation clock, pause/play, and speed multiplier.
 *
 * The simulation clock is independent of wall-clock time. When the speed
 * multiplier is 10x, simulation time advances 10x faster than real time.
 * The controller exposes a subscription API for React integration via
 * `useSyncExternalStore`.
 */

import type { Subscribable, Unsubscribe } from './types.ts'

/** Allowed speed multiplier presets. */
export const SPEED_PRESETS = [1, 2, 5, 10, 50, 100, 500, 1000] as const
export type SpeedPreset = (typeof SPEED_PRESETS)[number]

/** Snapshot of time controller state for external consumers. */
export interface TimeControlState {
  readonly paused: boolean
  readonly speedMultiplier: number
  readonly simulationTime: number
}

export class TimeController implements Subscribable<TimeControlState> {
  private _paused = false
  private _speedMultiplier: number = 1
  private _simulationTime = 0
  private _listeners: Set<() => void> = new Set()
  private _snapshot: TimeControlState

  constructor() {
    this._snapshot = this._buildSnapshot()
  }

  // ---- public API ----

  /** Whether the simulation is paused. */
  get paused(): boolean {
    return this._paused
  }

  /** Current speed multiplier. */
  get speedMultiplier(): number {
    return this._speedMultiplier
  }

  /** Cumulative simulation time in seconds. */
  get simulationTime(): number {
    return this._simulationTime
  }

  /** Pause the simulation. */
  pause(): void {
    if (!this._paused) {
      this._paused = true
      this._notify()
    }
  }

  /** Resume the simulation. */
  play(): void {
    if (this._paused) {
      this._paused = false
      this._notify()
    }
  }

  /** Toggle between paused and playing. */
  togglePause(): void {
    this._paused = !this._paused
    this._notify()
  }

  /** Set the speed multiplier. Clamped to [1, 1000]. */
  setSpeed(multiplier: number): void {
    const clamped = Math.max(1, Math.min(1000, multiplier))
    if (clamped !== this._speedMultiplier) {
      this._speedMultiplier = clamped
      this._notify()
    }
  }

  /**
   * Advance simulation time by the given wall-clock delta (in seconds),
   * scaled by the speed multiplier. Returns the scaled delta.
   * Does nothing if paused (returns 0).
   */
  advance(wallDelta: number): number {
    if (this._paused) return 0
    const scaledDelta = wallDelta * this._speedMultiplier
    this._simulationTime += scaledDelta
    // We intentionally do NOT notify here — the engine loop calls notify
    // at the end of each frame to batch updates.
    return scaledDelta
  }

  /**
   * Advance by exactly one fixed timestep (for single-step mode).
   * Works even when paused.
   */
  singleStep(fixedTimestep: number): void {
    this._simulationTime += fixedTimestep
    this._notify()
  }

  /** Reset simulation time to zero. */
  reset(): void {
    this._simulationTime = 0
    this._paused = false
    this._speedMultiplier = 1
    this._notify()
  }

  /** Notify subscribers (called by the engine at end of frame). */
  flush(): void {
    this._notify()
  }

  // ---- Subscribable implementation ----

  subscribe(listener: () => void): Unsubscribe {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot(): TimeControlState {
    return this._snapshot
  }

  // ---- internals ----

  private _buildSnapshot(): TimeControlState {
    return {
      paused: this._paused,
      speedMultiplier: this._speedMultiplier,
      simulationTime: this._simulationTime,
    }
  }

  private _notify(): void {
    this._snapshot = this._buildSnapshot()
    for (const listener of this._listeners) {
      listener()
    }
  }
}
