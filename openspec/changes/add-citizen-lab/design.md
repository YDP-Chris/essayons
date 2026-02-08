## Context

Citizen Lab is Episode 02 and the first non-physics episode in Essayons. It validates the event-driven simulation mode from `add-discrete-simulation-mode` while teaching civics through experiential learning. Players navigate the U.S. legislative process, experiencing how separation of powers, checks and balances, and political dynamics affect lawmaking. The simulation must be accurate enough that users discover real civics principles (supermajority for veto override, filibuster threshold, committee gatekeeping) without explicit instruction.

The state machine must be simple enough for educational clarity (7 states, not 50) while capturing the essential decision points and consequences that make the legislative process meaningful.

### Constraints

- Client-side only (no server computation)
- Event-driven mode: no continuous time progression, state advances only via user decisions
- Must integrate with the simulation engine's event-driven lifecycle, parameter system, and mission framework
- Must work with keyboard, mouse, and touch input
- WCAG AA accessibility requirements

### Stakeholders

- Solo developer (implementation)
- End users (learners exploring civics)

## Goals / Non-Goals

### Goals

- Accurate representation of U.S. federal legislative process in simplified form (7 states vs. real-world complexity)
- Discoverable learning: users understand checks and balances by experiencing veto override, understand gridlock by experiencing 50-50 split
- Establish a reusable event-driven episode pattern for future civics, economics, and history episodes
- Four missions teaching: basic process (Pass First Bill), executive check (Survive Veto), gridlock dynamics (Gridlock), procedural rules (Filibuster)
- Smooth visual transitions between states with consequence feedback animations

### Non-Goals

- Full bicameral simulation (House + Senate separately) — simplified to single legislative body for educational clarity
- Committee subcommittees, markup sessions, or detailed amendment tracking — abstracted to "committee review"
- Judicial review or Supreme Court interactions — out of scope for Episode 02 (could be future episode)
- Lobbyist NPC agents with individual identities — lobbying abstracted to a pressure parameter
- Multiplayer legislative negotiation — single-player only
- Historical bill recreation (e.g., Civil Rights Act vote-by-vote) — historical examples in reference panel, not simulated

## Decisions

### State Machine Architecture

**Decision**: Model the legislative process as a finite state machine with 7 states and event-driven transitions triggered by user decisions.

**States**:

1. **PROPOSAL** — Bill is drafted. Actions: "Send to Committee", "Abandon Bill"
2. **COMMITTEE** — Committee review. Actions: "Approve", "Amend", "Reject"
3. **FLOOR_DEBATE** — Floor debate open. Actions: "Call Vote", "Invoke Filibuster", "Return to Committee"
4. **VOTE** — Floor vote in progress. Actions: automatically transitions based on vote count vs. thresholds
5. **PASSED** — Bill passed and sent to president. Actions: "Presidential Signature", "Presidential Veto" (automatic based on parameters)
6. **VETOED** — President vetoed. Actions: "Attempt Override", "Accept Veto" (end)
7. **OVERRIDE_ATTEMPT** — Override vote in progress. Actions: automatically transitions based on 2/3 majority requirement

**State Diagram**:

```
PROPOSAL → COMMITTEE ⇄ FLOOR_DEBATE → VOTE → PASSED
                                         ↓
                                     VETOED → OVERRIDE_ATTEMPT → PASSED
```

**Why 7 states**: Real legislative process has dozens of steps (subcommittees, cloakroom negotiations, conference committees). Educational goal requires stripping to essential decision points where users learn principles: committee gatekeeping, floor majority, filibuster as supermajority requirement, veto as executive check, override as legislative counter-check.

**Why event-driven**: Unlike orbital mechanics (continuous time), the legislative process is inherently discrete. Bills do not "drift" forward — they advance when decisions are made. Event-driven mode means zero CPU usage when waiting for user input, natural pacing (users think before deciding), and clear cause-effect relationships.

**Alternatives considered**:

- **Turn-based discrete mode**: Would require artificial "turns" when there is no time axis in legislation. Rejected — event-driven is more natural.
- **More detailed state machine (bicameral, 20+ states)**: Would be more realistic but pedagogically overwhelming. Users would get lost in procedure rather than learning principles. Rejected for MVP; could be "Advanced Civics" episode.
- **Narrative branching tree (Twine-style)**: Would be more story-driven but less system-focused. Rejected — Essayons teaches systems, not narratives.

### Parameter Effects on Transitions

**Decision**: Five parameters affect guard conditions and consequence calculations:

