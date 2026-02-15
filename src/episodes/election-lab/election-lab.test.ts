/**
 * Election Lab — Tests for election simulation logic.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  createInitialElectionState,
  stepElection,
  checkSpoilerEffect,
  checkCondorcetParadox,
  checkGerrymandering,
  checkArrowsImpossibility,
} from './simulation.ts'
import type { ElectionState, ElectionParams } from './types.ts'
import { electionLabConfig } from './config.ts'

describe('Election Lab', () => {
  describe('createInitialElectionState', () => {
    it('creates state with correct number of voters, candidates, and districts', () => {
      const state = createInitialElectionState({
        'num-voters': 120,
        'num-candidates': 4,
        'num-districts': 6,
      })

      expect(state.voters).toHaveLength(120)
      expect(state.candidates).toHaveLength(4)
      expect(state.districts).toHaveLength(6)
      expect(state.step).toBe(0)
    })

    it('initializes with default parameters', () => {
      const state = createInitialElectionState({})

      expect(state.voters.length).toBeGreaterThan(0)
      expect(state.candidates.length).toBeGreaterThan(0)
      expect(state.districts.length).toBeGreaterThan(0)
      expect(state.votingSystem).toBe('plurality')
      expect(state.results).toBeNull()
      expect(state.previousResults).toEqual([])
    })

    it('assigns voters to districts', () => {
      const state = createInitialElectionState({
        'num-voters': 100,
        'num-districts': 5,
      })

      // Each voter should have a district assignment
      for (const voter of state.voters) {
        expect(voter.district).toBeGreaterThanOrEqual(0)
        expect(voter.district).toBeLessThan(5)
      }

      // Each district should have voters
      for (const district of state.districts) {
        expect(district.voters.length).toBeGreaterThan(0)
      }
    })

    it('generates candidate preferences for voters', () => {
      const state = createInitialElectionState({ 'num-candidates': 3 })

      for (const voter of state.voters) {
        // Preferences should include all candidates
        expect(voter.preferences).toHaveLength(3)
        expect(new Set(voter.preferences).size).toBe(3) // No duplicates

        // Approvals should be array of booleans
        expect(voter.approvals).toHaveLength(3)
        for (const approval of voter.approvals) {
          expect(typeof approval).toBe('boolean')
        }
      }
    })

    it('assigns candidate names and colors', () => {
      const state = createInitialElectionState({ 'num-candidates': 3 })

      for (let i = 0; i < 3; i++) {
        const candidate = state.candidates[i]
        expect(candidate).toBeDefined()
        expect(candidate!.id).toBe(i)
        expect(candidate!.name).toBeTruthy()
        expect(candidate!.color).toMatch(/^#[0-9A-F]{6}$/i) // Valid hex color
        expect(candidate!.position.x).toBeGreaterThanOrEqual(0)
        expect(candidate!.position.x).toBeLessThanOrEqual(1)
        expect(candidate!.position.y).toBeGreaterThanOrEqual(0)
        expect(candidate!.position.y).toBeLessThanOrEqual(1)
      }
    })

    it('creates district boundaries', () => {
      const state = createInitialElectionState({ 'num-districts': 4 })

      for (const district of state.districts) {
        expect(district.boundaries.length).toBeGreaterThan(2)
        expect(district.center.x).toBeGreaterThanOrEqual(0)
        expect(district.center.x).toBeLessThanOrEqual(1)
        expect(district.center.y).toBeGreaterThanOrEqual(0)
        expect(district.center.y).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('stepElection', () => {
    let initialState: ElectionState

    beforeEach(() => {
      initialState = createInitialElectionState({
        'num-voters': 100,
        'num-candidates': 3,
        'num-districts': 5,
        'voting-system': 'plurality',
      })
    })

    it('increments step counter', () => {
      const params: Partial<ElectionParams> = {
        'voting-system': 'plurality',
      }
      const nextState = stepElection(initialState, params)

      expect(nextState.step).toBe(1)
    })

    it('produces election results', () => {
      const params: Partial<ElectionParams> = {
        'voting-system': 'plurality',
      }
      const nextState = stepElection(initialState, params)

      expect(nextState.results).not.toBeNull()
      expect(nextState.results!.winners.length).toBeGreaterThan(0)
      expect(nextState.results!.totalVotes).toBe(100)
      expect(nextState.results!.candidateVotes).toHaveLength(3)
    })

    it('tracks initial winner for comparison', () => {
      const params: Partial<ElectionParams> = {
        'voting-system': 'plurality',
      }
      const nextState = stepElection(initialState, params)

      expect(nextState.initialWinner).toBeDefined()
      expect(nextState.initialWinner).toBe(nextState.results!.winners[0])
    })

    it('adds results to history', () => {
      const params: Partial<ElectionParams> = {
        'voting-system': 'plurality',
      }
      const nextState = stepElection(initialState, params)

      expect(nextState.previousResults).toHaveLength(1)
      expect(nextState.previousResults[0]).toBe(nextState.results)
    })

    it('handles voting system changes', () => {
      // First run with plurality
      const pluralityState = stepElection(initialState, { 'voting-system': 'plurality' })

      // Then switch to ranked choice
      const rankedChoiceState = stepElection(pluralityState, { 'voting-system': 'ranked-choice' })

      expect(rankedChoiceState.votingSystem).toBe('ranked-choice')
      expect(rankedChoiceState.previousResults).toHaveLength(2)
    })

    it('recreates state when fundamental parameters change', () => {
      const changedState = stepElection(initialState, {
        'num-voters': 200, // Double the voters
        'voting-system': 'plurality',
      })

      expect(changedState.voters).toHaveLength(200)
      expect(changedState.step).toBe(0) // Reset due to recreation
    })

    it('handles gerrymandering toggle', () => {
      const gerryState = stepElection(initialState, {
        'enable-gerrymandering': true,
        'voting-system': 'plurality',
      })

      expect(gerryState.gerrymanderingEnabled).toBe(true)
      expect(gerryState.originalDistricts).not.toBeNull()
    })
  })

  describe('Plurality Voting', () => {
    it('produces winner with most first-choice votes', () => {
      const state = createInitialElectionState({
        'num-voters': 100,
        'num-candidates': 3,
        'voting-system': 'plurality',
      })

      const result = stepElection(state, { 'voting-system': 'plurality' })
      const { results } = result

      expect(results).not.toBeNull()
      expect(results!.winners).toHaveLength(1)

      // Winner should have the most votes
      const winnerVotes = results!.candidateVotes[results!.winners[0]!]
      const maxVotes = Math.max(...results!.candidateVotes)
      expect(winnerVotes).toBe(maxVotes)
    })

    it('can detect spoiler effects', () => {
      // This is a probabilistic test - with enough candidates and voters,
      // a spoiler effect might occur
      const state = createInitialElectionState({
        'num-voters': 300,
        'num-candidates': 4,
        'voting-system': 'plurality',
        'preference-polarization': 0.8, // High polarization increases spoiler chances
      })

      const result = stepElection(state, { 'voting-system': 'plurality' })

      // The spoiler detection logic should run
      expect(typeof result.results!.spoilerPresent).toBe('boolean')
    })
  })

  describe('Ranked Choice Voting', () => {
    it('eliminates candidates and redistributes votes', () => {
      const state = createInitialElectionState({
        'num-voters': 100,
        'num-candidates': 3,
        'voting-system': 'ranked-choice',
      })

      const result = stepElection(state, { 'voting-system': 'ranked-choice' })
      const { results } = result

      expect(results).not.toBeNull()
      expect(results!.winners).toHaveLength(1)
      expect(results!.majorityWinner).toBe(true) // RCV should produce majority winner
    })
  })

  describe('Approval Voting', () => {
    it('counts approvals for each candidate', () => {
      const state = createInitialElectionState({
        'num-voters': 100,
        'num-candidates': 3,
        'voting-system': 'approval',
      })

      const result = stepElection(state, { 'voting-system': 'approval' })
      const { results } = result

      expect(results).not.toBeNull()
      expect(results!.winners).toHaveLength(1)

      // Total approvals might exceed total voters (multiple approvals per voter)
      const totalApprovals = results!.candidateVotes.reduce((sum, votes) => sum + votes, 0)
      expect(totalApprovals).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Proportional Representation', () => {
    it('allocates seats proportionally', () => {
      const state = createInitialElectionState({
        'num-voters': 100,
        'num-candidates': 3,
        'num-districts': 5,
        'voting-system': 'proportional',
      })

      const result = stepElection(state, { 'voting-system': 'proportional' })
      const { results } = result

      expect(results).not.toBeNull()
      expect(results!.districtResults).toHaveLength(5)

      // Total seats should equal number of districts
      const totalSeats = results!.candidateSeats.reduce((sum, seats) => sum + seats, 0)
      expect(totalSeats).toBe(5)
    })
  })

  describe('Mission Checks', () => {
    describe('checkSpoilerEffect', () => {
      it('returns true when spoiler effect is present', () => {
        const state = createInitialElectionState({})
        state.results = {
          winners: [0],
          totalVotes: 100,
          candidateVotes: [30, 35, 35],
          candidateSeats: [1, 0, 0],
          spoilerPresent: true,
          condorcetWinner: 1,
          majorityWinner: false,
          districtResults: [],
        }

        expect(checkSpoilerEffect(state)).toBe(true)
      })

      it('returns false when no spoiler effect', () => {
        const state = createInitialElectionState({})
        state.results = {
          winners: [0],
          totalVotes: 100,
          candidateVotes: [60, 25, 15],
          candidateSeats: [1, 0, 0],
          spoilerPresent: false,
          condorcetWinner: 0,
          majorityWinner: true,
          districtResults: [],
        }

        expect(checkSpoilerEffect(state)).toBe(false)
      })
    })

    describe('checkCondorcetParadox', () => {
      it('returns true when Condorcet paradox exists', () => {
        const state = createInitialElectionState({})
        state.condorcetParadoxExists = true

        expect(checkCondorcetParadox(state)).toBe(true)
      })

      it('returns false when no Condorcet paradox', () => {
        const state = createInitialElectionState({})
        state.condorcetParadoxExists = false

        expect(checkCondorcetParadox(state)).toBe(false)
      })
    })

    describe('checkGerrymandering', () => {
      it('returns false when gerrymandering is disabled', () => {
        const state = createInitialElectionState({})
        state.gerrymanderingEnabled = false

        expect(checkGerrymandering(state)).toBe(false)
      })

      it('requires original districts to detect change', () => {
        const state = createInitialElectionState({})
        state.gerrymanderingEnabled = true
        state.originalDistricts = null

        expect(checkGerrymandering(state)).toBe(false)
      })
    })

    describe('checkArrowsImpossibility', () => {
      it('returns false with insufficient history', () => {
        const state = createInitialElectionState({})
        state.previousResults = []

        expect(checkArrowsImpossibility(state)).toBe(false)
      })

      it('returns true with different winners in history', () => {
        const state = createInitialElectionState({})
        state.previousResults = [
          {
            winners: [0],
            totalVotes: 100,
            candidateVotes: [40, 35, 25],
            candidateSeats: [1, 0, 0],
            spoilerPresent: false,
            condorcetWinner: 0,
            majorityWinner: false,
            districtResults: [],
          },
          {
            winners: [1],
            totalVotes: 100,
            candidateVotes: [25, 45, 30],
            candidateSeats: [0, 1, 0],
            spoilerPresent: false,
            condorcetWinner: 1,
            majorityWinner: false,
            districtResults: [],
          },
        ]

        expect(checkArrowsImpossibility(state)).toBe(true)
      })

      it('returns false when same winner across different systems', () => {
        const state = createInitialElectionState({})
        state.previousResults = [
          {
            winners: [0],
            totalVotes: 100,
            candidateVotes: [60, 25, 15],
            candidateSeats: [1, 0, 0],
            spoilerPresent: false,
            condorcetWinner: 0,
            majorityWinner: true,
            districtResults: [],
          },
          {
            winners: [0],
            totalVotes: 100,
            candidateVotes: [60, 25, 15],
            candidateSeats: [1, 0, 0],
            spoilerPresent: false,
            condorcetWinner: 0,
            majorityWinner: true,
            districtResults: [],
          },
        ]

        expect(checkArrowsImpossibility(state)).toBe(false)
      })
    })
  })

  describe('configuration', () => {
    it('has valid episode id', () => {
      expect(electionLabConfig.id).toBe('election-lab')
    })

    it('has civics domain', () => {
      expect(electionLabConfig.domain).toBe('civics')
    })

    it('has step-based simulation mode', () => {
      expect(electionLabConfig.simulationMode).toBe('step-based')
    })

    it('has all required parameters', () => {
      const paramIds = electionLabConfig.parameters.map((p) => p.id)
      expect(paramIds).toContain('num-voters')
      expect(paramIds).toContain('num-candidates')
      expect(paramIds).toContain('voting-system')
      expect(paramIds).toContain('num-districts')
      expect(paramIds).toContain('preference-polarization')
      expect(paramIds).toContain('enable-gerrymandering')
    })

    it('has all missions', () => {
      const missionIds = electionLabConfig.missions.map((m) => m.id)
      expect(missionIds).toContain('spoiler-effect')
      expect(missionIds).toContain('condorcet-paradox')
      expect(missionIds).toContain('gerrymandering')
      expect(missionIds).toContain('arrows-impossibility')
    })

    it('has reference content', () => {
      expect(electionLabConfig.referenceContent.length).toBeGreaterThan(0)
    })

    it('has equations for all voting systems', () => {
      const equationIds = electionLabConfig.equations.map((e) => e.id)
      expect(equationIds).toContain('plurality-vote')
      expect(equationIds).toContain('instant-runoff')
      expect(equationIds).toContain('approval-vote')
      expect(equationIds).toContain('proportional-representation')
    })

    it('validates voting system parameter options', () => {
      const votingSystemParam = electionLabConfig.parameters.find((p) => p.id === 'voting-system')
      expect(votingSystemParam).toBeDefined()
      expect(votingSystemParam!.options).toEqual([
        'plurality',
        'ranked-choice',
        'approval',
        'proportional',
      ])
    })

    it('has reasonable parameter ranges', () => {
      const votersParam = electionLabConfig.parameters.find((p) => p.id === 'num-voters')
      expect(votersParam!.min).toBe(50)
      expect(votersParam!.max).toBe(500)

      const candidatesParam = electionLabConfig.parameters.find((p) => p.id === 'num-candidates')
      expect(candidatesParam!.min).toBe(2)
      expect(candidatesParam!.max).toBe(6)

      const districtsParam = electionLabConfig.parameters.find((p) => p.id === 'num-districts')
      expect(districtsParam!.min).toBe(1)
      expect(districtsParam!.max).toBe(10)
    })
  })

  describe('Edge Cases', () => {
    it('handles single candidate election', () => {
      const state = createInitialElectionState({
        'num-candidates': 1,
        'voting-system': 'plurality',
      })

      const result = stepElection(state, { 'voting-system': 'plurality' })

      expect(result.results!.winners).toEqual([0])
      expect(result.results!.condorcetWinner).toBe(0)
      expect(result.condorcetParadoxExists).toBe(false)
    })

    it('handles single district', () => {
      const state = createInitialElectionState({
        'num-districts': 1,
        'voting-system': 'proportional',
      })

      const result = stepElection(state, { 'voting-system': 'proportional' })

      expect(result.districts).toHaveLength(1)
      expect(result.results!.districtResults).toHaveLength(1)
    })

    it('handles zero polarization', () => {
      const state = createInitialElectionState({
        'preference-polarization': 0.0,
      })

      // Should not crash with uniform voter distribution
      const result = stepElection(state, { 'voting-system': 'plurality' })
      expect(result.results).not.toBeNull()
    })

    it('handles maximum polarization', () => {
      const state = createInitialElectionState({
        'preference-polarization': 1.0,
      })

      // Should not crash with highly clustered voters
      const result = stepElection(state, { 'voting-system': 'plurality' })
      expect(result.results).not.toBeNull()
    })
  })
})
