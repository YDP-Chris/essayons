# Change: Add Citizen Lab — Episode 02 civics simulation using event-driven state machine

## Why

Citizen Lab is Episode 02 and the first non-physics episode in Essayons. It teaches civics through direct experience: players navigate the legislative process, experiencing how bills become laws, how checks and balances operate, and what happens when gridlock strikes. As the first episode using the event-driven simulation mode (discrete state machine), it validates that the simulation engine can handle non-continuous domains and establishes patterns for future civics, economics, and history episodes.

## What Changes

- Add legislative process state machine with transitions: PROPOSAL → COMMITTEE → FLOOR_DEBATE → VOTE → PASSED/VETOED → OVERRIDE_ATTEMPT
- Add civics simulation parameters: party composition (% Democrat/Republican), public approval rating, lobbying pressure intensity, media coverage level, and filibuster threshold
- Add guard conditions controlling state transitions based on parameters (e.g., floor vote requires majority + filibuster threshold when applicable)
- Add consequence feedback showing how decisions affect public approval, party support, and legislative outcomes
- Add four structured missions: "Pass Your First Bill" (complete lifecycle), "Survive a Veto" (presidential veto + override), "Gridlock" (evenly split parties), and "The Filibuster" (navigate cloture rules)
- Add sandbox mode with all parameters unlocked for exploring edge cases and historical scenarios
- Add reference panel presenting separation of powers, how a bill becomes a law, checks and balances, and historical filibuster examples
- Add Canvas rendering for state machine visualization: state nodes, transition arrows, current state highlighting, parameter gauges, and decision history timeline
- Add decision UI displaying available actions at each state (e.g., "Send to Committee", "Call Floor Vote", "Invoke Filibuster", "Presidential Signature", "Veto Override Attempt") with predicted consequences
- Apply Civics domain accent color #e63946 throughout the episode UI

## Impact

- Affected specs: `citizen-lab` (new capability)
- Affected code:
  - `src/episodes/citizen-lab/CitizenLabEpisode.ts` — episode entry point, event-driven mode configuration
  - `src/episodes/citizen-lab/LegislativeStateMachine.ts` — state machine implementation with transitions and guard conditions
  - `src/episodes/citizen-lab/CivicsParameters.ts` — parameter definitions for party composition, approval, lobbying, media, filibuster
  - `src/episodes/citizen-lab/StateTransitionLogic.ts` — guard conditions and consequence calculations per transition
  - `src/episodes/citizen-lab/missions/PassFirstBillMission.ts` — first bill through full lifecycle
  - `src/episodes/citizen-lab/missions/SurviveVetoMission.ts` — veto + override detection
  - `src/episodes/citizen-lab/missions/GridlockMission.ts` — deadlock scenario detection
  - `src/episodes/citizen-lab/missions/FilibusterMission.ts` — filibuster rule effects
  - `src/episodes/citizen-lab/DecisionUI.tsx` — React component displaying available actions and consequences
  - `src/episodes/citizen-lab/ReferencePanel.tsx` — civics educational content
  - `src/episodes/citizen-lab/StateMachineRenderer.ts` — Canvas rendering for state machine diagram
  - `src/episodes/citizen-lab/types.ts` — TypeScript interfaces for legislative state, decision events, mission state
  - `src/episodes/citizen-lab/constants.ts` — thresholds, default parameters, state labels
