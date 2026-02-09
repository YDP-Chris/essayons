/**
 * Plausible Analytics type declarations and custom event types.
 *
 * Plausible injects `window.plausible` when its script is loaded.
 * All event properties are primitive types only — no PII, no identifiers.
 */

// ---------------------------------------------------------------------------
// Global augmentation for Plausible
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void
  }
}

// ---------------------------------------------------------------------------
// Custom event map — every key is an event name, value is its props shape
// ---------------------------------------------------------------------------

export interface SimulationInteractionProps {
  readonly action: 'play' | 'pause' | 'reset' | 'relaunch'
  readonly episodeId: string
}

export interface ParameterChangeProps {
  readonly parameterId: string
  readonly inputMethod: 'slider' | 'button' | 'keyboard'
  readonly episodeId: string
}

export interface MissionStartProps {
  readonly episodeId: string
  readonly missionId: string
}

export interface MissionCompleteProps {
  readonly episodeId: string
  readonly missionId: string
  readonly attemptCount: number
}

export interface MissionFailProps {
  readonly episodeId: string
  readonly missionId: string
}

export interface ShareActionProps {
  readonly episodeId: string
  readonly method: string
}

export interface EpisodeSwitchProps {
  readonly fromEpisodeId: string
  readonly toEpisodeId: string
}

export interface SessionDurationProps {
  readonly durationSeconds: number
  readonly episodeId: string
}

/**
 * Discriminated map of every custom analytics event.
 * Using an interface (not a type alias) so consumers get readable hover docs.
 */
export interface AnalyticsEventMap {
  readonly 'Simulation:Interaction': SimulationInteractionProps
  readonly 'Parameter:Change': ParameterChangeProps
  readonly 'Mission:Start': MissionStartProps
  readonly 'Mission:Complete': MissionCompleteProps
  readonly 'Mission:Fail': MissionFailProps
  readonly 'Share:Action': ShareActionProps
  readonly 'Episode:Switch': EpisodeSwitchProps
  readonly 'Session:Duration': SessionDurationProps
}

/** Union of all recognised event names. */
export type AnalyticsEventName = keyof AnalyticsEventMap

/** Metadata attached to every outbound event for domain-level reporting. */
export interface DomainMetadata {
  readonly episodeId: string
  readonly domain: string
}
