## ADDED Requirements

### Requirement: First Visit Detection

The system SHALL detect when a user visits an episode for the first time by checking a localStorage flag. The system SHALL automatically initiate the onboarding tutorial on first visit to Orbit Lab unless the tutorial has been previously dismissed or completed. The system SHALL persist tutorial completion and dismissal state in localStorage to prevent repeated auto-start on subsequent visits.

#### Scenario: First visit to Orbit Lab

- **WHEN** a user visits Orbit Lab and no `essayons_tutorial_completed` or `essayons_tutorial_dismissed` flag exists in localStorage
- **THEN** the system SHALL detect this as a first visit and automatically start the onboarding tutorial

#### Scenario: Subsequent visit after completion

- **WHEN** a user visits Orbit Lab and the `essayons_tutorial_completed` flag is set to `true` in localStorage
- **THEN** the system SHALL NOT automatically start the onboarding tutorial

#### Scenario: Subsequent visit after dismissal

- **WHEN** a user visits Orbit Lab and the `essayons_tutorial_dismissed` flag is set to `true` in localStorage
- **THEN** the system SHALL NOT automatically start the onboarding tutorial

#### Scenario: Manual tutorial restart

- **WHEN** a user triggers the "Restart Tutorial" action from the help menu or settings
- **THEN** the system SHALL clear the tutorial completion and dismissal flags and initiate the tutorial regardless of previous state

### Requirement: Guided Walkthrough Steps

The system SHALL provide a six-step guided walkthrough for Orbit Lab covering: (1) Welcome introducing Essayons' learning philosophy, (2) Canvas showing the simulation area, (3) Parameters demonstrating adjustable controls, (4) Missions explaining objectives, (5) Reference highlighting educational content, and (6) Share showing how to share discoveries. Each step SHALL target a specific UI element, display explanatory text, and provide next/skip buttons for progression.

#### Scenario: Step 1 Welcome

- **WHEN** the tutorial starts
- **THEN** the system SHALL display step 1 with title "Welcome", content "This is Essayons — learn by trying", and center the tooltip on the viewport

#### Scenario: Step 2 Canvas

- **WHEN** the user advances from step 1 to step 2
- **THEN** the system SHALL highlight the simulation canvas element with a spotlight, display content "This is your simulation — watch what happens", and position the tooltip adjacent to the canvas without obscuring it

#### Scenario: Step 3 Parameters

- **WHEN** the user advances to step 3
- **THEN** the system SHALL highlight the parameter panel or first slider, display content "Drag these sliders to change the physics", and position the tooltip to the side or above the parameter controls

#### Scenario: Step 4 Missions

- **WHEN** the user advances to step 4
- **THEN** the system SHALL highlight the mission selector or mission panel, display content "Complete objectives to learn concepts", and position the tooltip adjacent to the mission UI

#### Scenario: Step 5 Reference

- **WHEN** the user advances to step 5
- **THEN** the system SHALL highlight the reference panel toggle or icon, display content "Read about the science behind what you see", and position the tooltip adjacent to the reference control

#### Scenario: Step 6 Share

- **WHEN** the user advances to step 6
- **THEN** the system SHALL highlight the share button or URL mechanism, display content "Share your discoveries with a link", and position the tooltip adjacent to the share control

#### Scenario: Step progression with next button

- **WHEN** the user clicks the "Next" button on any step except the final step
- **THEN** the system SHALL advance to the next step in sequence with a smooth transition animation

#### Scenario: Tutorial completion on final step

- **WHEN** the user clicks the "Next" or "Done" button on step 6
- **THEN** the system SHALL mark the tutorial as completed in localStorage, close the tutorial overlay, and allow normal episode interaction

### Requirement: Spotlight and Tooltip UI

The system SHALL render a spotlight effect that dims the background and highlights the target UI element with a transparent cutout. The system SHALL render a tooltip adjacent to the target element displaying the step title, content text, and action buttons (Next, Skip). The spotlight overlay SHALL have a semi-transparent dark background with z-index above episode content. The tooltip SHALL use brand fonts (Instrument Serif for headings, DM Sans for body), Physics accent color #00D4AA for highlights, and shall be styled with white background, rounded corners, and drop shadow.

#### Scenario: Spotlight overlay rendering

- **WHEN** the tutorial is active on any step
- **THEN** the system SHALL render a semi-transparent dark overlay (rgba(0,0,0,0.7)) covering the entire viewport with the target element's bounding box cut out or visually highlighted

#### Scenario: Tooltip positioning

- **WHEN** a tutorial step targets a UI element
- **THEN** the system SHALL calculate the element's position via `getBoundingClientRect()` and position the tooltip adjacent to the element (top, bottom, left, or right) such that it remains fully visible within the viewport

#### Scenario: Tooltip overflow prevention

- **WHEN** the calculated tooltip position would cause it to overflow the viewport
- **THEN** the system SHALL adjust the position to the opposite side or center of the element to ensure the tooltip remains fully visible

