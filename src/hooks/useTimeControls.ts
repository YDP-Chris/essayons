/**
 * React hook for time control UI.
 *
 * Wraps the TimeController from a SimulationEngine instance and provides
 * control functions (pause, play, togglePause, setSpeed, singleStep)
 * along with the current time control state.
 */

import { useCallback, useSyncExternalStore } from 'react'
import type { SimulationEngine } from '@/engine/SimulationEngine.ts'
import type { TimeControlState } from '@/engine/TimeController.ts'

interface TimeControlActions {
  pause: () => void
  play: () => void
  togglePause: () => void
  setSpeed: (speed: number) => void
  singleStep: () => void
}

type UseTimeControlsReturn = TimeControlState & TimeControlActions

const DEFAULT_STATE: UseTimeControlsReturn = {
  paused: false,
  speedMultiplier: 1,
  simulationTime: 0,
  pause: () => {},
  play: () => {},
  togglePause: () => {},
  setSpeed: () => {},
  singleStep: () => {},
}

export function useTimeControls(engine: SimulationEngine | null): UseTimeControlsReturn {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!engine) return () => {}
      return engine.time.subscribe(cb)
    },
    [engine],
  )

  const getSnapshot = useCallback(() => {
    if (!engine) {
      return {
        paused: false,
        speedMultiplier: 1,
        simulationTime: 0,
      } satisfies TimeControlState
    }
    return engine.time.getSnapshot()
  }, [engine])

  const state = useSyncExternalStore(subscribe, getSnapshot)

  const pause = useCallback(() => {
    engine?.time.pause()
  }, [engine])

  const play = useCallback(() => {
    engine?.time.play()
  }, [engine])

  const togglePause = useCallback(() => {
    engine?.time.togglePause()
  }, [engine])

  const setSpeed = useCallback(
    (speed: number) => {
      engine?.time.setSpeed(speed)
    },
    [engine],
  )

  const singleStep = useCallback(() => {
    if (engine) {
      engine.time.singleStep(engine.config.fixedTimestep)
    }
  }, [engine])

  if (!engine) {
    return DEFAULT_STATE
  }

  return {
    ...state,
    pause,
    play,
    togglePause,
    setSpeed,
    singleStep,
  }
}
