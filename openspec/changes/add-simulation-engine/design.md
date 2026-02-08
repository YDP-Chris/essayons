## Context

Essayons is a browser-based interactive learning platform where each episode is a self-contained simulation. Every episode needs the same foundational runtime: a physics loop, a rendering pipeline, input handling, time controls, and a parameter system. This design document defines the shared simulation engine that all episodes will build upon.

**Stakeholders**: Solo developer, future episode authors (yourself, later).
**Constraints**: Zero budget, browser-only, no backend, TypeScript strict mode, must run >30 FPS on mid-range devices.

## Goals / Non-Goals

**Goals:**

- Provide a deterministic, fixed-timestep physics loop that episodes plug into
- Decouple rendering from physics so frame drops never corrupt simulation state
- Keep simulation state outside React for performance; React handles UI only
- Provide a typed parameter system that connects simulation variables to UI controls
- Support time manipulation (pause, speed up to 1000x) for exploration
- Provide a mission framework that episodes use to define success/failure
- Handle keyboard, mouse, and touch input with configurable bindings
- Target >30 FPS on mid-range devices with graceful degradation

**Non-Goals:**

- 3D rendering (2D Canvas only for MVP; WebGL deferred to future proposal)
- Networked multiplayer or shared state
- Server-side simulation or replay recording
- Audio engine (deferred to separate proposal)
- Undo/redo for simulation state

## Decisions

### Decision 1: Fixed-timestep physics with variable-rate rendering

The simulation loop uses the "fix your timestep" pattern:

- Physics runs at a fixed rate (default 60 Hz, configurable per episode) using a time accumulator
- Rendering runs at the display refresh rate via `requestAnimationFrame`
- When the frame budget allows, multiple physics ticks execute per frame (critical for high-speed time multipliers)
- When the device is slow, physics ticks are capped per frame to prevent the "spiral of death" (max 10 ticks per frame by default)

**Why**: Fixed-timestep physics ensures deterministic, reproducible results regardless of frame rate. This is essential for educational simulations where users expect consistent behavior. The accumulator pattern is the industry-standard approach (Gaffer On Games).

**Alternatives considered:**

- Variable timestep physics: Simpler but non-deterministic; fast/slow machines produce different results
- Web Workers for physics: Adds complexity (message passing, SharedArrayBuffer); deferred until profiling shows main-thread physics is a bottleneck

### Decision 2: Simulation state lives outside React

The `SimulationEngine` and all its subsystems are plain TypeScript classes, not React state. React components read from the engine via hooks that use `useSyncExternalStore` (or a lightweight subscription pattern).

```
┌──────────────────────────────────────────────────┐
│  SimulationEngine (plain TypeScript)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Physics  │ │ Renderer │ │ ParameterSystem  │ │
│  │ State    │ │ (Canvas) │ │ (typed params)   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Time     │ │ Input    │ │ Mission          │ │
│  │ Control  │ │ Handler  │ │ Framework        │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└──────────────────┬───────────────────────────────┘
                   │ subscribe / read
┌──────────────────▼───────────────────────────────┐
│  React UI Layer                                  │
│  useSimulation() · useParameter() · useMission() │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Controls │ │ Telemetry│ │ Mission Panel    │ │
│  │ Panel    │ │ Display  │ │                  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Why**: React reconciliation introduces unpredictable latency. Physics and rendering must be frame-precise. Keeping state outside React means the engine controls its own timing. React hooks provide a clean read-only bridge for UI components.

**Alternatives considered:**

- All state in React (useReducer): Too slow for 60Hz updates; causes unnecessary re-renders
- MobX/Zustand: Adds dependency; the subscription pattern is trivial to implement directly
- Signals (Preact Signals, SolidJS): Interesting but adds framework coupling; plain subscriptions are simpler

### Decision 3: Layered Canvas rendering

The renderer manages an ordered stack of render layers, each with a name and draw function:

1. **Background layer** (z: 0): Static or slowly-changing background (starfield, terrain, grid)
2. **Simulation layer** (z: 100): Dynamic objects (planets, vehicles, particles)
3. **Effect layer** (z: 200): Trails, vectors, visual effects
4. **UI overlay layer** (z: 300): Labels, measurement tools, HUD elements

Each layer's draw function receives a `RenderContext` with the 2D canvas context, viewport transform, and simulation time. Episodes register their own layers. The renderer calls them in z-order each frame.

**Why**: Layering avoids expensive full-canvas redraws when only some elements change. It also provides a clean separation of concerns — an episode's background code is completely independent of its object rendering code.

**Implementation note**: For MVP, all layers draw to a single canvas. If profiling reveals benefits, we can promote layers to separate canvases (offscreen or stacked) without changing the episode API.

### Decision 4: Typed parameter system

Parameters are defined declaratively by episodes:

```typescript
interface NumberParam {
  type: 'number'
  key: string
  label: string
  default: number
  min: number
  max: number
  step: number
  unit?: string // e.g., "km/s", "kg"
  displayPrecision?: number
}

