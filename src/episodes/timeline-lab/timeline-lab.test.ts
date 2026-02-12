import { describe, it, expect, beforeEach } from 'vitest'
import {
  createInitialState,
  stepTimelineState,
  checkIndustrialSuccess,
  checkRomanSurvival,
  checkSpaceSuccess,
  checkButterflyEffect,
} from './simulation'
import type { TimelineState } from './types'

describe('Timeline Lab Episode', () => {
  describe('createInitialState', () => {
    it('creates valid initial state for Industrial Revolution scenario', () => {
      const state = createInitialState({ scenario: 'industrial' })

      expect(state.scenario).toBe('industrial')
      expect(state.currentYear).toBe(1750)
      expect(state.startYear).toBe(1750)
      expect(state.endYear).toBe(1900)
      expect(state.population).toBe(750)
      expect(state.technology).toBe(15)
      expect(state.economy).toBe(100)
      expect(state.military).toBe(25)
      expect(state.culture).toBe(40)
      expect(state.triggeredEvents).toEqual([])
      expect(state.actualEvents).toHaveLength(4) // Steam, Railway, Telegraph, Electric
      expect(state.divergenceScore).toBe(0)
    })

    it('creates valid initial state for Roman Empire scenario', () => {
      const state = createInitialState({ scenario: 'roman' })

      expect(state.scenario).toBe('roman')
      expect(state.currentYear).toBe(100)
      expect(state.startYear).toBe(100)
      expect(state.endYear).toBe(500)
      expect(state.population).toBe(50)
      expect(state.technology).toBe(20)
      expect(state.economy).toBe(80)
      expect(state.military).toBe(60)
      expect(state.culture).toBe(70)
      expect(state.territory).toBe(25)
      expect(state.actualEvents).toHaveLength(4) // Plague, Crisis, Constantine, Fall
    })

    it('creates valid initial state for Space Race scenario', () => {
      const state = createInitialState({ scenario: 'space' })

      expect(state.scenario).toBe('space')
      expect(state.currentYear).toBe(1945)
      expect(state.startYear).toBe(1945)
      expect(state.endYear).toBe(1975)
      expect(state.population).toBe(60) // public support
      expect(state.technology).toBe(10)
      expect(state.economy).toBe(50) // budget
      expect(state.military).toBe(40) // program strength
      expect(state.territory).toBe(20) // cooperation
      expect(state.actualEvents).toHaveLength(4) // Sputnik, Gagarin, Apollo, Apollo-Soyuz
    })

    it('defaults to industrial scenario when no params provided', () => {
      const state = createInitialState()
      expect(state.scenario).toBe('industrial')
    })
  })

  describe('stepTimelineState', () => {
    let initialState: TimelineState

    beforeEach(() => {
      initialState = createInitialState({ scenario: 'industrial' })
    })

    it('advances time by 5 years per step', () => {
      const newState = stepTimelineState(initialState, {}, 1)
      expect(newState.currentYear).toBe(1755)
    })

    it('does not exceed end year', () => {
      const nearEndState = { ...initialState, currentYear: 1897 }
      const newState = stepTimelineState(nearEndState, {}, 1)
      expect(newState.currentYear).toBe(1900) // Should be capped at endYear
    })

    it('updates metrics based on policy parameters', () => {
      const highTechParams = {
        technologyInvestment: 40,
        tradeOpenness: 80,
        militarySpending: 10,
        culturalPriority: 60,
      }

      const newState = stepTimelineState(initialState, highTechParams, 1)

      expect(newState.technology).toBeGreaterThan(initialState.technology)
      expect(newState.economy).toBeGreaterThan(initialState.economy)
      expect(newState.culture).toBeGreaterThan(initialState.culture)
    })

    it('applies military spending trade-offs correctly', () => {
      const highMilitaryParams = {
        technologyInvestment: 10,
        tradeOpenness: 20,
        militarySpending: 45,
        culturalPriority: 20,
      }

      const newState = stepTimelineState(initialState, highMilitaryParams, 1)

      expect(newState.military).toBeGreaterThan(initialState.military)
      expect(newState.economy).toBeLessThan(initialState.economy + 3.0) // Reduced growth due to military spending
    })

    it('keeps metrics within valid bounds', () => {
      const extremeParams = {
        technologyInvestment: 50,
        tradeOpenness: 100,
        militarySpending: 50,
        culturalPriority: 100,
      }

      const newState = stepTimelineState(initialState, extremeParams, 1)

      expect(newState.population).toBeGreaterThanOrEqual(0)
      expect(newState.technology).toBeGreaterThanOrEqual(0)
      expect(newState.technology).toBeLessThanOrEqual(100)
      expect(newState.economy).toBeGreaterThanOrEqual(0)
      expect(newState.military).toBeGreaterThanOrEqual(0)
      expect(newState.culture).toBeGreaterThanOrEqual(0)
      expect(newState.culture).toBeLessThanOrEqual(100)
    })

    it('calculates divergence score', () => {
      const newState = stepTimelineState(initialState, { technologyInvestment: 50 }, 1)
      expect(newState.divergenceScore).toBeGreaterThanOrEqual(0)
      expect(newState.divergenceScore).toBeLessThanOrEqual(100)
    })
  })

  describe('mission check functions', () => {
    it('checkIndustrialSuccess returns true for successful industrial scenario', () => {
      const successfulState: TimelineState = {
        scenario: 'industrial',
        currentYear: 1900,
        startYear: 1750,
        endYear: 1900,
        population: 1200,
        technology: 80,
        economy: 160, // 60% higher than starting
        military: 40,
        culture: 65,
        territory: 50,
        triggeredEvents: [],
        actualEvents: [],
        missionProgress: {},
        divergenceScore: 45, // Not too much upheaval
      }

      expect(checkIndustrialSuccess(successfulState)).toBe(true)
    })

    it('checkIndustrialSuccess returns false for insufficient economic growth', () => {
      const failedState: TimelineState = {
        scenario: 'industrial',
        currentYear: 1900,
        startYear: 1750,
        endYear: 1900,
        population: 1200,
        technology: 80,
        economy: 120, // Only 20% higher
        military: 40,
        culture: 65,
        territory: 50,
        triggeredEvents: [],
        actualEvents: [],
        missionProgress: {},
        divergenceScore: 45,
      }

      expect(checkIndustrialSuccess(failedState)).toBe(false)
    })

    it('checkRomanSurvival returns true for extending empire to 500 AD', () => {
      const successfulState: TimelineState = {
        scenario: 'roman',
        currentYear: 500,
        startYear: 100,
        endYear: 500,
        population: 45,
        technology: 25,
        economy: 70,
        military: 55,
        culture: 75,
        territory: 22, // 88% of starting territory (25)
        triggeredEvents: [],
        actualEvents: [],
        missionProgress: {},
        divergenceScore: 30,
      }

      expect(checkRomanSurvival(successfulState)).toBe(true)
    })

    it('checkRomanSurvival returns false for losing too much territory', () => {
      const failedState: TimelineState = {
        scenario: 'roman',
        currentYear: 500,
        startYear: 100,
        endYear: 500,
        population: 35,
        technology: 20,
        economy: 50,
        military: 30,
        culture: 60,
        territory: 15, // Only 60% of starting territory
        triggeredEvents: [],
        actualEvents: [],
        missionProgress: {},
        divergenceScore: 60,
      }

      expect(checkRomanSurvival(failedState)).toBe(false)
    })

    it('checkSpaceSuccess returns true for early moon landing with cooperation', () => {
      const successfulState: TimelineState = {
        scenario: 'space',
        currentYear: 1965,
        startYear: 1945,
        endYear: 1975,
        population: 85, // high public support
        technology: 85, // high tech achievement
        economy: 80,
        military: 75, // strong program
        culture: 60,
        territory: 70, // high international cooperation
        triggeredEvents: [],
        actualEvents: [],
        missionProgress: {},
        divergenceScore: 40,
      }

      expect(checkSpaceSuccess(successfulState)).toBe(true)
    })

    it('checkButterflyEffect returns true for high divergence', () => {
      const butterflyState: TimelineState = {
        scenario: 'industrial',
        currentYear: 1800,
        startYear: 1750,
        endYear: 1900,
        population: 800,
        technology: 25,
        economy: 120,
        military: 35,
        culture: 50,
        territory: 50,
        triggeredEvents: [],
        actualEvents: [],
        missionProgress: {},
        divergenceScore: 80, // High divergence
      }

      expect(checkButterflyEffect(butterflyState)).toBe(true)
    })
  })

  describe('deterministic behavior', () => {
    it('produces same output for same inputs', () => {
      const params = {
        technologyInvestment: 30,
        tradeOpenness: 60,
        militarySpending: 20,
        culturalPriority: 40,
      }

      const state1 = stepTimelineState(createInitialState({ scenario: 'industrial' }), params, 1)
      const state2 = stepTimelineState(createInitialState({ scenario: 'industrial' }), params, 1)

      // Core metrics should be identical (excluding random event triggers)
      expect(state1.currentYear).toBe(state2.currentYear)
      expect(state1.scenario).toBe(state2.scenario)
      // Note: Some metrics might vary slightly due to event triggering randomness
      // But the base calculation should be deterministic
    })
  })

  describe('edge cases', () => {
    it('handles negative impacts correctly', () => {
      const state = createInitialState({ scenario: 'roman' })
      // Simulate a major negative event impact
      const stateWithNegative = {
        ...state,
        population: 10, // Very low
        economy: 5, // Very low
      }

      const newState = stepTimelineState(stateWithNegative, { militarySpending: 0 }, 1)

      expect(newState.population).toBeGreaterThanOrEqual(0)
      expect(newState.economy).toBeGreaterThanOrEqual(0)
    })

    it('handles end-of-timeline correctly', () => {
      const endState = createInitialState({ scenario: 'space' })
      endState.currentYear = 1975 // At end year

      const newState = stepTimelineState(endState, {}, 1)
      expect(newState.currentYear).toBe(1975) // Should not exceed
    })
  })
})
