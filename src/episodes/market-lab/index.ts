/**
 * Market Lab — Episode 03: Economics Simulator.
 *
 * Registers the Market Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the market simulation engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { marketLabConfig } from './config.ts'
import {
  createInitialMarketState,
  stepMarket,
  checkEquilibrium,
  checkPriceFloorEffect,
  checkSelfOrganization,
  checkDeadweightLoss,
} from './simulation.ts'
import type { MarketState } from './types.ts'
import { renderMarketLab } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: MarketState) => boolean> = {
  checkEquilibrium,
  checkPriceFloorEffect,
  checkSelfOrganization,
  checkDeadweightLoss,
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const marketLabDefinition: EpisodeDefinition = {
  id: marketLabConfig.id,
  name: marketLabConfig.title,
  description: marketLabConfig.description,
  accentColor: '#2a9d8f',

  parameters: marketLabConfig.parameters.map((p) => {
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

  missions: marketLabConfig.missions.map((m) => ({
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
      const marketState = state as unknown as MarketState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(marketState)
        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed — we use the episode render function
  },

  createInitialState: (params?: ParamValues): PhysicsState => {
    return createInitialMarketState(params ?? {}) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, _dt: number): PhysicsState => {
    // For step-based mode, we step the market on each update call
    // The DiscreteEngine will handle the step timing
    const marketState = state as unknown as MarketState
    return stepMarket(marketState, params) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const marketState = state as unknown as MarketState
    renderMarketLab(renderCtx.ctx, marketState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(marketLabConfig)
registerEpisodeDefinition(marketLabDefinition)

export { marketLabConfig } from './config.ts'
export {
  createInitialMarketState,
  stepMarket,
  checkEquilibrium,
  checkPriceFloorEffect,
  checkSelfOrganization,
  checkDeadweightLoss,
} from './simulation.ts'
export type { MarketState, MarketParams } from './types.ts'
export { renderMarketLab } from './renderer.ts'
