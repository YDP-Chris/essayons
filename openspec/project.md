# Project Context

## Purpose

Essayons ("Let us try") is a browser-based interactive learning platform that teaches concepts through hands-on exploration. Each "episode" is a self-contained simulation covering one domain (physics, civics, economics, history, biology, engineering). Users learn by manipulating parameters, running experiments, and discovering principles through cause-and-effect — not textbook memorization.

The platform starts with STEM (Orbit Lab as Episode 01) and expands into civics, economics, history, and beyond — any domain where interactive exploration beats passive consumption.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Framework**: React (client-side only, no SSR for MVP)
- **Build tool**: Vite
- **Rendering**: HTML5 Canvas (2D context), WebGL where beneficial
- **Physics**: Real computation — actual equations, not approximations (e.g., Velocity Verlet integration)
- **Hosting**: Vercel (static deployment)
- **Analytics**: Plausible (privacy-respecting, no personal data)
- **Storage**: Browser localStorage (no backend for MVP)
- **Fonts**: Google Fonts — Instrument Serif, DM Sans, IBM Plex Mono
- **Testing**: Vitest (unit), Playwright (e2e)
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions with self-healing build/test pipeline

## Project Conventions

### Code Style

- TypeScript strict mode, no `any` types
- Functional React components with hooks
- Named exports preferred over default exports
- File naming: kebab-case for files, PascalCase for components
- CSS variables for all design tokens (colors, fonts, spacing) — defined in brand design system
- Co-locate tests with source files (`Component.test.tsx` next to `Component.tsx`)

### Architecture Patterns

- **Episode framework**: Each episode is a self-contained module with: simulation engine, parameter controls, visualizations, missions, sandbox mode, reference panel
- **Simulation loop**: requestAnimationFrame-driven with fixed timestep physics and variable render
- **State management**: React state + context for UI; simulation state lives outside React in a plain TypeScript class for performance
- **Canvas rendering**: Dedicated render loop decoupled from React reconciliation
- **Zero-friction principle**: No authentication, no server calls for core functionality

### Testing Strategy

- **Unit tests**: All simulation/physics logic must have unit tests with known-correct values
- **Component tests**: React components tested with Vitest + React Testing Library
- **E2E tests**: Critical user flows (load episode, manipulate parameters, complete mission) via Playwright
- **Performance tests**: Frame rate and load time assertions in CI
- **Self-healing CI**: Build and test must pass before any push to main; pre-commit hooks enforce lint/format; GitHub Actions run full test suite

### Git Workflow

- `main` branch is always deployable
- Feature branches: `feature/<change-id>` matching OpenSpec change IDs
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`)
- PRs require passing CI (build + lint + test) before merge
- No force pushes to `main`

## Domain Context

- **Episode**: A self-contained simulation covering one domain (e.g., Orbit Lab = orbital mechanics)
- **Mission**: A structured objective with success/failure criteria within an episode
- **Sandbox**: Free exploration mode without mission constraints
- **Telemetry**: Real-time data readouts displayed during simulation (velocity, altitude, etc.)
- **Parameter**: A user-adjustable variable that affects the simulation (sliders, buttons, keyboard)
- **Domain accent color**: Each episode/domain has a unique accent color from the brand palette

### Brand Voice (for UI copy)

- Encouraging: Failure is progress ("Crashed? Good — now you know what not to do.")
- Direct: No jargon ("Drag to adjust." not "Utilize the interface to modify...")
- Use: try, experiment, discover, crash, fail, episode, simulation
- Avoid: learn/study/memorize, simplified/approximated, users/students, error/mistake, module/lesson, game

## Important Constraints

- **Zero budget**: Open-source stack only, no paid tools or assets
- **Solo developer**: Ruthless prioritization, episode-by-episode releases
- **Browser-only**: No native apps, no backend for MVP
- **No accounts**: Core features must work without authentication
- **Performance**: <3s load on 3G, >30 FPS on mid-range devices, <100ms input latency
- **Accessibility**: WCAG AA compliance, full keyboard navigation, screen reader support, colorblind-safe (icons reinforce color, 4.5:1 contrast minimum)
- **Privacy**: No personal data collection, analytics are aggregate-only

## External Dependencies

- **Vercel**: Static hosting and deployment
- **Google Fonts**: Instrument Serif, DM Sans, IBM Plex Mono
- **Plausible**: Privacy-respecting analytics (self-hosted or cloud)
- No other external services for MVP — fully client-side
