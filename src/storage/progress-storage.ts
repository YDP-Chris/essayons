import type { EpisodeData, EpisodeVisit, ProgressData } from './types.ts'
import { CURRENT_SCHEMA_VERSION } from './types.ts'

const STORAGE_KEY = 'essayons_progress'

/** Create a blank ProgressData object. */
function createEmptyData(): ProgressData {
  return {
    version: CURRENT_SCHEMA_VERSION,
    episodes: {},
    lastSessionTimestamp: null,
  }
}

/** Check whether localStorage is available by performing a probe write. */
function isLocalStorageAvailable(): boolean {
  const testKey = '__essayons_probe__'
  try {
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Migrate persisted data from an older schema version to the current one.
 * Currently only v1 exists, so this is a no-op passthrough that future
 * migrations can extend.
 */
function migrate(raw: Record<string, unknown>): ProgressData {
  const version = typeof raw['version'] === 'number' ? (raw['version'] as number) : 0

  if (version < 1) {
    // Pre-v1 or unrecognised — return blank data
    return createEmptyData()
  }

  // v1 is current — pass through with shape validation
  return {
    version: CURRENT_SCHEMA_VERSION,
    episodes:
      raw['episodes'] != null && typeof raw['episodes'] === 'object'
        ? (raw['episodes'] as Record<string, EpisodeData>)
        : {},
    lastSessionTimestamp:
      typeof raw['lastSessionTimestamp'] === 'string'
        ? (raw['lastSessionTimestamp'] as string)
        : null,
  }
}

/**
 * Service that persists lightweight progress data in localStorage.
 * Falls back to in-memory storage when localStorage is unavailable.
 */
export class ProgressStorageService {
  private data: ProgressData
  private readonly storageAvailable: boolean
  /** Listeners notified on every write. */
  private readonly listeners: Set<() => void> = new Set()

  constructor() {
    this.storageAvailable = isLocalStorageAvailable()
    this.data = this.read()
  }

  // ---- persistence layer -----------------------------------------------

  /** Read persisted data (or return empty default). */
  private read(): ProgressData {
    if (!this.storageAvailable) {
      return createEmptyData()
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        return createEmptyData()
      }
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null) {
        return createEmptyData()
      }
      return migrate(parsed as Record<string, unknown>)
    } catch {
      return createEmptyData()
    }
  }

  /** Write current data to localStorage, handling quota errors. */
  private write(): void {
    if (!this.storageAvailable) {
      this.notify()
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch {
      // QuotaExceededError or other — degrade silently, keep in-memory copy
    }
    this.notify()
  }

  // ---- change notification ---------------------------------------------

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }

  // ---- public API -------------------------------------------------------

  /** Return a snapshot of the current progress data. */
  getData(): ProgressData {
    return this.data
  }

  /** Remove all persisted progress data. */
  clear(): void {
    this.data = createEmptyData()
    if (this.storageAvailable) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    }
    this.notify()
  }

  // ---- mission completion -----------------------------------------------

  markMissionComplete(episodeId: string, missionId: string): void {
    const existing = this.data.episodes[episodeId]
    const episode: EpisodeData = existing ?? { missions: {} }
    const updatedMissions = {
      ...episode.missions,
      [missionId]: { completedAt: new Date().toISOString() },
    }
    this.data = {
      ...this.data,
      episodes: {
        ...this.data.episodes,
        [episodeId]: { ...episode, missions: updatedMissions },
      },
    }
    this.write()
  }

  isMissionComplete(episodeId: string, missionId: string): boolean {
    return this.data.episodes[episodeId]?.missions[missionId] != null
  }

  getCompletedMissions(episodeId: string): readonly string[] {
    const episode = this.data.episodes[episodeId]
    if (!episode) {
      return []
    }
    return Object.keys(episode.missions)
  }

  // ---- episode visit tracking -------------------------------------------

  recordEpisodeVisit(episodeId: string): void {
    const now = new Date().toISOString()
    const existing = this.data.episodes[episodeId]
    const episode: EpisodeData = existing ?? { missions: {} }
    const visit: EpisodeVisit = episode.visit
      ? { firstVisit: episode.visit.firstVisit, lastVisit: now }
      : { firstVisit: now, lastVisit: now }

    this.data = {
      ...this.data,
      episodes: {
        ...this.data.episodes,
        [episodeId]: { ...episode, visit },
      },
    }
    this.write()
  }

  getEpisodeVisits(): Readonly<Record<string, EpisodeVisit>> {
    const result: Record<string, EpisodeVisit> = {}
    for (const [id, episode] of Object.entries(this.data.episodes)) {
      if (episode?.visit) {
        result[id] = episode.visit
      }
    }
    return result
  }

  // ---- return-visit detection -------------------------------------------

  /**
   * Returns true when the user has a previous session timestamp recorded,
   * indicating they have visited before.
   */
  isReturnVisit(): boolean {
    return this.data.lastSessionTimestamp !== null
  }

  /**
   * Record the current app load as the latest session timestamp.
   * Call this once at app startup — *after* reading `isReturnVisit()`.
   */
  recordSession(): void {
    this.data = {
      ...this.data,
      lastSessionTimestamp: new Date().toISOString(),
    }
    this.write()
  }
}
