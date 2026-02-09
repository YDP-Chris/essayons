import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  // Use useSyncExternalStore to subscribe to matchMedia changes
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }
  const getSnapshot = () => window.matchMedia(query).matches
  const getServerSnapshot = () => false
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// Preset breakpoints
export function useIsMobile() {
  return useMediaQuery('(max-width: 479px)')
}
export function useIsTablet() {
  return useMediaQuery('(min-width: 480px) and (max-width: 767px)')
}
export function useIsDesktop() {
  return useMediaQuery('(min-width: 768px)')
}
export function useIsLandscape() {
  return useMediaQuery('(orientation: landscape) and (max-height: 500px)')
}
