## 1. Parameter Schema and Registry

- [ ] 1.1 Define `ParameterSchema` TypeScript interface with name, type (number, string, boolean, enum), default value, min/max range, and display label
- [ ] 1.2 Create `ParameterRegistry` that episodes use to declare their shareable parameters
- [ ] 1.3 Add Orbit Lab parameter definitions (angle, velocity, mission, timeWarp) as the first registered episode

## 2. URL State Codec

- [ ] 2.1 Implement `encodeState(params, schema): string` that serializes parameter values to URL query string format
- [ ] 2.2 Implement `decodeState(url, schema): Record<string, unknown>` that parses URL parameters back to typed values
- [ ] 2.3 Add short human-readable parameter key aliases (e.g., `v` for velocity, `a` for angle)
- [ ] 2.4 Add optional compression for URLs exceeding length threshold (Base64-encoded JSON in a single `s=` parameter)
- [ ] 2.5 Write unit tests for encode/decode round-trips, edge cases, and compression fallback

## 3. Parameter Validation

- [ ] 3.1 Implement `validateParams(decoded, schema): ValidatedParams` that checks types, ranges, and required fields
- [ ] 3.2 Return validated values with defaults substituted for any invalid or missing parameters
- [ ] 3.3 Log warnings to console for invalid parameters (developer-facing, not user-facing)
- [ ] 3.4 Write unit tests for validation: missing params, out-of-range values, wrong types, unknown params ignored

## 4. URL State React Hook

- [ ] 4.1 Create `useUrlState(schema)` hook that reads URL on mount, decodes, validates, and returns typed state
- [ ] 4.2 Hook returns `{ params, isFromUrl }` so episodes can distinguish shared state from fresh load
- [ ] 4.3 Write unit tests for the hook with various URL inputs

## 5. Share UI Component

- [ ] 5.1 Create `ShareButton` component that generates the shareable URL from current simulation parameters
- [ ] 5.2 Implement clipboard copy with visual feedback ("Copied!" toast or button state change)
- [ ] 5.3 Integrate native Web Share API with fallback to clipboard copy on unsupported browsers
- [ ] 5.4 Style component to match episode accent color using CSS variables
- [ ] 5.5 Ensure keyboard accessibility (focusable, Enter/Space triggers, aria-label)
- [ ] 5.6 Write component tests for copy, share API, and fallback behavior

## 6. Integration

- [ ] 6.1 Wire `useUrlState` into Orbit Lab episode to restore state from URL on load
- [ ] 6.2 Add `ShareButton` to Orbit Lab control panel
- [ ] 6.3 Write E2E test: generate share link, navigate to it, verify simulation state matches
- [ ] 6.4 Verify URL works across browser back/forward navigation without breaking state
