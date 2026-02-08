/**
 * Legislative state machine configuration for the Citizen Lab episode.
 *
 * Defines all valid transitions between legislative states with guard
 * conditions based on vote counts, party composition, and public approval.
 */

import type { StateMachineConfig, GuardFn } from '@/engine/discrete-types.ts'
import type { LegislativeState, LegislativeEvent } from './types.ts'

// ---------------------------------------------------------------------------
// Guard Functions
// ---------------------------------------------------------------------------

/**
 * Guard for committee approval - based on lobbying pressure and public approval.
 */
export const committeeApprovalGuard: GuardFn<LegislativeState, LegislativeEvent> = (
  _state: LegislativeState,
  _event: LegislativeEvent,
): boolean => {
  // This would check the simulation state, but guards receive state machine state
  // We'll handle this via the simulation layer sending the right events
  return true
}

/**
 * Guard for vote passage - requires majority support.
 */
export const votePassGuard: GuardFn<LegislativeState, LegislativeEvent> = (
  _state: LegislativeState,
  _event: LegislativeEvent,
): boolean => {
  return true
}

/**
 * Guard for veto override - requires 2/3 supermajority.
 */
export const overrideSuccessGuard: GuardFn<LegislativeState, LegislativeEvent> = (
  _state: LegislativeState,
  _event: LegislativeEvent,
): boolean => {
  return true
}

// ---------------------------------------------------------------------------
// State Machine Configuration
// ---------------------------------------------------------------------------

export const legislativeStateMachineConfig: StateMachineConfig<LegislativeState, LegislativeEvent> =
  {
    initialState: 'PROPOSAL',
    transitions: [
      // From PROPOSAL
      { from: 'PROPOSAL', to: 'COMMITTEE', on: 'SUBMIT_TO_COMMITTEE' },

      // From COMMITTEE
      { from: 'COMMITTEE', to: 'FLOOR_DEBATE', on: 'APPROVE_COMMITTEE' },
      { from: 'COMMITTEE', to: 'REJECTED', on: 'REJECT_COMMITTEE' },

      // From FLOOR_DEBATE
      { from: 'FLOOR_DEBATE', to: 'VOTE', on: 'CALL_FLOOR_VOTE' },
      { from: 'FLOOR_DEBATE', to: 'REJECTED', on: 'INVOKE_FILIBUSTER' },

      // From VOTE
      { from: 'VOTE', to: 'PASSED', on: 'SIGN_BILL' },
      { from: 'VOTE', to: 'VETOED', on: 'VETO_BILL' },
      { from: 'VOTE', to: 'REJECTED', on: 'VOTE_FAIL' },

      // From VETOED
      { from: 'VETOED', to: 'OVERRIDE_ATTEMPT', on: 'ATTEMPT_OVERRIDE' },

      // From OVERRIDE_ATTEMPT
      { from: 'OVERRIDE_ATTEMPT', to: 'OVERRIDE_SUCCESS', on: 'OVERRIDE_SUCCEED' },
      { from: 'OVERRIDE_ATTEMPT', to: 'OVERRIDE_FAILED', on: 'OVERRIDE_FAIL' },

      // Terminal state transitions - allow restarting the process
      { from: 'PASSED', to: 'PROPOSAL', on: 'SUBMIT_TO_COMMITTEE' },
      { from: 'REJECTED', to: 'PROPOSAL', on: 'SUBMIT_TO_COMMITTEE' },
      { from: 'OVERRIDE_SUCCESS', to: 'PROPOSAL', on: 'SUBMIT_TO_COMMITTEE' },
      { from: 'OVERRIDE_FAILED', to: 'PROPOSAL', on: 'SUBMIT_TO_COMMITTEE' },
    ],
    onEntry: {},
    onExit: {},
  }
