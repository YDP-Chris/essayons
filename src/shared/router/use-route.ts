import { useSyncExternalStore } from 'react'
import { subscribe, getCurrentRoute } from './router.ts'

export function useRoute() {
  return useSyncExternalStore(subscribe, getCurrentRoute)
}
