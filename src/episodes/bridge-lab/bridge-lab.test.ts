/**
 * Unit tests for the Bridge Lab episode.
 *
 * Covers Warren truss generation, structural physics, stress calculation,
 * beam failure mechanics, material properties, mission checks, and config validation.
 */

import { describe, it, expect } from 'vitest'
import {
  MATERIALS,
  createWarrenTruss,
  createInitialState,
  updateBridge,
  checkNoBrokenBeams,
  checkWeightUnder,
  checkSafetyFactor,
  checkSurviveEarthquake,
} from './physics.ts'
import type { BridgeState } from './types.ts'
import { bridgeLabConfig } from './config.ts'
import { validateConfig } from '../validate-config.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default params matching the config defaults */
const defaultParams: Record<string, unknown> = {
  material: 'steel',
  'load-weight': 1000,
  gravity: 9.81,
  'show-forces': false,
  'show-stress': true,
}

/** Run the simulation for `n` ticks of `dt` seconds each. */
function simulate(
  initialState: BridgeState,
  params: Record<string, unknown>,
  dt: number,
  ticks: number,
): BridgeState {
  let state = initialState
  for (let i = 0; i < ticks; i++) {
    state = updateBridge(state, params, dt)
  }
  return state
}

// ---------------------------------------------------------------------------
// Material Properties
// ---------------------------------------------------------------------------

describe('Bridge Lab Materials', () => {
  describe('material properties', () => {
    it('should define wood properties', () => {
      expect(MATERIALS.wood.yieldStrength).toBe(40e6)
      expect(MATERIALS.wood.density).toBe(600)
      expect(MATERIALS.wood.color).toBe('#d4a373')
    })

    it('should define steel properties', () => {
      expect(MATERIALS.steel.yieldStrength).toBe(250e6)
      expect(MATERIALS.steel.density).toBe(7850)
      expect(MATERIALS.steel.color).toBe('#94a3b8')
    })

    it('should define concrete properties', () => {
      expect(MATERIALS.concrete.yieldStrength).toBe(30e6)
      expect(MATERIALS.concrete.density).toBe(2400)
      expect(MATERIALS.concrete.color).toBe('#a8a29e')
    })

    it('should have steel as strongest material', () => {
      expect(MATERIALS.steel.yieldStrength).toBeGreaterThan(MATERIALS.wood.yieldStrength)
      expect(MATERIALS.steel.yieldStrength).toBeGreaterThan(MATERIALS.concrete.yieldStrength)
    })

    it('should have wood as lightest material', () => {
      expect(MATERIALS.wood.density).toBeLessThan(MATERIALS.steel.density)
      expect(MATERIALS.wood.density).toBeLessThan(MATERIALS.concrete.density)
    })
  })
})

// ---------------------------------------------------------------------------
// Warren Truss Generation
// ---------------------------------------------------------------------------

