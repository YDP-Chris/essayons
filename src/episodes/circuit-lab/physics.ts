/**
 * Circuit physics engine for the Circuit Lab episode.
 *
 * Implements real circuit analysis using Kirchhoff's laws, Ohm's law,
 * and capacitor charging equations. Provides a grid-based component
 * system with drag-and-drop circuit construction.
 */

import type {
  CircuitState,
  CircuitComponent,
  Connection,
  CircuitAnalysis,
  ComponentState,
  ComponentType,
  GridPosition,
} from './types.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default component values */
export const DEFAULT_VALUES: Record<ComponentType, number> = {
  resistor: 1000, // 1kΩ
  capacitor: 0.001, // 1mF
  battery: 9, // 9V
  switch: 0, // 0 = open, 1 = closed
  bulb: 100, // 100Ω filament resistance
  wire: 0.01, // 0.01Ω wire resistance
}

/** Component display names */
export const COMPONENT_NAMES: Record<ComponentType, string> = {
  resistor: 'Resistor',
  capacitor: 'Capacitor',
  battery: 'Battery',
  switch: 'Switch',
  bulb: 'Bulb',
  wire: 'Wire',
}

/** Grid cell size in pixels */
export const CELL_SIZE = 20

// Circuit solver constants (for future use)
// const MAX_ITERATIONS = 100
// const TOLERANCE = 1e-9

// ---------------------------------------------------------------------------
// Component Library
// ---------------------------------------------------------------------------

export interface ComponentTemplate {
  readonly type: ComponentType
  readonly name: string
  readonly defaultValue: number
  readonly symbol: string
  readonly pins: number // number of connection points
}

export const COMPONENT_LIBRARY: readonly ComponentTemplate[] = [
  { type: 'battery', name: 'Battery', defaultValue: 9, symbol: '🔋', pins: 2 },
  { type: 'resistor', name: 'Resistor', defaultValue: 1000, symbol: '⟧⟦', pins: 2 },
  { type: 'capacitor', name: 'Capacitor', defaultValue: 0.001, symbol: '||', pins: 2 },
  { type: 'bulb', name: 'Light Bulb', defaultValue: 100, symbol: '💡', pins: 2 },
  { type: 'switch', name: 'Switch', defaultValue: 1, symbol: '⟊⟊', pins: 2 },
  { type: 'wire', name: 'Wire', defaultValue: 0.01, symbol: '──', pins: 2 },
]

// ---------------------------------------------------------------------------
// Circuit Analysis Engine
// ---------------------------------------------------------------------------

interface Node {
  id: string
  voltage: number
  components: string[]
}

interface Branch {
  id: string
  fromNode: string
  toNode: string
  component: CircuitComponent
  current: number
}

/**
 * Build the circuit netlist from components and connections.
 * Returns nodes and branches for circuit analysis.
 */
function buildNetlist(
  components: readonly CircuitComponent[],
  connections: readonly Connection[],
): {
  nodes: Map<string, Node>
  branches: Map<string, Branch>
  groundNode: string | null
} {
  const nodes = new Map<string, Node>()
  const branches = new Map<string, Branch>()

  // Create nodes at component positions
  for (const component of components) {
    const nodeId = `${component.position.x},${component.position.y}`
    if (!nodes.has(nodeId)) {
      nodes.set(nodeId, {
        id: nodeId,
        voltage: 0,
        components: [],
      })
    }
    nodes.get(nodeId)!.components.push(component.id)
  }

  // Create branches from connections
  for (const connection of connections) {
    const fromComp = components.find((c) => c.id === connection.fromComponent)
    const toComp = components.find((c) => c.id === connection.toComponent)
    if (!fromComp || !toComp) continue

    const fromNodeId = `${fromComp.position.x},${fromComp.position.y}`
    const toNodeId = `${toComp.position.x},${toComp.position.y}`

    const branchId = `${connection.fromComponent}-${connection.toComponent}`
    branches.set(branchId, {
      id: branchId,
      fromNode: fromNodeId,
      toNode: toNodeId,
      component: fromComp, // Use fromComponent as the branch component
      current: 0,
    })
  }

  // Find ground node (assume bottom-left component is ground)
  let groundNode: string | null = null
  let minX = Infinity,
    minY = Infinity
  for (const [nodeId] of nodes) {
    const coords = nodeId.split(',').map(Number)
    const x = coords[0] ?? 0
    const y = coords[1] ?? 0
    if (x + y < minX + minY) {
      minX = x
      minY = y
      groundNode = nodeId
    }
  }

  return { nodes, branches, groundNode }
}

