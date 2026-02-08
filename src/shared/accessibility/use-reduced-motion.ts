/**
 * useReducedMotion — hook that returns true when the user prefers reduced motion.
 *
 * Uses the `prefers-reduced-motion: reduce` media query to detect the
 * user's system preference. Updates reactively when the preference changes.
 */

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
  // On the server, assume no preference (animations enabled)
  return false
}

/**
 * Returns `true` when the user has `prefers-reduced-motion: reduce` enabled.
 *
 * Use this hook to disable or simplify JavaScript-driven animations.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
