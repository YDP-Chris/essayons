## 1. Foundation and Constants

- [ ] 1.1 Define TypeScript interfaces for legislative state (current stage, bill metadata, vote counts), decision events, and simulation configuration in `types.ts`
- [ ] 1.2 Define civics constants (default party splits, threshold values for passage/override, filibuster cloture threshold, approval rating bounds, state labels) in `constants.ts`
- [ ] 1.3 Create `CitizenLabEpisode.ts` entry point with `mode: 'event-driven'` that instantiates the state machine and registers all subsystems

## 2. State Machine Implementation

- [ ] 2.1 Implement state machine with seven states: PROPOSAL, COMMITTEE, FLOOR_DEBATE, VOTE, PASSED, VETOED, OVERRIDE_ATTEMPT as an enum
- [ ] 2.2 Implement transition map defining valid transitions from each state (e.g., PROPOSAL → COMMITTEE, COMMITTEE → FLOOR_DEBATE or back to PROPOSAL)
- [ ] 2.3 Implement `getAvailableActions(state)` that returns possible decisions at current state (e.g., at COMMITTEE: "Approve", "Amend", "Reject")
- [ ] 2.4 Implement `onEvent(state, event)` that applies the selected action, transitions to next state, and updates bill metadata and parameter effects
- [ ] 2.5 Write unit tests: verify all valid transitions, verify invalid transitions are blocked, verify state machine determinism

## 3. Guard Conditions and Transition Logic

- [ ] 3.1 Implement guard condition for committee approval: requires majority support in committee (affected by lobbying pressure parameter)
- [ ] 3.2 Implement guard condition for floor vote passage: requires simple majority OR supermajority if filibuster invoked (filibuster threshold parameter, typically 60%)
- [ ] 3.3 Implement filibuster invocation logic: available when party composition is within filibuster-viable range, blocks vote unless cloture achieved
- [ ] 3.4 Implement presidential veto logic: probability affected by public approval rating and party alignment with president
- [ ] 3.5 Implement veto override guard: requires 2/3 majority in both chambers (simplified to single vote for educational clarity)
- [ ] 3.6 Write unit tests: verify passage with 51% support, verify filibuster blocks at 59% support, verify veto override requires 67% support

## 4. Parameter System

- [ ] 4.1 Implement party composition parameter: slider controlling Democrat/Republican split (0-100%, default 50-50 for gridlock scenario)
- [ ] 4.2 Implement public approval rating parameter: affects presidential veto probability and media coverage effects (0-100%, default 50%)
- [ ] 4.3 Implement lobbying pressure parameter: affects committee approval probability and amendments (0-100%, default 30%)
- [ ] 4.4 Implement media coverage parameter: affects public approval changes based on legislative outcomes (0-100%, default 50%)
- [ ] 4.5 Implement filibuster threshold parameter: configurable in sandbox (default 60%, historical values 67% pre-1975)
- [ ] 4.6 Register all parameters with the engine's parameter system, linking to real-time UI controls
- [ ] 4.7 Write unit tests: verify parameter changes propagate to guard conditions, verify parameter bounds enforcement

## 5. Consequence Calculation

- [ ] 5.1 Implement consequence feedback for committee decisions: approval boosts public support, rejection decreases it, amendments affected by lobbying
- [ ] 5.2 Implement consequence feedback for floor votes: passage increases approval (scaled by media coverage), failure decreases approval
- [ ] 5.3 Implement consequence feedback for filibuster: invoking filibuster decreases approval with opposing party, increases with own party
- [ ] 5.4 Implement consequence feedback for presidential veto: decreases approval if veto of popular bill, increases if veto of unpopular bill
- [ ] 5.5 Implement consequence feedback for override attempt: success boosts legislative branch approval, failure damages it
- [ ] 5.6 Write unit tests: verify consequence calculations match expected formulas, verify approval stays within 0-100% bounds

## 6. Mission: Pass Your First Bill

- [ ] 6.1 Define success criteria: bill reaches PASSED state (completes full lifecycle from PROPOSAL to PASSED without veto, or vetoed then overridden)
- [ ] 6.2 Implement per-state condition checking using the mission framework interface for event-driven mode
- [ ] 6.3 Implement failure states: bill rejected in committee, fails floor vote, vetoed without override attempt, or override fails
- [ ] 6.4 Implement mission briefing UI text explaining the legislative process and success/failure messages with encouraging brand voice
- [ ] 6.5 Write unit tests: verify success when bill passes cleanly, verify failure on committee rejection, verify success after veto override

## 7. Mission: Survive a Veto

- [ ] 7.1 Define success criteria: bill is passed, then vetoed, then override attempt succeeds (reaches PASSED via override path)
- [ ] 7.2 Implement veto detection: ensure bill reaches VETOED state before success is possible
- [ ] 7.3 Implement override success detection: requires veto override vote to pass with 2/3 majority
- [ ] 7.4 Implement mission briefing explaining presidential veto power and override mechanics with historical examples
- [ ] 7.5 Write unit tests: verify success path is PASSED → VETOED → OVERRIDE_ATTEMPT → PASSED, verify failure if override vote fails

## 8. Mission: Gridlock

- [ ] 8.1 Define scenario conditions: party composition locked to 50-50 split, lobbying pressure at moderate level
- [ ] 8.2 Define success criteria: experience at least one failed floor vote due to lack of majority, then successfully navigate compromise path
- [ ] 8.3 Implement gridlock detection: track failed votes and amendment negotiation cycles
- [ ] 8.4 Implement mission briefing explaining political gridlock and compromise strategies
- [ ] 8.5 Write unit tests: verify gridlock triggers with 50-50 split, verify compromise amendments can break gridlock

## 9. Mission: The Filibuster

