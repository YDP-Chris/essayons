/**
 * Generic finite state machine for event-driven simulations.
 *
 * Supports typed states and events, guard conditions on transitions,
 * and entry/exit actions. Implements the Subscribable pattern so React
 * can subscribe to state changes via useSyncExternalStore.
 */

import type { Subscribable, Unsubscribe } from './types.ts'
import type { StateMachineConfig, StateMachineTransition } from './discrete-types.ts'

/** Snapshot of state machine state for external consumers. */
export interface StateMachineSnapshot<S extends string> {
  readonly currentState: S
  readonly previousState: S | null
  readonly transitionCount: number
  readonly history: ReadonlyArray<S>
}

export class StateMachine<S extends string, E extends string> implements Subscribable<
  StateMachineSnapshot<S>
> {
  private _currentState: S
  private _previousState: S | null = null
  private _transitionCount = 0
  private _history: S[] = []
  private readonly _transitions: ReadonlyArray<StateMachineTransition<S, E>>
  private readonly _onEntry: Partial<Record<S, (state: S) => void>>
  private readonly _onExit: Partial<Record<S, (state: S) => void>>
  private readonly _listeners: Set<() => void> = new Set()
  private _snapshot: StateMachineSnapshot<S>
  private readonly _maxHistory: number

  constructor(config: StateMachineConfig<S, E>, maxHistory = 1000) {
    this._currentState = config.initialState
    this._transitions = config.transitions
    this._onEntry = (config.onEntry ?? {}) as Partial<Record<S, (state: S) => void>>
    this._onExit = (config.onExit ?? {}) as Partial<Record<S, (state: S) => void>>
    this._maxHistory = maxHistory
    this._history.push(config.initialState)
    this._snapshot = this._buildSnapshot()

    // Fire initial entry action
    const entryAction = this._onEntry[config.initialState]
    if (entryAction) {
      entryAction(config.initialState)
    }
  }

  // ---- Public API ----

  /** Get the current state. */
  get currentState(): S {
    return this._currentState
  }

  /** Get the previous state (null if no transition has occurred). */
  get previousState(): S | null {
    return this._previousState
  }

  /** Get the number of transitions that have occurred. */
  get transitionCount(): number {
    return this._transitionCount
  }

  /** Get the full state history. */
  get history(): ReadonlyArray<S> {
    return this._history
  }

  /**
   * Send an event to the state machine, triggering a transition if one
   * matches and its guard (if any) allows it.
   *
   * Returns true if a transition was taken, false otherwise.
   */
  send(event: E): boolean {
    const transition = this._findTransition(event)
    if (!transition) return false

    // Exit action for current state
    const exitAction = this._onExit[this._currentState]
    if (exitAction) {
      exitAction(this._currentState)
    }

    // Transition
    this._previousState = this._currentState
    this._currentState = transition.to
    this._transitionCount++
    this._history.push(transition.to)

    // Trim history if needed
    if (this._maxHistory > 0 && this._history.length > this._maxHistory) {
      this._history = this._history.slice(-this._maxHistory)
    }

    // Entry action for new state
    const entryAction = this._onEntry[this._currentState]
    if (entryAction) {
      entryAction(this._currentState)
    }

    this._notify()
    return true
  }

  /**
   * Check if an event can trigger a transition from the current state.
   * Evaluates guard conditions.
   */
  can(event: E): boolean {
    return this._findTransition(event) !== null
  }

  /**
   * Get all events that are valid from the current state
   * (transitions exist and guards pass).
   */
  getAvailableEvents(): ReadonlyArray<E> {
    const events = new Set<E>()
    for (const t of this._transitions) {
      if (t.from === this._currentState) {
        if (!t.guard || t.guard(this._currentState, t.on)) {
          events.add(t.on)
        }
      }
    }
    return Array.from(events)
  }

  /** Reset the state machine to its initial state. */
  reset(initialState: S): void {
    // Exit current state
    const exitAction = this._onExit[this._currentState]
    if (exitAction) {
      exitAction(this._currentState)
    }

    this._currentState = initialState
    this._previousState = null
    this._transitionCount = 0
    this._history = [initialState]

    // Enter initial state
    const entryAction = this._onEntry[initialState]
    if (entryAction) {
      entryAction(initialState)
    }

    this._notify()
  }

  // ---- Subscribable implementation ----

  subscribe(listener: () => void): Unsubscribe {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot(): StateMachineSnapshot<S> {
    return this._snapshot
  }

  // ---- Internals ----

  private _findTransition(event: E): StateMachineTransition<S, E> | null {
    for (const t of this._transitions) {
      if (t.from === this._currentState && t.on === event) {
        if (!t.guard || t.guard(this._currentState, event)) {
          return t
        }
      }
    }
    return null
  }

  private _buildSnapshot(): StateMachineSnapshot<S> {
    return {
      currentState: this._currentState,
      previousState: this._previousState,
      transitionCount: this._transitionCount,
      history: [...this._history],
    }
  }

  private _notify(): void {
    this._snapshot = this._buildSnapshot()
    for (const listener of this._listeners) {
      listener()
    }
  }
}
