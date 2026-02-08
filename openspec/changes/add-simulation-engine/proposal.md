# Change: Add core simulation engine framework

## Why

Essayons needs a shared simulation framework that every episode builds on. Without a common engine, each episode would re-implement physics loops, rendering pipelines, time controls, and input handling — leading to inconsistent behavior and duplicated effort. This proposal establishes the foundational runtime that all episodes will share.

## What Changes

- Add `SimulationEngine` class managing the core physics-step / render-step loop with fixed-timestep physics and variable-rate rendering via `requestAnimationFrame`
- Add layered Canvas rendering system (background, simulation objects, UI overlays) decoupled from React reconciliation
- Add typed parameter system that defines simulation variables (number, boolean, enum, vector) with min/max/step constraints and real-time two-way binding to UI controls
- Add time control system supporting pause, play, and speed adjustment from 1x to 1000x
- Add input handler supporting keyboard (WASD + arrows), mouse (click, drag, scroll), and touch input with configurable action bindings
- Add mission framework interface for per-frame condition checking, objective tracking, and success/failure state transitions
- Add performance budget manager with frame-time monitoring and graceful degradation

## Impact

- Affected specs: `simulation-engine` (new capability)
- Affected code:
  - `src/engine/SimulationEngine.ts` — core loop and orchestration
  - `src/engine/CanvasRenderer.ts` — layered 2D rendering
  - `src/engine/ParameterSystem.ts` — typed parameter definitions and bindings
  - `src/engine/TimeController.ts` — pause/play/speed logic
  - `src/engine/InputHandler.ts` — keyboard, mouse, touch input mapping
  - `src/engine/MissionFramework.ts` — condition checking and objective tracking
  - `src/engine/PerformanceMonitor.ts` — frame budget and degradation
  - `src/engine/types.ts` — shared TypeScript interfaces and types
  - `src/hooks/useSimulation.ts` — React hook bridging engine state to UI
