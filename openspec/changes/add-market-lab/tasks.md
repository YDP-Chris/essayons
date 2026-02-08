## 1. Foundation and Constants

- [ ] 1.1 Define TypeScript interfaces for market state (buyers, sellers, price, quantity, surplus), agent state (WTP/cost, traded status), and transaction records in `types.ts`
- [ ] 1.2 Define economic constants (default agent counts, distribution parameters, intervention ranges, welfare metric thresholds) and mission threshold constants in `constants.ts`
- [ ] 1.3 Create `MarketLabEpisode.ts` entry point that instantiates DiscreteEngine with market-specific configuration and registers all subsystems

## 2. Agent Model

- [ ] 2.1 Implement buyer agent class with willingness-to-pay property, traded flag, and surplus calculation method
- [ ] 2.2 Implement seller agent class with production cost property, traded flag, and surplus calculation method
- [ ] 2.3 Implement agent population generator: sample WTP/cost values from configurable distributions (uniform, normal) with mean and variance parameters
- [ ] 2.4 Implement agent preference distributions: uniform distribution for linear curves, normal distribution for curved demand/supply
- [ ] 2.5 Write unit tests: verify WTP/cost sampling produces expected distributions; verify agent surplus calculations

## 3. Price Discovery and Market Clearing

- [ ] 3.1 Implement double-auction clearing algorithm: sort buyers descending by WTP, sellers ascending by cost, find intersection
- [ ] 3.2 Implement clearing price calculation using midpoint rule: price = (marginal_buyer_WTP + marginal_seller_cost) / 2
- [ ] 3.3 Implement transaction matching: pair buyers with WTP ≥ price with sellers with cost ≤ price, mark as traded
- [ ] 3.4 Implement tie-breaking: shuffle agents before sorting to randomize which agents trade when multiple have identical preferences
- [ ] 3.5 Implement edge case handling: no trades possible (all buyers' WTP < all sellers' costs), perfect market clearing
- [ ] 3.6 Write unit tests: verify clearing price for known distributions (e.g., 50 buyers with WTP=100, 50 sellers with cost=50 → price=75); verify quantity traded; verify all traded buyers have WTP ≥ price and all traded sellers have cost ≤ price

## 4. Supply and Demand Curves

- [ ] 4.1 Implement demand curve generation: sort buyers by WTP descending, plot as step function (quantity on X, price on Y)
- [ ] 4.2 Implement supply curve generation: sort sellers by cost ascending, plot as step function
- [ ] 4.3 Implement curve smoothing (optional): apply cubic spline interpolation for visual appeal while preserving economic accuracy
- [ ] 4.4 Implement equilibrium point calculation: find intersection of supply and demand curves (quantity where WTP = cost)
- [ ] 4.5 Implement curve shifting for policy interventions: tax shifts supply up by T, subsidy shifts supply down by S
- [ ] 4.6 Write unit tests: verify demand curve slopes downward (quantity decreases as price increases); verify supply curve slopes upward; verify equilibrium calculation matches analytical solution for uniform distributions

## 5. Policy Interventions

- [ ] 5.1 Implement price floor enforcement: if clearing price < floor, set price = floor, recompute quantity traded at floor price
- [ ] 5.2 Implement price ceiling enforcement: if clearing price > ceiling, set price = ceiling, recompute quantity traded at ceiling price
- [ ] 5.3 Implement per-unit tax: shift supply curve up by tax amount, recompute equilibrium with higher seller cost
- [ ] 5.4 Implement per-unit subsidy: shift supply curve down by subsidy amount, recompute equilibrium with lower seller cost
- [ ] 5.5 Implement surplus/shortage calculation: surplus = Q_supplied - Q_demanded when price floor binding, shortage = Q_demanded - Q_supplied when price ceiling binding
- [ ] 5.6 Write unit tests: verify binding price floor creates surplus; verify binding ceiling creates shortage; verify non-binding floor/ceiling have no effect; verify tax reduces quantity traded and raises buyer price

## 6. Welfare Metrics and Telemetry

