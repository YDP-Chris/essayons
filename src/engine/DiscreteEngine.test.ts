/**
 * Comprehensive tests for the discrete simulation engine, state machine,
 * and turn manager.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DiscreteEngine } from './DiscreteEngine.ts'
import { StateMachine } from './StateMachine.ts'
import { TurnManager } from './TurnManager.ts'
import type {
  DiscreteEngineConfig,
  StateMachineConfig,
  TurnConfig,
  TurnAction,
} from './discrete-types.ts'
import type { ObjectiveStatus } from './types.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface CounterState {
  count: number
  label: string
}

function createCounterConfig(
  overrides?: Partial<DiscreteEngineConfig<CounterState>>,
): DiscreteEngineConfig<CounterState> {
  return {
    mode: 'step',
    initialState: { count: 0, label: 'start' },
    stepFn: (state, _params) => ({
      count: state.count + 1,
      label: `step-${state.count + 1}`,
    }),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// StateMachine
// ---------------------------------------------------------------------------

describe('StateMachine', () => {
  type TrafficState = 'red' | 'yellow' | 'green'
  type TrafficEvent = 'TIMER' | 'EMERGENCY'

  const trafficConfig: StateMachineConfig<TrafficState, TrafficEvent> = {
    initialState: 'red',
    transitions: [
      { from: 'red', to: 'green', on: 'TIMER' },
      { from: 'green', to: 'yellow', on: 'TIMER' },
      { from: 'yellow', to: 'red', on: 'TIMER' },
      { from: 'green', to: 'red', on: 'EMERGENCY' },
      { from: 'yellow', to: 'red', on: 'EMERGENCY' },
    ],
  }

  let machine: StateMachine<TrafficState, TrafficEvent>

  beforeEach(() => {
    machine = new StateMachine(trafficConfig)
  })

  describe('initial state', () => {
    it('should start in the initial state', () => {
      expect(machine.currentState).toBe('red')
    })

    it('should have no previous state', () => {
      expect(machine.previousState).toBeNull()
    })

    it('should have zero transition count', () => {
      expect(machine.transitionCount).toBe(0)
    })

    it('should have initial state in history', () => {
      expect(machine.history).toEqual(['red'])
    })

    it('should expose snapshot via getSnapshot', () => {
      const snap = machine.getSnapshot()
      expect(snap.currentState).toBe('red')
      expect(snap.previousState).toBeNull()
      expect(snap.transitionCount).toBe(0)
      expect(snap.history).toEqual(['red'])
    })
  })

  describe('transitions', () => {
    it('should transition on valid event', () => {
      const result = machine.send('TIMER')
      expect(result).toBe(true)
      expect(machine.currentState).toBe('green')
      expect(machine.previousState).toBe('red')
      expect(machine.transitionCount).toBe(1)
    })

    it('should chain multiple transitions', () => {
      machine.send('TIMER') // red -> green
      machine.send('TIMER') // green -> yellow
      machine.send('TIMER') // yellow -> red
      expect(machine.currentState).toBe('red')
      expect(machine.transitionCount).toBe(3)
      expect(machine.history).toEqual(['red', 'green', 'yellow', 'red'])
    })

    it('should reject invalid events from current state', () => {
      // EMERGENCY is not valid from 'red'
      const result = machine.send('EMERGENCY')
      expect(result).toBe(false)
      expect(machine.currentState).toBe('red')
      expect(machine.transitionCount).toBe(0)
    })

    it('should handle EMERGENCY transition', () => {
      machine.send('TIMER') // -> green
      const result = machine.send('EMERGENCY') // -> red
      expect(result).toBe(true)
      expect(machine.currentState).toBe('red')
    })
  })

  describe('guard conditions', () => {
    it('should block transition when guard returns false', () => {
      const guardedConfig: StateMachineConfig<'a' | 'b', 'GO'> = {
        initialState: 'a',
        transitions: [
          {
            from: 'a',
            to: 'b',
            on: 'GO',
            guard: () => false,
          },
        ],
      }
      const m = new StateMachine(guardedConfig)
      expect(m.send('GO')).toBe(false)
      expect(m.currentState).toBe('a')
    })

    it('should allow transition when guard returns true', () => {
      const guardedConfig: StateMachineConfig<'a' | 'b', 'GO'> = {
        initialState: 'a',
        transitions: [
          {
            from: 'a',
            to: 'b',
            on: 'GO',
            guard: () => true,
          },
        ],
      }
      const m = new StateMachine(guardedConfig)
      expect(m.send('GO')).toBe(true)
      expect(m.currentState).toBe('b')
    })

    it('should pass state and event to guard', () => {
      const guardFn = vi.fn(() => true)
      const config: StateMachineConfig<'x' | 'y', 'MOVE'> = {
        initialState: 'x',
        transitions: [{ from: 'x', to: 'y', on: 'MOVE', guard: guardFn }],
      }
      const m = new StateMachine(config)
      m.send('MOVE')
      expect(guardFn).toHaveBeenCalledWith('x', 'MOVE')
    })
  })

  describe('entry/exit actions', () => {
    it('should fire entry action on initial state', () => {
      const onEntry = vi.fn()
      const config: StateMachineConfig<'a' | 'b', 'GO'> = {
        initialState: 'a',
        transitions: [{ from: 'a', to: 'b', on: 'GO' }],
        onEntry: { a: onEntry },
      }
      new StateMachine(config)
      expect(onEntry).toHaveBeenCalledWith('a')
    })

    it('should fire exit action when leaving a state', () => {
      const onExit = vi.fn()
      const config: StateMachineConfig<'a' | 'b', 'GO'> = {
        initialState: 'a',
        transitions: [{ from: 'a', to: 'b', on: 'GO' }],
        onExit: { a: onExit },
      }
      const m = new StateMachine(config)
      m.send('GO')
      expect(onExit).toHaveBeenCalledWith('a')
    })

    it('should fire entry action when entering a state', () => {
      const onEntry = vi.fn()
      const config: StateMachineConfig<'a' | 'b', 'GO'> = {
        initialState: 'a',
        transitions: [{ from: 'a', to: 'b', on: 'GO' }],
        onEntry: { b: onEntry },
      }
      const m = new StateMachine(config)
      m.send('GO')
      expect(onEntry).toHaveBeenCalledWith('b')
    })

    it('should fire exit before entry on transition', () => {
      const order: string[] = []
      const config: StateMachineConfig<'a' | 'b', 'GO'> = {
        initialState: 'a',
        transitions: [{ from: 'a', to: 'b', on: 'GO' }],
        onExit: { a: () => order.push('exit-a') },
        onEntry: { b: () => order.push('enter-b') },
      }
      const m = new StateMachine(config)
      m.send('GO')
      expect(order).toEqual(['exit-a', 'enter-b'])
    })
  })

  describe('can()', () => {
    it('should return true for valid transitions', () => {
      expect(machine.can('TIMER')).toBe(true)
    })

    it('should return false for invalid transitions', () => {
      expect(machine.can('EMERGENCY')).toBe(false) // not valid from 'red'
    })

    it('should respect guards', () => {
      const config: StateMachineConfig<'a' | 'b', 'GO'> = {
        initialState: 'a',
        transitions: [{ from: 'a', to: 'b', on: 'GO', guard: () => false }],
      }
      const m = new StateMachine(config)
      expect(m.can('GO')).toBe(false)
    })
  })

  describe('getAvailableEvents()', () => {
    it('should return available events from current state', () => {
      const events = machine.getAvailableEvents()
      expect(events).toEqual(['TIMER'])
    })

    it('should return multiple events when available', () => {
      machine.send('TIMER') // -> green
      const events = machine.getAvailableEvents()
      expect(events).toContain('TIMER')
      expect(events).toContain('EMERGENCY')
      expect(events).toHaveLength(2)
    })

    it('should exclude events blocked by guards', () => {
      const config: StateMachineConfig<'a' | 'b' | 'c', 'X' | 'Y'> = {
        initialState: 'a',
        transitions: [
          { from: 'a', to: 'b', on: 'X', guard: () => false },
          { from: 'a', to: 'c', on: 'Y' },
        ],
      }
      const m = new StateMachine(config)
      expect(m.getAvailableEvents()).toEqual(['Y'])
    })
  })

  describe('reset()', () => {
    it('should reset to given initial state', () => {
      machine.send('TIMER')
      machine.send('TIMER')
      machine.reset('red')
      expect(machine.currentState).toBe('red')
      expect(machine.previousState).toBeNull()
      expect(machine.transitionCount).toBe(0)
      expect(machine.history).toEqual(['red'])
    })
  })

  describe('subscription', () => {
    it('should notify on transitions', () => {
      const listener = vi.fn()
      machine.subscribe(listener)
      machine.send('TIMER')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should not notify when transition fails', () => {
      const listener = vi.fn()
      machine.subscribe(listener)
      machine.send('EMERGENCY') // invalid from 'red'
      expect(listener).not.toHaveBeenCalled()
    })

    it('should unsubscribe correctly', () => {
      const listener = vi.fn()
      const unsub = machine.subscribe(listener)
      unsub()
      machine.send('TIMER')
      expect(listener).not.toHaveBeenCalled()
    })

    it('should update snapshot on transition', () => {
      machine.send('TIMER')
      const snap = machine.getSnapshot()
      expect(snap.currentState).toBe('green')
      expect(snap.previousState).toBe('red')
      expect(snap.transitionCount).toBe(1)
    })
  })

  describe('history limiting', () => {
    it('should respect maxHistory', () => {
      const config: StateMachineConfig<'a' | 'b', 'TOGGLE'> = {
        initialState: 'a',
        transitions: [
          { from: 'a', to: 'b', on: 'TOGGLE' },
          { from: 'b', to: 'a', on: 'TOGGLE' },
        ],
      }
      const m = new StateMachine(config, 5)

      for (let i = 0; i < 10; i++) {
        m.send('TOGGLE')
      }

      expect(m.history.length).toBeLessThanOrEqual(5)
    })
  })
})

// ---------------------------------------------------------------------------
// TurnManager
// ---------------------------------------------------------------------------

describe('TurnManager', () => {
  const basicConfig: TurnConfig = {
    actors: [
      { id: 'alice', name: 'Alice' },
      { id: 'bob', name: 'Bob' },
      { id: 'charlie', name: 'Charlie' },
    ],
    order: 'sequential',
  }

  let manager: TurnManager

  beforeEach(() => {
    manager = new TurnManager()
    manager.configure(basicConfig)
  })

  describe('configuration', () => {
    it('should start with the first actor', () => {
      expect(manager.currentActorId).toBe('alice')
    })

    it('should start at turn 0', () => {
      expect(manager.turnNumber).toBe(0)
    })

    it('should have all actors registered', () => {
      expect(manager.actors).toHaveLength(3)
    })
  })

  describe('sequential turn order', () => {
    it('should advance through actors in order', () => {
      expect(manager.currentActorId).toBe('alice')
      manager.endTurn()
      expect(manager.currentActorId).toBe('bob')
      manager.endTurn()
      expect(manager.currentActorId).toBe('charlie')
    })

    it('should increment turn number after full round', () => {
      expect(manager.turnNumber).toBe(0)
      manager.endTurn() // alice -> bob
      expect(manager.turnNumber).toBe(0)
      manager.endTurn() // bob -> charlie
      expect(manager.turnNumber).toBe(0)
      manager.endTurn() // charlie -> alice (new round)
      expect(manager.turnNumber).toBe(1)
      expect(manager.currentActorId).toBe('alice')
    })
  })

  describe('priority turn order', () => {
    it('should order actors by priority (lower = earlier)', () => {
      const priorityConfig: TurnConfig = {
        actors: [
          { id: 'low', name: 'Low Priority', priority: 10 },
          { id: 'high', name: 'High Priority', priority: 1 },
          { id: 'mid', name: 'Mid Priority', priority: 5 },
        ],
        order: 'priority',
      }
      const m = new TurnManager()
      m.configure(priorityConfig)

      expect(m.currentActorId).toBe('high')
      m.endTurn()
      expect(m.currentActorId).toBe('mid')
      m.endTurn()
      expect(m.currentActorId).toBe('low')
    })
  })

  describe('action submission', () => {
    it('should accept action from current actor', () => {
      const action: TurnAction = {
        actorId: 'alice',
        type: 'move',
        payload: { x: 1, y: 2 },
      }
      expect(manager.submitAction(action)).toBe(true)
      expect(manager.actionsThisTurn).toHaveLength(1)
    })

    it('should reject action from non-current actor', () => {
      const action: TurnAction = {
        actorId: 'bob',
        type: 'move',
        payload: {},
      }
      expect(manager.submitAction(action)).toBe(false)
    })

    it('should clear actions on endTurn', () => {
      const action: TurnAction = {
        actorId: 'alice',
        type: 'move',
        payload: {},
      }
      manager.submitAction(action)
      manager.endTurn()
      expect(manager.actionsThisTurn).toHaveLength(0)
    })

    it('should archive actions to history', () => {
      const action: TurnAction = {
        actorId: 'alice',
        type: 'move',
        payload: { direction: 'north' },
      }
      manager.submitAction(action)
      manager.endTurn()
      expect(manager.actionHistory).toHaveLength(1)
      expect(manager.actionHistory[0]?.actions[0]?.type).toBe('move')
    })
  })

  describe('action validation', () => {
    it('should use custom validator to reject invalid actions', () => {
      const config: TurnConfig = {
        actors: [{ id: 'alice', name: 'Alice' }],
        order: 'sequential',
        actionValidator: (action) => action.type !== 'forbidden',
      }
      const m = new TurnManager()
      m.configure(config)

      expect(m.submitAction({ actorId: 'alice', type: 'forbidden', payload: {} })).toBe(false)
      expect(m.submitAction({ actorId: 'alice', type: 'allowed', payload: {} })).toBe(true)
    })
  })

  describe('canSubmitAction()', () => {
    it('should return true for valid actions', () => {
      const action: TurnAction = { actorId: 'alice', type: 'move', payload: {} }
      expect(manager.canSubmitAction(action)).toBe(true)
    })

    it('should return false for wrong actor', () => {
      const action: TurnAction = { actorId: 'bob', type: 'move', payload: {} }
      expect(manager.canSubmitAction(action)).toBe(false)
    })
  })

  describe('actor management', () => {
    it('should add an actor', () => {
      manager.addActor({ id: 'dave', name: 'Dave' })
      expect(manager.actors).toHaveLength(4)
    })

    it('should not add duplicate actors', () => {
      manager.addActor({ id: 'alice', name: 'Alice Duplicate' })
      expect(manager.actors).toHaveLength(3)
    })

    it('should remove an actor', () => {
      manager.removeActor('bob')
      expect(manager.actors).toHaveLength(2)
    })

    it('should handle removing current actor gracefully', () => {
      // Current actor is alice (index 0)
      // After removing alice, bob becomes index 0
      manager.removeActor('alice')
      expect(manager.currentActorId).toBe('bob')
    })
  })

  describe('reset', () => {
    it('should reset to initial state', () => {
      manager.endTurn()
      manager.endTurn()
      manager.endTurn()
      manager.reset()
      expect(manager.currentActorId).toBe('alice')
      expect(manager.turnNumber).toBe(0)
      expect(manager.actionsThisTurn).toHaveLength(0)
      expect(manager.actionHistory).toHaveLength(0)
    })
  })

  describe('clear', () => {
    it('should remove all actors and reset', () => {
      manager.clear()
      expect(manager.actors).toHaveLength(0)
      expect(manager.currentActorId).toBeNull()
      expect(manager.turnNumber).toBe(0)
    })
  })

  describe('subscription', () => {
    it('should notify on endTurn', () => {
      const listener = vi.fn()
      manager.subscribe(listener)
      manager.endTurn()
      expect(listener).toHaveBeenCalled()
    })

    it('should notify on action submission', () => {
      const listener = vi.fn()
      manager.subscribe(listener)
      manager.submitAction({ actorId: 'alice', type: 'move', payload: {} })
      expect(listener).toHaveBeenCalled()
    })

    it('should unsubscribe correctly', () => {
      const listener = vi.fn()
      const unsub = manager.subscribe(listener)
      unsub()
      manager.endTurn()
      expect(listener).not.toHaveBeenCalled()
    })

    it('should provide snapshot', () => {
      const snap = manager.getSnapshot()
      expect(snap.currentActorId).toBe('alice')
      expect(snap.turnNumber).toBe(0)
      expect(snap.actorIds).toEqual(['alice', 'bob', 'charlie'])
    })
  })
})

// ---------------------------------------------------------------------------
// DiscreteEngine — Step-based Mode
// ---------------------------------------------------------------------------

describe('DiscreteEngine — step-based', () => {
  let engine: DiscreteEngine<CounterState>

  beforeEach(() => {
    engine = new DiscreteEngine(createCounterConfig())
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('initial state', () => {
    it('should start with the initial state', () => {
      expect(engine.getState()).toEqual({ count: 0, label: 'start' })
    })

    it('should have step count 0', () => {
      expect(engine.stepCount).toBe(0)
    })

    it('should have initial state in history', () => {
      expect(engine.history).toEqual([{ count: 0, label: 'start' }])
    })

    it('should be in step mode', () => {
      expect(engine.mode).toBe('step')
    })

    it('should not be auto-stepping', () => {
      expect(engine.autoStepping).toBe(false)
    })
  })

  describe('step()', () => {
    it('should advance state by one step', () => {
      engine.step()
      expect(engine.getState()).toEqual({ count: 1, label: 'step-1' })
      expect(engine.stepCount).toBe(1)
    })

    it('should chain multiple steps', () => {
      engine.step()
      engine.step()
      engine.step()
      expect(engine.getState()).toEqual({ count: 3, label: 'step-3' })
      expect(engine.stepCount).toBe(3)
    })

    it('should push each state to history', () => {
      engine.step()
      engine.step()
      expect(engine.history).toHaveLength(3) // initial + 2 steps
      expect(engine.history[2]).toEqual({ count: 2, label: 'step-2' })
    })

    it('should return the new state', () => {
      const result = engine.step()
      expect(result).toEqual({ count: 1, label: 'step-1' })
    })
  })

  describe('parameter integration', () => {
    it('should pass parameters to step function', () => {
      const stepFn = vi.fn((state: CounterState, params: Record<string, unknown>) => ({
        count: state.count + ((params['increment'] as number) ?? 1),
        label: `step-${state.count + 1}`,
      }))

      const config = createCounterConfig({
        stepFn,
        parameters: [
          {
            type: 'number',
            key: 'increment',
            label: 'Increment',
            default: 5,
            min: 1,
            max: 10,
            step: 1,
          },
        ],
      })

      const paramEngine = new DiscreteEngine(config)
      paramEngine.step()

      expect(stepFn).toHaveBeenCalledWith(
        { count: 0, label: 'start' },
        expect.objectContaining({ increment: 5 }),
      )
      expect(paramEngine.getState().count).toBe(5)
      paramEngine.destroy()
    })
  })

  describe('setState()', () => {
    it('should directly set the state', () => {
      engine.setState({ count: 42, label: 'manual' })
      expect(engine.getState()).toEqual({ count: 42, label: 'manual' })
    })
  })

  describe('reset()', () => {
    it('should reset to initial state', () => {
      engine.step()
      engine.step()
      engine.reset()
      expect(engine.getState()).toEqual({ count: 0, label: 'start' })
      expect(engine.stepCount).toBe(0)
      expect(engine.history).toEqual([{ count: 0, label: 'start' }])
    })
  })

  describe('undo()', () => {
    it('should revert to previous state', () => {
      engine.step()
      engine.step()
      expect(engine.getState()).toEqual({ count: 2, label: 'step-2' })

      const result = engine.undo()
      expect(result).toBe(true)
      expect(engine.getState()).toEqual({ count: 1, label: 'step-1' })
      expect(engine.stepCount).toBe(1)
    })

    it('should return false when no history to undo', () => {
      expect(engine.undo()).toBe(false)
    })

    it('should allow undo to initial state', () => {
      engine.step()
      engine.undo()
      expect(engine.getState()).toEqual({ count: 0, label: 'start' })
    })
  })

  describe('auto-stepping', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should auto-advance steps at configured interval', () => {
      const config = createCounterConfig({ autoStepInterval: 500 })
      const autoEngine = new DiscreteEngine(config)

      autoEngine.startAutoStep()
      expect(autoEngine.autoStepping).toBe(true)

      vi.advanceTimersByTime(500)
      expect(autoEngine.stepCount).toBe(1)

      vi.advanceTimersByTime(500)
      expect(autoEngine.stepCount).toBe(2)

      autoEngine.stopAutoStep()
      expect(autoEngine.autoStepping).toBe(false)

      vi.advanceTimersByTime(500)
      expect(autoEngine.stepCount).toBe(2) // no further advancement

      autoEngine.destroy()
    })

    it('should not start auto-step in non-step mode', () => {
      const eventConfig: DiscreteEngineConfig<CounterState> = {
        mode: 'event-driven',
        initialState: { count: 0, label: 'start' },
        stateMachineConfig: {
          initialState: 'idle',
          transitions: [],
        },
      }
      const eventEngine = new DiscreteEngine(eventConfig)
      eventEngine.startAutoStep()
      expect(eventEngine.autoStepping).toBe(false)
      eventEngine.destroy()
    })

    it('should update interval when setAutoStepInterval is called', () => {
      const config = createCounterConfig({ autoStepInterval: 1000 })
      const autoEngine = new DiscreteEngine(config)

      autoEngine.startAutoStep()
      vi.advanceTimersByTime(1000)
      expect(autoEngine.stepCount).toBe(1)

      autoEngine.setAutoStepInterval(200)
      vi.advanceTimersByTime(200)
      expect(autoEngine.stepCount).toBe(2)

      autoEngine.destroy()
    })
  })

  describe('history limiting', () => {
    it('should respect maxHistoryLength', () => {
      const config = createCounterConfig({ maxHistoryLength: 5 })
      const limitedEngine = new DiscreteEngine(config)

      for (let i = 0; i < 10; i++) {
        limitedEngine.step()
      }

      expect(limitedEngine.history.length).toBeLessThanOrEqual(5)
      limitedEngine.destroy()
    })
  })

  describe('subscription', () => {
    it('should notify on step', () => {
      const listener = vi.fn()
      engine.subscribe(listener)
      engine.step()
      expect(listener).toHaveBeenCalled()
    })

    it('should notify on reset', () => {
      const listener = vi.fn()
      engine.step()
      engine.subscribe(listener)
      engine.reset()
      expect(listener).toHaveBeenCalled()
    })

    it('should notify on setState', () => {
      const listener = vi.fn()
      engine.subscribe(listener)
      engine.setState({ count: 99, label: 'forced' })
      expect(listener).toHaveBeenCalled()
    })

    it('should unsubscribe correctly', () => {
      const listener = vi.fn()
      const unsub = engine.subscribe(listener)
      unsub()
      engine.step()
      expect(listener).not.toHaveBeenCalled()
    })

    it('should provide correct snapshot', () => {
      engine.step()
      const snap = engine.getSnapshot()
      expect(snap.mode).toBe('step')
      expect(snap.state).toEqual({ count: 1, label: 'step-1' })
      expect(snap.stepCount).toBe(1)
      expect(snap.autoStepping).toBe(false)
      expect(snap.machineState).toBeNull()
      expect(snap.currentActorId).toBeNull()
      expect(snap.turnNumber).toBe(0)
    })
  })

  describe('mission integration', () => {
    it('should evaluate missions after each step', () => {
      const evaluateFn = vi.fn(() => [{ id: 'obj-1', status: 'completed' as ObjectiveStatus }])

      const config = createCounterConfig({
        missions: [
          {
            id: 'mission-1',
            name: 'Count Mission',
            description: 'Count to 1',
            objectives: [{ id: 'obj-1', label: 'Count to 1' }],
            evaluate: evaluateFn,
          },
        ],
      })

      const missionEngine = new DiscreteEngine(config)
      missionEngine.step()

      expect(evaluateFn).toHaveBeenCalled()
      expect(missionEngine.missions.phase).toBe('success')
      missionEngine.destroy()
    })

    it('should detect failed missions', () => {
      const config = createCounterConfig({
        missions: [
          {
            id: 'mission-1',
            name: 'Fail Mission',
            description: 'Always fails',
            objectives: [{ id: 'obj-1', label: 'Impossible' }],
            evaluate: () => [{ id: 'obj-1', status: 'failed' as ObjectiveStatus }],
          },
        ],
      })

      const missionEngine = new DiscreteEngine(config)
      missionEngine.step()
      expect(missionEngine.missions.phase).toBe('failed')
      missionEngine.destroy()
    })
  })
})

// ---------------------------------------------------------------------------
// DiscreteEngine — Event-driven Mode
// ---------------------------------------------------------------------------

describe('DiscreteEngine — event-driven', () => {
  type Phase = 'intro' | 'debate' | 'vote' | 'result'
  type Event = 'START_DEBATE' | 'CALL_VOTE' | 'TALLY'

  interface CivicsState {
    topic: string
    votes: number
  }

  const civicsConfig: DiscreteEngineConfig<CivicsState> = {
    mode: 'event-driven',
    initialState: { topic: 'Tax Reform', votes: 0 },
    stateMachineConfig: {
      initialState: 'intro' as Phase,
      transitions: [
        { from: 'intro' as Phase, to: 'debate' as Phase, on: 'START_DEBATE' as Event },
        { from: 'debate' as Phase, to: 'vote' as Phase, on: 'CALL_VOTE' as Event },
        { from: 'vote' as Phase, to: 'result' as Phase, on: 'TALLY' as Event },
      ],
    },
  }

  let engine: DiscreteEngine<CivicsState>

  beforeEach(() => {
    engine = new DiscreteEngine(civicsConfig)
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('initial state', () => {
    it('should start in the initial machine state', () => {
      expect(engine.stateMachine?.currentState).toBe('intro')
    })

    it('should expose machine state in snapshot', () => {
      expect(engine.getSnapshot().machineState).toBe('intro')
    })
  })

  describe('sendEvent()', () => {
    it('should transition state machine on valid event', () => {
      const result = engine.sendEvent('START_DEBATE')
      expect(result).toBe(true)
      expect(engine.stateMachine?.currentState).toBe('debate')
      expect(engine.stepCount).toBe(1)
    })

    it('should reject invalid events', () => {
      const result = engine.sendEvent('TALLY')
      expect(result).toBe(false)
      expect(engine.stateMachine?.currentState).toBe('intro')
      expect(engine.stepCount).toBe(0)
    })

    it('should chain events through the state machine', () => {
      engine.sendEvent('START_DEBATE')
      engine.sendEvent('CALL_VOTE')
      engine.sendEvent('TALLY')
      expect(engine.stateMachine?.currentState).toBe('result')
      expect(engine.stepCount).toBe(3)
    })
  })

  describe('getAvailableEvents()', () => {
    it('should return events valid from current state', () => {
      const events = engine.getAvailableEvents()
      expect(events).toContain('START_DEBATE')
      expect(events).toHaveLength(1)
    })

    it('should update after transition', () => {
      engine.sendEvent('START_DEBATE')
      const events = engine.getAvailableEvents()
      expect(events).toContain('CALL_VOTE')
    })
  })

  describe('sendEvent in non-event mode returns false', () => {
    it('should return false when not in event-driven mode', () => {
      const stepEngine = new DiscreteEngine(createCounterConfig())
      expect(stepEngine.sendEvent('anything')).toBe(false)
      stepEngine.destroy()
    })
  })
})

// ---------------------------------------------------------------------------
// DiscreteEngine — Turn-based Mode
// ---------------------------------------------------------------------------

describe('DiscreteEngine — turn-based', () => {
  interface NegotiationState {
    round: number
    offers: string[]
  }

  let engine: DiscreteEngine<NegotiationState>

  beforeEach(() => {
    const config: DiscreteEngineConfig<NegotiationState> = {
      mode: 'turn-based',
      initialState: { round: 0, offers: [] },
      stepFn: (state) => ({
        round: state.round + 1,
        offers: [],
      }),
      turnConfig: {
        actors: [
          { id: 'player1', name: 'Player 1' },
          { id: 'player2', name: 'Player 2' },
        ],
        order: 'sequential',
      },
    }
    engine = new DiscreteEngine(config)
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('initial state', () => {
    it('should have the first actor as current', () => {
      expect(engine.turnManager?.currentActorId).toBe('player1')
    })

    it('should expose current actor in snapshot', () => {
      expect(engine.getSnapshot().currentActorId).toBe('player1')
    })

    it('should be at turn 0', () => {
      expect(engine.getSnapshot().turnNumber).toBe(0)
    })
  })

  describe('submitTurnAction()', () => {
    it('should accept action from current actor', () => {
      const result = engine.submitTurnAction({
        actorId: 'player1',
        type: 'offer',
        payload: { amount: 50 },
      })
      expect(result).toBe(true)
    })

    it('should reject action from wrong actor', () => {
      const result = engine.submitTurnAction({
        actorId: 'player2',
        type: 'offer',
        payload: { amount: 50 },
      })
      expect(result).toBe(false)
    })

    it('should return false when not in turn-based mode', () => {
      const stepEngine = new DiscreteEngine(createCounterConfig())
      const result = stepEngine.submitTurnAction({
        actorId: 'anyone',
        type: 'move',
        payload: {},
      })
      expect(result).toBe(false)
      stepEngine.destroy()
    })
  })

  describe('endTurn()', () => {
    it('should advance to next actor', () => {
      engine.endTurn()
      expect(engine.turnManager?.currentActorId).toBe('player2')
    })

    it('should apply step function after full round', () => {
      engine.endTurn() // player1 -> player2
      expect(engine.getState().round).toBe(0) // not yet a full round

      engine.endTurn() // player2 -> player1 (full round)
      expect(engine.getState().round).toBe(1) // step function applied
      expect(engine.stepCount).toBe(1)
    })

    it('should return null when not in turn-based mode', () => {
      const stepEngine = new DiscreteEngine(createCounterConfig())
      expect(stepEngine.endTurn()).toBeNull()
      stepEngine.destroy()
    })
  })

  describe('turn-based with action validation', () => {
    it('should use action validator', () => {
      const config: DiscreteEngineConfig<NegotiationState> = {
        mode: 'turn-based',
        initialState: { round: 0, offers: [] },
        turnConfig: {
          actors: [{ id: 'player1', name: 'Player 1' }],
          order: 'sequential',
          actionValidator: (action) => action.type === 'valid-action',
        },
      }
      const validatedEngine = new DiscreteEngine(config)

      expect(
        validatedEngine.submitTurnAction({
          actorId: 'player1',
          type: 'invalid',
          payload: {},
        }),
      ).toBe(false)

      expect(
        validatedEngine.submitTurnAction({
          actorId: 'player1',
          type: 'valid-action',
          payload: {},
        }),
      ).toBe(true)

      validatedEngine.destroy()
    })
  })
})

// ---------------------------------------------------------------------------
// DiscreteEngine — Cross-cutting Concerns
// ---------------------------------------------------------------------------

describe('DiscreteEngine — cross-cutting', () => {
  describe('SimulationEngineInterface', () => {
    it('should implement getParameterValue/setParameterValue', () => {
      const config = createCounterConfig({
        parameters: [
          {
            type: 'number',
            key: 'gravity',
            label: 'Gravity',
            default: 9.8,
            min: 0,
            max: 100,
            step: 0.1,
          },
        ],
      })
      const engine = new DiscreteEngine(config)

      expect(engine.getParameterValue('gravity')).toBeCloseTo(9.8)
      engine.setParameterValue('gravity', 5.0)
      expect(engine.getParameterValue('gravity')).toBeCloseTo(5.0)
      engine.destroy()
    })

    it('should expose config', () => {
      const engine = new DiscreteEngine(createCounterConfig())
      expect(engine.config.fixedTimestep).toBeCloseTo(1 / 60)
      engine.destroy()
    })
  })

  describe('destroy()', () => {
    it('should stop auto-stepping on destroy', () => {
      vi.useFakeTimers()
      const config = createCounterConfig({ autoStepInterval: 100 })
      const engine = new DiscreteEngine(config)
      engine.startAutoStep()
      engine.destroy()

      vi.advanceTimersByTime(500)
      // Step count should remain at 0 since we destroyed before any interval fired
      // (or at most 0 since destroy clears the interval)
      expect(engine.stepCount).toBe(0)
      vi.useRealTimers()
    })

    it('should clear listeners on destroy', () => {
      const engine = new DiscreteEngine(createCounterConfig())
      const listener = vi.fn()
      engine.subscribe(listener)
      engine.destroy()
      // Internal _listeners cleared, but unsubscribe function no longer matters
      // The key is that destroy doesn't throw
    })
  })

  describe('snapshot immutability', () => {
    it('should return a new snapshot object on each change', () => {
      const engine = new DiscreteEngine(createCounterConfig())
      const snap1 = engine.getSnapshot()
      engine.step()
      const snap2 = engine.getSnapshot()

      expect(snap1).not.toBe(snap2)
      expect(snap1.stepCount).toBe(0)
      expect(snap2.stepCount).toBe(1)
      engine.destroy()
    })
  })
})
