## ADDED Requirements

### Requirement: Truss Network Representation

The system SHALL represent bridge structures as a network of nodes (points in 2D space) and beams (straight members connecting two nodes). Nodes SHALL have position coordinates (x, y in meters) and MAY have applied external forces (loads). Beams SHALL have material properties (material type, cross-sectional area) and SHALL carry axial forces (tension or compression). Support nodes SHALL be fixed boundary conditions providing reaction forces.

#### Scenario: Node placement in world coordinates

- **WHEN** a node is placed at grid position (5, 3) on a 1-meter grid
- **THEN** the node's world coordinates SHALL be (5.0, 3.0) meters
- **AND** the node SHALL be available for beam connections

#### Scenario: Beam connection between two nodes

- **WHEN** a beam is created connecting node A at (0, 0) and node B at (10, 0)
- **THEN** the beam SHALL have length 10 meters
- **AND** the beam SHALL be capable of carrying axial force between the two nodes

#### Scenario: Support node with fixed boundary condition

- **WHEN** a node at (0, 0) is designated as a support anchor
- **THEN** the node SHALL provide reaction forces in x and y directions to maintain static equilibrium
- **AND** the node SHALL not move under applied loads

### Requirement: Static Equilibrium Force Solver

The system SHALL solve for internal beam forces using static equilibrium equations: sum of forces in x-direction equals zero, sum of forces in y-direction equals zero, and sum of moments about any point equals zero. The system SHALL use the Method of Joints for structures with fewer than 50 beams and MAY use matrix stiffness method for larger or statically indeterminate structures. The system SHALL detect under-constrained structures (insufficient supports) and warn the user before load application.

#### Scenario: Force balance at a node

- **WHEN** a node has three beams attached and an external load of 1000N downward is applied
- **THEN** the system SHALL solve for the three unknown beam forces such that sum of forces in x equals zero and sum of forces in y equals zero
- **AND** the solution SHALL satisfy equilibrium within numerical tolerance (0.01%)

#### Scenario: Simple beam under point load

- **WHEN** a horizontal beam of length 10m is supported at both ends and a 1000kg point load is applied at the midpoint
- **THEN** each support SHALL provide a reaction force of 500kg \* 9.81 m/s² = 4905N upward
- **AND** the beam SHALL experience compression from the load point to each support

#### Scenario: Under-constrained structure warning

- **WHEN** a structure has only one support node or no support nodes
- **THEN** the system SHALL detect that the structure is under-constrained
- **AND** SHALL warn the user that the structure cannot achieve static equilibrium before allowing load application

#### Scenario: Solver convergence for complex truss

- **WHEN** a Warren truss with 20 beams and 12 nodes is loaded with a 2000kg point load
- **THEN** the force solver SHALL converge to a solution within 10ms on a mid-range device
- **AND** the internal forces SHALL satisfy equilibrium at every node

### Requirement: Stress and Strain Calculation

The system SHALL calculate stress for each beam as the absolute axial force divided by the beam's cross-sectional area. The system SHALL calculate strain as stress divided by the material's Young's modulus. Stress SHALL be reported in Pascals (Pa) or Megapascals (MPa). The system SHALL distinguish between tensile stress (positive force, pulling apart) and compressive stress (negative force, pushing together).

#### Scenario: Stress calculation for loaded beam

- **WHEN** a beam carries an axial force of 10,000N and has a cross-sectional area of 0.001 m²
- **THEN** the stress SHALL be calculated as 10,000N / 0.001 m² = 10,000,000 Pa = 10 MPa

#### Scenario: Strain calculation using Hooke's Law

