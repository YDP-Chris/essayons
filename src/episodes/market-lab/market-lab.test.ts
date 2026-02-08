/**
 * Market Lab — Tests for market simulation logic.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  createInitialMarketState,
  stepMarket,
  computeEquilibrium,
  checkEquilibrium,
  checkPriceFloorEffect,
  checkSelfOrganization,
  checkDeadweightLoss,
} from './simulation.ts'
import type { MarketState, MarketParams } from './types.ts'
import { marketLabConfig } from './config.ts'

describe('Market Lab', () => {
  describe('createInitialMarketState', () => {
    it('creates state with correct number of buyers and sellers', () => {
      const state = createInitialMarketState({ 'num-buyers': 30, 'num-sellers': 40 })

      expect(state.buyers).toHaveLength(30)
      expect(state.sellers).toHaveLength(40)
      expect(state.day).toBe(0)
      expect(state.price).toBeGreaterThanOrEqual(0)
    })

    it('initializes with default parameters', () => {
      const state = createInitialMarketState({})

      expect(state.buyers.length).toBeGreaterThan(0)
      expect(state.sellers.length).toBeGreaterThan(0)
      expect(state.priceHistory).toEqual([])
      expect(state.quantityHistory).toEqual([])
    })

    it('sorts buyers by willingness-to-pay (high to low)', () => {
      const state = createInitialMarketState({ 'num-buyers': 20 })

      for (let i = 1; i < state.buyers.length; i++) {
        const prev = state.buyers[i - 1]
        const curr = state.buyers[i]
        expect(prev!.willingnessToPay).toBeGreaterThanOrEqual(curr!.willingnessToPay)
      }
    })

    it('sorts sellers by cost (low to high)', () => {
      const state = createInitialMarketState({ 'num-sellers': 20 })

      for (let i = 1; i < state.sellers.length; i++) {
        const prev = state.sellers[i - 1]
        const curr = state.sellers[i]
        expect(prev!.cost).toBeLessThanOrEqual(curr!.cost)
      }
    })

    it('computes equilibrium price and quantity', () => {
      const state = createInitialMarketState({ 'num-buyers': 50, 'num-sellers': 50 })

      expect(state.equilibriumPrice).toBeGreaterThan(0)
      expect(state.equilibriumQuantity).toBeGreaterThan(0)
      expect(state.equilibriumQuantity).toBeLessThanOrEqual(50)
    })
  })

  describe('computeEquilibrium', () => {
    it('finds equilibrium where WTP >= cost', () => {
      const buyers = [
        { willingnessToPay: 150 },
        { willingnessToPay: 120 },
        { willingnessToPay: 100 },
        { willingnessToPay: 80 },
      ]
      const sellers = [{ cost: 60 }, { cost: 90 }, { cost: 110 }, { cost: 130 }]

      const { price, quantity } = computeEquilibrium(buyers, sellers)

      // First 2 pairs: 150>=60 (yes), 120>=90 (yes), 100>=110 (no)
      expect(quantity).toBe(2)
      expect(price).toBeGreaterThan(0)
    })

    it('returns zero quantity if no trades are profitable', () => {
      const buyers = [{ willingnessToPay: 50 }, { willingnessToPay: 40 }]
      const sellers = [{ cost: 100 }, { cost: 120 }]

      const { quantity } = computeEquilibrium(buyers, sellers)

      expect(quantity).toBe(0)
    })

    it('equilibrium price is between marginal buyer WTP and marginal seller cost', () => {
      const buyers = [{ willingnessToPay: 150 }, { willingnessToPay: 120 }]
      const sellers = [{ cost: 80 }, { cost: 100 }]

      const { price } = computeEquilibrium(buyers, sellers)

      expect(price).toBeGreaterThanOrEqual(80)
      expect(price).toBeLessThanOrEqual(150)
    })
  })

  describe('stepMarket', () => {
    let initialState: MarketState

    beforeEach(() => {
      initialState = createInitialMarketState({ 'num-buyers': 30, 'num-sellers': 30 })
    })

    it('increments day counter', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      expect(nextState.day).toBe(1)
    })

    it('updates price and quantity traded', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      expect(nextState.price).toBeGreaterThan(0)
      expect(nextState.quantityTraded).toBeGreaterThan(0)
    })

    it('adds to price and quantity history', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      expect(nextState.priceHistory).toHaveLength(1)
      expect(nextState.quantityHistory).toHaveLength(1)
      expect(nextState.priceHistory[0]).toBe(nextState.price)
      expect(nextState.quantityHistory[0]).toBe(nextState.quantityTraded)
    })

    it('calculates consumer surplus', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      expect(nextState.consumerSurplus).toBeGreaterThanOrEqual(0)
    })

    it('calculates producer surplus', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      expect(nextState.producerSurplus).toBeGreaterThanOrEqual(0)
    })

    it('price floor prevents price from falling below floor', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 120,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      expect(nextState.price).toBeGreaterThanOrEqual(120)
    })

    it('price ceiling prevents price from rising above ceiling', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 80,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      expect(nextState.price).toBeLessThanOrEqual(80)
    })

    it('tax shifts effective supply curve up', () => {
      const paramsNoTax: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const stateNoTax = stepMarket(initialState, paramsNoTax)

      const paramsWithTax: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 10,
        'subsidy-per-unit': 0,
      }
      const stateWithTax = stepMarket(initialState, paramsWithTax)

      // With tax, price should be higher and quantity should be lower
      expect(stateWithTax.price).toBeGreaterThan(stateNoTax.price)
      expect(stateWithTax.quantityTraded).toBeLessThanOrEqual(stateNoTax.quantityTraded)
    })

    it('subsidy shifts effective supply curve down', () => {
      const paramsNoSubsidy: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const stateNoSubsidy = stepMarket(initialState, paramsNoSubsidy)

      const paramsWithSubsidy: Partial<MarketParams> = {
        'price-floor': 0,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 10,
      }
      const stateWithSubsidy = stepMarket(initialState, paramsWithSubsidy)

      // With subsidy, price should be lower and quantity should be higher
      expect(stateWithSubsidy.price).toBeLessThan(stateNoSubsidy.price)
      expect(stateWithSubsidy.quantityTraded).toBeGreaterThanOrEqual(stateNoSubsidy.quantityTraded)
    })

    it('calculates deadweight loss from interventions', () => {
      const paramsWithFloor: Partial<MarketParams> = {
        'price-floor': 120,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const stateWithFloor = stepMarket(initialState, paramsWithFloor)

      // Deadweight loss should be positive if floor is binding
      if (stateWithFloor.price > initialState.equilibriumPrice) {
        expect(stateWithFloor.deadweightLoss).toBeGreaterThan(0)
      }
    })

    it('tracks surplus (excess supply or demand)', () => {
      const params: Partial<MarketParams> = {
        'price-floor': 120,
        'price-ceiling': 200,
        'tax-per-unit': 0,
        'subsidy-per-unit': 0,
      }
      const nextState = stepMarket(initialState, params)

      // Surplus is positive for excess supply, negative for excess demand
      expect(typeof nextState.surplus).toBe('number')
    })
  })

  describe('checkEquilibrium', () => {
    it('returns false if price history is too short', () => {
      const state = createInitialMarketState({})
      state.priceHistory = [100, 101, 102]

      expect(checkEquilibrium(state)).toBe(false)
    })

    it('returns true if price is stable for last 5 days', () => {
      const state = createInitialMarketState({})
      state.priceHistory = [100, 101, 100, 101, 100]

      expect(checkEquilibrium(state)).toBe(true)
    })

    it('returns false if price is volatile', () => {
      const state = createInitialMarketState({})
      state.priceHistory = [100, 80, 120, 90, 110]

      expect(checkEquilibrium(state)).toBe(false)
    })
  })

  describe('checkPriceFloorEffect', () => {
    it('returns true if price floor creates excess supply', () => {
      const state = createInitialMarketState({})
      state.price = 120
      state.equilibriumPrice = 100
      state.surplus = 10 // Excess supply

      expect(checkPriceFloorEffect(state)).toBe(true)
    })

    it('returns false if surplus is too small', () => {
      const state = createInitialMarketState({})
      state.price = 120
      state.equilibriumPrice = 100
      state.surplus = 2

      expect(checkPriceFloorEffect(state)).toBe(false)
    })

    it('returns false if price is below equilibrium', () => {
      const state = createInitialMarketState({})
      state.price = 80
      state.equilibriumPrice = 100
      state.surplus = 10

      expect(checkPriceFloorEffect(state)).toBe(false)
    })
  })

  describe('checkSelfOrganization', () => {
    it('returns false if not enough days have passed', () => {
      const state = createInitialMarketState({})
      state.day = 5
      state.price = 100
      state.equilibriumPrice = 100

      expect(checkSelfOrganization(state)).toBe(false)
    })

    it('returns true if price converges to equilibrium after 10 days', () => {
      const state = createInitialMarketState({})
      state.day = 15
      state.price = 102
      state.equilibriumPrice = 100

      expect(checkSelfOrganization(state)).toBe(true)
    })

    it('returns false if price is far from equilibrium', () => {
      const state = createInitialMarketState({})
      state.day = 15
      state.price = 120
      state.equilibriumPrice = 100

      expect(checkSelfOrganization(state)).toBe(false)
    })
  })

  describe('checkDeadweightLoss', () => {
    it('returns true if deadweight loss exceeds threshold', () => {
      const state = createInitialMarketState({})
      state.deadweightLoss = 75

      expect(checkDeadweightLoss(state)).toBe(true)
    })

    it('returns false if deadweight loss is below threshold', () => {
      const state = createInitialMarketState({})
      state.deadweightLoss = 25

      expect(checkDeadweightLoss(state)).toBe(false)
    })
  })

  describe('configuration', () => {
    it('has valid episode id', () => {
      expect(marketLabConfig.id).toBe('market-lab')
    })

    it('has economics domain', () => {
      expect(marketLabConfig.domain).toBe('economics')
    })

    it('has step-based simulation mode', () => {
      expect(marketLabConfig.simulationMode).toBe('step-based')
    })

    it('has all required parameters', () => {
      const paramIds = marketLabConfig.parameters.map((p) => p.id)
      expect(paramIds).toContain('num-buyers')
      expect(paramIds).toContain('num-sellers')
      expect(paramIds).toContain('price-floor')
      expect(paramIds).toContain('price-ceiling')
      expect(paramIds).toContain('tax-per-unit')
      expect(paramIds).toContain('subsidy-per-unit')
    })

    it('has all missions', () => {
      const missionIds = marketLabConfig.missions.map((m) => m.id)
      expect(missionIds).toContain('find-equilibrium')
      expect(missionIds).toContain('price-floor-disaster')
      expect(missionIds).toContain('invisible-hand')
      expect(missionIds).toContain('market-crash')
    })

    it('has reference content', () => {
      expect(marketLabConfig.referenceContent.length).toBeGreaterThan(0)
    })

    it('has equations', () => {
      expect(marketLabConfig.equations.length).toBeGreaterThan(0)
    })
  })
})
