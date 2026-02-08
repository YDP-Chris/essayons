# Change: Add Accessibility Audit and WCAG 2.1 AA Compliance

## Why

Essayons is committed to being accessible to all learners, regardless of ability. While the project mandates WCAG AA compliance and individual changes include accessibility tasks, there is no comprehensive platform-wide audit to ensure consistent compliance across all interactive elements, navigation patterns, canvas visualizations, and responsive breakpoints. A formal accessibility audit will identify gaps, establish testing protocols, and ensure that keyboard users, screen reader users, and users with reduced motion preferences can fully engage with all episodes.

## What Changes

- Conduct comprehensive accessibility audit of all existing components: episode controls, parameter sliders, mission panel, share button, navigation, landing page, and any other interactive elements
- Implement keyboard navigation for all interactive elements with proper focus management (focus trap in episode shell, focus restoration on navigation changes)
- Add screen reader support: aria-live regions for simulation state changes, mission status updates, parameter value changes, and canvas event announcements
- Provide text alternatives for canvas-rendered simulation state and announce key simulation events to assistive technology
- Verify color contrast ratios: all text must meet WCAG AA 4.5:1 minimum (platform is already colorblind-safe via icons, need contrast verification)
- Ensure skip navigation links exist and function correctly across all pages
- Add visible focus indicators to all interactive elements (buttons, sliders, links, toggles)
- Respect `prefers-reduced-motion` media query for all animations, transitions, and simulation effects
- Ensure touch targets meet 44x44px minimum size for mobile/tablet users
- Verify all form inputs have associated visible labels or appropriate aria-label attributes
- Establish automated accessibility testing in CI pipeline (axe-core, Lighthouse)
- Document accessibility patterns and test procedures for future episode development

## Impact

- Affected specs: **accessibility** (ADDED), design-system, landing-page, orbit-lab, episode-factory, simulation-engine, shareable-states, sound-design
- Affected code:
  - All React UI components in `src/components/ui/` (Button, Slider, Card, Navigation)
  - Episode shell and parameter controls in `src/components/episode/`
  - Landing page components in `src/pages/`
  - Simulation engine canvas rendering and event system
  - Global styles in `src/styles/accessibility.css`
  - Animation and transition CSS across all components
  - CI/CD pipeline configuration for automated accessibility tests
