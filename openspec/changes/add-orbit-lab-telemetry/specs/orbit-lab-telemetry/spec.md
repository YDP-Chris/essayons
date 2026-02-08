## ADDED Requirements

### Requirement: Orbital Metrics Computation

The system SHALL compute the following orbital metrics each physics frame and store them on the simulation state: orbital eccentricity (from state vectors), semi-major axis (from specific orbital energy), apogee altitude (from semi-major axis and eccentricity), perigee altitude (from semi-major axis and eccentricity), specific orbital energy (E = v²/2 - GM/r), and current gravitational acceleration magnitude. For unbound orbits (specific energy ≥ 0), apogee, perigee, semi-major axis, and orbital period SHALL be marked as undefined.

#### Scenario: Circular orbit metrics

- **WHEN** the satellite is in a near-circular orbit at 400 km altitude
- **THEN** the eccentricity SHALL be approximately 0 (< 0.01), the apogee and perigee altitudes SHALL both be approximately 400 km, and the specific orbital energy SHALL be negative

#### Scenario: Elliptical orbit metrics

- **WHEN** the satellite is in an elliptical orbit with perigee at 200 km and apogee at 800 km
- **THEN** the eccentricity SHALL be between 0 and 1, apogee altitude SHALL be approximately 800 km, perigee altitude SHALL be approximately 200 km, and the semi-major axis SHALL equal (r_apogee + r_perigee) / 2

#### Scenario: Escape trajectory metrics

- **WHEN** the satellite is on an escape trajectory (specific energy > 0)
- **THEN** the eccentricity SHALL be ≥ 1, and apogee, perigee, semi-major axis, and orbital period SHALL be undefined

#### Scenario: Acceleration computation

- **WHEN** the satellite is at distance r from the planet center
- **THEN** the stored acceleration magnitude SHALL equal GM/r²

### Requirement: Enhanced Telemetry Display

The system SHALL display expanded orbital telemetry in the HUD overlay when the `show-metrics` parameter is enabled. The expanded telemetry SHALL include: eccentricity (4 decimal places), apogee altitude (km, 1 decimal place), perigee altitude (km, 1 decimal place), specific orbital energy (MJ/kg, 2 decimal places with sign), and acceleration (m/s², 2 decimal places). For unbound orbits, apogee, perigee, period, and eccentricity SHALL display "---". The basic telemetry (altitude, velocity, orbits, time, period, status) SHALL always be visible regardless of the toggle.

#### Scenario: Expanded HUD during bound orbit

- **WHEN** the satellite is in a bound elliptical orbit and `show-metrics` is true
- **THEN** the HUD SHALL display eccentricity, apogee altitude, perigee altitude, specific orbital energy, and acceleration in addition to the basic telemetry

#### Scenario: Expanded HUD during escape

- **WHEN** the satellite is on an escape trajectory and `show-metrics` is true
- **THEN** the HUD SHALL display "---" for eccentricity, apogee, perigee, and period, and SHALL display the positive specific orbital energy value

#### Scenario: Metrics toggle off

- **WHEN** `show-metrics` is set to false
- **THEN** only the basic telemetry (altitude, velocity, orbits, time, period, status) SHALL be displayed

### Requirement: Speed-Coded Trail Visualization

The system SHALL color-code the orbit trail by velocity magnitude. Trail segments at the satellite's minimum speed within the visible trail SHALL be rendered in blue (#3b82f6) and segments at maximum speed SHALL be rendered in red (#ef4444), with intermediate speeds interpolated linearly between blue and red. Each trail point SHALL store the satellite's speed at that position. The existing trail fade (opacity by recency) SHALL be preserved and combined with the speed-based color.

#### Scenario: Elliptical orbit trail coloring

- **WHEN** the satellite is in an elliptical orbit with the trail visible
- **THEN** the trail near perigee (fastest point) SHALL appear red/warm and the trail near apogee (slowest point) SHALL appear blue/cool, with smooth color transitions between them

#### Scenario: Circular orbit trail coloring

- **WHEN** the satellite is in a near-circular orbit (eccentricity < 0.01)
- **THEN** the trail SHALL appear in a uniform color (minimal speed variation produces minimal color variation)

#### Scenario: Trail point speed storage

- **WHEN** a new trail point is recorded during simulation
- **THEN** the trail point SHALL include the satellite's speed magnitude at that position

### Requirement: Apogee and Perigee Markers

The system SHALL render visual markers at the apogee and perigee points of the orbit trail. The apogee marker SHALL be labeled "AP" and the perigee marker SHALL be labeled "PE". Markers SHALL use the Physics domain accent color (#00D4AA). Markers SHALL only be rendered when the satellite has swept at least half an orbit (total angle ≥ π radians), ensuring sufficient trail data for meaningful extremes.

#### Scenario: Markers on elliptical orbit

- **WHEN** the satellite has completed at least half an orbit in an elliptical trajectory
- **THEN** a marker labeled "AP" SHALL be rendered at the trail point farthest from the planet center, and a marker labeled "PE" SHALL be rendered at the trail point closest to the planet center

#### Scenario: Markers hidden for insufficient data

- **WHEN** the satellite has swept less than half an orbit (total angle < π)
- **THEN** no apogee or perigee markers SHALL be rendered

#### Scenario: Marker styling

- **WHEN** apogee and perigee markers are rendered
- **THEN** each marker SHALL be a small diamond shape with a text label, using the Physics accent color #00D4AA, and SHALL not obscure the satellite or trail
