## 1. Foundation and Constants

- [ ] 1.1 Define TypeScript interfaces for orbital state (position, velocity, acceleration), satellite state, and simulation configuration in `types.ts`
- [ ] 1.2 Define physical constants (G, Earth mass, Earth radius, scale factors, default satellite mass) and mission threshold constants in `constants.ts`
- [ ] 1.3 Create `OrbitLabEpisode.ts` entry point that instantiates the simulation engine with orbit-specific configuration and registers all subsystems

## 2. Gravity Simulation and Physics

- [ ] 2.1 Implement Newtonian gravitational force calculation F = GMm/r² with proper vector decomposition into x/y components
- [ ] 2.2 Implement Velocity Verlet integration: position update, force recalculation at new position, velocity update using averaged accelerations
- [ ] 2.3 Implement adaptive sub-stepping that increases physics steps per frame when time warp exceeds thresholds (e.g., dt_sub = dt_frame / ceil(v \* dt / maxStep))
- [ ] 2.4 Implement collision detection with Earth surface (r < R_earth) triggering crash state
- [ ] 2.5 Implement escape detection when satellite exceeds Hill sphere or specific orbital energy becomes positive
- [ ] 2.6 Write unit tests: compare simulated circular orbit period against Kepler's analytical T = 2pi \* sqrt(a³/GM); verify energy conservation over 100 orbits; verify Verlet is second-order accurate

## 3. Satellite Controls

- [ ] 3.1 Implement launch parameter system: angle (0-360 degrees) and initial velocity (0 to ~12 km/s scaled) as adjustable parameters registered with the engine's parameter system
- [ ] 3.2 Implement launch action that converts angle + velocity into initial velocity vector and spawns the satellite at a configurable altitude above Earth's surface
- [ ] 3.3 Implement WASD thrust controls: W = prograde thrust, S = retrograde thrust, A = radial-in (toward Earth), D = radial-out (away from Earth), applied as continuous acceleration during keypress
- [ ] 3.4 Implement touch input mapping: drag-to-aim for launch angle, pinch for velocity adjustment, on-screen directional buttons for thrust
- [ ] 3.5 Implement real-time parameter adjustment (sliders update simulation state without restart where applicable)
- [ ] 3.6 Write unit tests: verify thrust vector directions relative to orbital velocity; verify launch vector from angle and speed

## 4. Orbital Mechanics Calculations

- [ ] 4.1 Implement specific orbital energy calculation: E = v²/2 - GM/r
- [ ] 4.2 Implement orbital eccentricity calculation from state vectors: e = |((v²-GM/r)*r - (r·v)*v)| / GM
- [ ] 4.3 Implement semi-major axis: a = -GM / (2\*E) for bound orbits
- [ ] 4.4 Implement apogee and perigee: r_a = a*(1+e), r_p = a*(1-e)
- [ ] 4.5 Implement orbital period: T = 2*pi*sqrt(a³/GM)
- [ ] 4.6 Implement orbit classification: circular (e < 0.01), elliptical (0.01 <= e < 1), parabolic (e ≈ 1), hyperbolic (e > 1)
- [ ] 4.7 Write unit tests: verify calculations against known orbits (ISS, GEO, Moon); verify eccentricity of circular launch is ~0

## 5. Mission: Achieve Stable Orbit

- [ ] 5.1 Define success criteria: eccentricity < 0.1, perigee > Earth radius + atmosphere (R + 100km scaled), satellite completes at least one full orbit (angle swept >= 2\*pi)
- [ ] 5.2 Implement per-frame condition checking using the mission framework interface
- [ ] 5.3 Implement failure states: crash into Earth, escape trajectory, or timeout after N simulated minutes
- [ ] 5.4 Implement mission briefing UI text and success/failure messages with encouraging brand voice
- [ ] 5.5 Write unit tests: verify stable circular orbit triggers success; verify crash triggers failure; verify escape triggers failure

## 6. Mission: Hohmann Transfer

- [ ] 6.1 Define success criteria: start in stable orbit at altitude A, achieve stable orbit at altitude B (both within tolerance bands), detect transition through transfer ellipse
- [ ] 6.2 Implement two-burn detection: first burn raises apogee to target altitude, second burn circularizes at target
- [ ] 6.3 Implement per-frame altitude band checking and orbital element monitoring
- [ ] 6.4 Implement mission briefing with target orbit visualization and success/failure messages
- [ ] 6.5 Write unit tests: verify Hohmann transfer delta-v matches analytical solution; verify orbit altitude change detection

## 7. Mission: Escape Velocity

