## Context

Essayons is a browser-based interactive learning platform where each episode is a self-contained simulation. The existing `add-simulation-engine` proposal defines a generic `EpisodeDefinition` plugin interface with lifecycle hooks (`init`, `update`, `render`, `cleanup`), a typed parameter system, and a mission framework. Today, building an episode requires implementing this interface from scratch -- writing custom React components for parameter controls, telemetry displays, mission panels, and reference content. Every new episode repeats the same structural patterns with different domain content.

This design introduces a **config-driven Episode Factory** that sits on top of the simulation engine's plugin interface. Authors describe an episode declaratively via an `EpisodeConfig` object, and the factory auto-generates all boilerplate, producing a complete `EpisodeDefinition` ready for the engine. The primary consumers are AI agents generating episodes at scale, though human developers also benefit from reduced boilerplate.

**Stakeholders**: Solo developer, AI episode-generation agents (future), CI pipeline.
**Constraints**: Zero budget, browser-only, TypeScript strict mode, no new external dependencies beyond a lightweight LaTeX renderer (KaTeX) for reference panels.

## Goals / Non-Goals

**Goals:**

- Define a single `EpisodeConfig` type that fully describes an episode's identity, behavior, content, and validation criteria
- Auto-generate parameter UI, telemetry display, mission UI, and reference panels from config declarations
- Provide a CLI scaffold generator that creates the file structure and boilerplate for a new episode
- Provide an equation test vector framework for validating simulation correctness against known-correct values
- Provide a content validation pipeline that catches incomplete or malformed configs before runtime
- Provide a central episode registry that the landing page consumes to display available episodes
- Ensure the factory output is a standard `EpisodeDefinition` -- the engine never knows whether an episode was hand-coded or factory-generated

**Non-Goals:**

- Visual editor or drag-and-drop episode builder (config is code, not GUI)
- Runtime config hot-reloading (config is compiled TypeScript, not JSON loaded at runtime)
- Replacing hand-coded episodes entirely -- the factory is an accelerator, not a mandate; episodes can still implement `EpisodeDefinition` directly for full control
- Multi-language support for reference content (English only for MVP)
- AI agent orchestration or scheduling -- this proposal defines the authoring interface, not the agent pipeline

## Decisions

### Decision 1: EpisodeConfig is compiled TypeScript, not runtime JSON/YAML

The `EpisodeConfig` is a TypeScript object with full type checking at compile time, not a JSON or YAML file loaded at runtime.

```typescript
// src/episodes/market-lab/config.ts
import { EpisodeConfig } from '../../factory/EpisodeConfig'

export const config: EpisodeConfig = {
  id: 'market-lab',
  name: 'Market Lab',
  domain: 'economics',
  accentColor: '#FFB800',
  icon: '📈',
  tagline: 'Discover how markets find equilibrium',
  computeMode: 'discrete',
  parameters: [
    /* ... */
  ],
  equations: {
    /* ... */
  },
  missions: [
    /* ... */
  ],
  reference: [
    /* ... */
  ],
  telemetryFields: [
    /* ... */
  ],
  testVectors: [
    /* ... */
  ],
}
```

**Why**: TypeScript configs get full IDE autocompletion, compile-time type checking, and can reference imported constants or helper functions. Runtime JSON would require a separate schema validator and lose all IDE tooling. Since AI agents generate TypeScript code (not fill in forms), TypeScript configs are the natural output format.

**Alternatives considered:**

- JSON Schema + runtime validation: Loses IDE support, requires separate validator, cannot embed functions (equations)
- YAML with custom tags: Even less tooling support, unfamiliar to TypeScript developers
- DSL (domain-specific language): Over-engineered for this use case; TypeScript already IS the DSL

### Decision 2: Factory produces standard EpisodeDefinition -- no engine changes needed

The `EpisodeFactory.create(config)` function returns a standard `EpisodeDefinition` object as defined by the simulation engine. The engine does not need to know whether an episode was created by the factory or hand-coded. This preserves the existing plugin contract.

```
┌─────────────────────────────────────────────────────┐
│  EpisodeConfig (declarative)                        │
│  { id, parameters, equations, missions, ... }       │
└──────────────────────┬──────────────────────────────┘
                       │ EpisodeFactory.create()
                       ▼
┌─────────────────────────────────────────────────────┐
│  EpisodeDefinition (imperative)                     │
│  { init(), update(), render(), cleanup() }          │
│  + auto-generated React components                  │
└──────────────────────┬──────────────────────────────┘
                       │ engine.init(episodeDefinition)
                       ▼
┌─────────────────────────────────────────────────────┐
│  SimulationEngine                                   │
│  Fixed-timestep loop, Canvas renderer, input, ...   │
└─────────────────────────────────────────────────────┘
```

