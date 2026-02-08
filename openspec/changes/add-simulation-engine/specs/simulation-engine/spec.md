## ADDED Requirements

### Requirement: Fixed-Timestep Simulation Loop

The system SHALL execute physics updates at a fixed timestep (default 1/60th of a second) using a time accumulator pattern, independent of the display refresh rate. The system SHALL drive rendering via `requestAnimationFrame` at the display's native refresh rate. The system SHALL cap the maximum number of physics ticks per frame (default 10) to prevent the spiral of death when the device cannot keep up.

#### Scenario: Physics runs at fixed rate regardless of display refresh

- **WHEN** the display refresh rate is 60 Hz, 120 Hz, or any other rate
- **THEN** the physics update function is called with a constant `dt` of 1/60th of a second (or the configured fixed timestep)
- **AND** simulation results are identical across devices for the same inputs

#### Scenario: Multiple physics ticks per frame at high speed

- **WHEN** the time multiplier is set to 10x and the display runs at 60 Hz
- **THEN** approximately 10 physics ticks execute per rendered frame
- **AND** the simulation clock advances 10 seconds for every 1 wall-clock second

#### Scenario: Spiral of death prevention

- **WHEN** physics computation takes longer than the fixed timestep allows and the accumulator grows beyond the tick cap
- **THEN** the system executes at most the configured maximum ticks per frame (default 10)
- **AND** excess accumulated time is discarded to prevent cascading delays

### Requirement: Engine Lifecycle Management

The system SHALL provide a deterministic lifecycle for the simulation engine with the following states: `uninitialized`, `ready`, `running`, `paused`, `stopped`. The system SHALL enforce valid state transitions and reject invalid ones.

#### Scenario: Normal lifecycle progression

- **WHEN** the engine is created and `init()` is called with an episode definition
- **THEN** the engine transitions to `ready` state
- **AND** episode resources are initialized and the initial physics state is created

#### Scenario: Start from ready state

- **WHEN** the engine is in `ready` state and `start()` is called
- **THEN** the engine transitions to `running` state
- **AND** the `requestAnimationFrame` loop begins executing physics and render steps

#### Scenario: Cleanup on destroy

- **WHEN** `destroy()` is called on the engine
- **THEN** the `requestAnimationFrame` loop is cancelled
- **AND** all event listeners are removed
- **AND** the episode's `cleanup()` hook is called
- **AND** all canvas resources are released

### Requirement: Layered Canvas Rendering

The system SHALL render simulation visuals using an HTML5 Canvas 2D context with a layered rendering architecture. Layers SHALL be drawn in ascending z-order each frame. Episodes SHALL register custom render layers via a public API.

#### Scenario: Layers render in z-order

- **WHEN** multiple render layers are registered with different z-index values
- **THEN** layers with lower z-index values are drawn first (back-to-front)
- **AND** each layer's draw function receives a `RenderContext` with the 2D canvas context, viewport transform, and current simulation time

#### Scenario: Layer registration and removal

- **WHEN** an episode calls `addLayer(name, zIndex, renderFn)` during initialization
- **THEN** the layer is added to the render stack at the correct z-order position
- **AND** when `removeLayer(name)` is called, the layer is removed and no longer drawn

#### Scenario: Canvas cleared each frame

- **WHEN** a new render frame begins
- **THEN** the canvas is cleared before any layers are drawn
- **AND** all layers render onto a clean surface

### Requirement: Responsive Canvas Sizing

The system SHALL automatically size the canvas to fill its container element and SHALL adjust for the device pixel ratio to ensure crisp rendering on high-DPI displays. The system SHALL handle container resize events.

#### Scenario: Initial canvas sizing

- **WHEN** the canvas renderer is initialized with a container element
- **THEN** the canvas dimensions match the container's client width and height
- **AND** the canvas backing store is scaled by `window.devicePixelRatio` for sharp rendering

#### Scenario: Container resize handling

- **WHEN** the container element changes size (e.g., window resize, layout change)
- **THEN** the canvas dimensions update to match the new container size within one frame
- **AND** the viewport and coordinate transforms are recalculated

### Requirement: Coordinate Transform System

The system SHALL provide bidirectional coordinate transforms between screen space (pixels) and world space (simulation units). The system SHALL support a camera/viewport with pan and zoom capabilities.

#### Scenario: Screen-to-world conversion

- **WHEN** a mouse click occurs at screen coordinates (x, y)
- **THEN** the system converts the click to world coordinates accounting for current pan offset and zoom level
- **AND** the episode receives the click in world-space units

#### Scenario: Zoom adjusts visible area

- **WHEN** the user zooms in via scroll wheel or pinch gesture
- **THEN** the viewport zoom level increases
- **AND** world-space objects appear larger on screen
- **AND** the visible world-space area decreases proportionally

### Requirement: Typed Parameter System

The system SHALL provide a parameter system supporting typed parameter definitions: `number` (with min, max, step), `boolean`, `enum` (with labeled options), and `vector2` (with optional min/max per axis). All parameter changes SHALL be validated against their type constraints before being applied.

