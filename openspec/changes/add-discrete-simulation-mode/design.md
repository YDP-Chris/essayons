## Context

Essayons is a browser-based interactive learning platform spanning physics, civics, economics, history, biology, and engineering. The existing `add-simulation-engine` proposal defines a continuous, fixed-timestep physics loop (Velocity Verlet integration, `requestAnimationFrame`, 60 Hz physics tick) that works well for physics and engineering episodes. However, multiple planned domains do not fit the continuous model:

- **Civics**: Rule-based state machines where users make discrete policy decisions with branching outcomes. There are no forces or velocities -- just decisions and consequences.
- **Economics**: Agent-based models or equilibrium solvers where market rounds advance discretely and agents converge toward equilibrium. Time is measured in "rounds," not seconds.
- **History**: Branching narrative trees where cause-and-effect relationships are explored through counterfactual "what if" decisions. Progression is event-driven, not time-driven.
- **Biology**: Population genetics and breeding simulations where each "step" represents a discrete generation (Punnett squares, allele frequency changes). Generations do not happen at 60 FPS.

Forcing these domains into a continuous physics loop would waste CPU cycles (running an idle `requestAnimationFrame` loop with nothing to update), produce unnatural user interactions (no meaningful "pause/speed" when there is no time axis), and require episode authors to implement their own step/event systems outside the engine's plugin interface.

**Stakeholders**: Solo developer, future episode authors.
**Constraints**: Zero budget, browser-only, TypeScript strict mode, backward-compatible with the existing `EpisodeDefinition` interface (continuous mode must continue working unchanged).

## Goals / Non-Goals

**Goals:**

- Extend the simulation engine to support three computation modes: continuous (existing), discrete/step-based (new), and event-driven/state-machine (new)
- Provide a unified `EpisodeDefinition` interface where the `mode` field determines which lifecycle hooks are active
- Ensure discrete and event-driven modes consume zero CPU when idle (no wasted `requestAnimationFrame` ticks)
- Provide step controls (next, auto-step, reset, undo) for discrete mode and decision UI contracts (available actions, consequences, history) for event-driven mode
- Adapt canvas rendering to be mode-aware: on-demand rendering for discrete/event-driven, smooth transition animations between discrete states
- Maintain full backward compatibility with continuous-mode episodes

**Non-Goals:**

- Implementing specific domain episodes (biology, civics, etc.) -- this proposal only adds engine capabilities
- Multiplayer or collaborative decision-making
- Persistent state across browser sessions for step/decision history (localStorage persistence is limited to parameters, as in the existing design)
- AI-driven decision opponents or automated event generation
- Undo/redo for continuous mode (out of scope; discrete mode gets undo via step history)

## Decisions

### Decision 1: Unified engine with mode-aware dispatch (not separate engines)

The `SimulationEngine` class remains a single class. It reads the `mode` field from the loaded `EpisodeDefinition` and delegates to the appropriate execution strategy:

```
SimulationEngine
├── mode === 'continuous'   --> ContinuousLoop (existing requestAnimationFrame + accumulator)
├── mode === 'discrete'     --> StepController (step-on-demand + optional auto-step timer)
└── mode === 'event-driven' --> EventDispatcher (dispatch-on-demand, no automatic progression)
```

The engine lifecycle (`init`, `start`, `pause`, `resume`, `stop`, `destroy`) remains the same across all modes. What changes is what happens inside `start()`:

- Continuous: starts the `requestAnimationFrame` loop
- Discrete: enters an idle state waiting for step triggers (button clicks or auto-step timer)
- Event-driven: enters an idle state waiting for dispatched events/actions

**Why unified**: A single engine class means shared subsystems (parameter system, canvas renderer, input handler, mission framework) work identically across modes. Episode authors learn one API. React integration hooks have a single engine reference. Testing infrastructure is shared.

**Why not separate engines**: Three separate engine classes would duplicate lifecycle management, parameter handling, canvas setup, and input binding. The mode-specific logic is small (a step controller or event dispatcher), while the shared infrastructure is large. Duplication would increase maintenance burden and divergence risk.

