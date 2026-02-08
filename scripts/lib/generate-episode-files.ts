/**
 * Generates episode files from a validated config.
 * Creates TypeScript files with proper templates for config, physics/state-machine, renderer, index, and tests.
 */

import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { resolve, join } from 'node:path'

export interface EpisodeInput {
  id: string
  title: string
  subtitle: string
  domain: string
  simulationMode: string
  description: string
  parameters?: Array<{
    id: string
    label: string
    type: string
    default: unknown
    min?: number
    max?: number
    step?: number
    unit?: string
    options?: string[]
    description?: string
  }>
  missions?: Array<{
    id: string
    title: string
    briefing: string
    objectives: Array<{
      id: string
      description: string
      check: string
      target?: number
      tolerance?: number
    }>
    hints?: string[]
    successMessage: string
    initialParams?: Record<string, unknown>
  }>
  equations?: Array<{
    id: string
    label: string
    latex: string
    description: string
    variables: Record<string, string>
  }>
  referenceContent?: Array<{ id: string; title: string; content: string; category: string }>
  initialState?: Record<string, unknown>
  renderLayers?: Array<{ id: string; zIndex: number; render: string }>
}

const DOMAIN_COLORS: Record<string, string> = {
  physics: '#00d4aa',
  civics: '#e63946',
  economics: '#2a9d8f',
  history: '#e9c46a',
  biology: '#8ac926',
  engineering: '#ff6b35',
}

/**
 * Generate config.ts file with EpisodeConfig export
 */
function generateConfig(input: EpisodeInput): string {
  const params = input.parameters ?? []
  const missions = input.missions ?? []
  const equations = input.equations ?? []
  const referenceContent = input.referenceContent ?? []
  const renderLayers = input.renderLayers ?? []

  return `import type { EpisodeConfig } from '../types.ts'

export const ${toCamelCase(input.id)}Config: EpisodeConfig = {
  id: '${input.id}',
  title: '${input.title}',
  subtitle: '${input.subtitle}',
  domain: '${input.domain}',
  simulationMode: '${input.simulationMode}',
  description: '${input.description}',
  parameters: ${JSON.stringify(params, null, 2)},
  equations: ${JSON.stringify(equations, null, 2)},
  missions: ${JSON.stringify(missions, null, 2)},
  referenceContent: ${JSON.stringify(referenceContent, null, 2)},
  initialState: ${JSON.stringify(input.initialState ?? {}, null, 2)},
  renderLayers: ${JSON.stringify(renderLayers, null, 2)},
}
`
}

/**
 * Generate physics.ts file for continuous simulation mode
 */
function generatePhysics(input: EpisodeInput): string {
  const pascalName = toPascalCase(input.id)

  return `/**
 * Physics engine for the ${input.title} episode.
 *
 * Implements continuous simulation using Velocity Verlet integration.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ${pascalName}State {
  // TODO: Define your simulation state properties here
  // Example: x: number, y: number, vx: number, vy: number
  readonly simTime: number
}

export interface ${pascalName}Params {
  // TODO: Define parameter types matching config.ts
  // Use kebab-case keys matching parameter IDs
}

// ---------------------------------------------------------------------------
// State Creation
// ---------------------------------------------------------------------------

/**
 * Create an initial state from user-controlled parameters.
 */
export function createInitialState(params: Record<string, unknown>): ${pascalName}State {
  // TODO: Extract parameters and initialize state
  // Example: const speed = (params['speed'] as number | undefined) ?? 1

  return {
    simTime: 0,
  }
}

// ---------------------------------------------------------------------------
// Physics Update (Velocity Verlet)
// ---------------------------------------------------------------------------

/**
 * Advance the simulation by dt seconds using Velocity Verlet integration.
 *
 * The algorithm:
 *   1. Compute acceleration at current position
 *   2. Update position using current velocity + 0.5 * a * dt^2
 *   3. Compute acceleration at new position
 *   4. Update velocity using average of old and new acceleration
 */
export function update${pascalName}State(
  state: ${pascalName}State,
  params: Record<string, unknown>,
  dt: number,
): ${pascalName}State {
  // TODO: Implement physics update logic

  return {
    ...state,
    simTime: state.simTime + dt,
  }
}

// ---------------------------------------------------------------------------
// Mission Check Functions
// ---------------------------------------------------------------------------

// TODO: Implement mission check functions referenced in config.ts
// Example:
// export function checkGoal(state: ${pascalName}State): boolean {
//   return false // Replace with actual check
// }
`
}

/**
 * Generate state-machine.ts file for step-based/event-driven/turn-based modes
 */
