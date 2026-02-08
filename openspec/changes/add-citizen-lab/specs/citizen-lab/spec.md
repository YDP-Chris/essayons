## ADDED Requirements

### Requirement: Legislative State Machine

The system SHALL implement a finite state machine representing the U.S. federal legislative process with seven states: PROPOSAL, COMMITTEE, FLOOR_DEBATE, VOTE, PASSED, VETOED, and OVERRIDE_ATTEMPT. The system SHALL transition between states only in response to user-initiated decision events (event-driven mode). The system SHALL maintain a transition map defining valid state transitions and SHALL reject invalid transitions. The system SHALL store bill metadata (title, description, state history) throughout the legislative lifecycle.

#### Scenario: Valid state transitions

- **WHEN** the state machine is in PROPOSAL state AND the user selects "Send to Committee" action
- **THEN** the system SHALL transition to COMMITTEE state and record the transition in the bill's state history

#### Scenario: Invalid transition rejection

- **WHEN** the state machine is in PROPOSAL state AND the user attempts to transition directly to VOTE state
- **THEN** the system SHALL reject the transition and display an error message indicating the transition is not valid

#### Scenario: State history tracking

- **WHEN** a bill transitions through multiple states (PROPOSAL → COMMITTEE → FLOOR_DEBATE → VOTE → PASSED)
- **THEN** the system SHALL maintain a history of all state transitions with timestamps and SHALL allow users to review the history in the decision history panel

#### Scenario: Bill metadata persistence

- **WHEN** a bill is created in PROPOSAL state with title "Infrastructure Investment Act" and description "Modernize roads and bridges"
- **THEN** the title and description SHALL persist through all state transitions and SHALL be displayed in the UI at all times

### Requirement: State Transition Guard Conditions

The system SHALL evaluate guard conditions before allowing state transitions. The system SHALL block the transition from COMMITTEE to FLOOR_DEBATE unless the committee approval action has been selected. The system SHALL block the transition from FLOOR_DEBATE to VOTE if filibuster is active and cloture has not been achieved (requires support at or above filibuster threshold). The system SHALL automatically transition from VOTE to PASSED if party composition is at or above 50% (simple majority). The system SHALL automatically transition from VOTE to FAILED if party composition is below 50%. The system SHALL automatically trigger presidential action (signature or veto) when transitioning from VOTE to PASSED, with veto probability calculated as (100 - public_approval) / 100.

#### Scenario: Committee approval required

- **WHEN** the state machine is in COMMITTEE state AND the user attempts to transition to FLOOR_DEBATE without selecting "Approve" or "Amend" action
- **THEN** the system SHALL block the transition and display a message indicating committee approval is required

#### Scenario: Floor vote with simple majority

- **WHEN** the state machine is in VOTE state AND party composition parameter is 55% AND filibuster is not active
- **THEN** the system SHALL automatically transition to PASSED state because the simple majority requirement (>=50%) is met

#### Scenario: Floor vote without majority fails

- **WHEN** the state machine is in VOTE state AND party composition parameter is 48% AND filibuster is not active
- **THEN** the system SHALL transition to a FAILED state and the mission SHALL detect the failure

#### Scenario: Filibuster blocks vote without cloture

- **WHEN** the state machine is in FLOOR_DEBATE state AND filibuster has been invoked AND party composition is 58% AND filibuster threshold is 60%
- **THEN** the system SHALL block the transition to VOTE state and SHALL display a message indicating cloture vote (60% threshold) is required to proceed

#### Scenario: Cloture achieved allows vote

- **WHEN** the state machine is in FLOOR_DEBATE state AND filibuster has been invoked AND party composition is 62% AND filibuster threshold is 60%
- **THEN** the system SHALL allow the transition to VOTE state because the cloture threshold has been met

#### Scenario: Presidential veto based on approval

- **WHEN** a bill reaches PASSED state AND public approval parameter is 30%
- **THEN** the system SHALL have a 70% probability of automatically transitioning to VETOED state (veto probability = (100-30)/100 = 0.7)

