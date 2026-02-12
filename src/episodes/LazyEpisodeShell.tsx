/**
 * Lazy-loading wrapper for EpisodeShell.
 *
 * Dynamically imports the episode module (which triggers its registration
 * side-effect) before rendering the EpisodeShell. Displays a loading
 * spinner while the episode chunk is being fetched.
 */

import { useEffect, useReducer, lazy, Suspense } from 'react'

// ---------------------------------------------------------------------------
// Episode module loader map
// ---------------------------------------------------------------------------

const episodeLoaders: Record<string, () => Promise<unknown>> = {
  'orbit-lab': () => import('@/episodes/orbit-lab/index.ts'),
  'market-lab': () => import('@/episodes/market-lab/index.ts'),
  'citizen-lab': () => import('@/episodes/citizen-lab/index.ts'),
  'gene-lab': () => import('@/episodes/gene-lab/index.ts'),
  'bridge-lab': () => import('@/episodes/bridge-lab/index.ts'),
  'timeline-lab': () => import('@/episodes/timeline-lab/index.ts'),
  'wave-lab': () => import('@/episodes/wave-lab/index.ts'),
}

// ---------------------------------------------------------------------------
// Lazy-loaded EpisodeShell
// ---------------------------------------------------------------------------

const LazyEpisodeShellInner = lazy(() =>
  import('./EpisodeShell.tsx').then((mod) => ({ default: mod.EpisodeShell })),
)

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------

const spinnerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  flexDirection: 'column',
  gap: '16px',
  color: '#64748b',
  fontFamily: 'var(--font-body, system-ui, sans-serif)',
}

const spinnerDotStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '3px solid #e2e8f0',
  borderTopColor: '#6366f1',
  borderRadius: '50%',
  animation: 'lazy-episode-spin 0.8s linear infinite',
}

function LoadingSpinner() {
  return (
    <div style={spinnerStyle}>
      <style>{`@keyframes lazy-episode-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={spinnerDotStyle} />
      <div>Loading episode...</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loader state
// ---------------------------------------------------------------------------

interface LoaderState {
  readonly status: 'loading' | 'ready' | 'error'
  readonly error: string | null
  readonly episodeId: string
}

type LoaderAction = { type: 'loaded' } | { type: 'failed'; error: string }

function loaderReducer(state: LoaderState, action: LoaderAction): LoaderState {
  switch (action.type) {
    case 'loaded':
      return { ...state, status: 'ready', error: null }
    case 'failed':
      return { ...state, status: 'error', error: action.error }
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export interface LazyEpisodeShellProps {
  readonly episodeId: string
  /** Optional tutorial state forwarded to EpisodeShell. */
  readonly tutorial?: import('@/features/onboarding/use-tutorial.ts').UseTutorialReturn
}

export function LazyEpisodeShell({ episodeId, tutorial }: LazyEpisodeShellProps) {
  const [state, dispatch] = useReducer(loaderReducer, {
    status: 'loading',
    error: null,
    episodeId,
  })

  useEffect(() => {
    let cancelled = false

    const loader = episodeLoaders[episodeId]
    if (!loader) {
      dispatch({ type: 'failed', error: `Unknown episode: ${episodeId}` })
      return
    }

    loader()
      .then(() => {
        if (!cancelled) dispatch({ type: 'loaded' })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'failed', error: `Failed to load episode: ${episodeId}` })
      })

    return () => {
      cancelled = true
    }
  }, [episodeId])

  if (state.status === 'error') {
    return (
      <div style={spinnerStyle}>
        <p>{state.error}</p>
      </div>
    )
  }

  if (state.status === 'loading') {
    return <LoadingSpinner />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyEpisodeShellInner episodeId={episodeId} tutorial={tutorial} />
    </Suspense>
  )
}
