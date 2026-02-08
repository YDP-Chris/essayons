/**
 * Discrete simulation engine for non-physics domains.
 *
 * Unlike the continuous SimulationEngine which runs a fixed-timestep
 * physics loop via requestAnimationFrame, this engine advances state
 * explicitly through one of three modes:
 *
 * - **Step-based**: User manually clicks "Next Step" or enables auto-step.
 *   Each step applies a pure step function to produce next state.
 *   Ideal for economics rounds, biology generations, etc.
 *
 * - **Event-driven**: A finite state machine with transitions triggered
 *   by events/decisions. No automatic time progression.
 *   Ideal for civics, branching history narratives.
 *
 * - **Turn-based**: Multiple actors take turns submitting actions.
 *   Each turn advances the simulation state.
 *   Ideal for game theory, negotiations, multi-agent scenarios.
 *
 * Integrates with ParameterSystem for parameters, CanvasRenderer for
 * visualization, and MissionManager for objectives. Implements the
 * Subscribable<T> pattern for React integration.
 */

import type {
  PhysicsState,
  RenderLayer,
  SimulationEngineInterface,
  Subscribable,
  Unsubscribe,
  Vector2,
  EngineConfig,
} from './types.ts'
import { DEFAULT_ENGINE_CONFIG } from './types.ts'
import { ParameterSystem } from './ParameterSystem.ts'
import { CanvasRenderer } from './CanvasRenderer.ts'
import { MissionManager } from './MissionManager.ts'
import { StateMachine } from './StateMachine.ts'
import { TurnManager } from './TurnManager.ts'
import type {
  DiscreteEngineConfig,
  DiscreteSimulationState,
  StepFunction,
  TurnAction,
} from './discrete-types.ts'

/** Default maximum history length. */
const DEFAULT_MAX_HISTORY = 1000

