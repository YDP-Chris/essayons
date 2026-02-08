# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Essayons** ("Let us try") is a browser-based interactive learning platform that teaches concepts through hands-on exploration. Each "episode" is a self-contained simulation covering one domain — physics, civics, economics, history, biology, engineering. Users learn by manipulating parameters, running experiments, and discovering principles through cause-and-effect.

Key principles:

- **Zero friction**: No accounts, no downloads, no installation. Share a URL, everyone's learning in seconds.
- **Real computation**: Actual math/physics running in real time — not animations or approximations.
- **Layered complexity**: Same tool serves kids (8+) and engineers without dumbing anything down.
- **Domain breadth**: Not just physics — any subject where interactive exploration beats passive consumption.

Domain: `essayons.app`

## Project Status

The project is in the **pre-implementation/specification stage**. There is no application source code yet. Current artifacts are:

- PRD (`essayons-prd.docx`) — full product requirements
- Brand Identity Kit & GTM Strategy (`Essayons-Brand-Identity-Kit-GTM-Strategy.docx`)
- Brand Visual System (`Essayons-Brand-Visual-System-v2.html`) — interactive design system reference
- OpenSpec framework for spec-driven development

## Planned Tech Stack (from PRD)

- **Frontend**: React, client-side only
- **Rendering**: HTML5 Canvas, 60 FPS target; WebGL where beneficial
- **Hosting**: Vercel
- **Analytics**: Privacy-respecting (Plausible or similar), no personal data collection
- **Physics**: Real computation (e.g., Orbit Lab uses `F = GMm/r²` with Velocity Verlet integration, adaptive sub-stepping)
- **Storage**: Local storage for progress (no backend for MVP)
- **Fonts**: Google Fonts — Instrument Serif, DM Sans, IBM Plex Mono
- **Budget**: Zero — open-source stack, original assets only

## Architecture: Episode Framework

Each episode is a self-contained simulation with these components:

| Component         | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| Domain            | The subject being explored (orbital mechanics, civics, etc.) |
| Simulation engine | Core computation logic with real math                        |
| Parameters        | User-adjustable variables (sliders, buttons, keyboard)       |
| Visualizations    | Canvas rendering of objects, trajectories, data              |
| Missions          | Structured objectives with success/failure states            |
| Sandbox           | Free exploration mode, no constraints                        |
| Reference         | Educational context (equations, formulas)                    |

Episode 01 (Orbit Lab) is the proof-of-concept, currently complete. Content roadmap spans 3 phases across STEM, civics/economics, and expansion domains.

## Non-Functional Requirements

- Initial load time < 3 seconds on 3G
- Frame rate > 30 FPS on mid-range devices
- Input latency < 100ms
- WCAG AA compliance, full keyboard navigation, screen reader support
- Browser support: Chrome, Firefox, Safari, Edge (last 2 versions)
- Device support: Desktop, tablet, mobile (iOS/Android)

## Brand Design System

Defined in `Essayons-Brand-Visual-System-v2.html`:

**Fonts**: Instrument Serif (display/headlines), DM Sans (body/UI), IBM Plex Mono (data/telemetry)

**Core palette**: `--ink: #1A1A2E`, `--graphite: #2D2D44`, `--slate: #4A4A68`, `--stone: #8E8EA0`, `--paper: #F7F6F3`, `--cream: #FFFEF9`

**Action colors** (colorblind-safe): `--spark: #FF6B35` (primary CTA), `--growth: #2EC4B6` (success), `--think: #7B68EE` (processing), `--warm: #FFB800` (highlights)

**Domain accent colors**: Physics `#00D4AA`, Civics `#E63946`, Economics `#2A9D8F`, History `#E9C46A`, Biology `#8AC926`, Engineering `#FF6B35`

All success/error states must be reinforced with icons, not just color. All text must meet WCAG AA contrast ratios (4.5:1 minimum).

## Brand Voice

- **Encouraging**: Failure is progress. "Crashed the economy? Good—now you know what not to do."
- **Direct**: No hedging, no jargon. "Drag to adjust." not "Utilize the interface to modify..."
- **Curious**: Excited about learning. "Wait until you see what happens when supply exceeds demand."
- **Unpretentious**: Smart doesn't mean stuffy.
- **Domain-flexible**: Tone adapts per domain — energetic for physics, measured for civics, sharp for economics, contemplative for history.

**Words we use**: try, experiment, discover, crash, fail, real computation, episode, simulation
**Words we avoid**: learn/study/memorize (passive), simplified/approximated, users/students (say "you"), error/mistake (say crash/fail), module/unit/lesson (say episode), game (say simulation)

## Development Workflow: OpenSpec

This project uses **OpenSpec** for spec-driven development. All feature work follows a three-stage workflow:

1. **Proposal** — Create change proposals under `openspec/changes/<change-id>/` with `proposal.md`, `tasks.md`, optional `design.md`, and spec deltas. No code is written at this stage.
2. **Apply** — Implement an approved change by following `tasks.md` sequentially.
3. **Archive** — After deployment, archive the change and update specs.

### Key Commands

```bash
openspec list                    # List active changes
openspec list --specs            # List existing specifications
openspec show <item>             # View change or spec details
openspec validate <id> --strict --no-interactive  # Validate a change
openspec archive <id> --yes      # Archive after deployment
```

### Slash Commands

- `/openspec:proposal` — Scaffold a new change proposal
- `/openspec:apply` — Implement an approved change
- `/openspec:archive` — Archive a deployed change

### When to Create a Proposal

Create for: new features, breaking changes, architecture changes, performance/security work.
Skip for: bug fixes, typos, dependency updates, config changes, tests for existing behavior.

### Conventions

- Change IDs: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
- Every spec requirement needs at least one `#### Scenario:` block
- Use `SHALL`/`MUST` for normative requirements
- Default to <100 lines of new code; single-file implementations until proven insufficient
- Reference code locations as `file.ts:42`, specs as `specs/<capability>/spec.md`

## Repository Structure

```
openspec/
  project.md          # Project conventions and context
  AGENTS.md           # Full OpenSpec workflow instructions
  specs/              # Current truth — what IS built
  changes/            # Active proposals — what SHOULD change
    archive/          # Completed changes
.claude/
  commands/openspec/  # Slash command definitions (proposal, apply, archive)
```

<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->
