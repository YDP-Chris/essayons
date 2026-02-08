/**
 * Unit tests for the Orbit Lab episode.
 *
 * Covers physics calculations, Velocity Verlet integration, collision
 * and escape detection, orbit completion tracking, mission checks,
 * and config validation.
 */

import { describe, it, expect } from 'vitest'
import {
  G,
  EARTH_RADIUS,
  createInitialState,
  updateOrbitalState,
  checkOrbitComplete,
  checkNoCrash,
  checkCrash,
  checkEscape,
  checkGeostationary,
} from './physics.ts'
import type { OrbitalState } from './physics.ts'
import { orbitLabConfig } from './config.ts'
import { validateConfig } from '../validate-config.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default params matching the config defaults */
const defaultParams: Record<string, unknown> = {
  'planet-mass': 5.972e24,
  'launch-speed': 7500,
  'launch-angle': 0,
  'orbit-altitude': 400000,
  'show-trail': true,
  'show-vectors': false,
}

/** Run the simulation for `n` ticks of `dt` seconds each. */
function simulate(
  initialState: OrbitalState,
  params: Record<string, unknown>,
  dt: number,
  ticks: number,
): OrbitalState {
  let state = initialState
  for (let i = 0; i < ticks; i++) {
    state = updateOrbitalState(state, params, dt)
    if (state.crashed || state.escaped) break
  }
  return state
}

// ---------------------------------------------------------------------------
// Physics: Constants
// ---------------------------------------------------------------------------

