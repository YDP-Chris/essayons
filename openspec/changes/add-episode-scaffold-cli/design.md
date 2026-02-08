## Context

The Essayons platform aims to publish one new episode per week, with AI agents generating episode content from domain specifications. Currently, creating an episode requires manual TypeScript file creation, directory structuring, import wiring, and registration with the episode system — a process that blocks autonomous generation. The episode scaffold CLI tool solves this by accepting a declarative JSON config and generating a complete, ready-to-implement episode directory.

The tool must balance two workflows: (1) AI agent programmatic invocation with full config JSON, and (2) human developer interactive mode with CLI prompts. It must integrate with the existing episode factory system (`add-episode-factory` change) and follow project conventions for file structure, naming, and TypeScript patterns.

### Constraints

- Must work in Node.js (no browser runtime) with minimal dependencies
- Must integrate with existing `validate-config.ts` validation logic
- Must generate valid TypeScript that passes linting and type-checking
- Must respect project conventions: kebab-case file names, strict TypeScript, named exports
- Generated files must be idiomatic — not "obviously machine-generated" code
- Must be invokable both as CLI tool and programmatic Node.js API

### Stakeholders

- AI agents generating episodes weekly
- Human developers prototyping new episodes
- Solo developer maintaining the codebase (minimize complexity)

## Goals / Non-Goals

### Goals

- Generate complete episode directory from JSON config in <1 second
- Validate input config before writing any files (fail fast)
- Produce idiomatic TypeScript with correct imports, types, and formatting
- Support both full config input and minimal config with interactive prompts
- Provide dry-run mode for preview without filesystem changes
- Emit clear, actionable error messages for all failure modes
- Enable AI agents to invoke programmatically and parse success/failure via exit codes and JSON output

### Non-Goals

- Generating episode content (missions, reference text, equation descriptions) — config provides this
- Implementing simulation logic — templates provide structure, developer/AI fills in domain-specific physics/state transitions
- Auto-registering episode with navigation/routing (developer must manually add to episode list/routes)
- Supporting custom template overrides or plugin system (single built-in template set for MVP)
- Generating visual assets (images, icons, sprites) — episodes use Canvas rendering and CSS

## Decisions

### Template System: String Interpolation with TypeScript AST Awareness

**Decision**: Use template literals with placeholder replacement (`{{id}}`, `{{domain}}`, etc.) for code generation. For complex structures (EpisodeConfig object literals), use a dedicated JSON-to-TypeScript converter that produces properly formatted, typed object literals.

**Why**: Full AST manipulation (e.g., using ts-morph or Babel) is overkill for this use case and adds significant dependency weight. Template literals are simple, fast, and maintainable. The tricky part — converting JSON config to TypeScript syntax — is isolated to one function that handles quoting, escaping, readonly modifiers, and indentation.

**Implementation approach**:

- Store templates as `.template.ts` files with `{{placeholder}}` markers
- Read template, replace placeholders with interpolated values
- For config.ts: convert JSON → TypeScript object literal with proper formatting (use JSON.stringify with replacer + custom post-processing for readonly modifiers and type annotations)

**Alternatives considered**:

- **ts-morph/TypeScript Compiler API**: Heavy dependency, steep learning curve, overkill for generating a handful of files. Rejected.
- **Handlebars/Mustache templating engine**: Adds dependency and complexity for features we don't need (loops, conditionals in templates). String interpolation is sufficient. Rejected.

### Simulation Mode Template Selection: Mode-Specific File Generation

**Decision**: Generate either `physics.ts` (for continuous mode) or `state-machine.ts` (for step-based/event-driven/turn-based modes) based on `simulationMode` field in the config. Do not generate both.

**Why**: Different simulation modes require fundamentally different code structures. Continuous simulations use differential equations and integration loops. Discrete simulations use state machines and event handlers. Generating both files would be confusing and lead to "dead code" confusion. The template selection logic makes the distinction clear.

**Template differences**:

- `physics.ts`: Exports `PhysicsEngine` class with `init(params)`, `step(dt)`, `getState()` methods. Includes placeholder comments for integration loop (Euler, Verlet, etc.).
- `state-machine.ts`: Exports `StateMachine` class with `states` enum, `currentState`, `transition(event)`, `tick()` methods. Includes placeholder comments for state transition logic.

**index.ts wiring**: Conditionally import physics or state-machine based on mode, then register with episode factory.

### Domain Color Injection: Brand Design System Lookup

**Decision**: Map episode domain to accent color using a static lookup table in the scaffold script. Inject the hex color code directly into `renderer.ts` template.

