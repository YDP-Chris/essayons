## 1. Design Tokens (CSS Custom Properties)

- [ ] 1.1 Create `src/styles/tokens.css` with all CSS custom properties on `:root`
- [ ] 1.2 Define core palette variables (`--ink`, `--graphite`, `--slate`, `--stone`, `--paper`, `--cream`)
- [ ] 1.3 Define action color variables (`--spark`, `--growth`, `--think`, `--warm`)
- [ ] 1.4 Define domain accent variables (`--domain-physics`, `--domain-civics`, `--domain-economics`, `--domain-history`, `--domain-biology`, `--domain-engineering`)
- [ ] 1.5 Define spacing scale variables (4px base unit: `--space-1` through `--space-12`)
- [ ] 1.6 Define border-radius and shadow tokens
- [ ] 1.7 Define responsive breakpoint variables for use in media queries
- [ ] 1.8 Import `tokens.css` in the application entry point

## 2. Typography System

- [ ] 2.1 Add Google Fonts preconnect and stylesheet links to `index.html` for Instrument Serif, DM Sans, IBM Plex Mono
- [ ] 2.2 Create `src/styles/typography.css` with font-stack fallback definitions
- [ ] 2.3 Define type scale CSS classes: `.text-display`, `.text-h1`, `.text-h2`, `.text-h3`, `.text-body`, `.text-ui`, `.text-data`, `.text-label`
- [ ] 2.4 Set responsive font sizes (clamp-based) for display and heading levels
- [ ] 2.5 Add `font-display: swap` to all font-face rules or link attributes for performance
- [ ] 2.6 Write unit tests verifying type scale CSS classes render correct sizes

## 3. Color System

- [ ] 3.1 Create `src/styles/colors.css` with semantic color mappings (e.g., `--color-text-primary`, `--color-bg-primary`, `--color-border`)
- [ ] 3.2 Define dark-on-light default theme using core palette
- [ ] 3.3 Verify all text/background combinations meet WCAG AA 4.5:1 contrast ratio
- [ ] 3.4 Add colorblind-safe utility classes (never rely on red/green alone for status)
- [ ] 3.5 Document color pairings that pass contrast requirements

## 4. Shared UI Components

- [ ] 4.1 Create `src/components/ui/Button.tsx` with variants: primary (spark), secondary (outlined), ghost, and domain-themed
- [ ] 4.2 Create `src/components/ui/Slider.tsx` wrapping native `<input type="range">` with brand styling and accessible labeling
- [ ] 4.3 Create `src/components/ui/Card.tsx` for content containers with optional header, body, and footer slots
- [ ] 4.4 Create `src/components/ui/Navigation.tsx` for top-level and episode navigation
- [ ] 4.5 Write Vitest + React Testing Library tests for each component
- [ ] 4.6 Ensure all components accept `className` prop for composition
- [ ] 4.7 Export all UI components from `src/components/ui/index.ts` barrel file

## 5. Accessibility Baseline

- [ ] 5.1 Create `src/styles/accessibility.css` with visible focus indicator styles (`:focus-visible` outline using `--think` color)
- [ ] 5.2 Add skip-to-content link component and styles
- [ ] 5.3 Ensure all interactive components have minimum 44x44px touch targets
- [ ] 5.4 Add `prefers-reduced-motion` media query support to all animations
- [ ] 5.5 Add ARIA landmarks (`banner`, `main`, `navigation`, `contentinfo`) to layout components
- [ ] 5.6 Add `aria-live` region for simulation status announcements
- [ ] 5.7 Run axe-core accessibility audit in Vitest tests for each UI component
- [ ] 5.8 Verify keyboard navigation order is logical for all shared components

## 6. Responsive Design

- [ ] 6.1 Define breakpoint tokens: `--bp-sm: 640px`, `--bp-md: 768px`, `--bp-lg: 1024px`, `--bp-xl: 1280px`
- [ ] 6.2 Create mobile-first base styles in `tokens.css`
- [ ] 6.3 Add responsive container utility (`max-width` + centered)
- [ ] 6.4 Ensure all UI components stack/reflow correctly below `--bp-md`
- [ ] 6.5 Write Playwright viewport tests at 375px, 768px, and 1280px widths

## 7. Domain Theming

- [ ] 7.1 Create `src/components/ThemeProvider.tsx` React context that sets `--domain-accent` on a wrapper element
- [ ] 7.2 Create `src/hooks/useDomainTheme.ts` hook returning current domain accent color and label
- [ ] 7.3 Define domain-to-color mapping object (`physics -> #00D4AA`, etc.)
- [ ] 7.4 Ensure all UI components that use accent color reference `--domain-accent` variable (not hardcoded values)
- [ ] 7.5 Write tests verifying ThemeProvider swaps accent color correctly per domain
- [ ] 7.6 Add Storybook-style visual verification (or equivalent Vitest snapshot) for each domain theme

## 8. Integration and Verification

- [ ] 8.1 Import all style sheets in correct order in application entry point
- [ ] 8.2 Verify no existing episode styles break after design system integration
- [ ] 8.3 Run full Vitest suite and confirm all tests pass
- [ ] 8.4 Run Playwright e2e tests confirming visual consistency
- [ ] 8.5 Run Lighthouse accessibility audit and confirm score >= 90
- [ ] 8.6 Confirm production build size stays within performance budget (<3s load on 3G)
