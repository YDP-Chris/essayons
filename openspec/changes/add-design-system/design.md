## Context

Essayons is a browser-based interactive learning platform with multiple domain episodes (physics, civics, economics, etc.). The brand visual identity is documented in `Essayons-Brand-Visual-System-v2.html` and the Brand Identity Kit, but no code-level design system exists. Every future episode will need consistent typography, colors, and UI components. This change establishes the shared design system before the platform grows beyond its first episode.

Stakeholders: solo developer, end users (learners), accessibility auditors.

Constraints:

- Zero budget — only open-source tooling and free Google Fonts
- Browser-only — all design tokens and components must work client-side with no build-time theme generation
- Performance — must not degrade load time below the 3-second budget on 3G connections
- Accessibility — WCAG AA compliance is a hard requirement, not aspirational

## Goals / Non-Goals

**Goals:**

- Single source of truth for all design tokens (colors, typography, spacing) as CSS Custom Properties
- Reusable React UI components (Button, Slider, Card, Navigation) that consume tokens
- Per-domain accent theming via React context and CSS variables
- WCAG AA accessibility baseline enforced by default in all shared components
- Mobile-first responsive design with defined breakpoints
- Performance-optimized font loading (preconnect, font-display: swap)

**Non-Goals:**

- Dark mode theme (deferred — light theme only for MVP)
- Component library documentation site or Storybook deployment (visual tests via Vitest snapshots suffice)
- Design token build pipeline (e.g., Style Dictionary) — plain CSS Custom Properties are sufficient at current scale
- Theming API for end-user customization — only internal domain theming
- Animation/motion system beyond `prefers-reduced-motion` compliance

## Decisions

### 1. CSS Custom Properties over CSS-in-JS or utility frameworks

- **Decision**: All design tokens live as CSS Custom Properties on `:root`. Components use standard CSS (co-located `.css` files or CSS modules) referencing these variables.
- **Why**: Zero runtime cost, works with any framework, trivially overridable for domain theming, and aligns with the project convention of CSS variables for design tokens (see `project.md`).
- **Alternatives considered**:
  - Tailwind CSS: Adds build complexity, large utility class surface, harder to enforce semantic token names.
  - styled-components / Emotion: Runtime CSS-in-JS adds bundle size and JS execution cost; violates the performance constraint.
  - CSS Modules alone (without variables): Tokens would be duplicated across modules; no centralized override for domain theming.

### 2. Google Fonts via `<link>` with preconnect

- **Decision**: Load Instrument Serif, DM Sans, and IBM Plex Mono via Google Fonts `<link>` tags in `index.html`, with `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com`.
- **Why**: Simplest approach, leverages CDN caching, no self-hosting overhead. `font-display: swap` prevents invisible text during load.
- **Alternatives considered**:
  - Self-hosted fonts: Better control but adds asset management overhead and loses CDN benefit for a solo developer with zero budget.
  - `@fontsource` packages: Adds npm dependencies per font; marginal benefit over CDN for three fonts.

### 3. Domain theming via React context + CSS variable override

- **Decision**: A `<ThemeProvider domain="physics">` React component sets `--domain-accent` (and optionally `--domain-accent-light`, `--domain-accent-dark`) on its wrapper `<div>`. All accent-aware components reference `--domain-accent` instead of hardcoded colors.
- **Why**: Decouples components from specific domains. Adding a new episode only requires adding one entry to the domain color map — no component changes needed.
- **Alternatives considered**:
  - CSS class-based theming (`.theme-physics`): Requires maintaining parallel class definitions for every domain; error-prone as domains grow.
  - Build-time theme generation: Over-engineered for six domains with single-variable differences.

### 4. Component API: composable, unstyled-friendly

- **Decision**: Shared UI components accept `className`, `style`, and forward refs. They apply brand defaults but are overridable. No wrapper divs without semantic purpose.
- **Why**: Episodes may need specialized variants (e.g., a simulation-specific slider). Rigid component APIs would force workarounds.

### 5. Accessibility as default, not opt-in

- **Decision**: Focus indicators, ARIA attributes, keyboard handlers, and touch-target sizing are baked into shared components. There is no `accessible={false}` prop.
- **Why**: The project mandates WCAG AA. Making accessibility opt-in guarantees it will be forgotten in at least one episode.

## Risks / Trade-offs

- **Google Fonts dependency**: If Google Fonts CDN is unreachable, fonts fall back to system stacks (serif, sans-serif, monospace). This is acceptable degradation.
  - Mitigation: Define robust fallback stacks in font-family declarations.

- **CSS variable browser support**: CSS Custom Properties are supported in all modern browsers but not IE11.
  - Mitigation: IE11 is not a target (project.md specifies modern browser stack).

- **Token sprawl**: Without governance, token count could grow unchecked.
  - Mitigation: All tokens defined in a single `tokens.css` file. New tokens require a spec change proposal.

- **Component scope creep**: Shared components could accumulate episode-specific logic.
  - Mitigation: Components only contain brand-agnostic behavior. Episode-specific variants wrap or compose shared components, never modify them.

## Migration Plan

This is a greenfield addition (no existing design system to migrate from), so migration is straightforward:

1. **Phase 1 — Tokens**: Create `tokens.css`, `typography.css`, `colors.css`, `accessibility.css`. Import in app entry point. No existing styles should break because new variables do not override anything.
2. **Phase 2 — Components**: Create shared UI components in `src/components/ui/`. Existing episode components continue working; shared components are adopted incrementally.
3. **Phase 3 — Theming**: Add `ThemeProvider` and `useDomainTheme`. Wrap episode routes in provider. Existing episodes gain accent theming without code changes beyond the wrapper.
4. **Rollback**: Since this adds new files and does not modify existing ones, rollback is a simple revert of the added files.

## Open Questions

- Should the type scale use `clamp()` for fully fluid sizing, or fixed sizes with breakpoint overrides? (`clamp()` is simpler but less predictable for pixel-precise layouts like simulation telemetry panels.)
- Should shared components use CSS Modules (scoped class names) or plain CSS files? CSS Modules prevent class name collisions but add a build step and make global overrides harder.
- Is a `<Tooltip>` component needed in the initial set, or can it be deferred until an episode requires it?