#### Scenario: Presidential signature with high approval

- **WHEN** a bill reaches PASSED state AND public approval parameter is 80%
- **THEN** the system SHALL have a 20% probability of veto and SHALL likely remain in PASSED state (bill signed into law)

#### Scenario: Veto override requires supermajority

- **WHEN** the state machine is in OVERRIDE_ATTEMPT state AND party composition is 67% or higher
- **THEN** the system SHALL transition back to PASSED state (override successful, bill becomes law despite veto)

#### Scenario: Veto override fails without supermajority

- **WHEN** the state machine is in OVERRIDE_ATTEMPT state AND party composition is 65%
- **THEN** the system SHALL transition to a FAILED state (override failed, bill is dead)

### Requirement: Civics Parameters

The system SHALL provide five adjustable parameters affecting state transitions and consequences: party composition (0-100%, default 50%), public approval rating (0-100%, default 50%), lobbying pressure (0-100%, default 30%), media coverage level (0-100%, default 50%), and filibuster threshold (51-100%, default 60%). All parameters SHALL be registered with the simulation engine's parameter system and SHALL be adjustable via real-time UI controls. Parameter changes SHALL take effect immediately on the next decision or guard condition evaluation. In mission mode, certain parameters MAY be locked to specific values to create learning scenarios.

#### Scenario: Party composition affects vote outcomes

- **WHEN** party composition is set to 70% AND a floor vote is called
- **THEN** the vote SHALL pass because 70% exceeds the simple majority requirement of 50%

#### Scenario: Public approval affects veto probability

- **WHEN** public approval is set to 90% AND a bill reaches PASSED state
- **THEN** the presidential veto probability SHALL be 10% (calculated as (100-90)/100)

#### Scenario: Lobbying pressure affects committee decisions

- **WHEN** lobbying pressure is set to 80% AND the bill is in COMMITTEE state
- **THEN** the probability of committee approval SHALL increase and amendments SHALL be more likely to be accepted

#### Scenario: Media coverage scales consequence magnitude

- **WHEN** media coverage is set to 100% AND a floor vote passes
- **THEN** the public approval change SHALL be amplified to the maximum amount (base_change \* 1.0)

#### Scenario: Filibuster threshold affects cloture requirement

- **WHEN** filibuster threshold is set to 67% (historical pre-1975 value) AND filibuster is invoked
- **THEN** the system SHALL require party composition of at least 67% to achieve cloture and proceed to vote

#### Scenario: Parameter bounds enforcement

- **WHEN** the user attempts to set party composition to 120%
- **THEN** the system SHALL clamp the value to 100% (maximum bound)

#### Scenario: Parameter locking in mission mode

- **WHEN** the "Gridlock" mission is active
- **THEN** the party composition parameter SHALL be locked to 50% and SHALL not be adjustable by the user

### Requirement: Consequence Feedback System

The system SHALL calculate and display consequence feedback for each decision, showing predicted and actual effects on public approval, party support, and legislative outcomes. The system SHALL apply consequence formulas when decisions are made: committee approval increases public approval by (5 _ media_coverage / 100), committee rejection decreases approval by (10 _ media_coverage / 100), floor vote passage increases approval by (10 _ media_coverage / 100), floor vote failure decreases approval by (15 _ media_coverage / 100), filibuster invocation decreases approval with opposing party by 5, presidential veto decreases approval by 10 if bill had approval >60%, and override success increases approval by 15. Public approval SHALL be clamped to the range [0, 100].

#### Scenario: Committee approval consequence

- **WHEN** the user selects "Approve" in COMMITTEE state AND media coverage is 50%
- **THEN** public approval SHALL increase by 2.5 points (5 \* 50 / 100 = 2.5) and the consequence SHALL be displayed as "+2.5% approval"

#### Scenario: Floor vote passage consequence

