# Change: Set up project foundation with self-healing CI/CD pipeline

## Why

Essayons has no codebase yet. Before building any episodes or UI, we need a solid project scaffold: a TypeScript + React + Vite project with strict type checking, automated code quality gates, and a self-healing CI/CD pipeline that prevents broken code from ever reaching the main branch.

## What Changes

- Initialize Vite project with React and TypeScript strict mode
- Configure ESLint (flat config) with TypeScript and React rules, plus Prettier integration
- Configure Prettier with project-consistent formatting rules
- Set up Vitest for unit/component testing with React Testing Library
- Set up Playwright for end-to-end testing
- Install and configure Husky for Git hooks
- Add lint-staged for pre-commit auto-fixing (lint, format, type-check)
- Add pre-push hook to run the full test suite before allowing pushes
- Create GitHub Actions CI workflow: build, lint, type-check, unit tests, e2e tests on every PR
- Configure branch protection rules for main (require passing CI, no force pushes)
- Add Vercel configuration for static deployment
- Establish project directory structure matching architecture conventions from project.md
- Add a minimal App component and smoke test to validate the entire pipeline end-to-end

## Impact

- Affected specs: `project-scaffold` (new capability)
- Affected code: All root config files (`package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.eslintrc.ts`, `.prettierrc`, `.husky/`, `.github/workflows/ci.yml`, `vercel.json`), `src/` directory structure, initial component and test files
