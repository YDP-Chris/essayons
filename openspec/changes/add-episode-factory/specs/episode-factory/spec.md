## ADDED Requirements

### Requirement: Episode Configuration Format

The system SHALL define an `EpisodeConfig` TypeScript interface that serves as the single declarative description of an episode. The `EpisodeConfig` SHALL include the following required fields: `id` (unique kebab-case string), `name` (human-readable display name), `domain` (one of `physics`, `civics`, `economics`, `history`, `biology`, `engineering`), `accentColor` (hex color string), `icon` (emoji or SVG reference), `tagline` (one-line description), `computeMode` (one of `continuous`, `discrete`, `turn-based`), `parameters` (array of `ParameterDefinition`), `equations` (an `EquationSet`), `missions` (array of `MissionDefinition`), `reference` (array of `ReferenceContent`), `telemetryFields` (array of `TelemetryField`), and `testVectors` (array of `TestVector`). All fields SHALL be statically type-checked at compile time via TypeScript strict mode.

#### Scenario: Valid EpisodeConfig compiles without errors

- **WHEN** a developer creates an `EpisodeConfig` object with all required fields populated with valid values
- **THEN** the TypeScript compiler accepts the object with zero type errors
- **AND** the config can be passed to `EpisodeFactory.create()` to produce a functioning episode

#### Scenario: Missing required field causes compile error

- **WHEN** a developer creates an `EpisodeConfig` object that omits a required field (e.g., `missions` is missing)
- **THEN** the TypeScript compiler emits a type error identifying the missing field
- **AND** the config cannot be passed to `EpisodeFactory.create()` until the field is added

#### Scenario: Invalid domain value causes compile error

- **WHEN** a developer sets the `domain` field to a value not in the `DomainType` union (e.g., `'art'`)
- **THEN** the TypeScript compiler emits a type error indicating the value is not assignable to `DomainType`

#### Scenario: EpisodeConfig supports all six domains

- **WHEN** an `EpisodeConfig` is created with `domain` set to any of `physics`, `civics`, `economics`, `history`, `biology`, or `engineering`
- **THEN** the config is valid and the factory produces an episode with domain-appropriate defaults

### Requirement: Auto-Generated Parameter UI

The system SHALL auto-generate a parameter control panel from the `parameters` array in an `EpisodeConfig`. Each `ParameterDefinition` SHALL produce the appropriate UI control based on its type: `number` parameters SHALL produce a slider with min/max/step constraints and unit display, `boolean` parameters SHALL produce a toggle switch, `enum` parameters SHALL produce a dropdown with labeled options. The generated controls SHALL be two-way bound to the simulation engine's parameter system.

#### Scenario: Number parameter renders as slider

- **WHEN** an `EpisodeConfig` includes a `number` parameter with `key: 'mass'`, `min: 1`, `max: 100`, `step: 0.5`, `unit: 'kg'`, `default: 10`
- **THEN** the factory generates a slider control labeled with the parameter's `label`
- **AND** the slider range is 1 to 100 with 0.5 step increments
- **AND** the current value and unit ("kg") are displayed alongside the slider
- **AND** the slider initializes to the default value of 10

#### Scenario: Boolean parameter renders as toggle

- **WHEN** an `EpisodeConfig` includes a `boolean` parameter with `key: 'showTrail'`, `default: true`
- **THEN** the factory generates a toggle switch labeled with the parameter's `label`
- **AND** the toggle initializes to the ON state (matching `default: true`)

#### Scenario: Enum parameter renders as dropdown

- **WHEN** an `EpisodeConfig` includes an `enum` parameter with options `[{value: 'earth', label: 'Earth'}, {value: 'mars', label: 'Mars'}]` and `default: 'earth'`
- **THEN** the factory generates a dropdown control with "Earth" and "Mars" as selectable options
- **AND** the dropdown initializes to "Earth" (matching `default: 'earth'`)

#### Scenario: Parameter change updates simulation state