- **WHEN** a floor vote passes AND media coverage is 80%
- **THEN** public approval SHALL increase by 8 points (10 \* 80 / 100 = 8.0) and the consequence SHALL be displayed as "+8% approval"

#### Scenario: Floor vote failure consequence

- **WHEN** a floor vote fails AND media coverage is 60%
- **THEN** public approval SHALL decrease by 9 points (15 \* 60 / 100 = 9.0) and the consequence SHALL be displayed as "-9% approval"

#### Scenario: Filibuster polarization effect

- **WHEN** filibuster is invoked in FLOOR_DEBATE state
- **THEN** public approval SHALL decrease by 5 points with the opposing party AND increase by 5 points with the invoking party (polarization effect)

#### Scenario: Presidential veto of popular bill

- **WHEN** a bill with public approval of 70% is vetoed by the president
- **THEN** public approval of the president SHALL decrease by 10 points

#### Scenario: Presidential veto of unpopular bill

- **WHEN** a bill with public approval of 35% is vetoed by the president
- **THEN** public approval of the president SHALL increase by 5 points

#### Scenario: Veto override success consequence

- **WHEN** a veto override vote succeeds with 68% party composition
- **THEN** public approval SHALL increase by 15 points (Congress asserts power over executive)

#### Scenario: Approval bounds enforcement

- **WHEN** public approval is at 95% AND a consequence would increase it by 8 points
- **THEN** public approval SHALL be clamped to 100% (not 103%)

#### Scenario: Predicted vs actual consequences

- **WHEN** the user hovers over the "Approve" button in COMMITTEE state
- **THEN** the UI SHALL display the predicted consequence "Public approval +2.5, Passage chance 70%" before the decision is made

### Requirement: Mission Pass Your First Bill

The system SHALL provide a "Pass Your First Bill" mission that challenges the user to navigate a bill through the complete legislative process to the PASSED state. The mission SHALL evaluate success when the bill reaches PASSED state via any valid path (direct passage or veto override). The mission SHALL detect failure when the bill is rejected in committee, fails a floor vote, is vetoed without override attempt, or override attempt fails. The mission SHALL provide a briefing explaining the goal and success/failure criteria before the user begins.

#### Scenario: Successful passage without veto

- **WHEN** the user navigates a bill through PROPOSAL → COMMITTEE → FLOOR_DEBATE → VOTE → PASSED without veto
- **THEN** the mission SHALL transition to SUCCESS state and display a congratulatory message

#### Scenario: Successful passage after veto override

- **WHEN** the user navigates a bill through PROPOSAL → COMMITTEE → FLOOR_DEBATE → VOTE → PASSED → VETOED → OVERRIDE_ATTEMPT → PASSED
- **THEN** the mission SHALL transition to SUCCESS state and display a congratulatory message

#### Scenario: Failure due to committee rejection

- **WHEN** the user selects "Reject" action in COMMITTEE state
- **THEN** the mission SHALL transition to FAILED state and display an encouraging message suggesting to adjust lobbying or amend the bill

#### Scenario: Failure due to floor vote failure

- **WHEN** party composition is 45% AND a floor vote is called
- **THEN** the vote SHALL fail and the mission SHALL transition to FAILED state with a message suggesting to increase party support

#### Scenario: Failure due to veto without override

- **WHEN** the bill is vetoed AND the user selects "Accept Veto" action
- **THEN** the mission SHALL transition to FAILED state with a message explaining that the veto was not overridden

#### Scenario: Mission briefing display

- **WHEN** the user selects the "Pass Your First Bill" mission
- **THEN** the system SHALL display a briefing screen explaining "Your goal: Navigate a bill through the legislative process to passage" and list the states the bill must traverse

### Requirement: Mission Survive a Veto

The system SHALL provide a "Survive a Veto" mission that challenges the user to pass a bill, experience a presidential veto, and successfully override the veto. The mission SHALL lock public approval parameter to a value that makes veto likely (default 35%). The mission SHALL evaluate success only when the bill reaches PASSED state via the veto override path (PASSED → VETOED → OVERRIDE_ATTEMPT → PASSED). The mission SHALL detect failure if the bill fails before reaching the initial PASSED state, or if the override attempt fails. The mission SHALL provide a briefing explaining presidential veto power and the 2/3 override requirement.

