# Change: Add shareable simulation states via URL parameters

## Why

Teachers need to share specific simulation setups with students by sending a link. Encoding simulation parameters in the URL lets anyone reproduce an exact simulation state without accounts, servers, or file transfers — aligned with Essayons' zero-friction principle.

## What Changes

- Add a generic URL state codec that serializes episode simulation parameters to URL query/hash parameters and deserializes them on page load
- Add parameter validation and sanitization layer that falls back to episode defaults for invalid, missing, or out-of-range values
- Add share UI with a "Copy Link" button and native Web Share API integration (where supported)
- Add URL length management with optional parameter compression for episodes with many parameters
- Add cross-episode parameter registry so each episode declares its shareable parameters and their types/ranges without episode-specific encoding logic

## Impact

- Affected specs: `shareable-states` (new capability)
- Affected code:
  - `src/shared/state-codec.ts` — URL encode/decode logic, parameter serialization, compression
  - `src/shared/state-validator.ts` — parameter validation, range checking, default fallback
  - `src/shared/share-ui.tsx` — share button component, clipboard copy, native share API
  - `src/shared/use-url-state.ts` — React hook for reading URL parameters on load and syncing state
  - `src/shared/types.ts` — parameter schema types, codec configuration interfaces
  - `src/episodes/orbit-lab/orbit-lab-params.ts` — Orbit Lab parameter definitions (angle, velocity, mission, etc.)
