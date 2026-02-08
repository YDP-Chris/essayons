## ADDED Requirements

### Requirement: Gravity Simulation

The system SHALL simulate Newtonian gravitational attraction between Earth and the satellite using the force law F = GMm/r², where G is the gravitational constant, M is Earth's mass, m is the satellite's mass, and r is the distance between their centers. The system SHALL integrate the equations of motion using the Velocity Verlet method to preserve energy conservation over long simulation durations. The system SHALL employ adaptive sub-stepping that increases the number of physics sub-steps per frame proportionally to the time warp factor, ensuring that no single sub-step advances the satellite by more than a configurable fraction of Earth's radius.

#### Scenario: Gravitational force calculation

- **WHEN** a satellite of mass m is positioned at distance r from Earth's center
- **THEN** the gravitational force magnitude SHALL equal GMm/r² directed toward Earth's center

#### Scenario: Velocity Verlet integration step

- **WHEN** the simulation advances by one timestep dt
- **THEN** the position SHALL be updated as x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)_dt², the force SHALL be recomputed at the new position, and the velocity SHALL be updated as v(t+dt) = v(t) + 0.5_(a(t) + a(t+dt))\*dt

#### Scenario: Energy conservation over extended simulation

- **WHEN** a satellite completes 100 orbits in a circular orbit without thrust
- **THEN** the total specific orbital energy SHALL not drift by more than 0.1% from its initial value

#### Scenario: Adaptive sub-stepping at high time warp

- **WHEN** the time warp factor is set to 1000x
- **THEN** the system SHALL subdivide each frame's physics update into N sub-steps where N = ceil(W \* dt_frame / dt_max), and dt_max SHALL be calibrated so that the satellite does not advance more than 10% of Earth's radius per sub-step

#### Scenario: Collision with Earth

- **WHEN** the satellite's distance from Earth's center becomes less than Earth's radius
- **THEN** the system SHALL detect a collision and transition the simulation to a crash state

### Requirement: Satellite Controls

The system SHALL provide launch controls allowing the user to set the launch angle (0-360 degrees) and initial velocity magnitude before launch. The system SHALL provide real-time thrust controls mapped to WASD keys: W for prograde thrust (along velocity direction), S for retrograde thrust (opposite to velocity), A for radial-in thrust (toward Earth), and D for radial-out thrust (away from Earth). On touch devices, the system SHALL display equivalent on-screen directional controls. All parameter adjustments SHALL take effect in real time without requiring simulation restart.

#### Scenario: Setting launch parameters

- **WHEN** the user adjusts the launch angle to 45 degrees and the initial velocity to 7.5 km/s
- **THEN** the satellite SHALL launch from the configured altitude above Earth's surface with a velocity vector at 45 degrees from the local horizontal at 7.5 km/s magnitude

#### Scenario: Prograde thrust via keyboard

- **WHEN** the user presses and holds the W key during simulation
- **THEN** a continuous acceleration SHALL be applied to the satellite in the direction of its current velocity vector (prograde) for the duration of the keypress

#### Scenario: Retrograde thrust via keyboard

- **WHEN** the user presses and holds the S key during simulation
- **THEN** a continuous acceleration SHALL be applied to the satellite opposite to its current velocity vector (retrograde) for the duration of the keypress

#### Scenario: Radial thrust via keyboard

- **WHEN** the user presses and holds the A key during simulation
- **THEN** a continuous acceleration SHALL be applied toward Earth's center (radial-in), and WHEN the user presses D, the acceleration SHALL be directed away from Earth's center (radial-out)

#### Scenario: Touch controls on mobile devices

- **WHEN** the simulation is loaded on a device with touch capability
- **THEN** on-screen directional thrust buttons SHALL be displayed in the bottom-left corner, and drag-to-aim and slider controls SHALL replace keyboard-based launch parameter input

#### Scenario: Real-time parameter adjustment

- **WHEN** the user adjusts a parameter slider while the simulation is running
- **THEN** the new parameter value SHALL take effect on the next physics step without requiring a simulation restart

