## 1. Core Types and Interface Extensions

- [ ] 1.1 Add `SimulationMode` type (`'continuous' | 'discrete' | 'event-driven'`) to `src/engine/types.ts`
- [ ] 1.2 Extend `EpisodeDefinition` interface with `mode` discriminator and mode-specific hooks: `step(state, stepIndex)`, `canStep(state)`, `onEvent(state, event)`, `getAvailableActions(state)`
- [ ] 1.3 Define `SimEvent` interface (event type, payload, timestamp) and `SimAction` interface (id, label, description, enabled flag) in `src/engine/types.ts`
- [ ] 1.4 Define `StepHistoryEntry` interface (stepIndex, state snapshot, timestamp) and `DecisionHistoryEntry` interface (action taken, resulting state, available alternatives) in `src/engine/types.ts`
- [ ] 1.5 Write unit tests validating type constraints and interface contracts for the extended types

## 2. Simulation Engine Mode Dispatch

- [ ] 2.1 Refactor `SimulationEngine` to read `mode` from the loaded `EpisodeDefinition` and select the appropriate execution strategy
- [ ] 2.2 For `'continuous'` mode, preserve existing `requestAnimationFrame` fixed-timestep loop behavior (no changes)
- [ ] 2.3 For `'discrete'` mode, delegate tick execution to `StepController` instead of the continuous physics loop
- [ ] 2.4 For `'event-driven'` mode, delegate state transitions to `EventDispatcher` instead of the continuous physics loop; no automatic frame-driven updates
- [ ] 2.5 Ensure engine lifecycle (`init`, `start`, `pause`, `resume`, `stop`, `destroy`) works correctly for all three modes
- [ ] 2.6 Write unit tests verifying mode dispatch selects the correct execution path

## 3. Step Controller (Discrete Mode)

- [ ] 3.1 Implement `StepController` class in `src/engine/StepController.ts` managing step index, current state, and step advancement
- [ ] 3.2 Implement `advanceStep()` method: calls episode's `canStep(state)` guard, then `step(state, stepIndex)` to produce next state, increments step counter
- [ ] 3.3 Implement auto-step timer: configurable interval (e.g., 500ms - 5000ms), starts/stops via `startAutoStep(intervalMs)` / `stopAutoStep()`
- [ ] 3.4 Implement step counter tracking (current step index, total steps taken)
- [ ] 3.5 Implement `reset()` method: restores initial state via episode's `createInitialState()`, resets step counter to 0, clears step history
- [ ] 3.6 Implement subscription API so React hooks can observe step state changes
- [ ] 3.7 Write unit tests for step advancement, auto-step timing, reset, and canStep guard behavior

## 4. Step History (Discrete Mode)

- [ ] 4.1 Implement step history stack in `StepController`: each `advanceStep()` pushes the previous state onto the history stack
- [ ] 4.2 Implement `undo()` method: pops the most recent state from history and restores it as the current state, decrements step counter
- [ ] 4.3 Implement `getHistory()` method returning the full ordered list of `StepHistoryEntry` objects for review
- [ ] 4.4 Implement configurable history depth limit (default 100 steps) to bound memory usage; oldest entries are evicted when limit is exceeded
- [ ] 4.5 Write unit tests for undo, history depth limit, and history traversal

## 5. Event Dispatcher (Event-Driven Mode)

- [ ] 5.1 Implement `EventDispatcher` class in `src/engine/EventDispatcher.ts` managing current state, available actions, and event dispatch
- [ ] 5.2 Implement `dispatch(event: SimEvent)` method: calls episode's `onEvent(state, event)` to produce next state, updates available actions via `getAvailableActions(newState)`
- [ ] 5.3 Implement `getAvailableActions()` method: returns the list of `SimAction` objects the user can currently take, sourced from the episode's `getAvailableActions(state)` hook
- [ ] 5.4 Implement decision history tracking: each dispatch records the action taken, the resulting state, and which alternatives were available
- [ ] 5.5 Implement `reset()` method: restores initial state, clears decision history, recalculates available actions
- [ ] 5.6 Implement subscription API so React hooks can observe state changes, available actions, and decision history
- [ ] 5.7 Write unit tests for event dispatch, available actions update, decision history recording, and reset

## 6. Mode-Adaptive Canvas Rendering

- [ ] 6.1 Extend `CanvasRenderer` to accept a `mode` parameter and adjust rendering strategy accordingly
- [ ] 6.2 Continuous mode: no changes -- existing 60 FPS `requestAnimationFrame` render loop
- [ ] 6.3 Discrete mode: render on demand after each step; trigger a single render pass when `StepController` signals a step has occurred
- [ ] 6.4 Event-driven mode: render on demand after each event dispatch; trigger a single render pass when `EventDispatcher` signals a state change
- [ ] 6.5 Write unit tests verifying render is triggered at correct times for each mode

## 7. State Transition Animations (Discrete Mode)

- [ ] 7.1 Implement `TransitionAnimator` class in `src/engine/TransitionAnimator.ts` that interpolates between a "before" and "after" render state over a configurable duration
- [ ] 7.2 Implement `animate(fromState, toState, durationMs, renderFn)` method that uses `requestAnimationFrame` to smoothly tween between states
- [ ] 7.3 Support easing functions (linear, ease-in-out) for transition interpolation
- [ ] 7.4 Integrate with `StepController`: after each step, optionally run a transition animation before settling on the final rendered state
- [ ] 7.5 Make transition animations opt-in per episode via an `animateTransitions` flag on `EpisodeDefinition`
- [ ] 7.6 Write unit tests for animation timing, easing, and opt-in flag behavior

## 8. React Integration Hooks

- [ ] 8.1 Extend `useSimulation` hook to detect the active mode and expose mode-appropriate controls
- [ ] 8.2 Implement `useStepControls` hook in `src/hooks/useStepControls.ts`: exposes `currentStep`, `canStep`, `advanceStep()`, `undo()`, `reset()`, `isAutoStepping`, `startAutoStep(interval)`, `stopAutoStep()`, `history`
- [ ] 8.3 Implement `useDecisionUI` hook in `src/hooks/useDecisionUI.ts`: exposes `availableActions`, `dispatch(action)`, `decisionHistory`, `reset()`
- [ ] 8.4 Write integration tests verifying hooks update correctly when step/event state changes

## 9. Testing and Validation

- [ ] 9.1 Create a minimal discrete-mode example episode (e.g., "Punnett Square Breeding" -- each step is a generation) to validate the full discrete pipeline
- [ ] 9.2 Create a minimal event-driven example episode (e.g., "How a Bill Becomes Law" -- user makes choices at each stage) to validate the full event-driven pipeline
- [ ] 9.3 Verify that existing continuous-mode episode definitions (e.g., Orbit Lab) are unaffected by the mode dispatch refactor (backward compatibility)
- [ ] 9.4 Run performance tests: discrete/event-driven modes should consume zero CPU when idle (no wasted requestAnimationFrame ticks)
- [ ] 9.5 Run accessibility tests: step controls and decision UI are keyboard-navigable and screen-reader-accessible
