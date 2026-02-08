# Episode Scaffolding Scripts

This directory contains developer tooling for scaffolding new episode directories from JSON configuration files.

## Usage

### Basic Usage

```bash
npm run scaffold:episode -- --config path/to/config.json
```

### Options

- `--config <path>` (required): Path to episode config JSON file
- `--dry-run`: Preview what would be created without writing files
- `--force`: Overwrite existing episode directory if it exists
- `--help`: Show help message

### Examples

```bash
# Create a new episode from the example config
npm run scaffold:episode -- --config scripts/example-episode-config.json

# Preview what would be created (dry run)
npm run scaffold:episode -- --config my-episode.json --dry-run

# Overwrite an existing episode
npm run scaffold:episode -- --config my-episode.json --force
```

## Config File Format

The config JSON file must include:

- `id` (string, required): Kebab-case episode ID (e.g., "orbit-lab")
- `title` (string, required): Display title
- `subtitle` (string, required): Short subtitle
- `domain` (string, required): One of: physics, civics, economics, history, biology, engineering
- `simulationMode` (string, required): One of: continuous, step-based, event-driven, turn-based
- `description` (string, required): Episode description
- `parameters` (array, optional): Parameter definitions
- `missions` (array, optional): Mission definitions
- `equations` (array, optional): Equation definitions
- `referenceContent` (array, optional): Reference content
- `initialState` (object, optional): Initial simulation state
- `renderLayers` (array, optional): Render layer definitions

See `example-episode-config.json` for a complete example.

## Generated Files

The scaffold creates a complete episode directory with:

- `config.ts`: Episode configuration (EpisodeConfig)
- `physics.ts` or `state-machine.ts`: Simulation logic (depends on simulationMode)
- `renderer.ts`: Canvas rendering
- `index.ts`: Episode registration and wiring
- `[episode-id].test.ts`: Vitest test template

## Next Steps After Scaffolding

1. Edit `config.ts` to customize parameters and missions
2. Implement simulation logic in `physics.ts` or `state-machine.ts`
3. Implement canvas rendering in `renderer.ts`
4. Write tests in `[episode-id].test.ts`
5. Run `npm test` to verify implementation

## Directory Structure

```
scripts/
  lib/
    validate-episode-input.ts    # Input validation
    generate-episode-files.ts    # Template generation
  __tests__/
    scaffold-episode.test.ts     # Tests for scaffolding
  scaffold-episode.ts            # Main CLI entry point
  example-episode-config.json    # Example config file
  README.md                      # This file
```
