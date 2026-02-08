/**
 * React hook for dispatching analytics events from components.
 *
 * Usage:
 * ```tsx
 * const { trackEvent, trackMissionStart } = useAnalytics()
 * ```
 *
 * The hook returns stable references (via `useMemo`) so it is safe to include
 * in dependency arrays without causing re-renders.
 */

import { useMemo } from 'react'
import {
  trackEvent,
  trackSimulationInteraction,
  trackParameterChange,
  trackMissionStart,
  trackMissionComplete,
  trackMissionFail,
  trackShareAction,
  trackEpisodeSwitch,
  setDomainMetadata,
} from './plausible.ts'
import { startSession, endSession, getActiveSeconds } from './session.ts'
import type { DomainMetadata } from './types.ts'

export interface UseAnalyticsReturn {
  /** Generic typed event dispatch. */
  readonly trackEvent: typeof trackEvent
  /** Fire a Simulation:Interaction event. */
  readonly trackSimulationInteraction: typeof trackSimulationInteraction
  /** Fire a Parameter:Change event. */
  readonly trackParameterChange: typeof trackParameterChange
  /** Fire a Mission:Start event. */
  readonly trackMissionStart: typeof trackMissionStart
  /** Fire a Mission:Complete event. */
  readonly trackMissionComplete: typeof trackMissionComplete
  /** Fire a Mission:Fail event. */
  readonly trackMissionFail: typeof trackMissionFail
  /** Fire a Share:Action event. */
  readonly trackShareAction: typeof trackShareAction
  /** Fire an Episode:Switch event. */
  readonly trackEpisodeSwitch: typeof trackEpisodeSwitch
  /** Set domain-level metadata attached to all subsequent events. */
  readonly setDomainMetadata: (meta: DomainMetadata) => void
  /** Start session duration tracking. */
  readonly startSession: typeof startSession
  /** End session duration tracking and fire Session:Duration event. */
  readonly endSession: typeof endSession
  /** Get current active session seconds without ending the session. */
  readonly getActiveSeconds: typeof getActiveSeconds
}

/**
 * Hook providing type-safe analytics dispatch for React components.
 *
 * All returned functions are module-level singletons so the returned object
 * is referentially stable across re-renders.
 */
export function useAnalytics(): UseAnalyticsReturn {
  return useMemo<UseAnalyticsReturn>(
    () => ({
      trackEvent,
      trackSimulationInteraction,
      trackParameterChange,
      trackMissionStart,
      trackMissionComplete,
      trackMissionFail,
      trackShareAction,
      trackEpisodeSwitch,
      setDomainMetadata,
      startSession,
      endSession,
      getActiveSeconds,
    }),
    [],
  )
}