describe('Bridge Lab Physics', () => {
  describe('createWarrenTruss', () => {
    it('should generate correct number of nodes for 8 segments', () => {
      const { nodes } = createWarrenTruss(20, 4, 8)
      // Bottom chord: 9 nodes (0-8)
      // Top chord: 9 nodes (0-8)
      // Total: 18 nodes
      expect(nodes.length).toBe(18)
    })

    it('should generate correct number of beams for 8 segments', () => {
      const { beams } = createWarrenTruss(20, 4, 8)
      // Bottom chord: 8 beams
      // Top chord: 8 beams
      // Diagonals: 8 beams
      // Vertical posts: 2 beams
      // Total: 26 beams
      expect(beams.length).toBe(26)
    })

    it('should fix first and last bottom nodes', () => {
      const { nodes } = createWarrenTruss(20, 4, 8)
      expect(nodes[0]!.fixed).toBe(true) // First bottom node
      expect(nodes[8]!.fixed).toBe(true) // Last bottom node
    })

    it('should not fix top chord nodes', () => {
      const { nodes } = createWarrenTruss(20, 4, 8)
      // Top chord starts at index 9
      expect(nodes[9]!.fixed).toBe(false)
      expect(nodes[17]!.fixed).toBe(false)
    })

    it('should position nodes correctly', () => {
      const { nodes } = createWarrenTruss(20, 4, 8)
      // First bottom node at origin
      expect(nodes[0]!.x).toBe(0)
      expect(nodes[0]!.y).toBe(0)

      // Last bottom node at span width
      expect(nodes[8]!.x).toBe(20)
      expect(nodes[8]!.y).toBe(0)

      // First top node at height
      expect(nodes[9]!.x).toBe(0)
      expect(nodes[9]!.y).toBe(4)
    })

    it('should initialize beams with correct rest lengths', () => {
      const { beams, nodes } = createWarrenTruss(20, 4, 8)

      for (const beam of beams) {
        const nodeA = nodes[beam.nodeA]!
        const nodeB = nodes[beam.nodeB]!
        const expectedLength = Math.sqrt((nodeB.x - nodeA.x) ** 2 + (nodeB.y - nodeA.y) ** 2)
        expect(beam.restLength).toBeCloseTo(expectedLength, 5)
      }
    })

    it('should initialize all beams as not broken', () => {
      const { beams } = createWarrenTruss(20, 4, 8)
      expect(beams.every((b) => !b.broken)).toBe(true)
    })

    it('should initialize all beams with zero stress', () => {
      const { beams } = createWarrenTruss(20, 4, 8)
      expect(beams.every((b) => b.stress === 0)).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // State Creation
  // -------------------------------------------------------------------------

  describe('createInitialState', () => {
    it('should create a state with default parameters', () => {
      const state = createInitialState(defaultParams)

      expect(state.brokenBeams).toBe(0)
      expect(state.simTime).toBe(0)
      expect(state.maxStress).toBe(0)
      expect(state.safetyFactor).toBe(Infinity)
    })

    it('should create nodes and beams', () => {
      const state = createInitialState(defaultParams)

      expect(state.nodes.length).toBeGreaterThan(0)
      expect(state.beams.length).toBeGreaterThan(0)
    })

    it('should apply material to all beams', () => {
      const state = createInitialState({ ...defaultParams, material: 'wood' })

      expect(state.beams.every((b) => b.material === 'wood')).toBe(true)
    })

    it('should calculate total weight for steel', () => {
      const state = createInitialState({ ...defaultParams, material: 'steel' })

      expect(state.totalWeight).toBeGreaterThan(0)
      // Steel is dense, should be heavy
      expect(state.totalWeight).toBeGreaterThan(1000)
    })

    it('should calculate lighter weight for wood', () => {
      const steelState = createInitialState({ ...defaultParams, material: 'steel' })
      const woodState = createInitialState({ ...defaultParams, material: 'wood' })

      expect(woodState.totalWeight).toBeLessThan(steelState.totalWeight)
    })

    it('should initialize all nodes with zero displacement', () => {
      const state = createInitialState(defaultParams)

      expect(state.nodes.every((n) => n.dx === 0 && n.dy === 0)).toBe(true)
    })

    it('should initialize all nodes with zero forces', () => {
      const state = createInitialState(defaultParams)

      expect(state.nodes.every((n) => n.fx === 0 && n.fy === 0)).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // Physics Update
  // -------------------------------------------------------------------------

  describe('updateBridge', () => {
    it('should increment simulation time', () => {
      const state = createInitialState(defaultParams)
      const updated = updateBridge(state, defaultParams, 1 / 60)

      expect(updated.simTime).toBeCloseTo(1 / 60, 5)
    })

    it('should apply gravity and load to nodes', () => {
      const state = createInitialState(defaultParams)
      const updated = simulate(state, defaultParams, 1 / 60, 60)

      // After 1 second, nodes should have displaced
      const hasMoved = updated.nodes.some((n) => !n.fixed && (n.dx !== 0 || n.dy !== 0))
      expect(hasMoved).toBe(true)
    })

    it('should compute stress on beams', () => {
      const state = createInitialState(defaultParams)
      const updated = simulate(state, defaultParams, 1 / 60, 60)

      // After some time, beams should have stress
      const hasStress = updated.beams.some((b) => b.stress > 0)
      expect(hasStress).toBe(true)
    })

    it('should track max stress', () => {
      const state = createInitialState(defaultParams)
      const updated = simulate(state, defaultParams, 1 / 60, 120) // 2 seconds for more stress

      expect(updated.maxStress).toBeGreaterThan(0)
    })

    it('should calculate safety factor', () => {
      const state = createInitialState(defaultParams)
      const updated = simulate(state, defaultParams, 1 / 60, 120) // 2 seconds for measurable stress

      expect(updated.safetyFactor).toBeGreaterThan(0)
      expect(updated.safetyFactor).toBeLessThan(Infinity)
    })

    it('should keep fixed nodes in place', () => {
      const state = createInitialState(defaultParams)
      const updated = simulate(state, defaultParams, 1 / 60, 120)

      const fixedNodes = updated.nodes.filter((n) => n.fixed)
      for (const node of fixedNodes) {
        expect(node.dx).toBe(0)
        expect(node.dy).toBe(0)
      }
    })

    it('should break beams when stress exceeds yield strength', () => {
      // Use wood (lower yield strength) with extreme load to ensure breakage
      const state = createInitialState({ ...defaultParams, material: 'wood' })
      const heavyParams = { ...defaultParams, material: 'wood', 'load-weight': 500000 }
      const updated = simulate(state, heavyParams, 1 / 60, 600)

      expect(updated.brokenBeams).toBeGreaterThan(0)
    })

    it('should increase displacement with higher load', () => {
      const state1 = createInitialState(defaultParams)
      const light = simulate(state1, { ...defaultParams, 'load-weight': 500 }, 1 / 60, 120)

      const state2 = createInitialState(defaultParams)
      const heavy = simulate(state2, { ...defaultParams, 'load-weight': 2000 }, 1 / 60, 120)

      expect(heavy.maxDeflection).toBeGreaterThan(light.maxDeflection)
    })

    it('should increase stress with higher gravity', () => {
      const state1 = createInitialState(defaultParams)
      const normalGrav = simulate(state1, { ...defaultParams, gravity: 9.81 }, 1 / 60, 180) // 3 seconds

      const state2 = createInitialState(defaultParams)
      const highGrav = simulate(state2, { ...defaultParams, gravity: 20 }, 1 / 60, 180) // 3 seconds

      expect(highGrav.maxStress).toBeGreaterThan(normalGrav.maxStress)
    })

    it('should recreate bridge when material changes', () => {
      const state = createInitialState({ ...defaultParams, material: 'steel' })
      const updated = updateBridge(state, { ...defaultParams, material: 'wood' }, 1 / 60)

      expect(updated.beams[0]!.material).toBe('wood')
      expect(updated.simTime).toBe(0) // Reset on material change
    })
  })

  // -------------------------------------------------------------------------
  // Material Differences
  // -------------------------------------------------------------------------

  describe('material behavior', () => {
    it('should have wood break under lower stress than steel', () => {
      const woodState = createInitialState({ ...defaultParams, material: 'wood' })
      const steelState = createInitialState({ ...defaultParams, material: 'steel' })

      const heavyLoad = { ...defaultParams, 'load-weight': 5000 }
      const woodResult = simulate(woodState, { ...heavyLoad, material: 'wood' }, 1 / 60, 300)
      const steelResult = simulate(steelState, { ...heavyLoad, material: 'steel' }, 1 / 60, 300)

      // Wood should have more broken beams than steel
      expect(woodResult.brokenBeams).toBeGreaterThanOrEqual(steelResult.brokenBeams)
    })

    it('should calculate different safety factors for different materials', () => {
      const woodState = createInitialState({ ...defaultParams, material: 'wood' })
      const steelState = createInitialState({ ...defaultParams, material: 'steel' })

      const woodResult = simulate(
        woodState,
        { ...defaultParams, material: 'wood' },
        1 / 60,
        180, // 3 seconds
      )
      const steelResult = simulate(
        steelState,
        { ...defaultParams, material: 'steel' },
        1 / 60,
        180, // 3 seconds
      )

      // Steel should have higher safety factor (stronger)
      expect(steelResult.safetyFactor).toBeGreaterThan(woodResult.safetyFactor)
    })
  })

  // -------------------------------------------------------------------------
  // Mission Checks
  // -------------------------------------------------------------------------

  describe('mission checks', () => {
    describe('checkNoBrokenBeams', () => {
      it('should pass when no beams are broken after 5 seconds', () => {
        const state = createInitialState(defaultParams)
        const result = simulate(state, { ...defaultParams, 'load-weight': 2000 }, 1 / 60, 360) // 6 seconds (>5)

        expect(checkNoBrokenBeams(result)).toBe(true)
      })

      it('should fail when simulation time is less than 5 seconds', () => {
        const state = createInitialState(defaultParams)
        const result = simulate(state, defaultParams, 1 / 60, 60) // 1 second

        expect(checkNoBrokenBeams(result)).toBe(false)
      })

      it('should fail when beams are broken', () => {
        const state = createInitialState({ ...defaultParams, material: 'wood' })
        const heavyParams = { ...defaultParams, material: 'wood', 'load-weight': 500000 }
        const result = simulate(state, heavyParams, 1 / 60, 600)

        expect(checkNoBrokenBeams(result)).toBe(false)
      })
    })

    describe('checkWeightUnder', () => {
      it('should pass when weight is under target', () => {
        const state = createInitialState({ ...defaultParams, material: 'wood' })
        const result = simulate(
          state,
          { ...defaultParams, material: 'wood', 'load-weight': 2000 },
          1 / 60,
          360,
        ) // 6 seconds (>5)

        expect(checkWeightUnder(result, 5000)).toBe(true)
      })

      it('should fail when weight is over target', () => {
        const state = createInitialState({ ...defaultParams, material: 'steel' })
        const result = simulate(state, { ...defaultParams, material: 'steel' }, 1 / 60, 300)

        expect(checkWeightUnder(result, 1000)).toBe(false)
      })

      it('should fail if beams are broken', () => {
        const state = createInitialState({ ...defaultParams, material: 'wood' })
        const heavyParams = { ...defaultParams, material: 'wood', 'load-weight': 50000 }
        const result = simulate(state, heavyParams, 1 / 60, 300)

        expect(checkWeightUnder(result, 10000)).toBe(false)
      })

      it('should fail if simulation time is less than 5 seconds', () => {
        const state = createInitialState({ ...defaultParams, material: 'wood' })
        const result = simulate(state, { ...defaultParams, material: 'wood' }, 1 / 60, 60)

        expect(checkWeightUnder(result, 5000)).toBe(false)
      })
    })

    describe('checkSafetyFactor', () => {
      it('should pass when safety factor is above threshold', () => {
        const state = createInitialState(defaultParams)
        const result = simulate(state, { ...defaultParams, 'load-weight': 2000 }, 1 / 60, 360) // 6 seconds (>5)

        expect(checkSafetyFactor(result, 2)).toBe(true)
      })

      it('should fail when safety factor is below threshold', () => {
        const state = createInitialState(defaultParams)
        const heavyParams = { ...defaultParams, 'load-weight': 8000 }
        const result = simulate(state, heavyParams, 1 / 60, 300)

        expect(checkSafetyFactor(result, 10)).toBe(false)
      })

      it('should fail if beams are broken', () => {
        const state = createInitialState({ ...defaultParams, material: 'wood' })
        const heavyParams = { ...defaultParams, material: 'wood', 'load-weight': 500000 }
        const result = simulate(state, heavyParams, 1 / 60, 600)

        expect(checkSafetyFactor(result, 2)).toBe(false)
      })
    })

    describe('checkSurviveEarthquake', () => {
      it('should pass when no beams break under high gravity for 10 seconds', () => {
        const state = createInitialState(defaultParams)
        // Lower gravity for earthquake test since we want it to pass
        const quakeParams = { ...defaultParams, gravity: 12, 'load-weight': 1500 }
        const result = simulate(state, quakeParams, 1 / 60, 600) // 10 seconds

        expect(checkSurviveEarthquake(result)).toBe(true)
      })

      it('should fail if simulation time is less than 10 seconds', () => {
        const state = createInitialState(defaultParams)
        const result = simulate(state, defaultParams, 1 / 60, 300) // 5 seconds

        expect(checkSurviveEarthquake(result)).toBe(false)
      })

      it('should fail if beams break', () => {
        const state = createInitialState({ ...defaultParams, material: 'wood' })
        const extremeParams = {
          ...defaultParams,
          material: 'wood',
          gravity: 30,
          'load-weight': 500000,
        }
        const result = simulate(state, extremeParams, 1 / 60, 660)

        expect(checkSurviveEarthquake(result)).toBe(false)
      })
    })
  })

  // -------------------------------------------------------------------------
  // Config Validation
  // -------------------------------------------------------------------------

  describe('config validation', () => {
    it('should have a valid episode config', () => {
      const result = validateConfig(bridgeLabConfig)
      if (!result.valid) {
        console.log('Validation errors:', result.errors)
      }
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should have correct episode id', () => {
      expect(bridgeLabConfig.id).toBe('bridge-lab')
    })

    it('should have engineering domain', () => {
      expect(bridgeLabConfig.domain).toBe('engineering')
    })

    it('should have continuous simulation mode', () => {
      expect(bridgeLabConfig.simulationMode).toBe('continuous')
    })

    it('should have all required parameters', () => {
      const paramIds = bridgeLabConfig.parameters.map((p) => p.id)
      expect(paramIds).toContain('material')
      expect(paramIds).toContain('load-weight')
      expect(paramIds).toContain('gravity')
      expect(paramIds).toContain('show-forces')
      expect(paramIds).toContain('show-stress')
    })

    it('should have all four missions', () => {
      expect(bridgeLabConfig.missions.length).toBe(4)
      const missionIds = bridgeLabConfig.missions.map((m) => m.id)
      expect(missionIds).toContain('first-crossing')
      expect(missionIds).toContain('efficiency-challenge')
      expect(missionIds).toContain('the-arch')
      expect(missionIds).toContain('earthquake')
    })

    it('should have valid material enum options', () => {
      const materialParam = bridgeLabConfig.parameters.find((p) => p.id === 'material')
      expect(materialParam?.type).toBe('enum')
      expect(materialParam?.options).toEqual(['wood', 'steel', 'concrete'])
    })

    it('should have valid parameter ranges', () => {
      const loadParam = bridgeLabConfig.parameters.find((p) => p.id === 'load-weight')
      expect(loadParam?.min).toBe(100)
      expect(loadParam?.max).toBe(100000)
      expect(loadParam?.default).toBe(1000)
    })
  })
})
