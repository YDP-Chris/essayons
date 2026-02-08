/**
 * localStorage utilities for tutorial state persistence.
 *
 * Stores two boolean flags so the tutorial only auto-starts on the
 * user's first visit. All reads/writes are wrapped in try/catch to
 * degrade gracefully when storage is unavailable.
 */

const KEY_COMPLETED = 'essayons_tutorial_completed'
const KEY_DISMISSED = 'essayons_tutorial_dismissed'

/** Check whether localStorage is available and writable. */
function storageAvailable(): boolean {
  try {
    const probe = '__essayons_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

function getFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function setFlag(key: string, value: boolean): void {
  if (!storageAvailable()) return
  try {
    if (value) {
      localStorage.setItem(key, 'true')
    } else {
      localStorage.removeItem(key)
    }
  } catch {
    // Quota exceeded or unavailable — degrade silently
  }
}

/**
 * Returns `true` when the user has never completed or dismissed
 * the onboarding tutorial, meaning it should auto-start.
 */
export function isFirstVisit(): boolean {
  return !getFlag(KEY_COMPLETED) && !getFlag(KEY_DISMISSED)
}

/** Mark the tutorial as fully completed. */
export function markTutorialCompleted(): void {
  setFlag(KEY_COMPLETED, true)
}

/** Mark the tutorial as dismissed (user chose "don't show again"). */
export function markTutorialDismissed(): void {
  setFlag(KEY_DISMISSED, true)
}

/** Clear all tutorial flags so it will auto-start again. */
export function resetTutorial(): void {
  setFlag(KEY_COMPLETED, false)
  setFlag(KEY_DISMISSED, false)
}
