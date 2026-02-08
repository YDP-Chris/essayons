## 1. Project Initialization

- [ ] 1.1 Initialize Vite project with `react-ts` template
- [ ] 1.2 Configure `tsconfig.json` with strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`)
- [ ] 1.3 Configure `tsconfig.app.json` and `tsconfig.node.json` for source and tooling separation
- [ ] 1.4 Update `package.json` with project metadata (name: essayons, version: 0.1.0, license, scripts)

## 2. Directory Structure

- [ ] 2.1 Create `src/` directory with initial structure: `src/components/`, `src/episodes/`, `src/shared/`, `src/styles/`
- [ ] 2.2 Create minimal `src/App.tsx` component with named export
- [ ] 2.3 Create `src/main.tsx` entry point
- [ ] 2.4 Create `src/styles/global.css` with CSS variable tokens from brand system (fonts, colors, spacing)
- [ ] 2.5 Create `public/` directory for static assets

## 3. Build System

- [ ] 3.1 Configure `vite.config.ts` with React plugin, path aliases (`@/` mapped to `src/`), and build output settings
- [ ] 3.2 Verify `vite build` completes with zero errors and zero warnings
- [ ] 3.3 Verify `vite dev` starts dev server with hot module replacement working

## 4. Linting and Formatting

- [ ] 4.1 Install and configure ESLint with TypeScript parser, React hooks plugin, and import ordering rules
- [ ] 4.2 Install and configure Prettier with project rules (single quotes, trailing commas, 100 char print width)
- [ ] 4.3 Add `eslint-config-prettier` to disable ESLint rules that conflict with Prettier
- [ ] 4.4 Add npm scripts: `lint`, `lint:fix`, `format`, `format:check`
- [ ] 4.5 Verify `npm run lint` and `npm run format:check` pass on the initial codebase

## 5. Testing Setup

- [ ] 5.1 Install and configure Vitest with `vitest.config.ts` (jsdom environment, coverage thresholds)
- [ ] 5.2 Install React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`)
- [ ] 5.3 Create `src/App.test.tsx` smoke test that renders App and verifies it mounts without errors
- [ ] 5.4 Install and configure Playwright with `playwright.config.ts` (chromium, firefox, webkit projects)
- [ ] 5.5 Create `e2e/app.spec.ts` smoke test that loads the page and verifies the app renders
- [ ] 5.6 Add npm scripts: `test`, `test:unit`, `test:e2e`, `test:coverage`
- [ ] 5.7 Verify `npm run test:unit` and `npm run test:e2e` both pass

## 6. Self-Healing CI/CD Pipeline

- [ ] 6.1 Install Husky and initialize with `husky init`
- [ ] 6.2 Install lint-staged and configure in `package.json` or `.lintstagedrc`
- [ ] 6.3 Create pre-commit hook: run lint-staged (ESLint --fix, Prettier --write, tsc --noEmit on staged files)
- [ ] 6.4 Create pre-push hook: run full test suite (`npm run test:unit`, type-check, build)
- [ ] 6.5 Create `.github/workflows/ci.yml` with jobs: build, lint, type-check, unit-test, e2e-test
- [ ] 6.6 Configure CI workflow to run on pull_request to main and on push to main
- [ ] 6.7 Configure CI to cache node_modules and Playwright browsers for faster runs
- [ ] 6.8 Add CI status badge to future README
- [ ] 6.9 Document branch protection rules to be enabled on GitHub (require CI pass, no force push to main, require PR reviews)

## 7. Deployment Configuration

- [ ] 7.1 Create `vercel.json` with static build configuration (output directory: `dist`, framework: vite)
- [ ] 7.2 Configure Vercel to deploy preview builds on PRs and production on main merge
- [ ] 7.3 Verify `npm run build` output in `dist/` is a valid static site

## 8. Validation

- [ ] 8.1 Run full self-healing pipeline end-to-end: commit triggers pre-commit hooks, push triggers pre-push hooks
- [ ] 8.2 Verify CI workflow runs successfully on a test PR
- [ ] 8.3 Verify Vercel preview deployment serves the app correctly
- [ ] 8.4 Confirm TypeScript strict mode catches intentional type errors (manual verification)