### Requirement: Mission Achieve Orbit

The system SHALL provide a "Achieve Stable Orbit" mission that challenges the user to place the satellite into a stable orbit around Earth. The mission SHALL evaluate success per-frame by checking that the orbital eccentricity is below a threshold, the perigee is above the atmosphere, and the satellite has completed at least one full revolution. The mission SHALL detect failure when the satellite crashes into Earth or a configurable timeout elapses.

#### Scenario: Successful stable orbit

- **WHEN** the satellite's orbital eccentricity is less than 0.1 AND the perigee altitude is greater than the atmosphere height AND the satellite has swept an angle of at least 2\*pi radians around Earth
- **THEN** the mission SHALL transition to the SUCCESS state and display a congratulatory message

#### Scenario: Crash failure

- **WHEN** the satellite's distance from Earth's center falls below Earth's radius during the Achieve Orbit mission
- **THEN** the mission SHALL transition to the FAILED state and display an encouraging retry message

#### Scenario: Timeout failure

- **WHEN** the simulated elapsed time exceeds the mission's configured timeout without achieving a stable orbit
- **THEN** the mission SHALL transition to the FAILED state and suggest adjusting launch parameters

#### Scenario: Mission briefing

- **WHEN** the user selects the Achieve Orbit mission
- **THEN** the system SHALL display a briefing screen explaining the objective, the criteria for success, and basic guidance before the user launches

### Requirement: Mission Hohmann Transfer

The system SHALL provide a "Hohmann Transfer" mission that challenges the user to transfer the satellite from a stable orbit at altitude A to a stable orbit at altitude B. The mission SHALL detect a successful transfer by confirming the satellite achieves a stable orbit (eccentricity < threshold, one full revolution) within the target altitude band after starting from a stable orbit in the initial altitude band. The mission SHALL detect failure on crash, uncontrolled escape, or timeout.

#### Scenario: Successful Hohmann transfer

- **WHEN** the satellite starts in a stable orbit within altitude band A AND subsequently achieves a stable orbit within altitude band B (eccentricity < 0.1, perigee and apogee within target band tolerance, one full revolution completed at target)
- **THEN** the mission SHALL transition to the SUCCESS state

#### Scenario: Crash during transfer

- **WHEN** the satellite collides with Earth during the Hohmann Transfer mission
- **THEN** the mission SHALL transition to the FAILED state with an encouraging message about burn timing

#### Scenario: Escape during transfer

- **WHEN** the satellite achieves escape velocity (specific orbital energy > 0 sustained) during the Hohmann Transfer mission without reaching the target orbit
- **THEN** the mission SHALL transition to the FAILED state with a message suggesting less thrust

#### Scenario: Target orbit visualization

- **WHEN** the Hohmann Transfer mission is active
- **THEN** the system SHALL render the target orbit altitude as a dashed circle on the canvas so the user can see the destination

### Requirement: Mission Escape Velocity

The system SHALL provide an "Escape Velocity" mission that challenges the user to accelerate the satellite to escape Earth's gravitational influence. The mission SHALL detect success when the specific orbital energy E = v²/2 - GM/r is positive for a sustained number of consecutive frames and the satellite's distance from Earth exceeds a configurable threshold. The mission SHALL detect failure on crash or timeout.

#### Scenario: Successful escape

- **WHEN** the satellite's specific orbital energy is positive (E > 0) for at least N consecutive physics frames AND the satellite's distance from Earth's center exceeds the configured escape distance threshold
- **THEN** the mission SHALL transition to the SUCCESS state

#### Scenario: Insufficient velocity

- **WHEN** the satellite's specific orbital energy briefly becomes positive but then returns to negative (the satellite falls back into a bound orbit)
- **THEN** the mission SHALL remain in the ACTIVE state and NOT trigger success

#### Scenario: Crash during escape attempt

- **WHEN** the satellite collides with Earth during the Escape Velocity mission
- **THEN** the mission SHALL transition to the FAILED state with an encouraging message

#### Scenario: Mission briefing for escape