- **WHEN** a user adjusts a generated parameter control (e.g., moves a slider)
- **THEN** the new value is validated against the parameter's constraints (clamped for numbers, checked for enum validity)
- **AND** the validated value is applied to the simulation engine's parameter system
- **AND** the simulation immediately reflects the updated parameter value

#### Scenario: Parameter reset restores defaults

- **WHEN** a user activates the "Reset Parameters" action on the generated control panel
- **THEN** all parameters revert to their `default` values as defined in the `EpisodeConfig`
- **AND** all generated UI controls update to reflect the default values
- **AND** the simulation state updates accordingly

### Requirement: Auto-Generated Telemetry Display

The system SHALL auto-generate a telemetry readout panel from the `telemetryFields` array in an `EpisodeConfig`. Each `TelemetryField` SHALL produce a labeled numeric readout displaying the current value of a simulation state variable, formatted with the configured unit, precision, and optional color. Fields with `sparkline: true` SHALL additionally render a mini time-series chart.

#### Scenario: Numeric telemetry readout

- **WHEN** an `EpisodeConfig` includes a telemetry field with `key: 'altitude'`, `label: 'Altitude'`, `unit: 'km'`, `precision: 1`
- **THEN** the factory generates a readout displaying the label "Altitude", the current value rounded to 1 decimal place, and the unit "km"
- **AND** the readout updates in real time as the simulation runs

#### Scenario: Telemetry with sparkline

- **WHEN** a telemetry field has `sparkline: true`
- **THEN** the readout includes a mini time-series chart showing recent values of the field
- **AND** the sparkline updates each frame alongside the numeric readout

#### Scenario: Custom format function

- **WHEN** a telemetry field provides a `formatFn` function
- **THEN** the raw simulation value is passed through `formatFn` before display
- **AND** the formatted string replaces the default numeric formatting (precision + unit)

#### Scenario: Telemetry color coding

- **WHEN** a telemetry field specifies a `color` value (hex string)
- **THEN** the readout value is rendered in the specified color
- **AND** the sparkline (if enabled) uses the same color for its line

### Requirement: Auto-Generated Mission UI

The system SHALL auto-generate mission selection, briefing, objective tracking, and result screens from the `missions` array in an `EpisodeConfig`. Each `MissionDefinition` SHALL include `briefingText`, an `objectives` array with per-objective `description` and `successCondition`, and optional `failureCondition` and `timeLimit` fields.

#### Scenario: Mission briefing display

- **WHEN** a user selects a mission from the mission list
- **THEN** the factory displays a briefing modal showing the mission's `briefingText` and a list of objective descriptions
- **AND** a "Start Mission" button is available to begin the mission

#### Scenario: In-simulation objective tracking

- **WHEN** a mission is active
- **THEN** the factory displays an objective checklist with each objective's description and current status (pending, completed, failed)
- **AND** the checklist updates in real time as objectives are completed or failed based on their condition evaluation

#### Scenario: Mission success

- **WHEN** all required objectives in the active mission transition to `completed` status
- **THEN** the factory displays a success screen with a congratulatory message
- **AND** if another mission is available, a "Next Mission" button is displayed

#### Scenario: Mission failure

- **WHEN** a failure condition evaluates to true during an active mission (e.g., collision, timeout)
- **THEN** the factory displays a failure screen with the failure reason
- **AND** a "Retry" button is available that resets the mission and simulation state

#### Scenario: Sandbox mode bypasses mission constraints

- **WHEN** the user selects sandbox mode
- **THEN** no mission constraints are active
- **AND** no success or failure conditions are evaluated
- **AND** all parameters are unlocked for free exploration

### Requirement: Episode Scaffold Generator

The system SHALL provide a CLI command (`npm run episode:create -- --id <id> --domain <domain>`) that generates the boilerplate file structure for a new episode. The generator SHALL create a directory `src/episodes/<id>/` containing `config.ts`, `computation.ts`, `renderer.ts`, `index.ts`, and `__tests__/computation.test.ts`.

