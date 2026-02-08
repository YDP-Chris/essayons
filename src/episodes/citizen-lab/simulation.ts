/**
 * Simulation logic for the Citizen Lab episode.
 *
 * Computes vote outcomes, committee decisions, and veto override attempts
 * based on parameter values (party composition, public approval, lobbying, media).
 */

import type { ParamValues } from '@/engine/types.ts'
import type { CivicsSimulationState, VoteCount, LegislativeEvent } from './types.ts'

// ---------------------------------------------------------------------------
// Vote Computation
// ---------------------------------------------------------------------------

/**
 * Calculate vote counts based on party composition and public approval.
 * Returns a vote split between yea and nay (out of 100 total votes).
 */
export function computeVoteCount(
  partyComposition: number,
  publicApproval: number,
  mediaCoverage: number,
): VoteCount {
  // Base support from party composition
  let yeaVotes = partyComposition

  // Public approval influences swing voters (moderate effect)
  const approvalEffect = (publicApproval - 50) * 0.3
  yeaVotes += approvalEffect

  // Media coverage amplifies public sentiment
  const mediaAmplifier = mediaCoverage / 100
  yeaVotes += approvalEffect * mediaAmplifier * 0.5

  // Clamp to 0-100 range
  yeaVotes = Math.max(0, Math.min(100, yeaVotes))

  return {
    yea: Math.round(yeaVotes),
    nay: Math.round(100 - yeaVotes),
  }
}

/**
 * Determine if a bill passes committee review.
 * Committee approval is influenced by lobbying and public approval.
 */
export function willCommitteeApprove(lobbyingPressure: number, publicApproval: number): boolean {
  // Base threshold: 40% chance
  let approvalChance = 40

  // Lobbying increases approval chance significantly
  approvalChance += lobbyingPressure * 0.4

  // Public approval provides moderate boost
  approvalChance += (publicApproval - 50) * 0.2

  // Random chance element (realistic uncertainty)
  const roll = Math.random() * 100
  return roll < approvalChance
}

/**
 * Determine if a bill passes the floor vote.
 * Requires simple majority (>50%).
 */
export function willFloorVotePass(voteCount: VoteCount): boolean {
  return voteCount.yea > 50
}

/**
 * Determine if the executive will sign or veto the bill.
 * Veto is more likely with low public approval and low party composition.
 */
export function willExecutiveSign(publicApproval: number, partyComposition: number): boolean {
  // If public approval is high and party supports it, likely to sign
  const signChance = publicApproval * 0.5 + partyComposition * 0.3

  const roll = Math.random() * 100
  return roll < signChance
}

/**
 * Determine if a veto override attempt succeeds.
 * Requires 2/3 supermajority (67%).
 */
export function willOverrideSucceed(voteCount: VoteCount): boolean {
  return voteCount.yea >= 67
}

/**
 * Determine if a filibuster can block the bill.
 * Requires cloture vote to overcome (based on filibuster threshold parameter).
 */
export function canInvokeFilibuster(voteCount: VoteCount, filibusterThreshold: number): boolean {
  // Filibuster succeeds if yea votes are below the cloture threshold
  return voteCount.yea < filibusterThreshold
}

// ---------------------------------------------------------------------------
// State Creation
// ---------------------------------------------------------------------------

/**
 * Create initial simulation state from parameters.
 */
export function createInitialState(params: ParamValues): CivicsSimulationState {
  const partyComposition = (params['party-composition'] as number) ?? 55
  const publicApproval = (params['public-approval'] as number) ?? 50
  const lobbyingPressure = (params['lobbying-pressure'] as number) ?? 30
  const mediaCoverage = (params['media-coverage'] as number) ?? 50
  const filibusterThreshold = (params['filibuster-threshold'] as number) ?? 60

  const voteCount = computeVoteCount(partyComposition, publicApproval, mediaCoverage)

  return {
    legislativeState: 'PROPOSAL',
    billTitle: 'Infrastructure Modernization Act',
    publicApproval,
    partyComposition,
    lobbyingPressure,
    mediaCoverage,
    voteCount,
    decisionHistory: [],
    billsProcessed: 0,
    vetoCount: 0,
    overrideAttempts: 0,
    overrideSuccesses: 0,
    filibusterThreshold,
  }
}

/**
 * Update simulation state based on parameters.
 * Recalculates vote counts and probabilities.
 */
export function updateStateFromParams(
  state: CivicsSimulationState,
  params: ParamValues,
): CivicsSimulationState {
  const partyComposition = (params['party-composition'] as number) ?? state.partyComposition
  const publicApproval = (params['public-approval'] as number) ?? state.publicApproval
  const lobbyingPressure = (params['lobbying-pressure'] as number) ?? state.lobbyingPressure
  const mediaCoverage = (params['media-coverage'] as number) ?? state.mediaCoverage
  const filibusterThreshold =
    (params['filibuster-threshold'] as number) ?? state.filibusterThreshold

  const voteCount = computeVoteCount(partyComposition, publicApproval, mediaCoverage)

  return {
    ...state,
    partyComposition,
    publicApproval,
    lobbyingPressure,
    mediaCoverage,
    voteCount,
    filibusterThreshold,
  }
}

/**
 * Get the next event based on current state and simulation conditions.
 * This provides intelligent auto-progression hints.
 */
export function suggestNextEvent(state: CivicsSimulationState): LegislativeEvent | null {
  switch (state.legislativeState) {
    case 'PROPOSAL':
      return 'SUBMIT_TO_COMMITTEE'

    case 'COMMITTEE':
      return willCommitteeApprove(state.lobbyingPressure, state.publicApproval)
        ? 'APPROVE_COMMITTEE'
        : 'REJECT_COMMITTEE'

    case 'FLOOR_DEBATE':
      return canInvokeFilibuster(state.voteCount, state.filibusterThreshold)
        ? 'INVOKE_FILIBUSTER'
        : 'CALL_FLOOR_VOTE'

    case 'VOTE':
      if (willFloorVotePass(state.voteCount)) {
        return willExecutiveSign(state.publicApproval, state.partyComposition)
          ? 'SIGN_BILL'
          : 'VETO_BILL'
      }
      return 'VOTE_FAIL'

    case 'VETOED':
      return 'ATTEMPT_OVERRIDE'

    case 'OVERRIDE_ATTEMPT':
      return willOverrideSucceed(state.voteCount) ? 'OVERRIDE_SUCCEED' : 'OVERRIDE_FAIL'

    default:
      return null
  }
}
