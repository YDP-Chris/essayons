# Change: Implement brand design system as reusable CSS/React component library

## Why

Essayons has a comprehensive brand visual system defined in static documentation (`Essayons-Brand-Visual-System-v2.html` and the Brand Identity Kit), but no code-level implementation. Every episode and component currently duplicates design decisions or deviates from the brand. A shared design system will enforce visual consistency, accelerate episode development, and guarantee accessibility compliance across the entire platform.

## What Changes

- Add CSS Custom Properties layer exporting all design tokens (colors, typography, spacing, breakpoints) as variables on `:root`
- Add Google Fonts integration for Instrument Serif, DM Sans, and IBM Plex Mono with performance-optimized loading
- Add a type-scale system with semantic CSS classes and responsive sizing
- Add core and action color palettes, plus per-domain accent color tokens
- Add shared React UI components: Button, Slider, Card, Navigation, and their variants
- Add accessibility baseline: WCAG AA contrast enforcement, visible focus indicators, keyboard navigation patterns, ARIA landmarks and live regions
- Add responsive design primitives with mobile-first breakpoints
- Add domain theming system that switches accent colors per episode

## Impact

- Affected specs: `design-system` (new capability)
- Affected code:
  - `src/styles/tokens.css` — new design token definitions
  - `src/styles/typography.css` — type scale and font-face rules
  - `src/styles/colors.css` — color palette and domain accent variables
  - `src/styles/accessibility.css` — focus styles, skip links, reduced-motion
  - `src/components/ui/Button.tsx` — shared button component
  - `src/components/ui/Slider.tsx` — shared slider component
  - `src/components/ui/Card.tsx` — shared card component
  - `src/components/ui/Navigation.tsx` — shared navigation component
  - `src/components/ThemeProvider.tsx` — domain theming context
  - `src/hooks/useDomainTheme.ts` — hook for applying per-episode accent colors
  - `index.html` — Google Fonts preconnect and stylesheet links