#### Scenario: Number parameter validation

- **WHEN** a number parameter is defined with min=0, max=100, step=5
- **AND** a value of 150 is set
- **THEN** the system clamps the value to 100 (the defined maximum)
- **AND** the parameter change listener receives the clamped value

#### Scenario: Enum parameter validation

- **WHEN** an enum parameter is defined with options ["low", "medium", "high"]
- **AND** a value of "extreme" is set
- **THEN** the system rejects the change and retains the previous value

#### Scenario: Parameter change notification

- **WHEN** a parameter value changes
- **THEN** all registered listeners for that parameter are notified
- **AND** notifications are batched to prevent mid-physics-tick inconsistency (delivered between frames, not during a physics step)

### Requirement: Parameter Persistence

The system SHALL serialize parameter values to browser `localStorage` and restore them when the same episode is loaded again. The system SHALL gracefully handle missing or corrupted stored values by falling back to parameter defaults.

#### Scenario: Parameters persist across sessions

- **WHEN** a user changes parameters and closes the browser
- **AND** the user reopens the same episode later
- **THEN** the previously set parameter values are restored from localStorage

#### Scenario: Corrupted storage fallback

- **WHEN** the stored parameter data is corrupted, has an incompatible schema, or is missing
- **THEN** the system falls back to the parameter default values defined by the episode
- **AND** no error is shown to the user

### Requirement: Time Control System

The system SHALL provide time controls supporting pause, play, and speed adjustment. The speed multiplier SHALL support values from 1x (real-time) to 1000x. The system SHALL support single-step mode to advance exactly one physics tick while paused.

#### Scenario: Pause and resume

- **WHEN** the simulation is running and pause is activated
- **THEN** physics updates stop and the simulation clock freezes
- **AND** the last rendered frame remains visible on the canvas
- **AND** when play is activated, physics resumes from the paused state with no time skip

#### Scenario: Speed adjustment

- **WHEN** the speed multiplier is changed from 1x to 100x
- **THEN** the simulation clock advances 100 simulation-seconds per wall-clock second
- **AND** physics ticks execute at an increased rate (multiple ticks per frame) to maintain accuracy

#### Scenario: Single-step while paused

- **WHEN** the simulation is paused and single-step is activated
- **THEN** exactly one physics tick executes with the fixed timestep dt
- **AND** the canvas re-renders to show the updated state
- **AND** the simulation remains in the paused state afterward

### Requirement: Simulation Clock

The system SHALL maintain a simulation clock tracking cumulative simulation time elapsed. The simulation clock SHALL advance based on the speed multiplier and SHALL freeze when paused. The simulation clock SHALL be independent of wall-clock time.

#### Scenario: Clock reflects speed multiplier

- **WHEN** the simulation runs at 5x speed for 10 wall-clock seconds
- **THEN** the simulation clock reads approximately 50 simulation-seconds elapsed

#### Scenario: Clock pauses with simulation

- **WHEN** the simulation is paused
- **THEN** the simulation clock stops advancing
- **AND** the simulation time reported to the episode's update and render functions remains constant

### Requirement: Keyboard Input Handling

The system SHALL capture keyboard input events (keydown, keyup) and map them to named simulation actions via configurable bindings. The system SHALL support both event-driven callbacks (on press/release) and polling (is key currently held). The system SHALL ignore keyboard input when a UI text input element has focus.

#### Scenario: Action binding resolution

- **WHEN** the key "w" is pressed and a binding maps "w" to the action "thrust-forward"
- **THEN** the episode receives a "thrust-forward" action event
- **AND** polling `isActionActive("thrust-forward")` returns true while the key is held

#### Scenario: Input suppression during UI focus

- **WHEN** a text input or textarea element has focus
- **AND** the user presses a key that is bound to a simulation action
- **THEN** the simulation action is NOT triggered
- **AND** the keypress is handled normally by the focused input element

#### Scenario: Multiple keys bound to same action

- **WHEN** both "w" and "ArrowUp" are bound to "thrust-forward"
- **AND** the user presses "ArrowUp"
- **THEN** the "thrust-forward" action fires identically to pressing "w"

### Requirement: Mouse and Touch Input Handling

The system SHALL capture mouse events (click, move, drag, scroll) and touch events (tap, drag, pinch) and map them to named simulation actions. Mouse and touch positions SHALL be converted to world coordinates using the current viewport transform.

#### Scenario: Click with world coordinates

- **WHEN** the user clicks on the canvas at screen position (400, 300)
- **THEN** the system converts the click to world coordinates using the current viewport pan and zoom
- **AND** the episode receives the click event with both screen and world coordinates

#### Scenario: Drag interaction

- **WHEN** the user presses and drags on the canvas
- **THEN** the system emits drag-start, drag-move, and drag-end events
- **AND** each event includes the current world-coordinate position and the delta from drag start

#### Scenario: Pinch-to-zoom on touch devices

