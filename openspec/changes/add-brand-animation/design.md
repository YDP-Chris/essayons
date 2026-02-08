## Context

The Essayons brand visual system (documented in `Essayons-Brand-Visual-System-v2.html`) includes an animated domain orbit visualization that communicates the platform's multi-domain approach at a glance. This animation needs to be integrated into the landing page hero section as a React component. Additionally, the platform currently uses emoji icons throughout (🛰️, 🏛️, 📈, etc.), which render inconsistently across operating systems and browsers, lack accessibility features, and don't meet the professional standard expected of an educational platform.

Stakeholders: solo developer, learners (visual clarity), teachers (professional appearance), accessibility auditors (WCAG AA compliance).

Constraints:

- Zero budget — only open-source tooling and inline SVG
- Browser-only — animations must use CSS, not canvas or WebGL (to maintain simplicity and performance)
- Performance — animation must not degrade frame rate below 30 FPS on mid-range devices
- Accessibility — must respect `prefers-reduced-motion` and provide colorblind-safe iconography
- Mobile-first — animation must be responsive and performant on mobile viewports

## Goals / Non-Goals

**Goals:**

- Bring the brand orbit animation from the static HTML mockup into the React landing page
- Create a reusable DomainOrbit component with zero JavaScript animation overhead (pure CSS)
- Replace all emoji icons with inline SVG icons rendered via a shared Icon component
- Ensure icon shapes are colorblind-safe (domain identity conveyed by shape, not just color)
- Support `prefers-reduced-motion` to pause animations for users with vestibular disorders
- Maintain mobile responsiveness (orbit scales down or simplifies on small screens)

**Non-Goals:**

- Interactive orbit (clicking nodes, dragging, etc.) — deferred to future iteration
- Animated SVG icons (SMIL or CSS animations) — icons are static for MVP
- Icon animation library (framer-motion, react-spring) — unnecessary complexity for static icons
- Iconography for episodes beyond the launch six — can be added as episodes are built
- 3D or WebGL orbit rendering — CSS is sufficient and more performant

## Decisions

### 1. Pure CSS animation for orbit rings

- **Decision**: Use CSS `@keyframes` animations with `animation` property on orbit rings. No JavaScript animation loop.
- **Why**: Zero runtime cost, runs on GPU compositor thread, works offline, and is simpler to debug. The brand HTML already uses this approach successfully.
- **Alternatives considered**:
  - JavaScript requestAnimationFrame loop: Adds unnecessary complexity and JS execution cost. CSS animations are hardware-accelerated.
  - React Spring or Framer Motion: Over-engineered for a simple circular rotation. Adds bundle size.
  - Canvas rendering: Requires redrawing every frame, higher CPU cost, and no accessibility benefits.

### 2. Inline SVG via React components (not icon fonts or external SVG files)

