/**
 * Dev-mode memory monitor that tracks event listener count.
 *
 * Uses addEventListener/removeEventListener proxy to count active listeners.
 * Warns in console when count exceeds a configurable threshold.
 * Exposes metrics for the PerformanceOverlay to display.
 */

/** Snapshot of memory monitor metrics. */
export interface MemoryMetrics {
  readonly listenerCount: number
  readonly warningThreshold: number
  readonly isOverThreshold: boolean
}

/** Threshold at which a console warning is emitted. */
const DEFAULT_WARNING_THRESHOLD = 500

let listenerCount = 0
let warningThreshold = DEFAULT_WARNING_THRESHOLD
let installed = false
let originalAddEventListener: typeof EventTarget.prototype.addEventListener | null = null
let originalRemoveEventListener: typeof EventTarget.prototype.removeEventListener | null = null

/**
 * Install the memory monitor by patching EventTarget.prototype.
 * Safe to call multiple times; only installs once.
 */
export function installMemoryMonitor(threshold = DEFAULT_WARNING_THRESHOLD): void {
  if (installed) return
  installed = true
  warningThreshold = threshold
  listenerCount = 0

  originalAddEventListener = EventTarget.prototype.addEventListener
  originalRemoveEventListener = EventTarget.prototype.removeEventListener

  EventTarget.prototype.addEventListener = function (
    this: EventTarget,
    ...args: Parameters<typeof EventTarget.prototype.addEventListener>
  ): void {
    listenerCount++
    if (listenerCount > warningThreshold) {
      console.warn(
        `[MemoryMonitor] Event listener count (${listenerCount}) exceeds threshold (${warningThreshold}). Possible memory leak.`,
      )
    }
    originalAddEventListener!.apply(this, args)
  }

  EventTarget.prototype.removeEventListener = function (
    this: EventTarget,
    ...args: Parameters<typeof EventTarget.prototype.removeEventListener>
  ): void {
    if (listenerCount > 0) {
      listenerCount--
    }
    originalRemoveEventListener!.apply(this, args)
  }
}

/**
 * Uninstall the memory monitor, restoring original prototypes.
 */
export function uninstallMemoryMonitor(): void {
  if (!installed) return
  installed = false

  if (originalAddEventListener) {
    EventTarget.prototype.addEventListener = originalAddEventListener
    originalAddEventListener = null
  }
  if (originalRemoveEventListener) {
    EventTarget.prototype.removeEventListener = originalRemoveEventListener
    originalRemoveEventListener = null
  }
  listenerCount = 0
}

/**
 * Get current memory monitor metrics.
 */
export function getMemoryMetrics(): MemoryMetrics {
  return {
    listenerCount,
    warningThreshold,
    isOverThreshold: listenerCount > warningThreshold,
  }
}

/**
 * Get the current listener count directly.
 */
export function getListenerCount(): number {
  return listenerCount
}

/**
 * Reset the listener count (primarily for testing).
 */
export function resetListenerCount(): void {
  listenerCount = 0
}