#### Scenario: Successful veto override path

- **WHEN** the user navigates a bill to PASSED state, the bill is vetoed, and the override vote succeeds with 68% party composition
- **THEN** the mission SHALL transition to SUCCESS state and display a congratulatory message explaining that Congress asserted its power

#### Scenario: Failure if bill never reaches initial passage

- **WHEN** the bill fails a floor vote before reaching the initial PASSED state
- **THEN** the mission SHALL transition to FAILED state with a message suggesting to focus on passing the bill first

#### Scenario: Failure if override vote fails

- **WHEN** the bill is vetoed AND the override vote has only 64% support (below 67% requirement)
- **THEN** the override SHALL fail and the mission SHALL transition to FAILED state with a message explaining that 2/3 majority was not achieved

#### Scenario: Mission locks public approval parameter

- **WHEN** the "Survive a Veto" mission is active
- **THEN** the public approval parameter SHALL be locked to 35% and SHALL not be adjustable by the user

#### Scenario: Mission briefing for veto mechanics

- **WHEN** the user selects the "Survive a Veto" mission
- **THEN** the system SHALL display a briefing explaining "The president can veto bills. Congress can override with a 2/3 majority" with historical examples

### Requirement: Mission Gridlock

The system SHALL provide a "Gridlock" mission that simulates legislative deadlock by locking party composition to 50-50 and challenging the user to find compromise solutions. The mission SHALL evaluate success when the user experiences at least one failed floor vote due to lack of majority and then successfully passes a bill via amendment or increased lobbying. The mission SHALL detect failure if the user abandons the bill or exhausts a configured number of attempts without finding a compromise path. The mission SHALL provide a briefing explaining political gridlock and compromise strategies.

#### Scenario: Gridlock detected with 50-50 split

- **WHEN** party composition is locked at 50% AND a floor vote is called
- **THEN** the vote SHALL fail due to lack of majority (50% does not meet >= 50% simple majority in a tie-breaking scenario) OR the system SHALL implement a tie-breaking rule

#### Scenario: Successful compromise via amendment

- **WHEN** the user experiences a failed floor vote AND returns to COMMITTEE to select "Amend" action AND lobbying pressure is increased to 70%
- **THEN** the amended bill SHALL achieve sufficient support to pass on the next vote and the mission SHALL transition to SUCCESS state

#### Scenario: Mission locks party composition

- **WHEN** the "Gridlock" mission is active
- **THEN** the party composition parameter SHALL be locked to 50% and SHALL not be adjustable by the user

#### Scenario: Mission briefing for gridlock

- **WHEN** the user selects the "Gridlock" mission
- **THEN** the system SHALL display a briefing explaining "When parties are evenly split, finding compromise is essential" with suggestions for amendments or coalition-building

#### Scenario: Failure after excessive attempts

- **WHEN** the user fails to pass the bill after 5 floor vote attempts in Gridlock mission
- **THEN** the mission SHALL transition to FAILED state and suggest trying sandbox mode to experiment with parameters

### Requirement: Mission The Filibuster

The system SHALL provide a "The Filibuster" mission that teaches filibuster mechanics by requiring the user to invoke filibuster to block a vote and then achieve cloture to proceed. The mission SHALL lock parameters to create a scenario where filibuster is viable (party composition 55%, filibuster threshold 60%). The mission SHALL evaluate success when the user invokes filibuster during FLOOR_DEBATE, experiences the vote being blocked, and then achieves cloture (60% support) to proceed to vote. The mission SHALL provide a briefing explaining filibuster history, Rule 22, and cloture requirements with historical examples.

#### Scenario: Filibuster invoked blocks vote

