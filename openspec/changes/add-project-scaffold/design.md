## Context

Essayons is a greenfield browser-based interactive learning platform. This change establishes the entire project foundation: build system, code quality tooling, testing infrastructure, CI/CD pipeline, and deployment configuration. Every future change depends on this scaffold being solid.

Key stakeholders: solo developer (project owner). Key constraints: zero budget (open-source only), browser-only client-side app, TypeScript strict mode required, self-healing CI pipeline that prevents broken code from reaching main.

## Goals / Non-Goals

### Goals

- Establish a reproducible, zero-configuration development environment (clone and `npm install` is all that is needed)
- Enforce code quality automatically at every stage: save, commit, push, and PR merge
- Create a self-healing loop where lint and format issues are auto-fixed before commit, and test/build failures block pushes and merges with clear error output
- Deploy static builds to Vercel with zero manual steps
- Set up testing infrastructure that supports unit, component, and e2e tests from day one
- Keep the scaffold minimal: only what is needed for the first episode, no premature abstractions

### Non-Goals

- Server-side rendering or backend infrastructure (client-side only for MVP)
- Authentication or user account system
- Database setup (localStorage only for MVP)
- Episode-specific code (that comes in later proposals)
- Advanced CI features like canary deployments, feature flags, or A/B testing
- Monorepo tooling (single package for now)

## Decisions

### Build Tool: Vite

- **Decision**: Use Vite with the `@vitejs/plugin-react` plugin.
- **Why**: Vite provides instant dev server startup via native ES modules, fast HMR, and optimized production builds with Rollup. It is the standard choice for new React + TypeScript projects.
- **Alternatives considered**: Create React App (deprecated, slow builds), Next.js (adds SSR complexity we do not need), esbuild directly (lacks plugin ecosystem for React).

### TypeScript Configuration: Maximum Strictness

- **Decision**: Enable `strict: true` plus additional flags: `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`.
- **Why**: The project handles physics simulations where type safety prevents subtle numerical bugs. Strict mode catches errors at compile time rather than runtime.
- **Alternatives considered**: Gradual strictness (risks accumulating tech debt from day one).

### Linting: ESLint Flat Config + Prettier

- **Decision**: Use ESLint with flat config format (`eslint.config.js`), TypeScript parser, React hooks plugin, and `eslint-config-prettier` to avoid conflicts. Prettier handles all formatting.
- **Why**: Flat config is the current ESLint standard. Separating linting (ESLint) from formatting (Prettier) avoids rule conflicts and keeps each tool focused.
- **Alternatives considered**: ESLint legacy config (`.eslintrc.*`) is being deprecated. Biome (newer but less mature ecosystem support for React plugins).

### Testing: Vitest + Playwright

- **Decision**: Vitest for unit and component tests (with jsdom and React Testing Library). Playwright for end-to-end tests across Chromium, Firefox, and WebKit.
- **Why**: Vitest shares Vite's config and transform pipeline, making it fast and consistent. Playwright covers real browser behavior across engines, critical for a Canvas-heavy app.
- **Alternatives considered**: Jest (slower, requires separate transform config), Cypress (heavier, single-browser focus for free tier).

### Git Hooks: Husky + lint-staged

- **Decision**: Husky manages Git hooks. lint-staged runs ESLint --fix and Prettier --write on staged files during pre-commit. Pre-push hook runs the full test suite and type check.
- **Why**: This is the self-healing loop. Auto-fixing on commit means developers never waste time on formatting. Blocking push on test failure means broken code cannot reach the remote.
- **Alternatives considered**: simple-git-hooks (lighter but less ecosystem support), lefthook (Go-based, adds non-Node dependency).

### CI/CD: GitHub Actions

- **Decision**: Single workflow file (`.github/workflows/ci.yml`) with parallel jobs: build, lint, type-check, unit-test, e2e-test. Runs on pull_request to main and push to main.
- **Why**: GitHub Actions is free for public repos, integrates natively with GitHub branch protection, and supports caching for node_modules and Playwright browsers.
- **Alternatives considered**: Vercel CI (limited to build checks only), CircleCI (unnecessary complexity for solo project).

### Deployment: Vercel Static

- **Decision**: Deploy to Vercel as a static site. Preview deployments on PRs, production deployment on merge to main.
- **Why**: Vercel provides free static hosting with automatic preview deployments, custom domains, and edge CDN. The `vercel.json` config keeps deployment reproducible.
- **Alternatives considered**: Netlify (comparable, but Vercel has better Vite integration), GitHub Pages (no preview deployments).

## Architecture: Self-Healing CI/CD Pipeline

The pipeline enforces quality at four gates, each progressively stricter:

