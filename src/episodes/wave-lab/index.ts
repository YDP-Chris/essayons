/**
 * Wave Lab — Episode: Wave Mechanics and String Resonance Simulator.
 *
 * Registers the Wave Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the wave physics engine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { waveLabConfig } from './config.ts'
import {
  createInitialState,
  updateWaveState,
  checkFundamentalResonance,
  checkSustainedResonance,
  checkSecondHarmonic,
  checkThirdHarmonic,
  checkNodeCounting,
  checkLengthResonance,
  checkTensionResonance,
  checkPhysicsUnderstanding,
  resetMissionTracking,
} from './physics.ts'
import type { WaveState } from './types.ts'
import { renderWaveLab } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'

// ---------------------------------------------------------------------------
// Mission check function map
// ---------------------------------------------------------------------------

const missionChecks: Record<string, (state: WaveState) => boolean> = {
  checkFundamentalResonance,
  checkSustainedResonance,
  checkSecondHarmonic,
  checkThirdHarmonic,
  checkNodeCounting,
  checkLengthResonance,
  checkTensionResonance,
  checkPhysicsUnderstanding,
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const waveLabDefinition: EpisodeDefinition = {
  id: waveLabConfig.id,
  name: waveLabConfig.title,
  description: waveLabConfig.description,
  accentColor: '#00D4AA', // Physics domain accent color

  parameters: waveLabConfig.parameters.map((p) => {
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

  missions: waveLabConfig.missions.map((m) => ({
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
      const waveState = state as unknown as WaveState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(waveState)
        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // Reset mission tracking state when episode starts
    resetMissionTracking()
  },

  createInitialState: (params?: ParamValues): PhysicsState => {
    return createInitialState(
      params ?? {
        'string-length': 1.0,
        'string-tension': 100,
        'linear-density': 0.005,
        'driving-frequency': 70,
        'driving-amplitude': 0.01,
      },
    ) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, dt: number): PhysicsState => {
    const waveState = state as unknown as WaveState
    return updateWaveState(waveState, params, dt) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const waveState = state as unknown as WaveState
    renderWaveLab(renderCtx.ctx, waveState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // Reset tracking state on cleanup
    resetMissionTracking()
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(waveLabConfig)
registerEpisodeDefinition(waveLabDefinition)

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { waveLabConfig } from './config.ts'
export {
  createInitialState,
  updateWaveState,
  checkFundamentalResonance,
  checkSustainedResonance,
  checkSecondHarmonic,
  checkThirdHarmonic,
  checkNodeCounting,
  checkLengthResonance,
  checkTensionResonance,
  checkPhysicsUnderstanding,
  resetMissionTracking,
  getWavelength,
  getHarmonicFrequency,
  isNearHarmonic,
} from './physics.ts'
export type {
  StringParameters,
  DrivingForce,
  WaveState,
  PhysicsConfig,
  WaveParams,
} from './types.ts'
export { renderWaveLab, resetWaveLabRenderer } from './renderer.ts'
