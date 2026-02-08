# Change: Add performance guardrails and monitoring

## Why

Essayons runs intensive Canvas-based simulations that must maintain 30+ FPS on mid-range devices while staying under 3-second load times on 3G connections. Without visibility into performance metrics, degradation can creep in unnoticed. This change adds developer tooling (FPS overlay), CI gates (bundle size, Lighthouse thresholds), runtime adaptivity (quality reduction when FPS drops), and memory leak detection to ensure performance budgets are maintained as the platform grows.

## What Changes

- Add FPS overlay in dev mode showing real-time FPS, frame time, memory usage, and physics tick count
- Implement bundle analysis CI gate that fails builds if JS bundle exceeds 300KB gzipped
- Enable lazy-loading of episodes via dynamic `import()` — only load episode code when user navigates to it
- Add Lighthouse CI integration with performance budget thresholds (Performance > 90, Accessibility > 95)
- Implement memory leak detection that tracks event listener count and warns if growing unboundedly
- Add adaptive canvas quality: automatically reduce trail points and skip vector rendering when FPS falls below 30
- Integrate import cost annotations in code review via `vite-plugin-inspect` or similar tooling

## Impact

- Affected specs: `performance` (new capability)
- Affected code:
  - `src/dev/performance-overlay.tsx` (new FPS overlay component)
  - `vite.config.ts` (bundle analysis plugin, code splitting config)
  - `src/router.tsx` or routing logic (lazy route imports)
  - `.github/workflows/ci.yml` (Lighthouse CI job, bundle size check)
  - `src/simulation/canvas-renderer.ts` (adaptive quality logic)
  - `src/utils/memory-monitor.ts` (new memory leak detection utility)
  - Episode components (lazy import wrappers)
