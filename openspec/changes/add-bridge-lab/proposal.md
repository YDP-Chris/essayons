# Change: Add Bridge Lab — Engineering domain structural physics simulator

## Why

Bridge Lab introduces the engineering domain to Essayons through a hands-on truss bridge builder. Users learn structural engineering principles by constructing bridges, applying loads, and watching them deform and fail in real-time. This episode teaches tension vs. compression, load distribution, material properties, and structural failure mechanics through experimentation—making abstract engineering concepts tangible through interactive physics simulation.

## What Changes

- Add continuous structural physics simulation using force propagation through truss networks with stress/strain calculations per beam
- Add 2D truss bridge builder with grid-based node placement, beam connections, and support anchors
- Add material system supporting wood, steel, and concrete with distinct strength-to-weight ratios and failure thresholds
- Add real-time stress visualization: beams display color-coded stress levels (green=safe, yellow=strained, red=failing) and break when stress exceeds material strength
- Add load application system with gravity, configurable point loads, and oscillating horizontal forces (for earthquake simulation)
- Add four structured missions: First Crossing (simple bridge over 10m gap), Efficiency Challenge (minimum material weight budget), The Arch (discover compressive load distribution), and Earthquake (resonance and damping under dynamic loads)
- Add sandbox mode with unlimited materials, adjustable physics parameters, and no failure constraints
- Add real-time telemetry display: total structure weight, load-bearing capacity, max beam stress, factor of safety, deflection magnitude, and resonance frequency
- Add reference panel presenting tension vs. compression concepts, truss types (Warren, Pratt, Howe), moment of inertia, stress/strain relationships, and famous bridge failures (Tacoma Narrows, Quebec Bridge)
- Add Canvas rendering for bridge structure, stress color mapping, force vectors, displacement animations, support points, and applied loads
- Add touch controls for mobile: tap-to-place nodes, drag-to-connect beams, pinch-to-zoom canvas view
- Apply Engineering domain accent color #ff6b35 throughout the episode UI

## Impact

- Affected specs: `bridge-lab` (new capability)
- Affected code:
  - `src/episodes/bridge-lab/BridgeLabEpisode.ts` — episode entry point, wires engine to structural physics
  - `src/episodes/bridge-lab/StructuralPhysics.ts` — force propagation through truss, stress/strain computation
  - `src/episodes/bridge-lab/TrussBuilder.ts` — grid-based node/beam placement, constraint validation
  - `src/episodes/bridge-lab/MaterialSystem.ts` — material properties (wood/steel/concrete), failure detection
  - `src/episodes/bridge-lab/StressVisualizer.ts` — color mapping from stress levels, breakage animations
  - `src/episodes/bridge-lab/LoadSystem.ts` — gravity, point loads, oscillating forces
  - `src/episodes/bridge-lab/missions/FirstCrossingMission.ts` — bridge must support 1000kg load
  - `src/episodes/bridge-lab/missions/EfficiencyChallengeMission.ts` — material weight budget constraint
  - `src/episodes/bridge-lab/missions/TheArchMission.ts` — guide discovery of arch efficiency
  - `src/episodes/bridge-lab/missions/EarthquakeMission.ts` — survive oscillating horizontal force
  - `src/episodes/bridge-lab/Telemetry.ts` — structure weight, stress, safety factor computation
  - `src/episodes/bridge-lab/ReferencePanel.tsx` — tension/compression, truss types, famous failures
  - `src/episodes/bridge-lab/BridgeRenderer.ts` — Canvas rendering for trusses, stress colors, forces
  - `src/episodes/bridge-lab/types.ts` — TypeScript interfaces for nodes, beams, materials, forces
  - `src/episodes/bridge-lab/constants.ts` — material properties, grid spacing, stress thresholds