export class DiscreteEngine<S = Record<string, unknown>>
  implements SimulationEngineInterface, Subscribable<DiscreteSimulationState<S>>
{
  readonly config: EngineConfig

  // Subsystems
  readonly parameters: ParameterSystem
  readonly renderer: CanvasRenderer
  readonly missions: MissionManager
  readonly stateMachine: StateMachine<string, string> | null
  readonly turnManager: TurnManager | null

  // Discrete engine state
  private _mode: DiscreteEngineConfig<S>['mode']
  private _state: S
  private _initialState: S
  private _stepCount = 0
  private _history: S[] = []
  private _autoStepping = false
  private _autoStepTimerId: ReturnType<typeof setInterval> | null = null
  private _autoStepInterval: number
  private _maxHistoryLength: number

  // Step function for step-based mode
  private _stepFn: StepFunction<S> | null

  // Subscription
  private readonly _listeners: Set<() => void> = new Set()
  private _snapshot: DiscreteSimulationState<S>
  private readonly _subSystemUnsubs: Unsubscribe[] = []

  constructor(discreteConfig: DiscreteEngineConfig<S>, engineConfig?: Partial<EngineConfig>) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...engineConfig }
    this._mode = discreteConfig.mode
    this._state = discreteConfig.initialState
    this._initialState = discreteConfig.initialState
    this._stepFn = discreteConfig.stepFn ?? null
    this._autoStepInterval = discreteConfig.autoStepInterval ?? 1000
    this._maxHistoryLength = discreteConfig.maxHistoryLength ?? DEFAULT_MAX_HISTORY

    // Initialize subsystems
    this.parameters = new ParameterSystem()
    this.renderer = new CanvasRenderer()
    this.missions = new MissionManager()

    // Register parameters if provided
    if (discreteConfig.parameters && discreteConfig.parameters.length > 0) {
      this.parameters.register('discrete', discreteConfig.parameters)
    }

    // Register missions if provided
    if (discreteConfig.missions && discreteConfig.missions.length > 0) {
      this.missions.registerMissions(discreteConfig.missions)
      const firstMission = discreteConfig.missions[0]
      if (firstMission) {
        this.missions.startMission(firstMission.id)
      }
    }

    // Initialize state machine for event-driven mode
    if (discreteConfig.mode === 'event-driven' && discreteConfig.stateMachineConfig) {
      this.stateMachine = new StateMachine(
        discreteConfig.stateMachineConfig,
        this._maxHistoryLength,
      )
    } else {
      this.stateMachine = null
    }

    // Initialize turn manager for turn-based mode
    if (discreteConfig.mode === 'turn-based' && discreteConfig.turnConfig) {
      this.turnManager = new TurnManager(this._maxHistoryLength)
      this.turnManager.configure(discreteConfig.turnConfig)
    } else {
      this.turnManager = null
    }

    // Push initial state to history
    this._history.push(this._state)

    // Build initial snapshot
    this._snapshot = this._buildSnapshot()

    // Forward subsystem notifications
    this._subSystemUnsubs.push(
      this.parameters.subscribe(() => this._notify()),
      this.missions.subscribe(() => this._notify()),
    )
    if (this.stateMachine) {
      this._subSystemUnsubs.push(this.stateMachine.subscribe(() => this._notify()))
    }
    if (this.turnManager) {
      this._subSystemUnsubs.push(this.turnManager.subscribe(() => this._notify()))
    }
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

  // ---- State Access ----

  /** Get the current simulation state. */
  getState(): S {
    return this._state
  }

  /** Set the simulation state directly. */
  setState(state: S): void {
    this._state = state
    this._notify()
    this._renderCurrentState()
  }

  /** Get the current step count. */
  get stepCount(): number {
    return this._stepCount
  }

  /** Get the state history. */
  get history(): ReadonlyArray<S> {
    return this._history
  }

  /** Get the current mode. */
  get mode(): DiscreteEngineConfig<S>['mode'] {
    return this._mode
  }

  /** Whether auto-stepping is active. */
  get autoStepping(): boolean {
    return this._autoStepping
  }

  // ---- Step-based Mode ----

  /**
   * Advance the simulation by one step.
   * In step-based mode, applies the step function.
   * In turn-based mode, also increments step count after a full round.
   */
  step(): S {
    if (this._mode === 'step' && this._stepFn) {
      const params = this.parameters.getAll()
      this._state = this._stepFn(this._state, params)
      this._stepCount++
      this._pushHistory(this._state)
      this._evaluateMissions()
      this._notify()
      this._renderCurrentState()
    }
    return this._state
  }

  /** Start auto-stepping at the configured interval. */
  startAutoStep(): void {
    if (this._autoStepping) return
    if (this._mode !== 'step') return

    this._autoStepping = true
    this._autoStepTimerId = setInterval(() => {
      this.step()
    }, this._autoStepInterval)
    this._notify()
  }

  /** Stop auto-stepping. */
  stopAutoStep(): void {
    if (!this._autoStepping) return
    this._autoStepping = false
    if (this._autoStepTimerId !== null) {
      clearInterval(this._autoStepTimerId)
      this._autoStepTimerId = null
    }
    this._notify()
  }

  /** Set the auto-step interval in milliseconds. */
  setAutoStepInterval(ms: number): void {
    this._autoStepInterval = Math.max(50, ms) // Minimum 50ms
    if (this._autoStepping) {
      // Restart with new interval
      this.stopAutoStep()
      this.startAutoStep()
    }
  }

  // ---- Event-driven Mode ----

  /**
   * Send an event to the state machine (event-driven mode).
   * Returns true if a transition occurred.
   */
  sendEvent(event: string): boolean {
    if (this._mode !== 'event-driven' || !this.stateMachine) return false

    const transitioned = this.stateMachine.send(event)
    if (transitioned) {
      this._stepCount++
      this._pushHistory(this._state)
      this._evaluateMissions()
      this._notify()
      this._renderCurrentState()
    }
    return transitioned
  }

  /**
   * Get available events from the current state machine state.
   */
  getAvailableEvents(): ReadonlyArray<string> {
    if (!this.stateMachine) return []
    return this.stateMachine.getAvailableEvents()
  }

  // ---- Turn-based Mode ----

  /**
   * Submit an action for the current actor's turn (turn-based mode).
   * Returns true if the action was accepted.
   */
  submitTurnAction(action: TurnAction): boolean {
    if (this._mode !== 'turn-based' || !this.turnManager) return false
    return this.turnManager.submitAction(action)
  }

  /**
   * End the current actor's turn and advance to the next actor.
   * If a step function is provided, it is applied when a full round completes.
   * Returns the next actor's ID, or null if no actors.
   */
  endTurn(): string | null {
    if (this._mode !== 'turn-based' || !this.turnManager) return null

    const previousTurn = this.turnManager.turnNumber
    const nextActor = this.turnManager.endTurn()

    // If the turn number advanced, a full round completed
    if (this.turnManager.turnNumber > previousTurn) {
      if (this._stepFn) {
        const params = this.parameters.getAll()
        this._state = this._stepFn(this._state, params)
      }
      this._stepCount++
      this._pushHistory(this._state)
      this._evaluateMissions()
      this._renderCurrentState()
    }

    this._notify()
    return nextActor
  }

  // ---- Undo ----

  /**
   * Undo the last step by reverting to the previous state in history.
   * Returns true if undo was successful, false if no history to undo.
   */
  undo(): boolean {
    if (this._history.length <= 1) return false

    // Remove current state
    this._history.pop()

    // Restore previous state
    const previous = this._history[this._history.length - 1]
    if (previous === undefined) return false

    this._state = previous
    this._stepCount = Math.max(0, this._stepCount - 1)
    this._notify()
    this._renderCurrentState()
    return true
  }

  // ---- Reset ----

  /** Reset the simulation to its initial state. */
  reset(): void {
    this.stopAutoStep()
    this._state = this._initialState
    this._stepCount = 0
    this._history = [this._initialState]

    this.parameters.resetAllToDefaults()
    this.missions.reset()

    if (this.stateMachine) {
      // Re-read initial state from config used at construction
      this.stateMachine.reset(this.stateMachine.history[0] ?? this.stateMachine.currentState)
    }

    if (this.turnManager) {
      this.turnManager.reset()
    }

    this._notify()
    this._renderCurrentState()
  }

  // ---- Canvas ----

  /** Attach the engine to a canvas element. */
  attachCanvas(canvas: HTMLCanvasElement): void {
    this.renderer.attach(canvas)
    this._renderCurrentState()
  }

  /** Detach the engine from the canvas. */
  detachCanvas(): void {
    this.renderer.detach()
  }

  // ---- Cleanup ----

  /** Destroy the engine, cleaning up all resources. */
  destroy(): void {
    this.stopAutoStep()
    this.detachCanvas()
    this.parameters.clear()
    this.missions.clear()
    for (const unsub of this._subSystemUnsubs) {
      unsub()
    }
    this._listeners.clear()
  }

  // ---- Subscribable implementation ----

  subscribe(listener: () => void): Unsubscribe {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot(): DiscreteSimulationState<S> {
    return this._snapshot
  }

  // ---- Internals ----

  private _pushHistory(state: S): void {
    this._history.push(state)
    if (this._maxHistoryLength > 0 && this._history.length > this._maxHistoryLength) {
      this._history = this._history.slice(-this._maxHistoryLength)
    }
  }

  private _evaluateMissions(): void {
    const params = this.parameters.getAll()
    // Use the discrete state as the PhysicsState for mission evaluation
    const stateAsPhysics = this._state as unknown as PhysicsState
    this.missions.evaluate(stateAsPhysics, params, this._stepCount)
  }

  private _renderCurrentState(): void {
    const params = this.parameters.getAll()
    const stateAsPhysics = this._state as unknown as PhysicsState
    this.renderer.render(stateAsPhysics, params, this._stepCount, 0)
  }

  private _buildSnapshot(): DiscreteSimulationState<S> {
    return {
      mode: this._mode,
      state: this._state,
      stepCount: this._stepCount,
      params: this.parameters.getAll(),
      history: [...this._history],
      autoStepping: this._autoStepping,
      machineState: this.stateMachine?.currentState ?? null,
      currentActorId: this.turnManager?.currentActorId ?? null,
      turnNumber: this.turnManager?.turnNumber ?? 0,
      missionState: this.missions.getSnapshot() as unknown as PhysicsState,
    }
  }

  private _notify(): void {
    this._snapshot = this._buildSnapshot()
    for (const listener of this._listeners) {
      listener()
    }
  }
}
