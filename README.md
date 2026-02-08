<p align="center">
  <strong style="font-size: 3em;">E</strong>
</p>

<h1 align="center">Essayons</h1>

<p align="center">
  <em>Learn by crashing into things.</em>
</p>

<p align="center">
  <a href="https://essayons.vercel.app">Live Demo</a> &middot;
  <a href="#episodes">Episodes</a> &middot;
  <a href="#for-educators">For Educators</a> &middot;
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tests-745%20passing-brightgreen" alt="745 tests passing" />
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/bundle-70KB%20gzip-green" alt="70KB gzipped" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  <img src="https://img.shields.io/badge/WCAG-AA-green" alt="WCAG AA" />
</p>

---

**Essayons** (French: _"Let us try"_) is a browser-based interactive learning platform where you learn by doing, not by reading. Each episode is a real simulation — real physics, real math, real consequences. Crash a spacecraft, collapse a bridge, crash a market. Then figure out why.

No accounts. No servers. No friction. Just a URL and curiosity.

## Why Essayons?

Traditional education tells you _F = ma_. Essayons lets you **feel** it.

- **Real computation** — Velocity Verlet integration, not hand-waving. Hardy-Weinberg equilibrium, not flash cards. Euler beam analysis, not toy models.
- **Zero friction** — Share a URL, and someone is learning. No signup, no install, no IT tickets. Works on any device with a browser.
- **Any domain** — Physics today, civics tomorrow, economics next week. The episode framework scales to any subject where interactive exploration beats passive consumption.
- **Failure is the curriculum** — Crashed your rocket? Good. Now you know what 89 degrees does. Every failure teaches something a textbook can't.

## Episodes

Each episode is a self-contained simulation with adjustable parameters, guided missions, and reference material.

| Episode         | Domain      | What You'll Break                                                                                                                                                 |
| --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Orbit Lab**   | Physics     | Launch spacecraft, achieve orbit, crash into planets. Velocity Verlet integration, real gravity, Kepler's laws in action.                                         |
| **Citizen Lab** | Civics      | Navigate the legislative process. Pass bills, trigger filibusters, override vetoes. State machine simulation of checks and balances.                              |
| **Market Lab**  | Economics   | Watch supply meet demand. Set price floors, crash markets, discover deadweight loss. Agent-based market simulation.                                               |
| **Gene Lab**    | Biology     | Breed organisms across generations. Watch Mendel's ratios emerge, apply selection pressure, observe Hardy-Weinberg equilibrium break down.                        |
| **Bridge Lab**  | Engineering | Build truss structures, apply loads, watch them fail. Warren truss analysis with real stress/strain physics. Crank the load to 100 tonnes and watch steel buckle. |
| **History Lab** | History     | _Coming soon._                                                                                                                                                    |

### How Episodes Work

```
Adjust parameters  -->  Watch the simulation  -->  Complete missions  -->  Read why it works
     (sliders)           (canvas rendering)         (objectives)          (reference panel)
```

Every episode follows this loop. Change something, observe the result, understand the principle.

## For Educators

Essayons is built for classrooms. No setup, no accounts, no IT requests.

### Teacher Dashboard (`/#/teach`)

- **Classroom Link Generator** — Select episodes, missions, and parameter presets. Generate a single URL that configures everything for your students.
- **Episode Sequence Builder** — Order episodes into a lesson plan. Students follow the sequence automatically.
- **Student Progress Viewer** — Students export their progress as JSON. Upload the files to see who completed what.
- **Lesson Plan Export** — Download a printable lesson plan as Markdown or PDF.

All data stays on-device. No student accounts. No data leaves the browser.

## Quick Start

```bash
# Clone and install
git clone https://github.com/YDP-Chris/essayons.git
cd essayons
npm install

# Development
npm run dev           # Start dev server at localhost:5173

# Validate everything
npm run validate      # typecheck + lint + test + build

# Individual checks
npm run typecheck     # TypeScript strict mode
npm run lint          # ESLint with jsx-a11y
npm run test          # 745 tests via Vitest
npm run build         # Production build
```

