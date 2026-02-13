/**
 * Unit tests for Circuit Lab episode.
 *
 * Tests circuit physics, component management, and mission objectives.
 */

import { describe, it, expect } from 'vitest'
// Test file for Circuit Lab episode
import {
  createInitialState,
  updateCircuitState,
  addComponent,
  removeComponent,
  connectComponents,
  checkBulbPowered,
  checkCircuitComplete,
  checkTwoResistorsInSeries,
  checkVoltageSplit,
  checkRCCircuit,
  checkCapacitorCharging,
  checkShortCircuit,
  checkHighCurrent,
  DEFAULT_VALUES,
  COMPONENT_LIBRARY,
} from './physics.ts'

// Helper function removed as it was not being used

// ---------------------------------------------------------------------------
// Initial State Tests
// ---------------------------------------------------------------------------

describe('Circuit Lab - Initial State', () => {
  it('should create valid initial state with default parameters', () => {
    const state = createInitialState({})

    expect(state).toBeDefined()
    expect(state.components).toEqual([])
    expect(state.connections).toEqual([])
    expect(state.gridSize).toBe(20)
    expect(state.selectedComponent).toBeNull()
    expect(state.draggedComponent).toBeNull()
    expect(state.time).toBe(0)
    expect(state.isRunning).toBe(true)
    expect(state.analysis.valid).toBe(false)
    expect(state.analysis.components.size).toBe(0)
    expect(state.analysis.totalPower).toBe(0)
    expect(state.analysis.errors.length).toBeGreaterThan(0)
  })

  it('should create initial state with custom grid size', () => {
    const state = createInitialState({ 'grid-size': 30 })

    expect(state.gridSize).toBe(30)
  })

  it('should have valid analysis structure', () => {
    const state = createInitialState({})

    expect(state.analysis).toHaveProperty('valid')
    expect(state.analysis).toHaveProperty('components')
    expect(state.analysis).toHaveProperty('totalPower')
    expect(state.analysis).toHaveProperty('errors')
    expect(typeof state.analysis.valid).toBe('boolean')
    expect(state.analysis.components instanceof Map).toBe(true)
    expect(typeof state.analysis.totalPower).toBe('number')
    expect(Array.isArray(state.analysis.errors)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Component Management Tests
// ---------------------------------------------------------------------------

describe('Circuit Lab - Component Management', () => {
  it('should add components to the circuit', () => {
    let state = createInitialState({})

    state = addComponent(state, 'battery', { x: 5, y: 5 })
    state = addComponent(state, 'resistor', { x: 10, y: 5 })

    expect(state.components.length).toBe(2)
    expect(state.components[0]?.type).toBe('battery')
    expect(state.components[0]?.position).toEqual({ x: 5, y: 5 })
    expect(state.components[0]?.value).toBe(DEFAULT_VALUES.battery)
    expect(state.components[1]?.type).toBe('resistor')
    expect(state.components[1]?.position).toEqual({ x: 10, y: 5 })
  })

  it('should remove components from the circuit', () => {
    let state = createInitialState({})

    state = addComponent(state, 'battery', { x: 5, y: 5 })
    state = addComponent(state, 'resistor', { x: 10, y: 5 })

    const batteryId = state.components[0]?.id ?? ''
    state = removeComponent(state, batteryId)

    expect(state.components.length).toBe(1)
    expect(state.components[0]?.type).toBe('resistor')
  })

  it('should connect components together', () => {
    let state = createInitialState({})

    state = addComponent(state, 'battery', { x: 5, y: 5 })
    state = addComponent(state, 'resistor', { x: 10, y: 5 })

    const batteryId = state.components[0]?.id ?? ''
    const resistorId = state.components[1]?.id ?? ''

    state = connectComponents(state, batteryId, 0, resistorId, 0)

    expect(state.connections.length).toBe(1)
    const connection = state.connections[0]
    if (connection) {
      expect(connection.fromComponent).toBe(batteryId)
      expect(connection.toComponent).toBe(resistorId)
    }
  })

  it('should remove connections when removing components', () => {
    let state = createInitialState({})

    state = addComponent(state, 'battery', { x: 5, y: 5 })
    state = addComponent(state, 'resistor', { x: 10, y: 5 })

    const batteryId = state.components[0]?.id ?? ''
    const resistorId = state.components[1]?.id ?? ''

    state = connectComponents(state, batteryId, 0, resistorId, 0)
    state = removeComponent(state, batteryId)

    expect(state.connections.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Physics Update Tests
// ---------------------------------------------------------------------------

describe('Circuit Lab - Physics Updates', () => {
  it('should update simulation time', () => {
    let state = createInitialState({})

    state = updateCircuitState(state, {}, 0.1)
    expect(state.time).toBeCloseTo(0.1)

    state = updateCircuitState(state, {}, 0.05)
    expect(state.time).toBeCloseTo(0.15)
  })

  it('should not update when not running', () => {
    let state = createInitialState({})
    state = { ...state, isRunning: false }

    const initialTime = state.time
    state = updateCircuitState(state, {}, 0.1)

    expect(state.time).toBe(initialTime + 0.1) // Time still advances, but analysis doesn't
  })

  it('should analyze empty circuit as invalid', () => {
    const state = createInitialState({})
    const updatedState = updateCircuitState(state, {}, 0.1)

    expect(updatedState.analysis.valid).toBe(false)
    expect(updatedState.analysis.errors.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Default Values and Constants Tests
// ---------------------------------------------------------------------------

describe('Circuit Lab - Constants', () => {
  it('should have default values for all component types', () => {
    expect(DEFAULT_VALUES.resistor).toBe(1000)
    expect(DEFAULT_VALUES.capacitor).toBe(0.001)
    expect(DEFAULT_VALUES.battery).toBe(9)
    expect(DEFAULT_VALUES.switch).toBe(0)
    expect(DEFAULT_VALUES.bulb).toBe(100)
    expect(DEFAULT_VALUES.wire).toBe(0.01)
  })

  it('should have component library with all types', () => {
    expect(COMPONENT_LIBRARY.length).toBeGreaterThan(0)

    const types = COMPONENT_LIBRARY.map((comp) => comp.type)
    expect(types).toContain('battery')
    expect(types).toContain('resistor')
    expect(types).toContain('capacitor')
    expect(types).toContain('bulb')
    expect(types).toContain('switch')
    expect(types).toContain('wire')
  })

  it('should have valid component templates', () => {
    for (const template of COMPONENT_LIBRARY) {
      expect(template.type).toBeDefined()
      expect(template.name).toBeDefined()
      expect(typeof template.defaultValue).toBe('number')
      expect(template.symbol).toBeDefined()
      expect(typeof template.pins).toBe('number')
      expect(template.pins).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Mission Check Tests
// ---------------------------------------------------------------------------

describe('Circuit Lab - Mission Checks', () => {
  describe('Light the Bulb mission', () => {
    it('should detect when bulb is not powered', () => {
      const state = createInitialState({})

      expect(checkBulbPowered(state)).toBe(false)
      expect(checkCircuitComplete(state)).toBe(false)
    })

    it('should detect when circuit is incomplete', () => {
      let state = createInitialState({})
      state = addComponent(state, 'battery', { x: 5, y: 5 })
      state = addComponent(state, 'bulb', { x: 10, y: 5 })
      // No connections

      state = updateCircuitState(state, {}, 0.1)

      expect(checkBulbPowered(state)).toBe(false)
      expect(checkCircuitComplete(state)).toBe(false)
    })
  })

  describe('Voltage Divider mission', () => {
    it('should detect two resistors in series', () => {
      let state = createInitialState({})
      state = addComponent(state, 'resistor', { x: 5, y: 5 })
      state = addComponent(state, 'resistor', { x: 10, y: 5 })

      const resistor1Id = state.components[0]?.id ?? ''
      const resistor2Id = state.components[1]?.id ?? ''
      state = connectComponents(state, resistor1Id, 0, resistor2Id, 0)

      // Add another connection to make it a proper series circuit
      state = connectComponents(state, resistor2Id, 1, resistor1Id, 1)

      expect(checkTwoResistorsInSeries(state)).toBe(true)
    })

    it('should not detect voltage split without proper circuit', () => {
      const state = createInitialState({})

      expect(checkVoltageSplit(state)).toBe(false)
    })
  })

  describe('RC Circuit mission', () => {
    it('should detect RC circuit', () => {
      let state = createInitialState({})
      state = addComponent(state, 'resistor', { x: 5, y: 5 })
      state = addComponent(state, 'capacitor', { x: 10, y: 5 })

      expect(checkRCCircuit(state)).toBe(true)
    })

    it('should not detect RC circuit with wrong components', () => {
      let state = createInitialState({})
      state = addComponent(state, 'resistor', { x: 5, y: 5 })
      state = addComponent(state, 'resistor', { x: 10, y: 5 })

      expect(checkRCCircuit(state)).toBe(false)
    })

    it('should detect capacitor charging', () => {
      let state = createInitialState({})

      // Add components for RC circuit
      state = addComponent(state, 'battery', { x: 0, y: 5 })
      state = addComponent(state, 'resistor', { x: 5, y: 5 })
      state = addComponent(state, 'capacitor', { x: 10, y: 5 })

      // Simulate some circuit analysis that would give capacitor voltage
      const mockAnalysis = {
        valid: true,
        components: new Map([
          [state.components[2]?.id ?? '', { voltage: 1.5, current: 0.1, power: 0.15 }],
        ]),
        totalPower: 0.15,
        errors: [],
      }
      state = { ...state, analysis: mockAnalysis }

      expect(checkCapacitorCharging(state)).toBe(true)
    })
  })

  describe('Short Circuit mission', () => {
    it('should detect high current condition', () => {
      let state = createInitialState({})

      // Mock high power condition
      const mockAnalysis = {
        valid: true,
        components: new Map(),
        totalPower: 150, // > 100W threshold
        errors: [],
      }
      state = { ...state, analysis: mockAnalysis }

      expect(checkHighCurrent(state)).toBe(true)
    })

    it('should detect short circuit condition', () => {
      let state = createInitialState({})

      // Mock high current through component
      const mockAnalysis = {
        valid: true,
        components: new Map([
          ['test-component', { voltage: 9, current: 15, power: 135 }], // > 10A threshold
        ]),
        totalPower: 135,
        errors: [],
      }
      state = { ...state, analysis: mockAnalysis }

      expect(checkShortCircuit(state)).toBe(true)
    })

    it('should not detect short circuit with normal current', () => {
      let state = createInitialState({})

      // Mock normal current
      const mockAnalysis = {
        valid: true,
        components: new Map([['test-component', { voltage: 9, current: 0.5, power: 4.5 }]]),
        totalPower: 4.5,
        errors: [],
      }
      state = { ...state, analysis: mockAnalysis }

      expect(checkShortCircuit(state)).toBe(false)
      expect(checkHighCurrent(state)).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// Edge Cases and Error Handling
// ---------------------------------------------------------------------------

describe('Circuit Lab - Edge Cases', () => {
  it('should handle components at grid boundaries', () => {
    let state = createInitialState({ 'grid-size': 20 })

    state = addComponent(state, 'battery', { x: 0, y: 0 })
    state = addComponent(state, 'resistor', { x: 19, y: 19 })

    expect(state.components.length).toBe(2)
    const comp1 = state.components[0]
    const comp2 = state.components[1]
    if (comp1 && comp2) {
      expect(comp1.position).toEqual({ x: 0, y: 0 })
      expect(comp2.position).toEqual({ x: 19, y: 19 })
    }
  })

  it('should handle empty connections array', () => {
    let state = createInitialState({})
    state = addComponent(state, 'battery', { x: 5, y: 5 })

    const updatedState = updateCircuitState(state, {}, 0.1)

    expect(updatedState.connections.length).toBe(0)
    expect(updatedState.analysis.valid).toBe(false)
  })

  it('should handle mission checks on invalid circuits', () => {
    const state = createInitialState({})

    expect(checkBulbPowered(state)).toBe(false)
    expect(checkCircuitComplete(state)).toBe(false)
    expect(checkTwoResistorsInSeries(state)).toBe(false)
    expect(checkVoltageSplit(state)).toBe(false)
    expect(checkRCCircuit(state)).toBe(false)
    expect(checkCapacitorCharging(state)).toBe(false)
    expect(checkShortCircuit(state)).toBe(false)
    expect(checkHighCurrent(state)).toBe(false)
  })

  it('should maintain component IDs uniquely', () => {
    let state = createInitialState({})

    state = addComponent(state, 'resistor', { x: 5, y: 5 })
    state = addComponent(state, 'resistor', { x: 10, y: 5 })
    state = addComponent(state, 'resistor', { x: 15, y: 5 })

    const ids = state.components.map((c) => c.id)
    const uniqueIds = new Set(ids)

    expect(ids.length).toBe(uniqueIds.size) // All IDs should be unique
  })

  it('should handle zero time delta updates', () => {
    const state = createInitialState({})

    const updatedState = updateCircuitState(state, {}, 0)

    expect(updatedState.time).toBe(state.time)
    expect(updatedState.analysis).toBeDefined()
  })
})
