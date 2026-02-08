## Context

Market Lab is Episode 03 of Essayons and the first economics-domain episode. It serves as a proof-of-concept for the DiscreteEngine simulation mode introduced in `add-discrete-simulation-mode`. Unlike physics episodes (Orbit Lab) that require continuous time integration, economic markets operate in discrete rounds: agents submit bids/offers, prices clear, transactions execute, then the next round begins. This natural discreteness makes Market Lab an ideal validation case for step-based simulation.

The educational goal is to make abstract economic concepts visceral through cause-and-effect experimentation. Users manipulate policy levers (price floors, taxes) and observe real-time consequences (unemployment, deadweight loss) on supply/demand curves and agent outcomes. The simulation must be pedagogically accurate: if a binding price floor does not create surplus, the educational premise fails.

### Constraints

- Client-side only (no server computation)
- Zero external economics libraries (project convention: minimal dependencies)
- Must integrate with DiscreteEngine's step lifecycle, parameter system, and mission framework
- Must work with keyboard, mouse, and touch input
- WCAG AA accessibility requirements
- Performance budget: each step must complete in < 50ms to support auto-step at 20 steps/sec

### Stakeholders

- Solo developer (implementation)
- End users (learners exploring economics, high school to undergraduate level)

## Goals / Non-Goals

### Goals

- Economically accurate supply/demand model based on agent preferences (not approximations)
- Clear visualization of supply/demand curves, equilibrium, and welfare effects
- Four missions that progressively teach market concepts: equilibrium, intervention failures, self-organization, bubble dynamics
- Discoverable learning — users figure out market principles by observing agent behavior
- Validate DiscreteEngine architecture with a non-trivial economics use case
- Step-based execution: each step represents one market day with clear before/after states

### Non-Goals

- Multi-market general equilibrium (single-market partial equilibrium is sufficient for Episode 03)
- Realistic commodity modeling (abstract "widgets" are fine; the focus is on mechanism, not realism)
- Behavioral economics (loss aversion, anchoring, etc.) — rational agents are simpler and teach the baseline
- Multiplayer trading or human-as-agent participation
- Server-side market clearing or leaderboards
- Dynamic entry/exit of firms or long-run equilibrium (static agent counts for simplicity)

## Decisions

### Agent-Based Market Model

**Decision**: Model the market as a population of buyer agents (each with a willingness-to-pay for one unit) and seller agents (each with a cost of production for one unit). Each agent attempts to trade at prices better than their reservation value. Aggregate all buyers to form a downward-sloping demand curve; aggregate all sellers to form an upward-sloping supply curve.

**Why agent-based**: Agents provide a concrete mental model ("each buyer has a maximum price they'll pay") that is more intuitive than abstract functional forms. It also enables narrative missions ("what happens to the highest-cost seller when a price floor is imposed?") and visual feedback (individual agents can be color-coded by transaction status).

**Agent preference distributions**:

- Buyers: willingness-to-pay values sampled from a uniform or normal distribution with configurable mean and variance. Example: 100 buyers with WTP ~ Uniform(50, 150) produces a linear demand curve.
- Sellers: production costs sampled similarly. Example: 100 sellers with Cost ~ Uniform(50, 150) produces a linear supply curve.

**Why these distributions**: Uniform distributions produce textbook-perfect linear curves, which are pedagogically clean for introductory concepts. The user can adjust distribution parameters (mean, spread, skew) to create non-linear curves for advanced exploration.

**Step function**:

```
step(state, stepIndex):
  1. Compute market demand curve from buyer WTP distribution
  2. Compute market supply curve from seller cost distribution
  3. Apply policy interventions (floor/ceiling, taxes/subsidies shift curves)
  4. Find clearing price where quantity demanded = quantity supplied (equilibrium)
  5. Execute transactions: match buyers and sellers at clearing price
  6. Compute welfare: consumer surplus, producer surplus, deadweight loss
  7. Update agent states (traded/untraded), price history
  8. Return new market state
```

**Alternatives considered**:

- **Functional forms (Cobb-Douglas, CES)**: More compact but less intuitive. Users cannot "see" individual agents. Rejected for Episode 03; could be an advanced mode.
- **Order book / limit order market**: More realistic but adds UI complexity (displaying the full book). Rejected for simplicity; the clearing price abstraction is sufficient.
- **Iterative tatonnement process**: Multi-round price adjustment toward equilibrium. Rejected because it obscures the one-shot clearing mechanism that defines competitive markets.

