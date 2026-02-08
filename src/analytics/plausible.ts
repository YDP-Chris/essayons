/**
 * Thin, privacy-respecting wrapper around the Plausible Analytics
 * `window.plausible()` global.
 *
 * Design goals:
 * - Type-safe event dispatch via `AnalyticsEventMap`
 * - Non-blocking — fire-and-forget, never throws
 * - Lazy — tolerates Plausible being absent (ad-blocker, dev env, SSR)
 * - No cookies, no PII, no tracking identifiers
 */

import type { AnalyticsEventMap, AnalyticsEventName, DomainMetadata } from './types.ts'

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let domainMeta: DomainMetadata | null = null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the Plausible script has injected `window.plausible`.
 * Safe to call in SSR / test environments where `window` may not exist.
 */
export function isPlausibleAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.plausible === 'function'
}

// ---------------------------------------------------------------------------
// Domain metadata
// ---------------------------------------------------------------------------

/**
 * Set domain-level metadata that will be merged into every subsequent event.
 * Call this once when the app boots or when the active episode changes.
 */
export function setDomainMetadata(meta: DomainMetadata): void {
  domainMeta = meta
}

/**
 * Return the current domain metadata (or null if not yet set).
 */
export function getDomainMetadata(): DomainMetadata | null {
  return domainMeta
}

// ---------------------------------------------------------------------------
// Core dispatch
// ---------------------------------------------------------------------------

/**
 * Dispatch a typed analytics event to Plausible.
 *
 * - Merges domain metadata (episodeId / domain) into every event payload.
 * - Gracefully no-ops when Plausible is unavailable.
 * - Non-blocking — returns immediately, never throws.
 */
export function trackEvent<E extends AnalyticsEventName>(
  event: E,
  props: AnalyticsEventMap[E],
): void {
  try {
    if (!isPlausibleAvailable()) {
      return
    }

    const merged: Record<string, string | number | boolean> = {
      ...props,
      ...(domainMeta ? { domain: domainMeta.domain, episodeId: domainMeta.episodeId } : {}),
    }

    window.plausible?.(event, { props: merged })
  } catch {
    // Intentionally swallowed — analytics must never break the app.
  }
}

// ---------------------------------------------------------------------------
// Convenience helpers (thin wrappers for discoverability)
// ---------------------------------------------------------------------------

export function trackSimulationInteraction(
  action: 'play' | 'pause' | 'reset',
  episodeId: string,
): void {
  trackEvent('Simulation:Interaction', { action, episodeId })
}

export function trackParameterChange(
  parameterId: string,
  inputMethod: 'slider' | 'button' | 'keyboard',
  episodeId: string,
): void {
  trackEvent('Parameter:Change', { parameterId, inputMethod, episodeId })
}

export function trackMissionStart(episodeId: string, missionId: string): void {
  trackEvent('Mission:Start', { episodeId, missionId })
}

export function trackMissionComplete(
  episodeId: string,
  missionId: string,
  attemptCount: number,
): void {
  trackEvent('Mission:Complete', { episodeId, missionId, attemptCount })
}

export function trackMissionFail(episodeId: string, missionId: string): void {
  trackEvent('Mission:Fail', { episodeId, missionId })
}

export function trackShareAction(episodeId: string, method: string): void {
  trackEvent('Share:Action', { episodeId, method })
}

export function trackEpisodeSwitch(fromEpisodeId: string, toEpisodeId: string): void {
  trackEvent('Episode:Switch', { fromEpisodeId, toEpisodeId })
}
