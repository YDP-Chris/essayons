## 1. Foundation and State Management

- [ ] 1.1 Define TypeScript interfaces for tutorial step (id, title, content, target selector, position hint), tutorial state (current step, completed, dismissed), and tutorial configuration in `types.ts`
- [ ] 1.2 Implement localStorage utility functions: `isFirstVisit()`, `markTutorialCompleted()`, `markTutorialDismissed()`, `getTutorialState()`, `resetTutorial()` in `localStorage.ts`
- [ ] 1.3 Implement `useTutorial` custom hook managing tutorial state: current step index, active status, next/previous/skip/dismiss actions, and localStorage persistence
- [ ] 1.4 Write unit tests: verify localStorage read/write, verify first visit detection, verify state transitions (next, skip, complete)

## 2. Tutorial Step Definitions

- [ ] 2.1 Define step 1: Welcome — target: body or main container, content: "This is Essayons — learn by trying", position: center
- [ ] 2.2 Define step 2: Canvas — target: canvas element or simulation container, content: "This is your simulation — watch what happens", position: center or below element
- [ ] 2.3 Define step 3: Parameters — target: parameter panel or first slider, content: "Drag these sliders to change the physics", position: right or above
- [ ] 2.4 Define step 4: Missions — target: mission selector or mission panel, content: "Complete objectives to learn concepts", position: left or above
- [ ] 2.5 Define step 5: Reference — target: reference panel toggle or icon, content: "Read about the science behind what you see", position: left or below
- [ ] 2.6 Define step 6: Share — target: share button or URL bar, content: "Share your discoveries with a link", position: bottom or left
- [ ] 2.7 Implement tutorialSteps array with all six steps and export as constant in `tutorialSteps.ts`

## 3. Spotlight and Tooltip UI

- [ ] 3.1 Implement TutorialStep component: render spotlight overlay (dim background with transparent cutout around target element), tooltip box with title and content, next/skip buttons
- [ ] 3.2 Implement spotlight cutout: calculate target element bounding box via `getBoundingClientRect()`, render dark overlay with CSS clip-path or SVG mask excluding target area
- [ ] 3.3 Implement tooltip positioning logic: calculate optimal position (top, bottom, left, right) based on target element location and viewport bounds to avoid overflow
- [ ] 3.4 Implement tooltip content: render step title (Instrument Serif heading), body text (DM Sans), and button group (Next + Skip)
- [ ] 3.5 Style spotlight overlay: semi-transparent dark background (rgba(0,0,0,0.7)), z-index above all other content, pointer-events disabled except on tooltip
- [ ] 3.6 Style tooltip: white background, rounded corners, drop shadow, Physics accent color #00D4AA for border or highlight, responsive padding
- [ ] 3.7 Implement mobile-responsive positioning: on small screens, position tooltip at bottom with safe area padding, adjust spotlight to not obscure controls
- [ ] 3.8 Write component tests: verify tooltip renders at correct position, verify buttons trigger correct actions, verify spotlight overlay dims background

## 4. Tutorial Orchestration

- [ ] 4.1 Implement OnboardingTutorial component: render current step's TutorialStep when active, handle step progression, integrate with `useTutorial` hook
- [ ] 4.2 Implement step progression: next button advances to next step, skip button exits tutorial without marking complete, last step's next button marks tutorial complete and closes
- [ ] 4.3 Implement "Don't show again" checkbox on final step: if checked, mark tutorial as dismissed in localStorage so it doesn't auto-start on future visits
- [ ] 4.4 Implement tutorial exit: close on skip, close on completion, close on ESC key press
- [ ] 4.5 Implement smooth transitions: fade in/out animation when changing steps, smooth spotlight movement when target element changes
- [ ] 4.6 Add keyboard accessibility: Tab to navigate buttons, Enter/Space to activate, ESC to dismiss, arrow keys to move between steps
- [ ] 4.7 Write integration tests: verify full tutorial flow from start to completion, verify skip action, verify "Don't show again" persists

## 5. Integration with Orbit Lab