**Trade-offs**:

- The unified engine class grows in complexity (mode-switch logic, three code paths). Mitigation: the mode-specific logic is extracted into `StepController` and `EventDispatcher` classes, keeping the engine class as a thin orchestrator.
- Mode-irrelevant hooks exist on the interface (e.g., `step` is meaningless in continuous mode). Mitigation: TypeScript discriminated unions ensure only mode-relevant hooks are required at compile time.

### Decision 2: Extended EpisodeDefinition with discriminated union

The `EpisodeDefinition` interface is extended (not replaced) with a `mode` discriminator:

```typescript
interface EpisodeDefinitionBase {
  id: string
  name: string
  description: string
  accentColor: string
  parameters: ParameterDefinition[]
  missions: MissionDefinition[]
  init(engine: SimulationEngine): void
  createInitialState(): SimulationState
  render(ctx: RenderContext, state: SimulationState, params: ParamValues): void
  cleanup(): void
}

interface ContinuousEpisode extends EpisodeDefinitionBase {
  mode: 'continuous'
  update(state: PhysicsState, params: ParamValues, dt: number): PhysicsState
}

interface DiscreteEpisode extends EpisodeDefinitionBase {
  mode: 'discrete'
  step(state: SimulationState, stepIndex: number): SimulationState
  canStep?(state: SimulationState): boolean
  animateTransitions?: boolean
  defaultAutoStepInterval?: number // ms, default 1000
}

interface EventDrivenEpisode extends EpisodeDefinitionBase {
  mode: 'event-driven'
  onEvent(state: SimulationState, event: SimEvent): SimulationState
  getAvailableActions(state: SimulationState): SimAction[]
}

type EpisodeDefinition = ContinuousEpisode | DiscreteEpisode | EventDrivenEpisode
```

**Why discriminated union**: TypeScript's type narrowing ensures that when `mode === 'discrete'`, only `step` and `canStep` are required -- not `update` or `onEvent`. This catches mismatches at compile time rather than runtime. It also makes the interface self-documenting: reading the type tells you exactly which hooks each mode needs.

**Why not a single flat interface with optional hooks**: A flat interface with all hooks optional provides no compile-time guarantees. An episode author could forget to implement `step` for a discrete episode and only discover the bug at runtime. The discriminated union eliminates this class of error.

**Backward compatibility**: Existing continuous episodes that do not set `mode` explicitly will need `mode: 'continuous'` added. This is a one-line change per episode. Alternatively, the engine can default `mode` to `'continuous'` when unset, but explicit is preferred for clarity.

### Decision 3: StepController design (discrete mode)

The `StepController` is a plain TypeScript class (not React state) that manages:

```
StepController
├── currentState: SimulationState
├── stepIndex: number
├── history: StepHistoryEntry[]     (bounded stack, default max 100)
├── autoStepTimer: number | null    (setInterval ID)
│
├── advanceStep()                   --> checks canStep, calls step(), pushes to history
├── undo()                          --> pops from history, restores previous state
├── reset()                         --> restores createInitialState(), clears history
├── startAutoStep(intervalMs)       --> starts setInterval calling advanceStep()
├── stopAutoStep()                  --> clears the interval
└── subscribe(listener)             --> notifies on state change (for React hooks)
```

**Step advancement flow**:

1. User clicks "Next Step" (or auto-step timer fires)
2. `StepController` calls `episode.canStep(currentState)`. If false, the step is blocked (e.g., simulation is "complete").
3. If allowed, the current state is pushed onto the history stack.
4. `episode.step(currentState, stepIndex)` is called, returning the new state.
5. `stepIndex` increments. Subscribers are notified. Canvas re-renders.

**Auto-step**: Uses `setInterval` (not `requestAnimationFrame`) because discrete steps are not frame-rate-dependent. The interval is configurable by the user and defaults to 1000ms. Auto-step respects `canStep` -- if `canStep` returns false, auto-step stops automatically.

**History depth**: Bounded to 100 entries by default. Each entry stores a full state snapshot. For most discrete simulations (biology generations, economic rounds), state objects are small (< 1 KB), so 100 entries is well within memory budget. The limit is configurable per episode.