| Parameter            | Range   | Default | Effects                                                                  |
| -------------------- | ------- | ------- | ------------------------------------------------------------------------ |
| Party Composition    | 0-100%  | 50%     | Determines vote outcomes (% supporting bill). 50% = gridlock.            |
| Public Approval      | 0-100%  | 50%     | Affects presidential veto probability. High approval → less likely veto. |
| Lobbying Pressure    | 0-100%  | 30%     | Affects committee approval. High lobbying → amendments more likely.      |
| Media Coverage       | 0-100%  | 50%     | Scales approval changes. High media → bigger swings.                     |
| Filibuster Threshold | 51-100% | 60%     | Supermajority required for cloture. Historical: 67% pre-1975, 60% now.   |

**Why these parameters**: Each teaches a civics concept:

- **Party Composition** teaches majority rule and gridlock (at 50%).
- **Public Approval** teaches executive branch responsiveness to public opinion.
- **Lobbying Pressure** teaches interest group influence on legislation.
- **Media Coverage** teaches fourth estate effect on public perception.
- **Filibuster Threshold** teaches procedural rules as governance constraints.

**Guard Conditions**:

```
COMMITTEE → FLOOR_DEBATE: requires approval decision AND (random chance influenced by lobbying)
FLOOR_DEBATE → VOTE: requires majority support OR (if filibuster invoked, requires cloture at filibuster threshold)
VOTE → PASSED: requires party composition >= 50% (simple majority)
PASSED → VETOED: probability = (100 - public approval) / 100, president vetoes low-approval bills
OVERRIDE_ATTEMPT → PASSED: requires party composition >= 67% (2/3 majority)
```

**Consequence Calculations**:

```
Committee approval: public_approval += 5 * (media_coverage / 100)
Committee rejection: public_approval -= 10 * (media_coverage / 100)
Floor passage: public_approval += 10 * (media_coverage / 100)
Floor failure: public_approval -= 15 * (media_coverage / 100)
Filibuster invoked: approval -= 5 with opposing party, +5 with own party (polarization effect)
Presidential veto: approval -= 10 if bill had >60% approval, +5 if bill had <40% approval
Override success: approval += 15 (Congress asserts power)
Override failure: approval -= 20 (legislative branch seen as weak)
```

**Why formulas are visible**: Unlike physics equations (which are objective laws), these formulas are simplified models of political dynamics. They are educational abstractions meant to illustrate concepts, not predict real elections. Users should understand they are simplified.

### Guard Conditions as Pure Functions

**Decision**: All guard conditions and consequence calculations are implemented as pure functions: `(state, params) => boolean | newState`. No side effects, no async operations, no randomness except explicitly seeded.

**Why pure functions**: Determinism is critical for educational simulations. If a user makes the same decisions with the same parameters, the outcome must be identical. Pure functions make testing trivial (unit test with fixed inputs) and enable features like undo/replay.

**Randomness handling**: Presidential veto probability is the only random element. Randomness is seeded with a user-visible seed value (default: episode load timestamp). Users can set a fixed seed in sandbox for reproducible scenarios. The seed is displayed in the UI and included in shareable state URLs.

**Alternatives considered**:

- **Stochastic simulation with hidden randomness**: Would make veto behavior unpredictable. Rejected — breaks educational reproducibility.
- **No randomness (deterministic veto based on threshold)**: Would make veto behavior too predictable (always veto if approval < 50%). Rejected — some uncertainty is realistic and teaches that political outcomes are probabilistic.

### Mission Design Philosophy

**Decision**: Missions are sequenced to scaffold learning:

1. **Pass Your First Bill** — teaches the happy path (no veto, no filibuster). Success condition: reach PASSED state via any route.
2. **Survive a Veto** — introduces executive check. Success requires experiencing veto and override. Locks parameters to make veto likely (approval = 35%).
3. **Gridlock** — introduces majority requirement. Locks party composition to 50-50. Success requires navigating amendments or compromise.
4. **The Filibuster** — introduces procedural rules. Success requires invoking filibuster and achieving cloture. Locks parameters to make filibuster viable (composition 55-45).

**Why this sequence**: Each mission introduces one new constraint. Cumulative: by Mission 4, users have seen the full system and can experiment in sandbox with confidence.

**Mission failure is temporary**: All missions allow retry with parameter adjustment hints. Failure messages are encouraging: "The bill died in committee — try increasing lobbying support or amending the bill." Aligns with Essayons brand voice: failure is learning.

**Alternatives considered**:

- **Single "complete all objectives" mission**: Would overwhelm new users. Rejected — scaffolding improves retention.
- **Historical reenactment missions (e.g., "Pass the Civil Rights Act of 1964")**: Would be engaging but requires fixed historical parameters and is less exploratory. Rejected for MVP; could be future "Historical Challenges" mode.

