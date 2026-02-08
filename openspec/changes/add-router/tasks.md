# Implementation Tasks

## 1. Core Router Implementation

- [ ] 1.1 Create `src/shared/router/types.ts` with route definitions, match results, and navigation types
- [ ] 1.2 Create `src/shared/router/router.ts` with hash change listener, route matching, and navigation functions
- [ ] 1.3 Implement route pattern matching for static and parameterized routes (e.g., `/episode/:id`)
- [ ] 1.4 Add browser history integration (back/forward button support)
- [ ] 1.5 Add scroll position restoration on back navigation
- [ ] 1.6 Add 404 detection and redirect logic

## 2. React Integration

- [ ] 2.1 Create `src/shared/router/use-route.ts` hook for subscribing to route changes
- [ ] 2.2 Export router utilities from `src/shared/router/index.ts`
- [ ] 2.3 Update `src/App.tsx` to replace useState navigation with router-driven rendering
- [ ] 2.4 Update navigation callbacks in `src/components/landing/EpisodeGrid.tsx`
- [ ] 2.5 Update back button in episode shell navigation to use router

## 3. URL State Compatibility

- [ ] 3.1 Verify `src/shared/url-state/use-url-state.ts` works with hash routing (query params after hash)
- [ ] 3.2 Test URL structure: `/#/episode/orbit-lab?param1=value1&param2=value2`
- [ ] 3.3 Ensure share button generates correct URLs with both hash and query parameters

## 4. 404 Handling

- [ ] 4.1 Add toast notification component (or integrate with existing notification system if available)
- [ ] 4.2 Implement 404 redirect to landing with toast message
- [ ] 4.3 Test invalid episode IDs and malformed routes

## 5. Testing

- [ ] 5.1 Write unit tests for route matching logic
- [ ] 5.2 Write unit tests for route parameter extraction
- [ ] 5.3 Write unit tests for 404 detection
- [ ] 5.4 Write integration tests for navigation flows
- [ ] 5.5 Write E2E tests for deep linking (load episode directly from URL)
- [ ] 5.6 Write E2E tests for back/forward button behavior
- [ ] 5.7 Test scroll position restoration

## 6. Documentation

- [ ] 6.1 Add JSDoc comments to router functions
- [ ] 6.2 Add inline comments for complex routing logic
- [ ] 6.3 Update any relevant README or developer documentation