- [ ] 5.1 Modify OrbitLabEpisode component to check `isFirstVisit()` on mount
- [ ] 5.2 Render OnboardingTutorial component when first visit is detected and tutorial is not dismissed
- [ ] 5.3 Ensure tutorial overlays episode content with proper z-index stacking
- [ ] 5.4 Verify tutorial does not block essential episode functionality during walkthrough
- [ ] 5.5 Write E2E test: verify tutorial auto-starts on first visit to Orbit Lab, verify it does not start on subsequent visits

## 6. Re-access from Help Menu

- [ ] 6.1 Add "Restart Tutorial" menu item to HelpMenu component (or Settings panel if no HelpMenu exists)
- [ ] 6.2 Implement menu item action: call `resetTutorial()` to clear localStorage flags and trigger tutorial re-start
- [ ] 6.3 Ensure tutorial can be manually triggered even if previously completed or dismissed
- [ ] 6.4 Style menu item consistently with brand design system
- [ ] 6.5 Write E2E test: verify "Restart Tutorial" action successfully re-triggers the tutorial

## 7. Mobile Responsiveness

- [ ] 7.1 Test tutorial on viewport widths < 768px: verify tooltip does not overflow screen, verify spotlight does not obscure interactive elements
- [ ] 7.2 Adjust tooltip positioning logic for small screens: prefer bottom positioning with full-width layout, reduce padding, ensure buttons remain tappable
- [ ] 7.3 Test spotlight cutout on touch devices: verify target element is still tappable through the spotlight overlay where appropriate
- [ ] 7.4 Verify text readability on mobile: font sizes meet minimum accessibility standards (16px body text), contrast ratios meet WCAG AA
- [ ] 7.5 Write responsive E2E tests: run tutorial flow on emulated mobile device, verify no visual regressions or interaction blockers

## 8. Accessibility and Polish

- [ ] 8.1 Add ARIA labels to tutorial components: `role="dialog"` on tooltip, `aria-labelledby` pointing to step title, `aria-describedby` pointing to step content
- [ ] 8.2 Implement focus trap: when tutorial is active, Tab key cycles only through tutorial controls (next, skip, "don't show again"), not underlying episode UI
- [ ] 8.3 Add screen reader announcements: announce step changes ("Step 2 of 6: Canvas"), announce completion
- [ ] 8.4 Ensure color contrast: tooltip text and buttons meet 4.5:1 minimum contrast ratio
- [ ] 8.5 Test keyboard-only navigation: verify entire tutorial can be completed without a mouse
- [ ] 8.6 Add subtle animations: fade in/out transitions (200-300ms), smooth spotlight movement, avoid jarring or distracting effects
- [ ] 8.7 Write accessibility tests: run axe-core or similar tool on tutorial component, verify no violations

## 9. Performance and Error Handling

- [ ] 9.1 Implement error handling for missing target elements: if target selector doesn't match any element, fall back to center positioning or skip step
- [ ] 9.2 Debounce window resize events if recalculating tooltip position on resize
- [ ] 9.3 Verify tutorial overlay does not impact episode rendering performance: measure FPS before and after tutorial activation, ensure <5% degradation
- [ ] 9.4 Lazy-load tutorial component if not needed on first render (code-split if beneficial for initial page load)
- [ ] 9.5 Write performance tests: verify tutorial adds <50KB to bundle size, verify no memory leaks from event listeners after tutorial closes

## 10. Documentation and Testing

- [ ] 10.1 Document tutorial step format in code comments: required fields, positioning options, best practices for target selectors
- [ ] 10.2 Add developer-facing documentation for adding tutorial to new episodes: example integration code, configuration options
- [ ] 10.3 Write comprehensive E2E test suite: first visit flow, skip flow, completion flow, restart from menu, mobile responsiveness, accessibility
- [ ] 10.4 Write unit tests for all utility functions and hooks
- [ ] 10.5 Perform manual QA: test on Chrome, Firefox, Safari, Edge; test on iOS and Android devices; verify no visual regressions