function generateStateMachine(input: EpisodeInput): string {
  const pascalName = toPascalCase(input.id)

  return `/**
 * State machine for the ${input.title} episode.
 *
 * Implements ${input.simulationMode} simulation.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ${pascalName}State {
  // TODO: Define your simulation state properties here
  readonly phase: string
  readonly stepCount: number
}

export interface ${pascalName}Params {
  // TODO: Define parameter types matching config.ts
  // Use kebab-case keys matching parameter IDs
}

// ---------------------------------------------------------------------------
// State Creation
// ---------------------------------------------------------------------------

/**
 * Create an initial state from user-controlled parameters.
 */
export function createInitialState(params: Record<string, unknown>): ${pascalName}State {
  // TODO: Extract parameters and initialize state

  return {
    phase: 'initial',
    stepCount: 0,
  }
}

// ---------------------------------------------------------------------------
// State Machine Update
// ---------------------------------------------------------------------------

/**
 * Advance the simulation by one step or handle an event.
 */
export function update${pascalName}State(
  state: ${pascalName}State,
  params: Record<string, unknown>,
  dt: number,
): ${pascalName}State {
  // TODO: Implement state machine logic

  return {
    ...state,
    stepCount: state.stepCount + 1,
  }
}

// ---------------------------------------------------------------------------
// Mission Check Functions
// ---------------------------------------------------------------------------

// TODO: Implement mission check functions referenced in config.ts
// Example:
// export function checkGoal(state: ${pascalName}State): boolean {
//   return false // Replace with actual check
// }
`
}

/**
 * Generate renderer.ts file with canvas rendering
 */
function generateRenderer(input: EpisodeInput): string {
  const pascalName = toPascalCase(input.id)
  const accentColor = DOMAIN_COLORS[input.domain] || '#6366f1'
  const stateFile = input.simulationMode === 'continuous' ? 'physics' : 'state-machine'

  return `/**
 * Canvas rendering for the ${input.title} episode.
 */

import type { ${pascalName}State } from './${stateFile}.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  background: '#0a0a1a',
  accent: '${accentColor}',
  text: '#e2e8f0',
  textDim: '#94a3b8',
} as const

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

/**
 * Render the complete ${input.title} scene onto a canvas.
 */
export function render${pascalName}(
  ctx: CanvasRenderingContext2D,
  state: ${pascalName}State,
  params: Record<string, unknown>,
  width: number,
  height: number,
): void {
  // Clear background
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // TODO: Implement rendering logic

  // Example: Draw centered text
  ctx.fillStyle = COLORS.text
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('${input.title}', width / 2, height / 2)

  // TODO: Draw simulation elements based on state
}
`
}

/**
 * Generate index.ts file with episode registration
 */
function generateIndex(input: EpisodeInput): string {
  const camelName = toCamelCase(input.id)
  const pascalName = toPascalCase(input.id)
  const accentColor = DOMAIN_COLORS[input.domain] || '#6366f1'
  const stateFile = input.simulationMode === 'continuous' ? 'physics' : 'state-machine'

  // Collect all mission check function names
  const checkFunctions = new Set<string>()
  for (const mission of input.missions ?? []) {
    for (const objective of mission.objectives) {
      checkFunctions.add(objective.check)
    }
  }

  const checkFunctionList = Array.from(checkFunctions)

  return `/**
 * ${input.title} — Episode registration and definition.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { ${camelName}Config } from './config.ts'
import {
  createInitialState,
  update${pascalName}State,${checkFunctionList.length > 0 ? '\n  ' + checkFunctionList.join(',\n  ') + ',' : ''}
} from './${stateFile}.ts'
import type { ${pascalName}State } from './${stateFile}.ts'
import { render${pascalName} } from './renderer.ts'
import { registerEpisode } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: ${pascalName}State) => boolean> = {${checkFunctionList.length > 0 ? '\n  ' + checkFunctionList.join(',\n  ') + ',\n' : '\n'}  // TODO: Add mission check functions as you implement them
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const ${camelName}Definition: EpisodeDefinition = {
  id: ${camelName}Config.id,
  name: ${camelName}Config.title,
  description: ${camelName}Config.description,
  accentColor: '${accentColor}',

  parameters: ${camelName}Config.parameters.map((p) => {
    switch (p.type) {
      case 'number':
        return {
          type: 'number' as const,
          key: p.id,
          label: p.label,
          default: p.default as number,
          min: p.min ?? 0,
          max: p.max ?? 100,
          step: p.step ?? 1,
          unit: p.unit,
        }
      case 'boolean':
        return {
          type: 'boolean' as const,
          key: p.id,
          label: p.label,
          default: p.default as boolean,
        }
      case 'enum':
        return {
          type: 'enum' as const,
          key: p.id,
          label: p.label,
          default: p.default as string,
          options: p.options ?? [],
        }
      case 'vector2':
        return {
          type: 'vector2' as const,
          key: p.id,
          label: p.label,
          default: p.default as { x: number; y: number },
        }
      default:
        return {
          type: 'boolean' as const,
          key: p.id,
          label: p.label,
          default: false,
        }
    }
  }),

  missions: ${camelName}Config.missions.map((m) => ({
    id: m.id,
    name: m.title,
    description: m.briefing,
    objectives: m.objectives.map((o) => ({
      id: o.id,
      label: o.description,
    })),
    evaluate: (
      state: PhysicsState,
      _params: ParamValues,
      _simTime: number,
    ): ReadonlyArray<{ id: string; status: ObjectiveStatus }> => {
      const episodeState = state as unknown as ${pascalName}State
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          console.warn(\`Mission check function "\${o.check}" not found\`)
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(episodeState)
        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional initialization needed
  },

  createInitialState: (): PhysicsState => {
    return createInitialState(${camelName}Config.initialState) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, dt: number): PhysicsState => {
    const episodeState = state as unknown as ${pascalName}State
    return update${pascalName}State(episodeState, params, dt) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const episodeState = state as unknown as ${pascalName}State
    render${pascalName}(renderCtx.ctx, episodeState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(${camelName}Config)

export { ${camelName}Config } from './config.ts'
export {
  createInitialState,
  update${pascalName}State,${checkFunctionList.length > 0 ? '\n  ' + checkFunctionList.join(',\n  ') + ',' : ''}
} from './${stateFile}.ts'
export type { ${pascalName}State } from './${stateFile}.ts'
export { render${pascalName} } from './renderer.ts'
`
}

