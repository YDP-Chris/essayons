/**
 * Main simulation engine that ties together all subsystems.
 *
 * Implements a fixed-timestep game loop using requestAnimationFrame with
 * an accumulator pattern. Owns TimeController, ParameterSystem,
 * CanvasRenderer, InputHandler, and MissionManager.
 */

import type {
  EngineConfig,
  EpisodeDefinition,
  PhysicsState,
  RenderLayer,
  SimulationEngineInterface,
  SimulationState,
  Subscribable,
  Unsubscribe,
  Vector2,
} from './types.ts'
import { DEFAULT_ENGINE_CONFIG } from './types.ts'
import { TimeController } from './TimeController.ts'
import { ParameterSystem } from './ParameterSystem.ts'
import { CanvasRenderer } from './CanvasRenderer.ts'
import { InputHandler } from './InputHandler.ts'
import { MissionManager } from './MissionManager.ts'
import { QualityMonitor } from './adaptive-quality.ts'

/** Number of frames to average for FPS tracking. */
const FPS_SAMPLE_COUNT = 60

export class SimulationEngine implements SimulationEngineInterface, Subscribable<SimulationState> {
  readonly config: EngineConfig
  readonly time: TimeController
  readonly parameters: ParameterSystem
  readonly renderer: CanvasRenderer
  readonly input: InputHandler
  readonly missions: MissionManager
  readonly quality: QualityMonitor

  private _episode: EpisodeDefinition | null = null
  private _physicsState: PhysicsState = {}
  private _running = false
  private _rafId: number | null = null
  private _lastTimestamp: number | null = null
  private _accumulator = 0

  // FPS tracking
  private _frameTimes: number[] = []
  private _fps = 0

  // Subscription
  private _listeners: Set<() => void> = new Set()
  private _snapshot: SimulationState
  private _subSystemUnsubs: Array<Unsubscribe> = []

