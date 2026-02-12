/**
 * Wave physics engine for the Wave Lab episode.
 *
 * Implements 1D wave equation for vibrating strings with fixed boundaries.
 * Calculates standing wave patterns, fundamental frequencies, harmonic series,
 * and resonance detection for guitar-string physics simulation.
 */

import type { StringParameters, DrivingForce, WaveState, PhysicsConfig } from './types.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default physics configuration for optimal performance and accuracy */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  resolution: 200, // Points to calculate along string
  timeStep: 1 / 60, // 60 FPS physics update rate
  maxAmplitude: 0.1, // Maximum displacement (10cm)
  resonanceThreshold: 0.02, // Threshold for detecting resonance
}

/** Maximum number of harmonics to calculate */
const MAX_HARMONICS = 10

/** Damping factor to prevent infinite amplitude at exact resonance */
const RESONANCE_DAMPING = 0.95

/** Tolerance for matching driving frequency to harmonics */
const FREQUENCY_TOLERANCE = 2.0 // Hz

// ---------------------------------------------------------------------------
// Physics Calculations
// ---------------------------------------------------------------------------

/**
 * Calculate the wave speed for a string with given tension and linear density.
 * v = sqrt(T/μ)
 */
function calculateWaveSpeed(tension: number, linearDensity: number): number {
  return Math.sqrt(tension / linearDensity)
}

/**
 * Calculate the fundamental frequency of a string.
 * f₁ = (1/2L) * sqrt(T/μ)
 */
function calculateFundamentalFreq(length: number, tension: number, linearDensity: number): number {
  const waveSpeed = calculateWaveSpeed(tension, linearDensity)
  return waveSpeed / (2 * length)
}

/**
 * Generate the harmonic series for a fundamental frequency.
 * fₙ = n * f₁ where n = 1, 2, 3, ...
 */
function calculateHarmonics(fundamentalFreq: number, maxHarmonics = MAX_HARMONICS): number[] {
  const harmonics: number[] = []
  for (let n = 1; n <= maxHarmonics; n++) {
    harmonics.push(n * fundamentalFreq)
  }
  return harmonics
}

/**
 * Find the closest harmonic to a given driving frequency.
 * Returns [harmonic_number, harmonic_frequency, distance]
 */
function findClosestHarmonic(
  drivingFreq: number,
  harmonics: readonly number[],
): [number, number, number] {
  let closestIdx = 0
  let minDistance = Math.abs(drivingFreq - harmonics[0]!)

  for (let i = 1; i < harmonics.length; i++) {
    const distance = Math.abs(drivingFreq - harmonics[i]!)
    if (distance < minDistance) {
      minDistance = distance
      closestIdx = i
    }
  }

  return [closestIdx + 1, harmonics[closestIdx]!, minDistance]
}

/**
 * Calculate resonance level based on how close driving frequency is to a harmonic.
 * Returns 0-1 where 1 = perfect resonance, 0 = far from any harmonic.
 */
function calculateResonanceLevel(drivingFreq: number, harmonics: readonly number[]): number {
  const [, , distance] = findClosestHarmonic(drivingFreq, harmonics)

  // Use exponential decay to determine resonance strength
  const normalizedDistance = distance / FREQUENCY_TOLERANCE
  return Math.exp(-normalizedDistance * normalizedDistance)
}

/**
 * Calculate positions of nodes for a given harmonic number.
 * Nodes occur at x = k * L/n where k = 0, 1, 2, ..., n
 */
function calculateNodePositions(length: number, harmonicNumber: number): number[] {
  const nodes: number[] = []
  for (let k = 0; k <= harmonicNumber; k++) {
    nodes.push((k * length) / harmonicNumber)
  }
  return nodes
}

/**
 * Calculate positions of antinodes for a given harmonic number.
 * Antinodes occur halfway between nodes.
 */
function calculateAntinodePositions(length: number, harmonicNumber: number): number[] {
  const antinodes: number[] = []
  for (let k = 0; k < harmonicNumber; k++) {
    antinodes.push(((k + 0.5) * length) / harmonicNumber)
  }
  return antinodes
}

/**
 * Calculate wave displacement along the string for a standing wave pattern.
 * y(x,t) = A * sin(kx) * cos(ωt) where k = nπ/L and ω = 2πf
 */
function calculateStandingWave(
  positions: readonly number[],
  time: number,
  amplitude: number,
  frequency: number,
  length: number,
  harmonicNumber: number,
): number[] {
  const k = (harmonicNumber * Math.PI) / length // Wave number
  const omega = 2 * Math.PI * frequency // Angular frequency

  return positions.map((x) => amplitude * Math.sin(k * x) * Math.cos(omega * time))
}

/**
 * Apply damping to reduce unrealistic infinite amplitudes.
 */