- [ ] 6.1 Implement consumer surplus calculation: sum of (WTP - price) for all buyers who traded
- [ ] 6.2 Implement producer surplus calculation: sum of (price - cost) for all sellers who traded
- [ ] 6.3 Implement total surplus calculation: consumer surplus + producer surplus
- [ ] 6.4 Implement deadweight loss calculation: (baseline free-market surplus) - (current total surplus with interventions)
- [ ] 6.5 Implement market efficiency metric: (total surplus / max possible surplus) × 100
- [ ] 6.6 Implement telemetry computation module that calculates all welfare metrics, price, quantity traded, surplus/shortage each step
- [ ] 6.7 Implement telemetry overlay rendering on Canvas: monospace font (IBM Plex Mono), positioned top-right, values update after each step
- [ ] 6.8 Implement value formatting: price as `$XX.XX`, surplus/deadweight loss as `$XXX.XX`, efficiency as `XX.X%`, surplus/shortage as signed integer
- [ ] 6.9 Apply Economics accent color #2a9d8f to telemetry labels and key values
- [ ] 6.10 Write unit tests: verify welfare calculations match analytical formulas for known scenarios (e.g., 100 buyers WTP=100, 100 sellers cost=50 → CS=2500, PS=2500, total=5000); verify deadweight loss is zero at free-market equilibrium

## 7. Step Function Implementation

- [ ] 7.1 Implement `step(state, stepIndex)` function: compute demand/supply curves, apply interventions, find clearing price, execute transactions, compute welfare, update agent states, return new state
- [ ] 7.2 Implement `canStep(state)` check: return false when mission is complete or user-defined stop condition met; return true in sandbox mode
- [ ] 7.3 Implement state initialization: `createInitialState()` generates initial agent populations, sets default parameters (no interventions), computes baseline equilibrium
- [ ] 7.4 Implement step history tracking: store full market state snapshot after each step (agent arrays, transaction records, telemetry, parameters)
- [ ] 7.5 Write unit tests: verify step function produces deterministic output for fixed parameters; verify state transitions are correct; verify step history stores accurate snapshots

## 8. Mission: Find Equilibrium

- [ ] 8.1 Define success criteria: |Q_supplied - Q_demanded| < 5% of max(Q_supplied, Q_demanded), total surplus ≥ 95% of max possible, no interventions active
- [ ] 8.2 Implement per-step condition checking using mission framework interface
- [ ] 8.3 Implement mission briefing UI text explaining equilibrium concept and success criteria with encouraging brand voice
- [ ] 8.4 Implement success message: "Market cleared! Supply met demand." with transition to next mission or sandbox
- [ ] 8.5 Write unit tests: verify balanced agent counts trigger success; verify imbalanced counts prevent success; verify interventions prevent success

## 9. Mission: Price Floor Disaster

- [ ] 9.1 Define success criteria: price floor set above free-market equilibrium, surplus (Q_supplied > Q_demanded) ≥ 20% of Q_supplied, deadweight loss > 10% of baseline surplus
- [ ] 9.2 Implement surplus detection: calculate Q_supplied - Q_demanded at floor price, verify threshold met
- [ ] 9.3 Implement deadweight loss threshold check: compare current total surplus with baseline
- [ ] 9.4 Implement mission briefing explaining minimum wage analogy and warning of unintended consequences
- [ ] 9.5 Implement success/failure messages: "Surplus created — some sellers cannot sell." with visual emphasis on stranded agents
- [ ] 9.6 Write unit tests: verify binding floor triggers success; verify non-binding floor fails to meet criteria; verify deadweight loss computed correctly

## 10. Mission: The Invisible Hand

- [ ] 10.1 Define initial state: start with active interventions (floor/ceiling/tax) and low efficiency (<70%)
- [ ] 10.2 Define success criteria: remove all interventions (floor=0, ceiling=∞, tax=0, subsidy=0), auto-step 5 times, observe efficiency rise to ≥95%
- [ ] 10.3 Implement intervention removal detection: check parameter values each step to confirm user removed controls
- [ ] 10.4 Implement auto-step progress tracking: count steps after intervention removal, verify efficiency improvement
- [ ] 10.5 Implement mission briefing quoting Adam Smith and explaining self-organization concept
- [ ] 10.6 Implement success message: "The invisible hand at work — welfare maximized without central control."
- [ ] 10.7 Write unit tests: verify efficiency rises when interventions removed; verify success after 5 steps; verify failure if interventions remain active