- **WHEN** the user selects "Invoke Filibuster" action in FLOOR_DEBATE state AND party composition is 55%
- **THEN** the transition to VOTE state SHALL be blocked and the system SHALL display a message "Filibuster active. Cloture vote (60% required) needed to proceed."

#### Scenario: Cloture achieved allows vote

- **WHEN** filibuster is active AND the user increases party composition to 62% (via lobbying or amendments)
- **THEN** cloture SHALL be achieved and the transition to VOTE state SHALL be allowed

#### Scenario: Mission locks parameters for filibuster scenario

- **WHEN** the "The Filibuster" mission is active
- **THEN** party composition SHALL be locked to 55% initially and filibuster threshold SHALL be locked to 60%

#### Scenario: Mission briefing for filibuster

- **WHEN** the user selects "The Filibuster" mission
- **THEN** the system SHALL display a briefing explaining "Filibuster is extended debate requiring a supermajority cloture vote to end" with historical examples (Strom Thurmond 1957, Civil Rights Act 1964)

#### Scenario: Successful completion of filibuster mission

- **WHEN** the user invokes filibuster, increases support to 62%, achieves cloture, and passes the floor vote
- **THEN** the mission SHALL transition to SUCCESS state and display a congratulatory message explaining the role of procedural rules in governance

### Requirement: Sandbox Mode

The system SHALL provide a sandbox mode in which all simulation parameters are unlocked and adjustable, no mission objectives are active, and the user can freely explore the state machine. The sandbox SHALL allow the user to adjust party composition, public approval, lobbying pressure, media coverage, and filibuster threshold without constraints. The sandbox SHALL provide unlimited undo functionality allowing navigation through decision history. The sandbox SHALL provide a reset control to restart the legislative process with current parameter values preserved.

#### Scenario: Entering sandbox mode

- **WHEN** the user selects sandbox mode
- **THEN** all parameter constraints SHALL be removed, no mission condition checks SHALL execute, and all parameters SHALL be adjustable without locks

#### Scenario: Unlimited undo in sandbox

- **WHEN** the user makes 10 decisions in sandbox mode AND selects "Undo" 3 times
- **THEN** the state machine SHALL revert to the state 3 decisions ago and the decision history SHALL reflect the current position

#### Scenario: Reset in sandbox preserves parameters

- **WHEN** the user adjusts party composition to 75% in sandbox mode AND selects "Reset"
- **THEN** the state machine SHALL return to PROPOSAL state but party composition SHALL remain at 75%

#### Scenario: Override presidential veto probability

- **WHEN** the user is in sandbox mode
- **THEN** the system SHALL expose a "Presidential Veto Probability Override" parameter allowing the user to set a fixed veto probability (0-100%) instead of the approval-based formula

#### Scenario: No mission failure in sandbox

- **WHEN** a bill fails multiple floor votes in sandbox mode
- **THEN** no failure message SHALL be displayed and the user SHALL be able to continue exploring without restarting

### Requirement: Decision UI Component

The system SHALL provide a React-based decision UI component displaying available actions as clearly labeled buttons with predicted consequences. The system SHALL display consequence predictions showing estimated public approval changes, passage probability percentages, and party reaction indicators using color-coded arrows (green up for positive, red down for negative). The system SHALL display a decision history panel showing all past decisions with icons and outcome summaries. The system SHALL provide keyboard accessibility: actions SHALL be selectable via number keys (1-4), navigable via arrow keys, and confirmable via Enter key. The system SHALL apply the Civics accent color #e63946 to active elements, decision buttons, and consequence highlights.

#### Scenario: Available actions displayed

- **WHEN** the state machine is in COMMITTEE state
- **THEN** the decision UI SHALL display three buttons: "1. Approve", "2. Amend", "3. Reject"

#### Scenario: Consequence predictions shown

- **WHEN** the user hovers over the "Approve" button in COMMITTEE state
- **THEN** the UI SHALL display "Public approval +2.5, Passage chance 75%" with a green up arrow next to the approval value

#### Scenario: Decision history panel