#### Scenario: Successful scaffold generation

- **WHEN** a user runs `npm run episode:create -- --id wave-lab --domain physics`
- **THEN** the directory `src/episodes/wave-lab/` is created
- **AND** `config.ts` contains an `EpisodeConfig` template with `id: 'wave-lab'`, `domain: 'physics'`, and domain-appropriate defaults (accent color `#00D4AA` for physics)
- **AND** `computation.ts` contains a typed `update` function skeleton
- **AND** `renderer.ts` contains a typed `render` function skeleton with layer registration boilerplate
- **AND** `index.ts` imports the config, computation, and renderer, and calls `EpisodeFactory.create()`
- **AND** `__tests__/computation.test.ts` contains a test template with test vector validation boilerplate

#### Scenario: Invalid episode ID rejected

- **WHEN** a user runs `npm run episode:create -- --id "My Episode" --domain physics`
- **THEN** the generator rejects the ID with an error message indicating the ID must be kebab-case
- **AND** no files are created

#### Scenario: Invalid domain rejected

- **WHEN** a user runs `npm run episode:create -- --id valid-id --domain art`
- **THEN** the generator rejects the domain with an error message listing valid domain values
- **AND** no files are created

#### Scenario: Directory conflict prevented

- **WHEN** a user runs the generator with an `--id` whose directory already exists at `src/episodes/<id>/`
- **THEN** the generator aborts with an error message indicating the directory already exists
- **AND** existing files are not overwritten or modified

#### Scenario: Generated files compile without errors

- **WHEN** the scaffold generator creates an episode directory
- **THEN** all generated TypeScript files pass compilation with zero type errors under strict mode
- **AND** the generated `index.ts` produces a valid `EpisodeDefinition` when executed

### Requirement: Equation Test Vector Validation

The system SHALL provide a test vector validation framework that verifies episode computation correctness by running known input/output pairs defined in `EpisodeConfig.testVectors`. Each `TestVector` SHALL specify a `name`, `equationId`, `inputs` (key-value map), `expectedOutputs` (key-value map), and `tolerance` (acceptable absolute error). The system SHALL execute the referenced equation with the given inputs and compare outputs against expected values.

#### Scenario: Passing test vector

- **WHEN** an episode defines a test vector with `inputs: { mass: 10, velocity: 5 }`, `expectedOutputs: { kineticEnergy: 125 }`, and `tolerance: 0.001`
- **AND** the episode's equation function computes `kineticEnergy = 0.5 * mass * velocity^2 = 125.0`
- **THEN** the test vector passes because `|125.0 - 125| = 0 < 0.001`

#### Scenario: Failing test vector

- **WHEN** an episode defines a test vector with `expectedOutputs: { kineticEnergy: 125 }` and `tolerance: 0.001`
- **AND** the equation function computes `kineticEnergy = 130.0`
- **THEN** the test vector fails because `|130.0 - 125| = 5 > 0.001`
- **AND** the failure report includes the vector name, expected value, actual value, and the exceeded tolerance

#### Scenario: Conservation law check

- **WHEN** an episode defines a conservation check for total energy with `tolerance: 1e-6`
- **AND** the test runner executes 1000 simulation steps
- **THEN** the runner verifies that total energy at step 1000 is within `tolerance` of total energy at step 0
- **AND** if the drift exceeds tolerance, the check fails with a report showing the energy drift per step

#### Scenario: Batch test vector execution

- **WHEN** the test suite runs `npm run episode:test -- --id orbit-lab`
- **THEN** all test vectors defined in the orbit-lab config are executed
- **AND** a summary report shows the count of passed, failed, and total test vectors
- **AND** the exit code is 0 if all vectors pass, non-zero if any fail

### Requirement: Content Validation

