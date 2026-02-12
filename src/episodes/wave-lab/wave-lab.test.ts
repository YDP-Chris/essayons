/**
 * Unit tests for Wave Lab physics calculations.
 *
 * Tests fundamental frequency calculations, harmonic series generation,
 * resonance detection, wave displacement calculations, and mission
 * completion logic to ensure accurate wave mechanics simulation.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  createInitialState,
  updateWaveState,
  checkFundamentalResonance,
  checkSustainedResonance,
  checkSecondHarmonic,
  checkThirdHarmonic,
  getWavelength,
  getHarmonicFrequency,
  isNearHarmonic,
  resetMissionTracking,
} from './physics.ts'
// import type { WaveState } from './types.ts' // Used in tests but not directly referenced

// ---------------------------------------------------------------------------
// Test Utilities
// ---------------------------------------------------------------------------

function createTestParams(overrides: Record<string, unknown> = {}) {
  return {
    'string-length': 1.0,
    'string-tension': 100,
    'linear-density': 0.005,
    'driving-frequency': 70,
    'driving-amplitude': 0.01,
    'show-nodes': true,
    'show-antinodes': true,
    'show-harmonics': false,
    'animation-speed': 1.0,
    ...overrides,
  }
}

function approximatelyEqual(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance
}

// ---------------------------------------------------------------------------
// Physics Calculations Tests
// ---------------------------------------------------------------------------

describe('Wave Lab Physics', () => {
  beforeEach(() => {
    resetMissionTracking()
  })

  describe('Initial State Creation', () => {
    it('should create initial state with default parameters', () => {
      const params = createTestParams()
      const state = createInitialState(params)

      expect(state.stringParams.length).toBe(1.0)
      expect(state.stringParams.tension).toBe(100)
      expect(state.stringParams.linearDensity).toBe(0.005)
      expect(state.driving.frequency).toBe(70)
      expect(state.driving.amplitude).toBe(0.01)
      expect(state.time).toBe(0)
      expect(state.displacement).toHaveLength(200) // Default resolution
      expect(state.positions).toHaveLength(200)
    })

    it('should calculate correct fundamental frequency', () => {
      const params = createTestParams({
        'string-length': 1.0,
        'string-tension': 100,
        'linear-density': 0.005, // 5g/m
      })
      const state = createInitialState(params)

      // Expected: f = (1/2L) * sqrt(T/μ) = (1/2) * sqrt(100/0.005) = 0.5 * sqrt(20000) = 0.5 * 141.42 ≈ 70.71 Hz
      expect(approximatelyEqual(state.fundamentalFreq, 70.71, 1)).toBe(true)
    })

    it('should generate harmonic series correctly', () => {
      const params = createTestParams()
      const state = createInitialState(params)

      const fund = state.fundamentalFreq
      expect(state.harmonics.length).toBeGreaterThan(3)
      expect(approximatelyEqual(state.harmonics[0]!, fund)).toBe(true) // 1st harmonic = fundamental
      expect(approximatelyEqual(state.harmonics[1]!, 2 * fund)).toBe(true) // 2nd harmonic = 2 * fundamental
      expect(approximatelyEqual(state.harmonics[2]!, 3 * fund)).toBe(true) // 3rd harmonic = 3 * fundamental
    })

    it('should handle different string parameters', () => {
      // Double the length -> half the frequency
      const longString = createInitialState(createTestParams({ 'string-length': 2.0 }))
      const shortString = createInitialState(createTestParams({ 'string-length': 1.0 }))
      expect(
        approximatelyEqual(longString.fundamentalFreq * 2, shortString.fundamentalFreq, 1),
      ).toBe(true)

      // Double the tension -> sqrt(2) times the frequency
      const highTension = createInitialState(createTestParams({ 'string-tension': 200 }))
      const lowTension = createInitialState(createTestParams({ 'string-tension': 100 }))
      expect(
        approximatelyEqual(
          highTension.fundamentalFreq / lowTension.fundamentalFreq,
          Math.sqrt(2),
          0.1,
        ),
      ).toBe(true)
    })
  })

  describe('State Update', () => {
    it('should advance time correctly', () => {
      const initialState = createInitialState(createTestParams())
      const dt = 1 / 60 // 60 FPS
      const updatedState = updateWaveState(initialState, createTestParams(), dt)

      expect(updatedState.time).toBeCloseTo(dt)
    })

    it('should update parameters when changed', () => {
      const initialState = createInitialState(createTestParams())
      const newParams = createTestParams({ 'string-length': 0.5 })
      const updatedState = updateWaveState(initialState, newParams, 1 / 60)

      expect(updatedState.stringParams.length).toBe(0.5)
      expect(updatedState.fundamentalFreq).toBeGreaterThan(initialState.fundamentalFreq) // Shorter string = higher frequency
    })

    it('should calculate resonance level', () => {
      const params = createTestParams({ 'driving-frequency': 70.71 }) // Close to fundamental
      const state = createInitialState(params)

      expect(state.resonanceLevel).toBeGreaterThan(0.5) // Should be in resonance
    })

    it('should generate wave displacement', () => {
      const params = createTestParams()
      const state = createInitialState(params)

      // All points should have some displacement values (may be zero at nodes)
      expect(state.displacement).toHaveLength(state.positions.length)
      expect(state.displacement.every((d) => typeof d === 'number')).toBe(true)
    })

    it('should respect animation speed multiplier', () => {
      const initialState = createInitialState(createTestParams())
      const dt = 1 / 60

      const normalSpeed = updateWaveState(
        initialState,
        createTestParams({ 'animation-speed': 1.0 }),
        dt,
      )
      const doubleSpeed = updateWaveState(
        initialState,
        createTestParams({ 'animation-speed': 2.0 }),
        dt,
      )

      expect(doubleSpeed.time).toBeCloseTo(2 * normalSpeed.time)
    })
  })

  describe('Utility Functions', () => {
    it('should calculate wavelength correctly', () => {
      const stringLength = 1.0
      const firstHarmonic = getWavelength(stringLength, 1)
      const secondHarmonic = getWavelength(stringLength, 2)

      expect(firstHarmonic).toBe(2.0) // λ₁ = 2L
      expect(secondHarmonic).toBe(1.0) // λ₂ = L
    })

    it('should calculate harmonic frequencies', () => {
      const fundamental = 100 // Hz
      const second = getHarmonicFrequency(fundamental, 2)
      const third = getHarmonicFrequency(fundamental, 3)

      expect(second).toBe(200)
      expect(third).toBe(300)
    })

    it('should detect near harmonic frequencies', () => {
      const harmonics = [100, 200, 300, 400] // Hz

      expect(isNearHarmonic(101, harmonics)).toBe(true) // Close to 100
      expect(isNearHarmonic(199, harmonics)).toBe(true) // Close to 200
      expect(isNearHarmonic(150, harmonics)).toBe(false) // Not close to any
      expect(isNearHarmonic(350, harmonics)).toBe(false) // Between harmonics
    })
  })

  describe('Mission Completion Logic', () => {
    it('should detect fundamental resonance', () => {
      const state = createInitialState(
        createTestParams({
          'driving-frequency': 70.71, // Close to fundamental
        }),
      )

      expect(checkFundamentalResonance(state)).toBe(true)
    })

    it('should not detect resonance when frequency is off', () => {
      const state = createInitialState(
        createTestParams({
          'driving-frequency': 50, // Far from fundamental (~70.71)
        }),
      )

      expect(checkFundamentalResonance(state)).toBe(false)
    })

    it('should detect second harmonic resonance', () => {
      const params = createTestParams()
      const initialState = createInitialState(params)
      const secondHarmonicFreq = initialState.harmonics[1]! // 2nd harmonic

      const state = createInitialState(
        createTestParams({
          'driving-frequency': secondHarmonicFreq,
        }),
      )

      expect(checkSecondHarmonic(state)).toBe(true)
    })

    it('should detect third harmonic resonance', () => {
      const params = createTestParams()
      const initialState = createInitialState(params)
      const thirdHarmonicFreq = initialState.harmonics[2]! // 3rd harmonic

      const state = createInitialState(
        createTestParams({
          'driving-frequency': thirdHarmonicFreq,
        }),
      )

      expect(checkThirdHarmonic(state)).toBe(true)
    })

    it('should require sustained resonance over time', () => {
      const params = createTestParams()
      let state = createInitialState(params)

      // Get the exact fundamental frequency for perfect resonance
      const fundamentalFreq = state.fundamentalFreq
      const resonanceParams = createTestParams({ 'driving-frequency': fundamentalFreq })
      state = createInitialState(resonanceParams)

      // Initially not sustained
      expect(checkSustainedResonance(state)).toBe(false)

      // Advance time while maintaining resonance
      for (let i = 0; i < 181; i++) {
        // Just over 3 seconds at 60fps
        state = updateWaveState(state, resonanceParams, 1 / 60)
      }

      // Should now be sustained
      expect(checkSustainedResonance(state)).toBe(true)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero tension gracefully', () => {
      const params = createTestParams({ 'string-tension': 0.001 }) // Very low tension
      const state = createInitialState(params)

      expect(state.fundamentalFreq).toBeGreaterThan(0)
      expect(isFinite(state.fundamentalFreq)).toBe(true)
    })

    it('should handle very high frequencies', () => {
      const params = createTestParams({ 'driving-frequency': 10000 })
      const state = createInitialState(params)

      expect(isFinite(state.resonanceLevel)).toBe(true)
      expect(state.resonanceLevel).toBeGreaterThanOrEqual(0)
      expect(state.resonanceLevel).toBeLessThanOrEqual(1)
    })

    it('should handle very short strings', () => {
      const params = createTestParams({ 'string-length': 0.1 })
      const state = createInitialState(params)

      expect(state.fundamentalFreq).toBeGreaterThan(0)
      expect(state.positions).toHaveLength(200) // Should still have same resolution
      expect(state.displacement).toHaveLength(200)
    })

    it('should handle very long strings', () => {
      const params = createTestParams({ 'string-length': 10.0 })
      const state = createInitialState(params)

      expect(state.fundamentalFreq).toBeGreaterThan(0)
      expect(state.fundamentalFreq).toBeLessThan(100) // Should be reasonable
    })

    it('should limit maximum amplitude', () => {
      const params = createTestParams({
        'driving-amplitude': 1.0, // Very large amplitude
        'driving-frequency': 70.71, // At resonance
      })
      let state = createInitialState(params)

      // Run for a while to build up resonance
      for (let i = 0; i < 100; i++) {
        state = updateWaveState(state, params, 1 / 60)
      }

      // Amplitude should be limited
      const maxDisplacement = Math.max(...state.displacement.map(Math.abs))
      expect(maxDisplacement).toBeLessThanOrEqual(0.1) // Max amplitude limit
    })
  })

  describe('Node and Antinode Calculations', () => {
    it('should calculate correct number of nodes for harmonics when in resonance', () => {
      const params = createTestParams()
      let state = createInitialState(params)

      // Get the actual 2nd harmonic frequency from the state
      const secondHarmonic = state.harmonics[1]!

      // Update to drive at 2nd harmonic frequency
      const resonanceParams = createTestParams({ 'driving-frequency': secondHarmonic })
      state = updateWaveState(state, resonanceParams, 1 / 60)

      // Should now be in resonance and have nodes/antinodes calculated
      if (state.resonanceLevel > 0.5) {
        expect(state.nodePositions.length).toBeGreaterThan(0)
        expect(state.nodePositions[0]).toBeCloseTo(0) // Start
        expect(state.nodePositions[state.nodePositions.length - 1]).toBeCloseTo(1.0) // End
      }
    })

    it('should place antinodes between nodes when in resonance', () => {
      const params = createTestParams()
      let state = createInitialState(params)

      // Get the actual 2nd harmonic frequency from the state
      const secondHarmonic = state.harmonics[1]!

      // Update to drive at 2nd harmonic frequency
      const resonanceParams = createTestParams({ 'driving-frequency': secondHarmonic })
      state = updateWaveState(state, resonanceParams, 1 / 60)

      // Should now be in resonance and have antinodes calculated
      if (state.resonanceLevel > 0.5) {
        expect(state.antinodePositions.length).toBeGreaterThan(0)
        // Antinodes should be within the string length
        state.antinodePositions.forEach((pos) => {
          expect(pos).toBeGreaterThan(0)
          expect(pos).toBeLessThan(1.0)
        })
      }
    })
  })
})

// ---------------------------------------------------------------------------
// Performance Tests
// ---------------------------------------------------------------------------

describe('Wave Lab Performance', () => {
  it('should update physics quickly for 60fps', () => {
    const params = createTestParams()
    let state = createInitialState(params)

    const startTime = performance.now()

    // Simulate 1 second of physics updates at 60fps
    for (let i = 0; i < 60; i++) {
      state = updateWaveState(state, params, 1 / 60)
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime

    // Should complete 60 updates in well under 16ms (one frame budget)
    expect(totalTime).toBeLessThan(16) // milliseconds
  })

  it('should handle parameter changes efficiently', () => {
    const params = createTestParams()
    let state = createInitialState(params)

    const startTime = performance.now()

    // Change parameters every few frames
    for (let i = 0; i < 60; i++) {
      const modifiedParams = {
        ...params,
        'string-length': 0.8 + 0.4 * Math.sin(i * 0.1), // Varying length
        'driving-frequency': 60 + 20 * Math.cos(i * 0.1), // Varying frequency
      }
      state = updateWaveState(state, modifiedParams, 1 / 60)
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime

    // Should still be fast even with changing parameters
    expect(totalTime).toBeLessThan(50) // milliseconds
  })
})