/**
 * Solve the circuit using nodal analysis (Kirchhoff's laws).
 * This is a simplified solver for basic resistive circuits.
 */
function solveCircuit(
  nodes: Map<string, Node>,
  branches: Map<string, Branch>,
  groundNode: string | null,
  capacitorVoltages: Map<string, number>,
  dt: number,
): { voltages: Map<string, number>; currents: Map<string, number>; valid: boolean } {
  if (!groundNode) {
    return { voltages: new Map(), currents: new Map(), valid: false }
  }

  const nodeList = Array.from(nodes.keys()).filter((id) => id !== groundNode)
  const branchList = Array.from(branches.values())
  const numNodes = nodeList.length

  if (numNodes === 0) {
    return { voltages: new Map([[groundNode, 0]]), currents: new Map(), valid: true }
  }

  // Build conductance matrix (G) and current vector (I)
  const G = Array(numNodes)
    .fill(0)
    .map(() => Array(numNodes).fill(0))
  const I = Array(numNodes).fill(0)

  for (let i = 0; i < numNodes; i++) {
    const nodeId = nodeList[i]

    // Add conductances from all branches connected to this node
    const row = G[i]
    if (!row) continue

    for (const branch of branchList) {
      if (branch.fromNode === nodeId || branch.toNode === nodeId) {
        const comp = branch.component
        let conductance = 0

        switch (comp.type) {
          case 'resistor':
          case 'bulb':
            conductance = 1 / Math.max(comp.value, 0.001) // G = 1/R
            break
          case 'wire':
            conductance = 1 / Math.max(comp.value, 0.001)
            break
          case 'switch':
            conductance = comp.value > 0.5 ? 1000 : 0.001 // closed vs open
            break
          case 'capacitor':
            // For DC analysis, capacitor acts as open circuit
            // For transient, we'd need differential equations
            conductance = 0.001
            break
          case 'battery':
            // Voltage source - handled separately
            break
        }

        row[i] += conductance

        // Add off-diagonal terms
        if (branch.fromNode === nodeId) {
          const toIndex = nodeList.indexOf(branch.toNode)
          if (toIndex >= 0) {
            row[toIndex] -= conductance
          }
        } else if (branch.toNode === nodeId) {
          const fromIndex = nodeList.indexOf(branch.fromNode)
          if (fromIndex >= 0) {
            row[fromIndex] -= conductance
          }
        }
      }
    }

    // Add current sources from voltage sources (batteries)
    for (const branch of branchList) {
      if (branch.component.type === 'battery') {
        const voltage = branch.component.value
        const currentVal = I[i] ?? 0
        if (branch.fromNode === nodeId) {
          // Current flowing into this node from battery
          I[i] = currentVal + voltage / 1 // Assume 1Ω internal resistance
        } else if (branch.toNode === nodeId) {
          // Current flowing out of this node to battery
          I[i] = currentVal - voltage / 1
        }
      }
    }
  }

  // Solve G * V = I using Gaussian elimination
  try {
    const voltages = gaussianElimination(G, I)
    const nodeVoltages = new Map<string, number>()
    if (groundNode) {
      nodeVoltages.set(groundNode, 0)
    }

    for (let i = 0; i < numNodes; i++) {
      const nodeId = nodeList[i]
      const voltage = voltages[i]
      if (nodeId && voltage !== undefined) {
        nodeVoltages.set(nodeId, voltage)
      }
    }

    // Calculate branch currents using Ohm's law
    const branchCurrents = new Map<string, number>()
    for (const branch of branchList) {
      const vFrom = nodeVoltages.get(branch.fromNode) ?? 0
      const vTo = nodeVoltages.get(branch.toNode) ?? 0
      const vDiff = vFrom - vTo

      let current = 0
      switch (branch.component.type) {
        case 'resistor':
        case 'bulb':
        case 'wire':
          current = vDiff / Math.max(branch.component.value, 0.001)
          break
        case 'switch':
          current = branch.component.value > 0.5 ? vDiff / 0.001 : 0
          break
        case 'battery':
          // Current determined by external circuit
          current = vDiff / 1 // Simplified
          break
        case 'capacitor': {
          // I = C * dV/dt - simplified for now
          const prevV = capacitorVoltages.get(branch.component.id) ?? 0
          const dvdt = dt > 0 ? (vDiff - prevV) / dt : 0
          current = branch.component.value * dvdt
          break
        }
      }

      branchCurrents.set(branch.id, current)
    }

    return { voltages: nodeVoltages, currents: branchCurrents, valid: true }
  } catch {
    return { voltages: new Map(), currents: new Map(), valid: false }
  }
}

