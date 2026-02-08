/**
 * Orbit Lab — Episode 01: Orbital Mechanics Simulator.
 *
 * Registers the Orbit Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the orbital physics engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { orbitLabConfig } from './config.ts'
import {
  createInitialState,
  updateOrbitalState,
  checkOrbitComplete,
  checkNoCrash,
  checkCrash,
  checkEscape,
  checkGeostationary,
} from './physics.ts'
import type { OrbitalState } from './physics.ts'
import { renderOrbitLab } from './renderer.ts'
import { registerEpisode } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: OrbitalState) => boolean> = {
  checkOrbitComplete,
  checkNoCrash,
  checkCrash,
  checkEscape,
  checkGeostationary,
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const orbitLabDefinition: EpisodeDefinition = {
  id: orbitLabConfig.id,
  name: orbitLabConfig.title,
  description: orbitLabConfig.description,
  accentColor: '#6366f1',

  parameters: orbitLabConfig.parameters.map((p) => {
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

  missions: orbitLabConfig.missions.map((m) => ({
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
      const orbitalState = state as unknown as OrbitalState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(orbitalState)

        // Special handling: "no-crash" objective fails if the satellite crashes
        if (o.check === 'checkNoCrash') {
          if (orbitalState.crashed) {
            return { id: o.id, status: 'failed' as const }
          }
          // Stay pending until orbit is complete (companion objective decides success)
          return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
        }

        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed — we use the episode render function
  },

  createInitialState: (): PhysicsState => {
    return createInitialState({
      'planet-mass': 5.972e24,
      'launch-speed': 7500,
      'launch-angle': 0,
      'orbit-altitude': 400000,
    }) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, dt: number): PhysicsState => {
    const orbitalState = state as unknown as OrbitalState
    return updateOrbitalState(orbitalState, params, dt) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const orbitalState = state as unknown as OrbitalState
    renderOrbitLab(renderCtx.ctx, orbitalState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(orbitLabConfig)

export { orbitLabConfig } from './config.ts'
export {
  createInitialState,
  updateOrbitalState,
  checkOrbitComplete,
  checkNoCrash,
  checkCrash,
  checkEscape,
  checkGeostationary,
} from './physics.ts'
export type { OrbitalState, OrbitalParams } from './physics.ts'
export { renderOrbitLab } from './renderer.ts'