- **WHEN** the user selects the Escape Velocity mission
- **THEN** the system SHALL display a briefing explaining that escape velocity is v_esc = sqrt(2GM/r) and the user must exceed this threshold to break free of Earth's gravity

### Requirement: Sandbox Mode

The system SHALL provide a sandbox mode in which all simulation parameters are unlocked and adjustable, no mission objectives are active, and no failure states are triggered. The sandbox SHALL allow the user to freely experiment with launch angle, velocity, thrust, gravity strength multiplier, Earth mass multiplier, satellite mass, and maximum time warp without constraint. The sandbox SHALL provide a reset control to re-launch the satellite without leaving sandbox mode.

#### Scenario: Entering sandbox mode

- **WHEN** the user selects sandbox mode
- **THEN** all parameter constraints SHALL be removed, no mission condition checks SHALL execute, and the user SHALL have access to the full range of every adjustable parameter

#### Scenario: No failure in sandbox

- **WHEN** the satellite collides with Earth in sandbox mode
- **THEN** no failure state SHALL be triggered, no failure message SHALL be displayed, and the user SHALL be able to reset and re-launch immediately

#### Scenario: Additional parameters in sandbox

- **WHEN** sandbox mode is active
- **THEN** the parameter panel SHALL expose gravity strength multiplier, Earth mass multiplier, satellite mass, and thrust magnitude controls that are not available in mission mode

#### Scenario: Reset in sandbox

- **WHEN** the user activates the reset control in sandbox mode
- **THEN** the satellite SHALL return to its pre-launch state with current parameter values preserved, and the user SHALL be able to launch again immediately

### Requirement: Telemetry Display

The system SHALL render a real-time telemetry overlay on the simulation canvas displaying the satellite's current altitude, velocity magnitude, orbital eccentricity, apogee altitude, perigee altitude, orbital period, and specific orbital energy. Values SHALL update every frame. Altitude and apogee/perigee SHALL be displayed in kilometers as comma-separated integers. Velocity SHALL be displayed in km/s to 2 decimal places. Eccentricity SHALL be displayed to 4 decimal places. Period SHALL be displayed in minutes (switching to hours when exceeding 120 minutes). Energy SHALL be displayed in MJ/kg to 2 decimal places with sign. The telemetry SHALL use the IBM Plex Mono font and the Physics domain accent color #00D4AA for labels.

#### Scenario: Telemetry values during circular orbit

- **WHEN** the satellite is in a near-circular orbit at 400 km altitude
- **THEN** the telemetry SHALL display altitude approximately 400 km, velocity approximately 7.67 km/s, eccentricity approximately 0.0000, and period approximately 92 min, with all values updating in real time

#### Scenario: Telemetry during escape trajectory

- **WHEN** the satellite is on an escape trajectory (e > 1, E > 0)
- **THEN** the telemetry SHALL display eccentricity > 1, positive energy, and apogee/perigee/period SHALL display "N/A" or "---" since these are undefined for hyperbolic trajectories

#### Scenario: Telemetry font and color

- **WHEN** the telemetry overlay is rendered
- **THEN** labels SHALL be rendered in IBM Plex Mono at the configured size, label text SHALL use color #00D4AA, and value text SHALL use color #FFFFFF

#### Scenario: Telemetry update rate

- **WHEN** the simulation is running at any time warp speed
- **THEN** the displayed telemetry values SHALL update on every rendered frame (up to 60 times per second)

### Requirement: Reference Panel

The system SHALL provide a collapsible reference panel displaying Kepler's three laws of orbital motion, the vis-viva equation, and the escape velocity formula. Each entry SHALL include a plain-language explanation, the mathematical formula with variable definitions, and a note connecting the concept to observable telemetry values. The panel SHALL be implemented as an accessible DOM element (not canvas-rendered) supporting text selection, screen reader access, and responsive layout. The panel SHALL use Instrument Serif for headings, DM Sans for body text, and IBM Plex Mono for equations, with the Physics accent color #00D4AA for highlights.

#### Scenario: Viewing Kepler's First Law

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display Kepler's First Law: that orbits are ellipses with the central body at one focus, with the formula and an explanation of eccentricity connecting to the eccentricity telemetry value