#### Scenario: Tooltip styling

- **WHEN** the tooltip is rendered
- **THEN** the tooltip SHALL have a white background, rounded corners (8px border-radius), drop shadow for depth, step title in Instrument Serif font, body text in DM Sans font, and border or accent elements in color #00D4AA

#### Scenario: Spotlight cutout highlighting

- **WHEN** the spotlight overlay is rendered
- **THEN** the target element SHALL be visually distinguished from the dimmed background either by a transparent cutout in the overlay or by a highlighted border/glow around the element

### Requirement: Skip and Dismiss Controls

The system SHALL provide a "Skip" button on every tutorial step allowing the user to exit the tutorial immediately without marking it as completed. The system SHALL provide a "Don't show again" checkbox on the final step that, when checked, marks the tutorial as dismissed in localStorage. The system SHALL allow the user to dismiss the tutorial at any time by pressing the ESC key.

#### Scenario: Skip button on any step

- **WHEN** the user clicks the "Skip" button on any tutorial step
- **THEN** the system SHALL immediately close the tutorial overlay, NOT mark the tutorial as completed, and allow normal episode interaction

#### Scenario: ESC key dismissal

- **WHEN** the tutorial is active and the user presses the ESC key
- **THEN** the system SHALL immediately close the tutorial overlay, NOT mark the tutorial as completed, and allow normal episode interaction

#### Scenario: Don't show again on final step

- **WHEN** the user checks the "Don't show again" checkbox on step 6 and then advances or closes the tutorial
- **THEN** the system SHALL set the `essayons_tutorial_dismissed` flag to `true` in localStorage, preventing automatic tutorial start on future visits

#### Scenario: Skip without dismissal flag

- **WHEN** the user clicks "Skip" on any step before the final step
- **THEN** the system SHALL close the tutorial but NOT set the `essayons_tutorial_dismissed` flag, allowing the tutorial to auto-start again on the next first-visit check unless manually completed

### Requirement: Re-access from Help Menu

The system SHALL provide a menu item or button in the help menu or settings panel labeled "Restart Tutorial" or equivalent. When activated, the system SHALL clear all tutorial localStorage flags and re-initiate the tutorial from step 1, allowing users to replay the walkthrough at any time.

#### Scenario: Restart Tutorial menu item

- **WHEN** the user opens the help menu or settings panel
- **THEN** the system SHALL display a "Restart Tutorial" or "Show Tutorial Again" menu item

#### Scenario: Restart Tutorial action

- **WHEN** the user activates the "Restart Tutorial" menu item
- **THEN** the system SHALL clear the `essayons_tutorial_completed` and `essayons_tutorial_dismissed` localStorage flags, close the menu, and start the tutorial from step 1

#### Scenario: Restart after previous completion

- **WHEN** a user who has previously completed the tutorial activates "Restart Tutorial"
- **THEN** the system SHALL re-run the full six-step walkthrough as if it were the first visit

### Requirement: Mobile Responsive Tooltip Positioning

The system SHALL adapt tooltip positioning for small screen sizes (viewport width < 768px). On mobile devices, tooltips SHALL prefer bottom positioning with full-width or near-full-width layout to maximize readability. The spotlight overlay SHALL remain functional on touch devices without obscuring tappable controls. Tooltip text SHALL meet minimum accessible font sizes (16px for body text) and maintain readability on small screens.

#### Scenario: Mobile tooltip positioning

- **WHEN** the tutorial is active on a device with viewport width less than 768px
- **THEN** the tooltip SHALL be positioned at the bottom of the viewport with full-width or near-full-width layout, safe area padding applied, and reduced internal padding to fit content

#### Scenario: Spotlight on touch devices

- **WHEN** the tutorial highlights a target element on a touch device
- **THEN** the spotlight overlay SHALL dim the background but SHALL NOT prevent touch interaction with the highlighted element where appropriate

#### Scenario: Mobile text readability

- **WHEN** the tutorial renders on a mobile device
- **THEN** the tooltip body text SHALL be rendered at minimum 16px font size, headings at proportionally larger sizes, and all text SHALL meet 4.5:1 contrast ratio against the background

#### Scenario: Mobile button accessibility

- **WHEN** the tutorial renders action buttons (Next, Skip) on a mobile device
- **THEN** each button SHALL have a minimum tap target size of 44x44 CSS pixels to meet touch accessibility guidelines

### Requirement: Keyboard and Screen Reader Accessibility

The system SHALL support full keyboard navigation through all tutorial steps and controls. The system SHALL implement a focus trap when the tutorial is active, cycling Tab key focus only through tutorial controls (Next, Skip, "Don't show again") and not the underlying episode UI. The system SHALL provide ARIA labels and announcements for screen reader users, including step titles, content, and step progression announcements.

#### Scenario: Keyboard navigation of tutorial

- **WHEN** the tutorial is active and the user presses the Tab key
- **THEN** focus SHALL cycle through the tutorial controls (Next button, Skip button, "Don't show again" checkbox on final step) and NOT reach the underlying episode UI until the tutorial is closed

