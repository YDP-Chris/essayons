/**
 * TypeScript interfaces for Wave Lab episode.
 *
 * Defines types for 1D string wave physics including string parameters,
 * wave state, and physics calculations for standing wave simulation.
 */

// ---------------------------------------------------------------------------
// String Physical Properties
// ---------------------------------------------------------------------------

/** Physical properties of a vibrating string. */
export interface StringParameters {
  readonly length: number // String length in meters
  readonly tension: number // String tension in Newtons
  readonly linearDensity: number // Mass per unit length (μ) in kg/m
  readonly damping: number // Damping coefficient (0 = no damping, 1 = critical damping)
}

/** Driving force parameters for the string oscillation. */
export interface DrivingForce {
  readonly frequency: number // Driving frequency in Hz
  readonly amplitude: number // Driving amplitude
  readonly phase: number // Phase offset in radians
}

// ---------------------------------------------------------------------------
// Wave State and Physics
// ---------------------------------------------------------------------------

/** Complete state of the wave simulation at a given time. */
export interface WaveState {
  readonly stringParams: StringParameters
  readonly driving: DrivingForce
  readonly time: number // Simulation time in seconds
  readonly displacement: readonly number[] // Wave displacement at each position
  readonly positions: readonly number[] // X positions along the string
  readonly fundamentalFreq: number // Calculated fundamental frequency
  readonly harmonics: readonly number[] // List of harmonic frequencies
  readonly resonanceLevel: number // How close to resonance (0-1)
  readonly amplitude: number // Current wave amplitude
  readonly energy: number // Total wave energy
  readonly nodePositions: readonly number[] // Positions of wave nodes
  readonly antinodePositions: readonly number[] // Positions of antinodes
}

/** Configuration for wave physics calculations. */
export interface PhysicsConfig {
  readonly resolution: number // Number of position points to calculate
  readonly timeStep: number // Physics timestep in seconds
  readonly maxAmplitude: number // Maximum allowed displacement
  readonly resonanceThreshold: number // Threshold for detecting resonance
}

// ---------------------------------------------------------------------------
// Mission and Control States
// ---------------------------------------------------------------------------

/** State for mission progress tracking. */
export interface MissionState {
  readonly currentMission: number
  readonly completed: readonly boolean[]
  readonly progress: readonly number[] // Progress per mission (0-1)
  readonly hints: readonly string[] // Available hints
  readonly showHint: boolean
}

/** State of the user interface controls. */
export interface ControlsState {
  readonly showNodes: boolean // Highlight wave nodes
  readonly showAntinodes: boolean // Highlight antinodes
  readonly showHarmonics: boolean // Display harmonic frequencies
  readonly animationSpeed: number // Animation speed multiplier
  readonly paused: boolean // Animation paused state
}

// ---------------------------------------------------------------------------
// Parameters for Essayons Integration
// ---------------------------------------------------------------------------

/** Parameters that can be controlled by users via Essayons UI. */
export interface WaveParams {
  readonly 'string-length': number
  readonly 'string-tension': number
  readonly 'linear-density': number
  readonly 'driving-frequency': number
  readonly 'driving-amplitude': number
  readonly 'show-nodes': boolean
  readonly 'show-antinodes': boolean
  readonly 'show-harmonics': boolean
  readonly 'animation-speed': number
}

// ---------------------------------------------------------------------------
// Rendering and Visualization
// ---------------------------------------------------------------------------

/** Configuration for wave visualization. */
export interface RenderConfig {
  readonly stringColor: string
  readonly waveColor: string
  readonly nodeColor: string
  readonly antinodeColor: string
  readonly backgroundColor: string
  readonly gridColor: string
  readonly resonanceColor: string
}

/** Point for rendering wave displacement. */
export interface WavePoint {
  readonly x: number // Position along string
  readonly y: number // Displacement
  readonly amplitude: number // Local amplitude
}
