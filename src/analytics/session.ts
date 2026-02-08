/**
 * Session duration tracking — measures *active* experiment time.
 *
 * Idle time (tab hidden, no interaction for IDLE_TIMEOUT_MS) is excluded so the
 * "Time Spent Experimenting" metric reflects genuine engagement.
 *
 * Privacy: no cookies, no identifiers. Duration is a plain number in seconds.
 */

import { trackEvent } from './plausible.ts'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** After this many ms of no interaction the session is considered idle. */
const IDLE_TIMEOUT_MS = 60_000 // 1 minute

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let activeStartTime: number | null = null
let accumulatedMs = 0
let idleTimer: ReturnType<typeof setTimeout> | null = null
let currentEpisodeId = ''
let running = false

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now(): number {
  return Date.now()
}

function flushActive(): void {
  if (activeStartTime !== null) {
    accumulatedMs += now() - activeStartTime
    activeStartTime = null
  }
}

function goIdle(): void {
  flushActive()
}

function resetIdleTimer(): void {
  if (idleTimer !== null) {
    clearTimeout(idleTimer)
  }

  // If we were idle, resume active tracking
  if (activeStartTime === null && running) {
    activeStartTime = now()
  }

  idleTimer = setTimeout(goIdle, IDLE_TIMEOUT_MS)
}

// ---------------------------------------------------------------------------
// Visibility change handler
// ---------------------------------------------------------------------------

function handleVisibilityChange(): void {
  if (!running) return

  if (document.hidden) {
    flushActive()
  } else {
    // Tab became visible again — resume
    activeStartTime = now()
    resetIdleTimer()
  }
}

// ---------------------------------------------------------------------------
// Event handler for user activity
// ---------------------------------------------------------------------------

function handleActivity(): void {
  if (!running) return
  resetIdleTimer()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Begin tracking active session time for the given episode.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function startSession(episodeId: string): void {
  if (running) return

  currentEpisodeId = episodeId
  accumulatedMs = 0
  activeStartTime = now()
  running = true

  resetIdleTimer()

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', handleActivity, { passive: true })
    window.addEventListener('keydown', handleActivity, { passive: true })
  }
}

/**
 * End the current session, fire a `Session:Duration` event, and clean up.
 * Returns the measured duration in seconds (useful for testing).
 */
export function endSession(): number {
  if (!running) return 0

  flushActive()
  running = false

  if (idleTimer !== null) {
    clearTimeout(idleTimer)
    idleTimer = null
  }

  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointerdown', handleActivity)
    window.removeEventListener('keydown', handleActivity)
  }

  const durationSeconds = Math.round(accumulatedMs / 1000)

  trackEvent('Session:Duration', {
    durationSeconds,
    episodeId: currentEpisodeId,
  })

  const result = durationSeconds
  accumulatedMs = 0
  activeStartTime = null
  currentEpisodeId = ''

  return result
}

/**
 * Return the elapsed *active* seconds so far without ending the session.
 * Useful for dashboards / debug overlays.
 */
export function getActiveSeconds(): number {
  let total = accumulatedMs
  if (activeStartTime !== null) {
    total += now() - activeStartTime
  }
  return Math.round(total / 1000)
}

/**
 * Whether a session is currently being tracked.
 */
export function isSessionRunning(): boolean {
  return running
}
