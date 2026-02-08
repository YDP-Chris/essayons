# Implementation Tasks: Add Accessibility Audit

## 1. Audit Existing Components

- [ ] 1.1 Run axe-core automated scan on landing page and identify all violations
- [ ] 1.2 Run axe-core automated scan on episode shell (Orbit Lab) and identify all violations
- [ ] 1.3 Run Lighthouse accessibility audit on all pages and document scores
- [ ] 1.4 Manual keyboard navigation test: verify Tab order, Enter/Space activation, Escape dismissal, arrow key controls
- [ ] 1.5 Manual screen reader test (NVDA or VoiceOver): verify all content is announced, navigation is logical, state changes are communicated
- [ ] 1.6 Manual color contrast verification: check all text/background combinations with contrast checker tool
- [ ] 1.7 Manual touch target audit: verify all interactive elements meet 44x44px minimum on mobile/tablet breakpoints
- [ ] 1.8 Document all findings in audit report with severity (critical, high, medium, low) and WCAG criterion reference

## 2. Keyboard Navigation Implementation

- [ ] 2.1 Verify and fix Tab order across landing page (header nav, episode cards, footer links, newsletter form)
- [ ] 2.2 Verify and fix Tab order in episode shell (play/pause/reset, parameter sliders, mission panel, reference panel, share button)
- [ ] 2.3 Implement arrow key navigation for parameter sliders (Left/Right or Up/Down adjusts value by step size)
- [ ] 2.4 Implement Enter/Space activation for all buttons and toggle controls
- [ ] 2.5 Implement Escape key to close modals, dropdowns, and mobile menu
- [ ] 2.6 Add focus trap to mobile hamburger menu (focus cycles within menu when open)
- [ ] 2.7 Add focus trap to episode shell (optional; prevent Tab from escaping simulation during active session)
- [ ] 2.8 Implement focus restoration: when navigating away from episode and returning, restore focus to last-focused element
- [ ] 2.9 Write keyboard navigation integration tests for all interactive patterns

## 3. Focus Management and Indicators

- [ ] 3.1 Verify all interactive elements have visible focus indicators using `:focus-visible` pseudo-class
- [ ] 3.2 Ensure focus indicator color (`--think` or `--spark`) meets 3:1 contrast ratio against background
- [ ] 3.3 Ensure focus indicator thickness is at least 2px and clearly outlines the focused element
- [ ] 3.4 Verify focus indicators are not suppressed by `outline: none` or similar CSS reset without replacement
- [ ] 3.5 Test focus indicators across all component variants (primary/secondary/ghost buttons, sliders, links, cards)
- [ ] 3.6 Test focus indicators at all responsive breakpoints (mobile, tablet, desktop)

## 4. Screen Reader Support

- [ ] 4.1 Add `aria-live="polite"` region for simulation status announcements (running, paused, crashed, mission success/failure)
- [ ] 4.2 Add `aria-live="polite"` region for mission objective updates and progress notifications
- [ ] 4.3 Add `aria-label` or `aria-labelledby` to all parameter sliders describing what they control
- [ ] 4.4 Add `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` to all slider inputs
- [ ] 4.5 Add `aria-pressed` to toggle buttons (mute button, play/pause if styled as toggle)
- [ ] 4.6 Add `aria-expanded` to collapsible UI elements (mobile menu, mission panel sections)
- [ ] 4.7 Verify ARIA landmarks (`banner`, `navigation`, `main`, `contentinfo`) exist on all pages
- [ ] 4.8 Add descriptive `aria-label` to icon-only buttons (play, pause, reset, mute, share)
- [ ] 4.9 Test screen reader announcements for all simulation state changes (launch, crash, orbit achieved, parameter adjusted)
- [ ] 4.10 Write screen reader integration tests using testing-library with simulated screen reader queries

## 5. Canvas Accessibility

- [ ] 5.1 Add `role="img"` and descriptive `aria-label` to simulation canvas element
- [ ] 5.2 Provide text alternative for canvas state: announce current phase (pre-launch, ascending, orbiting, crashed) via aria-live region
- [ ] 5.3 Announce key simulation events to screen readers: launch initiated, apoapsis reached, periapsis reached, orbit established, crash detected
- [ ] 5.4 Consider adding optional audio cues for simulation events (see sound-design capability for integration)
- [ ] 5.5 Verify canvas does not trap focus or interfere with keyboard navigation
- [ ] 5.6 Document canvas accessibility pattern for future episodes in `AGENTS.md` or accessibility guide

## 6. Color Contrast Verification

