import type { RouteMatch } from './types.ts'

type Listener = () => void

const listeners = new Set<Listener>()
let cachedRoute: RouteMatch | null = null
let lastHash = ''

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function normalizeHash(hash: string): string {
  // Remove leading # if present
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash
  // Ensure it starts with /
  return withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`
}

function parseRoute(hash: string): RouteMatch {
  // Extract path (before any ?)
  const questionIndex = hash.indexOf('?')
  const path = questionIndex >= 0 ? hash.slice(0, questionIndex) : hash

  const normalized = normalizeHash(path)

  // Match routes
  if (normalized === '/' || normalized === '') {
    return { route: 'landing', params: {} }
  }

  // Match /episode/:id
  const episodeMatch = normalized.match(/^\/episode\/([^/]+)$/)
  if (episodeMatch && episodeMatch[1]) {
    return { route: 'episode', params: { id: episodeMatch[1] } }
  }

  // No match found
  return { route: 'not-found', params: {} }
}

export function getCurrentRoute(): RouteMatch {
  if (typeof window === 'undefined') {
    return { route: 'landing', params: {} }
  }

  const currentHash = window.location.hash

  // Return cached route if hash hasn't changed
  if (cachedRoute !== null && currentHash === lastHash) {
    return cachedRoute
  }

  // Parse new route and cache it
  lastHash = currentHash
  cachedRoute = parseRoute(currentHash)
  return cachedRoute
}

export function navigate(path: string): void {
  if (typeof window === 'undefined') {
    return
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  window.location.hash = `#${normalizedPath}`
  // Clear cache when navigating
  cachedRoute = null
  lastHash = ''
  window.scrollTo(0, 0)
}

function handleHashChange() {
  // Clear cache on hash change
  cachedRoute = null
  lastHash = ''
  notifyListeners()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)

  // Set up hashchange listener if this is the first subscriber
  if (listeners.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('hashchange', handleHashChange)
  }

  return () => {
    listeners.delete(listener)
    // Clean up hashchange listener if no more subscribers
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }
}
