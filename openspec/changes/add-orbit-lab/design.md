## Context

Orbit Lab is Episode 01 of Essayons and the first concrete implementation on top of the simulation engine framework (`add-simulation-engine`). It serves two purposes: (1) deliver a compelling orbital mechanics learning experience, and (2) establish the implementation pattern that every future episode will follow. The design decisions here will be inherited — or deliberately overridden — by every subsequent episode.

The simulation must handle real orbital mechanics (not approximations) while running at 60 FPS in a browser, including on mid-range mobile devices. The physics must be accurate enough that users can discover Kepler's laws empirically — if the simulator is wrong, the educational premise fails.

### Constraints

- Client-side only (no server computation)
- Zero external physics libraries (project convention: no paid tools, minimal dependencies)
- Must integrate with the simulation engine framework's loop, parameter system, and mission framework
- Must work with keyboard, mouse, and touch input
- WCAG AA accessibility requirements

### Stakeholders

- Solo developer (implementation)
- End users (learners exploring orbital mechanics)

## Goals / Non-Goals

### Goals

- Physically accurate 2D orbital mechanics (Newtonian gravity, correct Kepler behavior)
- Numerically stable simulation across time warp speeds from 1x to 1000x
- Three missions that progressively teach orbital concepts (orbit, transfer, escape)
- Discoverable learning — users figure out principles by observing cause and effect
- Establish a reusable episode implementation pattern for future episodes
- 60 FPS rendering with real-time physics computation

### Non-Goals