describe('Orbit Lab Physics', () => {
  describe('constants', () => {
    it('should have the correct gravitational constant', () => {
      expect(G).toBeCloseTo(6.674e-11, 14)
    })

    it('should have the correct Earth radius', () => {
      expect(EARTH_RADIUS).toBeCloseTo(6.371e6, 0)
    })
  })

  // -------------------------------------------------------------------------
  // State Creation
  // -------------------------------------------------------------------------

  describe('createInitialState', () => {
    it('should create a state with default parameters', () => {
      const state = createInitialState(defaultParams)

      expect(state.crashed).toBe(false)
      expect(state.escaped).toBe(false)
      expect(state.orbitsCompleted).toBe(0)
      expect(state.totalAngle).toBe(0)
      expect(state.simTime).toBe(0)
    })

    it('should place the satellite at the correct orbital radius', () => {
      const state = createInitialState(defaultParams)
      const expectedRadius = EARTH_RADIUS + 400000

      const actualRadius = Math.sqrt(state.satellite.x ** 2 + state.satellite.y ** 2)
      expect(actualRadius).toBeCloseTo(expectedRadius, 0)
    })

    it('should set launch velocity with correct magnitude', () => {
      const state = createInitialState(defaultParams)
      const speed = Math.sqrt(state.satellite.vx ** 2 + state.satellite.vy ** 2)
      expect(speed).toBeCloseTo(7500, 0)
    })

    it('should place the satellite on the positive x-axis', () => {
      const state = createInitialState(defaultParams)
      expect(state.satellite.x).toBeGreaterThan(0)
      expect(state.satellite.y).toBeCloseTo(0, 0)
    })

    it('should initialize trail with the starting position', () => {
      const state = createInitialState(defaultParams)
      expect(state.trail.length).toBe(1)
      expect(state.trail[0]?.x).toBeCloseTo(state.satellite.x, 0)
    })

    it('should use custom parameters when provided', () => {
      const params = { ...defaultParams, 'orbit-altitude': 1000000 }
      const state = createInitialState(params)
      const expectedRadius = EARTH_RADIUS + 1000000

      const actualRadius = Math.sqrt(state.satellite.x ** 2 + state.satellite.y ** 2)
      expect(actualRadius).toBeCloseTo(expectedRadius, 0)
    })

    it('should apply launch angle to velocity direction', () => {
      const params90 = { ...defaultParams, 'launch-angle': 90 }
      const state90 = createInitialState(params90)

      // At 90 degrees, velocity should have significant negative x component
      expect(Math.abs(state90.satellite.vx)).toBeGreaterThan(5000)
    })

    it('should set planet mass from parameters', () => {
      const params = { ...defaultParams, 'planet-mass': 1e25 }
      const state = createInitialState(params)
      expect(state.planet.mass).toBe(1e25)
    })
  })

  // -------------------------------------------------------------------------
  // Velocity Verlet Integration
  // -------------------------------------------------------------------------

  describe('updateOrbitalState (Velocity Verlet)', () => {
    it('should advance simulation time', () => {
      const state = createInitialState(defaultParams)
      const next = updateOrbitalState(state, defaultParams, 1)
      expect(next.simTime).toBeCloseTo(1, 5)
    })

    it('should move the satellite under gravity', () => {
      const state = createInitialState(defaultParams)
      const next = updateOrbitalState(state, defaultParams, 1)

      // Position should change
      expect(next.satellite.x).not.toBeCloseTo(state.satellite.x, 0)
    })

    it('should conserve energy over many steps (Verlet stability)', () => {
      // Use circular orbit velocity for a near-circular orbit
      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vCircular = Math.sqrt((G * M) / r)

      const params = {
        ...defaultParams,
        'launch-speed': vCircular,
        'show-trail': false,
      }
      const state = createInitialState(params)

      // Compute initial specific energy
      const initialSpeed = Math.sqrt(state.satellite.vx ** 2 + state.satellite.vy ** 2)
      const initialDist = Math.sqrt(state.satellite.x ** 2 + state.satellite.y ** 2)
      const initialEnergy = 0.5 * initialSpeed * initialSpeed - (G * M) / initialDist

      // Run for 5000 ticks at 1/60 dt (~83 seconds of sim time)
      const dt = 1 / 60
      const finalState = simulate(state, params, dt, 5000)

      const finalSpeed = Math.sqrt(finalState.satellite.vx ** 2 + finalState.satellite.vy ** 2)
      const finalDist = Math.sqrt(finalState.satellite.x ** 2 + finalState.satellite.y ** 2)
      const finalEnergy = 0.5 * finalSpeed * finalSpeed - (G * M) / finalDist

      // Energy should be conserved within 0.1% for Velocity Verlet
      const energyDrift = Math.abs((finalEnergy - initialEnergy) / initialEnergy)
      expect(energyDrift).toBeLessThan(0.001)
    })

    it('should not update position when crashed', () => {
      const state = createInitialState(defaultParams)
      const crashedState: OrbitalState = {
        ...state,
        crashed: true,
      }

      const next = updateOrbitalState(crashedState, defaultParams, 1)
      expect(next.satellite.x).toBe(crashedState.satellite.x)
      expect(next.satellite.y).toBe(crashedState.satellite.y)
    })

    it('should not update position when escaped', () => {
      const state = createInitialState(defaultParams)
      const escapedState: OrbitalState = {
        ...state,
        escaped: true,
      }

      const next = updateOrbitalState(escapedState, defaultParams, 1)
      expect(next.satellite.x).toBe(escapedState.satellite.x)
      expect(next.satellite.y).toBe(escapedState.satellite.y)
    })

    it('should accumulate angle as the satellite orbits', () => {
      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vCircular = Math.sqrt((G * M) / r)

      const params = {
        ...defaultParams,
        'launch-speed': vCircular,
        'show-trail': false,
      }
      const state = createInitialState(params)

      // Run for some ticks
      const finalState = simulate(state, params, 1 / 60, 1000)

      // Angle should have accumulated (satellite moving counter-clockwise)
      expect(Math.abs(finalState.totalAngle)).toBeGreaterThan(0)
    })

    it('should update planet mass when parameter changes', () => {
      const state = createInitialState(defaultParams)
      const newParams = { ...defaultParams, 'planet-mass': 1e25 }
      const next = updateOrbitalState(state, newParams, 1 / 60)
      expect(next.planet.mass).toBe(1e25)
    })
  })

  // -------------------------------------------------------------------------
  // Collision Detection
  // -------------------------------------------------------------------------

  describe('collision detection', () => {
    it('should detect crash when satellite hits planet surface', () => {
      // Launch with very low speed — will fall into planet
      const params = {
        ...defaultParams,
        'launch-speed': 1000,
        'show-trail': false,
      }
      const state = createInitialState(params)

      // Run until crash or max ticks
      const finalState = simulate(state, params, 10, 5000)

      expect(finalState.crashed).toBe(true)
    })

    it('should not crash with correct orbital velocity', () => {
      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vCircular = Math.sqrt((G * M) / r)

      const params = {
        ...defaultParams,
        'launch-speed': vCircular,
        'show-trail': false,
      }
      const state = createInitialState(params)

      // Run for many ticks
      const finalState = simulate(state, params, 1 / 60, 5000)

      expect(finalState.crashed).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Escape Detection
  // -------------------------------------------------------------------------

  describe('escape detection', () => {
    it('should detect escape when satellite exceeds escape velocity', () => {
      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vEscape = Math.sqrt((2 * G * M) / r)

      // Launch at 1.1x escape velocity for a clear escape
      const params = {
        ...defaultParams,
        'launch-speed': vEscape * 1.1,
        'show-trail': false,
      }
      const state = createInitialState(params)

      // Run until escape or max ticks
      const finalState = simulate(state, params, 10, 5000)

      expect(finalState.escaped).toBe(true)
    })

    it('should not escape with orbital velocity', () => {
      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vCircular = Math.sqrt((G * M) / r)

      const params = {
        ...defaultParams,
        'launch-speed': vCircular,
        'show-trail': false,
      }
      const state = createInitialState(params)

      // Run for many ticks
      const finalState = simulate(state, params, 1 / 60, 5000)

      expect(finalState.escaped).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Orbit Completion
  // -------------------------------------------------------------------------

  describe('orbit completion', () => {
    it('should complete one orbit with correct velocity after enough time', () => {
      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vCircular = Math.sqrt((G * M) / r)

      // Orbital period: T = 2*pi*r / v
      const period = (2 * Math.PI * r) / vCircular

      const params = {
        ...defaultParams,
        'launch-speed': vCircular,
        'show-trail': false,
      }
      const state = createInitialState(params)

      // Simulate for slightly more than one orbital period
      const dt = 1 / 60
      const ticks = Math.ceil((period * 1.1) / dt)
      const finalState = simulate(state, params, dt, ticks)

      expect(finalState.orbitsCompleted).toBeGreaterThanOrEqual(1)
      expect(Math.abs(finalState.totalAngle)).toBeGreaterThanOrEqual(2 * Math.PI)
    })
  })

  // -------------------------------------------------------------------------
  // Trail
  // -------------------------------------------------------------------------

  describe('trail recording', () => {
    it('should accumulate trail points during simulation', () => {
      const state = createInitialState(defaultParams)
      const params = { ...defaultParams, 'show-trail': true }

      const finalState = simulate(state, params, 1 / 60, 100)

      expect(finalState.trail.length).toBeGreaterThan(1)
    })

    it('should cap trail at 500 points', () => {
      const state = createInitialState(defaultParams)
      const params = { ...defaultParams, 'show-trail': true }

      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vCircular = Math.sqrt((G * M) / r)

      const circularParams = {
        ...params,
        'launch-speed': vCircular,
      }

      const finalState = simulate(state, circularParams, 1 / 60, 1000)

      expect(finalState.trail.length).toBeLessThanOrEqual(500)
    })

    it('should not record trail when show-trail is false', () => {
      const state = createInitialState(defaultParams)
      const params = { ...defaultParams, 'show-trail': false }

      const altitude = 400000
      const r = EARTH_RADIUS + altitude
      const M = 5.972e24
      const vCircular = Math.sqrt((G * M) / r)

      const circularParams = {
        ...params,
        'launch-speed': vCircular,
      }

      const finalState = simulate(state, circularParams, 1 / 60, 100)

      // Trail should not grow beyond the initial point
      expect(finalState.trail.length).toBe(1)
    })
  })
})

// ---------------------------------------------------------------------------
// Mission Checks
// ---------------------------------------------------------------------------

describe('Orbit Lab Mission Checks', () => {
  describe('checkOrbitComplete', () => {
    it('should return false when total angle < 2*PI', () => {
      const state = createInitialState(defaultParams)
      expect(checkOrbitComplete(state)).toBe(false)
    })

    it('should return true when total angle >= 2*PI', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        totalAngle: 2 * Math.PI + 0.1,
      }
      expect(checkOrbitComplete(state)).toBe(true)
    })

    it('should return true for negative angle (clockwise orbit)', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        totalAngle: -(2 * Math.PI + 0.1),
      }
      expect(checkOrbitComplete(state)).toBe(true)
    })
  })

  describe('checkNoCrash', () => {
    it('should return true when satellite has not crashed', () => {
      const state = createInitialState(defaultParams)
      expect(checkNoCrash(state)).toBe(true)
    })

    it('should return false when satellite has crashed', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        crashed: true,
      }
      expect(checkNoCrash(state)).toBe(false)
    })
  })

  describe('checkCrash', () => {
    it('should return false when satellite has not crashed', () => {
      const state = createInitialState(defaultParams)
      expect(checkCrash(state)).toBe(false)
    })

    it('should return true when satellite has crashed', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        crashed: true,
      }
      expect(checkCrash(state)).toBe(true)
    })
  })

  describe('checkEscape', () => {
    it('should return false when satellite has not escaped', () => {
      const state = createInitialState(defaultParams)
      expect(checkEscape(state)).toBe(false)
    })

    it('should return true when satellite has escaped', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        escaped: true,
      }
      expect(checkEscape(state)).toBe(true)
    })
  })

  describe('checkGeostationary', () => {
    it('should return false when orbital period is not close to 86400s', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        orbitalPeriod: 5400, // 90 minute orbit (ISS-like)
      }
      expect(checkGeostationary(state)).toBe(false)
    })

    it('should return true when orbital period is approximately 86400s', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        orbitalPeriod: 86400,
      }
      expect(checkGeostationary(state)).toBe(true)
    })

    it('should return true within 5% tolerance', () => {
      // 5% under
      const stateLow: OrbitalState = {
        ...createInitialState(defaultParams),
        orbitalPeriod: 86400 * 0.96,
      }
      expect(checkGeostationary(stateLow)).toBe(true)

      // 5% over
      const stateHigh: OrbitalState = {
        ...createInitialState(defaultParams),
        orbitalPeriod: 86400 * 1.04,
      }
      expect(checkGeostationary(stateHigh)).toBe(true)
    })

    it('should return false when crashed', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        crashed: true,
        orbitalPeriod: 86400,
      }
      expect(checkGeostationary(state)).toBe(false)
    })

    it('should return false when escaped', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        escaped: true,
        orbitalPeriod: 86400,
      }
      expect(checkGeostationary(state)).toBe(false)
    })

    it('should return false when orbital period is zero', () => {
      const state: OrbitalState = {
        ...createInitialState(defaultParams),
        orbitalPeriod: 0,
      }
      expect(checkGeostationary(state)).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// Config Validation
// ---------------------------------------------------------------------------

describe('Orbit Lab Config', () => {
  it('should pass config validation', () => {
    const result = validateConfig(orbitLabConfig)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should have the correct id', () => {
    expect(orbitLabConfig.id).toBe('orbit-lab')
  })

  it('should be in the physics domain', () => {
    expect(orbitLabConfig.domain).toBe('physics')
  })

  it('should use continuous simulation mode', () => {
    expect(orbitLabConfig.simulationMode).toBe('continuous')
  })

  it('should have 6 parameters', () => {
    expect(orbitLabConfig.parameters).toHaveLength(6)
  })

  it('should have 3 equations', () => {
    expect(orbitLabConfig.equations).toHaveLength(3)
  })

  it('should have 4 missions', () => {
    expect(orbitLabConfig.missions).toHaveLength(4)
  })

  it('should have 5 reference content items', () => {
    expect(orbitLabConfig.referenceContent).toHaveLength(5)
  })

  it('should have all parameter IDs be unique', () => {
    const ids = orbitLabConfig.parameters.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have all mission IDs be unique', () => {
    const ids = orbitLabConfig.missions.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