- **WHEN** the user performs a two-finger pinch gesture on a touch device
- **THEN** the system maps the gesture to the zoom action
- **AND** the viewport zoom level adjusts proportionally to the pinch distance change

### Requirement: Mission Framework

The system SHALL provide a mission framework that evaluates success and failure conditions each physics frame. Missions SHALL track individual objectives that can be in states: `pending`, `completed`, or `failed`. The overall mission SHALL transition through states: `not-started`, `active`, `completed`, `failed`.

#### Scenario: Mission activation

- **WHEN** a mission is started
- **THEN** all objectives transition to `pending` state
- **AND** the mission state transitions to `active`
- **AND** per-frame condition evaluation begins

#### Scenario: Objective completion

- **WHEN** a mission is active and an objective's success condition evaluates to true
- **THEN** that objective transitions to `completed` state
- **AND** when all required objectives are `completed`, the mission transitions to `completed`

#### Scenario: Mission failure

- **WHEN** a mission is active and a failure condition evaluates to true (e.g., crash, timeout)
- **THEN** the mission transitions to `failed` state
- **AND** condition evaluation stops
- **AND** the failure reason is made available to the UI

#### Scenario: Mission reset

- **WHEN** a failed or completed mission is reset
- **THEN** all objectives return to `pending` state
- **AND** the physics state is reset to the mission's initial state via `createInitialState()`
- **AND** the simulation clock resets to zero
- **AND** the mission transitions to `active` state

### Requirement: Mission Objective Tracking

The system SHALL expose the current mission state and individual objective statuses to the UI layer. Each objective SHALL have a human-readable description and a completion status.

#### Scenario: UI reads objective list

- **WHEN** a mission is active with three objectives
- **THEN** the UI can query the list of objectives, each with its description and current status (pending, completed, failed)
- **AND** the UI updates reactively when an objective status changes

#### Scenario: Objective with progress indicator

- **WHEN** an objective defines a numeric progress metric (e.g., "reach altitude 200 km", current altitude 150 km)
- **THEN** the system exposes the current progress value and the target value
- **AND** the UI can display a progress indicator (e.g., 75% complete)

### Requirement: Frame Budget Management

The system SHALL monitor the time spent on physics updates and rendering each frame. The system SHALL target a total frame time of 16ms (60 FPS) or less. The system SHALL provide frame-time metrics to the performance monitor.

#### Scenario: Frame time tracking

- **WHEN** a frame completes
- **THEN** the system records the time spent on physics, rendering, and total frame processing
- **AND** these metrics are available via the performance monitor API

#### Scenario: FPS reporting

- **WHEN** the performance monitor is queried for FPS
- **THEN** it returns a rolling average over the last 60 frames (not instantaneous)
- **AND** the average smooths out individual frame spikes for a stable readout

### Requirement: Graceful Performance Degradation

The system SHALL detect when frame times consistently exceed the target budget and SHALL take corrective action to maintain interactive frame rates. Degradation steps SHALL be reversible when performance improves.

#### Scenario: Reduce render quality under load

- **WHEN** the rolling average frame time exceeds 20ms for 30 consecutive frames
- **THEN** the system reduces render quality (e.g., disabling cosmetic effect layers, reducing particle counts)
- **AND** physics simulation accuracy is NOT affected by the degradation

#### Scenario: Recovery when load decreases

- **WHEN** render quality has been degraded and the rolling average frame time drops below 14ms for 60 consecutive frames
- **THEN** the system incrementally restores render quality
- **AND** restoration is gradual to avoid oscillating between quality levels

#### Scenario: Physics never skipped for performance

- **WHEN** the device is under heavy load
- **THEN** physics ticks are capped per frame (per the tick cap) but never skipped or reduced in accuracy
- **AND** simulation correctness is preserved at all times

### Requirement: Episode Plugin Interface

The system SHALL define an `EpisodeDefinition` interface that episodes implement to plug into the simulation engine. The interface SHALL include lifecycle hooks (`init`, `update`, `render`, `cleanup`), parameter definitions, and mission definitions. The `update` function SHALL be a pure function of current state, parameters, and timestep.

#### Scenario: Episode registration and initialization

- **WHEN** an episode definition is provided to the engine's `init()` method
- **THEN** the engine registers the episode's parameters, missions, and render layers
- **AND** the episode's `init()` hook is called with a reference to the engine
- **AND** the initial physics state is created via `createInitialState()`

#### Scenario: Pure update function

- **WHEN** the physics step executes
- **THEN** the episode's `update(state, params, dt)` is called with the current state, current parameter values, and the fixed timestep
- **AND** the function returns a new state object without mutating the input state
- **AND** calling `update` with identical inputs always produces identical outputs

#### Scenario: Episode cleanup on unload

- **WHEN** the engine is destroyed or a different episode is loaded
- **THEN** the current episode's `cleanup()` hook is called
- **AND** all episode-specific render layers are removed
- **AND** all episode-specific input bindings are removed
- **AND** no memory leaks from the unloaded episode remain