**Why**: The brand design system defines one accent color per domain (physics = #00D4AA, civics = TBD, etc.). Rather than coupling the scaffold script to the design system source code, maintain a small lookup map in the scaffold script. This keeps the scaffold tool decoupled and fast.

**Lookup table** (in `scripts/scaffold-episode.ts`):

```typescript
const DOMAIN_COLORS: Record<EpisodeDomain, string> = {
  physics: '#00D4AA',
  civics: '#FFA500', // placeholder
  economics: '#FFD700', // placeholder
  history: '#8B4513', // placeholder
  biology: '#228B22', // placeholder
  engineering: '#4682B4', // placeholder
}
```

**Update policy**: When brand design system adds/changes a domain color, manually update this map. Future enhancement: read from design system source file.

### Validation Pipeline: Pre-Generation, Fail-Fast

**Decision**: Run all validation checks (config structure, duplicate ID, reserved names, filesystem conflicts) before generating or writing any files. If any validation fails, exit with error code 1 and descriptive message. Do not create partial episode directories.

**Why**: Partial generation creates confusing state. The user should see clear validation errors and be able to fix them before any files are touched. Atomicity (all-or-nothing) is critical for usability.

**Validation order**:

1. Parse input JSON (or collect from interactive prompts)
2. Validate config structure via `validate-config.ts`
3. Check episode ID is kebab-case, alphanumeric + hyphens only, no leading/trailing hyphens
4. Check episode ID does not conflict with existing episode directory in `src/episodes/`
5. Check domain exists in color lookup table
6. Check simulation mode is valid enum value
7. Validate filesystem permissions (can write to `src/episodes/`)
8. If all checks pass → generate files; else → print errors and exit 1

### Dry-Run Mode: In-Memory Generation with Preview

**Decision**: When `--dry-run` flag is present, generate all files in memory and log file paths + first 20 lines of each file to stdout, but do not write to disk. Exit with code 0 if generation succeeds.

**Why**: Dry-run is essential for AI agents to verify their config will produce valid output before committing to filesystem changes. It is also useful for developers to preview scaffold output.

**Output format**:

```
[DRY RUN] Would create: src/episodes/my-episode/config.ts
--- Preview (first 20 lines) ---
import type { EpisodeConfig } from '../types.ts'

export const myEpisodeConfig: EpisodeConfig = {
  id: 'my-episode',
  title: 'My Episode',
  ...
}
--- End preview ---

[DRY RUN] Would create: src/episodes/my-episode/physics.ts
...
```

### Interactive Prompts: Minimal Config with Edit-Later Workflow

**Decision**: Interactive mode (no `--config` arg) prompts for essential fields only: ID, domain, simulation mode, title, subtitle, description. For parameters, equations, missions, and reference content, generate placeholder arrays with one minimal example item and instruct the user to edit `config.ts` manually after generation.

**Why**: Prompting for complex nested structures (arrays of parameter objects with constraints, missions with objectives, etc.) is tedious and error-prone in a CLI. It is faster to generate a minimal valid config and let the developer/AI edit the TypeScript file directly with syntax highlighting and autocomplete.

**Minimal placeholders**:

- Parameters: 1 number parameter with default min/max/step
- Equations: 1 placeholder equation with LaTeX formula
- Missions: 1 "Explore" mission with 1 objective
- Reference content: 1 "Getting Started" concept entry

**Success message after generation**:

> Episode 'my-episode' created at src/episodes/my-episode/
>
> Next steps:
>
> 1. Edit src/episodes/my-episode/config.ts to add parameters, missions, and reference content
> 2. Implement simulation logic in src/episodes/my-episode/physics.ts
> 3. Customize rendering in src/episodes/my-episode/renderer.ts
> 4. Run `npm test` to validate your changes

### Error Messages: Specific, Actionable, Exit-Code Keyed

**Decision**: Every error message must specify (1) what failed, (2) why it failed, (3) how to fix it. Use distinct exit codes for different error classes to enable programmatic handling.

**Exit codes**:

- 0: Success
- 1: Invalid config (validation failed)
- 2: Duplicate episode ID
- 3: Filesystem error (permissions, disk full, etc.)
- 4: Invalid arguments (bad flags, missing required args)

**Example error messages**:

**Invalid config**:

```
Error: Invalid episode config
  - Parameter "speed": default value 150 exceeds max value 100
  - Mission "orbit": missing required field "briefing"

Fix these issues in your config JSON and try again.
```

**Duplicate ID**:

```
Error: Episode ID 'orbit-lab' already exists at src/episodes/orbit-lab/
Use a different ID or run with --force to overwrite (this will delete existing files).
```

**Filesystem error**:

```
Error: Cannot write to src/episodes/ (permission denied)
Ensure you have write access to the project directory.
```

### CLI Flag Design

**Flags**:

- `--config <path>`: Path to JSON config file (required unless interactive mode)
- `--dry-run`: Generate in-memory, preview output, do not write files
- `--force`: Overwrite existing episode directory if it exists
- `--yes`: Skip confirmation prompts (for CI/automation)
- `--verbose`: Log detailed generation steps
- `--json`: Output JSON-formatted status/error messages (for machine parsing)
- `--help`: Display usage, examples, and flag descriptions

**Invocation examples**:

```bash
# Full config from JSON file
npm run scaffold:episode -- --config scripts/my-episode.json

# Interactive mode
npm run scaffold:episode

# Dry-run preview
npm run scaffold:episode -- --config scripts/my-episode.json --dry-run

# Force overwrite existing episode (with confirmation prompt)
npm run scaffold:episode -- --config scripts/my-episode.json --force

# Force overwrite in CI (no prompt)
npm run scaffold:episode -- --config scripts/my-episode.json --force --yes

# Machine-readable JSON output
npm run scaffold:episode -- --config scripts/my-episode.json --json
```

### AI Agent Integration: Programmatic API + JSON Output

**Decision**: Export the main scaffolding logic as a Node.js function that can be called programmatically (not just via CLI). Add `--json` flag for machine-readable output.

**Exported API** (in `scripts/scaffold-episode.ts`):

```typescript
export async function scaffoldEpisode(options: {
  config?: EpisodeConfig
  configPath?: string
  dryRun?: boolean
  force?: boolean
  verbose?: boolean
}): Promise<{ success: boolean; episodeId?: string; errors?: string[] }>
```

**JSON output format** (when `--json` flag present):

```json
{
  "success": true,
  "episodeId": "my-episode",
  "filesCreated": [
    "src/episodes/my-episode/config.ts",
    "src/episodes/my-episode/physics.ts",
    "src/episodes/my-episode/renderer.ts",
    "src/episodes/my-episode/index.ts",
    "src/episodes/my-episode/my-episode.test.ts"
  ]
}
```

Or on error:

```json
{
  "success": false,
  "errors": [
    "Parameter 'speed': default value 150 exceeds max value 100",
    "Mission 'orbit': missing required field 'briefing'"
  ],
  "exitCode": 1
}
```

**Why**: AI agents need structured output they can parse. Exit codes alone are insufficient — agents need to know _why_ generation failed to auto-fix configs. The programmatic API also enables future tooling (VS Code extension, web-based config builder) to reuse the scaffolding logic.

## Risks / Trade-offs

### Risk: Template drift from project conventions

**Mitigation**: Templates should be minimal and follow the simplest idiomatic TypeScript patterns. The generated code should look like code a human would write. Regularly review generated output as episodes are scaffolded. Add linting/type-checking step to scaffold script that validates generated files before writing (or as post-generation check).

### Risk: Config schema changes break old scaffolds

**Mitigation**: The scaffold tool consumes the `EpisodeConfig` type from `src/episodes/types.ts` as the source of truth. If the episode factory changes the config schema, the scaffold tool must be updated in lockstep. This is a cross-cutting change that affects both systems. Document this dependency in both change proposals.

### Trade-off: String templates vs. AST manipulation

**Accepted**: String templates are less robust than AST manipulation (harder to guarantee syntactically valid output) but far simpler to maintain. For the narrow use case of generating a handful of TypeScript files with fixed structure, string templates are sufficient. If generation complexity grows (e.g., generating 20+ files with conditional logic), revisit and consider ts-morph.

### Trade-off: Interactive mode is minimal

**Accepted**: Interactive mode only collects essential fields and generates placeholder content. This reduces CLI complexity and avoids tedious nested prompts. The assumption is that developers/AI agents will edit `config.ts` directly after generation — editing TypeScript is easier than filling complex CLI forms.

### Trade-off: Inline color lookup table vs. design system integration

**Accepted**: The scaffold tool maintains a static color lookup table rather than importing from the design system source. This decouples the scaffold tool from design system implementation details and keeps it fast/simple. The downside: manual updates when colors change. The frequency is low (colors are stable), so this is acceptable for MVP.

## Migration Plan

Not applicable — this is a greenfield addition. No existing code is modified. The scaffold tool is a standalone script.

**Rollback**: Delete `scripts/scaffold-episode.ts`, `scripts/templates/`, and `scripts/lib/` additions. Remove `scaffold:episode` entry from `package.json`. Episodes generated by the tool remain valid and functional — they are ordinary TypeScript code.

## Open Questions

1. **Template file format**: Should templates be stored as `.template.ts` files (TypeScript syntax with placeholders) or `.txt` files (generic text)? `.template.ts` enables syntax highlighting in editors but may confuse TypeScript tooling. Lean toward `.template.ts` with a convention that templates are ignored by linting/type-checking.

2. **Confirmation prompt UX**: When `--force` is used without `--yes`, should the confirmation prompt show a list of files that will be deleted, or just confirm the episode ID? Lean toward showing the episode directory path for safety.

3. **Test file depth**: Should the generated test file include example unit tests for simulation logic (e.g., "verify initial state has expected properties"), or just scaffold the file with TODO comments? Lean toward TODO comments — simulation tests are highly domain-specific and hard to template meaningfully.

4. **Programmatic API return type**: Should `scaffoldEpisode()` return a structured object with success status and errors, or throw exceptions on failure? Lean toward structured return (no exceptions) for easier error handling in AI agent workflows.

5. **Logging verbosity default**: Should the default behavior log each file as it is created, or only log the final success message? Lean toward quiet-by-default with success message only, and verbose logging behind `--verbose` flag.