- [ ] 6.1 Verify all body text (DM Sans 16px) meets 4.5:1 contrast ratio against background
- [ ] 6.2 Verify all heading text meets 4.5:1 contrast ratio (or 3:1 if large text >= 18pt)
- [ ] 6.3 Verify domain accent colors (physics, civics, economics, etc.) meet 4.5:1 contrast when used for text
- [ ] 6.4 Verify button text contrast: primary buttons (spark background), secondary buttons (outlined), ghost buttons
- [ ] 6.5 Verify telemetry readout text contrast against panel background
- [ ] 6.6 Verify mission status text contrast (success green, failure red, neutral)
- [ ] 6.7 Fix any contrast violations by adjusting color values or adding text shadows/backgrounds
- [ ] 6.8 Add contrast ratio tests to Vitest unit tests for all text/background combinations

## 7. Skip Navigation and Landmarks

- [ ] 7.1 Verify "Skip to main content" link exists as first focusable element on all pages
- [ ] 7.2 Verify skip link is visually hidden but visible on focus
- [ ] 7.3 Verify skip link target is the `<main>` element with `id="main-content"` or similar
- [ ] 7.4 Test skip link with keyboard: Tab to focus, Enter to activate, verify focus moves to main content
- [ ] 7.5 Verify all pages have `<header>`, `<nav>`, `<main>`, `<footer>` semantic HTML with corresponding ARIA roles if needed

## 8. Reduced Motion Support

- [ ] 8.1 Wrap all CSS animations and transitions in `@media (prefers-reduced-motion: no-preference)` query
- [ ] 8.2 Provide instant or minimal animation fallback for users with `prefers-reduced-motion: reduce`
- [ ] 8.3 Respect reduced motion preference in simulation engine: disable or minimize particle effects, camera easing, visual flourishes
- [ ] 8.4 Respect reduced motion preference in UI transitions: page navigation, panel expansion, tooltip appearance
- [ ] 8.5 Test reduced motion mode: enable in OS accessibility settings, verify all animations are suppressed or minimized
- [ ] 8.6 Write tests to verify reduced motion CSS is properly applied

## 9. Touch Target Sizing

- [ ] 9.1 Verify all buttons meet 44x44px minimum touch target size at mobile breakpoint (<=640px)
- [ ] 9.2 Verify parameter slider touch targets (thumb and track) meet 44x44px minimum
- [ ] 9.3 Verify navigation links and footer links meet 44x44px minimum on mobile
- [ ] 9.4 Verify icon-only buttons (play/pause/reset/mute/share) meet 44x44px minimum
- [ ] 9.5 Add padding or increase button size where needed to meet minimum target size
- [ ] 9.6 Test touch targets on physical mobile device or browser device emulation
- [ ] 9.7 Write responsive design tests to assert minimum touch target sizes at mobile breakpoint

## 10. Form Labels and Inputs

- [ ] 10.1 Verify newsletter email input on landing page has visible `<label>` or `aria-label`
- [ ] 10.2 Verify all parameter sliders have visible labels or `aria-label` describing their function
- [ ] 10.3 Verify volume slider (if implemented) has visible label or `aria-label`
- [ ] 10.4 Verify all inputs have associated `<label>` elements with matching `for` attribute or `aria-labelledby`
- [ ] 10.5 Verify form validation errors are announced to screen readers via `aria-describedby` or `aria-live`

## 11. Automated Testing Integration

- [ ] 11.1 Add axe-core to Vitest test suite: run on every UI component mount
- [ ] 11.2 Add Lighthouse CI to GitHub Actions: assert accessibility score >= 90 on all pages
- [ ] 11.3 Configure axe-core to fail CI on any violations with severity >= moderate
- [ ] 11.4 Add accessibility lint rules to ESLint: jsx-a11y plugin with recommended rules
- [ ] 11.5 Add pre-commit hook to run accessibility lint checks
- [ ] 11.6 Document how to run accessibility tests locally in README or CONTRIBUTING.md

## 12. Documentation and Patterns

- [ ] 12.1 Create `docs/accessibility-guide.md` documenting platform accessibility patterns and requirements
- [ ] 12.2 Document keyboard navigation patterns for episodes (parameter controls, mission panel, reference panel)
- [ ] 12.3 Document screen reader announcement patterns for simulation state changes
- [ ] 12.4 Document canvas accessibility approach (text alternatives, event announcements)
- [ ] 12.5 Document reduced motion implementation strategy for future episodes
- [ ] 12.6 Add accessibility checklist to episode development template
- [ ] 12.7 Update `openspec/project.md` with accessibility testing requirements for all new changes
