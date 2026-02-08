## MODIFIED Requirements

### Requirement: Episode Plugin Interface

The system SHALL define an `EpisodeDefinition` interface that episodes implement to plug into the simulation engine. The interface SHALL include a `mode` discriminator field with values `'continuous'`, `'discrete'`, or `'event-driven'` that determines which lifecycle hooks are active. For continuous mode, the interface SHALL include lifecycle hooks (`init`, `update`, `render`, `cleanup`), parameter definitions, and mission definitions; the `update` function SHALL be a pure function of current state, parameters, and timestep. For discrete mode, the interface SHALL include `step(state, stepIndex)` and optionally `canStep(state)` hooks instead of `update`. For event-driven mode, the interface SHALL include `onEvent(state, event)` and `getAvailableActions(state)` hooks instead of `update`. All modes SHALL share the `init`, `createInitialState`, `render`, and `cleanup` hooks, as well as parameter and mission definitions.

#### Scenario: Continuous episode registration and initialization

- **WHEN** an episode definition with `mode: 'continuous'` is provided to the engine's `init()` method
- **THEN** the engine registers the episode's parameters, missions, and render layers
- **AND** the episode's `init()` hook is called with a reference to the engine
- **AND** the initial physics state is created via `createInitialState()`
- **AND** the engine prepares the continuous `requestAnimationFrame` execution loop

#### Scenario: Discrete episode registration and initialization

- **WHEN** an episode definition with `mode: 'discrete'` is provided to the engine's `init()` method
- **THEN** the engine registers the episode's parameters, missions, and render layers
- **AND** the episode's `init()` hook is called with a reference to the engine
- **AND** the initial state is created via `createInitialState()`
- **AND** the engine initializes the `StepController` for step-based execution

#### Scenario: Event-driven episode registration and initialization

- **WHEN** an episode definition with `mode: 'event-driven'` is provided to the engine's `init()` method
- **THEN** the engine registers the episode's parameters, missions, and render layers
- **AND** the episode's `init()` hook is called with a reference to the engine
- **AND** the initial state is created via `createInitialState()`
- **AND** the engine initializes the `EventDispatcher` and computes the initial set of available actions via `getAvailableActions(initialState)`

#### Scenario: Pure update function (continuous mode)

- **WHEN** the physics step executes in continuous mode
- **THEN** the episode's `update(state, params, dt)` is called with the current state, current parameter values, and the fixed timestep
- **AND** the function returns a new state object without mutating the input state
- **AND** calling `update` with identical inputs always produces identical outputs

#### Scenario: Episode cleanup on unload

- **WHEN** the engine is destroyed or a different episode is loaded
- **THEN** the current episode's `cleanup()` hook is called
- **AND** all episode-specific render layers are removed
- **AND** all episode-specific input bindings are removed
- **AND** step history (discrete) or decision history (event-driven) is cleared
- **AND** no memory leaks from the unloaded episode remain

## ADDED Requirements

### Requirement: Discrete Simulation Mode

The system SHALL support a discrete/step-based simulation mode where state advances one step at a time rather than continuously. Each step SHALL apply the episode's `step(state, stepIndex)` function to produce the next state. The system SHALL call the episode's `canStep(state)` function (if provided) before each step to determine whether advancement is permitted. When `canStep` returns false, step advancement SHALL be blocked. When no `canStep` hook is provided, steps SHALL always be permitted. The discrete mode SHALL NOT run a continuous `requestAnimationFrame` loop; execution SHALL occur only when a step is triggered.

#### Scenario: Manual step advancement

- **WHEN** the simulation is in discrete mode and the user triggers a step (e.g., clicks "Next Step")
- **THEN** the system calls `canStep(currentState)` to check if advancement is allowed
- **AND** if allowed, calls `step(currentState, stepIndex)` to produce the next state
- **AND** the step index increments by one
- **AND** the canvas re-renders to display the new state

#### Scenario: Step blocked by canStep guard

- **WHEN** the simulation is in discrete mode and `canStep(currentState)` returns false
- **THEN** the step is not executed
- **AND** the state and step index remain unchanged
- **AND** the UI indicates that stepping is not currently available

#### Scenario: Zero CPU usage between steps

- **WHEN** the simulation is in discrete mode and no step or animation is in progress
- **THEN** no `requestAnimationFrame` callbacks are running
- **AND** CPU usage attributable to the simulation engine is effectively zero

### Requirement: Step Controls

The system SHALL provide step control capabilities for discrete-mode simulations. The system SHALL support a "Next Step" action that advances one step. The system SHALL support an "Auto-Step" mode with a configurable interval (default 1000ms) that automatically advances steps at a regular pace. The system SHALL support a "Reset" action that restores the initial state and resets the step counter to zero. The system SHALL expose the current step index for display in the UI.

