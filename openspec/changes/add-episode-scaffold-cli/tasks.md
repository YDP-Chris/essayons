## 1. Foundation and Templates

- [ ] 1.1 Create `scripts/templates/` directory for episode code templates
- [ ] 1.2 Create `config.template.ts` with placeholders for id, title, subtitle, domain, simulationMode, parameters, equations, missions, referenceContent arrays (supports JSON → TypeScript object literal transformation)
- [ ] 1.3 Create `physics.template.ts` with placeholder continuous simulation physics loop (init state, update step with delta time, expose state accessor)
- [ ] 1.4 Create `state-machine.template.ts` with placeholder state machine for step-based/event-driven/turn-based modes (states enum, transition handlers, event dispatcher)
- [ ] 1.5 Create `renderer.template.ts` with Canvas rendering boilerplate (canvas setup, render function, domain color injection from brand system)
- [ ] 1.6 Create `index.template.ts` with episode registration imports and factory/registry wiring
- [ ] 1.7 Create `test.template.ts` with placeholder test structure (config validation test, simulation logic test stub, renderer test stub)

## 2. Input Validation and Config Processing

- [ ] 2.1 Create `scripts/lib/validate-episode-input.ts` that wraps `src/episodes/validate-config.ts` with CLI-friendly error formatting
- [ ] 2.2 Add validation for duplicate episode IDs by checking `src/episodes/` directory listing
- [ ] 2.3 Add validation for reserved/invalid episode ID format (must be kebab-case, alphanumeric + hyphens only, no leading/trailing hyphens)
- [ ] 2.4 Add validation that domain exists in brand design system color mapping (physics → #00D4AA, civics → TBD, etc.)
- [ ] 2.5 Write unit tests for validation logic: valid config passes, missing required fields fail with specific error messages, invalid ID format rejected, duplicate ID detection

## 3. Interactive Prompts

- [ ] 3.1 Create `scripts/lib/interactive-prompts.ts` using Node.js readline or a lightweight CLI prompt library (e.g., prompts package if acceptable)
- [ ] 3.2 Implement prompt flow: episode ID → domain (select from enum) → simulation mode (select from enum) → title → subtitle → description
- [ ] 3.3 Implement basic parameter/equation/mission/reference prompts with "add another?" loops or skip with minimal defaults (1 placeholder parameter, 1 placeholder mission)
- [ ] 3.4 Provide option to generate minimal config and edit manually vs. full interactive entry
- [ ] 3.5 Write unit tests for prompt logic (mock readline/prompts, verify output config structure)

## 4. Template Interpolation Engine

- [ ] 4.1 Create `scripts/lib/generate-episode-files.ts` with template interpolation functions
- [ ] 4.2 Implement `generateConfigFile(config: EpisodeConfig): string` that converts JSON config to TypeScript object literal syntax (proper escaping, indentation, readonly modifiers)
- [ ] 4.3 Implement `generatePhysicsFile(id: string): string` that fills physics.template.ts with episode-specific imports and structure
- [ ] 4.4 Implement `generateStateMachineFile(id: string, mode: SimulationMode): string` that fills state-machine.template.ts with mode-specific state definitions
- [ ] 4.5 Implement `generateRendererFile(id: string, domain: EpisodeDomain): string` that injects domain accent color from brand design system
- [ ] 4.6 Implement `generateIndexFile(id: string, mode: SimulationMode): string` that wires up correct imports (physics vs. state-machine) based on simulation mode
- [ ] 4.7 Implement `generateTestFile(id: string): string` that fills test.template.ts with episode-specific test structure
- [ ] 4.8 Write unit tests: verify template interpolation produces valid TypeScript, verify domain color injection, verify correct template selection per simulation mode

## 5. Filesystem Operations

- [ ] 5.1 Implement directory creation: `src/episodes/<id>/` with error handling for existing directory (fail unless `--force` flag present)
- [ ] 5.2 Implement file writing: write all generated files to episode directory atomically (all-or-nothing — if any write fails, clean up partial directory)
- [ ] 5.3 Implement `--dry-run` mode: generate all files in memory and log file paths + previews without writing to disk
- [ ] 5.4 Implement `--force` mode: prompt for confirmation (unless `--yes` also passed) then delete existing episode directory before generating
- [ ] 5.5 Write unit tests: verify directory creation, verify file contents match templates, verify dry-run does not write files, verify force mode removes existing directory

## 6. Main CLI Script

- [ ] 6.1 Create `scripts/scaffold-episode.ts` with argument parsing (use Node.js built-in parseArgs or minimist library)
- [ ] 6.2 Implement `--config <path>` mode: read JSON file, validate, generate files
- [ ] 6.3 Implement interactive mode (no args): launch prompts, collect input, validate, generate files
- [ ] 6.4 Implement flags: `--dry-run`, `--force`, `--yes` (skip confirmations), `--verbose` (detailed logging)
- [ ] 6.5 Implement help text: `--help` displays usage, examples, and flag descriptions
- [ ] 6.6 Implement comprehensive error messages: file not found, invalid JSON, validation failures, filesystem errors (permissions, disk full)
- [ ] 6.7 Add success message with next steps: "Episode '<id>' created at src/episodes/<id>/ — Edit config.ts and implement simulation logic in physics.ts, then run npm test"

## 7. NPM Script Integration

- [ ] 7.1 Add `"scaffold:episode": "tsx scripts/scaffold-episode.ts"` to package.json scripts section
- [ ] 7.2 Test invocation: `npm run scaffold:episode -- --config example-config.json` works
- [ ] 7.3 Test invocation: `npm run scaffold:episode` (no args) launches interactive mode
- [ ] 7.4 Test invocation: `npm run scaffold:episode -- --help` displays help text
- [ ] 7.5 Update project documentation (README or scripts/README.md if exists) with scaffold:episode usage examples

## 8. Testing and Validation

- [ ] 8.1 Write unit tests in `scripts/__tests__/scaffold-episode.test.ts` for all template generation functions
- [ ] 8.2 Write integration test: generate minimal episode from config, verify all files exist and contain expected content
- [ ] 8.3 Write integration test: generate episode with full config (parameters, missions, equations, reference content), verify complex object literals are correctly formatted
- [ ] 8.4 Write integration test: dry-run mode does not create files but logs correct output
- [ ] 8.5 Write integration test: force mode overwrites existing episode directory
- [ ] 8.6 Write integration test: invalid config JSON fails with descriptive error message before any files are created
- [ ] 8.7 Write integration test: duplicate episode ID is rejected before any files are created

## 9. Documentation and Examples

- [ ] 9.1 Create `scripts/example-episode-config.json` with a minimal valid episode config as a starter template
- [ ] 9.2 Create `scripts/example-episode-config-full.json` with a complete config including parameters, missions, equations, and reference content
- [ ] 9.3 Add inline JSDoc comments to scaffold-episode.ts explaining each function and flag
- [ ] 9.4 Add inline comments to all templates explaining placeholder sections and customization points

## 10. AI Agent Integration

- [ ] 10.1 Document expected JSON config schema for AI agents in a README or inline comment (point to EpisodeConfig type definition)
- [ ] 10.2 Ensure script can be invoked programmatically via Node.js API (export main scaffolding function for use by other scripts)
- [ ] 10.3 Add `--json` output flag that emits JSON status/error messages for machine parsing (vs. human-readable CLI output)
- [ ] 10.4 Test that AI agent can generate valid config JSON, invoke scaffold script, and verify success via exit code and JSON output
