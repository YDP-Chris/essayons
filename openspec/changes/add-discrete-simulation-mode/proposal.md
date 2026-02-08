# Change: Add discrete and event-driven simulation modes to the simulation engine

## Why

The existing simulation engine proposal (`add-simulation-engine`) defines a continuous, fixed-timestep physics loop designed for real-time physics and engineering simulations. However, Essayons spans civics, economics, history, and biology -- domains where computation is inherently discrete (turn-based generations, market rounds) or event-driven (policy decisions, branching narratives). Without first-class support for these computation models, episodes in non-physics domains would need to awkwardly shoehorn state machines and turn logic into a 60 Hz physics loop, resulting in wasted computation and unnatural interaction patterns.

## What Changes

- **BREAKING** Extend the `EpisodeDefinition` plugin interface with a `mode` discriminator (`'continuous' | 'discrete' | 'event-driven'`) and mode-specific lifecycle hooks (`step`, `canStep`, `onEvent`, `getAvailableActions`)
- Add discrete/step-based simulation mode: state advances one step at a time via user interaction or auto-step timer, with each step applying domain-specific rules/transformations
- Add event-driven/state-machine simulation mode: state changes in response to user decisions or external events, with branching paths and no automatic time progression
- Add step controls UI contract for discrete mode: "Next Step" button, "Auto-Step" toggle with configurable interval, step counter display, and "Reset" action
- Add step history system for discrete mode: tracks all previous states for undo and review
- Add decision UI contract for event-driven mode: available action display, consequence feedback, and decision history/timeline
- Adapt canvas rendering strategy per mode: continuous uses 60 FPS animation (existing), discrete re-renders after each step with optional transition animations, event-driven re-renders after each decision with changed-element highlighting

## Impact

- Affected specs: `simulation-engine` (modified -- extended with new modes)
- Affected code:
  - `src/engine/SimulationEngine.ts` -- core loop gains mode-aware dispatch; discrete and event-driven execution paths added alongside continuous loop
  - `src/engine/types.ts` -- `EpisodeDefinition` interface extended with mode discriminator and new hooks
  - `src/engine/StepController.ts` -- new file; manages step advancement, auto-step timer, step counter, and step history for discrete mode
  - `src/engine/EventDispatcher.ts` -- new file; manages event/action dispatch, available actions, and decision history for event-driven mode
  - `src/engine/CanvasRenderer.ts` -- rendering strategy becomes mode-aware; adds transition animation support for discrete mode and change-highlight support for event-driven mode
  - `src/engine/TransitionAnimator.ts` -- new file; interpolates visual state between discrete steps for smooth transitions
  - `src/hooks/useSimulation.ts` -- hook extended to expose step controls and decision actions depending on mode
  - `src/hooks/useStepControls.ts` -- new hook; exposes step counter, next-step, auto-step, reset, and undo to React UI
  - `src/hooks/useDecisionUI.ts` -- new hook; exposes available actions, decision history, and consequence display to React UI