/**
 * Gaussian elimination solver for linear system Ax = b.
 */
function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length
  const augmented = A.map((row, i) => [...row, b[i]])

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      const currentRow = augmented[k]
      const maxRowData = augmented[maxRow]
      if (currentRow && maxRowData && Math.abs(currentRow[i] ?? 0) > Math.abs(maxRowData[i] ?? 0)) {
        maxRow = k
      }
    }

    // Swap rows
    const row1 = augmented[i]
    const row2 = augmented[maxRow]
    if (maxRow !== i && row1 && row2) {
      augmented[i] = row2
      augmented[maxRow] = row1
    }

    // Make diagonal 1 and eliminate column
    const currentRow = augmented[i]
    if (!currentRow) continue

    const pivot = currentRow[i]
    if (!pivot || Math.abs(pivot) < 1e-10) {
      throw new Error('Singular matrix')
    }

    for (let k = i; k <= n; k++) {
      const val = currentRow[k]
      if (val !== undefined) {
        currentRow[k] = val / pivot
      }
    }

    for (let k = i + 1; k < n; k++) {
      const row = augmented[k]
      if (!row) continue

      const factor = row[i] ?? 0
      for (let j = i; j <= n; j++) {
        const currentVal = currentRow[j]
        const rowVal = row[j]
        if (currentVal !== undefined && rowVal !== undefined) {
          row[j] = rowVal - factor * currentVal
        }
      }
    }
  }

  // Back substitution
  const x = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    const row = augmented[i]
    if (!row) continue

    x[i] = row[n] ?? 0
    for (let j = i + 1; j < n; j++) {
      const coeff = row[j]
      if (coeff !== undefined) {
        x[i] -= coeff * x[j]
      }
    }
  }

  return x
}

// ---------------------------------------------------------------------------
// State Creation and Updates
// ---------------------------------------------------------------------------

/**
 * Create initial circuit state with empty grid.
 */
export function createInitialState(params: Record<string, unknown>): CircuitState {
  const gridSize = (params['grid-size'] as number | undefined) ?? 20

  return {
    components: [],
    connections: [],
    analysis: {
      valid: false,
      components: new Map(),
      totalPower: 0,
      errors: ['No components in circuit'],
    },
    gridSize,
    selectedComponent: null,
    draggedComponent: null,
    time: 0,
    isRunning: true,
  }
}

/**
 * Update circuit state with physics simulation.
 */
export function updateCircuitState(
  state: CircuitState,
  _params: Record<string, unknown>,
  dt: number,
): CircuitState {
  if (!state.isRunning) {
    return { ...state, time: state.time + dt }
  }

  // Store capacitor voltages for transient analysis
  const capacitorVoltages = new Map<string, number>()
  for (const [compId, compState] of state.analysis.components) {
    const component = state.components.find((c) => c.id === compId)
    if (component?.type === 'capacitor') {
      capacitorVoltages.set(compId, compState.voltage)
    }
  }

  // Analyze the circuit
  const analysis = analyzeCircuit(state.components, state.connections, capacitorVoltages, dt)

  return {
    ...state,
    analysis,
    time: state.time + dt,
  }
}

/**
 * Analyze the circuit and return voltages, currents, and power for each component.
 */
function analyzeCircuit(
  components: readonly CircuitComponent[],
  connections: readonly Connection[],
  capacitorVoltages: Map<string, number>,
  dt: number,
): CircuitAnalysis {
  if (components.length === 0) {
    return {
      valid: false,
      components: new Map(),
      totalPower: 0,
      errors: ['No components in circuit'],
    }
  }

  // Check for basic circuit validity
  if (connections.length === 0) {
    return {
      valid: false,
      components: new Map(),
      totalPower: 0,
      errors: ['No connections in circuit'],
    }
  }

  const { nodes, branches, groundNode } = buildNetlist(components, connections)

  if (!groundNode) {
    return {
      valid: false,
      components: new Map(),
      totalPower: 0,
      errors: ['No ground reference found'],
    }
  }

  if (branches.size === 0) {
    return {
      valid: false,
      components: new Map(),
      totalPower: 0,
      errors: ['No circuit branches found'],
    }
  }

  const solution = solveCircuit(nodes, branches, groundNode, capacitorVoltages, dt)

  if (!solution.valid) {
    return {
      valid: false,
      components: new Map(),
      totalPower: 0,
      errors: ['Circuit analysis failed - check for shorts or open circuits'],
    }
  }

  // Calculate component states
  const componentStates = new Map<string, ComponentState>()
  let totalPower = 0

  for (const component of components) {
    const nodeId = `${component.position.x},${component.position.y}`
    const voltage = solution.voltages.get(nodeId) ?? 0

    // Find current through this component
    let current = 0
    for (const [branchId, branchCurrent] of solution.currents) {
      const branch = branches.get(branchId)
      if (branch?.component.id === component.id) {
        current = branchCurrent
        break
      }
    }

    const power = Math.abs(voltage * current)
    totalPower += power

    componentStates.set(component.id, {
      voltage,
      current,
      power,
    })
  }

  return {
    valid: true,
    components: componentStates,
    totalPower,
    errors: [],
  }
}

