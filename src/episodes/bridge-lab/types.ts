/**
 * Type definitions for the Bridge Lab episode.
 *
 * Defines nodes, beams, and the complete bridge structural state.
 */

// ---------------------------------------------------------------------------
// Material Types
// ---------------------------------------------------------------------------

export type Material = 'wood' | 'steel' | 'concrete'

// ---------------------------------------------------------------------------
// Node (vertex in the truss structure)
// ---------------------------------------------------------------------------

export interface Node {
  readonly id: number
  readonly x: number
  readonly y: number
  readonly fixed: boolean
  readonly fx: number // accumulated force x
  readonly fy: number // accumulated force y
  readonly dx: number // displacement x
  readonly dy: number // displacement y
}

// ---------------------------------------------------------------------------
// Beam (edge connecting two nodes)
// ---------------------------------------------------------------------------

export interface Beam {
  readonly id: number
  readonly nodeA: number // node ID
  readonly nodeB: number // node ID
  readonly material: Material
  readonly stress: number // current stress in Pa (Pascals)
  readonly strain: number // current strain (dimensionless)
  readonly broken: boolean
  readonly restLength: number // original length in meters
}

// ---------------------------------------------------------------------------
// Bridge State
// ---------------------------------------------------------------------------

export interface BridgeState {
  readonly nodes: readonly Node[]
  readonly beams: readonly Beam[]
  readonly totalWeight: number // total structure weight in kg
  readonly maxStress: number // maximum stress across all beams in Pa
  readonly maxDeflection: number // maximum node displacement in meters
  readonly safetyFactor: number // yield_strength / max_stress
  readonly brokenBeams: number // count of failed beams
  readonly simTime: number // simulation time in seconds
}

// ---------------------------------------------------------------------------
// Bridge Parameters
// ---------------------------------------------------------------------------

export interface BridgeParams {
  readonly material: Material
  readonly 'load-weight': number
  readonly gravity: number
  readonly 'show-forces': boolean
  readonly 'show-stress': boolean
}
