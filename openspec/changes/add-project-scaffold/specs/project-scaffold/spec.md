## ADDED Requirements

### Requirement: Vite Build System

The system SHALL use Vite as the build tool with the React plugin, producing a static site output in the `dist/` directory. The production build SHALL complete with zero errors and zero warnings. The build output SHALL be a fully self-contained static site that can be served by any static file server.

#### Scenario: Production build succeeds

- **WHEN** `npm run build` is executed
- **THEN** Vite produces a static site in `dist/` with zero errors and zero warnings

#### Scenario: Build fails on TypeScript errors

- **WHEN** `npm run build` is executed and the source contains TypeScript type errors
- **THEN** the build fails with a non-zero exit code and outputs the specific type errors

#### Scenario: Development server starts with hot reload

- **WHEN** `npm run dev` is executed
- **THEN** Vite starts a development server with hot module replacement enabled and the app is accessible in the browser

### Requirement: TypeScript Strict Mode

The system SHALL use TypeScript in strict mode with the following compiler options enabled: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`, `forceConsistentCasingInFileNames: true`. No `any` types SHALL be permitted in application source code.

#### Scenario: Type checking passes on clean codebase

- **WHEN** `tsc --noEmit` is executed on the project
- **THEN** type checking completes with zero errors

#### Scenario: Type checking catches strict mode violations

- **WHEN** source code contains an implicit `any` type, unchecked indexed access, or missing return statement
- **THEN** `tsc --noEmit` fails with a non-zero exit code and reports the specific violation

### Requirement: Pre-Commit Hook with Auto-Fix

The system SHALL run a pre-commit hook via Husky and lint-staged on every `git commit`. The hook SHALL execute ESLint with `--fix`, Prettier with `--write`, and TypeScript type checking (`tsc --noEmit`) on staged files. Auto-fixable lint and format issues SHALL be corrected automatically. The commit SHALL be blocked if any unfixable errors remain, with clear error output indicating the specific failures.

#### Scenario: Auto-fixable issues are corrected on commit

- **WHEN** a developer runs `git commit` and staged files contain auto-fixable ESLint or Prettier issues
- **THEN** lint-staged automatically fixes the issues, stages the corrected files, and the commit succeeds

#### Scenario: Commit blocked on unfixable lint errors

- **WHEN** a developer runs `git commit` and staged files contain ESLint errors that cannot be auto-fixed
- **THEN** the commit is rejected with a non-zero exit code and the terminal displays the specific lint errors

#### Scenario: Commit blocked on type errors

- **WHEN** a developer runs `git commit` and staged files contain TypeScript type errors
- **THEN** the commit is rejected with a non-zero exit code and the terminal displays the specific type errors

### Requirement: Pre-Push Hook with Full Validation

The system SHALL run a pre-push hook via Husky on every `git push`. The hook SHALL execute the full unit test suite and a production build. The push SHALL be blocked if any test fails or the build fails, with clear error output indicating the specific failures.

#### Scenario: Push succeeds when all checks pass

- **WHEN** a developer runs `git push` and all unit tests pass and the build succeeds
- **THEN** the push proceeds to the remote repository

#### Scenario: Push blocked on test failure

- **WHEN** a developer runs `git push` and one or more unit tests fail
- **THEN** the push is rejected with a non-zero exit code and the terminal displays the failing test names and error details

#### Scenario: Push blocked on build failure

- **WHEN** a developer runs `git push` and the production build fails
- **THEN** the push is rejected with a non-zero exit code and the terminal displays the build error output

### Requirement: GitHub Actions CI Pipeline

The system SHALL run a GitHub Actions CI workflow on every pull request targeting `main` and on every push to `main`. The workflow SHALL execute the following checks as parallel jobs: production build, ESLint, TypeScript type checking, Vitest unit tests with coverage reporting, and Playwright end-to-end tests. All jobs MUST pass for the workflow to succeed. The workflow SHALL cache `node_modules` and Playwright browser binaries to minimize execution time.

#### Scenario: CI passes on a clean pull request

- **WHEN** a pull request is opened against `main` with code that passes all quality checks
- **THEN** the CI workflow completes successfully with all jobs (build, lint, type-check, unit-test, e2e-test) passing

#### Scenario: CI fails on lint errors and blocks merge

- **WHEN** a pull request is opened against `main` with code that contains ESLint errors
- **THEN** the lint job fails, the overall workflow fails, and the PR cannot be merged via branch protection

#### Scenario: CI fails on failing tests and blocks merge

- **WHEN** a pull request is opened against `main` with code that causes unit or e2e test failures
- **THEN** the relevant test job fails with clear output showing which tests failed and why, the overall workflow fails, and the PR cannot be merged

#### Scenario: CI caches dependencies for fast runs

- **WHEN** a CI workflow runs and a previous run has cached `node_modules` and Playwright browsers for the same lockfile hash
- **THEN** the workflow restores from cache instead of reinstalling, reducing total execution time

### Requirement: Branch Protection for Main

The system SHALL enforce branch protection rules on the `main` branch. The rules SHALL require: all GitHub Actions CI checks pass before merge, a pull request is required before merging (no direct pushes), and force pushes to `main` are prohibited.

#### Scenario: Merge blocked without passing CI

- **WHEN** a pull request targets `main` and one or more CI checks have not passed
- **THEN** the merge button is disabled and GitHub displays which checks are required

#### Scenario: Direct push to main rejected

- **WHEN** a developer attempts to push directly to `main` without a pull request
- **THEN** the push is rejected by GitHub branch protection

#### Scenario: Force push to main rejected

- **WHEN** a developer attempts to force-push to `main`
- **THEN** the push is rejected by GitHub branch protection

### Requirement: Development Server

The system SHALL provide a development server via `npm run dev` that starts in under 5 seconds, supports hot module replacement for React components and CSS, and reflects saved changes in the browser without a full page reload. Path aliases (`@/` mapped to `src/`) SHALL resolve correctly in both the dev server and production build.

#### Scenario: Dev server starts quickly

- **WHEN** `npm run dev` is executed in the project root
- **THEN** the Vite dev server starts and is ready to serve requests in under 5 seconds

#### Scenario: Hot module replacement updates components

- **WHEN** the dev server is running and a developer saves a change to a React component file
- **THEN** the browser updates the component without a full page reload and without losing component state

#### Scenario: Path aliases resolve correctly

- **WHEN** source code imports a module using the `@/` path alias (e.g., `import { Foo } from '@/shared/foo'`)
- **THEN** the import resolves correctly in both `npm run dev` and `npm run build`

### Requirement: Vercel Static Deployment

The system SHALL be deployable to Vercel as a static site. A `vercel.json` configuration file SHALL specify the build command (`npm run build`), output directory (`dist`), and framework (`vite`). Vercel SHALL automatically create preview deployments for pull requests and production deployments when changes are merged to `main`.

#### Scenario: Vercel builds and deploys from main

- **WHEN** a pull request is merged to `main`
- **THEN** Vercel runs the build command, deploys the `dist/` output to production, and the site is accessible at the production URL

#### Scenario: Vercel creates preview deployment for PRs

- **WHEN** a pull request is opened or updated
- **THEN** Vercel creates a preview deployment with a unique URL and posts the URL as a comment on the PR

### Requirement: ESLint Code Quality Gate

The system SHALL enforce ESLint rules using flat config format (`eslint.config.js`) with TypeScript parser, React hooks plugin, and import ordering rules. ESLint SHALL be configured to not conflict with Prettier (via `eslint-config-prettier`). The `npm run lint` command SHALL exit with a non-zero code if any errors are found. The `npm run lint:fix` command SHALL auto-fix all fixable issues.

#### Scenario: Lint check passes on clean code

- **WHEN** `npm run lint` is executed on code that follows all ESLint rules
- **THEN** the command exits with code 0 and produces no error output

#### Scenario: Lint check fails on violations

- **WHEN** `npm run lint` is executed on code that violates ESLint rules (e.g., unused variables, missing React hook dependencies)
- **THEN** the command exits with a non-zero code and lists each violation with file path, line number, and rule name

#### Scenario: Lint fix auto-corrects fixable issues

- **WHEN** `npm run lint:fix` is executed on code with auto-fixable issues (e.g., import ordering, missing semicolons)
- **THEN** the fixable issues are corrected in place and the command exits with code 0

### Requirement: Prettier Format Gate

The system SHALL enforce consistent code formatting via Prettier with a `.prettierrc` configuration file. The `npm run format:check` command SHALL exit with a non-zero code if any files do not match the Prettier format. The `npm run format` command SHALL auto-format all files in place.

#### Scenario: Format check passes on correctly formatted code

- **WHEN** `npm run format:check` is executed on code that matches the Prettier configuration
- **THEN** the command exits with code 0

#### Scenario: Format check fails on unformatted code

- **WHEN** `npm run format:check` is executed on code that does not match the Prettier configuration
- **THEN** the command exits with a non-zero code and lists the files that need formatting

#### Scenario: Format command auto-formats files

- **WHEN** `npm run format` is executed
- **THEN** all project source files are reformatted to match the Prettier configuration and the command exits with code 0

### Requirement: Unit Testing with Vitest

The system SHALL support unit and component testing via Vitest with a jsdom environment and React Testing Library. Tests SHALL be co-located with source files (e.g., `Component.test.tsx` next to `Component.tsx`). The `npm run test:unit` command SHALL run all unit tests. The `npm run test:coverage` command SHALL run tests with coverage reporting and enforce minimum coverage thresholds.

#### Scenario: Unit tests run and pass

- **WHEN** `npm run test:unit` is executed
- **THEN** Vitest discovers and runs all `*.test.ts` and `*.test.tsx` files, reports results, and exits with code 0 if all tests pass

#### Scenario: Unit test failure exits with non-zero code

- **WHEN** `npm run test:unit` is executed and one or more tests fail
- **THEN** Vitest reports the failing test names, expected vs. actual values, and exits with a non-zero code

#### Scenario: Smoke test validates app renders

- **WHEN** `npm run test:unit` is executed with the initial scaffold
- **THEN** the `App.test.tsx` smoke test renders the App component without errors and the test passes

### Requirement: End-to-End Testing with Playwright

The system SHALL support end-to-end testing via Playwright configured to run against Chromium, Firefox, and WebKit browsers. The `npm run test:e2e` command SHALL start the dev server (or use the build output), run all Playwright tests, and report results. E2E tests SHALL live in the `e2e/` directory at the project root.

#### Scenario: E2E tests run across browsers

- **WHEN** `npm run test:e2e` is executed
- **THEN** Playwright runs all tests in `e2e/` against Chromium, Firefox, and WebKit, and reports results per browser

#### Scenario: E2E smoke test validates app loads

- **WHEN** `npm run test:e2e` is executed with the initial scaffold
- **THEN** the `e2e/app.spec.ts` smoke test navigates to the app URL, verifies the page loads, and the test passes

#### Scenario: E2E test failure provides actionable output

- **WHEN** an e2e test fails
- **THEN** Playwright outputs the failing test name, browser, screenshot (if configured), and the specific assertion that failed
