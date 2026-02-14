/**
 * Climate Lab — Episode 08: Physics Climate Simulator.
 *
 * Registers the Climate Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the climate simulation engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { climateLabConfig } from './config.ts'
import {
  createInitialClimateState,
  stepClimate,
  checkEnergyBalance,
  checkIceAge,
  checkRunawayGreenhouse,
  checkStabilizeWarming,
} from './simulation.ts'
import type { ClimateState } from './types.ts'
import { renderClimateLab } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: ClimateState) => boolean> = {
  checkEnergyBalance,
  checkIceAge,
  checkRunawayGreenhouse,
  checkStabilizeWarming,
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const climateLabDefinition: EpisodeDefinition = {
  id: climateLabConfig.id,
  name: climateLabConfig.title,
  description: climateLabConfig.description,
  accentColor: '#00D4AA', // Physics domain color

  parameters: climateLabConfig.parameters.map((p) => {
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

  missions: climateLabConfig.missions.map((m) => ({
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
      const climateState = state as unknown as ClimateState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(climateState)
        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed — we use the episode render function
  },

  createInitialState: (params?: ParamValues): PhysicsState => {
    return createInitialClimateState(params ?? {}) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, _dt: number): PhysicsState => {
    // For step-based mode, we step the climate on each update call
    // The DiscreteEngine will handle the step timing
    const climateState = state as unknown as ClimateState
    return stepClimate(climateState, params) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const climateState = state as unknown as ClimateState
    renderClimateLab(renderCtx.ctx, climateState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(climateLabConfig)
registerEpisodeDefinition(climateLabDefinition)

export { climateLabConfig } from './config.ts'
export {
  createInitialClimateState,
  stepClimate,
  checkEnergyBalance,
  checkIceAge,
  checkRunawayGreenhouse,
  checkStabilizeWarming,
} from './simulation.ts'
export type { ClimateState, ClimateParams } from './types.ts'
export { renderClimateLab } from './renderer.ts'
