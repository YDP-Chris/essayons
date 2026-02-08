/** Current schema version for progress data. */
export const CURRENT_SCHEMA_VERSION = 1

/** Completion state for a single mission within an episode. */
export interface MissionCompletion {
  readonly completedAt: string
}

/** Visit metadata for a single episode. */
export interface EpisodeVisit {
  readonly firstVisit: string
  readonly lastVisit: string
}

/** Per-episode data: completed missions and visit tracking. */
export interface EpisodeData {
  readonly missions: Record<string, MissionCompletion>
  readonly visit?: EpisodeVisit
}

/**
 * Top-level persisted data schema (v1).
 * - `version` enables future schema migrations.
 * - `episodes` maps episodeId -> episode-level data.
 * - `lastSessionTimestamp` tracks the most recent app load for return-visit detection.
 */
export interface ProgressData {
  readonly version: number
  readonly episodes: Record<string, EpisodeData>
  readonly lastSessionTimestamp: string | null
}

/** Return value of the `useProgress` React hook. */
export interface UseProgressResult {
  readonly markMissionComplete: (episodeId: string, missionId: string) => void
  readonly isMissionComplete: (episodeId: string, missionId: string) => boolean
  readonly getCompletedMissions: (episodeId: string) => readonly string[]
  readonly recordEpisodeVisit: (episodeId: string) => void
  readonly getEpisodeVisits: () => Readonly<Record<string, EpisodeVisit>>
  readonly isReturnVisit: () => boolean
  readonly data: ProgressData
}