The system SHALL provide a content validation pipeline that checks an `EpisodeConfig` for completeness and correctness before the episode is loaded or deployed. Validation SHALL return a structured `ValidationResult` containing a `valid` boolean, an `errors` array (blocking issues), and a `warnings` array (non-blocking suggestions). An `EpisodeConfig` with any errors SHALL be considered invalid.

#### Scenario: Valid config passes validation

- **WHEN** an `EpisodeConfig` has all required fields populated, valid parameter ranges, at least one mission, non-empty reference content, test vectors covering all equations, and a domain-compliant accent color
- **THEN** the validation result has `valid: true`, zero errors, and zero or more warnings

#### Scenario: Missing required field produces error

- **WHEN** an `EpisodeConfig` has the `tagline` field set to an empty string
- **THEN** the validation result includes an error with `field: 'tagline'` and a message indicating the field must not be empty
- **AND** `valid` is `false`

#### Scenario: Invalid parameter range produces error

- **WHEN** a parameter defines `min: 100` and `max: 50` (min greater than max)
- **THEN** the validation result includes an error with `field: 'parameters[n].min'` and a message indicating min must be less than max
- **AND** `valid` is `false`

#### Scenario: Parameter default out of range produces error

- **WHEN** a number parameter defines `min: 0`, `max: 100`, and `default: 150`
- **THEN** the validation result includes an error indicating the default value must be within the min/max range

#### Scenario: No missions produces error

- **WHEN** the `missions` array is empty
- **THEN** the validation result includes an error indicating at least one mission must be defined

#### Scenario: Missing test vector coverage produces warning

- **WHEN** the `equations` define three equation functions but `testVectors` only covers two of them
- **THEN** the validation result includes a warning indicating the uncovered equation lacks test vectors
- **AND** `valid` remains `true` (warnings do not block validity)

#### Scenario: Domain accent color mismatch produces error

- **WHEN** the `domain` is `physics` but `accentColor` is set to `#FFB800` (the economics color, not the physics color `#00D4AA`)
- **THEN** the validation result includes an error indicating the accent color does not match the registered color for the physics domain

#### Scenario: CI pipeline runs validation

- **WHEN** a pull request includes changes to any episode's config file
- **THEN** the CI pipeline runs the content validation pipeline on all registered episodes
- **AND** the build fails if any episode config has validation errors

### Requirement: Episode Registry

The system SHALL provide a central `EpisodeRegistry` that aggregates all registered episodes and exposes their metadata for use by the landing page and routing systems. Episodes SHALL register themselves by calling `EpisodeRegistry.register(config)` at import time. The registry SHALL expose `getAll()`, `getById(id)`, and `getByDomain(domain)` query methods. The registry SHALL reject duplicate episode IDs.

#### Scenario: Episode registration

- **WHEN** an episode's `index.ts` module is imported
- **THEN** the episode's `EpisodeConfig` is registered in the `EpisodeRegistry`
- **AND** the episode's metadata (id, name, domain, accentColor, icon, tagline) is available via `getAll()`

#### Scenario: Landing page reads registry

- **WHEN** the landing page component renders the episode grid
- **THEN** it calls `EpisodeRegistry.getAll()` to retrieve metadata for all registered episodes
- **AND** each episode is displayed as a card with its name, icon, tagline, and domain accent color

#### Scenario: Domain-filtered query

- **WHEN** `EpisodeRegistry.getByDomain('physics')` is called
- **THEN** only episodes with `domain: 'physics'` are returned

#### Scenario: Duplicate ID rejection

- **WHEN** two episodes attempt to register with the same `id`
- **THEN** the second registration throws an error identifying the duplicate ID
- **AND** the first registration remains intact

#### Scenario: Episode lookup by ID

- **WHEN** `EpisodeRegistry.getById('orbit-lab')` is called and an episode with that ID is registered
- **THEN** the full `EpisodeConfig` for orbit-lab is returned
- **AND** if no episode with that ID is registered, `undefined` is returned
