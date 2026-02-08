import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProgressStorageService } from './progress-storage.ts'
import { CURRENT_SCHEMA_VERSION } from './types.ts'

const STORAGE_KEY = 'essayons_progress'

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Restore a "normal" localStorage before each test. */
function resetLocalStorage(): void {
  localStorage.clear()
}

// ---------------------------------------------------------------------------
// 6.1 — ProgressStorageService: write, read, migration, fallback
// ---------------------------------------------------------------------------

describe('ProgressStorageService', () => {
  beforeEach(() => {
    resetLocalStorage()
    vi.restoreAllMocks()
  })

  // ---- basic read / write -----------------------------------------------

  it('starts with empty data', () => {
    const svc = new ProgressStorageService()
    const data = svc.getData()
    expect(data.version).toBe(CURRENT_SCHEMA_VERSION)
    expect(Object.keys(data.episodes)).toHaveLength(0)
    expect(data.lastSessionTimestamp).toBeNull()
  })

  it('persists data to localStorage on write', () => {
    const svc = new ProgressStorageService()
    svc.markMissionComplete('ep1', 'm1')

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed: unknown = JSON.parse(raw!)
    expect(parsed).toHaveProperty('version', CURRENT_SCHEMA_VERSION)
  })

  it('reads persisted data on construction', () => {
    const svc1 = new ProgressStorageService()
    svc1.markMissionComplete('ep1', 'm1')

    // New instance reads what the first one wrote
    const svc2 = new ProgressStorageService()
    expect(svc2.isMissionComplete('ep1', 'm1')).toBe(true)
  })

  it('clears all data', () => {
    const svc = new ProgressStorageService()
    svc.markMissionComplete('ep1', 'm1')
    svc.clear()
    expect(svc.isMissionComplete('ep1', 'm1')).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  // ---- mission completion -----------------------------------------------

  it('marks a mission complete and queries it', () => {
    const svc = new ProgressStorageService()
    expect(svc.isMissionComplete('ep1', 'm1')).toBe(false)
    svc.markMissionComplete('ep1', 'm1')
    expect(svc.isMissionComplete('ep1', 'm1')).toBe(true)
  })

  it('returns completed missions for an episode', () => {
    const svc = new ProgressStorageService()
    svc.markMissionComplete('ep1', 'm1')
    svc.markMissionComplete('ep1', 'm2')
    svc.markMissionComplete('ep2', 'mA')

    expect(svc.getCompletedMissions('ep1')).toEqual(expect.arrayContaining(['m1', 'm2']))
    expect(svc.getCompletedMissions('ep1')).toHaveLength(2)
    expect(svc.getCompletedMissions('ep2')).toEqual(['mA'])
    expect(svc.getCompletedMissions('ep_unknown')).toEqual([])
  })

  // ---- episode visit tracking -------------------------------------------

  it('records first and subsequent visits', () => {
    const svc = new ProgressStorageService()
    svc.recordEpisodeVisit('ep1')
    const visits1 = svc.getEpisodeVisits()
    expect(visits1['ep1']).toBeDefined()
    const firstVisit = visits1['ep1']!.firstVisit

    // record again — firstVisit unchanged, lastVisit updated
    svc.recordEpisodeVisit('ep1')
    const visits2 = svc.getEpisodeVisits()
    expect(visits2['ep1']!.firstVisit).toBe(firstVisit)
    expect(new Date(visits2['ep1']!.lastVisit).getTime()).toBeGreaterThanOrEqual(
      new Date(firstVisit).getTime(),
    )
  })

  it('getEpisodeVisits returns only episodes with visits', () => {
    const svc = new ProgressStorageService()
    svc.markMissionComplete('ep1', 'm1') // no visit recorded
    svc.recordEpisodeVisit('ep2')

    const visits = svc.getEpisodeVisits()
    expect(visits['ep1']).toBeUndefined()
    expect(visits['ep2']).toBeDefined()
  })

  // ---- return-visit detection (6.2) -------------------------------------

  it('detects a new visit when no previous session exists', () => {
    const svc = new ProgressStorageService()
    expect(svc.isReturnVisit()).toBe(false)
  })

  it('detects a return visit after a session has been recorded', () => {
    const svc1 = new ProgressStorageService()
    svc1.recordSession()

    // simulate next visit — new service instance
    const svc2 = new ProgressStorageService()
    expect(svc2.isReturnVisit()).toBe(true)
  })

  // ---- schema migration (1.4) -------------------------------------------

  it('migrates pre-v1 (version 0) data to empty v1', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 0, old_field: true }))
    const svc = new ProgressStorageService()
    expect(svc.getData().version).toBe(CURRENT_SCHEMA_VERSION)
    expect(Object.keys(svc.getData().episodes)).toHaveLength(0)
  })

  it('handles missing version field gracefully', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    const svc = new ProgressStorageService()
    expect(svc.getData().version).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('handles corrupt JSON gracefully', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')
    const svc = new ProgressStorageService()
    expect(svc.getData().version).toBe(CURRENT_SCHEMA_VERSION)
    expect(Object.keys(svc.getData().episodes)).toHaveLength(0)
  })

  it('handles non-object stored value gracefully', () => {
    localStorage.setItem(STORAGE_KEY, '"just a string"')
    const svc = new ProgressStorageService()
    expect(svc.getData().version).toBe(CURRENT_SCHEMA_VERSION)
  })

  // ---- change notification ----------------------------------------------

  it('notifies subscribers on write', () => {
    const svc = new ProgressStorageService()
    const cb = vi.fn()
    svc.subscribe(cb)
    svc.markMissionComplete('ep1', 'm1')
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes correctly', () => {
    const svc = new ProgressStorageService()
    const cb = vi.fn()
    const unsub = svc.subscribe(cb)
    unsub()
    svc.markMissionComplete('ep1', 'm1')
    expect(cb).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// 6.3 — localStorage unavailable fallback
// ---------------------------------------------------------------------------

describe('ProgressStorageService — localStorage unavailable', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to in-memory when localStorage throws on probe', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const svc = new ProgressStorageService()
    // Still works in-memory
    svc.markMissionComplete('ep1', 'm1')
    expect(svc.isMissionComplete('ep1', 'm1')).toBe(true)
  })

  it('return-visit detection degrades to new visit when storage unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const svc = new ProgressStorageService()
    expect(svc.isReturnVisit()).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 6.4 — quota-exceeded handling
// ---------------------------------------------------------------------------

describe('ProgressStorageService — quota exceeded', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('degrades gracefully when quota is exceeded on write', () => {
    const svc = new ProgressStorageService()

    // Allow the probe write to succeed, then fail on actual setItem
    let callCount = 0
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      callCount++
      // First two calls are probe write and remove — let them pass
      // (the constructor already ran, so this is the next setItem)
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    })

    // Should not throw
    expect(() => svc.markMissionComplete('ep1', 'm1')).not.toThrow()
    // In-memory copy is still updated
    expect(svc.isMissionComplete('ep1', 'm1')).toBe(true)
    expect(callCount).toBeGreaterThan(0)
  })
})
