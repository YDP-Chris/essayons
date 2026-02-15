/**
 * Election Lab — Episode 10: Voting Systems & Democratic Paradoxes.
 *
 * Registers the Election Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the election simulation engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { electionLabConfig } from './config.ts'
import {
  createInitialElectionState,
  stepElection,
  checkSpoilerEffect,
  checkCondorcetParadox,
  checkGerrymandering,
  checkArrowsImpossibility,
} from './simulation.ts'
import type { ElectionState } from './types.ts'
import { renderElectionLab } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: ElectionState) => boolean> = {
  checkSpoilerEffect,
  checkCondorcetParadox,
  checkGerrymandering,
  checkArrowsImpossibility,
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const electionLabDefinition: EpisodeDefinition = {
  id: electionLabConfig.id,
  name: electionLabConfig.title,
  description: electionLabConfig.description,
  accentColor: '#E63946',

  parameters: electionLabConfig.parameters.map((p) => {
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
          options: (p.options ?? []).map((opt) => ({ value: opt, label: opt })),
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

  missions: electionLabConfig.missions.map((m) => ({
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
      const electionState = state as unknown as ElectionState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(electionState)
        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed — we use the episode render function
  },

  createInitialState: (params?: ParamValues): PhysicsState => {
    return createInitialElectionState(params ?? {}) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, _dt: number): PhysicsState => {
    // For step-based mode, we step the election on each update call
    // The DiscreteEngine will handle the step timing
    const electionState = state as unknown as ElectionState
    return stepElection(electionState, params) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const electionState = state as unknown as ElectionState
    renderElectionLab(renderCtx.ctx, electionState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(electionLabConfig)
registerEpisodeDefinition(electionLabDefinition)

export { electionLabConfig } from './config.ts'
export {
  createInitialElectionState,
  stepElection,
  checkSpoilerEffect,
  checkCondorcetParadox,
  checkGerrymandering,
  checkArrowsImpossibility,
} from './simulation.ts'
export type { ElectionState, ElectionParams } from './types.ts'
export { renderElectionLab } from './renderer.ts'