#### Scenario: Next step action

- **WHEN** the user activates the "Next Step" control in discrete mode
- **THEN** exactly one step is executed via the episode's `step()` function
- **AND** the step counter increments by one
- **AND** the canvas re-renders to display the resulting state

#### Scenario: Auto-step starts and stops

- **WHEN** the user activates "Auto-Step" with an interval of 500ms
- **THEN** the system automatically calls `advanceStep()` approximately every 500ms
- **AND** each auto-step respects the `canStep` guard
- **AND** when `canStep` returns false, auto-step stops automatically
- **AND** when the user deactivates "Auto-Step", the automatic advancement stops

#### Scenario: Auto-step interval is configurable

- **WHEN** the user changes the auto-step interval from 1000ms to 2000ms while auto-step is active
- **THEN** the system adjusts the step frequency to approximately once every 2000ms
- **AND** no steps are skipped or doubled during the interval change

#### Scenario: Reset restores initial state

- **WHEN** the user activates the "Reset" control in discrete mode
- **THEN** the simulation state is restored to the value returned by `createInitialState()`
- **AND** the step counter resets to zero
- **AND** the step history is cleared
- **AND** auto-step is stopped if it was active
- **AND** the canvas re-renders to display the initial state

#### Scenario: Step counter display

- **WHEN** a discrete simulation is running
- **THEN** the current step index is exposed to the UI layer
- **AND** the UI can display the step count (e.g., "Step 14 of N" or "Step 14")

### Requirement: Step History

The system SHALL maintain a history of previous states for discrete-mode simulations, enabling undo and review of past steps. The history SHALL store complete state snapshots for each step. The history depth SHALL be bounded by a configurable maximum (default 100 entries) to limit memory usage; when the limit is exceeded, the oldest entries SHALL be evicted. The system SHALL support an undo operation that restores the most recent previous state.

#### Scenario: Undo restores previous state

- **WHEN** the user activates "Undo" in discrete mode after advancing multiple steps
- **THEN** the simulation state reverts to the state before the most recent step
- **AND** the step counter decrements by one
- **AND** the undone state is removed from the history stack
- **AND** the canvas re-renders to display the restored state

#### Scenario: Undo at initial state

- **WHEN** the user activates "Undo" and the history stack is empty (step index is 0)
- **THEN** the undo operation has no effect
- **AND** the state and step counter remain unchanged

#### Scenario: History review

- **WHEN** the user requests to review step history
- **THEN** the system provides the full ordered list of historical state snapshots with their step indices
- **AND** the user can inspect the state at any previous step

#### Scenario: History depth limit

- **WHEN** the step history reaches the configured maximum depth (default 100)
- **AND** a new step is advanced
- **THEN** the oldest history entry is evicted to make room for the new entry
- **AND** the most recent 100 states (including the new one) remain available for undo/review

### Requirement: Event-Driven Simulation Mode

The system SHALL support an event-driven simulation mode where state changes occur in response to user decisions or dispatched events, not on a time-based schedule. Each state transition SHALL be produced by the episode's `onEvent(state, event)` function. The system SHALL query the episode's `getAvailableActions(state)` function after each transition to determine what actions the user can take next. The event-driven mode SHALL NOT advance state automatically; all progression SHALL be user-initiated. The event-driven mode SHALL NOT run a continuous `requestAnimationFrame` loop.

#### Scenario: User dispatches a decision event

- **WHEN** the user selects an available action in event-driven mode (e.g., "Vote Yes on Amendment")
- **THEN** the system creates a `SimEvent` with the action's ID and dispatches it to `onEvent(currentState, event)`
- **AND** the episode returns the new state reflecting the decision's consequences
- **AND** the available actions are refreshed via `getAvailableActions(newState)`
- **AND** the canvas re-renders to display the new state

#### Scenario: No automatic state progression

- **WHEN** the simulation is in event-driven mode and the user has not dispatched any event
- **THEN** the state does not change
- **AND** no `requestAnimationFrame` callbacks are running
- **AND** the available actions remain displayed and ready for user interaction

#### Scenario: Available actions update after each decision

- **WHEN** the user takes an action and the state transitions
- **THEN** the system calls `getAvailableActions(newState)` to get the updated action list
- **AND** actions that are no longer valid disappear from the UI
- **AND** newly available actions appear in the UI

#### Scenario: Terminal state with no available actions

- **WHEN** `getAvailableActions(state)` returns an empty list
- **THEN** the UI indicates that no further actions are available (the simulation has reached a terminal state)
- **AND** the user can reset to explore alternative paths

### Requirement: Decision UI

