## 1. FPS Overlay (Dev Mode)

- [ ] 1.1 Create `src/dev/performance-overlay.tsx` component that displays FPS, frame time, memory usage, and physics tick count
- [ ] 1.2 Integrate overlay into app root with environment check (only render in development mode)
- [ ] 1.3 Implement FPS calculation using `requestAnimationFrame` timestamps over a rolling window (e.g., last 60 frames)
- [ ] 1.4 Add memory usage display using `performance.memory` API (Chrome/Edge) with fallback for unsupported browsers
- [ ] 1.5 Hook into simulation engine to expose physics tick count as a metric
- [ ] 1.6 Style overlay to be minimally intrusive (small, semi-transparent, fixed position in corner)

## 2. Bundle Analysis CI Gate

- [ ] 2.1 Add `rollup-plugin-visualizer` or `vite-bundle-visualizer` to `vite.config.ts` for bundle analysis
- [ ] 2.2 Create `.github/workflows/bundle-size-check.yml` that runs on PR and main push
- [ ] 2.3 Implement script to extract gzipped bundle size from build output
- [ ] 2.4 Configure CI job to fail if main JS bundle exceeds 300KB gzipped
- [ ] 2.5 Add PR comment with bundle size report showing breakdown by chunk

## 3. Lazy-Load Episodes

- [ ] 3.1 Refactor episode imports in router to use dynamic `import()` instead of static imports
- [ ] 3.2 Configure Vite code splitting to create separate chunks per episode
- [ ] 3.3 Add loading state UI while episode chunk is fetching (spinner or skeleton)
- [ ] 3.4 Verify each episode becomes its own chunk in build output
- [ ] 3.5 Test navigation flow to ensure lazy loading does not introduce UX lag
- [ ] 3.6 Add preloading hint for likely-next episode on navigation hover (optional optimization)

## 4. Performance Budget CI (Lighthouse)

- [ ] 4.1 Add `@lhci/cli` as dev dependency
- [ ] 4.2 Create `lighthouserc.js` configuration file with thresholds: Performance > 90, Accessibility > 95
- [ ] 4.3 Add Lighthouse CI job to `.github/workflows/ci.yml` that runs after build
- [ ] 4.4 Configure Lighthouse to run on simulated 3G / mid-range device
- [ ] 4.5 Set CI to fail if any threshold is not met
- [ ] 4.6 Add Lighthouse score badge or PR comment (optional)

## 5. Memory Leak Detection

- [ ] 5.1 Create `src/utils/memory-monitor.ts` utility that tracks event listener count
- [ ] 5.2 Implement interval-based snapshot of `getEventListeners()` or proxy-based tracking
- [ ] 5.3 Add threshold warning when listener count grows beyond expected bounds (e.g., >500)
- [ ] 5.4 Integrate memory monitor into dev overlay (show listener count)
- [ ] 5.5 Add unit test that verifies listener count does not grow unboundedly during typical simulation lifecycle
- [ ] 5.6 Document common memory leak patterns in codebase (e.g., missing cleanup in `useEffect`)

## 6. Adaptive Canvas Quality

- [ ] 6.1 Refactor `canvas-renderer.ts` to make trail point count and vector rendering toggleable
- [ ] 6.2 Implement FPS monitoring within render loop (separate from dev overlay, always active)
- [ ] 6.3 Add logic to reduce trail points by 50% when FPS drops below 30 for 2+ consecutive seconds
- [ ] 6.4 Add logic to skip vector rendering (arrows, thrust indicators) when FPS < 30
- [ ] 6.5 Restore full quality when FPS recovers above 30 for 3+ consecutive seconds (hysteresis)
- [ ] 6.6 Add user setting to disable adaptive quality (power users may prefer low FPS over reduced visuals)
- [ ] 6.7 Write unit test for quality adjustment logic
- [ ] 6.8 Test on low-end devices to verify frame rate improvement

## 7. Import Cost Annotations

- [ ] 7.1 Add `vite-plugin-inspect` or equivalent to `vite.config.ts` for import cost visibility
- [ ] 7.2 Document import cost workflow in `CONTRIBUTING.md` (how to view import sizes during development)
- [ ] 7.3 Add ESLint rule or warning for imports from large libraries (e.g., avoid importing all of lodash)
- [ ] 7.4 Add PR template checklist item: "Reviewed import cost for new dependencies"

## 8. Testing

- [ ] 8.1 Write unit test for FPS calculation logic in performance overlay
- [ ] 8.2 Write unit test for memory monitor tracking
- [ ] 8.3 Write unit test for adaptive quality state machine (FPS thresholds, hysteresis)
- [ ] 8.4 Write integration test verifying lazy-loaded episode renders correctly after navigation
- [ ] 8.5 Write E2E test (Playwright) that verifies bundle size is within budget
- [ ] 8.6 Write E2E test (Playwright) that checks Lighthouse performance score > 90 on simulated 3G

## 9. Documentation

- [ ] 9.1 Update `README.md` with performance monitoring features and how to access dev overlay
- [ ] 9.2 Document bundle size budget and how to debug bundle bloat
- [ ] 9.3 Document adaptive quality feature and user setting to disable it
- [ ] 9.4 Add performance troubleshooting guide for contributors
