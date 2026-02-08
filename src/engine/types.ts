/**
 * Core type definitions for the Essayons simulation engine.
 *
 * These interfaces define the contract between the engine framework
 * and episode implementations. All simulation state, rendering context,
 * parameter definitions, input actions, and mission objectives are
 * described here.
 */

// ---------------------------------------------------------------------------
// Vector & Math
// ---------------------------------------------------------------------------

/** A 2D vector used for positions, velocities, and forces. */
export interface Vector2 {
  readonly x: number
  readonly y: number
}

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

/** A numeric parameter with min/max/step constraints. */
export interface NumberParam {
  readonly type: 'number'
  readonly key: string
  readonly label: string
  readonly default: number
  readonly min: number
  readonly max: number
  readonly step: number
  readonly unit?: string
  readonly displayPrecision?: number
}

/** A boolean toggle parameter. */
export interface BooleanParam {
  readonly type: 'boolean'
  readonly key: string
  readonly label: string
  readonly default: boolean
}

/** An enumeration parameter with a fixed set of string options. */
export interface EnumParam {
  readonly type: 'enum'
  readonly key: string
  readonly label: string
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>
  readonly default: string
}

/** A 2D vector parameter with optional per-axis constraints. */
export interface Vector2Param {
  readonly type: 'vector2'
  readonly key: string
  readonly label: string
  readonly default: Vector2
  readonly min?: Vector2
  readonly max?: Vector2
}

/** Union of all supported parameter definition types. */
export type ParameterDefinition = NumberParam | BooleanParam | EnumParam | Vector2Param

/** The runtime value type that corresponds to each parameter kind. */
export type ParamValueType<T extends ParameterDefinition> = T extends NumberParam
  ? number
  : T extends BooleanParam
    ? boolean
    : T extends EnumParam
      ? string
      : T extends Vector2Param
        ? Vector2
        : never

/** A record mapping parameter keys to their runtime values. */
export type ParamValues = Record<string, number | boolean | string | Vector2>

// ---------------------------------------------------------------------------
// Physics State
// ---------------------------------------------------------------------------

/**
 * Generic physics state container. Episodes extend this with their own
 * domain-specific data. The engine treats it as opaque — only the episode's
 * `update` function knows the internal structure.
 */
export type PhysicsState = Record<string, unknown>

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** Information about the current viewport / camera. */
export interface ViewportTransform {
  /** Offset in screen pixels from canvas origin to world origin. */
  readonly offsetX: number
  readonly offsetY: number
  /** Pixels per world unit. */
  readonly scale: number
}

/** Context passed to every render-layer draw function. */
export interface RenderContext {
  /** The 2D drawing context of the canvas. */
  readonly ctx: CanvasRenderingContext2D
  /** Current viewport transform. */
  readonly viewport: ViewportTransform
  /** Canvas width in CSS pixels. */
  readonly width: number
  /** Canvas height in CSS pixels. */
  readonly height: number
  /** Current simulation time in seconds. */
  readonly simulationTime: number
  /** Wall-clock delta since last render in seconds. */
  readonly deltaTime: number
}

/** A single render layer registered with the renderer. */
export interface RenderLayer {
  readonly name: string
  readonly zIndex: number
  readonly render: (ctx: RenderContext, state: PhysicsState, params: ParamValues) => void
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

/** Maps a named action to one or more physical inputs. */
export interface InputBinding {
  readonly action: string
  readonly keys?: ReadonlyArray<string>
  readonly mouse?: string
  readonly touch?: string
}

/** Snapshot of which actions are currently active. */
export interface InputState {
  /** Set of action names whose key/button is currently held down. */
  readonly actionsHeld: ReadonlySet<string>
  /** Actions triggered this frame (press events). */
  readonly actionsPressed: ReadonlyArray<string>
  /** Current pointer position in screen pixels, or null if no pointer. */
  readonly pointerScreen: Vector2 | null
  /** Current pointer position in world coordinates, or null. */
  readonly pointerWorld: Vector2 | null
}

// ---------------------------------------------------------------------------
// Mission
// ---------------------------------------------------------------------------

/** Status of a single objective within a mission. */
export type ObjectiveStatus = 'pending' | 'completed' | 'failed'

/** A single objective that the player must accomplish. */
export interface MissionObjective {
  readonly id: string
  readonly label: string
  readonly status: ObjectiveStatus
}

/** High-level mission phase. */
export type MissionPhase = 'briefing' | 'active' | 'success' | 'failed'

/** Definition of a mission provided by an episode. */
export interface MissionDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly objectives: ReadonlyArray<{
    readonly id: string
    readonly label: string
  }>
  /** Called every physics tick; returns updated objective statuses. */
  readonly evaluate: (
    state: PhysicsState,
    params: ParamValues,
    simulationTime: number,
  ) => ReadonlyArray<{ id: string; status: ObjectiveStatus }>
  /** Optional time limit in simulation seconds. */
  readonly timeLimit?: number
}

