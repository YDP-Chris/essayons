/**
 * Citizen Lab — Episode 02: Civics Simulator.
 *
 * Registers the Citizen Lab episode with the episode registry and exports
 * an EpisodeDefinition that wires the legislative state machine to the
 * canvas renderer and mission evaluation system.
 */

import type {
  EpisodeDefinition,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { citizenLabConfig } from './config.ts'
import { createInitialState, updateStateFromParams } from './simulation.ts'
import type { CivicsSimulationState, LegislativeEvent, DecisionRecord } from './types.ts'
import { renderCitizenLab } from './renderer.ts'
import { registerEpisode, registerEpisodeDefinition } from '../registry.ts'
import { legislativeStateMachineConfig } from './state-machine.ts'
import { DiscreteEngine } from '@/engine/DiscreteEngine.ts'

// ---------------------------------------------------------------------------
// Mission check functions
// ---------------------------------------------------------------------------

function checkBillPassed(state: CivicsSimulationState): boolean {
  return state.legislativeState === 'PASSED' || state.billsProcessed > 0
}

function checkVetoOccurred(state: CivicsSimulationState): boolean {
  return state.vetoCount > 0
}

function checkOverrideSuccess(state: CivicsSimulationState): boolean {
  return state.overrideSuccesses > 0
}

function checkBillRejected(state: CivicsSimulationState): boolean {
  return state.legislativeState === 'REJECTED'
}

function checkFilibusterInvoked(state: CivicsSimulationState): boolean {
  return state.decisionHistory.some((d) => d.event === 'INVOKE_FILIBUSTER')
}

const missionChecks: Record<string, (state: CivicsSimulationState) => boolean> = {
  checkBillPassed,
  checkVetoOccurred,
  checkOverrideSuccess,
  checkBillRejected,
  checkFilibusterInvoked,
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

export const citizenLabDefinition: EpisodeDefinition = {
  id: citizenLabConfig.id,
  name: citizenLabConfig.title,
  description: citizenLabConfig.description,
  accentColor: '#e63946',

  parameters: citizenLabConfig.parameters.map((p) => {
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

  missions: citizenLabConfig.missions.map((m) => ({
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
      const civicsState = state as unknown as CivicsSimulationState
      return m.objectives.map((o) => {
        const checkFn = missionChecks[o.check]
        if (!checkFn) {
          return { id: o.id, status: 'pending' as const }
        }
        const passed = checkFn(civicsState)
        return { id: o.id, status: passed ? ('completed' as const) : ('pending' as const) }
      })
    },
  })),

  init: (_engine) => {
    // No additional render layers needed — we use the episode render function
  },

  createInitialState: (): PhysicsState => {
    const params: ParamValues = {
      'party-composition': 55,
      'public-approval': 50,
      'lobbying-pressure': 30,
      'media-coverage': 50,
      'filibuster-threshold': 60,
    }
    return createInitialState(params) as unknown as PhysicsState
  },

  update: (state: PhysicsState, params: ParamValues, _dt: number): PhysicsState => {
    const civicsState = state as unknown as CivicsSimulationState
    return updateStateFromParams(civicsState, params) as unknown as PhysicsState
  },

  render: (renderCtx, state, params) => {
    const civicsState = state as unknown as CivicsSimulationState
    renderCitizenLab(renderCtx.ctx, civicsState, params, renderCtx.width, renderCtx.height)
  },

  cleanup: () => {
    // No resources to release
  },
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerEpisode(citizenLabConfig)
registerEpisodeDefinition(citizenLabDefinition)

export { citizenLabConfig } from './config.ts'
export { createInitialState, updateStateFromParams } from './simulation.ts'
export type { CivicsSimulationState, LegislativeState, LegislativeEvent } from './types.ts'
export { renderCitizenLab } from './renderer.ts'
export { legislativeStateMachineConfig } from './state-machine.ts'
export { DiscreteEngine }
export {
  checkBillPassed,
  checkVetoOccurred,
  checkOverrideSuccess,
  checkBillRejected,
  checkFilibusterInvoked,
}

// Export mission check functions for testing
export const missionCheckFunctions = missionChecks

// Helper to create a DiscreteEngine instance for this episode
export function createCitizenLabEngine(): DiscreteEngine<CivicsSimulationState> {
  const initialParams: ParamValues = {
    'party-composition': 55,
    'public-approval': 50,
    'lobbying-pressure': 30,
    'media-coverage': 50,
    'filibuster-threshold': 60,
  }

  const initialState = createInitialState(initialParams)

  return new DiscreteEngine<CivicsSimulationState>({
    mode: 'event-driven',
    initialState,
    parameters: citizenLabDefinition.parameters,
    missions: citizenLabDefinition.missions,
    stateMachineConfig: legislativeStateMachineConfig as {
      initialState: string
      transitions: ReadonlyArray<{
        from: string
        to: string
        on: string
        guard?: (state: string, event: string) => boolean
      }>
      onEntry?: Partial<Record<string, (state: string) => void>>
      onExit?: Partial<Record<string, (state: string) => void>>
    },
  })
}

// Helper to advance the simulation with an event
export function processLegislativeEvent(
  engine: DiscreteEngine<CivicsSimulationState>,
  event: LegislativeEvent,
): boolean {
  const state = engine.getState()
  const newDecision: DecisionRecord = {
    event,
    timestamp: engine.stepCount,
    state: state.legislativeState,
  }

  // Update state with new decision
  engine.setState({
    ...state,
    decisionHistory: [...state.decisionHistory, newDecision],
  })

  // Send event to state machine
  return engine.sendEvent(event)
}

// Helper to handle state transitions and update simulation state accordingly
export function handleStateTransition(
  state: CivicsSimulationState,
  newLegislativeState: string,
): CivicsSimulationState {
  let updatedState = {
    ...state,
    legislativeState: newLegislativeState as CivicsSimulationState['legislativeState'],
  }

  // Update counters based on transitions
  if (newLegislativeState === 'PASSED') {
    updatedState = {
      ...updatedState,
      billsProcessed: updatedState.billsProcessed + 1,
    }
  } else if (newLegislativeState === 'VETOED') {
    updatedState = {
      ...updatedState,
      vetoCount: updatedState.vetoCount + 1,
    }
  } else if (newLegislativeState === 'OVERRIDE_ATTEMPT') {
    updatedState = {
      ...updatedState,
      overrideAttempts: updatedState.overrideAttempts + 1,
    }
  } else if (newLegislativeState === 'OVERRIDE_SUCCESS') {
    updatedState = {
      ...updatedState,
      overrideSuccesses: updatedState.overrideSuccesses + 1,
      billsProcessed: updatedState.billsProcessed + 1,
    }
  }

  return updatedState
}