/**
 * Generate test file with vitest tests
 */
function generateTest(input: EpisodeInput): string {
  const camelName = toCamelCase(input.id)
  const pascalName = toPascalCase(input.id)
  const stateFile = input.simulationMode === 'continuous' ? 'physics' : 'state-machine'

  return `/**
 * Unit tests for the ${input.title} episode.
 */

import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  update${pascalName}State,
} from './${stateFile}.ts'
import type { ${pascalName}State } from './${stateFile}.ts'
import { ${camelName}Config } from './config.ts'
import { validateConfig } from '../validate-config.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultParams: Record<string, unknown> = ${JSON.stringify(input.initialState ?? {}, null, 2)}

// ---------------------------------------------------------------------------
// State Creation
// ---------------------------------------------------------------------------

describe('${input.title} State', () => {
  describe('createInitialState', () => {
    it('should create a state with default parameters', () => {
      const state = createInitialState(defaultParams)
      expect(state).toBeDefined()
      // TODO: Add specific state property assertions
    })
  })

  describe('update${pascalName}State', () => {
    it('should advance the simulation', () => {
      const state = createInitialState(defaultParams)
      const next = update${pascalName}State(state, defaultParams, 1 / 60)
      expect(next).toBeDefined()
      // TODO: Add specific update assertions
    })
  })
})

// ---------------------------------------------------------------------------
// Config Validation
// ---------------------------------------------------------------------------

describe('${input.title} Config', () => {
  it('should pass config validation', () => {
    const result = validateConfig(${camelName}Config)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should have the correct id', () => {
    expect(${camelName}Config.id).toBe('${input.id}')
  })

  it('should be in the ${input.domain} domain', () => {
    expect(${camelName}Config.domain).toBe('${input.domain}')
  })

  it('should use ${input.simulationMode} simulation mode', () => {
    expect(${camelName}Config.simulationMode).toBe('${input.simulationMode}')
  })
})
`
}

/**
 * Convert kebab-case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Generate all episode files and write to disk
 */
export function generateEpisode(
  input: EpisodeInput,
  options: { dryRun: boolean; force: boolean },
): void {
  const dir = resolve('src/episodes', input.id)

  const stateFileName = input.simulationMode === 'continuous' ? 'physics.ts' : 'state-machine.ts'

  const files = {
    'config.ts': generateConfig(input),
    [stateFileName]:
      input.simulationMode === 'continuous' ? generatePhysics(input) : generateStateMachine(input),
    'renderer.ts': generateRenderer(input),
    'index.ts': generateIndex(input),
    [`${input.id}.test.ts`]: generateTest(input),
  }

  if (options.dryRun) {
    console.log(`\nWould create directory: ${dir}`)
    for (const [name, content] of Object.entries(files)) {
      console.log(`  ${name} (${content.length} bytes)`)
    }
    return
  }

  if (existsSync(dir)) {
    if (!options.force) {
      throw new Error(`Directory already exists: ${dir}. Use --force to overwrite.`)
    }
    rmSync(dir, { recursive: true })
  }

  mkdirSync(dir, { recursive: true })
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content, 'utf-8')
  }

  console.log(`\n✓ Episode "${input.id}" created at ${dir}/`)
  console.log(`  Files: ${Object.keys(files).join(', ')}`)
  console.log(`\nNext steps:`)
  console.log(`  1. Edit config.ts to customize parameters and missions`)
  console.log(`  2. Implement simulation logic in ${stateFileName}`)
  console.log(`  3. Implement canvas rendering in renderer.ts`)
  console.log(`  4. Run: npm test`)
}
