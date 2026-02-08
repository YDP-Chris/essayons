/**
 * Tests for Citizen Lab episode.
 *
 * Validates state machine transitions, guard conditions, vote calculations,
 * mission evaluation, and configuration.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { legislativeStateMachineConfig } from './state-machine.ts'
import { StateMachine } from '@/engine/StateMachine.ts'
import {
  createInitialState,
  updateStateFromParams,
  computeVoteCount,
  willCommitteeApprove,
  willFloorVotePass,
  willExecutiveSign,
  willOverrideSucceed,
  canInvokeFilibuster,
  suggestNextEvent,
} from './simulation.ts'
import {
  checkBillPassed,
  checkVetoOccurred,
  checkOverrideSuccess,
  checkBillRejected,
  checkFilibusterInvoked,
  createCitizenLabEngine,
  handleStateTransition,
} from './index.ts'
import { citizenLabConfig } from './config.ts'
import type { CivicsSimulationState, LegislativeState, LegislativeEvent } from './types.ts'
import type { ParamValues } from '@/engine/types.ts'

describe('Citizen Lab - State Machine', () => {
  let stateMachine: StateMachine<LegislativeState, LegislativeEvent>

  beforeEach(() => {
    stateMachine = new StateMachine(legislativeStateMachineConfig)
  })

  it('should start in PROPOSAL state', () => {
    expect(stateMachine.currentState).toBe('PROPOSAL')
  })

  it('should transition from PROPOSAL to COMMITTEE', () => {
    const success = stateMachine.send('SUBMIT_TO_COMMITTEE')
    expect(success).toBe(true)
    expect(stateMachine.currentState).toBe('COMMITTEE')
  })

  it('should transition from COMMITTEE to FLOOR_DEBATE on approval', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    expect(stateMachine.currentState).toBe('FLOOR_DEBATE')
  })

  it('should transition from COMMITTEE to REJECTED on rejection', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('REJECT_COMMITTEE')
    expect(stateMachine.currentState).toBe('REJECTED')
  })

  it('should transition from FLOOR_DEBATE to VOTE', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')
    expect(stateMachine.currentState).toBe('VOTE')
  })

  it('should transition from FLOOR_DEBATE to REJECTED on filibuster', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('INVOKE_FILIBUSTER')
    expect(stateMachine.currentState).toBe('REJECTED')
  })

  it('should transition from VOTE to PASSED on signature', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')
    stateMachine.send('SIGN_BILL')
    expect(stateMachine.currentState).toBe('PASSED')
  })

  it('should transition from VOTE to VETOED on veto', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')
    stateMachine.send('VETO_BILL')
    expect(stateMachine.currentState).toBe('VETOED')
  })

  it('should transition from VETOED to OVERRIDE_ATTEMPT', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')
    stateMachine.send('VETO_BILL')
    stateMachine.send('ATTEMPT_OVERRIDE')
    expect(stateMachine.currentState).toBe('OVERRIDE_ATTEMPT')
  })

  it('should transition from OVERRIDE_ATTEMPT to OVERRIDE_SUCCESS', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')
    stateMachine.send('VETO_BILL')
    stateMachine.send('ATTEMPT_OVERRIDE')
    stateMachine.send('OVERRIDE_SUCCEED')
    expect(stateMachine.currentState).toBe('OVERRIDE_SUCCESS')
  })

  it('should transition from OVERRIDE_ATTEMPT to OVERRIDE_FAILED', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')
    stateMachine.send('VETO_BILL')
    stateMachine.send('ATTEMPT_OVERRIDE')
    stateMachine.send('OVERRIDE_FAIL')
    expect(stateMachine.currentState).toBe('OVERRIDE_FAILED')
  })

  it('should allow restarting from terminal states', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')
    stateMachine.send('SIGN_BILL')
    expect(stateMachine.currentState).toBe('PASSED')

    stateMachine.send('SUBMIT_TO_COMMITTEE')
    expect(stateMachine.currentState).toBe('PROPOSAL')
  })

  it('should not allow invalid transitions', () => {
    const success = stateMachine.send('APPROVE_COMMITTEE')
    expect(success).toBe(false)
    expect(stateMachine.currentState).toBe('PROPOSAL')
  })

  it('should track transition history', () => {
    stateMachine.send('SUBMIT_TO_COMMITTEE')
    stateMachine.send('APPROVE_COMMITTEE')
    stateMachine.send('CALL_FLOOR_VOTE')

    expect(stateMachine.history).toEqual(['PROPOSAL', 'COMMITTEE', 'FLOOR_DEBATE', 'VOTE'])
  })
})

describe('Citizen Lab - Vote Calculation', () => {
  it('should compute vote count based on party composition', () => {
    const votes = computeVoteCount(60, 50, 50)
    expect(votes.yea).toBeGreaterThan(50)
    expect(votes.yea + votes.nay).toBe(100)
  })

  it('should increase yea votes with high public approval', () => {
    const lowApproval = computeVoteCount(55, 30, 50)
    const highApproval = computeVoteCount(55, 80, 50)
    expect(highApproval.yea).toBeGreaterThan(lowApproval.yea)
  })

  it('should amplify public sentiment with media coverage', () => {
    const lowMedia = computeVoteCount(55, 70, 20)
    const highMedia = computeVoteCount(55, 70, 90)
    expect(highMedia.yea).toBeGreaterThan(lowMedia.yea)
  })

  it('should clamp votes to 0-100 range', () => {
    const votes1 = computeVoteCount(100, 100, 100)
    expect(votes1.yea).toBeLessThanOrEqual(100)
    expect(votes1.yea).toBeGreaterThanOrEqual(0)

    const votes2 = computeVoteCount(0, 0, 0)
    expect(votes2.yea).toBeLessThanOrEqual(100)
    expect(votes2.yea).toBeGreaterThanOrEqual(0)
  })
})

describe('Citizen Lab - Decision Logic', () => {
  it('should approve committee with high lobbying', () => {
    // Use multiple samples to test probabilistic function
    let approvalCount = 0
    for (let i = 0; i < 100; i++) {
      if (willCommitteeApprove(80, 60)) approvalCount++
    }
    expect(approvalCount).toBeGreaterThan(50) // Should succeed most of the time
  })

  it('should reject committee with low lobbying and approval', () => {
    let rejectionCount = 0
    for (let i = 0; i < 100; i++) {
      if (!willCommitteeApprove(10, 20)) rejectionCount++
    }
    expect(rejectionCount).toBeGreaterThan(50) // Should fail most of the time
  })

  it('should pass floor vote with majority', () => {
    expect(willFloorVotePass({ yea: 51, nay: 49 })).toBe(true)
    expect(willFloorVotePass({ yea: 60, nay: 40 })).toBe(true)
  })

  it('should fail floor vote without majority', () => {
    expect(willFloorVotePass({ yea: 50, nay: 50 })).toBe(false)
    expect(willFloorVotePass({ yea: 45, nay: 55 })).toBe(false)
  })

  it('should sign bill with high approval and party support', () => {
    let signCount = 0
    for (let i = 0; i < 100; i++) {
      if (willExecutiveSign(80, 70)) signCount++
    }
    expect(signCount).toBeGreaterThan(50) // High likelihood
  })

  it('should veto bill with low approval', () => {
    let vetoCount = 0
    for (let i = 0; i < 100; i++) {
      if (!willExecutiveSign(20, 30)) vetoCount++
    }
    expect(vetoCount).toBeGreaterThan(50) // Higher veto chance
  })

  it('should override veto with supermajority', () => {
    expect(willOverrideSucceed({ yea: 67, nay: 33 })).toBe(true)
    expect(willOverrideSucceed({ yea: 70, nay: 30 })).toBe(true)
  })

  it('should fail to override veto without supermajority', () => {
    expect(willOverrideSucceed({ yea: 66, nay: 34 })).toBe(false)
    expect(willOverrideSucceed({ yea: 60, nay: 40 })).toBe(false)
  })

  it('should allow filibuster below threshold', () => {
    expect(canInvokeFilibuster({ yea: 55, nay: 45 }, 60)).toBe(true)
    expect(canInvokeFilibuster({ yea: 59, nay: 41 }, 60)).toBe(true)
  })

  it('should prevent filibuster at or above threshold', () => {
    expect(canInvokeFilibuster({ yea: 60, nay: 40 }, 60)).toBe(false)
    expect(canInvokeFilibuster({ yea: 65, nay: 35 }, 60)).toBe(false)
  })
})

describe('Citizen Lab - State Management', () => {
  it('should create initial state with default parameters', () => {
    const params: ParamValues = {
      'party-composition': 55,
      'public-approval': 50,
      'lobbying-pressure': 30,
      'media-coverage': 50,
      'filibuster-threshold': 60,
    }
    const state = createInitialState(params)

    expect(state.legislativeState).toBe('PROPOSAL')
    expect(state.partyComposition).toBe(55)
    expect(state.publicApproval).toBe(50)
    expect(state.lobbyingPressure).toBe(30)
    expect(state.mediaCoverage).toBe(50)
    expect(state.filibusterThreshold).toBe(60)
    expect(state.billsProcessed).toBe(0)
    expect(state.vetoCount).toBe(0)
  })

  it('should update state from changed parameters', () => {
    const initialParams: ParamValues = {
      'party-composition': 55,
      'public-approval': 50,
      'lobbying-pressure': 30,
      'media-coverage': 50,
      'filibuster-threshold': 60,
    }
    const state = createInitialState(initialParams)

    const newParams: ParamValues = {
      'party-composition': 70,
      'public-approval': 80,
      'lobbying-pressure': 60,
      'media-coverage': 75,
      'filibuster-threshold': 65,
    }
    const updatedState = updateStateFromParams(state, newParams)

    expect(updatedState.partyComposition).toBe(70)
    expect(updatedState.publicApproval).toBe(80)
    expect(updatedState.lobbyingPressure).toBe(60)
    expect(updatedState.mediaCoverage).toBe(75)
    expect(updatedState.filibusterThreshold).toBe(65)
  })

  it('should recalculate vote counts when parameters change', () => {
    const params1: ParamValues = {
      'party-composition': 50,
      'public-approval': 50,
      'lobbying-pressure': 30,
      'media-coverage': 50,
      'filibuster-threshold': 60,
    }
    const state1 = createInitialState(params1)

    const params2: ParamValues = {
      'party-composition': 70,
      'public-approval': 80,
      'lobbying-pressure': 30,
      'media-coverage': 50,
      'filibuster-threshold': 60,
    }
    const state2 = createInitialState(params2)

    expect(state2.voteCount.yea).toBeGreaterThan(state1.voteCount.yea)
  })
})

describe('Citizen Lab - Mission Checks', () => {
  it('should detect bill passed', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'PASSED',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 60, nay: 40 },
      decisionHistory: [],
      billsProcessed: 1,
      vetoCount: 0,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    expect(checkBillPassed(state)).toBe(true)
  })

  it('should detect veto occurred', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'VETOED',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 60, nay: 40 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 1,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    expect(checkVetoOccurred(state)).toBe(true)
  })

  it('should detect override success', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'OVERRIDE_SUCCESS',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 70,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 70, nay: 30 },
      decisionHistory: [],
      billsProcessed: 1,
      vetoCount: 1,
      overrideAttempts: 1,
      overrideSuccesses: 1,
      filibusterThreshold: 60,
    }

    expect(checkOverrideSuccess(state)).toBe(true)
  })

  it('should detect bill rejected', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'REJECTED',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 40, nay: 60 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 0,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    expect(checkBillRejected(state)).toBe(true)
  })

  it('should detect filibuster invoked', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'REJECTED',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 55, nay: 45 },
      decisionHistory: [
        {
          event: 'INVOKE_FILIBUSTER',
          timestamp: 3,
          state: 'FLOOR_DEBATE',
        },
      ],
      billsProcessed: 0,
      vetoCount: 0,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    expect(checkFilibusterInvoked(state)).toBe(true)
  })
})

describe('Citizen Lab - Event Suggestions', () => {
  it('should suggest SUBMIT_TO_COMMITTEE from PROPOSAL', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'PROPOSAL',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 55, nay: 45 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 0,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    expect(suggestNextEvent(state)).toBe('SUBMIT_TO_COMMITTEE')
  })

  it('should suggest ATTEMPT_OVERRIDE from VETOED', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'VETOED',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 55, nay: 45 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 1,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    expect(suggestNextEvent(state)).toBe('ATTEMPT_OVERRIDE')
  })
})

describe('Citizen Lab - State Transitions', () => {
  it('should increment bills processed when passed', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'VOTE',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 60, nay: 40 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 0,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    const newState = handleStateTransition(state, 'PASSED')
    expect(newState.billsProcessed).toBe(1)
  })

  it('should increment veto count when vetoed', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'VOTE',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 55,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 60, nay: 40 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 0,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    const newState = handleStateTransition(state, 'VETOED')
    expect(newState.vetoCount).toBe(1)
  })

  it('should increment override attempts', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'VETOED',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 70,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 70, nay: 30 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 1,
      overrideAttempts: 0,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    const newState = handleStateTransition(state, 'OVERRIDE_ATTEMPT')
    expect(newState.overrideAttempts).toBe(1)
  })

  it('should increment override successes and bills processed', () => {
    const state: CivicsSimulationState = {
      legislativeState: 'OVERRIDE_ATTEMPT',
      billTitle: 'Test Bill',
      publicApproval: 50,
      partyComposition: 70,
      lobbyingPressure: 30,
      mediaCoverage: 50,
      voteCount: { yea: 70, nay: 30 },
      decisionHistory: [],
      billsProcessed: 0,
      vetoCount: 1,
      overrideAttempts: 1,
      overrideSuccesses: 0,
      filibusterThreshold: 60,
    }

    const newState = handleStateTransition(state, 'OVERRIDE_SUCCESS')
    expect(newState.overrideSuccesses).toBe(1)
    expect(newState.billsProcessed).toBe(1)
  })
})

describe('Citizen Lab - Configuration', () => {
  it('should have valid episode config', () => {
    expect(citizenLabConfig.id).toBe('citizen-lab')
    expect(citizenLabConfig.title).toBe('Citizen Lab')
    expect(citizenLabConfig.domain).toBe('civics')
    expect(citizenLabConfig.simulationMode).toBe('event-driven')
  })

  it('should have all required parameters', () => {
    const paramIds = citizenLabConfig.parameters.map((p) => p.id)
    expect(paramIds).toContain('party-composition')
    expect(paramIds).toContain('public-approval')
    expect(paramIds).toContain('lobbying-pressure')
    expect(paramIds).toContain('media-coverage')
    expect(paramIds).toContain('filibuster-threshold')
  })

  it('should have all required missions', () => {
    const missionIds = citizenLabConfig.missions.map((m) => m.id)
    expect(missionIds).toContain('pass-first-bill')
    expect(missionIds).toContain('survive-veto')
    expect(missionIds).toContain('gridlock')
    expect(missionIds).toContain('filibuster')
  })

  it('should have reference content', () => {
    expect(citizenLabConfig.referenceContent.length).toBeGreaterThan(0)
    const refIds = citizenLabConfig.referenceContent.map((r) => r.id)
    expect(refIds).toContain('separation-of-powers')
    expect(refIds).toContain('how-bill-becomes-law')
  })
})

describe('Citizen Lab - DiscreteEngine Integration', () => {
  it('should create a DiscreteEngine instance', () => {
    const engine = createCitizenLabEngine()
    expect(engine).toBeDefined()
    expect(engine.mode).toBe('event-driven')
  })

  it('should have state machine', () => {
    const engine = createCitizenLabEngine()
    expect(engine.stateMachine).toBeDefined()
    expect(engine.stateMachine?.currentState).toBe('PROPOSAL')
  })

  it('should transition states via engine', () => {
    const engine = createCitizenLabEngine()
    const success = engine.sendEvent('SUBMIT_TO_COMMITTEE')
    expect(success).toBe(true)
    expect(engine.stateMachine?.currentState).toBe('COMMITTEE')
  })

  it('should get available events', () => {
    const engine = createCitizenLabEngine()
    const events = engine.getAvailableEvents()
    expect(events).toContain('SUBMIT_TO_COMMITTEE')
  })
})
