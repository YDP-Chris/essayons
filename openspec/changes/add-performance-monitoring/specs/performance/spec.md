## ADDED Requirements

### Requirement: FPS Overlay (Dev Mode)

The system SHALL provide a real-time performance overlay in development mode that displays frames per second (FPS), frame time in milliseconds, memory usage, and physics tick count. The overlay MUST only render when the application is running in a development environment (detected via `import.meta.env.DEV` or equivalent). The overlay MUST update at least once per second and MUST NOT itself degrade frame rate by more than 1 FPS. The overlay SHALL be visually non-intrusive (small, semi-transparent, fixed position in a corner) and SHALL NOT block user interaction with the simulation.

#### Scenario: Overlay displays in development mode

- **WHEN** the application loads in development mode
- **THEN** the performance overlay MUST be visible in a fixed corner position showing current FPS, frame time, memory usage, and physics tick count

#### Scenario: Overlay hidden in production

- **WHEN** the application loads in production mode
- **THEN** the performance overlay MUST NOT be rendered and MUST NOT add any runtime overhead

#### Scenario: FPS calculation accuracy

- **WHEN** the simulation is running at 60 FPS for 5 consecutive seconds
- **THEN** the overlay MUST display an FPS value between 58 and 62 (accounting for measurement variance)

#### Scenario: Memory usage displayed

- **WHEN** the overlay renders on a browser supporting `performance.memory` API
- **THEN** the overlay MUST show heap size in megabytes rounded to 2 decimal places

#### Scenario: Memory usage fallback

- **WHEN** the overlay renders on a browser without `performance.memory` API support
- **THEN** the overlay MUST display "N/A" or equivalent placeholder for memory usage without throwing errors

#### Scenario: Overlay does not degrade performance

- **WHEN** the performance overlay is active
- **THEN** the simulation frame rate MUST NOT decrease by more than 1 FPS compared to running without the overlay

### Requirement: Bundle Analysis CI Gate

The system SHALL enforce a bundle size budget in continuous integration that fails builds if the main JavaScript bundle exceeds 300 kilobytes gzipped. The CI pipeline MUST run bundle analysis on every pull request and main branch push. The system SHALL generate a human-readable bundle size report showing per-chunk breakdown. The CI job MUST fail with a clear error message if the budget is exceeded. The bundle size check MUST run after the production build step and before deployment.

#### Scenario: Build passes when bundle is under budget

- **WHEN** a pull request is opened and the main JS bundle is 280KB gzipped
- **THEN** the bundle size CI check MUST pass with a success status

#### Scenario: Build fails when bundle exceeds budget

- **WHEN** a pull request is opened and the main JS bundle is 320KB gzipped
- **THEN** the bundle size CI check MUST fail with an error message indicating the budget was exceeded and by how much

#### Scenario: Bundle size report generated

- **WHEN** the bundle size CI job runs
- **THEN** a report MUST be generated showing the gzipped size of each chunk (main, vendor, per-episode)

#### Scenario: PR comment with bundle breakdown

- **WHEN** a pull request triggers the bundle size check
- **THEN** a PR comment MUST be posted showing the bundle size breakdown and comparison to the base branch (optional but recommended)

#### Scenario: CI runs after build

- **WHEN** the CI pipeline executes
- **THEN** the bundle size check MUST run only after the production build completes successfully

### Requirement: Lazy-Load Episodes

The system SHALL load episode code on-demand using dynamic `import()` statements. Episodes MUST NOT be included in the initial bundle; instead, each episode SHALL be split into a separate chunk by the build tool. When a user navigates to an episode, the system SHALL fetch the corresponding chunk asynchronously. The system MUST display a loading indicator (spinner or skeleton) while the episode chunk is being fetched. The system SHALL preload the next likely episode on navigation hover to reduce perceived latency (optional optimization). Episode chunks MUST be cached by the browser after first load to avoid redundant network requests.

#### Scenario: Episodes split into separate chunks

- **WHEN** the production build completes
- **THEN** each episode MUST be output as a separate JavaScript chunk file (e.g., `orbit-lab-[hash].js`)

#### Scenario: Episode loaded on navigation

- **WHEN** a user navigates to an episode for the first time in a session
- **THEN** the system MUST dynamically import the episode chunk and render the episode once loaded

