/**
 * Bridge Lab — Episode 05: Structural Engineering Simulator.
 *
 * Registers the Bridge Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the structural physics engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { bridgeLabConfig } from './config.ts'
import {
  createInitialState,
  updateBridge,
  checkNoBrokenBeams,
  checkWeightUnder,
  checkSafetyFactor,
  checkSurviveEarthquake,
} from './physics.ts'
import type { BridgeState } from './types.ts'
import { renderBridgeLab } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: BridgeState, target?: number) => boolean> = {
  checkNoBrokenBeams: (state) => checkNoBrokenBeams(state),
  checkWeightUnder: (state, target) => checkWeightUnder(state, target ?? 5000),
  checkSafetyFactor: (state, target) => checkSafetyFactor(state, target ?? 2),
  checkSurviveEarthquake: (state) => checkSurviveEarthquake(state),
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const bridgeLabDefinition: EpisodeDefinition = {
  id: bridgeLabConfig.id,
  name: bridgeLabConfig.title,
  description: bridgeLabConfig.description,
  accentColor: '#ff6b35',

  parameters: bridgeLabConfig.parameters.map((p) => {
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
          options: (p.options ?? []).map((opt) => ({ value: opt, label: opt })),
          default: p.default as string,
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

  missions: bridgeLabConfig.missions.map((m) => ({
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
      const bridgeState = state as unknown as BridgeState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(bridgeState, o.target)

        // If beams are broken, fail the objective
        if (bridgeState.brokenBeams > 0 && o.check !== 'checkSurviveEarthquake') {
          return { id: o.id, status: 'failed' as const }
        }

        return {
          id: o.id,
          status: passed ? ('completed' as const) : ('pending' as const),
        }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed — we use the episode render function
  },

  createInitialState: (_params?: ParamValues): PhysicsState => {
    return createInitialState({
      material: 'steel',
      'load-weight': 1000,
      gravity: 9.81,
      'show-forces': false,
      'show-stress': true,
    }) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, dt: number): PhysicsState => {
    const bridgeState = state as unknown as BridgeState
    return updateBridge(bridgeState, params, dt) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const bridgeState = state as unknown as BridgeState
    renderBridgeLab(renderCtx.ctx, bridgeState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(bridgeLabConfig)
registerEpisodeDefinition(bridgeLabDefinition)

export { bridgeLabConfig } from './config.ts'
export {
  createInitialState,
  updateBridge,
  checkNoBrokenBeams,
  checkWeightUnder,
  checkSafetyFactor,
  checkSurviveEarthquake,
  MATERIALS,
  createWarrenTruss,
} from './physics.ts'
export type { BridgeState, BridgeParams, Material, Node, Beam } from './types.ts'
export { renderBridgeLab } from './renderer.ts'
