/**
 * Type definitions for the Citizen Lab (Civics) episode.
 *
 * Models the legislative process as a state machine with transitions
 * representing the path a bill takes through committee, debate, voting,
 * and potential veto/override scenarios.
 */

export type LegislativeState =
  | 'PROPOSAL'
  | 'COMMITTEE'
  | 'FLOOR_DEBATE'
  | 'VOTE'
  | 'PASSED'
  | 'VETOED'
  | 'OVERRIDE_ATTEMPT'
  | 'OVERRIDE_SUCCESS'
  | 'OVERRIDE_FAILED'
  | 'REJECTED'

export type LegislativeEvent =
  | 'SUBMIT_TO_COMMITTEE'
  | 'APPROVE_COMMITTEE'
  | 'REJECT_COMMITTEE'
  | 'CALL_FLOOR_VOTE'
  | 'INVOKE_FILIBUSTER'
  | 'VOTE_PASS'
  | 'VOTE_FAIL'
  | 'SIGN_BILL'
  | 'VETO_BILL'
  | 'ATTEMPT_OVERRIDE'
  | 'OVERRIDE_SUCCEED'
  | 'OVERRIDE_FAIL'

export interface VoteCount {
  readonly yea: number
  readonly nay: number
}

export interface DecisionRecord {
  readonly event: LegislativeEvent
  readonly timestamp: number
  readonly state: LegislativeState
}

export interface CivicsSimulationState {
  readonly legislativeState: LegislativeState
  readonly billTitle: string
  readonly publicApproval: number
  readonly partyComposition: number
  readonly lobbyingPressure: number
  readonly mediaCoverage: number
  readonly voteCount: VoteCount
  readonly decisionHistory: ReadonlyArray<DecisionRecord>
  readonly billsProcessed: number
  readonly vetoCount: number
  readonly overrideAttempts: number
  readonly overrideSuccesses: number
  readonly filibusterThreshold: number
}
