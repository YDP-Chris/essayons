import { useCallback, useMemo, useContext, useSyncExternalStore } from 'react'
import { ProgressContext } from './progress-context.ts'
import type { UseProgressResult } from './types.ts'

/**
 * React hook that exposes progress state and actions.
 * Must be used inside a `<ProgressProvider>`.
 */
export function useProgress(): UseProgressResult {
  const service = useContext(ProgressContext)
  if (service === null) {
    throw new Error('useProgress must be used within a <ProgressProvider>')
  }

  const subscribe = useCallback(
    (onStoreChange: () => void) => service.subscribe(onStoreChange),
    [service],
  )
  const getSnapshot = useCallback(() => service.getData(), [service])

  const data = useSyncExternalStore(subscribe, getSnapshot)

  const markMissionComplete = useCallback(
    (episodeId: string, missionId: string) => service.markMissionComplete(episodeId, missionId),
    [service],
  )

  const isMissionComplete = useCallback(
    (episodeId: string, missionId: string) => service.isMissionComplete(episodeId, missionId),
    [service],
  )

  const getCompletedMissions = useCallback(
    (episodeId: string) => service.getCompletedMissions(episodeId),
    [service],
  )

  const recordEpisodeVisit = useCallback(
    (episodeId: string) => service.recordEpisodeVisit(episodeId),
    [service],
  )

  const getEpisodeVisits = useCallback(() => service.getEpisodeVisits(), [service])

  const isReturnVisit = useCallback(() => service.isReturnVisit(), [service])

  return useMemo(
    () => ({
      markMissionComplete,
      isMissionComplete,
      getCompletedMissions,
      recordEpisodeVisit,
      getEpisodeVisits,
      isReturnVisit,
      data,
    }),
    [
      markMissionComplete,
      isMissionComplete,
      getCompletedMissions,
      recordEpisodeVisit,
      getEpisodeVisits,
      isReturnVisit,
      data,
    ],
  )
}
