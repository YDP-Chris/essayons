/**
 * Structural physics engine for the Bridge Lab episode.
 *
 * Implements a simplified finite element approach for truss analysis.
 * Nodes experience forces from gravity, applied loads, and beam reactions.
 * Beams stretch or compress based on node positions, generating stress.
 */

import type { Node, Beam, BridgeState, Material } from './types.ts'

// ---------------------------------------------------------------------------
// Material Properties
// ---------------------------------------------------------------------------

interface MaterialProperties {
  readonly yieldStrength: number // Pa (Pascals)
  readonly density: number // kg/m³
  readonly color: string // hex color for rendering
}

export const MATERIALS: Record<Material, MaterialProperties> = {
  wood: { yieldStrength: 40e6, density: 600, color: '#d4a373' },
  steel: { yieldStrength: 250e6, density: 7850, color: '#94a3b8' },
  concrete: { yieldStrength: 30e6, density: 2400, color: '#a8a29e' },
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Beam cross-sectional area in m² (simplified — all beams same size) */
const BEAM_CROSS_SECTION = 0.01 // 10cm x 10cm = 0.01 m²

/** Young's modulus for simplified spring-like behavior (N/m²) */
const YOUNGS_MODULUS = 20e6 // Tuned for stability: nodes with 3-4 beams need combined CFL < 1

/** Damping factor to stabilize oscillations */
const DAMPING = 0.85

// ---------------------------------------------------------------------------
// Warren Truss Generator
// ---------------------------------------------------------------------------

/**
 * Create a Warren truss bridge structure.
 *
 * A Warren truss consists of:
 * - Top chord nodes
 * - Bottom chord nodes
 * - Diagonal web members connecting them in a zigzag pattern
 *
 * @param spanWidth - Total horizontal span in meters
 * @param height - Vertical height of truss in meters
 * @param segments - Number of segments (must be even for Warren truss)
 */
export function createWarrenTruss(
  spanWidth: number,
  height: number,
  segments: number,
): { nodes: Node[]; beams: Beam[] } {
  const nodes: Node[] = []
  const beams: Beam[] = []
  let nodeIdCounter = 0
  let beamIdCounter = 0

  const segmentWidth = spanWidth / segments

  // Create bottom chord nodes
  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth
    const y = 0
    const fixed = i === 0 || i === segments // Fix first and last nodes
    nodes.push({
      id: nodeIdCounter++,
      x,
      y,
      fixed,
      fx: 0,
      fy: 0,
      dx: 0,
      dy: 0,
    })
  }

  // Create top chord nodes
  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth
    const y = height
    const fixed = false
    nodes.push({
      id: nodeIdCounter++,
      x,
      y,
      fixed,
      fx: 0,
      fy: 0,
      dx: 0,
      dy: 0,
    })
  }

  const bottomChordStart = 0
  const topChordStart = segments + 1

  // Create bottom chord beams
  for (let i = 0; i < segments; i++) {
    const nodeA = bottomChordStart + i
    const nodeB = bottomChordStart + i + 1
    const length = Math.sqrt(
      (nodes[nodeB]!.x - nodes[nodeA]!.x) ** 2 + (nodes[nodeB]!.y - nodes[nodeA]!.y) ** 2,
    )
    beams.push({
      id: beamIdCounter++,
      nodeA,
      nodeB,
      material: 'steel',
      stress: 0,
      strain: 0,
      broken: false,
      restLength: length,
    })
  }

  // Create top chord beams
  for (let i = 0; i < segments; i++) {
    const nodeA = topChordStart + i
    const nodeB = topChordStart + i + 1
    const length = Math.sqrt(
      (nodes[nodeB]!.x - nodes[nodeA]!.x) ** 2 + (nodes[nodeB]!.y - nodes[nodeA]!.y) ** 2,
    )
    beams.push({
      id: beamIdCounter++,
      nodeA,
      nodeB,
      material: 'steel',
      stress: 0,
      strain: 0,
      broken: false,
      restLength: length,
    })
  }

  // Create diagonal web members (Warren pattern)
  for (let i = 0; i < segments; i++) {
    if (i % 2 === 0) {
      // Even segments: bottom-left to top-right
      const nodeA = bottomChordStart + i
      const nodeB = topChordStart + i + 1
      const length = Math.sqrt(
        (nodes[nodeB]!.x - nodes[nodeA]!.x) ** 2 + (nodes[nodeB]!.y - nodes[nodeA]!.y) ** 2,
      )
      beams.push({
        id: beamIdCounter++,
        nodeA,
        nodeB,
        material: 'steel',
        stress: 0,
        strain: 0,
        broken: false,
        restLength: length,
      })
    } else {
      // Odd segments: bottom-right to top-left
      const nodeA = bottomChordStart + i + 1
      const nodeB = topChordStart + i
      const length = Math.sqrt(
        (nodes[nodeB]!.x - nodes[nodeA]!.x) ** 2 + (nodes[nodeB]!.y - nodes[nodeA]!.y) ** 2,
      )
      beams.push({
        id: beamIdCounter++,
        nodeA,
        nodeB,
        material: 'steel',
        stress: 0,
        strain: 0,
        broken: false,
        restLength: length,
      })
    }
  }

  // Create vertical posts at start and end
  const leftPost = { nodeA: bottomChordStart, nodeB: topChordStart }
  const rightPost = { nodeA: bottomChordStart + segments, nodeB: topChordStart + segments }

  for (const post of [leftPost, rightPost]) {
    const length = Math.sqrt(
      (nodes[post.nodeB]!.x - nodes[post.nodeA]!.x) ** 2 +
        (nodes[post.nodeB]!.y - nodes[post.nodeA]!.y) ** 2,
    )
    beams.push({
      id: beamIdCounter++,
      nodeA: post.nodeA,
      nodeB: post.nodeB,
      material: 'steel',
      stress: 0,
      strain: 0,
      broken: false,
      restLength: length,
    })
  }

  return { nodes, beams }
}