The system SHALL provide decision UI capabilities for event-driven simulations. The system SHALL expose the list of currently available actions to the UI layer, each with an ID, label, and description. The system SHALL expose a decision history recording each action taken, the resulting state, and which alternative actions were available at the time. The system SHALL support a "Reset" action to return to the initial state and clear decision history for re-exploration.

#### Scenario: Display available actions

- **WHEN** the simulation is in event-driven mode and actions are available
- **THEN** the UI layer receives a list of `SimAction` objects, each with `id`, `label`, `description`, and `enabled` fields
- **AND** the UI renders the actions as interactive choices for the user

#### Scenario: Decision history records choices and alternatives

- **WHEN** the user takes action "Vote Yes" when actions "Vote Yes", "Vote No", and "Abstain" were available
- **THEN** the decision history records: the action taken ("Vote Yes"), the resulting state, and the alternatives that were available ("Vote No", "Abstain")
- **AND** the full decision trail is available for timeline display or reflection

#### Scenario: Decision history reset

- **WHEN** the user activates "Reset" in event-driven mode
- **THEN** the simulation state is restored to the initial state via `createInitialState()`
- **AND** the decision history is cleared
- **AND** the available actions are recalculated via `getAvailableActions(initialState)`
- **AND** the canvas re-renders to display the initial state

### Requirement: Mode-Adaptive Rendering

The system SHALL adapt its canvas rendering strategy based on the active simulation mode. In continuous mode, the system SHALL render via a continuous `requestAnimationFrame` loop at the display's native refresh rate (existing behavior). In discrete mode, the system SHALL render on demand after each step completes (and during transition animations, if enabled). In event-driven mode, the system SHALL render on demand after each event is dispatched. The system SHALL NOT run idle `requestAnimationFrame` loops in discrete or event-driven modes.

#### Scenario: Continuous mode renders every frame

- **WHEN** the simulation is in continuous mode and running
- **THEN** the canvas re-renders every `requestAnimationFrame` callback
- **AND** rendering is driven by the existing continuous render loop

#### Scenario: Discrete mode renders after each step

- **WHEN** the simulation is in discrete mode and a step is advanced
- **THEN** the canvas re-renders exactly once to display the new state (or begins a transition animation if enabled)
- **AND** between steps, no render callbacks execute

#### Scenario: Event-driven mode renders after each dispatch

- **WHEN** the simulation is in event-driven mode and an event is dispatched
- **THEN** the canvas re-renders exactly once to display the new state
- **AND** between dispatches, no render callbacks execute

#### Scenario: Mode switch during engine lifecycle

- **WHEN** the engine is destroyed and re-initialized with an episode of a different mode
- **THEN** the previous mode's rendering strategy is fully stopped (e.g., `requestAnimationFrame` loop cancelled)
- **AND** the new mode's rendering strategy is activated
- **AND** no rendering artifacts or stale callbacks remain from the previous mode

### Requirement: State Transition Animations

The system SHALL support optional animated transitions between discrete states for discrete-mode simulations. When an episode enables transition animations (via `animateTransitions: true`), the system SHALL visually interpolate between the "before" and "after" render states over a configurable duration (default 300ms) using `requestAnimationFrame`. The system SHALL support configurable easing functions (at minimum: linear and ease-in-out). The episode's `render` function SHALL receive a `transitionProgress` value (0 to 1) during animations to enable custom interpolation rendering. When transition animations are disabled (the default), the system SHALL render the final state immediately with no animation.

#### Scenario: Animated transition between steps

- **WHEN** a discrete-mode episode has `animateTransitions: true` and a step is advanced
- **THEN** the system begins a `requestAnimationFrame` animation loop lasting the configured duration (default 300ms)
- **AND** the episode's `render` function is called each animation frame with a `transitionProgress` value progressing from 0 (before state) to 1 (after state)
- **AND** after the animation completes, the system settles on the final "after" state and stops the animation loop

#### Scenario: No animation when disabled

- **WHEN** a discrete-mode episode does not set `animateTransitions` or sets it to false
- **THEN** the canvas renders the final state immediately after each step with no interpolation
- **AND** no `requestAnimationFrame` animation loop is started

#### Scenario: Step during active animation

- **WHEN** a transition animation is in progress and the user triggers another step (e.g., clicks "Next Step" rapidly)
- **THEN** the current animation is immediately cancelled
- **AND** the system begins a new transition from the current visual state to the new step's state
- **AND** no visual glitches or orphaned animation loops result

#### Scenario: Easing function selection

- **WHEN** a transition animation is configured with an easing function (e.g., ease-in-out)
- **THEN** the `transitionProgress` value follows the selected easing curve rather than advancing linearly
- **AND** the visual transition appears smooth and natural