  constructor(config?: Partial<EngineConfig>) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config }
    this.time = new TimeController()
    this.parameters = new ParameterSystem()
    this.renderer = new CanvasRenderer()
    this.input = new InputHandler()
    this.missions = new MissionManager()
    this.quality = new QualityMonitor()

    this.input.setRenderer(this.renderer)
    this._snapshot = this._buildSnapshot()

    // Forward subsystem notifications so the engine snapshot stays fresh
    this._subSystemUnsubs.push(
      this.time.subscribe(() => this._notify()),
      this.parameters.subscribe(() => this._notify()),
      this.missions.subscribe(() => this._notify()),
    )
  }

  // ---- SimulationEngineInterface ----

  addRenderLayer(name: string, zIndex: number, render: RenderLayer['render']): void {
    this.renderer.addLayer(name, zIndex, render)
  }

  removeRenderLayer(name: string): void {
    this.renderer.removeLayer(name)
  }

  getParameterValue(key: string): number | boolean | string | Vector2 | undefined {
    return this.parameters.getValue(key)
  }

  setParameterValue(key: string, value: number | boolean | string | Vector2): void {
    this.parameters.setValue(key, value)
  }

  // ---- Episode Management ----

  /** Load an episode definition, initializing all subsystems. */
  loadEpisode(episode: EpisodeDefinition): void {
    // Clean up previous episode
    this._unloadEpisode()

    this._episode = episode

    // Register parameters
    this.parameters.register(episode.id, episode.parameters)

    // Register missions
    this.missions.registerMissions(episode.missions)

    // Start the first mission if available
    if (episode.missions.length > 0) {
      const firstMission = episode.missions[0]
      if (firstMission) {
        this.missions.startMission(firstMission.id)
      }
    }

    // Let the episode initialize (register render layers, etc.)
    episode.init(this)

    // Register the episode's own render function as a default layer
    this.renderer.addLayer('__episode__', 0, (ctx, state, params) => {
      episode.render(ctx, state, params)
    })

    // Create initial physics state
    this._physicsState = episode.createInitialState()

    this._notify()
  }

  /** Unload the current episode. */
  private _unloadEpisode(): void {
    if (this._episode) {
      this._episode.cleanup()
      this._episode = null
    }
    this._physicsState = {}
    this.parameters.clear()
    this.missions.clear()
  }

  // ---- Canvas ----

  /** Attach the engine to a canvas element. */
  attachCanvas(canvas: HTMLCanvasElement): void {
    this.renderer.attach(canvas)
    this.input.attach(canvas)
  }

  /** Detach the engine from the canvas. */
  detachCanvas(): void {
    this.renderer.detach()
    this.input.detach()
  }

  // ---- Game Loop ----

  /** Start the simulation loop. */
  start(): void {
    if (this._running) return
    this._running = true
    this._lastTimestamp = null
    this._accumulator = 0
    this._frameTimes = []
    this._rafId = requestAnimationFrame((ts) => this._loop(ts))
    this._notify()
  }

  /** Stop the simulation loop. */
  stop(): void {
    if (!this._running) return
    this._running = false
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
    this._lastTimestamp = null
    this._notify()
  }

  /** Reset the simulation to its initial state, preserving current params. */
  reset(): void {
    this.stop()
    this.time.reset()
    this._accumulator = 0
    this._frameTimes = []
    this._fps = 0
    this.quality.reset()

    if (this._episode) {
      this._physicsState = this._episode.createInitialState(this.parameters.getAll())
      this.missions.reset()

      // Restart first mission
      if (this._episode.missions.length > 0) {
        const firstMission = this._episode.missions[0]
        if (firstMission) {
          this.missions.startMission(firstMission.id)
        }
      }
    }

    this._notify()
  }

  /** Reinitialize the physics state with current param values. */
  reinitialize(): void {
    if (this._episode) {
      this._physicsState = this._episode.createInitialState(this.parameters.getAll())
      this.missions.reset()
      if (this._episode.missions.length > 0) {
        const firstMission = this._episode.missions[0]
        if (firstMission) {
          this.missions.startMission(firstMission.id)
        }
      }
      this._notify()
    }
  }

  /** Destroy the engine, cleaning up all resources. */
  destroy(): void {
    this.stop()
    this._unloadEpisode()
    this.detachCanvas()
    for (const unsub of this._subSystemUnsubs) {
      unsub()
    }
    this._subSystemUnsubs = []
    this._listeners.clear()
  }

  /** Whether the engine loop is currently running. */
  get running(): boolean {
    return this._running
  }

  /** Current frames per second (rolling average). */
  get fps(): number {
    return this._fps
  }

  /** Current physics state. */
  get physicsState(): PhysicsState {
    return this._physicsState
  }

  // ---- Main loop ----

  private _loop(timestamp: number): void {
    if (!this._running) return

    // Schedule next frame
    this._rafId = requestAnimationFrame((ts) => this._loop(ts))

    // Calculate wall-clock delta
    if (this._lastTimestamp === null) {
      this._lastTimestamp = timestamp
      return // Skip first frame to establish baseline
    }

    const wallDelta = (timestamp - this._lastTimestamp) / 1000 // ms -> seconds
    this._lastTimestamp = timestamp

    // Track FPS
    this._trackFps(wallDelta)

    // Feed quality monitor
    this.quality.recordFrame(wallDelta)

    // Advance time (applies speed multiplier, respects pause)
    const scaledDelta = this.time.advance(wallDelta)

    // Accumulate for fixed-timestep physics
    this._accumulator += scaledDelta

    // Consume accumulated time in fixed steps
    const dt = this.config.fixedTimestep
    let ticks = 0
    const maxTicks = this.config.maxTicksPerFrame

    while (this._accumulator >= dt && ticks < maxTicks) {
      if (this._episode) {
        const params = this.parameters.getAll()
        this._physicsState = this._episode.update(this._physicsState, params, dt)
        this.missions.evaluate(this._physicsState, params, this.time.simulationTime)
      }
      this._accumulator -= dt
      ticks++
    }

    // Prevent accumulator from growing unbounded (spiral of death protection)
    if (this._accumulator > dt * maxTicks) {
      this._accumulator = 0
    }

    // Render once per frame
    const params = this.parameters.getAll()
    this.renderer.render(this._physicsState, params, this.time.simulationTime, wallDelta)

    // Poll input
    this.input.poll()

    // Notify subscribers
    this.time.flush()
    this._notify()
  }

  // ---- FPS Tracking ----

  private _trackFps(wallDelta: number): void {
    this._frameTimes.push(wallDelta)
    if (this._frameTimes.length > FPS_SAMPLE_COUNT) {
      this._frameTimes.shift()
    }
    if (this._frameTimes.length > 0) {
      const avg = this._frameTimes.reduce((sum, t) => sum + t, 0) / this._frameTimes.length
      this._fps = avg > 0 ? 1 / avg : 0
    }
  }

  // ---- Subscribable implementation ----

  subscribe(listener: () => void): Unsubscribe {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot(): SimulationState {
    return this._snapshot
  }

  // ---- Internals ----

  private _buildSnapshot(): SimulationState {
    return {
      running: this._running,
      paused: this.time.paused,
      simulationTime: this.time.simulationTime,
      speedMultiplier: this.time.speedMultiplier,
      fps: this._fps,
      physicsState: this._physicsState,
      params: this.parameters.getAll(),
      missionState: this.missions.getSnapshot(),
    }
  }

  private _notify(): void {
    this._snapshot = this._buildSnapshot()
    for (const listener of this._listeners) {
      listener()
    }
  }
}
