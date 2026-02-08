## ADDED Requirements

### Requirement: Episode Directory Generation from Config

The system SHALL accept an episode configuration in JSON format (via `--config <path>` flag or programmatic API) and generate a complete episode directory at `src/episodes/<id>/` containing all required TypeScript files for a functional episode: `config.ts`, simulation logic file (`physics.ts` or `state-machine.ts` based on simulation mode), `renderer.ts`, `index.ts`, and `<id>.test.ts`. The system SHALL validate the input config using the existing `validate-config.ts` validation logic before generating any files, and SHALL fail with exit code 1 and descriptive error messages if validation fails.

#### Scenario: Valid config generates complete episode directory

- **WHEN** the scaffold script is invoked with `--config path/to/valid-episode.json`
- **THEN** the system SHALL create directory `src/episodes/<id>/` and write files `config.ts`, `physics.ts` (if continuous mode) or `state-machine.ts` (if discrete mode), `renderer.ts`, `index.ts`, and `<id>.test.ts`, then exit with code 0

#### Scenario: Invalid config fails before file generation

- **WHEN** the scaffold script is invoked with a config file where a parameter's default value exceeds its max value
- **THEN** the system SHALL detect the validation error, print a descriptive error message specifying which parameter and constraint failed, create no files, and exit with code 1

#### Scenario: Duplicate episode ID is rejected

- **WHEN** the scaffold script is invoked with a config where the episode ID matches an existing directory in `src/episodes/`
- **THEN** the system SHALL detect the duplicate ID, print an error message suggesting use of `--force` to overwrite or choosing a different ID, create no files, and exit with code 2

#### Scenario: Config file not found

- **WHEN** the scaffold script is invoked with `--config path/to/nonexistent.json`
- **THEN** the system SHALL print an error message indicating the file was not found, create no files, and exit with code 4

#### Scenario: Malformed JSON config

- **WHEN** the scaffold script is invoked with a config file containing invalid JSON syntax
- **THEN** the system SHALL print an error message indicating the JSON parse error with line/column information, create no files, and exit with code 1

### Requirement: Simulation Mode Template Selection

The system SHALL generate simulation logic files based on the `simulationMode` field in the episode config. For `continuous` mode, the system SHALL generate `physics.ts` with a placeholder physics engine class containing `init()`, `step(dt)`, and `getState()` methods and comments indicating where integration logic should be implemented. For `step-based`, `event-driven`, or `turn-based` modes, the system SHALL generate `state-machine.ts` with a placeholder state machine class containing states enum, `transition(event)`, and `tick()` methods. The system SHALL NOT generate both files.

#### Scenario: Continuous mode generates physics.ts

- **WHEN** the scaffold script is invoked with a config where `simulationMode` is `"continuous"`
- **THEN** the system SHALL generate `src/episodes/<id>/physics.ts` with a `PhysicsEngine` class and SHALL NOT generate `state-machine.ts`

#### Scenario: Step-based mode generates state-machine.ts

- **WHEN** the scaffold script is invoked with a config where `simulationMode` is `"step-based"`
- **THEN** the system SHALL generate `src/episodes/<id>/state-machine.ts` with a `StateMachine` class and SHALL NOT generate `physics.ts`

#### Scenario: Event-driven mode generates state-machine.ts

- **WHEN** the scaffold script is invoked with a config where `simulationMode` is `"event-driven"`
- **THEN** the system SHALL generate `src/episodes/<id>/state-machine.ts` with a `StateMachine` class and SHALL NOT generate `physics.ts`

#### Scenario: Turn-based mode generates state-machine.ts

- **WHEN** the scaffold script is invoked with a config where `simulationMode` is `"turn-based"`
- **THEN** the system SHALL generate `src/episodes/<id>/state-machine.ts` with a `StateMachine` class and SHALL NOT generate `physics.ts`

### Requirement: Domain Color Injection

The system SHALL inject the domain-specific accent color from the brand design system into the generated `renderer.ts` file. The system SHALL maintain a static lookup table mapping each `EpisodeDomain` enum value to its corresponding hex color code. The system SHALL replace a `{{domainColor}}` placeholder in the renderer template with the looked-up color value.

#### Scenario: Physics domain injects correct color

- **WHEN** the scaffold script is invoked with a config where `domain` is `"physics"`
- **THEN** the generated `renderer.ts` file SHALL contain the hex color code `#00D4AA` in place of the `{{domainColor}}` placeholder

#### Scenario: Civics domain injects correct color