// ---------------------------------------------------------------------------
// State Creation
// ---------------------------------------------------------------------------

/**
 * Create the initial bridge state with the selected material.
 */
export function createInitialState(params: Record<string, unknown>): BridgeState {
  const material = (params.material as Material | undefined) ?? 'steel'

  // Generate a Warren truss with 8 segments
  const { nodes, beams } = createWarrenTruss(20, 4, 8)

  // Apply material to all beams
  const beamsWithMaterial = beams.map((beam) => ({ ...beam, material }))

  // Calculate total weight
  const totalWeight = calculateTotalWeight(beamsWithMaterial, material)

  return {
    nodes,
    beams: beamsWithMaterial,
    totalWeight,
    maxStress: 0,
    maxDeflection: 0,
    safetyFactor: Infinity,
    brokenBeams: 0,
    simTime: 0,
  }
}

// ---------------------------------------------------------------------------
// Weight Calculation
// ---------------------------------------------------------------------------

function calculateTotalWeight(beams: readonly Beam[], material: Material): number {
  const materialProps = MATERIALS[material]
  let totalVolume = 0

  for (const beam of beams) {
    if (!beam.broken) {
      totalVolume += beam.restLength * BEAM_CROSS_SECTION
    }
  }

  return totalVolume * materialProps.density
}

// ---------------------------------------------------------------------------
// Physics Update
// ---------------------------------------------------------------------------

/**
 * Update the bridge physics for one timestep.
 *
 * 1. Zero out accumulated forces
 * 2. Apply gravity to all nodes
 * 3. Apply external load to center bottom node
 * 4. For each beam: calculate stress, apply reaction forces to nodes
 * 5. Integrate node positions (Euler integration with damping)
 * 6. Check for beam failures
 * 7. Compute statistics
 */
