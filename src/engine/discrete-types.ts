/**
 * Type definitions for discrete simulation modes.
 *
 * Defines the contracts for step-based, event-driven (state machine),
 * and turn-based simulation engines that complement the existing
 * continuous physics loop.
 */

import type { ParamValues, PhysicsState, MissionDefinition, ParameterDefinition } from './types.ts'

// ---------------------------------------------------------------------------
// Step Function
// ---------------------------------------------------------------------------

/**
 * A pure function that advances discrete state by one step.
 * Receives the current state and parameter values, returns next state.
 */
export type StepFunction<S> = (state: S, params: ParamValues) => S

// ---------------------------------------------------------------------------
// State Machine Types
// ---------------------------------------------------------------------------

/** A guard predicate that determines if a transition is allowed. */
export type GuardFn<S, E> = (state: S, event: E) => boolean

/** An action function invoked on state entry, exit, or during a transition. */
export type ActionFn<S> = (state: S) => void

/** A single transition in the state machine. */
export interface StateMachineTransition<S extends string, E extends string> {
  readonly from: S
  readonly to: S
  readonly on: E
  readonly guard?: GuardFn<S, E>
}

/** Configuration for a generic finite state machine. */
export interface StateMachineConfig<S extends string, E extends string> {
  readonly initialState: S
  readonly transitions: ReadonlyArray<StateMachineTransition<S, E>>
  /** Actions invoked when entering a state. */
  readonly onEntry?: Partial<Record<S, ActionFn<S>>>
  /** Actions invoked when exiting a state. */
  readonly onExit?: Partial<Record<S, ActionFn<S>>>
}

// ---------------------------------------------------------------------------
// Turn-Based Types
// ---------------------------------------------------------------------------

/** The ordering strategy for turn progression. */
export type TurnOrder = 'sequential' | 'priority'

/** Definition of an actor participating in turn-based simulation. */
export interface ActorDefinition {
  readonly id: string
  readonly name: string
  /** Priority value (lower = earlier). Used when TurnOrder is 'priority'. */
  readonly priority?: number
}

/** An action submitted by an actor during their turn. */
export interface TurnAction {
  readonly actorId: string
  readonly type: string
  readonly payload: Record<string, unknown>
}

/** A validator that determines if an action is allowed for the current turn. */
export type ActionValidator = (action: TurnAction, actorId: string) => boolean

/** Configuration for turn-based simulations. */
export interface TurnConfig {
  readonly actors: ReadonlyArray<ActorDefinition>
  readonly order: TurnOrder
  readonly actionValidator?: ActionValidator
}

// ---------------------------------------------------------------------------
// Discrete Simulation Mode
// ---------------------------------------------------------------------------

/** The simulation mode discriminator. */
export type DiscreteMode = 'step' | 'event-driven' | 'turn-based'

/** Configuration for the discrete simulation engine. */
export interface DiscreteEngineConfig<S = Record<string, unknown>> {
  readonly mode: DiscreteMode
  readonly initialState: S
  readonly parameters?: ReadonlyArray<ParameterDefinition>
  readonly missions?: ReadonlyArray<MissionDefinition>
  /** Step function for step-based mode. */
  readonly stepFn?: StepFunction<S>
  /** State machine config for event-driven mode. */
  readonly stateMachineConfig?: StateMachineConfig<string, string>
  /** Turn config for turn-based mode. */
  readonly turnConfig?: TurnConfig
  /** Auto-step interval in milliseconds (step-based mode only). */
  readonly autoStepInterval?: number
  /** Maximum number of steps to keep in history. 0 = unlimited. Default 1000. */
  readonly maxHistoryLength?: number
}

// ---------------------------------------------------------------------------
// Discrete Simulation State (snapshot for React)
// ---------------------------------------------------------------------------

/** Snapshot of discrete simulation state exposed to React hooks. */
export interface DiscreteSimulationState<S = Record<string, unknown>> {
  readonly mode: DiscreteMode
  readonly state: S
  readonly stepCount: number
  readonly params: ParamValues
  readonly history: ReadonlyArray<S>
  readonly autoStepping: boolean
  /** Current state machine state (event-driven mode). */
  readonly machineState: string | null
  /** Current actor whose turn it is (turn-based mode). */
  readonly currentActorId: string | null
  /** Current turn number (turn-based mode). */
  readonly turnNumber: number
  /** Mission state passthrough. */
  readonly missionState: PhysicsState
}
