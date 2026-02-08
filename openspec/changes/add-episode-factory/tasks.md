## 1. Core Type Definitions

- [ ] 1.1 Define `EpisodeConfig` interface in `src/factory/EpisodeConfig.ts` with all required fields: `id`, `name`, `domain`, `accentColor`, `icon`, `tagline`, `computeMode`, `parameters`, `equations`, `missions`, `reference`, `telemetryFields`, `testVectors`
- [ ] 1.2 Define `DomainType` union type: `'physics' | 'civics' | 'economics' | 'history' | 'biology' | 'engineering'`
- [ ] 1.3 Define `ParameterDefinition` type with UI hint extensions: `slider`, `toggle`, `dropdown`, `range-pair`, inheriting from the simulation engine's base parameter types
- [ ] 1.4 Define `EquationSet` interface for declaring computation functions with named inputs, outputs, and symbolic descriptions
- [ ] 1.5 Define `MissionDefinition` interface with `briefingText`, `objectives` array (each with `description`, `successCondition`, `failureCondition`), `timeLimit`, and `initialStateOverrides`
- [ ] 1.6 Define `TelemetryField` interface with `key`, `label`, `unit`, `precision`, `color`, `sparkline` (boolean), `formatFn` (optional)
- [ ] 1.7 Define `ReferenceContent` interface with `title`, `sections` array (each with `heading`, `markdown`, `equations`)
- [ ] 1.8 Define `TestVector` interface with `name`, `inputs` (key-value), `expectedOutputs` (key-value), `tolerance` (number), `equationId` (string)
- [ ] 1.9 Define `ComputeMode` union type: `'continuous' | 'discrete' | 'turn-based'`
- [ ] 1.10 Write unit tests for type guards and validation utilities for all defined types

## 2. Episode Factory Core

- [ ] 2.1 Implement `EpisodeFactory.create(config: EpisodeConfig): EpisodeDefinition` that transforms a config into a fully functional episode definition compatible with the simulation engine plugin interface
- [ ] 2.2 Implement `computeMode` routing: map `continuous` to `requestAnimationFrame` loop, `discrete` to step-on-event, `turn-based` to explicit advance calls
- [ ] 2.3 Implement equation wiring: connect `EquationSet` functions to the simulation engine's `update()` lifecycle hook
- [ ] 2.4 Implement `init()` lifecycle hook generation: register parameters, layers, input bindings, and missions from config
- [ ] 2.5 Implement `cleanup()` lifecycle hook generation: teardown all registered resources
- [ ] 2.6 Implement `createInitialState()` generation from parameter defaults and mission initial state overrides
- [ ] 2.7 Write unit tests for factory output: verify the produced `EpisodeDefinition` has correct lifecycle hooks, parameter count, and mission count

## 3. Auto-Generated Parameter UI

- [ ] 3.1 Implement `ParameterUIGenerator` React component that maps `ParameterDefinition[]` to a panel of controls
- [ ] 3.2 Implement slider control for `number` parameters with `min`, `max`, `step`, `unit` display, and `displayPrecision`
- [ ] 3.3 Implement toggle control for `boolean` parameters
- [ ] 3.4 Implement dropdown control for `enum` parameters with labeled options
- [ ] 3.5 Implement range-pair control for linked min/max parameter pairs (e.g., altitude range)
- [ ] 3.6 Implement parameter grouping: group controls by optional `group` field in ParameterDefinition
- [ ] 3.7 Implement parameter reset button that restores all parameters to their config-defined defaults
- [ ] 3.8 Apply domain accent color to active slider tracks and control highlights
- [ ] 3.9 Write component tests for each control type using React Testing Library

## 4. Auto-Generated Telemetry Display

- [ ] 4.1 Implement `TelemetryUIGenerator` React component that maps `TelemetryField[]` to a real-time readout panel
- [ ] 4.2 Implement numeric readout with configurable unit, precision, and color
- [ ] 4.3 Implement optional sparkline mini-chart for fields with `sparkline: true`
- [ ] 4.4 Implement value formatting pipeline: raw value -> formatFn (if provided) -> precision rounding -> unit suffix
- [ ] 4.5 Implement telemetry field grouping for organized display
- [ ] 4.6 Write component tests for telemetry rendering and value formatting

## 5. Auto-Generated Mission UI

- [ ] 5.1 Implement `MissionUIGenerator` React component that maps `MissionDefinition[]` to a mission selection and tracking UI
- [ ] 5.2 Implement mission briefing modal showing `briefingText` and objective list before mission start
- [ ] 5.3 Implement in-simulation objective checklist with real-time status (pending, completed, failed)
- [ ] 5.4 Implement mission success screen with congratulatory message and next-mission prompt
- [ ] 5.5 Implement mission failure screen with failure reason and retry option
- [ ] 5.6 Implement sandbox mode toggle that bypasses mission constraints
- [ ] 5.7 Write component tests for mission UI state transitions