**Why**: Keeping the engine interface unchanged means:

1. Hand-coded episodes (like Orbit Lab) continue to work without modification
2. The factory is purely additive -- it can be adopted incrementally
3. Testing the factory is simple: verify its output matches the `EpisodeDefinition` contract

**Alternatives considered:**

- Modify the engine to accept `EpisodeConfig` directly: Couples the engine to the factory; violates separation of concerns
- Create a new engine variant: Duplication; two engines to maintain

### Decision 3: Three compute modes with a single factory

The factory supports three `computeMode` values that determine how the simulation update loop behaves:

| Mode         | Physics Loop                            | Use Cases                                                             |
| ------------ | --------------------------------------- | --------------------------------------------------------------------- |
| `continuous` | Fixed-timestep rAF loop (standard)      | Physics sims: orbital mechanics, wave propagation, fluid dynamics     |
| `discrete`   | Step-on-event (user clicks "Next Step") | Economics: supply/demand equilibrium steps; Biology: generation steps |
| `turn-based` | Explicit advance with state resolution  | History: decision-point scenarios; Civics: legislative process steps  |

For `continuous` mode, the factory wires equations directly into the engine's `update(state, params, dt)` hook. For `discrete` and `turn-based`, the factory wraps the equations in an event-driven adapter: the `update` function only advances state when triggered by a user action (button click or turn submission), and the `dt` parameter represents one logical step rather than elapsed time.

**Why**: Not all domains benefit from real-time continuous simulation. Economic equilibrium is better explored step-by-step. Historical scenarios are inherently turn-based. A single factory that handles all three modes means AI agents use one config format regardless of domain.

**Alternatives considered:**

- Separate factories per mode: Duplicated logic, three APIs to learn
- Force all episodes into continuous mode: Awkward for non-physics domains; the "equations" would need artificial time integration

### Decision 4: Auto-generated UI components are React components composed from primitives

The factory generates React components for parameter controls, telemetry, mission UI, and reference panels. These are composed from a small set of primitive components:

```
ParameterUIGenerator
├── SliderControl        (number params)
├── ToggleControl        (boolean params)
├── DropdownControl      (enum params)
├── RangePairControl     (linked min/max pairs)
└── ParameterGroup       (visual grouping)

TelemetryUIGenerator
├── NumericReadout       (value + unit + precision)
├── SparklineChart       (mini time-series)
└── TelemetryGroup       (visual grouping)

MissionUIGenerator
├── MissionBriefingModal (pre-mission overview)
├── ObjectiveChecklist   (in-sim tracking)
├── MissionSuccessScreen (completion)
└── MissionFailureScreen (failure + retry)

ReferenceGenerator
├── ReferenceSection     (collapsible markdown)
└── EquationBlock        (KaTeX-rendered LaTeX)
```

Each generator component accepts the relevant slice of `EpisodeConfig` as props and renders the corresponding UI. The factory wires these components to the engine's React hooks (`useParameter`, `useMissionState`, etc.).

**Why**: Composing from primitives means:

1. Each primitive is independently testable
2. The visual style is consistent across all episodes (same slider, same telemetry readout)
3. If a specific episode needs a custom control, it can override a single primitive without replacing the entire panel

**Alternatives considered:**

- Template-based HTML generation: Not reactive, cannot bind to engine state
- Web Components: Adds complexity, poor React interop
- Fully custom per-episode: The problem we are solving -- too much boilerplate

### Decision 5: Scaffold generator is a Node.js script using template literals

The scaffold generator (`scripts/create-episode.ts`) is a straightforward Node.js script that writes files using template literals. It does NOT use a templating engine (Handlebars, EJS, etc.).

```
npm run episode:create -- --id wave-lab --domain physics

Output:
  src/episodes/wave-lab/
    config.ts            // EpisodeConfig with domain defaults pre-filled
    computation.ts       // update() skeleton with typed state
    renderer.ts          // render() skeleton with layer registration
    index.ts             // imports config + computation + renderer, calls EpisodeFactory.create()
    __tests__/
      computation.test.ts  // test skeleton with testVector validation boilerplate
```

The generator:

1. Validates inputs (kebab-case ID, valid domain)
2. Checks for directory conflicts
3. Writes files with domain-appropriate placeholder content (e.g., physics episodes get `accentColor: '#00D4AA'`, economics episodes get `accentColor: '#FFB800'`)
4. Auto-registers the episode in the `EpisodeRegistry`

**Why**: Template literals in TypeScript are simpler than adding a templating engine dependency. The generated files are small and predictable. TypeScript template literals also benefit from IDE syntax highlighting within the template strings.

**Alternatives considered:**

- Yeoman/Plop generators: Adds heavyweight dependencies for a simple task
- Copy-and-rename from a template directory: Fragile; template files drift from the actual interface
- Code generation from AST manipulation: Over-engineered for file scaffolding

### Decision 6: Content validation as a composable pipeline

The `ContentValidator` is structured as a pipeline of independent validation rules, each returning errors and warnings:

```typescript
interface ValidationRule {
  name: string
  validate(config: EpisodeConfig): ValidationIssue[]
}

interface ValidationIssue {
  level: 'error' | 'warning'
  rule: string
  field: string
  message: string
}

interface ValidationResult {
  valid: boolean // true only if zero errors
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}
```

Built-in rules:

1. **RequiredFieldsRule** -- all top-level fields present and non-empty
2. **ParameterRangeRule** -- min < max, step > 0, default in [min, max]
3. **MissionPresenceRule** -- at least one mission with at least one objective
4. **ReferenceContentRule** -- at least one reference section with non-empty content
5. **TestVectorCoverageRule** -- at least one test vector per equation
6. **DomainColorRule** -- accent color matches the registered domain color palette
7. **ComputeModeRule** -- compute mode is a valid value
8. **UniqueIdRule** -- episode ID is unique across the registry

The pipeline is extensible: custom rules can be added for domain-specific validation (e.g., physics episodes must define conservation laws to check).

**Why**: Composable rules are independently testable, easily extended, and produce clear error messages. The pipeline can run in CI (fail the build on errors) and in the scaffold generator (warn about incomplete configs during development).

**Alternatives considered:**

- Single monolithic validate function: Hard to test, hard to extend
- JSON Schema validation: Cannot validate semantic rules (test vector coverage, domain color matching)
- Runtime-only validation: Misses errors until the episode is loaded; CI should catch them earlier

### Decision 7: Episode Registry as a singleton module

The `EpisodeRegistry` is a module-level singleton that episodes register into at import time:

```typescript
// src/factory/EpisodeRegistry.ts
class EpisodeRegistryImpl {
  private episodes = new Map<string, EpisodeConfig>()

  register(config: EpisodeConfig): void {
    if (this.episodes.has(config.id)) {
      throw new Error(`Episode "${config.id}" is already registered`)
    }
    this.episodes.set(config.id, config)
  }

  getAll(): EpisodeMetadata[] {
    /* ... */
  }
  getById(id: string): EpisodeConfig | undefined {
    /* ... */
  }
  getByDomain(domain: DomainType): EpisodeMetadata[] {
    /* ... */
  }
}

export const EpisodeRegistry = new EpisodeRegistryImpl()
```

Each episode's `index.ts` calls `EpisodeRegistry.register(config)` as a side effect of being imported. The landing page imports the registry and reads `getAll()` to populate the episode grid.

**Why**: A singleton registry is the simplest way to aggregate episode metadata without a build-time code generation step. Import-time registration means adding a new episode is a single import statement -- no manual list to maintain.

**Alternatives considered:**

- Build-time filesystem scanning: Requires a Vite plugin or custom build step; more complexity
- Manual episode list in a central file: Easily falls out of sync when adding/removing episodes
- Dynamic `import()` with glob: Vite supports `import.meta.glob` but introduces async complexity for what should be synchronous metadata

### Decision 8: Test vectors validate equations in isolation

Test vectors run the episode's equation functions in isolation (not the full simulation loop) with known inputs and compare outputs against expected values within a tolerance:

```typescript
interface TestVector {
  name: string // e.g., "Kepler's Third Law - LEO"
  equationId: string // which equation function to test
  inputs: Record<string, number> // parameter values
  expectedOutputs: Record<string, number> // expected results
  tolerance: number // acceptable absolute error
}
```

The `TestVectorRunner` extracts the equation function by `equationId`, sets up an isolated state with the vector's inputs, runs one computation step, and compares outputs. This runs outside the browser in Node.js via Vitest.

Additionally, for physics episodes, **conservation law checks** can be defined: the runner executes N steps and verifies that a conserved quantity (total energy, momentum) remains constant within tolerance across all steps.