- **WHEN** a steel beam (Young's modulus 200 GPa) experiences a stress of 100 MPa
- **THEN** the strain SHALL be calculated as 100 MPa / 200,000 MPa = 0.0005 (0.05%)

#### Scenario: Tensile vs compressive stress identification

- **WHEN** a beam has an axial force of +5000N (tension, pulling nodes apart)
- **THEN** the system SHALL report the stress as tensile with magnitude 5000N / area
- **AND** WHEN a beam has an axial force of -5000N (compression, pushing nodes together)
- **THEN** the system SHALL report the stress as compressive with magnitude 5000N / area

### Requirement: Material Properties System

The system SHALL support three material types: wood, steel, and concrete. Each material SHALL have defined properties: tensile strength, compressive strength, density, and Young's modulus. The system SHALL allow per-beam material assignment during construction. The system SHALL use material properties to determine failure thresholds and structural weight.

#### Scenario: Wood material properties

- **WHEN** a beam is assigned the wood material type
- **THEN** the beam SHALL have tensile strength of 10 MPa, density of 500 kg/m³, and Young's modulus of 10 GPa

#### Scenario: Steel material properties

- **WHEN** a beam is assigned the steel material type
- **THEN** the beam SHALL have tensile strength of 400 MPa, density of 7850 kg/m³, and Young's modulus of 200 GPa

#### Scenario: Concrete material properties

- **WHEN** a beam is assigned the concrete material type
- **THEN** the beam SHALL have tensile strength of 5 MPa, compressive strength of 30 MPa, density of 2400 kg/m³, and Young's modulus of 30 GPa

#### Scenario: Material weight calculation

- **WHEN** a steel beam of length 5m and cross-sectional area 0.001 m² is constructed
- **THEN** the beam's weight SHALL be calculated as 5m _ 0.001 m² _ 7850 kg/m³ = 39.25 kg

### Requirement: Beam Failure Detection

The system SHALL detect beam failure when the absolute stress exceeds the material's strength threshold. For tensile stress, the system SHALL compare against tensile strength; for compressive stress, the system SHALL compare against compressive strength (or tensile strength if compressive strength is not separately defined). When a beam fails, the system SHALL immediately remove the beam from the structure and SHALL re-solve the force distribution through the remaining structure.

#### Scenario: Beam failure under excessive tension

- **WHEN** a wood beam (tensile strength 10 MPa) experiences a tensile stress of 12 MPa
- **THEN** the system SHALL detect failure
- **AND** SHALL remove the beam from the structure
- **AND** SHALL mark the beam as broken

#### Scenario: Force redistribution after beam failure

- **WHEN** a beam in a truss fails and is removed
- **THEN** the system SHALL immediately re-solve the static equilibrium equations for the remaining structure
- **AND** forces SHALL redistribute to adjacent beams
- **AND** IF adjacent beams now exceed their strength, they SHALL also fail (cascading failure)

#### Scenario: Compressive failure for concrete beam

- **WHEN** a concrete beam (compressive strength 30 MPa) experiences a compressive stress of 35 MPa
- **THEN** the system SHALL detect compressive failure
- **AND** SHALL remove the beam from the structure

#### Scenario: Structure survives under safe stress

- **WHEN** all beams in a structure experience stress below 90% of their respective material strengths
- **THEN** no beams SHALL fail
- **AND** the structure SHALL remain stable

### Requirement: Stress Color Visualization

The system SHALL render each beam with a color indicating its current stress level as a percentage of material strength. The color mapping SHALL be: green for 0-50% of strength (safe), yellow for 50-90% of strength (strained), red for 90-100% of strength (critical), and black or gray for broken beams. The system SHALL interpolate colors smoothly between thresholds. Beam thickness on screen SHALL be proportional to cross-sectional area.

#### Scenario: Green color for safe stress

- **WHEN** a beam's stress is 30% of its material strength
- **THEN** the beam SHALL be rendered in green

#### Scenario: Yellow color for strained beam

- **WHEN** a beam's stress is 70% of its material strength
- **THEN** the beam SHALL be rendered in yellow

#### Scenario: Red color for critical stress

- **WHEN** a beam's stress is 95% of its material strength
- **THEN** the beam SHALL be rendered in red

#### Scenario: Black color for broken beam

- **WHEN** a beam has failed and been removed from the structure
- **THEN** the beam SHALL be rendered in black or gray (visually indicating failure)
- **AND** the beam SHALL no longer carry any force

#### Scenario: Smooth color interpolation

- **WHEN** a beam's stress increases from 40% to 60% of strength
- **THEN** the beam's color SHALL smoothly transition from green to yellow without abrupt jumps

#### Scenario: Thickness proportional to cross-section

- **WHEN** beam A has cross-sectional area 0.001 m² and beam B has cross-sectional area 0.002 m²
- **THEN** beam B SHALL be rendered twice as thick as beam A on the canvas

### Requirement: Grid-Based Node Placement

The system SHALL provide a grid-based construction interface with configurable grid spacing (default 1 meter). Nodes SHALL snap to grid intersections when placed. The system SHALL prevent placement of nodes on top of existing nodes. The system SHALL provide visual feedback (highlighting, snapping indicators) during node placement.

#### Scenario: Node snaps to grid intersection

- **WHEN** the user clicks at screen position near world coordinates (4.7, 3.2) on a 1-meter grid
- **THEN** the node SHALL be placed at the nearest grid intersection (5.0, 3.0)

#### Scenario: Prevent overlapping nodes

- **WHEN** a node already exists at grid position (5, 3)
- **AND** the user attempts to place a new node at (5, 3)
- **THEN** the system SHALL reject the placement
- **AND** SHALL display a message indicating the position is occupied

#### Scenario: Grid spacing configuration

- **WHEN** the grid spacing is set to 0.5 meters
- **THEN** nodes SHALL snap to positions (0, 0), (0.5, 0), (1.0, 0), etc.
- **AND** the visual grid SHALL display lines every 0.5 meters

### Requirement: Beam Creation and Deletion

The system SHALL allow users to create beams by dragging from one node to another. Beams SHALL only be created between existing nodes. The system SHALL allow users to delete beams by selecting them and pressing delete or clicking a delete button. The system SHALL allow users to delete nodes, which SHALL also delete all connected beams. The system SHALL provide undo/redo functionality for construction actions.

#### Scenario: Beam creation by drag

- **WHEN** the user clicks on node A at (0, 0) and drags to node B at (10, 0)
- **THEN** a beam SHALL be created connecting node A and node B
- **AND** the beam SHALL be displayed on the canvas

#### Scenario: Prevent beam to non-existent node

- **WHEN** the user drags from node A to an empty grid position with no node
- **THEN** no beam SHALL be created
- **AND** the system SHALL display feedback indicating a valid end node is required

#### Scenario: Beam deletion

- **WHEN** the user selects a beam and presses the Delete key
- **THEN** the beam SHALL be removed from the structure
- **AND** forces SHALL be recalculated for the remaining structure

#### Scenario: Node deletion cascades to beams

- **WHEN** the user deletes a node that has three beams connected to it
- **THEN** the node SHALL be removed
- **AND** all three connected beams SHALL also be removed

#### Scenario: Undo construction action

- **WHEN** the user creates a beam and then clicks the Undo button
- **THEN** the beam SHALL be removed from the structure
- **AND** the structure SHALL return to the state before the beam was added

### Requirement: Support Anchor Placement

The system SHALL allow users to designate nodes as support anchors (fixed boundary conditions). Support nodes SHALL provide reaction forces to maintain static equilibrium. The system SHALL require at least two support nodes for a structurally stable bridge. The system SHALL visually distinguish support nodes from regular nodes (e.g., triangle icon at ground level).

#### Scenario: Designate node as support

- **WHEN** the user clicks a node at ground level (y = 0) and selects "Make Support"
- **THEN** the node SHALL be designated as a support anchor
- **AND** SHALL provide reaction forces during force solving
- **AND** SHALL be rendered with a triangle or pin icon

#### Scenario: Minimum two supports required

- **WHEN** a structure has only one support node
- **THEN** the system SHALL warn that the structure is under-constrained
- **AND** SHALL prevent load application until a second support is added

#### Scenario: Remove support designation

- **WHEN** the user clicks a support node and selects "Remove Support"
- **THEN** the node SHALL become a regular node (no longer providing reaction forces)
- **AND** IF the total number of supports drops below two, the system SHALL warn about instability

### Requirement: Load Application System

The system SHALL allow users to apply external loads to the structure. The system SHALL support point loads (specified force magnitude and direction applied at a single node) and gravity (uniform downward force at all nodes proportional to node mass). The system SHALL provide a UI to configure load magnitude, position, and direction. Loads SHALL take effect immediately and SHALL trigger force recalculation.

#### Scenario: Point load at midpoint

- **WHEN** the user applies a 1000kg point load at node (5, 0)
- **THEN** the system SHALL apply a downward force of 1000kg \* 9.81 m/s² = 9810N at that node
- **AND** SHALL re-solve the force distribution through the structure

#### Scenario: Gravity applied to all nodes

- **WHEN** gravity is enabled with multiplier 1.0
- **THEN** each node SHALL experience a downward force equal to the sum of masses of all beams connected to it, multiplied by 9.81 m/s²

#### Scenario: Load position adjustment in real time

- **WHEN** the user drags a point load from node A to node B while the simulation is running
- **THEN** the load SHALL be removed from node A and applied to node B
- **AND** forces SHALL recalculate immediately
- **AND** stress colors SHALL update within one frame

#### Scenario: Load magnitude adjustment

- **WHEN** the user changes a point load magnitude from 1000kg to 2000kg via slider
- **THEN** the applied force SHALL double
- **AND** beam stresses SHALL increase proportionally

### Requirement: Oscillating Force for Earthquake Simulation

The system SHALL support time-varying oscillating forces simulating seismic motion. The oscillating force SHALL be a sinusoidal horizontal force applied to all nodes with configurable amplitude and frequency. The force SHALL be calculated as F_x(t) = A _ sin(2π _ f \* t), where A is amplitude, f is frequency, and t is simulation time. The system SHALL apply this force continuously during the Earthquake mission.

#### Scenario: Sinusoidal horizontal force application

- **WHEN** an oscillating force with amplitude 500N and frequency 2 Hz is active
- **THEN** at simulation time t = 0, the force SHALL be 0N
- **AND** at t = 0.25 seconds (quarter period), the force SHALL be 500N to the right
- **AND** at t = 0.5 seconds (half period), the force SHALL be 0N
- **AND** at t = 0.75 seconds, the force SHALL be 500N to the left

#### Scenario: Oscillating force applied to all nodes

- **WHEN** the oscillating earthquake force is active
- **THEN** every node SHALL experience the sinusoidal horizontal force
- **AND** forces SHALL be recalculated every physics frame based on current time t

#### Scenario: Frequency and amplitude configuration

- **WHEN** the user sets earthquake frequency to 3 Hz and amplitude to 1000N
- **THEN** the oscillating force SHALL complete 3 cycles per simulation second
- **AND** the peak force SHALL be 1000N

### Requirement: Real-Time Telemetry Display

The system SHALL compute and display real-time metrics for the structure: total structure weight, load-bearing capacity estimate, maximum beam stress, factor of safety, maximum node displacement, and estimated fundamental resonance frequency. Metrics SHALL update every frame or at a throttled rate (30 FPS minimum). Metrics SHALL be formatted with appropriate units and precision.

#### Scenario: Total structure weight calculation

- **WHEN** a structure consists of 10 steel beams each 5m long with cross-sectional area 0.001 m²
- **THEN** the total structure weight SHALL be 10 _ 5m _ 0.001 m² \* 7850 kg/m³ = 392.5 kg

#### Scenario: Maximum beam stress readout

- **WHEN** the structure is under load and beam stresses are 2 MPa, 5 MPa, and 8 MPa
- **THEN** the maximum beam stress SHALL be displayed as 8 MPa

#### Scenario: Factor of safety calculation

- **WHEN** the maximum beam stress is 10 MPa and the material strength is 100 MPa
- **THEN** the factor of safety SHALL be displayed as 10.0 (strength / stress)

#### Scenario: Telemetry updates per frame

- **WHEN** the simulation is running at 60 FPS
- **THEN** telemetry metrics SHALL update at least 30 times per second (throttled if needed for performance)

#### Scenario: Load-bearing capacity estimate

- **WHEN** the weakest beam in the structure can withstand an additional 2000N before failure
- **THEN** the load-bearing capacity SHALL be estimated as the current load plus 2000N

### Requirement: Mission First Crossing

The system SHALL provide a "First Crossing" mission that challenges the user to build a bridge spanning a 10-meter gap that supports a 1000kg point load at the midpoint for 5 simulation seconds without any beam failures. The mission SHALL start with empty space between two support points at ground level separated by 10 meters. Success SHALL be detected when the load is applied, 5 simulation seconds elapse, and no beams have failed. Failure SHALL be detected when any beam breaks.

#### Scenario: Successful First Crossing completion

- **WHEN** the user builds a bridge spanning the 10m gap
- **AND** applies a 1000kg point load at the midpoint
- **AND** 5 simulation seconds pass without any beam failing
- **THEN** the mission SHALL transition to the SUCCESS state
- **AND** SHALL display a congratulatory message

#### Scenario: Bridge collapse during First Crossing

- **WHEN** the user applies the 1000kg load and a beam fails within 5 seconds
- **THEN** the mission SHALL transition to the FAILED state
- **AND** SHALL display an encouraging message suggesting reinforcement

#### Scenario: Mission briefing for First Crossing

- **WHEN** the user selects the First Crossing mission
- **THEN** the system SHALL display a briefing explaining the objective: span 10m, support 1000kg, no failures for 5 seconds

### Requirement: Mission Efficiency Challenge

The system SHALL provide an "Efficiency Challenge" mission that requires the user to build a bridge spanning a 10-meter gap that supports a 1000kg point load while keeping the total structure weight below 500kg. Success SHALL be detected when the load is supported for 5 simulation seconds without failures AND the total material weight is less than or equal to the budget. Failure SHALL be detected when beams fail OR the weight budget is exceeded.

#### Scenario: Successful Efficiency Challenge completion

- **WHEN** the user builds a bridge with total weight 450kg
- **AND** applies a 1000kg point load at the midpoint
- **AND** 5 simulation seconds pass without any beam failing
- **THEN** the mission SHALL transition to the SUCCESS state

#### Scenario: Weight budget exceeded

- **WHEN** the user builds a bridge with total weight 550kg (over 500kg budget)
- **THEN** the mission SHALL display a warning that the weight budget is exceeded
- **AND** SHALL not allow the load to be applied (or SHALL transition to FAILED if load is forced)

#### Scenario: Bridge fails under load despite weight budget

- **WHEN** the user builds a 400kg bridge (under budget) but a beam fails under the 1000kg load
- **THEN** the mission SHALL transition to the FAILED state
- **AND** SHALL suggest using stronger materials or better truss configuration

#### Scenario: Material weight tracking display

- **WHEN** the Efficiency Challenge mission is active
- **THEN** the UI SHALL display current structure weight and the 500kg budget
- **AND** SHALL color-code the weight (green if under budget, red if over)

### Requirement: Mission The Arch

The system SHALL provide "The Arch" mission that challenges the user to build a bridge where all beams are under compression (not tension) while supporting a 1500kg point load. Success SHALL be detected when the load is applied for 5 simulation seconds, no beams fail, AND all beams carry compressive (negative) axial forces. Failure SHALL be detected when any beam fails OR any beam is under tension.

#### Scenario: Successful arch construction

- **WHEN** the user builds an arch-shaped structure
- **AND** applies a 1500kg point load at the crown (top center)
- **AND** all beams experience compressive forces only (negative force values)
- **AND** 5 simulation seconds pass without failure
- **THEN** the mission SHALL transition to the SUCCESS state

#### Scenario: Arch with tensile beam fails mission

- **WHEN** the user builds a structure where one beam is under tension (positive force)
- **THEN** the mission SHALL remain in ACTIVE state and NOT transition to SUCCESS
- **AND** SHALL provide feedback indicating which beams are under tension

#### Scenario: Arch collapse under load

- **WHEN** the user builds an arch but the load causes a beam to fail
- **THEN** the mission SHALL transition to the FAILED state
- **AND** SHALL suggest thicker beams or different material

#### Scenario: Mission briefing for The Arch

- **WHEN** the user selects The Arch mission
- **THEN** the system SHALL display a briefing explaining that arches carry loads through compression and are historically efficient structures

### Requirement: Mission Earthquake

The system SHALL provide an "Earthquake" mission that challenges the user to build a bridge that survives an oscillating horizontal force for 20 simulation seconds. The oscillating force SHALL have configurable frequency (default 2 Hz) and amplitude (default 500N per node). Success SHALL be detected when 20 simulation seconds elapse without any beam failures. Failure SHALL be detected when any beam breaks. The system SHALL optionally detect resonance (when forcing frequency is within 10% of the structure's natural frequency) and warn the user.

#### Scenario: Successful earthquake survival

- **WHEN** the user builds a stable bridge
- **AND** an oscillating horizontal force (2 Hz, 500N amplitude) is applied to all nodes
- **AND** 20 simulation seconds pass without any beam failing
- **THEN** the mission SHALL transition to the SUCCESS state

#### Scenario: Structure fails under earthquake

- **WHEN** the oscillating force causes beam stresses to exceed material strength within 20 seconds
- **THEN** the mission SHALL transition to the FAILED state
- **AND** SHALL display a message encouraging damping or frequency tuning

#### Scenario: Resonance warning

- **WHEN** the structure's estimated natural frequency is 2.1 Hz
- **AND** the earthquake forcing frequency is set to 2.0 Hz (within 10%)
- **THEN** the system SHALL display a warning that resonance may amplify displacement
- **AND** SHALL suggest adjusting the structure or frequency

#### Scenario: Mission briefing for Earthquake

- **WHEN** the user selects the Earthquake mission
- **THEN** the system SHALL display a briefing explaining dynamic loads, resonance, and the Tacoma Narrows Bridge failure as historical context

### Requirement: Sandbox Mode

The system SHALL provide a sandbox mode in which all construction constraints are removed, no mission objectives are active, and all physics parameters are adjustable. Users SHALL be able to adjust gravity multiplier, material strength multipliers, oscillating force parameters, and time warp without restriction. The sandbox SHALL allow unlimited material use (no weight budget). The sandbox SHALL provide a reset button to clear the structure and start fresh.

#### Scenario: Entering sandbox mode

- **WHEN** the user selects sandbox mode
- **THEN** all mission constraints SHALL be removed
- **AND** the user SHALL have access to all material types and unlimited quantity
- **AND** no failure messages SHALL be displayed

#### Scenario: Physics parameter adjustment in sandbox

- **WHEN** the user adjusts the gravity multiplier to 0.5 in sandbox mode
- **THEN** all gravity forces SHALL be halved
- **AND** the structure SHALL experience lower stress

#### Scenario: Material strength multiplier in sandbox

- **WHEN** the user sets a material strength multiplier to 10x in sandbox mode
- **THEN** all beams SHALL have 10x their normal failure threshold
- **AND** structures that previously failed SHALL survive

#### Scenario: Sandbox reset

- **WHEN** the user clicks the Reset button in sandbox mode
- **THEN** the entire structure SHALL be cleared (all nodes and beams removed)
- **AND** support anchors SHALL remain at default positions
- **AND** the user SHALL be able to start building fresh

### Requirement: Reference Panel Content

The system SHALL provide a reference panel displaying educational content about structural engineering concepts. The panel SHALL include sections on: Tension vs. Compression (definitions, diagrams, examples), Truss Types (Warren, Pratt, Howe trusses with labeled diagrams), Moment of Inertia (why beam thickness resists bending), Stress and Strain (Hooke's law, yield point, failure), and Famous Bridge Failures (Tacoma Narrows resonance collapse, Quebec Bridge compression failure with lessons learned).

#### Scenario: Display tension vs compression explanation

- **WHEN** the user opens the reference panel and selects "Tension vs. Compression"
- **THEN** the panel SHALL display definitions: tension is pulling force (elongates member), compression is pushing force (shortens member)
- **AND** SHALL show diagrams with arrows indicating force direction

#### Scenario: Display truss type diagrams

- **WHEN** the user selects "Truss Types" in the reference panel
- **THEN** the panel SHALL display labeled diagrams of Warren, Pratt, and Howe trusses
- **AND** SHALL explain the load distribution characteristics of each type

#### Scenario: Display Tacoma Narrows failure case

- **WHEN** the user selects "Famous Bridge Failures" in the reference panel
- **THEN** the panel SHALL display an account of the 1940 Tacoma Narrows Bridge collapse
- **AND** SHALL explain that wind-induced oscillations matched the bridge's natural frequency, causing resonant amplification and failure
- **AND** SHALL relate the concept to the Earthquake mission

#### Scenario: Reference panel styling with accent color

- **WHEN** the reference panel is displayed
- **THEN** section headers and highlights SHALL use the Engineering domain accent color #ff6b35

### Requirement: Canvas Rendering for Bridge Structures

The system SHALL render the bridge structure on an HTML5 Canvas using the simulation engine's layered rendering system. The background layer SHALL display the grid, ground surface, and gap area. The simulation layer SHALL display nodes (circles), beams (lines with color and thickness), and support anchors (triangle icons). The overlay layer SHALL display applied loads (arrows), telemetry labels, and force vectors (optional toggle). The system SHALL support viewport pan and zoom for large bridges.

#### Scenario: Background layer rendering

- **WHEN** the canvas is rendered
- **THEN** the background layer SHALL display a grid with lines every 1 meter
- **AND** SHALL display the ground surface at y = 0 as a solid brown/gray line
- **AND** SHALL highlight the gap area requiring the bridge

#### Scenario: Node rendering

- **WHEN** nodes are present in the structure
- **THEN** each node SHALL be rendered as a circle with radius proportional to screen zoom level
- **AND** support nodes SHALL be rendered with a triangle or pin icon beneath them

#### Scenario: Beam rendering with stress color

- **WHEN** a beam is under 60% stress (strained, yellow range)
- **THEN** the beam SHALL be rendered as a line connecting its two nodes
- **AND** SHALL be colored yellow
- **AND** SHALL have thickness proportional to its cross-sectional area

#### Scenario: Load visualization

- **WHEN** a 1000kg point load is applied at node (5, 0)
- **THEN** a downward arrow SHALL be rendered at node (5, 0)
- **AND** the arrow SHALL be labeled with "1000 kg" or "9810 N"

#### Scenario: Viewport pan and zoom

- **WHEN** the user scrolls or pinches to zoom
- **THEN** the viewport zoom level SHALL adjust
- **AND** all rendered elements SHALL scale proportionally
- **AND** the coordinate transform SHALL convert world coordinates to screen coordinates correctly

### Requirement: Touch Controls for Mobile Devices

The system SHALL provide touch controls for mobile devices. Touch interactions SHALL include: tap to place node, drag from node to node to create beam, long-press to delete node or beam, two-finger pinch to zoom viewport, and two-finger drag to pan viewport. The system SHALL display on-screen UI elements for material selection and tool palette.

#### Scenario: Tap to place node on touch device

- **WHEN** the user taps the canvas at a grid position on a touch device
- **THEN** a node SHALL be placed at the nearest grid intersection

#### Scenario: Drag to create beam on touch device

- **WHEN** the user taps and holds on node A, then drags to node B, and releases
- **THEN** a beam SHALL be created connecting node A and node B

#### Scenario: Long-press to delete on touch device

- **WHEN** the user long-presses a beam for 0.5 seconds
- **THEN** the beam SHALL be selected and a delete confirmation SHALL appear
- **AND** when confirmed, the beam SHALL be deleted

#### Scenario: Pinch-to-zoom on touch device

- **WHEN** the user performs a two-finger pinch gesture on the canvas
- **THEN** the viewport zoom level SHALL adjust proportionally to the pinch distance change

#### Scenario: Two-finger drag to pan

- **WHEN** the user drags with two fingers on the canvas
- **THEN** the viewport SHALL pan in the direction of the drag
- **AND** the visible world-space area SHALL shift

### Requirement: Episode Integration with Simulation Engine

The system SHALL implement the `EpisodeDefinition` interface to integrate Bridge Lab with the simulation engine. The episode SHALL register parameters (material type, load weight, load position, gravity multiplier, beam thickness multiplier, time warp), missions (First Crossing, Efficiency Challenge, The Arch, Earthquake), and render layers (background, simulation, overlay). The episode's `update` function SHALL call the structural physics solver each frame and detect beam failures. The episode's `render` function SHALL delegate to BridgeRenderer.

#### Scenario: Episode initialization

- **WHEN** Bridge Lab is loaded and the engine calls the episode's `init()` method
- **THEN** the episode SHALL register all parameters with the parameter system
- **AND** SHALL register all missions with the mission framework
- **AND** SHALL register render layers (background, simulation, overlay) with the canvas renderer

#### Scenario: Physics update per frame

- **WHEN** the simulation engine calls the episode's `update(state, params, dt)` method
- **THEN** the episode SHALL apply external forces (gravity, point loads, oscillating forces)
- **AND** SHALL call the static equilibrium force solver to compute beam forces
- **AND** SHALL calculate stress for each beam
- **AND** SHALL detect and remove any failed beams
- **AND** SHALL return the updated physics state

#### Scenario: Rendering delegation

- **WHEN** the simulation engine calls the episode's `render(ctx, state, params)` method
- **THEN** the episode SHALL delegate to BridgeRenderer to draw the structure on the canvas

#### Scenario: Episode cleanup

- **WHEN** the engine is destroyed or a different episode is loaded
- **THEN** the episode's `cleanup()` method SHALL be called
- **AND** SHALL remove all registered render layers
- **AND** SHALL remove all input bindings
- **AND** SHALL release all resources

### Requirement: Performance Optimization for Large Structures

The system SHALL optimize the force solver for structures with up to 100 beams. The system SHALL use dirty flagging to avoid recomputing forces when the structure and loads are unchanged. The system SHALL throttle stress color updates to 30 FPS if needed for performance. The system SHALL target frame times of 16ms (60 FPS) or less on mid-range devices with 50-beam structures.

#### Scenario: Dirty flag prevents redundant computation

- **WHEN** the structure has not changed and loads have not changed between two consecutive frames
- **THEN** the force solver SHALL NOT recompute forces
- **AND** SHALL use cached force values from the previous frame

#### Scenario: Force recomputation when structure changes

- **WHEN** the user adds or removes a beam
- **THEN** the dirty flag SHALL be set
- **AND** the force solver SHALL recompute forces on the next physics tick

#### Scenario: Frame time target met

- **WHEN** a 50-beam structure is simulated on a mid-range device
- **THEN** the average frame time SHALL be less than 16ms (60 FPS)
- **AND** physics updates and rendering SHALL complete within the frame budget

#### Scenario: Throttled color updates for performance

- **WHEN** the device struggles to maintain 60 FPS
- **THEN** the system MAY reduce stress color update rate to 30 FPS (update colors every other frame)
- **AND** physics accuracy SHALL NOT be affected by the throttling

### Requirement: Accessibility for Colorblind Users

The system SHALL ensure that stress visualization is accessible to colorblind users. The system SHALL reinforce color-coded stress with alternative visual indicators such as hatching patterns (diagonal lines for high stress) and numeric stress labels. The system SHALL maintain a minimum 4.5:1 contrast ratio for all text and UI elements per WCAG AA guidelines.

#### Scenario: Hatching pattern for high stress

- **WHEN** a beam is in the red critical stress range (90-100% of strength)
- **THEN** the beam SHALL be rendered with diagonal hatching lines in addition to the red color
- **AND** the hatching SHALL be visible to users who cannot distinguish red from green

#### Scenario: Numeric stress labels

- **WHEN** the user hovers over or selects a beam
- **THEN** the system SHALL display a numeric label showing the beam's stress in MPa and as a percentage of material strength
- **AND** the label SHALL be readable independent of color

#### Scenario: Contrast ratio for text

- **WHEN** telemetry text is displayed on the canvas
- **THEN** the text color and background SHALL have a contrast ratio of at least 4.5:1
- **AND** the text SHALL be readable by users with low vision
