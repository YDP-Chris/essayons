# Change: Add episode scaffolding CLI for automated episode generation

## Why

Creating new Essayons episodes currently requires manually duplicating directory structures, copying template files, and wiring up numerous TypeScript imports and registrations. This manual process is error-prone, time-consuming, and blocks the AI weekly content pipeline from autonomously generating episodes from config-driven specifications. A CLI scaffold tool eliminates this bottleneck by accepting episode config JSON (or interactive prompts) and generating a complete, validated episode directory with all boilerplate pre-wired.

## What Changes

- Add Node.js script at `scripts/scaffold-episode.ts` that generates new episode directories from config
- Accept input via `--config <path-to-json>` flag or interactive CLI prompts (episode ID, domain, simulation mode)
- Generate complete episode directory structure at `src/episodes/<id>/`:
  - `config.ts` — TypeScript EpisodeConfig object generated from input JSON with proper imports and types
  - `physics.ts` or `state-machine.ts` — simulation logic template selected based on `simulationMode` (continuous → physics.ts with placeholder integration loop, step-based/event-driven → state-machine.ts with placeholder state transitions)
  - `renderer.ts` — Canvas rendering template with domain-specific accent color injected from brand design system
  - `index.ts` — episode registration that imports config, simulation, and renderer, then registers with the episode factory/registry
  - `<id>.test.ts` — test template with placeholder unit tests for config validation and simulation logic
- Validate input config via existing `src/episodes/validate-config.ts` before generating any files, failing fast if config is invalid
- Add `--dry-run` flag to show what would be created without writing files (outputs file paths and preview of generated content)
- Add `--force` flag to overwrite existing episode directory (default behavior: fail if directory exists)
- Integrate with npm scripts: `npm run scaffold:episode -- --config path/to/config.json` or `npm run scaffold:episode -- --id my-episode --domain physics --mode continuous` for interactive mode
- Add comprehensive error messages for common issues: missing required fields, invalid domain/mode, duplicate episode IDs, filesystem errors

## Impact

- Affected specs: `episode-scaffold` (new capability)
- Affected code:
  - `scripts/scaffold-episode.ts` — main CLI script with arg parsing, config validation, and file generation orchestration
  - `scripts/templates/config.template.ts` — TypeScript template for generated config.ts files
  - `scripts/templates/physics.template.ts` — TypeScript template for continuous simulation physics modules
  - `scripts/templates/state-machine.template.ts` — TypeScript template for step-based/event-driven state machines
  - `scripts/templates/renderer.template.ts` — TypeScript template for Canvas renderer modules
  - `scripts/templates/index.template.ts` — TypeScript template for episode registration index files
  - `scripts/templates/test.template.ts` — TypeScript template for unit test files
  - `scripts/lib/generate-episode-files.ts` — file generation utility functions (template interpolation, filesystem writing)
  - `scripts/lib/validate-episode-input.ts` — input validation logic (wraps `validate-config.ts` with CLI-friendly error formatting)
  - `scripts/lib/interactive-prompts.ts` — interactive CLI prompt handling for no-config mode
  - `package.json` — add `scaffold:episode` npm script entry
  - `scripts/__tests__/scaffold-episode.test.ts` — unit tests for scaffold logic, template generation, and validation