**Why not Web Workers**: Step computations for educational simulations are expected to be fast (< 10ms). No need for off-main-thread execution. If a future episode has expensive step computation, a Web Worker can be used inside the episode's `step()` implementation without engine changes.

### Decision 4: EventDispatcher design (event-driven mode)

The `EventDispatcher` is a plain TypeScript class that manages:

```
EventDispatcher
├── currentState: SimulationState
├── availableActions: SimAction[]
├── decisionHistory: DecisionHistoryEntry[]
│
├── dispatch(event: SimEvent)       --> calls onEvent(), updates available actions
├── getAvailableActions()           --> returns current action list
├── getDecisionHistory()            --> returns full decision trail
├── reset()                         --> restores initial state, clears history
└── subscribe(listener)             --> notifies on state change
```

**Event dispatch flow**:

1. User clicks a decision button (e.g., "Vote Yes on Amendment").
2. UI creates a `SimEvent` with the action ID and any payload.
3. `EventDispatcher.dispatch(event)` calls `episode.onEvent(currentState, event)`, returning the new state.
4. `episode.getAvailableActions(newState)` is called to refresh the action list (new decisions may now be available; old ones may disappear).
5. The dispatch is recorded in `decisionHistory` along with which actions were available at the time (for "path not taken" analysis).
6. Subscribers are notified. Canvas re-renders.

**No automatic progression**: Unlike discrete mode's auto-step, event-driven mode never advances automatically. The user must explicitly take an action. This is intentional -- the pedagogical value of civics and history episodes comes from deliberate decision-making.

**Decision history**: Stores the full trail of decisions for timeline visualization and "what if I had chosen differently?" reflection. No depth limit is applied because event-driven episodes typically have far fewer state transitions than discrete simulations (tens of decisions, not hundreds of steps).

### Decision 5: Canvas rendering strategy per mode

The `CanvasRenderer` becomes mode-aware:

| Mode         | Render Strategy                                | Details                                                                                                                                             |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Continuous   | 60 FPS `requestAnimationFrame` loop (existing) | No changes. Render function called every frame.                                                                                                     |
| Discrete     | On-demand single render after each step        | No `requestAnimationFrame` loop running. `StepController` triggers a single render pass after each step. Optional transition animation (see below). |
| Event-driven | On-demand single render after each dispatch    | No `requestAnimationFrame` loop running. `EventDispatcher` triggers a single render pass after each dispatch. Changed elements can be highlighted.  |

**Why on-demand for discrete/event-driven**: These modes have no continuous time axis. Running a `requestAnimationFrame` loop that re-draws the same state 60 times per second wastes CPU and battery. On-demand rendering means zero CPU usage between user interactions.

**Transition animations (discrete mode)**: When an episode opts in via `animateTransitions: true`, the renderer runs a short `requestAnimationFrame` animation (default 300ms) that interpolates between the "before" and "after" visual states of a step. This gives the user a smooth visual cue of what changed. The animation uses a `TransitionAnimator` class that:

1. Captures the "before" render state
2. Captures the "after" render state
3. Interpolates between them using a configurable easing function (default ease-in-out)
4. Renders interpolated frames via `requestAnimationFrame` for the animation duration
5. Settles on the final "after" state

The episode's `render` function is responsible for being interpolation-friendly -- it receives a `transitionProgress` (0 to 1) parameter during animations.

**Change highlighting (event-driven mode)**: After each event dispatch, the renderer can highlight elements that changed. This is episode-driven -- the episode's `render` function receives a `changedKeys` set indicating which parts of the state changed, and the episode decides how to visualize the changes (e.g., pulsing borders, color shifts).

### Decision 6: How the episode factory (future) generates episodes for each mode

The future episode factory/generator (not part of this proposal, but anticipated) will use the `mode` field to scaffold the correct boilerplate:

- `mode: 'continuous'` --> generates `update(state, params, dt)` stub with Velocity Verlet template
- `mode: 'discrete'` --> generates `step(state, stepIndex)` and `canStep(state)` stubs with a state-transition template
- `mode: 'event-driven'` --> generates `onEvent(state, event)` and `getAvailableActions(state)` stubs with a decision-tree template