#### Scenario: Loading indicator shown

- **WHEN** an episode chunk is being fetched over the network
- **THEN** a loading indicator MUST be displayed to the user until the chunk loads

#### Scenario: Episode chunk cached

- **WHEN** a user navigates back to a previously visited episode in the same session
- **THEN** the episode MUST render immediately without fetching the chunk again (served from browser cache)

#### Scenario: Initial bundle excludes episode code

- **WHEN** the initial bundle is loaded
- **THEN** the bundle MUST NOT contain any episode-specific code, reducing initial load size

#### Scenario: Preload on hover (optional)

- **WHEN** a user hovers over a navigation link to an episode
- **THEN** the system MAY prefetch the episode chunk to reduce perceived load time when clicked

### Requirement: Performance Budget CI (Lighthouse)

The system SHALL enforce performance and accessibility budgets using Lighthouse CI. The CI pipeline MUST run Lighthouse audits on every pull request and main branch push using a simulated 3G network and mid-range device profile. The system SHALL fail the CI job if the Lighthouse Performance score falls below 90 or the Accessibility score falls below 95. The Lighthouse configuration MUST test the application's entry point and at least one episode page. The CI job MUST generate a Lighthouse report that can be viewed by developers. The Lighthouse job MUST run after the production build and deployment to a preview URL (or local server).

#### Scenario: CI passes with scores above thresholds

- **WHEN** a pull request triggers Lighthouse CI and the Performance score is 92 and Accessibility score is 97
- **THEN** the Lighthouse CI check MUST pass with a success status

#### Scenario: CI fails when Performance score is too low

- **WHEN** a pull request triggers Lighthouse CI and the Performance score is 85
- **THEN** the Lighthouse CI check MUST fail with an error message indicating the Performance score did not meet the threshold of 90

#### Scenario: CI fails when Accessibility score is too low

- **WHEN** a pull request triggers Lighthouse CI and the Accessibility score is 92
- **THEN** the Lighthouse CI check MUST fail with an error message indicating the Accessibility score did not meet the threshold of 95

#### Scenario: Lighthouse runs on simulated 3G

- **WHEN** the Lighthouse audit executes
- **THEN** it MUST use a simulated 3G network profile to match the project's performance constraint

#### Scenario: Lighthouse report accessible

- **WHEN** the Lighthouse CI job completes
- **THEN** a Lighthouse HTML report MUST be available for developers to view detailed metrics

#### Scenario: Multiple pages audited

- **WHEN** the Lighthouse audit executes
- **THEN** it MUST audit at least the entry page and one episode page to ensure per-episode performance

### Requirement: Memory Leak Detection

The system SHALL monitor event listener count and memory usage to detect potential memory leaks during development. The system MUST track the number of registered event listeners and warn developers if the count grows unboundedly (exceeds a threshold of 500 listeners). The memory monitor MUST integrate with the dev performance overlay to display current listener count. The system SHALL provide documentation on common memory leak patterns (e.g., missing cleanup in React `useEffect` hooks) and how to avoid them. The memory monitor MAY use browser-specific APIs like `getEventListeners()` or a proxy-based tracking mechanism for cross-browser support.

#### Scenario: Listener count displayed in dev overlay

- **WHEN** the performance overlay is active
- **THEN** it MUST display the current number of registered event listeners

#### Scenario: Warning when listener count exceeds threshold

- **WHEN** the tracked event listener count exceeds 500
- **THEN** the system MUST display a console warning or visual alert in the dev overlay indicating a potential memory leak

#### Scenario: Listener count stable during normal operation

- **WHEN** a user interacts with the simulation for 5 minutes (parameter changes, navigation, simulation running)
- **THEN** the event listener count MUST remain relatively stable (variation of less than 20% from baseline)

#### Scenario: Listener count increases unboundedly

- **WHEN** a memory leak is present (e.g., missing cleanup in `useEffect`)
- **THEN** the event listener count MUST grow continuously over time and trigger the threshold warning

#### Scenario: Memory leak documentation available

- **WHEN** a developer encounters a memory leak warning
- **THEN** documentation MUST be accessible explaining common causes and how to debug/fix them