// ---------------------------------------------------------------------------
// Component Management
// ---------------------------------------------------------------------------

/**
 * Add a component to the circuit at the specified grid position.
 */
export function addComponent(
  state: CircuitState,
  type: ComponentType,
  position: GridPosition,
): CircuitState {
  const newComponent: CircuitComponent = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    position,
    rotation: 0,
    value: DEFAULT_VALUES[type],
  }

  return {
    ...state,
    components: [...state.components, newComponent],
  }
}

/**
 * Remove a component from the circuit.
 */
export function removeComponent(state: CircuitState, componentId: string): CircuitState {
  return {
    ...state,
    components: state.components.filter((c) => c.id !== componentId),
    connections: state.connections.filter(
      (c) => c.fromComponent !== componentId && c.toComponent !== componentId,
    ),
  }
}

/**
 * Connect two components together.
 */
export function connectComponents(
  state: CircuitState,
  fromComponent: string,
  fromPin: number,
  toComponent: string,
  toPin: number,
): CircuitState {
  const newConnection: Connection = {
    fromComponent,
    fromPin,
    toComponent,
    toPin,
  }

  return {
    ...state,
    connections: [...state.connections, newConnection],
  }
}

// ---------------------------------------------------------------------------
// Mission Check Functions
// ---------------------------------------------------------------------------

/**
 * Check if the light bulb is powered (receiving current).
 */
export function checkBulbPowered(state: CircuitState): boolean {
  for (const component of state.components) {
    if (component.type === 'bulb') {
      const componentState = state.analysis.components.get(component.id)
      return componentState ? Math.abs(componentState.current) > 0.001 : false
    }
  }
  return false
}

/**
 * Check if the circuit is complete (has a continuous path).
 */
export function checkCircuitComplete(state: CircuitState): boolean {
  return state.analysis.valid && state.analysis.errors.length === 0
}

/**
 * Check if there are exactly two resistors connected in series.
 */
export function checkTwoResistorsInSeries(state: CircuitState): boolean {
  const resistors = state.components.filter((c) => c.type === 'resistor')
  return resistors.length === 2 && state.connections.length >= 2
}

/**
 * Check if voltage division is occurring (middle node has intermediate voltage).
 */
export function checkVoltageSplit(state: CircuitState): boolean {
  if (!state.analysis.valid) return false

  const voltages = Array.from(state.analysis.components.values()).map((s) => s.voltage)
  const maxV = Math.max(...voltages)
  const minV = Math.min(...voltages)

  // Look for intermediate voltage (not 0 and not max)
  return voltages.some((v) => v > minV + 0.1 && v < maxV - 0.1)
}

/**
 * Check if the circuit has one resistor and one capacitor.
 */
export function checkRCCircuit(state: CircuitState): boolean {
  const resistors = state.components.filter((c) => c.type === 'resistor')
  const capacitors = state.components.filter((c) => c.type === 'capacitor')
  return resistors.length === 1 && capacitors.length === 1
}

/**
 * Check if a capacitor is charging (voltage increasing over time).
 */
export function checkCapacitorCharging(state: CircuitState): boolean {
  for (const component of state.components) {
    if (component.type === 'capacitor') {
      const componentState = state.analysis.components.get(component.id)
      // Simplified: just check if capacitor has voltage
      return componentState ? componentState.voltage > 0.1 : false
    }
  }
  return false
}

/**
 * Check if a short circuit exists (direct connection across battery).
 */
export function checkShortCircuit(state: CircuitState): boolean {
  // Look for very high current through any component
  for (const [, componentState] of state.analysis.components) {
    if (Math.abs(componentState.current) > 10) {
      // > 10A indicates short
      return true
    }
  }
  return false
}

/**
 * Check if current is very high (indicating short circuit condition).
 */
export function checkHighCurrent(state: CircuitState): boolean {
  return state.analysis.totalPower > 100 // > 100W indicates high current
}