- [ ] 9.1 Define success criteria: successfully invoke filibuster to block a vote, then achieve cloture (60% threshold) to proceed with modified bill
- [ ] 9.2 Implement filibuster invocation as available action during FLOOR_DEBATE state when conditions met
- [ ] 9.3 Implement cloture vote mechanics: requires filibuster threshold percentage (default 60%) to break filibuster
- [ ] 9.4 Implement mission briefing explaining filibuster history, Rule 22, and cloture votes with historical examples (e.g., Civil Rights Act of 1964)
- [ ] 9.5 Write unit tests: verify filibuster blocks vote when support < 60%, verify cloture at 60% allows vote to proceed

## 10. Sandbox Mode

- [ ] 10.1 Implement sandbox mode toggle that disables all mission condition checking and allows free exploration
- [ ] 10.2 Unlock all parameters in sandbox: party composition, approval, lobbying, media, filibuster threshold, presidential veto probability override
- [ ] 10.3 Add reset button to restart the legislative process with current parameter values
- [ ] 10.4 Allow unlimited undo: full decision history navigation in sandbox
- [ ] 10.5 Write unit tests: verify no mission callbacks fire in sandbox mode, verify all parameters are adjustable without constraints

## 11. Decision UI Component

- [ ] 11.1 Implement React component `DecisionUI.tsx` that renders available actions as buttons with clear labels
- [ ] 11.2 Display predicted consequences for each action: estimated approval change, passage probability, party reaction
- [ ] 11.3 Implement decision history timeline showing all past decisions with outcomes
- [ ] 11.4 Apply Civics accent color #e63946 to active state, decision buttons, and consequence highlights
- [ ] 11.5 Implement keyboard accessibility: actions selectable via number keys (1-4), navigate with arrow keys, confirm with Enter
- [ ] 11.6 Write component tests: verify actions render correctly per state, verify consequence predictions update based on parameters

## 12. Reference Panel

- [ ] 12.1 Implement collapsible reference panel as a React component (`ReferencePanel.tsx`) overlaying the canvas
- [ ] 12.2 Write content for "Separation of Powers": legislative, executive, judicial branches with diagram description
- [ ] 12.3 Write content for "How a Bill Becomes a Law": flowchart description matching the state machine states
- [ ] 12.4 Write content for "Checks and Balances": veto power, override power, judicial review (note: judicial review out of scope for MVP state machine)
- [ ] 12.5 Write content for "The Filibuster": history of Rule 22, cloture votes, famous filibusters (Strom Thurmond 1957, Mr. Smith Goes to Washington)
- [ ] 12.6 Style with brand fonts (Instrument Serif for headings, DM Sans for body, IBM Plex Mono for vote counts) and Civics accent #e63946
- [ ] 12.7 Implement contextual highlighting: current mission's relevant section is highlighted in the panel

## 13. Visual Rendering: State Machine Diagram

- [ ] 13.1 Implement state machine visualization on Canvas: nodes for each state (circles or rounded rectangles), positioned in flowchart layout
- [ ] 13.2 Implement transition arrows connecting states with directional indicators
- [ ] 13.3 Implement current state highlighting: active state node uses Civics accent #e63946, completed states use gray, future states use light gray
- [ ] 13.4 Implement parameter gauges on Canvas: bar charts or radial gauges for party composition, approval rating, lobbying, media
- [ ] 13.5 Render parameter gauges in sidebar or bottom panel, updating in real-time as decisions affect parameters
- [ ] 13.6 Implement decision history timeline on Canvas: horizontal timeline showing sequence of decisions with icons
- [ ] 13.7 Ensure all rendering respects 60 FPS budget for smooth transitions; profile and optimize draw calls
- [ ] 13.8 Write visual regression tests or snapshot tests for key rendering states (initial proposal, committee, floor debate, passed, vetoed)

## 14. Visual Rendering: Transition Animations

- [ ] 14.1 Implement transition animation when moving between states: highlight arrow, pulse target state node, fade effect
- [ ] 14.2 Animate parameter gauge changes: smooth interpolation when approval rating or other parameters change
- [ ] 14.3 Implement consequence feedback animation: positive changes show green upward arrow, negative show red downward arrow next to affected parameter
- [ ] 14.4 Keep animations brief (200-500ms) to maintain engagement without slowing decision-making
- [ ] 14.5 Allow animations to be skipped or disabled via accessibility preference

## 15. Integration and Polish

- [ ] 15.1 Wire all subsystems together through `CitizenLabEpisode.ts` and verify full lifecycle: load, propose bill, navigate to passage
- [ ] 15.2 Implement responsive layout: canvas resizes to viewport, decision UI reflows for mobile, touch controls for action selection
- [ ] 15.3 Implement keyboard accessibility: all controls reachable via Tab, decisions selectable via number keys or arrow keys + Enter
- [ ] 15.4 Add episode metadata: title "Citizen Lab", domain "Civics", accent color #e63946, description text
- [ ] 15.5 Performance profiling: verify smooth rendering on mid-range device, <3s load on simulated 3G, <100ms decision response latency
- [ ] 15.6 Write Playwright E2E tests: load episode, navigate bill through full legislative process, verify mission success flow
- [ ] 15.7 Write Playwright E2E test: verify decision UI updates per state, reference panel opens and closes, parameter changes affect outcomes

## 16. Episode Registration

- [ ] 16.1 Register Citizen Lab in the episode factory or routing system so it appears in the episode list
- [ ] 16.2 Add episode thumbnail/preview image for episode selection screen (illustration of Capitol building or legislative chamber)
- [ ] 16.3 Update landing page or episode index to include Citizen Lab as Episode 02 with domain "Civics" and accent color #e63946
- [ ] 16.4 Write documentation in code comments explaining state machine structure for future episode authors