## Architecture

```
src/
  engine/               Simulation engine (continuous + discrete modes)
    SimulationEngine    requestAnimationFrame loop, fixed timestep physics
    DiscreteEngine      Step/event/turn-based simulation modes
    CanvasRenderer      Layered canvas rendering with device pixel ratio
    TimeController      Play, pause, speed control
    ParameterSystem     Runtime parameter management
    MissionManager      Objective evaluation and mission lifecycle
    adaptive-quality    FPS monitoring, automatic quality reduction

  episodes/             Episode framework
    EpisodeShell        Generic React wrapper for any episode
    LazyEpisodeShell    Code-split loading with dynamic import()
    orbit-lab/          Physics: orbital mechanics, 4 missions
    citizen-lab/        Civics: legislative state machine, 4 missions
    market-lab/         Economics: supply/demand agents, 4 missions
    gene-lab/           Biology: Mendelian genetics, 4 missions
    bridge-lab/         Engineering: Warren truss analysis, 4 missions

  components/
    ui/                 Design system: Button, Slider, Card, Drawer, etc.
    icons/              SVG icon registry (6 domain + 8 UI icons)
    landing/            Landing page sections
    teacher/            Teacher dashboard components
    DomainOrbit         Animated brand visual (3 rings, 6 domain nodes)

  shared/
    router/             Hash-based router (zero dependencies)
    url-state/          URL codec for shareable simulation states
    accessibility/      Focus trap, ARIA live regions, reduced motion

  features/
    onboarding/         First-visit tutorial with spotlight overlay

  dev/                  Dev-only tools (tree-shaken in production)
    PerformanceOverlay  FPS, frame time, memory, listener count
    memory-monitor      Event listener leak detection

  storage/              localStorage progress tracking
  analytics/            Plausible wrapper (privacy-respecting)
  audio/                Web Audio procedural sound synthesis
  hooks/                Shared React hooks
  pages/                Page-level components (TeacherDashboard)
  utils/                Utilities (lesson plan codec, progress parser)
```

### Key Design Decisions

| Decision                                    | Why                                                                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Simulation state lives outside React**    | Canvas physics at 60 FPS can't go through React reconciliation. Plain TS classes own state; React subscribes via `useSyncExternalStore`. |
| **Fixed timestep physics, variable render** | Deterministic simulation regardless of frame rate. Accumulator pattern ensures physics steps are always the same dt.                     |
| **Hash-based routing**                      | Works on any static host. No server-side routing needed. Shareable URLs out of the box.                                                  |
| **Zero backend**                            | localStorage for progress, URL encoding for sharing, Plausible for analytics. Nothing to deploy, nothing to maintain.                    |
| **Lazy-loaded episodes**                    | Each episode is a separate chunk. Initial bundle is 70KB gzipped. Episodes load on navigation (~6-26KB each).                            |
| **Episode registry pattern**                | Episodes self-register via side-effect imports. The shell doesn't know about specific episodes — it just renders whatever is registered. |

### Performance

- **Initial load**: 70KB gzipped (main bundle) + 22KB CSS
- **Episode chunks**: 6-26KB each, loaded on demand
- **Build time**: ~1.5 seconds
- **Target**: <3s load on 3G, >30 FPS on mid-range devices
- **Adaptive quality**: Automatically reduces rendering fidelity when FPS drops below 30
- **Dev overlay**: Real-time FPS, frame time, memory, and listener count (dev mode only)

## Accessibility

Essayons is committed to WCAG 2.1 AA compliance.