## 6. Auto-Generated Reference Panel

- [ ] 6.1 Implement `ReferenceGenerator` React component that maps `ReferenceContent[]` to a tabbed reference panel
- [ ] 6.2 Implement markdown rendering for reference section content
- [ ] 6.3 Implement LaTeX equation rendering within reference sections (using KaTeX or similar lightweight library)
- [ ] 6.4 Implement collapsible sections for long reference content
- [ ] 6.5 Write component tests for reference panel rendering

## 7. Episode Scaffold Generator (CLI)

- [ ] 7.1 Implement `scripts/create-episode.ts` CLI entry point accepting `--id` and `--domain` arguments
- [ ] 7.2 Validate CLI inputs: `id` must be kebab-case, `domain` must be a valid `DomainType`
- [ ] 7.3 Generate `src/episodes/<id>/config.ts` template with domain-appropriate defaults and placeholder equations
- [ ] 7.4 Generate `src/episodes/<id>/computation.ts` template with typed `update` function skeleton
- [ ] 7.5 Generate `src/episodes/<id>/renderer.ts` template with typed `render` function skeleton and layer registration
- [ ] 7.6 Generate `src/episodes/<id>/index.ts` entry point that imports config, computation, renderer and calls `EpisodeFactory.create()`
- [ ] 7.7 Generate `src/episodes/<id>/__tests__/computation.test.ts` template with test vector validation boilerplate
- [ ] 7.8 Auto-register the new episode in the `EpisodeRegistry`
- [ ] 7.9 Add `episode:create` script to `package.json`
- [ ] 7.10 Write integration test: run the generator, verify output files exist and pass TypeScript compilation

## 8. Equation Test Vector Validation

- [ ] 8.1 Implement `TestVectorRunner` class that executes test vectors from `EpisodeConfig.testVectors`
- [ ] 8.2 Implement input injection: set parameter values to test vector inputs and run one computation step
- [ ] 8.3 Implement output comparison: compare simulation outputs against expected values within specified tolerance
- [ ] 8.4 Implement batch execution: run all test vectors for an episode and report pass/fail summary
- [ ] 8.5 Implement conservation law checks: verify energy, momentum, or other conserved quantities remain constant across multiple steps (configurable per episode)
- [ ] 8.6 Implement regression suite: snapshot-based tests that detect output changes across code updates
- [ ] 8.7 Add `episode:test` script to `package.json` that runs test vectors for a specified episode or all episodes
- [ ] 8.8 Write unit tests for the test vector runner itself using known-correct trivial equations

## 9. Content Validation Pipeline

- [ ] 9.1 Implement `ContentValidator.validate(config: EpisodeConfig): ValidationResult` that checks config completeness
- [ ] 9.2 Validate required fields: all top-level fields must be present and non-empty
- [ ] 9.3 Validate parameter ranges: `min < max`, `step > 0`, `default` within `[min, max]`
- [ ] 9.4 Validate missions: at least one mission defined, each mission has at least one objective with a success condition
- [ ] 9.5 Validate reference content: at least one reference section with non-empty markdown
- [ ] 9.6 Validate test vectors: at least one test vector per equation, tolerance > 0
- [ ] 9.7 Validate domain accent color: must match the registered color for the declared domain
- [ ] 9.8 Validate compute mode: must be a valid `ComputeMode` value
- [ ] 9.9 Return structured `ValidationResult` with `valid` boolean, `errors` array, and `warnings` array
- [ ] 9.10 Write unit tests for each validation rule with both passing and failing inputs

## 10. Episode Registry

- [ ] 10.1 Implement `EpisodeRegistry` singleton with `register(config: EpisodeConfig)` and `getAll(): EpisodeMetadata[]`
- [ ] 10.2 Implement `EpisodeMetadata` type: `id`, `name`, `domain`, `accentColor`, `icon`, `tagline` (subset of EpisodeConfig for landing page)
- [ ] 10.3 Implement `getByDomain(domain: DomainType): EpisodeMetadata[]` for domain-filtered queries
- [ ] 10.4 Implement `getById(id: string): EpisodeConfig | undefined` for individual episode lookup
- [ ] 10.5 Integrate registry output with landing page episode grid component
- [ ] 10.6 Write unit tests for registry operations: register, lookup, domain filter, duplicate detection

## 11. Integration and CI

- [ ] 11.1 Add CI step to run content validation on all registered episodes before merge
- [ ] 11.2 Add CI step to run test vector validation on all registered episodes before merge
- [ ] 11.3 Add CI step to verify scaffold generator produces compilable output
- [ ] 11.4 Write end-to-end test: define a minimal test EpisodeConfig, run through factory, verify all UI panels render and simulation runs for 100 frames without error
- [ ] 11.5 Document the factory API with JSDoc comments on all public interfaces and functions