- **WHEN** the user has made 4 decisions (Sent to Committee, Approved, Called Vote, Passed)
- **THEN** the decision history panel SHALL display all 4 decisions in chronological order with icons and outcome text (e.g., "Approved → +2.5% approval")

#### Scenario: Keyboard accessibility for actions

- **WHEN** the decision UI displays 3 available actions AND the user presses the "2" key
- **THEN** the second action SHALL be selected and executed (equivalent to clicking the button)

#### Scenario: Undo button state in mission mode

- **WHEN** a mission is active
- **THEN** the "Undo" button SHALL be disabled and grayed out

#### Scenario: Undo button state in sandbox mode

- **WHEN** sandbox mode is active AND the user has made at least one decision
- **THEN** the "Undo" button SHALL be enabled and clicking it SHALL revert to the previous state

#### Scenario: Accent color applied

- **WHEN** the decision UI is rendered
- **THEN** active decision buttons SHALL use the Civics accent color #e63946 for borders or highlights, and consequence indicators SHALL use green (positive) or red (negative) with the accent color for neutral states

### Requirement: Reference Panel

The system SHALL provide a collapsible reference panel as an accessible DOM-based React component displaying four educational sections: Separation of Powers, How a Bill Becomes a Law, Checks and Balances, and The Filibuster. Each section SHALL include plain-language explanations, relevant formulas or thresholds, and connections to observable simulation mechanics. The panel SHALL use Instrument Serif for headings, DM Sans for body text, and IBM Plex Mono for numerical thresholds, with the Civics accent color #e63946 for highlights. The panel SHALL implement contextual highlighting: the section most relevant to the current mission SHALL be visually highlighted with an accent border.

#### Scenario: Viewing Separation of Powers section

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display the "Separation of Powers" section explaining legislative, executive, and judicial branches with a note connecting to simulation mechanics: "In Citizen Lab, you control the legislative branch. The president can veto your bill."

#### Scenario: Viewing How a Bill Becomes a Law section

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display a flowchart description matching the state machine (PROPOSAL → COMMITTEE → FLOOR_DEBATE → VOTE → PASSED) and SHALL note "This is a simplified version of the full U.S. legislative process."

#### Scenario: Viewing Checks and Balances section

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display explanations of presidential veto power (requires 2/3 override) and committee gatekeeping with formulas: "Override requires party composition >= 67%"

#### Scenario: Viewing The Filibuster section

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display filibuster history (Rule 22, threshold changes: 67% pre-1975, 60% since 1975) with historical examples (Strom Thurmond 1957, Civil Rights Act 1964)

#### Scenario: Contextual highlighting during mission

