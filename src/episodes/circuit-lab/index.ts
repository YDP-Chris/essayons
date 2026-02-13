/**
 * Circuit Lab — Episode 09: Electrical Circuit Simulator.
 *
 * Registers the Circuit Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the circuit physics engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { circuitLabConfig } from './config.ts'
import {
  createInitialState,
  updateCircuitState,
  checkBulbPowered,
  checkCircuitComplete,
  checkTwoResistorsInSeries,
  checkVoltageSplit,
  checkRCCircuit,
  checkCapacitorCharging,
  checkShortCircuit,
  checkHighCurrent,
} from './physics.ts'
import type { CircuitState } from './types.ts'
import { renderCircuitLab } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: CircuitState) => boolean> = {
  checkBulbPowered,
  checkCircuitComplete,
  checkTwoResistorsInSeries,
  checkVoltageSplit,
  checkRCCircuit,
  checkCapacitorCharging,
  checkShortCircuit,
  checkHighCurrent,
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const circuitLabDefinition: EpisodeDefinition = {
  id: circuitLabConfig.id,
  name: circuitLabConfig.title,
  description: circuitLabConfig.description,
  accentColor: '#FF6B35',

  parameters: circuitLabConfig.parameters.map((p) => {
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
          options: (p.options ?? []).map((o) => ({ value: o, label: o })),
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

  missions: circuitLabConfig.missions.map((m) => ({
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
      const circuitState = state as unknown as CircuitState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(circuitState)

        // Special handling for circuit-complete objective
        if (o.check === 'checkCircuitComplete') {
          if (!passed && circuitState.components.length > 0) {
            return { id: o.id, status: 'failed' as const }
          }
          return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
        }

        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed — we use the episode render function
  },

  createInitialState: (params?: ParamValues): PhysicsState => {
    return createInitialState(
      params ?? {
        'grid-size': 20,
        'show-current': true,
        'show-voltage': true,
        'show-power': false,
        'show-values': true,
        'animation-speed': 1.0,
        'wire-thickness': 3,
      },
    ) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, dt: number): PhysicsState => {
    const circuitState = state as unknown as CircuitState
    return updateCircuitState(circuitState, params, dt) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const circuitState = state as unknown as CircuitState
    renderCircuitLab(renderCtx.ctx, circuitState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(circuitLabConfig)
registerEpisodeDefinition(circuitLabDefinition)

export { circuitLabConfig } from './config.ts'
export {
  createInitialState,
  updateCircuitState,
  addComponent,
  removeComponent,
  connectComponents,
  checkBulbPowered,
  checkCircuitComplete,
  checkTwoResistorsInSeries,
  checkVoltageSplit,
  checkRCCircuit,
  checkCapacitorCharging,
  checkShortCircuit,
  checkHighCurrent,
  COMPONENT_LIBRARY,
  DEFAULT_VALUES,
  COMPONENT_NAMES,
} from './physics.ts'
export type { CircuitState, CircuitComponent, CircuitParams } from './types.ts'
export { renderCircuitLab } from './renderer.ts'
