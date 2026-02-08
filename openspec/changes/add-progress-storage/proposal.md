# Change: Add browser-side progress storage via localStorage

## Why

Users who return to Essayons have no way to see which missions they have already completed or which episodes they have visited. Storing lightweight completion state in localStorage preserves the zero-friction, no-account philosophy while giving returning users continuity and enabling return-visit analytics (>25% within 7 days target).

## What Changes

- Add a `progress-storage` capability that persists mission completion states per episode in localStorage
- Track episode visit timestamps (first visit, last visit) to identify returning users
- Introduce a versioned JSON data schema so the format can evolve without breaking existing stored data
- Implement graceful degradation when localStorage is unavailable (private browsing, storage full, disabled)
- Detect return visits (user revisiting within a configurable window) for aggregate analytics via Plausible
- Store zero personal data — only anonymous completion flags and visit timestamps

## Impact

- Affected specs: `progress-storage` (new capability)
- Affected code:
  - `src/lib/progress-storage.ts` — storage service (read/write/migrate)
  - `src/hooks/useProgress.ts` — React hook exposing completion state
  - Episode mission-complete handlers — call storage service on completion
  - `src/lib/analytics.ts` — fire return-visit event to Plausible
