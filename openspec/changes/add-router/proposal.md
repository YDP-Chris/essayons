# Change: Add hash-based router for deep-linkable episodes

## Why

The current navigation uses React useState to switch between landing and episode views. This works for in-app navigation but prevents deep linking - users can't bookmark or share direct links to specific episodes. Hash-based routing enables shareable URLs like `essayons.app/#/episode/orbit-lab` while requiring zero server configuration, making it ideal for static hosting on Vercel.

## What Changes

- Add lightweight hash-based router (~100 lines) - no external router library
- Define routes: `/` (landing), `/episode/:id` (episode shell), `/about` (future extensibility)
- Support browser back/forward button navigation with preserved scroll position
- Integrate with existing URL state codec for shareable simulation states (combine hash routing with query parameters)
- Replace useState-based navigation in App.tsx with router-driven component mounting
- Add 404 handling that redirects to landing with a user-friendly toast notification
- Support deep-linkable episode URLs that load episodes directly on page load

## Impact

- Affected specs: `router` (new capability)
- Affected code:
  - `src/shared/router/router.ts` - Core hash router implementation with route matching and navigation
  - `src/shared/router/use-route.ts` - React hook for subscribing to route changes
  - `src/shared/router/types.ts` - Route definitions, match results, navigation types
  - `src/App.tsx` - Replace useState navigation with router-driven rendering
  - `src/shared/url-state/use-url-state.ts` - Ensure compatibility with hash-based routing (query params still work)
  - `src/components/landing/EpisodeGrid.tsx` - Update navigation callbacks to use router