## 11. Mission: Market Crash

- [ ] 11.1 Implement speculation parameter: multiplier for buyer WTP (e.g., 1.5× inflates all WTP values temporarily)
- [ ] 11.2 Define bubble conditions: speculation active → price spike >50% above baseline, quantity traded increases
- [ ] 11.3 Define crash conditions: speculation removed → price drops >40% in one step, quantity traded falls >30%
- [ ] 11.4 Implement crash detection: track price/quantity before and after speculation toggle, verify thresholds met
- [ ] 11.5 Implement mission briefing explaining bubble dynamics and housing/stock market analogy
- [ ] 11.6 Implement success message: "Market crashed — speculative bubble burst." with encouragement to explore what caused collapse
- [ ] 11.7 Write unit tests: verify speculation inflates prices; verify removing speculation triggers crash; verify crash magnitude meets thresholds

## 12. Sandbox Mode

- [ ] 12.1 Implement sandbox mode toggle that disables all mission condition checking
- [ ] 12.2 Unlock all parameters in sandbox: agent counts (1-200), WTP/cost distributions (mean, variance, shape), intervention parameters (floor 0-500, ceiling 0-500, tax 0-100, subsidy 0-100), speculation multiplier (1.0-3.0)
- [ ] 12.3 Add reset button to restore initial state without leaving sandbox
- [ ] 12.4 Write unit tests: verify no mission callbacks fire in sandbox mode; verify all parameters are adjustable; verify reset clears history

## 13. Visual Rendering: Supply and Demand Chart

