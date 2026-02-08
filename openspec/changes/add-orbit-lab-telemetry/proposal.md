# Change: Add enhanced telemetry and orbital metrics to Orbit Lab

## Why

The Orbit Lab HUD currently displays only altitude, velocity, orbit count, time, and period. The original spec called for eccentricity, apogee, perigee, specific orbital energy, and speed-coded trail visualization — but these were never implemented. Without these metrics, users can't see _why_ their orbit looks the way it does. They're flying blind: they can see their satellite moving but can't connect parameter changes to orbital mechanics concepts like eccentricity or energy.

This change closes the gap between the spec's educational intent and the actual HUD, adds speed-coded trail coloring so users can _see_ Kepler's Second Law in action, and adds visual apogee/perigee markers on the orbit trail so the extremes of the ellipse are obvious at a glance.

## What Changes

- **Compute orbital metrics** in `physics.ts`: eccentricity, semi-major axis, apogee altitude, perigee altitude, and specific orbital energy — per frame, stored on `OrbitalState`
- **Expand HUD** in `renderer.ts`: display eccentricity, apogee, perigee, energy, and acceleration alongside existing telemetry; format values per spec (km, MJ/kg, decimal places)
- **Speed-coded trail**: color the orbit trail by velocity magnitude (blue=slow at apogee, red=fast at perigee) so Kepler's Second Law is visible
- **Apogee/perigee markers**: render small labeled markers at the trail points closest to apogee and perigee altitudes
- **Add a "show-metrics" toggle parameter**: lets users show/hide the expanded telemetry (default: on) so the HUD doesn't overwhelm beginners

## Impact

- Affected specs: `orbit-lab-telemetry` (new capability)
- Affected code:
  - `src/episodes/orbit-lab/physics.ts` — add eccentricity, apogee, perigee, energy to OrbitalState and computation
  - `src/episodes/orbit-lab/renderer.ts` — expand HUD, add speed-coded trail, add apse markers
  - `src/episodes/orbit-lab/config.ts` — add `show-metrics` toggle parameter
  - `src/episodes/orbit-lab/orbit-lab.test.ts` — add tests for new orbital metric calculations
