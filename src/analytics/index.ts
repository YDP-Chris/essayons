/**
 * Public API for the analytics module.
 *
 * Re-exports everything consumers need. Internal helpers stay private.
 */

// Types
export type {
  AnalyticsEventMap,
  AnalyticsEventName,
  DomainMetadata,
  SimulationInteractionProps,
  ParameterChangeProps,
  MissionStartProps,
  MissionCompleteProps,
  MissionFailProps,
  ShareActionProps,
  EpisodeSwitchProps,
  SessionDurationProps,
} from './types.ts'

// Core dispatch
export {
  trackEvent,
  isPlausibleAvailable,
  setDomainMetadata,
  getDomainMetadata,
  trackSimulationInteraction,
  trackParameterChange,
  trackMissionStart,
  trackMissionComplete,
  trackMissionFail,
  trackShareAction,
  trackEpisodeSwitch,
} from './plausible.ts'

// Session tracking
export { startSession, endSession, getActiveSeconds, isSessionRunning } from './session.ts'

// React hook
export { useAnalytics } from './useAnalytics.ts'
export type { UseAnalyticsReturn } from './useAnalytics.ts'