export function updateBridge(
  state: BridgeState,
  params: Record<string, unknown>,
  dt: number,
): BridgeState {
  const gravity = (params.gravity as number | undefined) ?? 9.81
  const loadWeight = (params['load-weight'] as number | undefined) ?? 1000
  const material = (params.material as Material | undefined) ?? 'steel'

  // If material changed, recreate the bridge
  if (state.beams.length > 0 && state.beams[0]!.material !== material) {
    return createInitialState(params)
  }

  const materialProps = MATERIALS[material]
  const nodes = [...state.nodes]
  const beams = [...state.beams]

  // Step 1: Zero forces
  for (let i = 0; i < nodes.length; i++) {
    nodes[i] = { ...nodes[i]!, fx: 0, fy: 0 }
  }

  // Step 2: Apply gravity to all free nodes
  const nodeWeight = state.totalWeight / nodes.length
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!
    if (!node.fixed) {
      nodes[i] = {
        ...node,
        fy: node.fy - nodeWeight * gravity,
      }
    }
  }

  // Step 3: Apply external load at center-bottom node
  // Bottom chord is first (segments+1) nodes, center is at segments/2
  const segments = 8
  const centerBottomNodeIndex = Math.floor(segments / 2)
  const centerNode = nodes[centerBottomNodeIndex]!
  if (!centerNode.fixed) {
    nodes[centerBottomNodeIndex] = {
      ...centerNode,
      fy: centerNode.fy - loadWeight * gravity,
    }
  }

  // Step 4: Process each beam
  let maxStress = 0
  let brokenCount = 0

  for (let i = 0; i < beams.length; i++) {
    const beam = beams[i]!
    if (beam.broken) {
      brokenCount++
      continue
    }

    const nodeA = nodes[beam.nodeA]!
    const nodeB = nodes[beam.nodeB]!

    // Current positions (including displacement)
    const ax = nodeA.x + nodeA.dx
    const ay = nodeA.y + nodeA.dy
    const bx = nodeB.x + nodeB.dx
    const by = nodeB.y + nodeB.dy

    // Current length
    const dx = bx - ax
    const dy = by - ay
    const currentLength = Math.sqrt(dx * dx + dy * dy)

    // Extension or compression
    const extension = currentLength - beam.restLength
    const strain = extension / beam.restLength

    // Hooke's law: F = k * extension, where k = (E * A) / L
    const stiffness = (YOUNGS_MODULUS * BEAM_CROSS_SECTION) / beam.restLength
    const force = stiffness * extension

    // Stress = Force / Area
    const stress = Math.abs(force / BEAM_CROSS_SECTION)

    // Check if beam breaks
    const broken = stress > materialProps.yieldStrength

    if (broken) {
      brokenCount++
    }

    beams[i] = {
      ...beam,
      stress,
      strain,
      broken,
    }

    maxStress = Math.max(maxStress, stress)

    // Apply reaction forces to nodes (spring-like)
    if (!broken && currentLength > 0) {
      const forceDirX = dx / currentLength
      const forceDirY = dy / currentLength

      // Node A: pulled toward B if in tension, pushed away if in compression
      if (!nodeA.fixed) {
        nodes[beam.nodeA] = {
          ...nodeA,
          fx: nodeA.fx + force * forceDirX,
          fy: nodeA.fy + force * forceDirY,
        }
      }

      // Node B: opposite direction
      if (!nodeB.fixed) {
        nodes[beam.nodeB] = {
          ...nodeB,
          fx: nodeB.fx - force * forceDirX,
          fy: nodeB.fy - force * forceDirY,
        }
      }
    }
  }

  // Step 5: Integrate node positions (simple Euler with damping)
  let maxDeflection = 0

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!
    if (node.fixed) continue

    const ddx = node.fx * dt * dt * 0.01
    const ddy = node.fy * dt * dt * 0.01

    const newDx = (node.dx + ddx) * DAMPING
    const newDy = (node.dy + ddy) * DAMPING

    nodes[i] = {
      ...node,
      dx: newDx,
      dy: newDy,
    }

    const deflection = Math.sqrt(newDx * newDx + newDy * newDy)
    maxDeflection = Math.max(maxDeflection, deflection)
  }

  // Step 6: Compute safety factor
  const safetyFactor = maxStress > 0 ? materialProps.yieldStrength / maxStress : Infinity

  return {
    nodes,
    beams,
    totalWeight: state.totalWeight,
    maxStress,
    maxDeflection,
    safetyFactor,
    brokenBeams: brokenCount,
    simTime: state.simTime + dt,
  }
}

// ---------------------------------------------------------------------------
// Mission Check Functions
// ---------------------------------------------------------------------------

/** Check if bridge survives load with no broken beams */
export function checkNoBrokenBeams(state: BridgeState): boolean {
  return state.brokenBeams === 0 && state.simTime > 5 // Must survive for 5 seconds
}

/** Check if bridge weight is under a target */
export function checkWeightUnder(state: BridgeState, target: number): boolean {
  return state.totalWeight < target && state.brokenBeams === 0 && state.simTime > 5
}

/** Check if safety factor is above threshold */
export function checkSafetyFactor(state: BridgeState, minSafety: number): boolean {
  return state.safetyFactor >= minSafety && state.brokenBeams === 0 && state.simTime > 5
}

/** Check if any beams are broken (for earthquake mission) */
export function checkSurviveEarthquake(state: BridgeState): boolean {
  return state.brokenBeams === 0 && state.simTime > 10 // Must survive 10 seconds
}