- **WHEN** the "Survive a Veto" mission is active
- **THEN** the "Checks and Balances" section SHALL be highlighted with an accent border (color #e63946) to draw attention to veto mechanics

#### Scenario: Accessibility of reference panel

- **WHEN** a screen reader user navigates to the reference panel
- **THEN** all text content SHALL be accessible, formulas SHALL have appropriate aria labels (e.g., "Two-thirds majority required for override"), and the panel SHALL be navigable via keyboard (Tab, arrow keys)

### Requirement: Visual Rendering State Machine Diagram

The system SHALL render the legislative state machine on an HTML5 Canvas element as a flowchart with nodes representing states and arrows representing transitions. State nodes SHALL be rendered as rounded rectangles (120px × 60px) labeled with state names. Transition arrows SHALL be rendered as Bezier curves with directional arrowheads and labeled with action names. The current state SHALL be highlighted with the Civics accent color #e63946 and a 3px border. Completed states SHALL be filled with light gray. Future states SHALL be outlined in dark gray. The system SHALL render parameter gauges as vertical bar charts showing party composition (bicolor blue/red split), public approval (green gradient), lobbying (yellow), and media (purple). The system SHALL render a decision history timeline as a horizontal timeline with labeled icons for each past decision.

#### Scenario: State nodes rendered

- **WHEN** the simulation canvas is drawn
- **THEN** all 7 state nodes (PROPOSAL, COMMITTEE, FLOOR_DEBATE, VOTE, PASSED, VETOED, OVERRIDE_ATTEMPT) SHALL be rendered as rounded rectangles with state name labels centered inside

#### Scenario: Current state highlighting

- **WHEN** the state machine is in COMMITTEE state
- **THEN** the COMMITTEE node SHALL be filled with Civics accent color #e63946 with a 3px border, while PROPOSAL (completed) SHALL be filled with light gray, and future states SHALL be outlined in dark gray

#### Scenario: Transition arrows rendered

- **WHEN** the canvas is drawn
- **THEN** arrows SHALL connect PROPOSAL to COMMITTEE, COMMITTEE to FLOOR_DEBATE, FLOOR_DEBATE to VOTE, VOTE to PASSED, PASSED to VETOED, and VETOED to OVERRIDE_ATTEMPT, each with directional arrowheads

#### Scenario: Transition arrow labels

- **WHEN** the canvas is drawn
- **THEN** the arrow from PROPOSAL to COMMITTEE SHALL be labeled "Send to Committee", the arrow from COMMITTEE to FLOOR_DEBATE SHALL be labeled "Approve", etc.

#### Scenario: Parameter gauges rendered

- **WHEN** party composition is 60%, public approval is 70%, lobbying is 40%, and media is 50%
- **THEN** the sidebar SHALL display 4 vertical bar charts with labels: "Party: 60%" (bar split 60% blue, 40% red), "Approval: 70%" (green bar at 70%), "Lobbying: 40%" (yellow bar at 40%), "Media: 50%" (purple bar at 50%)

#### Scenario: Decision history timeline rendered

- **WHEN** the user has made 3 decisions (Sent to Committee, Approved, Called Vote)
- **THEN** the bottom of the canvas SHALL display a horizontal timeline with 3 labeled icons showing "1. Sent to Committee", "2. Approved", "3. Called Vote"

#### Scenario: Timeline decision clickable

- **WHEN** the user clicks on "1. Sent to Committee" in the decision history timeline
- **THEN** the corresponding transition arrow (PROPOSAL → COMMITTEE) SHALL be highlighted temporarily (pulsing glow effect)

### Requirement: Visual Rendering Transition Animations

The system SHALL render animated transitions when the state machine changes state. When a user selects an action, the system SHALL highlight the transition arrow with a pulsing glow effect (300ms), fade the current state node from accent color to gray (300ms), pulse the target state node with accent color (200ms), animate parameter gauge changes with smooth interpolation (500ms), and append the decision to the timeline with a slide-in animation (200ms). Total animation duration SHALL be approximately 800ms. Animations SHALL not be skippable mid-animation to prevent state confusion, but SHALL be disableable entirely via an accessibility setting (instant state updates).

#### Scenario: Transition animation sequence

- **WHEN** the user selects "Approve" action in COMMITTEE state
- **THEN** the arrow from COMMITTEE to FLOOR_DEBATE SHALL highlight with a pulsing glow (300ms), the COMMITTEE node SHALL fade from #e63946 to light gray (300ms), the FLOOR_DEBATE node SHALL pulse with #e63946 (200ms), and the decision SHALL appear in the timeline with a slide-in effect (200ms)

#### Scenario: Parameter gauge animation

- **WHEN** a decision changes public approval from 50% to 58%
- **THEN** the approval gauge bar SHALL smoothly interpolate from 50% height to 58% height over 500ms

#### Scenario: Consequence feedback animation

- **WHEN** a decision increases public approval by 8 points
- **THEN** a green upward arrow SHALL appear next to the approval gauge and animate upward (200ms) before fading out

#### Scenario: Disabling animations for accessibility

- **WHEN** the user enables "Reduce motion" in accessibility settings
- **THEN** all transition animations SHALL be disabled and state changes SHALL update instantly without interpolation

#### Scenario: Animation total duration

- **WHEN** any state transition occurs
- **THEN** the total animation sequence SHALL complete within 1000ms (1 second) to maintain engagement without causing delays

### Requirement: Episode Configuration and Integration

The system SHALL configure Citizen Lab as an event-driven episode with `mode: 'event-driven'` in the `EpisodeDefinition` interface. The system SHALL implement the `onEvent(state, event)` lifecycle hook to process user decisions and return updated state. The system SHALL implement the `getAvailableActions(state)` lifecycle hook to return valid actions based on current state and guard conditions. The system SHALL register with the episode factory or routing system so Citizen Lab appears in the episode list. The system SHALL apply episode metadata: title "Citizen Lab", domain "Civics", accent color #e63946, and description "Run a democracy. See what breaks."

#### Scenario: Event-driven mode configuration

- **WHEN** Citizen Lab episode is loaded by the simulation engine
- **THEN** the engine SHALL recognize `mode: 'event-driven'` and SHALL not start a continuous physics loop

#### Scenario: onEvent lifecycle hook

- **WHEN** the user selects the "Approve" action in COMMITTEE state
- **THEN** the `onEvent(state, {type: 'APPROVE'})` hook SHALL be called, returning a new state with transition to FLOOR_DEBATE and updated approval rating

#### Scenario: getAvailableActions lifecycle hook

- **WHEN** the state machine is in COMMITTEE state
- **THEN** the `getAvailableActions(state)` hook SHALL return an array of actions: [{id: 'approve', label: 'Approve'}, {id: 'amend', label: 'Amend'}, {id: 'reject', label: 'Reject'}]

#### Scenario: Episode appears in episode list

- **WHEN** the user navigates to the episode selection screen
- **THEN** Citizen Lab SHALL appear in the list with title "Citizen Lab", domain label "Civics", accent color #e63946, and description "Run a democracy. See what breaks."

#### Scenario: Episode metadata applied

- **WHEN** Citizen Lab episode is loaded
- **THEN** the UI SHALL apply the Civics accent color #e63946 to all episode-specific UI elements (state node highlights, decision buttons, consequence indicators)

#### Scenario: Episode load performance

- **WHEN** the user selects Citizen Lab from the episode list
- **THEN** the episode SHALL load and display the initial state within 3 seconds on a simulated 3G connection

### Requirement: Deterministic Behavior and Reproducibility

The system SHALL ensure deterministic behavior for all state transitions and consequence calculations given the same initial parameters and decision sequence. The system SHALL use a seeded random number generator for presidential veto probability, with the seed displayed in the UI and included in shareable state. The system SHALL allow users to set a fixed seed in sandbox mode for reproducible scenarios. The system SHALL provide a "Share State" feature that encodes current state, parameters, decision history, and seed into a URL or JSON object that can be shared and loaded by other users.

#### Scenario: Deterministic transitions with fixed parameters

- **WHEN** two users load Citizen Lab with the same parameter values AND make the same sequence of decisions
- **THEN** both users SHALL experience identical state transitions, consequence calculations, and outcomes (including veto probability, assuming same seed)

#### Scenario: Seeded random number generator

- **WHEN** the presidential veto probability is calculated with seed "12345" AND public approval is 40%
- **THEN** the veto outcome SHALL be deterministic (same seed + same approval always produces same veto/no-veto result)

#### Scenario: Seed displayed in UI

- **WHEN** the user is in sandbox mode
- **THEN** the current RNG seed SHALL be displayed in the parameter panel (e.g., "Seed: 67890") and SHALL be editable

#### Scenario: Share state feature

- **WHEN** the user selects "Share State" in sandbox mode
- **THEN** the system SHALL generate a URL containing encoded state, parameters, decision history, and seed, and SHALL copy it to clipboard

#### Scenario: Load shared state

- **WHEN** a user visits a URL containing encoded state (e.g., example.com/citizen-lab?state=...)
- **THEN** the episode SHALL load with the exact state, parameters, decision history, and seed from the URL, allowing the recipient to continue from that point or review the scenario