### Price Discovery: Double Auction Clearing

**Decision**: Use a double-auction clearing mechanism where the market price is the unique price at which quantity demanded equals quantity supplied. Implement by sorting buyers descending by WTP and sellers ascending by cost, then finding the intersection index.

**Algorithm**:

```
sortedBuyers = sort(buyers, by WTP descending)
sortedSellers = sort(sellers, by cost ascending)

for q = 1 to min(buyers.length, sellers.length):
  if sortedBuyers[q].WTP >= sortedSellers[q].cost:
    clearingPrice = (sortedBuyers[q].WTP + sortedSellers[q].cost) / 2  // midpoint rule
    clearingQuantity = q
  else:
    break  // no more mutually beneficial trades
```

**Why midpoint rule**: When buyer WTP > seller cost, any price in between allows trade. The midpoint splits the surplus evenly, which is the competitive equilibrium prediction under perfect information. Alternatives (buyer's bid, seller's offer) are asymmetric and harder to justify pedagogically.

**Handling ties**: If multiple buyers have identical WTP at the margin, randomize which ones trade (shuffle before sorting). This prevents bias.

**Policy interventions**:

- **Price floor P_min**: If clearing price < P_min, set price = P_min. Quantity traded = min(Q_demanded(P_min), Q_supplied(P_min)). Observe surplus (Q_supplied > Q_demanded).
- **Price ceiling P_max**: If clearing price > P_max, set price = P_max. Quantity traded = min(Q_demanded(P_max), Q_supplied(P_max)). Observe shortage (Q_demanded > Q_supplied).
- **Per-unit tax T**: Shifts supply curve up by T (sellers face higher cost). New equilibrium at higher buyer price, lower seller net price.
- **Per-unit subsidy S**: Shifts supply curve down by S. New equilibrium at lower buyer price, higher seller net price.

**Alternatives considered**:

- **Walrasian auctioneer**: Conceptually equivalent but requires iterative price adjustment simulation. The direct clearing algorithm is faster and more intuitive.
- **Nash bargaining**: Over-complicates for an intro episode. Rejected.

### Supply and Demand Curve Visualization

**Decision**: Render supply and demand curves on a 2D canvas with price on the Y-axis and quantity on the X-axis. The demand curve is a step function (or smoothed curve) connecting buyer WTP values; the supply curve connects seller costs. Mark the equilibrium point with a large dot. Shade consumer surplus (area below demand, above price) and producer surplus (area above supply, below price) in contrasting colors.

**Rendering strategy**:

1. **Axes**: Draw X-axis (quantity, 0 to max agents) and Y-axis (price, 0 to max WTP/cost + margin). Use Economics accent #2a9d8f for axis labels.
2. **Demand curve**: Plot sorted buyer WTP values as a descending step function. Optionally smooth with cubic splines for visual appeal.
3. **Supply curve**: Plot sorted seller costs as an ascending step function. Optionally smooth.
4. **Equilibrium**: Mark the intersection with a filled circle. Draw horizontal and vertical dashed lines to axes showing equilibrium price and quantity.
5. **Surplus shading**: Use `ctx.fillStyle` with alpha transparency. Consumer surplus = blue (#3a86ff, alpha 0.3), producer surplus = green (#06d6a0, alpha 0.3). Deadweight loss (when present due to intervention) = red (#ef476f, alpha 0.3).
6. **Policy markers**: Price floor/ceiling shown as thick horizontal lines across the chart. Tax/subsidy shown as a vertical shift of the supply curve with an arrow indicating direction.

**Dynamic scaling**: The Y-axis range auto-adjusts based on the current WTP/cost distributions and intervention parameters. Ensure 10% padding above/below min/max for visual breathing room.

**Why Canvas not SVG**: The curves update every step, potentially at 20 FPS during auto-step. Canvas `fillRect` and `lineTo` primitives are faster than DOM manipulation of SVG paths. Canvas also matches the rendering approach used in Orbit Lab.

**Alternatives considered**:

- **Chart.js or D3**: Would simplify curve rendering but adds dependency. Rejected per project convention (zero budget, minimal deps). Custom Canvas rendering is ~100 lines and provides full control.
- **Scatter plot of individual agents**: Too cluttered with 100+ agents. The aggregated curves are more readable.

### Welfare Metrics and Telemetry

**Decision**: Compute and display the following metrics each step:

| Metric            | Formula                                                           | Display Format   |
| ----------------- | ----------------------------------------------------------------- | ---------------- |
| Clearing Price    | Equilibrium price ($/unit)                                        | `$XX.XX`         |
| Quantity Traded   | Number of transactions executed                                   | Integer          |
| Consumer Surplus  | Sum of (WTP - price) for all buyers who traded                    | `$XXX.XX`        |
| Producer Surplus  | Sum of (price - cost) for all sellers who traded                  | `$XXX.XX`        |
| Total Surplus     | Consumer surplus + producer surplus                               | `$XXX.XX`        |
| Deadweight Loss   | Surplus lost due to policy intervention (vs. free-market surplus) | `$XXX.XX`        |
| Market Efficiency | (Total surplus / Max possible surplus) × 100                      | `XX.X%`          |
| Surplus/Shortage  | Quantity supplied - quantity demanded (at intervention price)     | Integer (signed) |

**Why these metrics**: Consumer/producer surplus are the canonical welfare measures in microeconomics. Deadweight loss is the key concept for understanding policy inefficiency. Efficiency percentage provides a single-number summary. Surplus/shortage magnitude quantifies market imbalance.

**Display location**: Rendered on Canvas overlay layer in the top-right corner using IBM Plex Mono at 14px. Labels use Economics accent #2a9d8f; values use white. Updates after each step (not every frame, since discrete mode does not animate between steps).

**Baseline for deadweight loss**: The "max possible surplus" is the total surplus when no interventions are active and the market clears at the competitive equilibrium. Compute this during episode initialization and use as a reference point.

**Alternatives considered**:

- **Gini coefficient for inequality**: Interesting but orthogonal to market efficiency. Deferred to a future "Inequality Lab" episode.
- **Price elasticity of demand/supply**: Important concept but requires derivative estimation from discrete points. Approximated by comparing quantity changes when price changes between steps, displayed only when relevant (e.g., during elasticity missions).

### Mission Design

**Mission 1: Find Equilibrium**

- **Goal**: Adjust the number of buyers and sellers until the market clears with minimal surplus/shortage (quantity supplied within 5% of quantity demanded).
- **Success criteria**: Run a step with no price floor/ceiling active, and observe |Q_supplied - Q_demanded| < 0.05 × max(Q_supplied, Q_demanded). Total surplus within 95% of max possible.
- **Failure**: None (sandbox-like, users experiment until they discover the equilibrium).
- **Pedagogy**: Teaches that equilibrium is the "balance point" where supply meets demand. Users learn that adding more sellers lowers price, adding more buyers raises price.

**Mission 2: Price Floor Disaster**

- **Goal**: Set a minimum wage (price floor) above equilibrium and observe the resulting unemployment (surplus of sellers who cannot sell).
- **Success criteria**: Set price floor above the free-market equilibrium, run a step, observe surplus (Q_supplied > Q_demanded) and at least 20% of sellers unable to trade. Deadweight loss > 10% of free-market surplus.
- **Pedagogy**: Demonstrates that well-intentioned policies (minimum wage) can create unintended harm (unemployment). Users see the surplus visually as the gap between supply/demand curves at the floor price.

**Mission 3: The Invisible Hand**

- **Goal**: Start with distorted interventions (floor/ceiling/tax), then remove all controls and watch the market self-organize to equilibrium.
- **Success criteria**: Begin with interventions active and low efficiency (<70%). Remove interventions (set floor/ceiling to non-binding, tax/subsidy to zero). Run 5 auto-steps. Observe efficiency rise above 95%.
- **Pedagogy**: Illustrates Adam Smith's "invisible hand" — the market's ability to coordinate without central planning. Users see welfare improve automatically when constraints are lifted.

**Mission 4: Market Crash**

- **Goal**: Create speculative bubble conditions by distorting buyer preferences (shift WTP distribution upward artificially), then remove the distortion and observe the price collapse.
- **Implementation**: Introduce a "speculation" parameter that temporarily inflates buyer WTP (e.g., multiply all WTP by 1.5). Users turn it on, watch prices soar and quantity expand. Then turn it off and step forward — buyers with inflated WTP suddenly cannot afford the goods, demand collapses, price crashes, many sellers cannot sell.
- **Success criteria**: Achieve a price spike of >50% above baseline equilibrium, then trigger a crash where price drops >40% in a single step and quantity traded falls by >30%.
- **Pedagogy**: Teaches market fragility and bubble dynamics. Connects to real-world housing bubbles, stock crashes. The "speculation" parameter is a simplified stand-in for irrational exuberance or leverage.

**Alternatives considered**:

- **Tax revenue visualization**: Could add a mission on optimal taxation (Laffer curve). Deferred; too advanced for Episode 03.
- **Multi-market equilibrium**: E.g., substitutes/complements. Out of scope; single-market model is sufficient.

### Step Controls and History

**Decision**: Use the DiscreteEngine `StepController` with the following configuration:

- **Next Step button**: Advances one market day (calls `step()`). Enabled when `canStep()` returns true.
- **Auto-step toggle**: Starts/stops `setInterval` at user-configurable rate (default 1000ms, range 200ms to 5000ms). Auto-step pauses when a mission is completed or `canStep()` is false.
- **Step counter**: Displays "Day X" where X is the step index. Resets to 1 on episode reload.
- **Reset button**: Restores initial state (calls `createInitialState()`), clears history.
- **Undo button**: Restores previous step state (pops from history stack). Grayed out when history is empty.

**History depth**: 50 steps (lower than the default 100 because market states include agent arrays, which are larger than scalar physics states). Each step snapshot stores: agent WTP/cost arrays, transaction records, telemetry values, intervention parameters. Estimated size: ~5 KB per step × 50 = 250 KB, well within browser memory budget.

**canStep() implementation**: Returns true unless a mission has entered SUCCESS or FAILED state. Sandbox mode has no restrictions.

**Why these controls**: They match the DiscreteEngine contract and provide familiar VCR-like interaction (play/pause/step/reset). Undo is valuable for experimentation ("what if I remove the tax?") without losing progress.

### Reference Panel Content

**Decision**: Implement reference panel as a React component with collapsible sections, positioned as a sidebar or overlay. Content includes:

1. **Supply and Demand**: Explain that demand curves slope down (higher price → fewer buyers), supply curves slope up (higher price → more sellers willing to produce). Define the curves mathematically in terms of agent WTP/cost distributions.

2. **Equilibrium**: Define as the price where quantity demanded = quantity supplied. Explain that at equilibrium, all mutually beneficial trades occur. Show the equilibrium condition: Q_d(P*) = Q_s(P*).

3. **Consumer and Producer Surplus**: Define graphically (areas above/below price) and verbally ("buyer's gain from trade"). Explain that total surplus measures societal welfare.

4. **Price Elasticity**: Define as percent change in quantity / percent change in price. Explain elastic (|E| > 1) vs. inelastic (|E| < 1) and consequences for tax incidence.

5. **Market Failures**: Describe price floors (create surplus, deadweight loss), price ceilings (create shortages), taxes (reduce quantity traded, split burden by elasticity), subsidies (increase quantity, may cause overproduction).

6. **Invisible Hand**: Quote Adam Smith ("led by an invisible hand to promote an end which was no part of his intention"). Explain that self-interested agents interacting in a free market maximize total surplus without central coordination.

**Contextual highlighting**: When a mission is active, highlight the relevant section. E.g., during "Price Floor Disaster," highlight the "Market Failures" section and the price floor diagram.

**Equations rendered**: Use plain-text approximations (`Q_d(P)`, `E = %ΔQ / %ΔP`) or Canvas/SVG for cleaner rendering. Avoid LaTeX dependencies per project convention.

### Canvas Rendering Architecture

**Decision**: Use a single Canvas with three conceptual layers painted back-to-front each step:

1. **Background layer**: Light grid lines, axis labels, title ("Supply and Demand").
2. **Curve layer**: Demand curve (blue), supply curve (orange), surplus shading (translucent fills), equilibrium point (large dot), intervention markers (thick lines).
3. **Overlay layer**: Telemetry readout (top-right), mission status (top-left), step counter (bottom-right).

**Rendering trigger**: The DiscreteEngine calls `render()` after each step. There is no 60 FPS animation loop. Optional: if `animateTransitions: true` in the episode definition, the `TransitionAnimator` interpolates the curve positions smoothly over 300ms when switching between steps. This is purely cosmetic.

**Price history subplot**: A secondary chart below the main supply/demand chart shows price over time (step index on X-axis, price on Y-axis). Renders as a line graph with the last 20 steps. This helps users see price convergence or divergence over multiple steps.

**Agent indicators**: Optionally display small circles at each agent's (quantity, WTP/cost) coordinate on the chart. Color-code: green = traded, red = did not trade. This provides feedback on which agents are marginalized by interventions. Toggle via a "Show agents" checkbox.

**Why single Canvas**: Simpler than multi-canvas compositing. The step rate is low (max 20 steps/sec), so redrawing everything is cheap. Future optimization: cache the background layer in an offscreen canvas and only repaint curves/data.

### Mobile and Touch Controls

**Decision**: On touch devices, parameter sliders (number of buyers/sellers, price floor/ceiling, tax/subsidy) are rendered with larger touch targets (min 44px height per WCAG). The step controls (next/auto/reset/undo) are enlarged to 48px×48px buttons. The reference panel collapses to a bottom sheet that swipes up on tap.

**Auto-step control**: A single large toggle button labeled "Auto-Step" with a slider below for interval adjustment. When active, the button glows with Economics accent color.

**Detection**: Use `'ontouchstart' in window` or `navigator.maxTouchPoints > 0`. Show touch-optimized UI only on touch devices.

**Why**: Discrete mode does not require continuous input like WASD thrust (Orbit Lab), so mobile adaptation is straightforward. The primary interaction is adjusting sliders and tapping step buttons, which work naturally on touch.

## Risks / Trade-offs

### Risk: Agent count performance at high values

- **Mitigation**: Cap agent counts at 200 buyers + 200 sellers (400 total). Sorting 400 elements is O(400 log 400) ≈ 3500 operations, negligible. If users request higher counts, introduce bucketing (bin agents into price ranges) or sampling (randomly select subset for display).

### Risk: Pedagogical accuracy — users "discover" wrong economic relationships

- **Mitigation**: Validate simulation output against analytical equilibrium solutions in unit tests. For linear supply/demand (uniform distributions), equilibrium price = (mean_WTP + mean_cost) / 2, quantity = agent_count / 2. Test that simulation matches within 1% tolerance. If a price floor does not create surplus, the test fails.

### Risk: Bubble mission feels contrived

- **Trade-off accepted**: The "speculation" parameter is an artificial lever, not a realistic model of bubbles. However, it is pedagogically effective: users directly control the distortion and see the crash. A more realistic bubble (e.g., adaptive expectations, leverage) would require multi-period dynamics and be too complex for Episode 03. Mark this mission as "simplified model" in the reference panel.

### Risk: First DiscreteEngine episode sets bad pattern

- **Mitigation**: Document which parts are episode-specific (agent model, price discovery, welfare computation) vs. shared infrastructure (StepController, step history, Canvas rendering). Future discrete episodes (biology, game theory) should only need to implement the episode-specific `step()` function and parameter definitions.

### Trade-off: Single market (partial equilibrium) only

- **Accepted**: General equilibrium (multiple interdependent markets) would be more realistic but far more complex (need to solve simultaneous equations for clearing prices in all markets). Single-market partial equilibrium is the right scope for Episode 03. A future "Advanced Microeconomics" episode could add multi-market interactions.

### Trade-off: Rational agents (no behavioral economics)

- **Accepted**: Real humans are not perfectly rational utility maximizers. Behavioral quirks (anchoring, framing, loss aversion) affect real markets. However, rational agents are simpler to implement and teach the baseline theory cleanly. Behavioral extensions could be a future episode ("Behavioral Economics Lab").

## Migration Plan

Not applicable — this is a greenfield addition. No existing code is modified. The episode is additive to the platform.

**Rollback**: Remove the `src/episodes/market-lab/` directory and any route/navigation entries pointing to it. The simulation engine and platform are unaffected.

## Open Questions

1. **WTP/cost distribution shapes**: Should the default distributions be uniform (clean linear curves) or normal (more realistic but curved)? Likely start with uniform for pedagogical clarity, allow advanced users to switch.
2. **Tax incidence visualization**: How to clearly show that buyers and sellers split the tax burden depending on elasticity? May need a split-bar chart or color-coded deadweight loss shading. Needs design iteration.
3. **Bubble mission triggering**: Should the speculation parameter be a gradual slider (users can dial it up/down) or a binary toggle (on/off)? Slider provides more control; toggle is simpler. Playtesting will decide.
4. **Sound effects**: Should transactions, equilibrium achievement, or mission completion have audio feedback? Not mentioned in the PRD. Deferring to future enhancement (market bell sound on equilibrium?).
5. **Agent heterogeneity**: Should some agents be "smart" (e.g., only trade at favorable prices) vs. "naive" (trade at any price)? Adds realism but complicates the model. Likely defer to advanced mode.
