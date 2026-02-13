/**
 * TypeScript interfaces for Circuit Lab episode state and components.
 */

// ---------------------------------------------------------------------------
// Component Types
// ---------------------------------------------------------------------------

export type ComponentType = 'resistor' | 'capacitor' | 'battery' | 'switch' | 'bulb' | 'wire'

export interface GridPosition {
  readonly x: number
  readonly y: number
}

export interface CircuitComponent {
  readonly id: string
  readonly type: ComponentType
  readonly position: GridPosition
  readonly rotation: number // 0, 90, 180, 270 degrees
  readonly value: number // resistance (Ω), capacitance (F), voltage (V), etc.
  readonly name?: string
}

export interface Connection {
  readonly fromComponent: string
  readonly fromPin: number
  readonly toComponent: string
  readonly toPin: number
}

// ---------------------------------------------------------------------------
// Circuit Analysis Results
// ---------------------------------------------------------------------------

export interface ComponentState {
  readonly voltage: number // voltage across component (V)
  readonly current: number // current through component (A)
  readonly power: number // power dissipated (W)
}

export interface CircuitAnalysis {
  readonly valid: boolean
  readonly components: ReadonlyMap<string, ComponentState>
  readonly totalPower: number
  readonly errors: readonly string[]
}

// ---------------------------------------------------------------------------
// Main Circuit State
// ---------------------------------------------------------------------------

export interface CircuitState {
  readonly components: readonly CircuitComponent[]
  readonly connections: readonly Connection[]
  readonly analysis: CircuitAnalysis
  readonly gridSize: number
  readonly selectedComponent: string | null
  readonly draggedComponent: CircuitComponent | null
  readonly time: number // simulation time in seconds
  readonly isRunning: boolean
}

// ---------------------------------------------------------------------------
// Parameters Interface
// ---------------------------------------------------------------------------

export interface CircuitParams {
  readonly 'grid-size': number
  readonly 'show-current': boolean
  readonly 'show-voltage': boolean
  readonly 'show-power': boolean
  readonly 'show-values': boolean
  readonly 'animation-speed': number
  readonly 'wire-thickness': number
}