#### Scenario: Next button keyboard activation

- **WHEN** the "Next" button has keyboard focus and the user presses Enter or Space
- **THEN** the system SHALL advance to the next tutorial step

#### Scenario: Skip button keyboard activation

- **WHEN** the "Skip" button has keyboard focus and the user presses Enter or Space
- **THEN** the system SHALL close the tutorial without marking it as completed

#### Scenario: ESC key exit

- **WHEN** the tutorial is active and the user presses the ESC key
- **THEN** the system SHALL close the tutorial immediately

#### Scenario: ARIA role and labels

- **WHEN** the tutorial tooltip is rendered
- **THEN** the tooltip SHALL have `role="dialog"`, `aria-labelledby` pointing to the step title element, and `aria-describedby` pointing to the step content element

#### Scenario: Screen reader step announcement

- **WHEN** the tutorial advances to a new step
- **THEN** the system SHALL announce the new step to screen readers with text in the format "Step N of 6: [Step Title]"

#### Scenario: Screen reader completion announcement

- **WHEN** the tutorial is completed or dismissed
- **THEN** the system SHALL announce "Tutorial completed" or "Tutorial closed" to screen readers

### Requirement: Smooth Transitions and Animations

The system SHALL apply smooth transitions when changing tutorial steps, including fade in/out animations for the tooltip and spotlight, and smooth movement when the spotlight target changes. Transition durations SHALL be 200-300ms to provide visual feedback without being jarring. Animations SHALL respect the user's prefers-reduced-motion setting, disabling or simplifying animations when requested.

#### Scenario: Tooltip fade in on step start

- **WHEN** a new tutorial step is activated
- **THEN** the tooltip SHALL fade in over 200-300ms with opacity transition from 0 to 1

#### Scenario: Tooltip fade out on step exit

- **WHEN** the user advances to the next step or closes the tutorial
- **THEN** the current tooltip SHALL fade out over 200-300ms with opacity transition from 1 to 0 before rendering the next step

#### Scenario: Spotlight movement on target change

- **WHEN** the tutorial advances to a step with a different target element
- **THEN** the spotlight cutout SHALL smoothly transition from the previous target's position to the new target's position over 200-300ms

#### Scenario: Respecting prefers-reduced-motion

- **WHEN** the user's system has `prefers-reduced-motion: reduce` enabled
- **THEN** the tutorial SHALL disable or simplify animations, using instant transitions or minimal fade effects instead of full animations

### Requirement: Error Handling for Missing Targets

The system SHALL handle cases where a tutorial step's target element does not exist in the DOM. When a target element cannot be found via the configured selector, the system SHALL fall back to center positioning for the tooltip or skip the step entirely. The system SHALL log a warning to the console for debugging purposes but SHALL NOT crash or block tutorial progression.

#### Scenario: Missing target element

- **WHEN** a tutorial step's target selector does not match any element in the DOM
- **THEN** the system SHALL position the tooltip in the center of the viewport without a spotlight cutout and display the step content normally

#### Scenario: Console warning on missing target

- **WHEN** a tutorial step's target selector does not match any element
- **THEN** the system SHALL log a warning message to the browser console in the format "Tutorial step [N]: target '[selector]' not found, using fallback positioning"

#### Scenario: Step skip on persistent missing target

- **WHEN** a tutorial step's target element cannot be found and the step has been configured to require the target
- **THEN** the system SHALL automatically skip to the next step and log a warning

#### Scenario: Tutorial completion despite missing targets

- **WHEN** one or more tutorial steps encounter missing target elements
- **THEN** the tutorial SHALL continue to completion or allow the user to skip/dismiss without entering an error state

### Requirement: Lightweight Custom Implementation

The system SHALL implement the onboarding tutorial using custom React components and hooks without external tour or tutorial libraries. The implementation SHALL add less than 50KB to the bundle size (uncompressed) and SHALL NOT introduce additional runtime dependencies beyond React and TypeScript. The tutorial code SHALL be modular and reusable to support future episodes beyond Orbit Lab.

#### Scenario: No external tour library dependency

- **WHEN** the onboarding tutorial feature is built
- **THEN** the implementation SHALL use only React, TypeScript, and native DOM APIs without importing external libraries such as react-joyride, intro.js, or shepherd.js

#### Scenario: Bundle size impact

- **WHEN** the onboarding tutorial code is bundled
- **THEN** the added JavaScript bundle size SHALL be less than 50KB uncompressed

#### Scenario: Modular step definitions

- **WHEN** a developer wants to add a tutorial to a new episode
- **THEN** the tutorial system SHALL support defining new step arrays in a configuration file without modifying core tutorial component logic

#### Scenario: Reusable tutorial component

- **WHEN** the OnboardingTutorial component is invoked with a different set of tutorial steps
- **THEN** the component SHALL render the new steps with the same spotlight and tooltip behavior as the Orbit Lab tutorial
