/**
 * Gene Lab — Episode 04: Genetics and Inheritance Simulator.
 *
 * Registers the Gene Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the genetics simulation engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { geneLabConfig } from './config.ts'
import { createInitialState, stepGeneration, type GeneLabParams } from './simulation.ts'
import type { GeneLabState } from './types.ts'
import { renderGeneLabCanvas } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check functions
// ---------------------------------------------------------------------------

function checkReachGeneration5(state: GeneLabState): boolean {
  return state.generation >= 5
}

function checkPhenotypeRatio(state: GeneLabState): boolean {
  // Check for approximate 3:1 ratio (between 2.5:1 and 3.5:1)
  if (state.phenotypeRatio.recessive === 0) return false
  const ratio = state.phenotypeRatio.dominant / state.phenotypeRatio.recessive
  return ratio >= 2.5 && ratio <= 3.5 && state.generation >= 5
}

function checkHighDominantFrequency(_state: GeneLabState, params: ParamValues): boolean {
  const p = params as unknown as GeneLabParams
  return p['dominant-frequency'] >= 0.9
}

function checkRecessivePresent(state: GeneLabState): boolean {
  return state.phenotypeRatio.recessive > 0
}

function checkSelectionPressure(_state: GeneLabState, params: ParamValues): boolean {
  const p = params as unknown as GeneLabParams
  return p['selection-pressure'] >= 0.3
}

function checkFrequencyShift(state: GeneLabState): boolean {
  if (state.generation < 10 || state.history.length < 2) return false
  const initial = state.history[0]!.freqA
  const current = state.alleleFrequency.A
  return current > initial + 0.1 // At least 10% increase in dominant allele
}

function checkHighMutation(_state: GeneLabState, params: ParamValues): boolean {
  const p = params as unknown as GeneLabParams
  return p['mutation-rate'] >= 0.05
}

function checkFrequencyFluctuation(state: GeneLabState): boolean {
  if (state.generation < 5 || state.history.length < 5) return false
  // Check if frequency has changed significantly from generation 0
  const initial = state.history[0]!.freqA
  const current = state.alleleFrequency.A
  return Math.abs(current - initial) > 0.05
}

const missionChecks: Record<string, (state: GeneLabState, params: ParamValues) => boolean> = {
  checkReachGeneration5: (s) => checkReachGeneration5(s),
  checkPhenotypeRatio: (s) => checkPhenotypeRatio(s),
  checkHighDominantFrequency,
  checkRecessivePresent: (s) => checkRecessivePresent(s),
  checkSelectionPressure,
  checkFrequencyShift: (s) => checkFrequencyShift(s),
  checkHighMutation,
  checkFrequencyFluctuation: (s) => checkFrequencyFluctuation(s),
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const geneLabDefinition: EpisodeDefinition = {
  id: geneLabConfig.id,
  name: geneLabConfig.title,
  description: geneLabConfig.description,
  accentColor: '#8ac926',

  parameters: geneLabConfig.parameters.map((p) => {
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
      default:
        return {
          type: 'boolean' as const,
          key: p.id,
          label: p.label,
          default: false,
        }
    }
  }),

  missions: geneLabConfig.missions.map((m) => ({
    id: m.id,
    name: m.title,
    description: m.briefing,
    objectives: m.objectives.map((o) => ({
      id: o.id,
      label: o.description,
    })),
    evaluate: (
      state: PhysicsState,
      params: ParamValues,
      _simTime: number,
    ): ReadonlyArray<{ id: string; status: ObjectiveStatus }> => {
      const geneLabState = state as unknown as GeneLabState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(geneLabState, params)
        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed
  },

  createInitialState: (): PhysicsState => {
    return createInitialState({
      'population-size': 50,
      'dominant-frequency': 0.5,
      'mutation-rate': 0.01,
      'selection-pressure': 0,
      'show-genotypes': false,
    }) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, dt: number): PhysicsState => {
    const geneLabState = state as unknown as GeneLabState & { _accumulated?: number }
    const geneLabParams = params as unknown as GeneLabParams

    // Step-based simulation: accumulate time and step once per second
    const accumulated = geneLabState._accumulated ?? 0
    const newAccumulated = accumulated + dt

    if (newAccumulated >= 1.0) {
      // Step to next generation
      const nextState = stepGeneration(geneLabState, geneLabParams)
      const nextStateWithTime = nextState as typeof nextState & { _accumulated?: number }
      nextStateWithTime._accumulated = 0
      return nextStateWithTime as unknown as PhysicsState
    } else {
      // Just accumulate time
      const stateWithTime = { ...geneLabState, _accumulated: newAccumulated }
      return stateWithTime as unknown as PhysicsState
    }
  },

  render: (renderCtx, state, params) => {
    const geneLabState = state as unknown as GeneLabState
    const geneLabParams = params as unknown as GeneLabParams
    renderGeneLabCanvas(
      renderCtx.ctx,
      geneLabState,
      geneLabParams,
      renderCtx.width,
      renderCtx.height,
    )
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(geneLabConfig)
registerEpisodeDefinition(geneLabDefinition)

export { geneLabConfig } from './config.ts'
export { createInitialState, stepGeneration } from './simulation.ts'
export type { GeneLabState, Organism, Genotype, Phenotype, Allele } from './types.ts'
export { renderGeneLabCanvas } from './renderer.ts'
export {
  getPhenotype,
  createGamete,
  breed,
  applySelection,
  computeAlleleFrequency,
  computeHardyWeinberg,
  computeChiSquare,
} from './genetics.ts'
