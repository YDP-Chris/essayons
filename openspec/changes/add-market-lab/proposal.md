# Change: Add Market Lab — Episode 03 economics simulation using discrete step-based engine

## Why

Market Lab is Episode 03 and the first economics-domain episode for Essayons. It demonstrates how markets coordinate resources through price discovery and reveals both the power and fragility of market mechanisms. By manipulating supply, demand, and policy interventions, users discover equilibrium concepts, price elasticity, and market failures through experimentation — not theory. As the first DiscreteEngine episode, it validates the step-based simulation architecture for domains where computation is naturally turn-based rather than continuous.

## What Changes

- Add step-based market simulation using discrete agent interaction model where each step = one market day with buyers and sellers transacting at discovered prices
- Add supply and demand curve visualization showing aggregate buyer demand schedule and seller supply schedule plotted on price-quantity axes
- Add price discovery mechanism using double-auction clearing price where market price equilibrates to the intersection of supply and demand curves
- Add buyer and seller agents with configurable preferences: buyers have willingness-to-pay distributions, sellers have cost distributions, both adjust behavior based on previous-round outcomes
- Add policy intervention parameters: price floor (minimum legal price), price ceiling (maximum legal price), per-unit tax, per-unit subsidy, and elasticity modifiers
- Add four structured missions: Find Equilibrium (adjust supply/demand until market clears with minimal surplus/shortage), Price Floor Disaster (observe unemployment/surplus from too-high minimum price), The Invisible Hand (remove controls and watch self-organization to equilibrium), and Market Crash (create speculative bubble conditions and trigger collapse)
- Add real-time telemetry: current price, quantity traded, consumer surplus, producer surplus, deadweight loss, market efficiency, surplus/shortage magnitude
- Add reference panel presenting supply/demand curves, equilibrium concept, price elasticity definitions, market failure types, and Adam Smith's invisible hand principle
- Add step controls: next step button, auto-step toggle with configurable interval, step counter, reset, and undo last step
- Add Canvas rendering for supply/demand curve plot, buyer/seller agent indicators, price history graph, surplus/shortage shading, and intervention markers
- Apply Economics domain accent color #2a9d8f throughout the episode UI

## Impact

- Affected specs: `market-lab` (new capability)
- Affected code:
  - `src/episodes/market-lab/MarketLabEpisode.ts` — episode entry point, wires DiscreteEngine to market-specific logic
  - `src/episodes/market-lab/MarketSimulation.ts` — agent-based market model, step function implementation, price discovery algorithm
  - `src/episodes/market-lab/Agent.ts` — buyer/seller agent classes with preference distributions and adaptive behavior
  - `src/episodes/market-lab/PriceDiscovery.ts` — double-auction clearing algorithm, equilibrium computation
  - `src/episodes/market-lab/SupplyDemand.ts` — supply/demand curve generation from agent preferences, elasticity computation
  - `src/episodes/market-lab/PolicyInterventions.ts` — price floor/ceiling enforcement, tax/subsidy application, deadweight loss calculation
  - `src/episodes/market-lab/missions/FindEquilibriumMission.ts` — detect when supply and demand curves intersect cleanly
  - `src/episodes/market-lab/missions/PriceFloorMission.ts` — demonstrate surplus from binding price floor
  - `src/episodes/market-lab/missions/InvisibleHandMission.ts` — watch convergence after removing controls
  - `src/episodes/market-lab/missions/MarketCrashMission.ts` — create bubble conditions and detect collapse
  - `src/episodes/market-lab/Telemetry.ts` — compute welfare metrics, efficiency, surplus/shortage
  - `src/episodes/market-lab/ReferencePanel.tsx` — economic concepts, equations, and market failure explanations
  - `src/episodes/market-lab/MarketRenderer.ts` — Canvas rendering for supply/demand curves, agents, price history
  - `src/episodes/market-lab/types.ts` — TypeScript interfaces for market state, agent state, transaction records
  - `src/episodes/market-lab/constants.ts` — default agent counts, elasticity values, intervention ranges, mission thresholds