#### Scenario: Cross-browser support for listener tracking

- **WHEN** the memory monitor initializes on a browser without `getEventListeners()` support
- **THEN** it MUST fall back to a proxy-based tracking mechanism or display "N/A" without breaking functionality

### Requirement: Adaptive Canvas Quality

The system SHALL automatically reduce canvas rendering quality when the frame rate drops below 30 FPS to maintain simulation responsiveness. When the system detects FPS below 30 for 2 or more consecutive seconds, it MUST reduce trail point count by 50% and skip vector rendering (arrows, thrust indicators). When FPS recovers above 30 for 3 or more consecutive seconds, the system MUST restore full quality rendering (hysteresis prevents rapid toggling). The system SHALL provide a user setting to disable adaptive quality for power users who prefer full visuals even at lower frame rates. The adaptive quality logic MUST NOT introduce visual glitches or simulation state corruption.

#### Scenario: Quality reduced when FPS drops

- **WHEN** the simulation frame rate drops below 30 FPS and remains below 30 for 2 consecutive seconds
- **THEN** the system MUST reduce trail points by 50% and disable vector rendering

#### Scenario: Quality restored when FPS recovers

- **WHEN** the frame rate recovers above 30 FPS and remains above 30 for 3 consecutive seconds
- **THEN** the system MUST restore full trail points and re-enable vector rendering

#### Scenario: Hysteresis prevents rapid toggling

- **WHEN** the frame rate oscillates around 30 FPS with fluctuations every 0.5 seconds
- **THEN** the quality level MUST NOT toggle more than once every 2 seconds (prevents flicker)

#### Scenario: User can disable adaptive quality

- **WHEN** a user navigates to settings and disables "Adaptive Quality"
- **THEN** the system MUST always render at full quality regardless of frame rate

#### Scenario: Simulation state unaffected

- **WHEN** adaptive quality reduces visual fidelity
- **THEN** the underlying physics simulation state MUST remain accurate and unaffected (only rendering changes, not computation)

#### Scenario: Visual glitch-free transition

- **WHEN** the system transitions from full quality to reduced quality
- **THEN** the change MUST be smooth without visual artifacts, canvas corruption, or abrupt changes

#### Scenario: Low-end device performance improvement

- **WHEN** the simulation runs on a low-end device with baseline FPS of 25
- **THEN** enabling adaptive quality MUST improve frame rate to at least 30 FPS through reduced rendering load

### Requirement: Import Cost Annotations

The system SHALL provide tooling to visualize import costs during development to help developers make informed decisions about dependencies. The system MUST integrate a plugin like `vite-plugin-inspect` to display the bundled size of each import. The development workflow MUST include documentation on how to access and interpret import cost data. The system SHALL enforce code review guidelines that require reviewers to check import costs for new dependencies. The system MAY add ESLint rules or warnings for imports from large libraries that significantly increase bundle size (e.g., importing all of lodash instead of individual functions).

#### Scenario: Import cost visible in dev tools

- **WHEN** a developer runs the application in development mode
- **THEN** import cost information MUST be accessible via a dev tool or browser extension showing the size contribution of each import

#### Scenario: Documentation available for import cost workflow

- **WHEN** a developer wants to review import costs
- **THEN** documentation (e.g., `CONTRIBUTING.md`) MUST explain how to view import sizes and optimize dependencies

#### Scenario: PR checklist includes import cost review

- **WHEN** a pull request is opened that adds new dependencies
- **THEN** the PR template MUST include a checklist item: "Reviewed import cost for new dependencies"

#### Scenario: ESLint warns on large imports (optional)

- **WHEN** a developer imports an entire large library (e.g., `import _ from 'lodash'`)
- **THEN** ESLint MAY emit a warning suggesting tree-shaking-friendly alternatives (e.g., `import debounce from 'lodash/debounce'`)

#### Scenario: Import cost data accurate

- **WHEN** the import cost tool analyzes a module
- **THEN** it MUST display the gzipped size contribution of that module to the final bundle within 5% accuracy

#### Scenario: Developers can identify bundle bloat

- **WHEN** a developer adds a new dependency that increases the bundle by 50KB
- **THEN** the import cost tooling MUST surface this information before the code is merged