/** Runtime state of the mission system, exposed to React via hooks. */
export interface MissionState {
  readonly phase: MissionPhase
  readonly activeMissionId: string | null
  readonly objectives: ReadonlyArray<MissionObjective>
  readonly elapsedTime: number
}

// ---------------------------------------------------------------------------
// Engine Configuration
// ---------------------------------------------------------------------------

/** Configuration for the simulation engine, with sensible defaults. */
export interface EngineConfig {
  /** Fixed physics timestep in seconds. Default 1/60. */
  readonly fixedTimestep: number
  /** Maximum physics ticks per frame to prevent spiral of death. Default 10. */
  readonly maxTicksPerFrame: number
  /** Target frame rate for performance monitoring. Default 30. */
  readonly targetFps: number
}

/** Default engine configuration values. */
export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  fixedTimestep: 1 / 60,
  maxTicksPerFrame: 10,
  targetFps: 30,
} as const

// ---------------------------------------------------------------------------
// Simulation State (top-level snapshot for React)
// ---------------------------------------------------------------------------

/** Top-level simulation state snapshot exposed to React hooks. */
export interface SimulationState {
  readonly running: boolean
  readonly paused: boolean
  readonly simulationTime: number
  readonly speedMultiplier: number
  readonly fps: number
  readonly physicsState: PhysicsState
  readonly params: ParamValues
  readonly missionState: MissionState
}

// ---------------------------------------------------------------------------
// Episode Definition
// ---------------------------------------------------------------------------

/** The contract every episode must implement. */
export interface EpisodeDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly accentColor: string

  readonly parameters: ReadonlyArray<ParameterDefinition>
  readonly missions: ReadonlyArray<MissionDefinition>

  /** Register layers, set up episode-specific resources. */
  init(engine: SimulationEngineInterface): void
  /** Return the starting physics state. */
  createInitialState(): PhysicsState
  /** Pure update: current state in, next state out (fixed timestep dt). */
  update(state: PhysicsState, params: ParamValues, dt: number): PhysicsState
  /** Draw to canvas using the provided render context. */
  render(ctx: RenderContext, state: PhysicsState, params: ParamValues): void
  /** Release resources, remove event listeners. */
  cleanup(): void
}

// ---------------------------------------------------------------------------
// Engine interface (for episode init)
// ---------------------------------------------------------------------------

/** Public interface of the simulation engine that episodes interact with. */
export interface SimulationEngineInterface {
  readonly config: EngineConfig
  addRenderLayer(name: string, zIndex: number, render: RenderLayer['render']): void
  removeRenderLayer(name: string): void
  getParameterValue(key: string): number | boolean | string | Vector2 | undefined
  setParameterValue(key: string, value: number | boolean | string | Vector2): void
}

// ---------------------------------------------------------------------------
// Subscription helper type
// ---------------------------------------------------------------------------

/** A function that unsubscribes from a subscription. */
export type Unsubscribe = () => void

/** Generic subscription store interface compatible with useSyncExternalStore. */
export interface Subscribable<T> {
  subscribe(listener: () => void): Unsubscribe
  getSnapshot(): T
}