function applyDamping(amplitude: number, damping: number, dt: number): number {
  return amplitude * Math.pow(RESONANCE_DAMPING, damping * dt)
}

// ---------------------------------------------------------------------------
// State Management
// ---------------------------------------------------------------------------

/**
 * Create initial wave state from user parameters.
 */
export function createInitialState(params: Record<string, unknown>): WaveState {
  const stringParams: StringParameters = {
    length: (params['string-length'] as number | undefined) ?? 1.0,
    tension: (params['string-tension'] as number | undefined) ?? 100,
    linearDensity: (params['linear-density'] as number | undefined) ?? 0.005,
    damping: 0.01, // Light damping for realism
  }

  const driving: DrivingForce = {
    frequency: (params['driving-frequency'] as number | undefined) ?? 70,
    amplitude: (params['driving-amplitude'] as number | undefined) ?? 0.01,
    phase: 0,
  }

  // Generate position array along the string
  const positions = Array.from(
    { length: DEFAULT_PHYSICS_CONFIG.resolution },
    (_, i) => (i / (DEFAULT_PHYSICS_CONFIG.resolution - 1)) * stringParams.length,
  )

  const fundamentalFreq = calculateFundamentalFreq(
    stringParams.length,
    stringParams.tension,
    stringParams.linearDensity,
  )

  const harmonics = calculateHarmonics(fundamentalFreq)
  const resonanceLevel = calculateResonanceLevel(driving.frequency, harmonics)

  // Start with zero displacement
  const displacement = new Array(positions.length).fill(0)

  return {
    stringParams,
    driving,
    time: 0,
    displacement,
    positions,
    fundamentalFreq,
    harmonics,
    resonanceLevel,
    amplitude: driving.amplitude,
    energy: 0,
    nodePositions: [],
    antinodePositions: [],
  }
}

/**
 * Update the wave simulation by one time step.
 */
export function updateWaveState(
  state: WaveState,
  params: Record<string, unknown>,
  dt: number,
): WaveState {
  // Update parameters if they changed
  const newStringParams: StringParameters = {
    length: (params['string-length'] as number | undefined) ?? state.stringParams.length,
    tension: (params['string-tension'] as number | undefined) ?? state.stringParams.tension,
    linearDensity:
      (params['linear-density'] as number | undefined) ?? state.stringParams.linearDensity,
    damping: state.stringParams.damping,
  }

  const newDriving: DrivingForce = {
    frequency: (params['driving-frequency'] as number | undefined) ?? state.driving.frequency,
    amplitude: (params['driving-amplitude'] as number | undefined) ?? state.driving.amplitude,
    phase: state.driving.phase,
  }

  const animSpeed = (params['animation-speed'] as number | undefined) ?? 1.0
  const effectiveDt = dt * animSpeed

  // Recalculate fundamental frequency if string parameters changed
  const fundamentalFreq = calculateFundamentalFreq(
    newStringParams.length,
    newStringParams.tension,
    newStringParams.linearDensity,
  )

  const harmonics = calculateHarmonics(fundamentalFreq)
  const resonanceLevel = calculateResonanceLevel(newDriving.frequency, harmonics)

  // Find the dominant harmonic for wave pattern calculation
  const [harmonicNumber, harmonicFreq] = findClosestHarmonic(newDriving.frequency, harmonics)

  // Calculate amplitude with resonance amplification and damping
  let newAmplitude = newDriving.amplitude * (1 + resonanceLevel * 20) // Amplify at resonance
  newAmplitude = applyDamping(newAmplitude, newStringParams.damping, effectiveDt)
  newAmplitude = Math.min(newAmplitude, DEFAULT_PHYSICS_CONFIG.maxAmplitude)

  // Update positions array if string length changed
  let positions = state.positions
  if (newStringParams.length !== state.stringParams.length) {
    positions = Array.from(
      { length: DEFAULT_PHYSICS_CONFIG.resolution },
      (_, i) => (i / (DEFAULT_PHYSICS_CONFIG.resolution - 1)) * newStringParams.length,
    )
  }

  // Calculate wave displacement for standing wave pattern
  const displacement = calculateStandingWave(
    positions,
    state.time + effectiveDt,
    newAmplitude,
    harmonicFreq, // Use the closest harmonic frequency for wave calculation
    newStringParams.length,
    harmonicNumber,
  )

  // Calculate node and antinode positions for the dominant harmonic
  // Only calculate if we're actually close to a harmonic (in resonance)
  let nodePositions: number[] = []
  let antinodePositions: number[] = []
  if (resonanceLevel > 0.5) {
    nodePositions = calculateNodePositions(newStringParams.length, harmonicNumber)
    antinodePositions = calculateAntinodePositions(newStringParams.length, harmonicNumber)
  }

  // Calculate total energy (kinetic + potential)
  const energy = displacement.reduce((sum, y) => sum + y * y, 0) / displacement.length

  return {
    stringParams: newStringParams,
    driving: newDriving,
    time: state.time + effectiveDt,
    displacement,
    positions,
    fundamentalFreq,
    harmonics,
    resonanceLevel,
    amplitude: newAmplitude,
    energy,
    nodePositions,
    antinodePositions,
  }
}

