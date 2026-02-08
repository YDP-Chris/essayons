# Change: Add Onboarding Tutorial

## Why

New visitors to Essayons may not immediately understand how to interact with the platform — what to click, how to use the controls, or what missions are for. A guided first-run tutorial reduces friction by demonstrating the core interaction model (adjust parameters, observe results, complete missions) directly in Orbit Lab, the entry-point episode. This increases engagement and reduces bounce rate by showing, not telling, how to explore.

## What Changes

- Add first-visit detection using localStorage flag
- Add guided walkthrough for Orbit Lab showing six sequential steps:
  1. Welcome: "This is Essayons — learn by trying"
  2. Canvas: "This is your simulation — watch what happens"
  3. Parameters: "Drag these sliders to change the physics"
  4. Missions: "Complete objectives to learn concepts"
  5. Reference: "Read about the science behind what you see"
  6. Share: "Share your discoveries with a link"
- Add spotlight/tooltip UI: highlight element, dim background overlay, show tooltip with text + next/skip buttons
- Add skip button on every step
- Add "Don't show again" checkbox at the end
- Add re-access option from help menu or settings
- Add mobile-responsive tooltip positioning (adapts to small screens)
- Implement lightweight custom tutorial system — no external tour library dependency

## Impact

- Affected specs: `onboarding` (new capability)
- Affected code:
  - `src/features/onboarding/OnboardingTutorial.tsx` — main tutorial orchestrator component
  - `src/features/onboarding/TutorialStep.tsx` — spotlight + tooltip component
  - `src/features/onboarding/tutorialSteps.ts` — step definitions (text, target selector, positioning)
  - `src/features/onboarding/useTutorial.ts` — tutorial state management hook
  - `src/features/onboarding/localStorage.ts` — first-visit flag management
  - `src/episodes/orbit-lab/OrbitLabEpisode.tsx` — integrate tutorial on mount for first visit
  - `src/components/HelpMenu.tsx` — add "Restart Tutorial" menu item