- 3D orbital mechanics or out-of-plane maneuvers (2D is sufficient for Kepler's laws)
- N-body simulation (single central body is enough for Episode 01)
- Atmospheric drag, J2 perturbations, or other higher-order effects
- Multiplayer or shared simulations
- Server-side physics validation or leaderboards
- Procedural planet generation or realistic Earth textures

## Decisions

### Physics Engine: Velocity Verlet Integration

**Decision**: Use the Velocity Verlet (Stormer-Verlet) method for numerical integration of orbital equations of motion.

**Why**: Velocity Verlet is symplectic — it conserves energy over long integration periods, which is critical for orbital mechanics where energy drift causes orbits to spiral inward or outward over time. Euler methods (even RK4) accumulate energy errors that would make multi-orbit simulations visibly wrong. Velocity Verlet is also second-order accurate (O(dt²)) while only requiring one force evaluation per step.

**Algorithm per timestep dt**:

```
1. x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
2. a(t+dt) = F(x(t+dt)) / m          // recompute force at new position
3. v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
```

**Alternatives considered**:

- **Euler**: First-order, energy grows without bound. Rejected — orbits visibly degrade within minutes.
- **RK4**: Fourth-order accurate but not symplectic. Energy drift is slower but still present over many orbits. Also requires 4 force evaluations per step (4x computation cost). Rejected — Verlet gives better long-term behavior at lower cost.
- **Leapfrog**: Equivalent to Verlet but stores velocity at half-steps, making telemetry extraction awkward. Rejected for ergonomic reasons.

### Adaptive Sub-stepping for Time Warp

**Decision**: When time warp factor W increases, subdivide each frame's physics update into N sub-steps where N = ceil(W \* dt_frame / dt_max), with dt_max calibrated so that the fastest expected orbital velocity does not skip more than a fraction of Earth's radius per step.

**Why**: At 1000x time warp, a single frame at 60 FPS represents ~16.7 seconds of simulated time. A satellite in low orbit (~7.8 km/s) would move ~130 km per frame — potentially tunneling through Earth. Sub-stepping keeps each physics step small enough for stability.

**dt_max heuristic**: dt_max = R_earth / (10 \* v_max), where v_max is escape velocity at the surface. This ensures no single step covers more than 10% of Earth's radius.

**Performance budget**: At 1000x warp, this may require ~100-200 sub-steps per frame. Each sub-step is one gravitational force calculation (2 multiplies, 1 sqrt, 2 divides) plus one Verlet update (6 adds, 6 multiplies). Total: ~2000 floating-point operations per frame — negligible on any modern CPU.

**Alternatives considered**:

- **Fixed sub-step count**: Simpler but either wastes computation at low warp or is inaccurate at high warp. Rejected.
- **Adaptive step sizing based on error estimation**: Overkill for a single force source. RKF45-style error control adds complexity without meaningful benefit for Keplerian orbits. Rejected.

### Gravitational Model: Single Central Body

**Decision**: Model gravity as F = GMm/r² from a single point mass (Earth) at the origin. No N-body interactions, no oblateness, no drag.

**Why**: Kepler's laws describe the two-body problem exactly. Adding perturbations would obscure the clean relationships users are meant to discover. The educational goal is served by the idealized model.

**Coordinate system**: Origin at Earth's center. Positions and velocities stored in meters (SI) internally; rendered with a configurable pixels-per-meter scale that adjusts dynamically based on orbit size.

### Orbital Element Computation from State Vectors

**Decision**: Compute orbital elements (eccentricity, semi-major axis, apogee, perigee, period) directly from position and velocity vectors each frame, rather than maintaining Keplerian elements and propagating analytically.

**Why**: The simulation is Cartesian (state vectors), not Keplerian. Converting to elements each frame is cheap (a few dot products and a sqrt) and avoids synchronization issues between the integrator state and displayed elements. It also means thrust maneuvers automatically update displayed orbital parameters — no special-case handling needed.

**Key formulas** (all in 2D, vectors in bold):

- Specific orbital energy: E = |**v**|²/2 - GM/|**r**|
- Eccentricity vector: **e** = ((|**v**|² - GM/|**r**|) _ **r** - (**r** . **v**) _ **v**) / GM
- Eccentricity magnitude: e = |**e**|
- Semi-major axis: a = -GM / (2E) (for E < 0, i.e., bound orbits)
- Apogee: r_a = a(1 + e)
- Perigee: r_p = a(1 - e)
- Period: T = 2 _ pi _ sqrt(a³ / GM)

### Mission State Machine

**Decision**: Each mission is a finite state machine with states: `BRIEFING -> ACTIVE -> SUCCESS | FAILED`. Transitions are driven by per-frame condition checks registered with the simulation engine's mission framework.

**State definitions**:

- `BRIEFING`: Display mission objectives and instructions. User has not launched yet.
- `ACTIVE`: Simulation running, conditions checked every frame.
- `SUCCESS`: All success criteria met. Display congratulations, offer next mission or sandbox.
- `FAILED`: A failure condition triggered (crash, escape when not intended, timeout). Display encouraging failure message, offer retry.

**Achieve Orbit conditions**:

- Success: eccentricity < 0.1 AND perigee > R_earth + atmosphere_height AND angle swept >= 2\*pi (one full orbit completed)
- Failure: r < R_earth (crash) OR timeout

**Hohmann Transfer conditions**:

- Success: start orbit altitude within band A, end orbit altitude within band B, both stable (e < 0.1, full orbit at target)
- Failure: crash, uncontrolled escape, timeout

**Escape Velocity conditions**:

- Success: specific orbital energy E > 0 sustained for N consecutive frames AND r > threshold
- Failure: crash, timeout, orbit stabilizes (educational "failure" — encourage more thrust)

### Canvas Rendering Architecture

**Decision**: Use the simulation engine's layered Canvas rendering system with three layers, painted back-to-front each frame:

1. **Background layer**: Static star field (pre-rendered to offscreen canvas, blitted each frame) with optional slow parallax
2. **Simulation layer**: Earth (filled circle + atmosphere glow gradient), satellite (directional triangle/sprite), trajectory trail (polyline of last N positions with alpha fade), orbital path prediction (dotted ellipse from current orbital elements)
3. **UI overlay layer**: Telemetry readout (top-right), mission status (top-left), time warp indicator

**Why layered rendering**: The background and UI overlays change infrequently. By separating them, we can optimize (e.g., skip background redraw when only the simulation layer changes, or use offscreen canvases for compositing). However, for MVP, we paint all three layers every frame — the optimization is a future performance escape hatch, not an MVP requirement.

**Camera system**: The camera tracks the satellite with smooth interpolation (lerp toward satellite position each frame). Zoom level auto-adjusts based on the larger of (a) distance from Earth to satellite and (b) predicted orbit size. Manual zoom override via scroll wheel or pinch gesture.

**Trail rendering**: Store the last 500 position samples. Draw as a polyline with linearly decreasing alpha from 1.0 (current) to 0.0 (oldest). At high time warp, downsample trail points to prevent excessive draw calls.

### Telemetry Display Design

**Decision**: Render telemetry directly on the Canvas overlay layer using IBM Plex Mono at 14px, positioned in the top-right quadrant. Values update every frame. Labels use Physics accent color #00D4AA; values use white (#FFFFFF).

**Fields displayed**:
| Label | Unit | Format |
|-------|------|--------|
| Altitude | km | comma-separated integer |
| Velocity | km/s | 2 decimal places |
| Eccentricity | — | 4 decimal places |
| Apogee | km | comma-separated integer |
| Perigee | km | comma-separated integer |
| Period | min or hr | auto-switch at 120 min |
| Energy | MJ/kg | 2 decimal places, signed |

**Why Canvas instead of DOM overlay**: Telemetry updates 60 times per second. DOM manipulation at this rate causes layout thrashing and GC pressure from string concatenation. Canvas text rendering with `fillText` is constant-cost and avoids React reconciliation entirely.

### Reference Panel Design

**Decision**: Implement the reference panel as a React component (`ReferencePanel.tsx`) rendered in the DOM beside or overlaying the canvas, not painted on the canvas itself.

**Why**: The reference panel is static educational content (text, equations, occasional diagrams). It benefits from DOM text rendering (selectable, accessible, responsive layout, screen reader compatible). It does not need 60 FPS updates. Using React here also provides a clear example of the React/Canvas boundary pattern for future episodes.

**Content structure**:

1. **Kepler's First Law** — Elliptical orbits, focus at central body. Connect to eccentricity telemetry.
2. **Kepler's Second Law** — Equal areas in equal times. Connect to velocity changes at apogee vs perigee.
3. **Kepler's Third Law** — T² = (4pi²/GM) \* a³. Connect to period telemetry and semi-major axis.
4. **Vis-viva equation** — v² = GM(2/r - 1/a). The "master equation" connecting velocity, position, and orbit shape.
5. **Escape velocity** — v_esc = sqrt(2GM/r). Threshold for unbound trajectories.

Each section includes: plain-language explanation, the formula with variable definitions, and a note connecting it to what the user can observe in the telemetry.

**Contextual highlighting**: When a mission is active, the reference panel highlights the most relevant equation. For example, during "Achieve Orbit" the eccentricity and vis-viva sections are highlighted. During "Escape Velocity" the escape velocity section is highlighted.

### Mobile and Touch Controls

**Decision**: On touch devices, replace keyboard controls with on-screen controls: a launch angle drag handle, a velocity slider, and four directional thrust buttons (prograde, retrograde, radial-in, radial-out) positioned in the bottom-left corner as a diamond arrangement.

**Why**: WASD is not available on mobile. The thrust controls must be continuously holdable (not tap-based) to match the keyboard experience. The diamond layout mirrors the directional semantics (up = prograde = forward along orbit).

**Detection**: Use `'ontouchstart' in window` or `navigator.maxTouchPoints > 0` to detect touch capability. Show touch controls only on touch devices. Allow both simultaneously for hybrid devices (touchscreen laptops).

## Risks / Trade-offs

### Risk: Numerical instability at extreme time warp

- **Mitigation**: Adaptive sub-stepping with conservative dt_max. Add a hard cap on sub-steps per frame (e.g., 500) and reduce time warp automatically if the cap is hit, displaying a notice to the user.

### Risk: Performance on low-end mobile devices

- **Mitigation**: The performance budget manager from the simulation engine will monitor frame times. If frames consistently exceed 16ms, reduce trail length, lower sub-step count (accepting slightly less accuracy at high warp), and simplify rendering (remove atmosphere glow, reduce star count). 60 FPS is a target; 30 FPS is the absolute minimum before degradation becomes visible.

### Risk: Educational accuracy — users "discover" wrong relationships

- **Mitigation**: Use real physics (not gamified approximations). Validate simulation output against analytical solutions in unit tests. If a circular orbit at altitude h does not have period T = 2pi\*sqrt((R+h)³/GM) within 0.1% tolerance, the test fails.

### Risk: First episode sets a bad pattern

- **Mitigation**: Explicitly document which parts of this implementation are episode-specific (gravity model, orbital mechanics, missions) vs. which rely on shared engine infrastructure (simulation loop, canvas rendering, input handling, mission framework, parameter system). Future episodes should only need to implement the episode-specific parts.

### Trade-off: 2D only

- **Accepted**: 3D would be more visually impressive but adds enormous complexity (3D rendering, camera controls, inclined orbits) without teaching fundamentally different physics for the introductory episode. 2D is the right scope for Episode 01.

### Trade-off: Idealized gravity (no perturbations)

- **Accepted**: Real orbits are perturbed by atmospheric drag, Earth oblateness (J2), solar radiation pressure, and third-body effects. Excluding these makes Kepler's laws hold exactly, which is the pedagogical goal. A future "Advanced Orbital Mechanics" episode could add perturbations.

## Migration Plan

Not applicable — this is a greenfield addition. No existing code is modified. The episode is additive to the platform.

**Rollback**: Remove the `src/episodes/orbit-lab/` directory and any route/navigation entries pointing to it. The simulation engine and platform are unaffected.

## Open Questions

1. **Scale factor calibration**: What pixels-per-meter ratio produces the best visual at typical viewport sizes (1280x720 to 1920x1080)? Likely needs manual tuning during implementation. Should auto-zoom handle this entirely?
2. **Trail rendering at high eccentricity**: Highly elliptical orbits have the satellite moving very fast at perigee and very slow at apogee. Should trail sampling be time-based (even spacing in time, clustered at perigee) or distance-based (even spacing in space, more visually uniform)?
3. **Hohmann transfer detection tolerance**: How loose should the altitude bands be for mission success? Too tight and it is frustratingly precise; too loose and it does not teach orbital transfer. Needs playtesting.
4. **Sound effects**: Should satellite launch, thrust, and mission completion have audio feedback? The PRD does not mention audio. Deferring to a future enhancement.
5. **Orbit prediction accuracy during thrust**: The dotted prediction ellipse assumes Keplerian (no thrust) propagation. During active thrust, the prediction is wrong. Should it be hidden during thrust, shown with a "prediction invalid during thrust" label, or continuously updated (expensive)?