// ---------------------------------------------------------------------------
// Mission Check Functions
// ---------------------------------------------------------------------------

// Track resonance state for sustained resonance checking
let resonanceStartTime = 0
let isInResonance = false
let totalResonanceTime = 0

/** Check if driving frequency matches fundamental within tolerance */
export function checkFundamentalResonance(state: WaveState): boolean {
  const freqDiff = Math.abs(state.driving.frequency - state.fundamentalFreq)
  return freqDiff <= FREQUENCY_TOLERANCE && state.resonanceLevel > 0.8
}

/** Check if resonance has been sustained for at least 3 seconds */
export function checkSustainedResonance(state: WaveState): boolean {
  const inResonance = checkFundamentalResonance(state)

  if (inResonance && !isInResonance) {
    resonanceStartTime = state.time
    isInResonance = true
  } else if (!inResonance && isInResonance) {
    // Add to total resonance time when leaving resonance
    totalResonanceTime += state.time - resonanceStartTime
    isInResonance = false
  }

  // Current session time
  const currentSessionTime = isInResonance ? state.time - resonanceStartTime : 0

  // Total time includes current session + previous accumulated time
  const totalTime = totalResonanceTime + currentSessionTime

  return totalTime >= 3.0
}

/** Check if driving frequency matches 2nd harmonic */
export function checkSecondHarmonic(state: WaveState): boolean {
  const secondHarmonic = state.harmonics[1] ?? 0
  const freqDiff = Math.abs(state.driving.frequency - secondHarmonic)
  return freqDiff <= FREQUENCY_TOLERANCE && state.resonanceLevel > 0.8
}

/** Check if driving frequency matches 3rd harmonic */
export function checkThirdHarmonic(state: WaveState): boolean {
  const thirdHarmonic = state.harmonics[2] ?? 0
  const freqDiff = Math.abs(state.driving.frequency - thirdHarmonic)
  return freqDiff <= FREQUENCY_TOLERANCE && state.resonanceLevel > 0.8
}

/** Check if user has observed nodes in harmonic patterns */
export function checkNodeCounting(state: WaveState): boolean {
  // This would be checked by UI interaction - for now, return true if in harmonic resonance
  return checkSecondHarmonic(state) || checkThirdHarmonic(state)
}

// Track original parameters for change detection
const originalLength = 1.0
const originalTension = 100
let lengthChangeDetected = false
let tensionChangeDetected = false

/** Check if user halved string length and found new fundamental */
export function checkLengthResonance(state: WaveState): boolean {
  // Detect when length changes to approximately half
  if (!lengthChangeDetected && Math.abs(state.stringParams.length - originalLength / 2) < 0.1) {
    lengthChangeDetected = true
  }

  // Check if they found resonance with the new shorter string
  return lengthChangeDetected && checkFundamentalResonance(state)
}

/** Check if user doubled tension and found new fundamental */
export function checkTensionResonance(state: WaveState): boolean {
  // Detect when tension changes to approximately double
  if (!tensionChangeDetected && Math.abs(state.stringParams.tension - originalTension * 2) < 20) {
    tensionChangeDetected = true
  }

  // Check if they found resonance with the new higher tension
  return tensionChangeDetected && checkFundamentalResonance(state)
}

/** Check if user demonstrates understanding of physics relationship */
export function checkPhysicsUnderstanding(state: WaveState): boolean {
  // This is demonstrated by completing both length and tension challenges
  return checkLengthResonance(state) && checkTensionResonance(state)
}

// Reset mission tracking when episode restarts
export function resetMissionTracking(): void {
  resonanceStartTime = 0
  isInResonance = false
  totalResonanceTime = 0
  lengthChangeDetected = false
  tensionChangeDetected = false
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/** Get wavelength for a given harmonic number */
export function getWavelength(stringLength: number, harmonicNumber: number): number {
  return (2 * stringLength) / harmonicNumber
}

/** Get frequency for a specific harmonic */
export function getHarmonicFrequency(fundamentalFreq: number, harmonicNumber: number): number {
  return harmonicNumber * fundamentalFreq
}

/** Check if a frequency is close to any harmonic */
export function isNearHarmonic(frequency: number, harmonics: readonly number[]): boolean {
  return harmonics.some((h) => Math.abs(frequency - h) <= FREQUENCY_TOLERANCE)
}
