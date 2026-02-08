# Change: Add Orbit Lab — Episode 01 orbital mechanics simulator

## Why

Orbit Lab is the proof-of-concept episode that demonstrates Essayons' core value proposition: learning through interactive experimentation rather than passive instruction. It teaches orbital mechanics by letting users launch satellites, tweak parameters, and discover Kepler's laws through trial and error. As Episode 01, it also establishes the implementation pattern that every future episode will follow.

## What Changes

- Add Newtonian gravity simulation using F = GMm/r² with Velocity Verlet integration and adaptive sub-stepping for numerical stability at high time-warp speeds
- Add satellite launch controls: launch angle, initial velocity, and real-time thrust via WASD keys
- Add time warp system (1x–1000x) integrated with adaptive sub-stepping to maintain accuracy
- Add three structured missions: Achieve Stable Orbit, Hohmann Transfer, and Escape Velocity — each with clear success/failure criteria evaluated per-frame by the mission framework
- Add sandbox mode with all parameters unlocked and no fail states for free exploration
- Add real-time telemetry display: altitude, velocity, orbital eccentricity, apogee, perigee, orbital period, and specific orbital energy
- Add reference panel presenting Kepler's three laws, vis-viva equation, and orbital mechanics formulas as contextual educational content
- Add Canvas rendering for Earth (with atmosphere glow), satellite sprite, trajectory trail, orbital path prediction, and telemetry overlay
- Add touch controls for mobile responsiveness (drag to aim, tap to launch, on-screen WASD)
- Apply Physics domain accent color #00D4AA throughout the episode UI

## Impact

- Affected specs: `orbit-lab` (new capability)
- Affected code:
  - `src/episodes/orbit-lab/OrbitLabEpisode.ts` — episode entry point, wires engine to orbit-specific logic
  - `src/episodes/orbit-lab/GravitySimulation.ts` — Newtonian gravity, Velocity Verlet integrator, adaptive sub-stepping
  - `src/episodes/orbit-lab/SatelliteControls.ts` — launch parameters, WASD thrust, real-time adjustment
  - `src/episodes/orbit-lab/OrbitalMechanics.ts` — orbit classification, apogee/perigee/eccentricity/period computation
  - `src/episodes/orbit-lab/missions/AchieveOrbitMission.ts` — stable orbit detection logic
  - `src/episodes/orbit-lab/missions/HohmannTransferMission.ts` — transfer orbit detection logic
  - `src/episodes/orbit-lab/missions/EscapeVelocityMission.ts` — escape trajectory detection logic
  - `src/episodes/orbit-lab/Telemetry.ts` — real-time orbital parameter computation and formatting
  - `src/episodes/orbit-lab/ReferencePanel.tsx` — Kepler's laws and equations display
  - `src/episodes/orbit-lab/OrbitRenderer.ts` — Canvas rendering for Earth, satellite, trails, predictions
  - `src/episodes/orbit-lab/types.ts` — TypeScript interfaces for orbital state, mission state, telemetry
  - `src/episodes/orbit-lab/constants.ts` — gravitational constant, Earth mass/radius, scale factors
