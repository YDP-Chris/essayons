/**
 * React hook that wraps SimulationEngine for component integration.
 *
 * Creates the engine on mount, attaches to canvas when the ref is available,
 * loads episodes when provided, and exposes SimulationState via
 * useSyncExternalStore.
 */

import { useEffect, useState, useSyncExternalStore, useCallback } from 'react'
import type { RefObject } from 'react'
import { SimulationEngine } from '@/engine/SimulationEngine.ts'
import type { EpisodeDefinition, SimulationState } from '@/engine/types.ts'

export function useSimulation(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  episode: EpisodeDefinition | null,
): SimulationState {
  // Use useState with lazy initializer so the engine is created once and
  // its identity is stable across renders without reading a ref during render.
  const [engine] = useState(() => new SimulationEngine())

  // Attach to canvas when ref is available
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    engine.attachCanvas(canvas)
    return () => {
      engine.detachCanvas()
    }
  }, [canvasRef, engine])

  // Load episode when provided
  useEffect(() => {
    if (!episode) return

    engine.loadEpisode(episode)
    engine.start()

    return () => {
      engine.stop()
    }
  }, [episode, engine])

  // Destroy engine on unmount
  useEffect(() => {
    return () => {
      engine.destroy()
    }
  }, [engine])

  // Subscribe to engine state
  const subscribe = useCallback((cb: () => void) => engine.subscribe(cb), [engine])

  const getSnapshot = useCallback(() => engine.getSnapshot(), [engine])

  const state = useSyncExternalStore(subscribe, getSnapshot)

  return state
}
