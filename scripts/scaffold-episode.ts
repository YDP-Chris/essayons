/**
 * CLI tool to scaffold new episode directories from a config JSON file.
 *
 * Usage: npm run scaffold:episode -- --config path/to/config.json
 */

import { parseArgs } from 'node:util'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateEpisode } from './lib/generate-episode-files.ts'
import { validateEpisodeInput } from './lib/validate-episode-input.ts'
import type { EpisodeInput } from './lib/generate-episode-files.ts'

const { values } = parseArgs({
  options: {
    config: { type: 'string', short: 'c' },
    'dry-run': { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

if (values.help) {
  console.log(`Usage: scaffold-episode --config <path>

Options:
  -c, --config <path>   Path to episode config JSON file (required)
  --dry-run             Show what would be created without writing
  --force               Overwrite existing episode directory
  -h, --help            Show this help message

Example:
  npm run scaffold:episode -- --config scripts/example-episode-config.json
  npm run scaffold:episode -- --config my-episode.json --dry-run
  npm run scaffold:episode -- --config my-episode.json --force
`)
  process.exit(0)
}

// Validate required arguments
if (!values.config) {
  console.error('Error: --config argument is required\n')
  console.log('Run with --help for usage information')
  process.exit(1)
}

try {
  // Read and parse config
  const configPath = resolve(values.config)
  const configContent = readFileSync(configPath, 'utf-8')
  const config = JSON.parse(configContent) as unknown

  // Validate input
  const validation = validateEpisodeInput(config, { force: values.force })

  if (!validation.valid) {
    console.error('\n❌ Config validation failed:\n')
    for (const error of validation.errors) {
      console.error(`  ${error.field}: ${error.message}`)
    }
    console.error('')
    process.exit(1)
  }

  // Generate files
  generateEpisode(config as EpisodeInput, {
    dryRun: values['dry-run'] ?? false,
    force: values.force ?? false,
  })

  process.exit(0)
} catch (error) {
  if (error instanceof Error) {
    console.error(`\n❌ Error: ${error.message}\n`)
  } else {
    console.error('\n❌ An unknown error occurred\n')
  }
  process.exit(1)
}