- [ ] 7.1 Define success criteria: specific orbital energy E > 0 sustained for N consecutive frames, satellite distance from Earth exceeding threshold
- [ ] 7.2 Implement escape detection distinguishing between temporary positive energy (high thrust moment) and sustained escape
- [ ] 7.3 Implement mission briefing explaining escape velocity concept and success/failure messages
- [ ] 7.4 Write unit tests: verify escape at v >= sqrt(2\*GM/r); verify sub-escape velocity returns to bound orbit

## 8. Sandbox Mode

- [ ] 8.1 Implement sandbox mode toggle that disables all mission condition checking and fail states
- [ ] 8.2 Unlock all parameters in sandbox: gravity strength multiplier, Earth mass multiplier, satellite mass, thrust magnitude, time warp up to max
- [ ] 8.3 Add reset button to re-launch without leaving sandbox
- [ ] 8.4 Write unit tests: verify no mission callbacks fire in sandbox mode; verify all parameters are adjustable

## 9. Telemetry Display

- [ ] 9.1 Implement telemetry computation module that calculates altitude, velocity magnitude, eccentricity, apogee, perigee, period, and specific orbital energy each frame
- [ ] 9.2 Implement telemetry overlay rendering on Canvas: monospace font (IBM Plex Mono), positioned top-right, values update in real-time
- [ ] 9.3 Implement value formatting: altitude in km, velocity in km/s, period in minutes/hours, energy in MJ/kg, eccentricity to 4 decimal places
- [ ] 9.4 Apply Physics accent color #00D4AA to telemetry labels and key values
- [ ] 9.5 Write unit tests: verify telemetry values match orbital mechanics module output; verify formatting rules

## 10. Reference Panel

- [ ] 10.1 Implement collapsible reference panel as a React component (`ReferencePanel.tsx`) overlaying the canvas
- [ ] 10.2 Write content for Kepler's First Law: "Orbits are ellipses with the central body at one focus" with diagram description
- [ ] 10.3 Write content for Kepler's Second Law: "Equal areas are swept in equal times" explaining why satellites speed up at perigee
- [ ] 10.4 Write content for Kepler's Third Law: T² proportional to a³, with the formula and what each variable means
- [ ] 10.5 Write content for vis-viva equation: v² = GM(2/r - 1/a) and how it connects velocity to orbital shape
- [ ] 10.6 Write content for escape velocity: v_esc = sqrt(2GM/r) and what it physically means
- [ ] 10.7 Style with brand fonts (Instrument Serif for headings, DM Sans for body, IBM Plex Mono for equations) and Physics accent #00D4AA
- [ ] 10.8 Implement contextual highlighting: current mission's relevant equation is highlighted in the panel

## 11. Visual Rendering

- [ ] 11.1 Implement Earth rendering: solid circle with radius-to-pixel scaling, atmosphere glow ring, rotation indication
- [ ] 11.2 Implement satellite rendering: small directional sprite or triangle indicating heading, thrust flame effect when engines active
- [ ] 11.3 Implement trajectory trail: fade-out line of previous N positions, colored with Physics accent #00D4AA
- [ ] 11.4 Implement orbital path prediction: dotted ellipse showing the current Keplerian orbit extrapolated from state vectors
- [ ] 11.5 Implement camera system: auto-follow satellite with zoom based on orbit size, manual zoom override via scroll/pinch
- [ ] 11.6 Implement background star field (static or slow parallax) for visual context
- [ ] 11.7 Implement target orbit visualization for Hohmann transfer mission (dashed circle at target altitude)
- [ ] 11.8 Ensure all rendering respects 60 FPS budget; profile and optimize draw calls
- [ ] 11.9 Write visual regression tests or snapshot tests for key rendering states (Earth only, satellite in orbit, crash)

## 12. Integration and Polish

- [ ] 12.1 Wire all subsystems together through `OrbitLabEpisode.ts` and verify full lifecycle: load, launch, orbit, mission complete
- [ ] 12.2 Implement responsive layout: canvas resizes to viewport, controls reflow for mobile, touch controls appear on touch devices
- [ ] 12.3 Implement keyboard accessibility: all controls reachable via Tab, launch via Enter/Space, parameter adjustment via arrow keys
- [ ] 12.4 Add episode metadata: title "Orbit Lab", domain "Physics", accent color #00D4AA, description text
- [ ] 12.5 Performance profiling: verify 60 FPS on mid-range device, <3s load on simulated 3G, <100ms input latency
- [ ] 12.6 Write Playwright E2E tests: load episode, launch satellite, achieve orbit mission success flow, navigate to sandbox
- [ ] 12.7 Write Playwright E2E test: verify telemetry updates during simulation, reference panel opens and closes
