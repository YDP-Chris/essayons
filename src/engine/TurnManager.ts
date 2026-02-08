/**
 * Turn manager for turn-based discrete simulations.
 *
 * Manages actor registration, turn order (sequential or priority-based),
 * action validation, and turn advancement. Implements the Subscribable
 * pattern for React integration via useSyncExternalStore.
 */

import type { Subscribable, Unsubscribe } from './types.ts'
import type { ActorDefinition, TurnAction, TurnConfig, TurnOrder } from './discrete-types.ts'

/** Snapshot of turn manager state for external consumers. */
export interface TurnManagerSnapshot {
  readonly currentActorId: string | null
  readonly currentActorIndex: number
  readonly turnNumber: number
  readonly actorIds: ReadonlyArray<string>
  readonly actorNames: ReadonlyArray<string>
  readonly actionsThisTurn: ReadonlyArray<TurnAction>
  readonly actionHistory: ReadonlyArray<{
    readonly turnNumber: number
    readonly actions: ReadonlyArray<TurnAction>
  }>
}

export class TurnManager implements Subscribable<TurnManagerSnapshot> {
  private _actors: ActorDefinition[] = []
  private _orderedActorIds: string[] = []
  private _currentActorIndex = 0
  private _turnNumber = 0
  private _order: TurnOrder = 'sequential'
  private _actionValidator: ((action: TurnAction, actorId: string) => boolean) | null = null
  private _actionsThisTurn: TurnAction[] = []
  private _actionHistory: Array<{
    readonly turnNumber: number
    readonly actions: ReadonlyArray<TurnAction>
  }> = []

  private readonly _listeners: Set<() => void> = new Set()
  private _snapshot: TurnManagerSnapshot
  private readonly _maxHistory: number

  constructor(maxHistory = 1000) {
    this._maxHistory = maxHistory
    this._snapshot = this._buildSnapshot()
  }

  // ---- Configuration ----

  /** Configure the turn manager from a TurnConfig. */
  configure(config: TurnConfig): void {
    this._actors = [...config.actors]
    this._order = config.order
    this._actionValidator = config.actionValidator ?? null
    this._computeOrder()
    this._currentActorIndex = 0
    this._turnNumber = 0
    this._actionsThisTurn = []
    this._actionHistory = []
    this._notify()
  }

  // ---- Actor Management ----

  /** Register a new actor. */
  addActor(actor: ActorDefinition): void {
    // Prevent duplicates
    if (this._actors.some((a) => a.id === actor.id)) return
    this._actors.push(actor)
    this._computeOrder()
    this._notify()
  }

  /** Remove an actor by ID. */
  removeActor(actorId: string): void {
    const removed = this._actors.findIndex((a) => a.id === actorId)
    if (removed === -1) return
    this._actors.splice(removed, 1)
    this._computeOrder()

    // Adjust current index if needed
    if (this._orderedActorIds.length === 0) {
      this._currentActorIndex = 0
    } else if (this._currentActorIndex >= this._orderedActorIds.length) {
      this._currentActorIndex = 0
    }

    this._notify()
  }

  /** Get all registered actors. */
  get actors(): ReadonlyArray<ActorDefinition> {
    return this._actors
  }

  /** Get the current actor whose turn it is. */
  get currentActorId(): string | null {
    return this._orderedActorIds[this._currentActorIndex] ?? null
  }

  /** Get the current turn number. */
  get turnNumber(): number {
    return this._turnNumber
  }

  // ---- Turn Management ----

  /**
   * Submit an action for the current actor's turn.
   * Returns true if the action was accepted, false if validation failed.
   */
  submitAction(action: TurnAction): boolean {
    const currentActor = this.currentActorId
    if (!currentActor) return false

    // Action must be from the current actor
    if (action.actorId !== currentActor) return false

    // Validate if validator is provided
    if (this._actionValidator && !this._actionValidator(action, currentActor)) {
      return false
    }

    this._actionsThisTurn.push(action)
    this._notify()
    return true
  }

  /**
   * End the current actor's turn and advance to the next actor.
   * If all actors have taken their turn, advances the turn number
   * and resets to the first actor.
   *
   * Returns the ID of the new current actor, or null if no actors.
   */
  endTurn(): string | null {
    if (this._orderedActorIds.length === 0) return null

    // Archive this turn's actions
    if (this._actionsThisTurn.length > 0) {
      this._actionHistory.push({
        turnNumber: this._turnNumber,
        actions: [...this._actionsThisTurn],
      })
      // Trim history
      if (this._maxHistory > 0 && this._actionHistory.length > this._maxHistory) {
        this._actionHistory = this._actionHistory.slice(-this._maxHistory)
      }
    }

    this._actionsThisTurn = []
    this._currentActorIndex++

    // If we've gone through all actors, advance turn number
    if (this._currentActorIndex >= this._orderedActorIds.length) {
      this._currentActorIndex = 0
      this._turnNumber++
    }

    this._notify()
    return this.currentActorId
  }

  /**
   * Check if an action would be valid for the current actor.
   */
  canSubmitAction(action: TurnAction): boolean {
    const currentActor = this.currentActorId
    if (!currentActor) return false
    if (action.actorId !== currentActor) return false
    if (this._actionValidator && !this._actionValidator(action, currentActor)) {
      return false
    }
    return true
  }

  /** Get actions submitted during the current turn. */
  get actionsThisTurn(): ReadonlyArray<TurnAction> {
    return this._actionsThisTurn
  }

  /** Get the full action history. */
  get actionHistory(): ReadonlyArray<{
    readonly turnNumber: number
    readonly actions: ReadonlyArray<TurnAction>
  }> {
    return this._actionHistory
  }

  /** Reset the turn manager to its initial state. */
  reset(): void {
    this._currentActorIndex = 0
    this._turnNumber = 0
    this._actionsThisTurn = []
    this._actionHistory = []
    this._notify()
  }

  /** Clear all actors and reset. */
  clear(): void {
    this._actors = []
    this._orderedActorIds = []
    this._currentActorIndex = 0
    this._turnNumber = 0
    this._actionsThisTurn = []
    this._actionHistory = []
    this._actionValidator = null
    this._notify()
  }

  // ---- Subscribable implementation ----

  subscribe(listener: () => void): Unsubscribe {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot(): TurnManagerSnapshot {
    return this._snapshot
  }

  // ---- Internals ----

  private _computeOrder(): void {
    if (this._order === 'priority') {
      // Sort by priority ascending (lower = earlier)
      const sorted = [...this._actors].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      this._orderedActorIds = sorted.map((a) => a.id)
    } else {
      // Sequential: registration order
      this._orderedActorIds = this._actors.map((a) => a.id)
    }
  }

  private _buildSnapshot(): TurnManagerSnapshot {
    return {
      currentActorId: this.currentActorId,
      currentActorIndex: this._currentActorIndex,
      turnNumber: this._turnNumber,
      actorIds: [...this._orderedActorIds],
      actorNames: this._actors.map((a) => a.name),
      actionsThisTurn: [...this._actionsThisTurn],
      actionHistory: [...this._actionHistory],
    }
  }

  private _notify(): void {
    this._snapshot = this._buildSnapshot()
    for (const listener of this._listeners) {
      listener()
    }
  }
}