- **Decision**: Each icon is a React component that returns inline SVG JSX. Icons are imported and rendered as `<Icon name="physics" />`.
- **Why**: Tree-shakeable (unused icons don't bloat bundle), colorable via CSS `currentColor`, no network requests, easy to version-control, and TypeScript-friendly.
- **Alternatives considered**:
  - Icon fonts (e.g., IcoMoon): Accessibility issues (screen readers may announce font glyphs), harder to color individual paths, requires font file.
  - External SVG files with `<img>` or `<object>`: Requires separate HTTP requests, harder to style dynamically, and no tree-shaking.
  - SVG sprite sheets: Reduces HTTP requests but complicates authoring and makes tree-shaking difficult.

### 3. Icon component with name prop as single entry point

- **Decision**: A single `<Icon name="physics" size={24} />` component acts as the public API. Internally, it maps `name` to the corresponding SVG component.
- **Why**: Consistent API across the codebase, easy to swap icon implementations, supports tree-shaking via dynamic imports if needed later, and simplifies usage (no need to import 20+ icon components individually).
- **Alternatives considered**:
  - Direct imports of icon components (`<PhysicsIcon />`): More verbose, harder to enforce naming conventions, and clutters imports.
  - Icon registry pattern: Over-engineered for current scale (10-15 icons). Can be adopted later if icon count grows to 100+.

### 4. Colorblind-safe domain icons via unique shapes

- **Decision**: Each domain icon has a visually distinct shape that remains recognizable even in grayscale or under color vision deficiency filters. For example: physics is a satellite/orbit shape, civics is a columned building, economics is a trend line with data points, etc.
- **Why**: WCAG AA requires information to not be conveyed by color alone. If a user cannot distinguish colors, the shape must still communicate the domain. This also benefits users in low-contrast environments (bright sunlight, e-ink displays).
- **Alternatives considered**:
  - Text labels on every icon: Clutters UI and defeats the purpose of icons as visual shorthand.
  - Accessible names only (aria-label): Doesn't help sighted colorblind users; they still can't distinguish icons visually.
  - Color-only icons: Fails WCAG and harms user experience for ~8% of males with color vision deficiency.

### 5. prefers-reduced-motion: pause animations, not remove visual

- **Decision**: When `prefers-reduced-motion: reduce` is active, orbit rings are rendered but `animation-play-state: paused`. The static visual remains.
- **Why**: Users with vestibular disorders need to disable motion, but they still benefit from seeing the layout and understanding the structure. Removing the orbit entirely would create layout shift and lose the visual metaphor.
- **Alternatives considered**:
  - Completely hide orbit on reduced-motion: Creates layout shift and removes a key brand element.
  - Replace with static image: Requires creating and maintaining an additional asset.
  - Slow down animation instead of pausing: Still triggers vestibular issues for some users; accessibility guidelines recommend full pause.

### 6. Responsive: scale down on tablet, simplify on mobile

- **Decision**: On desktop (≥1024px), show full orbit (420px outer ring). On tablet (768px–1024px), scale down proportionally (e.g., 320px outer ring). On mobile (<768px), either scale further or replace with a simplified vertical stack of domain icons.
- **Why**: Mobile screens lack space for a 420px circle. Scaling maintains the visual metaphor, but if too small, stacked icons ensure usability.
- **Alternatives considered**:
  - Fixed size on all screens: Overflows or becomes illegible on mobile.
  - Mobile-only replacement image: Requires separate asset and loses React component consistency.
  - Horizontal scrolling orbit on mobile: Poor UX, violates mobile-first principles.

## Risks / Trade-offs

- **CSS animation browser support**: CSS animations are supported in all modern browsers, but IE11 does not support them.
  - Mitigation: IE11 is not a target browser (project.md specifies modern browser stack). Static orbit fallback is acceptable degradation.

- **Orbit complexity on low-end mobile**: 3 spinning rings with 6 nodes may cause jank on very low-end devices.
  - Mitigation: Use `transform` for rotation (GPU-accelerated) and test on mid-range Android devices. Add `will-change: transform` sparingly to hint GPU compositing.

- **Icon file proliferation**: 16+ icon files (6 domains + 10 UI icons) can clutter the codebase.
  - Mitigation: Co-locate all icons in `src/components/icons/` with subdirectories for `domains/` and `ui/`. The Icon component provides a single import point.

- **SVG accessibility**: Inline SVG can be announced by screen readers if not marked decorative.
  - Mitigation: All icons rendered via Icon component have `aria-hidden="true"` by default, as they are decorative (text labels or ARIA labels on parent elements provide semantic meaning).

## Migration Plan

This is a greenfield addition (no existing orbit or icon system to migrate), so the migration is additive:

1. **Phase 1 — DomainOrbit component**: Create DomainOrbit.tsx and DomainOrbit.css. Integrate into HeroSection.tsx. Existing hero visual (if any) is replaced. No breaking changes.
2. **Phase 2 — Icon component foundation**: Create Icon.tsx and directory structure. No existing code uses it yet.
3. **Phase 3 — Domain SVG icons**: Create 6 domain icon components. Update DomainOrbit to use Icon components instead of emojis (if emojis were used as fallback).
4. **Phase 4 — UI SVG icons**: Create 10 UI icon components. No migration needed; these are new.
5. **Phase 5 — Replace emoji icons platform-wide**: Update EpisodeCard, EpisodeGrid, and any other components currently using emoji Unicode characters. Replace with `<Icon name="..." />`. This is a breaking change for components that hardcode emojis, but since the platform is pre-launch, impact is minimal.
6. **Rollback**: If orbit animation causes performance issues, the component can be removed and hero section reverts to a static placeholder. Icon system is independent and can remain even if orbit is rolled back.

## Open Questions

- Should the orbit animation loop infinitely, or pause after a few rotations to reduce motion for users who haven't explicitly set `prefers-reduced-motion`? (Recommendation: loop infinitely; users who want reduced motion will enable the OS setting.)
- Should domain nodes in the orbit be clickable links to episodes, or purely decorative in the hero? (Recommendation: purely decorative in hero; episode grid below provides explicit navigation.)
- Should the Icon component support a `label` prop for accessible naming, or should parent components always provide context via aria-label? (Recommendation: Icon is decorative by default with `aria-hidden`, parents provide semantic labels.)