#### Scenario: Viewing Kepler's Second Law

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display Kepler's Second Law: that a line from the central body to the satellite sweeps equal areas in equal times, explaining why the satellite moves faster at perigee and slower at apogee

#### Scenario: Viewing Kepler's Third Law

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display Kepler's Third Law: T² = (4*pi²/GM) * a³, with variable definitions and a note that this connects the orbital period and semi-major axis telemetry values

#### Scenario: Viewing the vis-viva equation

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display the vis-viva equation v² = GM(2/r - 1/a) with an explanation of how it relates velocity to position and orbit shape

#### Scenario: Viewing escape velocity

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display the escape velocity formula v_esc = sqrt(2GM/r) with an explanation of what escape velocity means physically

#### Scenario: Contextual highlighting during missions

- **WHEN** a mission is active
- **THEN** the reference panel SHALL visually highlight the equation most relevant to the current mission objective (e.g., vis-viva during Achieve Orbit, escape velocity during Escape Velocity mission)

#### Scenario: Accessibility of reference panel

- **WHEN** a screen reader user navigates to the reference panel
- **THEN** all text content SHALL be accessible, equations SHALL have appropriate alt text or aria labels, and the panel SHALL be navigable via keyboard

### Requirement: Visual Rendering

The system SHALL render the simulation on an HTML5 Canvas element displaying: Earth as a filled circle with an atmosphere glow effect, the satellite as a directional sprite or triangle indicating its heading with a thrust flame effect when engines are active, a trajectory trail showing the satellite's recent path with fading opacity, and an orbital path prediction showing the projected Keplerian orbit as a dotted ellipse. The system SHALL provide a camera that auto-follows the satellite with smooth interpolation and auto-adjusts zoom based on orbit size, with manual zoom override via scroll wheel or pinch gesture. The system SHALL render a background star field for visual context. The system SHALL maintain a rendering frame rate target of 60 FPS.

#### Scenario: Earth rendering

- **WHEN** the simulation canvas is drawn
- **THEN** Earth SHALL be rendered as a filled circle at the coordinate origin with a visually distinct atmosphere glow ring surrounding it

#### Scenario: Satellite rendering with thrust

- **WHEN** the satellite is under active thrust
- **THEN** the satellite SHALL be rendered as a directional indicator (triangle or sprite) pointing along its velocity vector, with a visible thrust flame effect emanating from the opposite direction of thrust

#### Scenario: Satellite rendering without thrust

- **WHEN** the satellite is coasting (no active thrust)
- **THEN** the satellite SHALL be rendered as a directional indicator pointing along its velocity vector without a thrust flame effect

#### Scenario: Trajectory trail rendering

- **WHEN** the satellite has been in motion for multiple frames
- **THEN** the system SHALL render a trail of the satellite's recent positions as a polyline with linearly decreasing opacity from fully opaque at the current position to fully transparent at the oldest stored position, using the Physics accent color #00D4AA

#### Scenario: Orbital path prediction

- **WHEN** the satellite is in a bound orbit (eccentricity < 1) and not under active thrust
- **THEN** the system SHALL render the predicted Keplerian orbit as a dotted ellipse computed from the current orbital elements

#### Scenario: Camera auto-follow

- **WHEN** the satellite moves to a new position
- **THEN** the camera SHALL smoothly interpolate toward the satellite's position each frame, and the zoom level SHALL auto-adjust to keep both the satellite and a meaningful portion of its orbit visible

#### Scenario: Manual zoom override

- **WHEN** the user scrolls the mouse wheel or pinches on a touch screen
- **THEN** the camera zoom level SHALL adjust accordingly, overriding the auto-zoom until the user releases or a reset action occurs

#### Scenario: Frame rate target

- **WHEN** the simulation is running on a mid-range device
- **THEN** the rendering loop SHALL maintain at least 60 FPS under normal conditions, and the system SHALL degrade visual fidelity (reduce trail length, simplify atmosphere glow) before dropping below 30 FPS