- **WHEN** the scaffold script is invoked with a config where `domain` is `"civics"`
- **THEN** the generated `renderer.ts` file SHALL contain the hex color code for the civics domain (as defined in the scaffold script's color lookup table) in place of the `{{domainColor}}` placeholder

#### Scenario: Unknown domain fails validation

- **WHEN** the scaffold script is invoked with a config where `domain` is `"astrology"` (not a valid EpisodeDomain)
- **THEN** the system SHALL fail validation, print an error message listing valid domains, create no files, and exit with code 1

### Requirement: Config-to-TypeScript Conversion

The system SHALL convert the input JSON episode config into a valid TypeScript object literal assigned to a named export constant in `config.ts`. The generated TypeScript SHALL use proper syntax: string literals quoted, numeric/boolean literals unquoted, readonly modifiers on the interface, proper indentation (2 spaces), and correct type annotations (`EpisodeConfig` type import).

#### Scenario: String values are properly quoted

- **WHEN** the scaffold script generates `config.ts` from a config with `title: "Orbit Lab"`
- **THEN** the generated TypeScript SHALL contain `title: 'Orbit Lab',` (or double quotes, consistently)

#### Scenario: Numeric values are unquoted

- **WHEN** the scaffold script generates `config.ts` from a config with a parameter `default: 42`
- **THEN** the generated TypeScript SHALL contain `default: 42,` (no quotes around the number)

#### Scenario: Boolean values are unquoted

- **WHEN** the scaffold script generates `config.ts` from a config with a parameter `default: true`
- **THEN** the generated TypeScript SHALL contain `default: true,` (not `'true'` as a string)

#### Scenario: Nested arrays and objects are formatted

- **WHEN** the scaffold script generates `config.ts` from a config with a `parameters` array containing parameter objects
- **THEN** the generated TypeScript SHALL format the array with proper indentation, one parameter object per element, with nested object properties indented

#### Scenario: Special characters in strings are escaped

- **WHEN** the scaffold script generates `config.ts` from a config with a description containing a single quote: `"It's orbital mechanics"`
- **THEN** the generated TypeScript SHALL properly escape the quote (e.g., `'It\'s orbital mechanics'` or use double quotes)

### Requirement: Dry-Run Mode

The system SHALL support a `--dry-run` flag that generates all files in memory and logs file paths and previews to stdout, but does NOT write any files to disk. The system SHALL exit with code 0 if dry-run generation succeeds, or with an error code if validation or generation fails. The system SHALL log the first 20 lines of each generated file as a preview.

#### Scenario: Dry-run does not create files

- **WHEN** the scaffold script is invoked with `--config path/to/valid-episode.json --dry-run`
- **THEN** the system SHALL log file paths and previews but SHALL NOT create any directories or files in `src/episodes/`, and SHALL exit with code 0

#### Scenario: Dry-run validates config

- **WHEN** the scaffold script is invoked with `--config path/to/invalid-episode.json --dry-run`
- **THEN** the system SHALL detect validation errors, print error messages, and exit with code 1 without logging any file previews

#### Scenario: Dry-run logs file previews

- **WHEN** the scaffold script is invoked with `--config path/to/valid-episode.json --dry-run`
- **THEN** the system SHALL log each file path prefixed with `[DRY RUN] Would create:` followed by the first 20 lines of the generated file content

### Requirement: Force Overwrite Mode

The system SHALL support a `--force` flag that allows overwriting an existing episode directory. When `--force` is used without `--yes`, the system SHALL prompt for confirmation before deleting the existing directory. When `--force --yes` are both used, the system SHALL delete the existing directory without prompting. If `--force` is not used and the episode ID already exists, the system SHALL fail with exit code 2.

#### Scenario: Force mode overwrites existing directory

- **WHEN** the scaffold script is invoked with `--config path/to/episode.json --force --yes` and the episode ID already exists in `src/episodes/`
- **THEN** the system SHALL delete the existing directory, generate all files, and exit with code 0

#### Scenario: Force mode prompts for confirmation

- **WHEN** the scaffold script is invoked with `--config path/to/episode.json --force` (without `--yes`) and the episode ID already exists
- **THEN** the system SHALL print a confirmation prompt asking whether to delete the existing directory, and SHALL wait for user input before proceeding

#### Scenario: Force mode cancelled by user

- **WHEN** the scaffold script is invoked with `--config path/to/episode.json --force`, the episode ID already exists, and the user responds "no" to the confirmation prompt
- **THEN** the system SHALL print a cancellation message, create no files, and exit with code 0

#### Scenario: Without force, existing ID fails

- **WHEN** the scaffold script is invoked with `--config path/to/episode.json` (no `--force`) and the episode ID already exists
- **THEN** the system SHALL print an error message indicating the duplicate ID and suggesting `--force`, create no files, and exit with code 2

### Requirement: Interactive Prompt Mode

The system SHALL support an interactive mode when invoked without the `--config` flag. In interactive mode, the system SHALL prompt the user for essential episode fields: ID, domain (select from enum), simulation mode (select from enum), title, subtitle, and description. The system SHALL generate a minimal config with one placeholder parameter, one placeholder mission, one placeholder equation, and one placeholder reference content entry. The system SHALL validate the collected input and generate files as in config-based mode.

#### Scenario: Interactive mode launches prompts

- **WHEN** the scaffold script is invoked without any arguments
- **THEN** the system SHALL display interactive prompts for episode ID, domain, simulation mode, title, subtitle, and description, collect user input, generate a minimal config, and create episode files

#### Scenario: Interactive mode validates episode ID format

- **WHEN** the user enters an episode ID with spaces or invalid characters in interactive mode
- **THEN** the system SHALL re-prompt with an error message indicating valid ID format (kebab-case, alphanumeric + hyphens only)

#### Scenario: Interactive mode provides domain selection

- **WHEN** the interactive prompt for domain is displayed
- **THEN** the system SHALL present a list of valid domains (physics, civics, economics, history, biology, engineering) for the user to select

#### Scenario: Interactive mode provides simulation mode selection

- **WHEN** the interactive prompt for simulation mode is displayed
- **THEN** the system SHALL present a list of valid simulation modes (continuous, step-based, event-driven, turn-based) for the user to select

#### Scenario: Interactive mode generates minimal placeholders

- **WHEN** the scaffold script completes interactive prompts and generates files
- **THEN** the generated `config.ts` SHALL contain one placeholder parameter with default min/max/step, one placeholder mission with one objective, one placeholder equation, and one placeholder reference content entry

### Requirement: Error Messages and Exit Codes

The system SHALL emit descriptive error messages for all failure modes, specifying what failed, why it failed, and how to fix it. The system SHALL use distinct exit codes for different error classes: 0 for success, 1 for invalid config (validation failed), 2 for duplicate episode ID, 3 for filesystem error (permissions, disk full), and 4 for invalid arguments (bad flags, missing required args).

#### Scenario: Validation error lists all issues

- **WHEN** the scaffold script is invoked with a config that has multiple validation errors (e.g., missing required field, invalid parameter constraint)
- **THEN** the error message SHALL list all validation errors, not just the first one, each on a separate line with context (field name, issue description)

#### Scenario: Filesystem permission error

- **WHEN** the scaffold script attempts to write to `src/episodes/` but the directory is not writable
- **THEN** the system SHALL print an error message indicating the permission issue, suggest checking file permissions, and exit with code 3

#### Scenario: Missing required argument

- **WHEN** the scaffold script is invoked with an unrecognized flag `--unknown`
- **THEN** the system SHALL print an error message indicating the invalid flag, suggest running `--help`, and exit with code 4

#### Scenario: Help flag displays usage

- **WHEN** the scaffold script is invoked with `--help`
- **THEN** the system SHALL print usage instructions, list all flags with descriptions, show example invocations, and exit with code 0

### Requirement: JSON Output Mode for Machine Parsing

The system SHALL support a `--json` flag that emits structured JSON output instead of human-readable text. In JSON mode, the system SHALL output a JSON object with `success` boolean, `episodeId` string (if successful), `filesCreated` array (if successful), `errors` array (if failed), and `exitCode` number. This enables AI agents and automation tools to parse scaffold results programmatically.

#### Scenario: JSON output on success

- **WHEN** the scaffold script is invoked with `--config path/to/valid-episode.json --json` and generation succeeds
- **THEN** the system SHALL output a JSON object with `{"success": true, "episodeId": "<id>", "filesCreated": [<array of file paths>]}` and exit with code 0

#### Scenario: JSON output on validation failure

- **WHEN** the scaffold script is invoked with `--config path/to/invalid-episode.json --json` and validation fails
- **THEN** the system SHALL output a JSON object with `{"success": false, "errors": [<array of error messages>], "exitCode": 1}` and exit with code 1

#### Scenario: JSON output on duplicate ID

- **WHEN** the scaffold script is invoked with a config where the episode ID already exists, with `--json` flag
- **THEN** the system SHALL output a JSON object with `{"success": false, "errors": ["Episode ID '<id>' already exists..."], "exitCode": 2}` and exit with code 2

#### Scenario: JSON output does not include human-readable text

- **WHEN** the scaffold script is invoked with `--json` flag
- **THEN** the system SHALL output only valid JSON to stdout (no additional log lines or progress messages), enabling direct JSON parsing by consuming tools

### Requirement: NPM Script Integration

The system SHALL be invokable via `npm run scaffold:episode` with arguments passed after `--`. The system SHALL be registered in `package.json` under the `scripts` section as `"scaffold:episode": "tsx scripts/scaffold-episode.ts"`. The system SHALL support all flags and modes when invoked via npm script.

#### Scenario: NPM script invocation with config

- **WHEN** the command `npm run scaffold:episode -- --config scripts/my-episode.json` is executed
- **THEN** the scaffold script SHALL receive the `--config` argument with the correct path and generate episode files

#### Scenario: NPM script invocation in interactive mode

- **WHEN** the command `npm run scaffold:episode` is executed without arguments
- **THEN** the scaffold script SHALL launch interactive prompts

#### Scenario: NPM script invocation with dry-run

- **WHEN** the command `npm run scaffold:episode -- --config scripts/my-episode.json --dry-run` is executed
- **THEN** the scaffold script SHALL execute in dry-run mode and output file previews without writing files

#### Scenario: NPM script invocation with help

- **WHEN** the command `npm run scaffold:episode -- --help` is executed
- **THEN** the scaffold script SHALL display help text and exit with code 0

### Requirement: Programmatic API for AI Agent Integration

The system SHALL export a `scaffoldEpisode()` function from `scripts/scaffold-episode.ts` that can be invoked programmatically by other Node.js scripts or AI agent workflows. The function SHALL accept options object with `config`, `configPath`, `dryRun`, `force`, and `verbose` fields, and SHALL return a Promise that resolves to an object with `success` boolean, `episodeId` string (if successful), and `errors` array (if failed).

#### Scenario: Programmatic API invocation succeeds

- **WHEN** an AI agent script calls `scaffoldEpisode({ config: validConfigObject })` programmatically
- **THEN** the function SHALL generate episode files and return `{ success: true, episodeId: '<id>' }`

#### Scenario: Programmatic API invocation fails validation

- **WHEN** an AI agent script calls `scaffoldEpisode({ config: invalidConfigObject })` programmatically
- **THEN** the function SHALL validate the config, detect errors, and return `{ success: false, errors: [<array of error messages>] }` without throwing an exception

#### Scenario: Programmatic API supports dry-run

- **WHEN** an AI agent script calls `scaffoldEpisode({ config: validConfigObject, dryRun: true })` programmatically
- **THEN** the function SHALL generate files in memory, return `{ success: true, episodeId: '<id>' }`, and NOT write any files to disk

#### Scenario: Programmatic API accepts config object

- **WHEN** an AI agent script calls `scaffoldEpisode({ config: <EpisodeConfig object> })` programmatically (passing config object directly, not file path)
- **THEN** the function SHALL accept the in-memory config object, validate it, and generate files without requiring a JSON file on disk

### Requirement: Test File Template

The system SHALL generate a test file `<id>.test.ts` in the episode directory with placeholder unit tests. The test file SHALL import the episode config, import the simulation logic module (`physics.ts` or `state-machine.ts`), and include skeleton test cases for config validation and basic simulation initialization. The test file SHALL be runnable with `npm test` and SHALL pass with placeholder assertions.

#### Scenario: Test file validates config

- **WHEN** the scaffold script generates `<id>.test.ts`
- **THEN** the file SHALL include a test case that imports the episode config and calls `validateConfig()` with the config, asserting that the result has `valid: true` and `errors: []`

#### Scenario: Test file tests simulation initialization

- **WHEN** the scaffold script generates `<id>.test.ts` for a continuous mode episode
- **THEN** the file SHALL include a test case that imports the `PhysicsEngine` class, instantiates it, calls `init()` with default parameters, and asserts that `getState()` returns a non-null state object (placeholder assertion)

#### Scenario: Test file is executable

- **WHEN** the scaffold script generates an episode and the developer runs `npm test`
- **THEN** the generated `<id>.test.ts` file SHALL execute without errors, and all placeholder tests SHALL pass

### Requirement: Template File Formatting

The system SHALL generate TypeScript files that conform to the project's code style conventions: 2-space indentation, single quotes for strings, semicolons at statement ends, named exports (no default exports), kebab-case file names, and PascalCase component/class names. The generated files SHALL pass TypeScript type-checking and ESLint/Prettier linting without errors.

#### Scenario: Generated files use 2-space indentation

- **WHEN** the scaffold script generates any TypeScript file
- **THEN** all nested blocks SHALL be indented by 2 spaces per level

#### Scenario: Generated files use single quotes

- **WHEN** the scaffold script generates any TypeScript file containing string literals
- **THEN** all string literals SHALL use single quotes (e.g., `'hello'` not `"hello"`)

#### Scenario: Generated files use named exports

- **WHEN** the scaffold script generates any TypeScript file with exports
- **THEN** all exports SHALL be named exports (e.g., `export const config = ...`) not default exports (e.g., `export default config`)

#### Scenario: Generated files pass type-checking

- **WHEN** the scaffold script generates an episode directory
- **THEN** running `npx tsc --noEmit` on the generated files SHALL succeed without type errors

#### Scenario: Generated files pass linting

- **WHEN** the scaffold script generates an episode directory
- **THEN** running `npx eslint src/episodes/<id>/` SHALL succeed without linting errors
