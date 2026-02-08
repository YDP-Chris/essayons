# Change: Add config-driven Episode Factory for scalable episode authoring

## Why

Building an Essayons episode today requires hand-coding every component: parameter UI, telemetry readouts, mission panels, reference content, and Canvas rendering scaffolding. This bespoke process prevents AI agents from generating episodes at scale and slows human developers who must repeat the same boilerplate for every new domain. A declarative, config-driven factory system eliminates this bottleneck by letting authors describe _what_ an episode contains rather than _how_ to wire it together.

## What Changes

- Add `EpisodeConfig` TypeScript interface: a single declarative object that fully describes an episode's identity, parameters, equations, missions, telemetry, reference content, and test vectors
- Add `EpisodeFactory` class that consumes an `EpisodeConfig` and produces a complete `EpisodeDefinition` (the plugin interface defined by `add-simulation-engine`), auto-generating parameter controls, telemetry display, mission UI, and reference panels
- Add `ParameterDefinition` extensions with UI hints (slider, toggle, dropdown, range-pair) so the factory generates appropriate controls without custom code
- Add `TelemetryField` definition type for declarative real-time readout configuration (label, unit, precision, color, sparkline toggle)
- Add `MissionDefinition` extensions with structured briefing text, objective descriptions, and success/failure condition expressions evaluable against simulation state
- Add `ReferenceContent` type supporting sectioned markdown content with LaTeX equation rendering support
- Add CLI scaffold generator (`npm run episode:create -- --id <id> --domain <domain>`) that outputs a ready-to-fill episode directory with `config.ts`, `computation.ts`, `renderer.ts`, `index.ts`, and `__tests__/computation.test.ts`
- Add equation test vector validation framework: define known input/output pairs in the config, validated automatically by the test suite
- Add content validation pipeline that checks EpisodeConfig completeness (required fields, parameter range validity, mission presence, reference content, test vector coverage, domain accent color compliance)
- Add central `EpisodeRegistry` that aggregates all registered episodes and exposes metadata to the landing page episode grid
- Add `computeMode` support for `continuous`, `discrete`, and `turn-based` simulation update strategies

## Impact

- Affected specs: `episode-factory` (new capability)
- Affected code:
  - `src/factory/EpisodeFactory.ts` -- core factory class that transforms EpisodeConfig into EpisodeDefinition
  - `src/factory/EpisodeConfig.ts` -- TypeScript interfaces for the declarative config format
  - `src/factory/EpisodeRegistry.ts` -- central episode registry for discovery and landing page integration
  - `src/factory/ParameterUIGenerator.ts` -- auto-generates React parameter controls from ParameterDefinition
  - `src/factory/TelemetryUIGenerator.ts` -- auto-generates telemetry display from TelemetryField config
  - `src/factory/MissionUIGenerator.ts` -- auto-generates mission briefing/objectives/results from MissionDefinition
  - `src/factory/ReferenceGenerator.ts` -- renders markdown reference content sections
  - `src/factory/ContentValidator.ts` -- validates EpisodeConfig completeness and correctness
  - `src/factory/TestVectorRunner.ts` -- runs equation test vectors against episode computation
  - `scripts/create-episode.ts` -- CLI scaffold generator
  - `src/factory/types.ts` -- shared factory type definitions
  - `src/factory/__tests__/` -- unit tests for factory, validator, and test vector runner