**Why**: Isolated equation testing catches math errors without the complexity of a full simulation setup. Test vectors are the most natural format for AI agents to generate -- they can pull known-correct values from textbooks and encode them directly. Conservation checks catch integration errors that single-step vectors miss.

**Alternatives considered:**

- Full simulation integration tests only: Slower, harder to isolate which equation is wrong
- Symbolic verification (computer algebra): Too complex, requires a CAS library
- Golden-file snapshot tests only: Detect regressions but don't prove correctness

## How AI Agents Use This System

An AI agent generating a new episode follows this workflow:

1. **Receive domain brief**: "Create a wave propagation episode for the physics domain"
2. **Run scaffold generator**: `npm run episode:create -- --id wave-lab --domain physics`
3. **Fill in `config.ts`**: Define parameters (wavelength, amplitude, frequency), equations (wave equation, superposition), missions (create standing wave, observe interference), telemetry (displacement, frequency readout), reference (wave equation derivation), and test vectors (known wave equation solutions)
4. **Implement `computation.ts`**: Write the domain-specific `update()` function that computes wave propagation using the declared equations
5. **Implement `renderer.ts`**: Write the Canvas rendering code for visualizing the wave
6. **Run validation**: `npm run episode:validate -- --id wave-lab` to check config completeness
7. **Run test vectors**: `npm run episode:test -- --id wave-lab` to verify equation correctness
8. **Submit PR**: CI runs full validation and test vector suite automatically

The factory handles everything else: parameter sliders, telemetry panel, mission UI, reference panel, and landing page card are all auto-generated from the config.

## Risks / Trade-offs

- **Declarative config vs. full code flexibility**: The factory covers 80% of episode needs declaratively. Episodes with highly custom interactions (e.g., drag-to-build in Bridge Lab) will still need hand-coded components. **Mitigation**: The factory is opt-in; episodes can implement `EpisodeDefinition` directly or use the factory for most UI while overriding specific components.
- **KaTeX dependency for LaTeX rendering**: Adds ~300KB (gzipped ~90KB) to the bundle. **Mitigation**: Lazy-load KaTeX only when the reference panel is opened; it is not in the critical path.
- **Import-time side effects for registry**: Import-time `register()` calls are a side effect, which can cause issues with tree-shaking and test isolation. **Mitigation**: Registration is idempotent within a process. Tests use a `resetRegistry()` helper. Tree-shaking is not a concern since all episodes are intentionally imported.
- **Three compute modes add complexity**: Supporting continuous, discrete, and turn-based in one factory increases the surface area. **Mitigation**: Each mode is implemented as a small adapter function (< 50 lines); the core factory logic is shared.
- **Test vector tolerance selection**: Too-tight tolerance causes false failures; too-loose misses real bugs. **Mitigation**: Default tolerance is configurable per vector. Guidelines recommend tolerances based on integration method (e.g., Velocity Verlet at dt=1/60 expects ~1e-6 relative error for energy conservation).

## Migration Plan

This is a greenfield addition. No existing code is modified.

1. **Phase 1**: Implement core types and factory (`src/factory/`). Verify with a minimal test episode.
2. **Phase 2**: Implement auto-generated UI components. Verify they render correctly with the test episode.
3. **Phase 3**: Implement scaffold generator and validation pipeline. Verify CLI output compiles.
4. **Phase 4**: Implement test vector runner. Verify with known-correct test vectors.
5. **Phase 5**: Integrate registry with landing page episode grid.

Existing hand-coded episodes (e.g., Orbit Lab) are NOT migrated to the factory as part of this proposal. Migration of existing episodes is a separate future change.

**Rollback**: Delete `src/factory/`, `scripts/create-episode.ts`, and any factory-generated episode directories. No other code depends on these files at creation time.

## Open Questions

- **Should the factory support custom React component overrides per UI section?** For example, could an episode use the factory for everything except the parameter panel, providing a custom component for that section? Likely yes, but the override API design is deferred.
- **Should test vectors support non-numeric outputs?** Some domains (civics, history) may have categorical or boolean outcomes. For MVP, test vectors are numeric-only; categorical validation can be added later.
- **Should the scaffold generator support interactive prompts?** For human developers, a guided prompt flow ("What domain? What parameters?") could be helpful. Deferred -- CLI flags are sufficient for both humans and AI agents.
- **Should the registry expose a REST-like API for future backend integration?** Deferred -- the registry is a client-side singleton for the zero-backend MVP.