interface BooleanParam {
  type: 'boolean'
  key: string
  label: string
  default: boolean
}

interface EnumParam {
  type: 'enum'
  key: string
  label: string
  options: { value: string; label: string }[]
  default: string
}

interface Vector2Param {
  type: 'vector2'
  key: string
  label: string
  default: { x: number; y: number }
  min?: { x: number; y: number }
  max?: { x: number; y: number }
}
```

The parameter system:

- Validates all changes against constraints before applying
- Batches change notifications so mid-frame changes don't cause inconsistency
- Serializes to/from localStorage for persistence between sessions
- Provides a subscription API that React hooks consume

**Why**: A typed system prevents runtime errors (passing a string to a physics equation), enables auto-generated UI controls (a `NumberParam` automatically gets a slider), and makes parameter persistence trivial.

### Decision 5: Episode plugin interface

Each episode implements the `EpisodeDefinition` interface:

```typescript
interface EpisodeDefinition {
  id: string
  name: string
  description: string
  accentColor: string

  parameters: ParameterDefinition[]
  missions: MissionDefinition[]

  init(engine: SimulationEngine): void
  createInitialState(): PhysicsState
  update(state: PhysicsState, params: ParamValues, dt: number): PhysicsState
  render(ctx: RenderContext, state: PhysicsState, params: ParamValues): void
  cleanup(): void
}
```

- `init`: Register layers, set up episode-specific resources
- `createInitialState`: Return the starting physics state
- `update`: Pure function — takes current state, returns next state (fixed timestep `dt`)
- `render`: Draw to canvas using provided context (variable rate)
- `cleanup`: Release resources, remove event listeners

**Why**: This interface is the contract between the engine and episodes. By keeping `update` pure, we guarantee determinism and enable future features like replay. By separating `update` from `render`, we decouple physics rate from display rate.

### Decision 6: Time control via simulation clock

The engine maintains a simulation clock that is independent of wall-clock time:

- `simulationTime`: Cumulative simulation seconds elapsed
- `speedMultiplier`: 1x (real-time) to 1000x
- At 100x speed, 100 physics ticks run per wall-clock second (if budget allows)
- At very high multipliers (>100x), multiple physics ticks run per frame
- A per-frame tick cap (default 10) prevents the spiral of death

**Why**: Educational simulations often need time acceleration (e.g., watching an orbit complete in seconds instead of hours). The tick cap ensures the device never freezes trying to catch up.

### Decision 7: Input handling with action mapping

Inputs are mapped to named actions, not hard-coded:

```typescript
const bindings: InputBinding[] = [
  { action: 'thrust-forward', keys: ['w', 'ArrowUp'] },
  { action: 'thrust-left', keys: ['a', 'ArrowLeft'] },
  { action: 'pause-toggle', keys: ['Space'] },
  { action: 'zoom-in', mouse: 'scroll-up', touch: 'pinch-out' },
]
```

Episodes define their own action set. The input handler resolves physical inputs to actions, and the episode reads actions by name. This decouples episode logic from specific keys/buttons.

**Why**: Action mapping enables remappable controls and multi-input support (keyboard + touch) without episode code changes. It also simplifies testing — tests can fire actions directly without simulating DOM events.

## Risks / Trade-offs

- **Single-threaded physics**: At very high speed multipliers with complex simulations, the main thread may struggle. **Mitigation**: Tick cap prevents freezing; if profiling shows need, Web Workers can be added later without changing the episode API (the `update` function is already pure).
- **Single canvas for all layers**: May cause unnecessary redraws of static layers. **Mitigation**: Acceptable for MVP; can split to multiple canvases later since the layer API is the same either way.
- **No undo/redo**: Users cannot step backward. **Mitigation**: Not needed for MVP; the pure `update` function enables future replay/rewind if desired.
- **localStorage only**: Parameter persistence is browser-local. **Mitigation**: Acceptable for the zero-backend MVP constraint; export/import JSON can be added later.

## Migration Plan

This is a greenfield addition — no existing code to migrate. The engine is introduced as a new `src/engine/` module. No existing files are modified. Episode 01 (Orbit Lab) will be the first consumer and will be proposed in a subsequent change.

**Rollback**: Delete `src/engine/` and associated hooks. No other code depends on these files at creation time.

## Open Questions

- **WebGL acceleration**: Should the renderer support an optional WebGL backend for particle-heavy episodes? Deferred — 2D Canvas is sufficient for MVP.
- **Audio integration**: Should the engine own an audio context, or should audio be a separate system? Deferred to a future proposal.
- **State snapshots**: Should the engine support saving/loading full simulation snapshots (not just parameters)? Deferred — useful for sharing but not MVP-critical.