- **Keyboard navigation** — Every interactive element is reachable via Tab, activatable via Enter/Space
- **Screen reader support** — ARIA live regions announce simulation events, mission status, parameter changes
- **Focus indicators** — Visible `:focus-visible` outlines on all interactive elements (2px minimum, 3:1 contrast)
- **Focus traps** — Modal dialogs and the onboarding tutorial trap focus correctly
- **Reduced motion** — All animations respect `prefers-reduced-motion`
- **Touch targets** — 44x44px minimum on mobile
- **Color contrast** — 4.5:1 minimum for all text, colorblind-safe design (icons always reinforce color)
- **Skip navigation** — "Skip to content" link on every page
- **Canvas alternatives** — `role="img"` with descriptive `aria-label` on all simulation canvases

## Onboarding

First-time visitors to Orbit Lab get a guided 6-step tutorial:

1. **Welcome** — "This is Essayons — learn by trying"
2. **Canvas** — "This is your simulation — watch what happens"
3. **Parameters** — "Drag these sliders to change the physics"
4. **Missions** — "Complete objectives to learn concepts"
5. **Reference** — "Read about the science behind what you see"
6. **Share** — "Share your discoveries with a link"

Skip anytime. Restart from the episode nav bar. Respects reduced motion and screen readers.

## Testing

```
745 tests across 32 test files

  Physics engines      — Velocity Verlet, Euler integration, CFL stability
  State machines       — Legislative process, mission lifecycle
  Genetics             — Mendelian ratios, Hardy-Weinberg, drift
  Market simulation    — Supply/demand, price discovery, surplus
  Structural physics   — Stress/strain, beam breakage, safety factors
  Components           — All UI components, teacher tools, onboarding
  Accessibility        — Focus traps, ARIA, reduced motion
  Performance          — FPS calculation, adaptive quality, memory monitor
  URL encoding         — Round-trip codec, progress parser
  Episode validation   — Config schema, parameter bounds
```

Run tests:

```bash
npm test              # All tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Tech Stack

| Layer      | Tool                | Why                                                     |
| ---------- | ------------------- | ------------------------------------------------------- |
| Language   | TypeScript (strict) | Type safety for simulation math                         |
| Framework  | React 19            | Component model for UI panels                           |
| Build      | Vite 7              | Fast dev server, native ESM, code splitting             |
| Rendering  | HTML5 Canvas        | Direct pixel control for simulations                    |
| Testing    | Vitest              | Fast, TypeScript-native, same config as Vite            |
| E2E        | Playwright          | Cross-browser testing                                   |
| Linting    | ESLint + jsx-a11y   | Code quality + accessibility                            |
| Formatting | Prettier            | Consistent style                                        |
| CI         | GitHub Actions      | Self-healing pipeline (typecheck + lint + test + build) |
| Hosting    | Vercel              | Static deployment, zero config                          |
| Analytics  | Plausible           | Privacy-respecting, no cookies                          |
| Fonts      | Google Fonts        | Instrument Serif, DM Sans, IBM Plex Mono                |

**Dependencies**: React + ReactDOM. That's it. Everything else is dev tooling.

## Scaffolding New Episodes

```bash
npm run scaffold:episode
```

The CLI generates a complete episode directory with:

- Config file (parameters, missions, reference content)
- Simulation module (physics/state logic)
- Renderer (canvas drawing)
- Index (registration)
- Test file
- Type definitions

## Project Structure

```
essayons/
  src/                  Application source
  scripts/              CLI tools (episode scaffold)
  openspec/             Spec-driven development (proposals, specs, tasks)
  dist/                 Production build output
  .github/              CI/CD workflows
  .husky/               Git hooks (pre-commit lint, pre-push test)
```

## Contributing

1. Check [open issues](https://github.com/YDP-Chris/essayons/issues)
2. Read `openspec/AGENTS.md` for the spec-driven workflow
3. Run `npm run validate` before pushing
4. Follow [conventional commits](https://www.conventionalcommits.org/)

The project uses **OpenSpec** for spec-driven development. New features go through a proposal process: `proposal.md` -> review -> `tasks.md` -> implement -> archive.

## License

MIT

---

<p align="center">
  <em>Essayons</em> — Let us try.
</p>