```
Developer writes code
        |
        v
  [Gate 1: On Save]
  IDE integration (optional) - ESLint + Prettier auto-format
        |
        v
  [Gate 2: Pre-Commit Hook]
  lint-staged runs on staged files:
    - ESLint --fix (auto-fixes, fails on unfixable errors)
    - Prettier --write (auto-formats)
    - tsc --noEmit (type-check, blocks commit on errors)
  If any step fails -> commit is rejected with clear error output
        |
        v
  [Gate 3: Pre-Push Hook]
  Full validation before code leaves the machine:
    - npm run test:unit (all unit tests must pass)
    - npm run build (production build must succeed)
  If any step fails -> push is rejected with clear error output
        |
        v
  [Gate 4: GitHub Actions CI]
  Runs on every PR and push to main:
    - Install dependencies (cached)
    - Build (vite build)
    - Lint (eslint .)
    - Type-check (tsc --noEmit)
    - Unit tests (vitest run --coverage)
    - E2E tests (playwright test)
  If any job fails -> PR cannot be merged (branch protection)
        |
        v
  [Gate 5: Branch Protection]
  main branch rules:
    - Require all CI checks to pass
    - No direct pushes to main
    - No force pushes to main
    - Require pull request before merging
```

### Self-Healing Behavior

- **Auto-fix**: Gates 1 and 2 automatically fix lint and format issues. The developer only sees errors for things that cannot be auto-fixed (actual code bugs, type errors).
- **Clear error output**: Every gate provides specific, actionable error messages. CI logs show exactly which test failed and why.
- **Fast feedback**: Pre-commit hooks run only on staged files (seconds). Pre-push runs the full suite (under 30 seconds for a small project). CI provides parallel jobs for speed.
- **No bypass**: Husky hooks cannot be skipped without `--no-verify` (which is a deliberate override). Branch protection cannot be bypassed without admin access.

## Project Directory Structure

```
essayons/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── .husky/
│   ├── pre-commit              # lint-staged
│   └── pre-push                # full test + build
├── e2e/
│   └── app.spec.ts             # Playwright e2e smoke test
├── public/                     # Static assets (favicon, etc.)
├── src/
│   ├── components/             # Shared React components
│   ├── episodes/               # Episode modules (future)
│   ├── shared/                 # Shared utilities, types, constants
│   ├── styles/
│   │   └── global.css          # CSS variables, global resets
│   ├── App.tsx                 # Root component
│   ├── App.test.tsx            # Root component smoke test
│   └── main.tsx                # Entry point
├── openspec/                   # Spec-driven development files
├── .prettierrc                 # Prettier config
├── eslint.config.js            # ESLint flat config
├── index.html                  # Vite entry HTML
├── package.json                # Dependencies, scripts, lint-staged config
├── playwright.config.ts        # Playwright config
├── tsconfig.json               # Base TypeScript config
├── tsconfig.app.json           # App source TypeScript config
├── tsconfig.node.json          # Node/tooling TypeScript config
├── vercel.json                 # Vercel deployment config
├── vite.config.ts              # Vite build config
└── vitest.config.ts            # Vitest test config
```

## Risks / Trade-offs

- **Risk**: Pre-push hook running full test suite may slow down development as the project grows.
  - **Mitigation**: Keep the hook running only unit tests and build (not e2e). E2e tests run only in CI. Revisit if push takes >60 seconds.

- **Risk**: Husky hooks can be bypassed with `--no-verify`.
  - **Mitigation**: Branch protection on main is the true gate. Hooks are a convenience layer, not the sole defense. CI is authoritative.

- **Risk**: Over-engineering the scaffold for a solo project.
  - **Mitigation**: Every tool included has a specific purpose justified by project.md requirements. No tool is added speculatively. The scaffold is minimal: it supports exactly one empty app with one smoke test.

- **Risk**: Playwright browser installation inflates CI time and local setup.
  - **Mitigation**: Cache Playwright browsers in CI. Locally, `npx playwright install` is a one-time step documented in setup instructions.

## Migration Plan

Not applicable. This is a greenfield project scaffold with no existing code to migrate.

## Open Questions

- **Plausible analytics**: Should the analytics script tag be included in `index.html` in this scaffold, or deferred to a later proposal? Recommendation: defer to a later proposal to keep this scaffold focused on build/test/deploy infrastructure.
- **CSS approach**: project.md specifies CSS variables for design tokens. Should we adopt CSS Modules, Tailwind, or plain CSS files? Recommendation: start with plain CSS files using CSS variables (simplest, no additional tooling), evaluate CSS Modules when component count exceeds ~20.
- **Path aliases**: `@/` mapped to `src/` requires configuration in both `tsconfig.json` and `vite.config.ts`. Confirm this is desired over relative imports. Recommendation: use `@/` aliases for cleaner imports.
