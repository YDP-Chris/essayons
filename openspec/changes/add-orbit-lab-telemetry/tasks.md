## 1. Orbital Metrics Computation

- [x] 1.1 Add `eccentricity`, `semiMajorAxis`, `apogee`, `perigee`, `specificEnergy`, and `acceleration` fields to `OrbitalState` in `physics.ts`
- [x] 1.2 Compute eccentricity from state vectors: `e = |((v²-GM/r)*r - (r·v)*v)| / GM` each frame in `updateOrbitalState`
- [x] 1.3 Compute semi-major axis from specific energy: `a = -GM/(2E)` for bound orbits (E < 0)
- [x] 1.4 Compute apogee altitude `a*(1+e) - R` and perigee altitude `a*(1-e) - R` for bound orbits
- [x] 1.5 Store specific orbital energy `E = v²/2 - GM/r` on state (already computed locally — promote to state field)
- [x] 1.6 Compute current gravitational acceleration magnitude and store on state
- [x] 1.7 Write unit tests: verify eccentricity ≈ 0 for circular orbit, verify apogee/perigee match known values for ISS-like orbit, verify energy is negative for bound orbits and positive for escape

## 2. Expanded HUD

- [x] 2.1 Add `show-metrics` boolean parameter (default: `true`) to episode config in `config.ts`
- [x] 2.2 Expand `drawHud` in `renderer.ts` to display: eccentricity (4 decimals), apogee (km, 1 decimal), perigee (km, 1 decimal), energy (MJ/kg, 2 decimals with sign), acceleration (m/s², 2 decimals)
- [x] 2.3 Show expanded metrics only when `show-metrics` parameter is true; always show the existing basic telemetry (altitude, velocity, orbits, time, period, status)
- [x] 2.4 Display "---" for apogee/perigee/period/eccentricity when orbit is hyperbolic (e ≥ 1) or escaped
- [x] 2.5 Widen HUD background box to accommodate new metrics; keep right-aligned layout

## 3. Speed-Coded Trail

- [x] 3.1 Extend `TrailPoint` type to include velocity magnitude `speed` field
- [x] 3.2 Store `speed` on each trail point during `updateOrbitalState`
- [x] 3.3 In trail rendering, interpolate color from blue (`#3b82f6`, slow/apogee) to red (`#ef4444`, fast/perigee) based on each point's speed relative to the trail's min/max speed range
- [x] 3.4 Write unit test: verify trail points include speed values

## 4. Apogee/Perigee Markers

- [x] 4.1 In the renderer, after drawing the trail, scan trail points to find the one with max distance from planet center (apogee) and min distance (perigee)
- [x] 4.2 Render a small diamond marker at each apse point with a label ("AP" for apogee, "PE" for perigee) using the Physics accent color
- [x] 4.3 Only render markers when the satellite has completed at least 0.5 orbits (enough trail to have meaningful extremes)

## 5. Integration and Testing

- [x] 5.1 Verify existing 50 orbit-lab tests still pass with the new state fields (all 50 pass + 8 new = 58 total)
- [x] 5.2 Run full test suite to confirm no regressions (777 tests pass across 34 files)
- [x] 5.3 Run typecheck to confirm zero TS errors