Each mode's scaffold includes a minimal working example (bouncing ball for continuous, counter for discrete, two-choice branch for event-driven) so episode authors have a running starting point.

**This proposal does not implement the episode factory.** It only ensures the engine's type system and runtime support all three modes so the factory can target them later.

### Decision 7: Mission framework compatibility

The existing mission framework (condition-based, per-frame evaluation) works directly with continuous mode. For discrete and event-driven modes, mission condition evaluation happens at different points:

- **Discrete**: Mission conditions are evaluated after each step (not per frame, since there are no frames between steps).
- **Event-driven**: Mission conditions are evaluated after each event dispatch.

The mission framework's `evaluate()` method is called by the engine at the appropriate time for each mode. No changes to the `MissionDefinition` interface are needed -- conditions are already expressed as predicates on simulation state, and the state is available after each step/event regardless of mode.

## Risks / Trade-offs

- **Interface complexity**: The discriminated union adds type complexity. Episode authors must understand which hooks their mode requires. **Mitigation**: TypeScript enforces correctness at compile time; clear error messages guide authors. Example episodes for each mode serve as templates.
- **State snapshot memory (step history)**: Storing full state snapshots for undo could be expensive for large states. **Mitigation**: 100-entry depth limit by default; most educational simulation states are small (< 1 KB). Episodes with large state can reduce the limit or implement delta-based history internally.
- **Transition animation jank**: If the episode's `render` function is expensive, interpolating 60 frames during a transition could cause jank. **Mitigation**: Transition animations are opt-in and have a short default duration (300ms = ~18 frames). The performance degradation system applies to transition frames as well.
- **Breaking change to EpisodeDefinition**: Adding the `mode` field requires updating all existing episode definitions. **Mitigation**: Since `add-simulation-engine` is still a proposal (not implemented), there are no deployed episodes to migrate. The `mode` field can default to `'continuous'` for backward compatibility once episodes exist.
- **Auto-step timing accuracy**: `setInterval` is not precise on all browsers (minimum ~4ms, can be throttled in background tabs). **Mitigation**: For educational simulations, sub-second timing precision is not critical. The auto-step interval is a user-facing convenience, not a simulation-accuracy requirement.

## Migration Plan

Since `add-simulation-engine` is still a proposal and no simulation engine code exists yet, this is an additive design extension -- not a migration. The implementation plan is:

1. Implement `add-simulation-engine` (continuous mode) first, as already planned.
2. Extend the engine with mode dispatch, `StepController`, and `EventDispatcher` as defined in this proposal.
3. Add `mode: 'continuous'` to the Orbit Lab episode definition (the only planned continuous episode at this stage).
4. Create example discrete and event-driven episodes to validate the new modes.

**Rollback**: Remove `StepController.ts`, `EventDispatcher.ts`, `TransitionAnimator.ts`, and the mode-specific hooks from `EpisodeDefinition`. Revert `SimulationEngine` to continuous-only. No data migration needed since step/decision history is ephemeral (not persisted).

## Open Questions

- **Hybrid modes**: Could an episode need both discrete steps AND event-driven decisions (e.g., a biology sim with generational steps plus user-driven breeding choices)? Deferred -- the current design keeps modes mutually exclusive. A `'hybrid'` mode could be added later if concrete use cases emerge.
- **Networked decisions**: For future classroom use, could multiple students make decisions in the same event-driven episode? Deferred -- the "no multiplayer" non-goal applies.
- **Step/decision analytics**: Should the engine track step/decision patterns for learning analytics (e.g., "80% of users chose option A at step 3")? Deferred -- analytics are aggregate-only per project constraints, and this is an episode-level concern, not an engine concern.
- **Deterministic replay for event-driven mode**: Should the engine support replaying a sequence of decisions to reproduce a specific outcome? Useful for sharing results ("here's my path through the Bill simulation"). Deferred but architecturally enabled -- `decisionHistory` captures the full action sequence needed for replay.