- [ ] 13.1 Implement chart axes rendering: X-axis (quantity 0-max agents), Y-axis (price 0-max WTP/cost with 10% padding), labels using Economics accent #2a9d8f
- [ ] 13.2 Implement demand curve rendering: step function connecting sorted buyer WTP values, blue color (#3a86ff), descending slope
- [ ] 13.3 Implement supply curve rendering: step function connecting sorted seller costs, orange color (#fb8500), ascending slope
- [ ] 13.4 Implement optional curve smoothing: cubic spline interpolation for visual appeal
- [ ] 13.5 Implement equilibrium point rendering: large filled circle at intersection, horizontal/vertical dashed lines to axes showing equilibrium price and quantity
- [ ] 13.6 Implement consumer surplus shading: fill area below demand curve, above price line, blue with alpha 0.3
- [ ] 13.7 Implement producer surplus shading: fill area above supply curve, below price line, green (#06d6a0) with alpha 0.3
- [ ] 13.8 Implement deadweight loss shading (when interventions active): triangular region between curves and intervention price, red (#ef476f) with alpha 0.3
- [ ] 13.9 Implement policy markers: price floor as thick horizontal line at floor price (red), price ceiling as thick horizontal line at ceiling price (orange), tax/subsidy as vertical shift arrow on supply curve
- [ ] 13.10 Implement dynamic Y-axis scaling based on current WTP/cost ranges and intervention parameters
- [ ] 13.11 Write visual regression tests or snapshot tests for key states (free-market equilibrium, binding floor with surplus, binding ceiling with shortage)

## 14. Visual Rendering: Price History Chart

- [ ] 14.1 Implement secondary chart below main chart: X-axis (step index, last 20 steps), Y-axis (price), title "Price Over Time"
- [ ] 14.2 Implement line graph rendering: connect price values across steps with Economics accent color #2a9d8f
- [ ] 14.3 Implement rolling window: only show last 20 steps, scroll as new steps added
- [ ] 14.4 Implement markers for intervention changes: vertical dotted lines when floor/ceiling/tax/subsidy changes
- [ ] 14.5 Write unit tests: verify price history updates correctly; verify rolling window truncates old data

## 15. Visual Rendering: Agent Indicators (Optional)

- [ ] 15.1 Implement "Show agents" toggle checkbox in UI
- [ ] 15.2 Implement agent dot rendering: small circles at (quantity index, WTP/cost) coordinates on main chart
- [ ] 15.3 Implement color coding: green for traded agents, red for untraded agents
- [ ] 15.4 Implement hover tooltip (if time permits): show agent details (WTP/cost, traded status, surplus) on mouseover
- [ ] 15.5 Write unit tests: verify agent indicators appear when toggled on; verify color coding matches traded status

## 16. Reference Panel

- [ ] 16.1 Implement collapsible reference panel as a React component (`ReferencePanel.tsx`) overlaying or beside the canvas
- [ ] 16.2 Write content for Supply and Demand: explain downward/upward slopes, define in terms of agent WTP/cost distributions
- [ ] 16.3 Write content for Equilibrium: define as Q_d(P*) = Q_s(P*), explain all mutually beneficial trades occur
- [ ] 16.4 Write content for Consumer and Producer Surplus: define graphically and verbally, show formulas for area calculations
- [ ] 16.5 Write content for Price Elasticity: define as E = %ΔQ / %ΔP, explain elastic vs. inelastic and tax incidence implications
- [ ] 16.6 Write content for Market Failures: describe price floors (surplus, deadweight loss), ceilings (shortage), taxes (burden split), subsidies (overproduction)
- [ ] 16.7 Write content for Invisible Hand: quote Adam Smith, explain self-organization and welfare maximization without central planning
- [ ] 16.8 Style with brand fonts (Instrument Serif for headings, DM Sans for body, IBM Plex Mono for equations) and Economics accent #2a9d8f
- [ ] 16.9 Implement contextual highlighting: current mission's relevant section is highlighted in the panel
- [ ] 16.10 Implement collapsible sections: each concept can be expanded/collapsed independently

## 17. Step Controls Integration

- [ ] 17.1 Wire step controls to DiscreteEngine StepController: next step button, auto-step toggle, reset button, undo button
- [ ] 17.2 Implement step counter display: "Day X" in bottom-right corner, increments with each step
- [ ] 17.3 Implement auto-step interval slider: range 200ms to 5000ms, default 1000ms, updates setInterval when changed
- [ ] 17.4 Implement auto-step pause on mission completion or canStep() returning false
- [ ] 17.5 Implement undo button state: grayed out when history empty, enabled when history has entries
- [ ] 17.6 Implement reset confirmation dialog (optional): "Reset will clear all history. Continue?" to prevent accidental resets
- [ ] 17.7 Write unit tests: verify next step advances state; verify auto-step calls step() at correct intervals; verify undo restores previous state; verify reset clears history

## 18. Integration and Polish

- [ ] 18.1 Wire all subsystems together through `MarketLabEpisode.ts` and verify full lifecycle: load, step, mission complete
- [ ] 18.2 Implement responsive layout: canvas resizes to viewport, controls reflow for mobile, reference panel collapses to bottom sheet on small screens
- [ ] 18.3 Implement keyboard accessibility: all controls reachable via Tab, step via Enter/Space, parameter adjustment via arrow keys
- [ ] 18.4 Implement touch-optimized controls: larger sliders (44px min height), enlarged step buttons (48px×48px), swipe-up reference panel
- [ ] 18.5 Add episode metadata: title "Market Lab", domain "Economics", accent color #2a9d8f, description text ("Watch supply meet demand. Manipulate prices. Crash markets.")
- [ ] 18.6 Performance profiling: verify step computation <50ms on mid-range device, rendering <16ms for smooth auto-step at 20 steps/sec
- [ ] 18.7 Write Playwright E2E tests: load episode, adjust parameters, step forward, Find Equilibrium mission success flow, navigate to sandbox
- [ ] 18.8 Write Playwright E2E test: verify telemetry updates after step, reference panel opens and closes, price history chart displays
- [ ] 18.9 Write Playwright E2E test: Price Floor Disaster mission flow (set floor, observe surplus, verify deadweight loss)
- [ ] 18.10 Write Playwright E2E test: Market Crash mission flow (enable speculation, observe price spike, disable speculation, observe crash)
