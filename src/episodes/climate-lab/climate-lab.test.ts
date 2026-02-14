/**
 * Climate Lab — Unit tests for climate simulation logic.
 *
 * Tests the core physics calculations, mission objectives, and state management.
 */

import { describe, it, expect } from 'vitest'
import {
  createInitialClimateState,
  stepClimate,
  checkEnergyBalance,
  checkIceAge,
  checkRunawayGreenhouse,
  checkStabilizeWarming,
} from './simulation.ts'
import type { ClimateState } from './types.ts'

describe('Climate Lab Simulation', () => {
  describe('Initial State Creation', () => {
    it('should create initial state with default parameters', () => {
      const state = createInitialClimateState({})

      expect(state.co2Concentration).toBe(400) // Default modern CO2
      expect(state.albedo).toBe(0.3) // Default Earth albedo
      expect(state.solarOutput).toBe(1370) // Default solar constant
      expect(state.volcanicCooling).toBe(0) // No volcanic activity
      expect(state.step).toBe(0) // Initial step
      expect(state.baselineTemperature).toBe(15) // Earth baseline
      expect(state.baselineCO2).toBe(280) // Pre-industrial CO2
      expect(state.iceExtent).toBeCloseTo(0.4, 1) // Moderate ice coverage
      expect(state.temperatureHistory).toEqual([])
      expect(state.energyBalanceHistory).toEqual([])
    })

    it('should create state with custom parameters', () => {
      const params = {
        'co2-concentration': 560, // Doubled CO2
        albedo: 0.5, // High albedo
        'solar-output': 1380, // Bright sun
        'volcanic-cooling': 2, // Some volcanic activity
      }

      const state = createInitialClimateState(params)

      expect(state.co2Concentration).toBe(560)
      expect(state.albedo).toBe(0.5)
      expect(state.solarOutput).toBe(1380)
      expect(state.volcanicCooling).toBe(2)
    })

    it('should have consistent energy calculations in initial state', () => {
      const state = createInitialClimateState({})

      expect(state.energyIn).toBeGreaterThan(0) // Should have solar input
      expect(state.energyOut).toBeGreaterThan(0) // Should have thermal output
      expect(typeof state.energyBalance).toBe('number') // Should calculate balance
      expect(Math.abs(state.energyBalance)).toBeLessThan(20) // Should be reasonable
    })
  })

  describe('Climate Physics Stepping', () => {
    it('should advance climate state by one step', () => {
      const initialState = createInitialClimateState({})
      const params = {
        'co2-concentration': 400,
        albedo: 0.3,
        'solar-output': 1370,
        'volcanic-cooling': 0,
      }

      const newState = stepClimate(initialState, params)

      expect(newState.step).toBe(1) // Step counter incremented
      expect(newState.temperatureHistory).toHaveLength(1) // History updated
      expect(newState.energyBalanceHistory).toHaveLength(1) // History updated
      expect(typeof newState.temperature).toBe('number')
      expect(typeof newState.energyBalance).toBe('number')
    })

    it('should respond to CO2 changes with greenhouse effect', () => {
      const initialState = createInitialClimateState({ 'co2-concentration': 280 })

      // Low CO2 state
      const lowCO2State = stepClimate(initialState, { 'co2-concentration': 280 })

      // High CO2 state
      const highCO2State = stepClimate(initialState, { 'co2-concentration': 560 })

      // Higher CO2 should lead to more warming
      expect(highCO2State.temperature).toBeGreaterThan(lowCO2State.temperature)
    })

    it('should respond to albedo changes', () => {
      const initialState = createInitialClimateState({})

      // Low albedo (dark surface)
      const darkState = stepClimate(initialState, { albedo: 0.1 })

      // High albedo (bright surface)
      const brightState = stepClimate(initialState, { albedo: 0.7 })

      // Lower albedo should absorb more energy and lead to warming
      expect(darkState.energyIn).toBeGreaterThan(brightState.energyIn)
    })

    it('should respond to volcanic cooling', () => {
      const initialState = createInitialClimateState({})

      // No volcanic activity
      const noVolcanicState = stepClimate(initialState, { 'volcanic-cooling': 0 })

      // High volcanic activity
      const volcanicState = stepClimate(initialState, { 'volcanic-cooling': 5 })

      // Volcanic activity should reduce energy balance
      expect(volcanicState.energyBalance).toBeLessThan(noVolcanicState.energyBalance)
    })

    it('should demonstrate ice-albedo feedback', () => {
      // Start with warm conditions
      const warmState = createInitialClimateState({ 'co2-concentration': 800 })

      // Step multiple times to let feedback develop
      let state = warmState
      for (let i = 0; i < 5; i++) {
        state = stepClimate(state, { 'co2-concentration': 800 })
      }

      // In warm conditions, ice extent should decrease from initial
      expect(state.iceExtent).toBeLessThanOrEqual(warmState.iceExtent)
    })

    it('should maintain history with proper length limits', () => {
      let state = createInitialClimateState({})

      // Step more than 100 times to test history truncation
      for (let i = 0; i < 120; i++) {
        state = stepClimate(state, { 'co2-concentration': 400 })
      }

      expect(state.step).toBe(120)
      expect(state.temperatureHistory.length).toBeLessThanOrEqual(100) // Should be truncated
      expect(state.energyBalanceHistory.length).toBeLessThanOrEqual(100) // Should be truncated
    })
  })

  describe('Mission Objectives', () => {
    describe('Energy Balance Mission', () => {
      it('should detect energy balance achievement', () => {
        const state: ClimateState = {
          energyBalance: 0.3, // Within ±0.5 W/m² tolerance
          temperature: 2,
          energyIn: 240,
          energyOut: 240,
          co2Concentration: 400,
          albedo: 0.3,
          solarOutput: 1370,
          volcanicCooling: 0,
          iceExtent: 0.4,
          atmosphereThickness: 0.5,
          temperatureHistory: [],
          energyBalanceHistory: [],
          step: 5,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkEnergyBalance(state)).toBe(true)
      })

      it('should not detect balance when outside tolerance', () => {
        const state: ClimateState = {
          energyBalance: 1.2, // Outside ±0.5 W/m² tolerance
          temperature: 2,
          energyIn: 240,
          energyOut: 240,
          co2Concentration: 400,
          albedo: 0.3,
          solarOutput: 1370,
          volcanicCooling: 0,
          iceExtent: 0.4,
          atmosphereThickness: 0.5,
          temperatureHistory: [],
          energyBalanceHistory: [],
          step: 5,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkEnergyBalance(state)).toBe(false)
      })
    })

    describe('Ice Age Mission', () => {
      it('should detect ice age conditions', () => {
        const state: ClimateState = {
          temperature: -12, // 12°C below baseline
          iceExtent: 0.65, // 65% ice coverage
          energyBalance: -2,
          energyIn: 200,
          energyOut: 250,
          co2Concentration: 280,
          albedo: 0.7,
          solarOutput: 1360,
          volcanicCooling: 3,
          atmosphereThickness: 0.1,
          temperatureHistory: [-10, -11, -12],
          energyBalanceHistory: [-1, -1.5, -2],
          step: 10,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkIceAge(state)).toBe(true)
      })

      it('should not detect ice age without sufficient cooling', () => {
        const state: ClimateState = {
          temperature: -5, // Only 5°C below baseline
          iceExtent: 0.65,
          energyBalance: 0,
          energyIn: 240,
          energyOut: 240,
          co2Concentration: 350,
          albedo: 0.4,
          solarOutput: 1370,
          volcanicCooling: 1,
          atmosphereThickness: 0.3,
          temperatureHistory: [-3, -4, -5],
          energyBalanceHistory: [0, 0, 0],
          step: 8,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkIceAge(state)).toBe(false)
      })
    })

    describe('Runaway Greenhouse Mission', () => {
      it('should detect runaway greenhouse conditions', () => {
        const state: ClimateState = {
          temperature: 55, // 55°C above baseline
          energyBalance: 15,
          energyIn: 300,
          energyOut: 280,
          co2Concentration: 800,
          albedo: 0.1,
          solarOutput: 1380,
          volcanicCooling: 0,
          iceExtent: 0.05, // Almost no ice
          atmosphereThickness: 1.0,
          temperatureHistory: [45, 50, 55],
          energyBalanceHistory: [10, 12, 15],
          step: 15,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkRunawayGreenhouse(state)).toBe(true)
      })

      it('should not detect runaway without extreme heating', () => {
        const state: ClimateState = {
          temperature: 25, // Only 25°C above baseline
          energyBalance: 5,
          energyIn: 250,
          energyOut: 245,
          co2Concentration: 600,
          albedo: 0.2,
          solarOutput: 1375,
          volcanicCooling: 0,
          iceExtent: 0.2,
          atmosphereThickness: 0.8,
          temperatureHistory: [20, 22, 25],
          energyBalanceHistory: [3, 4, 5],
          step: 12,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkRunawayGreenhouse(state)).toBe(false)
      })
    })

    describe('1.5°C Stabilization Mission', () => {
      it('should detect stable 1.5°C warming', () => {
        const state: ClimateState = {
          temperature: 1.6, // Close to 1.5°C target
          energyBalance: 0.1,
          energyIn: 242,
          energyOut: 241.9,
          co2Concentration: 430,
          albedo: 0.29,
          solarOutput: 1371,
          volcanicCooling: 0,
          iceExtent: 0.35,
          atmosphereThickness: 0.6,
          temperatureHistory: [1.4, 1.5, 1.6, 1.5, 1.6], // Stable around 1.5°C
          energyBalanceHistory: [0.0, 0.1, 0.1, 0.0, 0.1],
          step: 20,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkStabilizeWarming(state)).toBe(true)
      })

      it('should not detect stability without sufficient history', () => {
        const state: ClimateState = {
          temperature: 1.5,
          energyBalance: 0,
          energyIn: 241,
          energyOut: 241,
          co2Concentration: 425,
          albedo: 0.3,
          solarOutput: 1370,
          volcanicCooling: 0,
          iceExtent: 0.36,
          atmosphereThickness: 0.55,
          temperatureHistory: [1.5, 1.5], // Not enough history
          energyBalanceHistory: [0, 0],
          step: 3,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkStabilizeWarming(state)).toBe(false)
      })

      it('should not detect stability when outside target range', () => {
        const state: ClimateState = {
          temperature: 2.5, // Outside 1.5°C ± 0.2°C range
          energyBalance: 1,
          energyIn: 245,
          energyOut: 244,
          co2Concentration: 500,
          albedo: 0.28,
          solarOutput: 1375,
          volcanicCooling: 0,
          iceExtent: 0.3,
          atmosphereThickness: 0.75,
          temperatureHistory: [2.3, 2.4, 2.5, 2.6, 2.5], // Stable but wrong target
          energyBalanceHistory: [0.8, 0.9, 1.0, 1.1, 1.0],
          step: 25,
          baselineTemperature: 15,
          baselineCO2: 280,
        }

        expect(checkStabilizeWarming(state)).toBe(false)
      })
    })
  })

  describe('Physics Validation', () => {
    it('should have realistic energy magnitudes', () => {
      const state = createInitialClimateState({})

      // Energy flows should be in realistic ranges for Earth
      expect(state.energyIn).toBeGreaterThan(200) // W/m²
      expect(state.energyIn).toBeLessThan(400) // W/m²
      expect(state.energyOut).toBeGreaterThan(200) // W/m²
      expect(state.energyOut).toBeLessThan(400) // W/m²
    })

    it('should respond to CO2 concentration changes', () => {
      const lowCO2State = createInitialClimateState({ 'co2-concentration': 280 })
      const moderateCO2State = createInitialClimateState({ 'co2-concentration': 400 })
      const highCO2State = createInitialClimateState({ 'co2-concentration': 600 })

      // Higher CO2 should lead to higher temperatures (greenhouse effect)
      expect(moderateCO2State.temperature).toBeGreaterThan(lowCO2State.temperature)
      expect(highCO2State.temperature).toBeGreaterThan(moderateCO2State.temperature)

      // Temperature differences should be significant but reasonable
      const tempIncrease = highCO2State.temperature - lowCO2State.temperature
      expect(tempIncrease).toBeGreaterThan(2) // At least 2°C warming
      expect(tempIncrease).toBeLessThan(20) // But not excessive
    })

    it('should maintain physical constraints', () => {
      let state = createInitialClimateState({})

      // Run simulation for many steps
      for (let i = 0; i < 50; i++) {
        state = stepClimate(state, {
          'co2-concentration': 400 + Math.sin(i) * 100, // Oscillating CO2
          albedo: 0.3,
          'solar-output': 1370,
          'volcanic-cooling': 0,
        })

        // Physical constraints
        expect(state.iceExtent).toBeGreaterThanOrEqual(0) // Ice can't be negative
        expect(state.iceExtent).toBeLessThanOrEqual(1) // Ice can't exceed 100%
        expect(state.atmosphereThickness).toBeGreaterThanOrEqual(0)
        expect(state.atmosphereThickness).toBeLessThanOrEqual(1)
        expect(state.energyIn).toBeGreaterThan(0) // Must have some solar input
      }
    })
  })
})