### Canvas Rendering: State Machine Visualization

**Decision**: Render the state machine as a flowchart on Canvas with animated transitions.

**Visual elements**:

- **State nodes**: Rounded rectangles, 120px wide × 60px tall, labeled with state name ("Proposal", "Committee", etc.)
- **Transition arrows**: Bezier curves with directional arrowheads. Labeled with action names ("Approve", "Reject", etc.)
- **Current state highlighting**: Active state node filled with Civics accent #e63946, border thickness 3px. Completed states filled with light gray. Future states outlined in dark gray.
- **Parameter gauges**: Vertical bar charts in sidebar showing party composition (bicolor bar: blue/red split), public approval (green gradient), lobbying (yellow), media (purple). Labels use IBM Plex Mono.
- **Decision history timeline**: Horizontal timeline at bottom showing sequence of decisions as labeled icons. Clicking a past decision highlights the corresponding transition arrow.

**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│  [Parameter Gauges]       [State Machine Flowchart]     │
│  Party: ████░░░░  50%     PROPOSAL → COMMITTEE → ...    │
│  Approval: ██████░ 60%    (Active node highlighted)     │
│  Lobbying: ███░░░░ 30%                                   │
│  Media: ████░░░░░ 45%                                    │
│                                                          │
│  [Decision History Timeline]                             │
│  1. Sent to Committee  2. Approved  3. Called Vote       │
└─────────────────────────────────────────────────────────┘
```

**Transition animations**: When user selects an action:

1. Highlight the transition arrow (accent color, pulsing glow effect)
2. Fade current state node from accent to gray (300ms)
3. Pulse target state node with accent color (200ms)
4. Update parameter gauges with smooth interpolation (500ms)
5. Append decision to timeline with slide-in animation (200ms)

Total animation duration: ~800ms. Not skippable mid-animation to prevent state confusion, but can be disabled entirely via accessibility setting (instant state updates).

**Why Canvas instead of DOM/SVG**: State machine is static structure, but transitions and parameter updates happen frequently (every decision). Canvas provides consistent performance for animated gauges and transition effects. SVG would work but requires more DOM manipulation for animations. Canvas also makes it easier to match the visual style of Orbit Lab (Episode 01), establishing visual consistency across episodes.

**Alternatives considered**:

- **DOM-based flowchart with CSS animations**: More accessible by default (native focus management, text selection). Rejected due to performance concerns with many animated elements and difficulty matching Orbit Lab's Canvas rendering style.
- **Abstract visualization (no flowchart, only status indicators)**: Would be less intuitive. Rejected — seeing the flowchart helps users build a mental model of the legislative process.

### Decision UI Design

**Decision**: Implement decision UI as a React component overlaying (or beside) the canvas, not rendered on canvas.

**Why React for UI**: Decisions are discrete, infrequent (seconds between decisions), and benefit from accessibility features (focus management, screen reader announcements). Canvas is for visualization; React is for interaction. This matches Orbit Lab's pattern: Canvas for simulation, React for controls.

**UI elements**:

- **Available actions**: Large buttons (one per available action) with clear labels ("Send to Committee", "Approve Bill", "Invoke Filibuster"). Keyboard shortcuts: number keys 1-4.
- **Consequence predictions**: Text below each button showing estimated effects: "Public approval +5, Passage chance 70%". Uses color-coded arrows: green up arrow for positive, red down arrow for negative.
- **Decision history panel**: Collapsible panel showing all past decisions with icons and outcome summaries. "1. Sent to Committee → Approved (+5% approval)".
- **Undo button**: Disabled in mission mode, enabled in sandbox. Returns to previous state.

**Layout** (portrait viewport):

```
┌───────────────────────────────┐
│    [Canvas: State Machine]     │
│                                │
│  [Decision Buttons]            │
│  ┌────────────────────────┐   │
│  │ 1. Send to Committee    │   │
│  │ Public approval +5      │   │
│  └────────────────────────┘   │
│  ┌────────────────────────┐   │
│  │ 2. Abandon Bill         │   │
│  │ No effect               │   │
│  └────────────────────────┘   │
└───────────────────────────────┘
```

**Layout** (landscape viewport):

```
┌─────────────────────────────────────────────────┐
│  [Canvas: State Machine]    [Decision Buttons]  │
│                             ┌───────────────┐   │
│                             │ 1. Send to... │   │
│                             │ Approval +5   │   │
│                             └───────────────┘   │
│                             ┌───────────────┐   │
│                             │ 2. Abandon... │   │
│                             └───────────────┘   │
└─────────────────────────────────────────────────┘
```

### Reference Panel Content Strategy

**Decision**: Reference panel contains four sections, each connecting abstract civics concepts to concrete simulation mechanics.

**Sections**:

1. **Separation of Powers** — Explains legislative/executive/judicial branches. Connects to simulation: "In Citizen Lab, you control the legislative branch. The president (executive) can veto your bill. Judicial review is not modeled in this simulation."
2. **How a Bill Becomes a Law** — Flowchart matching the state machine. Explicitly maps: "The state machine you see on screen is a simplified version of this process."
3. **Checks and Balances** — Veto power, override power, committee gatekeeping. Connects to mechanics: "Presidential veto requires 2/3 override — watch the party composition gauge."
4. **The Filibuster** — History of Rule 22, cloture votes, threshold changes. Historical examples: Strom Thurmond 1957 (24 hours), Civil Rights Act 1964 (cloture after 75 days). Connects to mechanics: "In this simulation, filibuster threshold is 60% by default. Try changing it in sandbox to see 67% (pre-1975 rule)."

**Contextual highlighting**: During each mission, the relevant section is highlighted (accent border). E.g., during "Survive a Veto", the "Checks and Balances" section is highlighted.

**Accessibility**: All content is plain HTML (not canvas-rendered) for screen reader access. Equations and flowcharts have alt text. Panel is keyboard-navigable.

## Risks / Trade-offs

### Risk: Oversimplification of legislative process

- **Mitigation**: Reference panel explicitly states this is a simplified model. Educational goal is principles (checks/balances, supermajorities, gridlock), not procedural mastery. Advanced users can explore realistic scenarios (House vs Senate, conference committees) in future episodes.

### Risk: Parameter formulas feel arbitrary

- **Mitigation**: Formulas are documented in reference panel and code comments. Sandbox mode exposes formulas explicitly: "Public approval change = base_change \* (media_coverage / 100)". Users who question formulas are encouraged to experiment in sandbox.

### Risk: Political bias perception

- **Mitigation**: Simulation is nonpartisan — "Democrat" and "Republican" are placeholders for "Majority Party" and "Minority Party". Outcomes depend only on mathematical thresholds (50% majority, 60% cloture, 67% override), not party identity. Reference panel includes historical examples from both parties. UI avoids charged language (no "obstruction", "radical", "moderate" — only "support", "oppose", "compromise").

### Risk: Filibuster mechanics misunderstood

- **Mitigation**: Mission 4 is dedicated to filibuster. Reference panel explains: "Filibuster is not a vote — it is extended debate requiring a cloture vote to end." Historical context (Rule 22, threshold changes) provides grounding. Users who complete Mission 4 have directly experienced the mechanic.

### Trade-off: Single legislative body (not bicameral)

- **Accepted**: Real U.S. process has House and Senate with different rules. Modeling both would double complexity. For MVP, single body abstracts "Congress" as a whole. Future "Advanced Civics" episode could add bicameralism.

### Trade-off: Deterministic vote counts (not individual legislators)

- **Accepted**: Real votes have individual legislators with constituencies, ideologies, and pressures. Abstracting to a single "party composition" percentage simplifies but loses individual agency. Trade-off is acceptable for educational clarity — principles (majority rule, supermajorities) are preserved.

## Migration Plan

Not applicable — this is a greenfield addition. No existing code is modified. The episode is additive to the platform.

**Rollback**: Remove the `src/episodes/citizen-lab/` directory and any route/navigation entries pointing to it. The simulation engine and platform are unaffected.

## Open Questions

1. **Presidential veto probability formula**: Currently `(100 - public_approval) / 100`. Is this too predictable? Should there be a base probability (e.g., 20% + ...) to ensure veto is always possible even at high approval?
2. **Amendment mechanics**: How should "Amend" action in committee affect the bill? Options: (a) Amend increases passage chance but decreases approval (compromise), (b) Amend resets bill to PROPOSAL (restart), (c) Amend is purely cosmetic (relabel). Needs playtesting.
3. **Gridlock mission difficulty**: Is 50-50 split solvable without extreme lobbying pressure or unrealistic parameter tweaks? May need to provide hints: "Try increasing lobbying to 70%+ or amending the bill."
4. **Historical scenarios**: Should sandbox include preset scenarios (e.g., "Civil Rights Act 1964: 60% support, high filibuster risk")? Would increase engagement but requires historical research. Deferring to post-MVP.
5. **Sound effects**: Should decisions have audio feedback (gavel sound for vote, applause for passage)? PRD does not mention audio. Deferring to future enhancement or cross-episode audio system.
