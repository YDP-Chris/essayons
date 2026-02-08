/**
 * State machine for mission lifecycle management.
 *
 * Manages missions through phases: BRIEFING -> ACTIVE -> SUCCESS | FAILED.
 * Evaluates objectives each tick and tracks their status.
 * Exposes a subscribable interface for React integration.
 */

import type {
  MissionDefinition,
  MissionState,
  MissionPhase,
  MissionObjective,
  ObjectiveStatus,
  PhysicsState,
  ParamValues,
  Subscribable,
  Unsubscribe,
} from './types.ts'

const INITIAL_MISSION_STATE: MissionState = {
  phase: 'briefing',
  activeMissionId: null,
  objectives: [],
  elapsedTime: 0,
}

export class MissionManager implements Subscribable<MissionState> {
  private _missions: Map<string, MissionDefinition> = new Map()
  private _phase: MissionPhase = 'briefing'
  private _activeMissionId: string | null = null
  private _objectives: MissionObjective[] = []
  private _elapsedTime = 0
  private _listeners: Set<() => void> = new Set()
  private _snapshot: MissionState = INITIAL_MISSION_STATE

  // ---- Registration ----

  /** Register mission definitions from an episode. */
  registerMissions(missions: ReadonlyArray<MissionDefinition>): void {
    this._missions.clear()
    for (const mission of missions) {
      this._missions.set(mission.id, mission)
    }
  }

  /** Clear all missions and reset state. */
  clear(): void {
    this._missions.clear()
    this._phase = 'briefing'
    this._activeMissionId = null
    this._objectives = []
    this._elapsedTime = 0
    this._notify()
  }

  // ---- Mission Control ----

  /** Start a mission by ID, transitioning from BRIEFING to ACTIVE. */
  startMission(missionId: string): void {
    const mission = this._missions.get(missionId)
    if (!mission) return

    this._activeMissionId = missionId
    this._phase = 'active'
    this._elapsedTime = 0
    this._objectives = mission.objectives.map((obj) => ({
      id: obj.id,
      label: obj.label,
      status: 'pending' as ObjectiveStatus,
    }))
    this._notify()
  }

  /** Reset the mission manager to its initial state. */
  reset(): void {
    this._phase = 'briefing'
    this._activeMissionId = null
    this._objectives = []
    this._elapsedTime = 0
    this._notify()
  }

  // ---- Evaluation ----

  /**
   * Evaluate mission objectives for the current tick.
   * Called each physics tick by the simulation engine.
   */
  evaluate(state: PhysicsState, params: ParamValues, simTime: number): void {
    if (this._phase !== 'active' || !this._activeMissionId) return

    const mission = this._missions.get(this._activeMissionId)
    if (!mission) return

    // Update elapsed time
    this._elapsedTime = simTime

    // Check time limit
    if (mission.timeLimit !== undefined && simTime >= mission.timeLimit) {
      // Fail any pending objectives
      this._objectives = this._objectives.map((obj) =>
        obj.status === 'pending' ? { ...obj, status: 'failed' as ObjectiveStatus } : obj,
      )
      this._phase = 'failed'
      this._notify()
      return
    }

    // Evaluate objectives
    const results = mission.evaluate(state, params, simTime)
    const resultMap = new Map<string, ObjectiveStatus>()
    for (const r of results) {
      resultMap.set(r.id, r.status)
    }

    this._objectives = this._objectives.map((obj) => {
      const newStatus = resultMap.get(obj.id)
      if (newStatus !== undefined && newStatus !== obj.status) {
        return { ...obj, status: newStatus }
      }
      return obj
    })

    // Check overall mission status
    const hasAnyFailed = this._objectives.some((o) => o.status === 'failed')
    const allCompleted = this._objectives.every((o) => o.status === 'completed')

    if (hasAnyFailed) {
      this._phase = 'failed'
    } else if (allCompleted) {
      this._phase = 'success'
    }

    this._notify()
  }

  // ---- Getters ----

  get phase(): MissionPhase {
    return this._phase
  }

  get activeMissionId(): string | null {
    return this._activeMissionId
  }

  // ---- Subscribable implementation ----

  subscribe(listener: () => void): Unsubscribe {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot(): MissionState {
    return this._snapshot
  }

  // ---- Internals ----

  private _notify(): void {
    this._snapshot = {
      phase: this._phase,
      activeMissionId: this._activeMissionId,
      objectives: [...this._objectives],
      elapsedTime: this._elapsedTime,
    }
    for (const listener of this._listeners) {
      listener()
    }
  }
}
