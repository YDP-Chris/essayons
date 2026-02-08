## 1. Data Schema & Storage Service

- [ ] 1.1 Define versioned JSON schema type (`ProgressData`) with version field, episode map, and visit metadata
- [ ] 1.2 Implement `ProgressStorageService` class in `src/lib/progress-storage.ts` with read, write, and clear methods
- [ ] 1.3 Add localStorage availability detection (try/catch probe write) with in-memory fallback
- [ ] 1.4 Implement schema version migration logic (v1 baseline, extensible for future versions)
- [ ] 1.5 Add storage quota guard — catch `QuotaExceededError` and degrade gracefully

## 2. Mission Completion Tracking

- [ ] 2.1 Add `markMissionComplete(episodeId, missionId)` method to storage service
- [ ] 2.2 Add `isMissionComplete(episodeId, missionId)` query method
- [ ] 2.3 Add `getCompletedMissions(episodeId)` method returning list of completed mission IDs
- [ ] 2.4 Integrate completion calls into episode mission-complete event handlers

## 3. Episode Visit Tracking

- [ ] 3.1 Add `recordEpisodeVisit(episodeId)` method that sets firstVisit (once) and updates lastVisit
- [ ] 3.2 Add `getEpisodeVisits()` method returning visit metadata for all episodes
- [ ] 3.3 Call `recordEpisodeVisit` when an episode loads

## 4. Return Visit Detection

- [ ] 4.1 Add `isReturnVisit()` method — true if any previous session exists older than current page load
- [ ] 4.2 Record global `lastSessionTimestamp` on each app load
- [ ] 4.3 Fire Plausible custom event (`return-visit`) when a return visit is detected
- [ ] 4.4 Ensure return-visit detection works even when localStorage is read-only (degrade to "new visit")

## 5. React Integration

- [ ] 5.1 Create `useProgress` hook exposing completion state and episode visit data
- [ ] 5.2 Ensure hook triggers re-render when progress changes within the same session
- [ ] 5.3 Provide `ProgressContext` so storage service is instantiated once at app root

## 6. Testing

- [ ] 6.1 Unit tests for `ProgressStorageService` — write, read, migration, fallback
- [ ] 6.2 Unit tests for return-visit detection logic
- [ ] 6.3 Unit tests for storage-unavailable fallback (mock localStorage throwing)
- [ ] 6.4 Unit tests for quota-exceeded handling
- [ ] 6.5 Integration test: complete a mission, reload, verify completion persists (Playwright)
