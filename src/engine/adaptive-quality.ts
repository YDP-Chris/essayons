/**
 * Adaptive canvas quality management.
 *
 * Monitors FPS within the render loop and adjusts rendering quality
 * automatically. When FPS drops below the threshold for a sustained
 * period, trail points are reduced and vector rendering is disabled.
 * When FPS recovers, full quality is restored with hysteresis to
 * prevent rapid toggling.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Quality levels for canvas rendering. */
export type QualityLevel = 'full' | 'reduced'

/** Read-only snapshot of the quality monitor state. */
export interface QualitySnapshot {
  readonly level: QualityLevel
  readonly trailPointRatio: number
  readonly vectorsEnabled: boolean
  readonly currentFps: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** FPS threshold below which quality is reduced. */
const FPS_THRESHOLD = 30

/** Duration in seconds that FPS must stay below threshold to trigger reduction. */
const DEGRADE_DURATION = 2

/** Duration in seconds that FPS must stay above threshold to restore quality. */
const RESTORE_DURATION = 3

/** Number of FPS samples to average over. */
const FPS_SAMPLE_COUNT = 60

// ---------------------------------------------------------------------------
// QualityMonitor
// ---------------------------------------------------------------------------

export class QualityMonitor {
  private _level: QualityLevel = 'full'
  private _disabled = false

  // FPS tracking (rolling window)
  private _frameTimes: number[] = []
  private _currentFps = 60

  // Timers for hysteresis (seconds accumulated below/above threshold)
  private _belowThresholdTime = 0
  private _aboveThresholdTime = 0

  /**
   * Record a frame and evaluate whether quality should change.
   * Call this once per frame with the wall-clock delta in seconds.
   */
  recordFrame(deltaSeconds: number): void {
    if (deltaSeconds <= 0) return

    // Update rolling FPS average
    this._frameTimes.push(deltaSeconds)
    if (this._frameTimes.length > FPS_SAMPLE_COUNT) {
      this._frameTimes.shift()
    }

    const avgDelta = this._frameTimes.reduce((sum, t) => sum + t, 0) / this._frameTimes.length
    this._currentFps = avgDelta > 0 ? 1 / avgDelta : 0

    // Skip quality adjustment if disabled by user
    if (this._disabled) return

    // Evaluate thresholds
    if (this._currentFps < FPS_THRESHOLD) {
      this._belowThresholdTime += deltaSeconds
      this._aboveThresholdTime = 0

      if (this._level === 'full' && this._belowThresholdTime >= DEGRADE_DURATION) {
        this._level = 'reduced'
        this._belowThresholdTime = 0
      }
    } else {
      this._aboveThresholdTime += deltaSeconds
      this._belowThresholdTime = 0

      if (this._level === 'reduced' && this._aboveThresholdTime >= RESTORE_DURATION) {
        this._level = 'full'
        this._aboveThresholdTime = 0
      }
    }
  }

  /** Get the current quality level. */
  get level(): QualityLevel {
    return this._level
  }

  /** Ratio of trail points to render (1.0 = all, 0.5 = half). */
  get trailPointRatio(): number {
    return this._level === 'full' ? 1.0 : 0.5
  }

  /** Whether vector rendering (arrows, thrust indicators) is enabled. */
  get vectorsEnabled(): boolean {
    return this._level === 'full'
  }

  /** Current averaged FPS. */
  get currentFps(): number {
    return this._currentFps
  }

  /** Get a read-only snapshot of the current state. */
  getSnapshot(): QualitySnapshot {
    return {
      level: this._level,
      trailPointRatio: this.trailPointRatio,
      vectorsEnabled: this.vectorsEnabled,
      currentFps: this._currentFps,
    }
  }

  /** Disable adaptive quality (always render at full quality). */
  disable(): void {
    this._disabled = true
    this._level = 'full'
    this._belowThresholdTime = 0
    this._aboveThresholdTime = 0
  }

  /** Enable adaptive quality. */
  enable(): void {
    this._disabled = false
  }

  /** Whether adaptive quality is currently disabled. */
  get isDisabled(): boolean {
    return this._disabled
  }

  /** Reset all state. */
  reset(): void {
    this._level = 'full'
    this._frameTimes = []
    this._currentFps = 60
    this._belowThresholdTime = 0
    this._aboveThresholdTime = 0
  }
}
