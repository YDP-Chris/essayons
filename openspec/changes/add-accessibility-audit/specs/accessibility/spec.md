# Capability: Accessibility

## ADDED Requirements

### Requirement: Keyboard Navigation for Interactive Elements

All interactive elements (buttons, links, form inputs, sliders, toggles, navigation menu items, episode controls) SHALL be fully operable via keyboard. Users SHALL be able to navigate to all interactive elements using Tab/Shift+Tab, activate them using Enter or Space, and adjust parameter values using arrow keys. Focus order SHALL follow a logical reading order (left-to-right, top-to-bottom in left-to-right languages).

#### Scenario: Tab navigation reaches all controls

- **WHEN** a keyboard user presses Tab repeatedly on the landing page
- **THEN** focus moves sequentially through header navigation links, episode cards, footer links, and newsletter form input without skipping any interactive element

#### Scenario: Tab navigation in episode shell

- **WHEN** a keyboard user presses Tab repeatedly within the Orbit Lab episode
- **THEN** focus moves sequentially through play/pause/reset buttons, all parameter sliders, mission panel sections, reference panel toggle, and share button

#### Scenario: Arrow keys adjust slider values

- **WHEN** a keyboard user focuses a parameter slider and presses Right Arrow or Up Arrow
- **THEN** the slider value increases by the defined step size
- **AND WHEN** the user presses Left Arrow or Down Arrow
- **THEN** the slider value decreases by the defined step size

#### Scenario: Enter and Space activate buttons

- **WHEN** a keyboard user focuses a button (play, pause, reset, share, mute) and presses Enter or Space
- **THEN** the button's action is triggered (play starts simulation, pause stops it, reset restarts it, etc.)

#### Scenario: Escape closes modal or menu

- **WHEN** a keyboard user opens the mobile hamburger menu and presses Escape
- **THEN** the menu closes and focus returns to the menu toggle button
- **AND WHEN** a modal or dropdown is open and the user presses Escape
- **THEN** the modal or dropdown closes and focus returns to the triggering element

### Requirement: Focus Management and Restoration

Focus SHALL be managed deliberately during navigation, modal interactions, and dynamic content updates. When opening a modal or menu, focus SHALL move to the first interactive element inside. When closing a modal or menu, focus SHALL return to the element that triggered it. Focus SHALL be trapped within modal dialogs to prevent users from navigating outside the modal while it is open. When navigating between pages or episodes, focus position SHALL be preserved or restored logically.

#### Scenario: Focus trap in mobile menu

- **WHEN** a user opens the mobile hamburger menu on the landing page
- **THEN** focus is trapped within the menu: Tab cycles through menu links and the close button without escaping to background content
- **AND WHEN** the user closes the menu with Escape or the close button
- **THEN** focus returns to the hamburger toggle button

#### Scenario: Focus restoration after episode navigation

- **WHEN** a user navigates from the landing page to an episode, interacts with a parameter slider, then navigates back to the landing page
- **THEN** focus is restored to the last-focused element on the landing page (e.g., the episode card that was clicked) or defaults to the skip link

#### Scenario: Focus moves into modal on open

- **WHEN** a modal dialog (e.g., share modal) is opened by clicking the share button
- **THEN** focus immediately moves to the first interactive element inside the modal (close button or input field)
- **AND** Tab navigation is trapped within the modal until it is closed

### Requirement: Visible Focus Indicators

All interactive elements SHALL display a visible focus indicator when focused via keyboard navigation. The focus indicator SHALL have a minimum contrast ratio of 3:1 against the adjacent background color. The indicator SHALL be at least 2 pixels thick and SHALL clearly outline or highlight the focused element. The indicator SHALL use the `:focus-visible` CSS pseudo-class to distinguish keyboard focus from mouse focus.

#### Scenario: Focus indicator on buttons

- **WHEN** a keyboard user Tabs to a button (primary, secondary, or ghost variant)
- **THEN** the button displays a visible outline or border in the focus indicator color (`--think` or `--spark`) with at least 2px thickness and 3:1 contrast ratio

#### Scenario: Focus indicator on parameter slider

- **WHEN** a keyboard user Tabs to a parameter slider
- **THEN** the slider thumb displays a visible outline or ring in the focus indicator color with at least 2px thickness

#### Scenario: Focus indicator on links

- **WHEN** a keyboard user Tabs to a navigation link or footer link
- **THEN** the link displays a visible underline, outline, or background highlight in the focus indicator color

#### Scenario: No outline suppression

- **WHEN** the CSS for any interactive element is inspected
- **THEN** there SHALL be no `outline: none` or `outline: 0` rules that suppress focus indicators without providing a custom replacement

### Requirement: Screen Reader Support for Simulation State

All dynamic simulation state changes (launch initiated, simulation running/paused, crash detected, orbit achieved, mission success/failure) SHALL be announced to screen readers via ARIA live regions. Canvas-rendered simulation content SHALL have a text alternative describing the current state. Mission objectives, parameter values, and telemetry readouts SHALL be accessible to screen readers.

#### Scenario: Simulation status announced on launch

- **WHEN** a screen reader user clicks the play button to launch a simulation
- **THEN** an aria-live region announces "Simulation launched" or similar status message

#### Scenario: Crash event announced

- **WHEN** the simulation detects a crash (spacecraft hits ground or burns up)
- **THEN** an aria-live region announces "Crash detected. Simulation paused." or similar message

#### Scenario: Mission success announced

- **WHEN** the user completes a mission objective (e.g., achieves stable orbit)
- **THEN** an aria-live region announces "Mission complete. Stable orbit achieved." or similar success message

#### Scenario: Canvas has text alternative

- **WHEN** a screen reader user encounters the simulation canvas element
- **THEN** the canvas has `role="img"` and an `aria-label` such as "Orbital mechanics simulation canvas. Current state: pre-launch."
- **AND** the `aria-label` or associated live region updates to reflect major state changes (e.g., "Current state: ascending" or "Current state: stable orbit")

#### Scenario: Parameter value change announced

- **WHEN** a screen reader user adjusts a parameter slider
- **THEN** the slider's `aria-valuenow` and `aria-valuetext` attributes update, and the screen reader announces the new value (e.g., "Launch angle: 45 degrees")

### Requirement: ARIA Attributes for Interactive Controls

All custom interactive controls (sliders, toggle buttons, expandable panels) SHALL include appropriate ARIA attributes (`role`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, `aria-pressed`, `aria-expanded`) to ensure screen reader users understand the control's purpose, state, and value.

#### Scenario: Slider has ARIA attributes

- **WHEN** a screen reader user encounters a parameter slider (e.g., launch angle)
- **THEN** the slider has `role="slider"`, `aria-label="Launch angle"`, `aria-valuemin="0"`, `aria-valuemax="90"`, `aria-valuenow="45"`, and `aria-valuetext="45 degrees"`

#### Scenario: Toggle button has aria-pressed

- **WHEN** a screen reader user encounters a toggle button (e.g., mute button)
- **THEN** the button has `aria-pressed="true"` when active and `aria-pressed="false"` when inactive
- **AND** the button has a descriptive `aria-label` such as "Mute sound effects"

#### Scenario: Expandable panel has aria-expanded

- **WHEN** a screen reader user encounters a collapsible mission panel or reference section
- **THEN** the toggle element has `aria-expanded="true"` when the panel is open and `aria-expanded="false"` when closed

#### Scenario: Icon-only buttons have aria-label

- **WHEN** a screen reader user encounters an icon-only button (play, pause, reset, share)
- **THEN** the button has a descriptive `aria-label` (e.g., "Play simulation", "Pause simulation", "Reset simulation", "Share current state")

### Requirement: ARIA Landmarks and Semantic HTML

All pages SHALL use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`) and ARIA landmark roles (`banner`, `navigation`, `main`, `contentinfo`) to provide a clear document structure for screen reader users. Each page SHALL have exactly one `<main>` element or `role="main"`. Navigation landmarks SHALL have descriptive `aria-label` attributes if there are multiple navigation regions.

#### Scenario: Landing page has all landmarks

- **WHEN** a screen reader user navigates the landing page using landmark navigation commands
- **THEN** the page has a `banner` landmark (header with logo and nav), a `navigation` landmark, a `main` landmark (value proposition and episode cards), and a `contentinfo` landmark (footer)

#### Scenario: Episode page has all landmarks

- **WHEN** a screen reader user navigates an episode page
- **THEN** the page has a `banner` landmark (header), a `navigation` landmark, a `main` landmark (episode shell containing canvas and controls), and a `contentinfo` landmark (footer if present)

#### Scenario: Unique main landmark

- **WHEN** any page in the platform is inspected
- **THEN** there is exactly one element with `<main>` or `role="main"` to identify the primary content area

### Requirement: Skip Navigation Link

Every page SHALL include a "Skip to main content" link as the first focusable element in the DOM. The skip link SHALL be visually hidden by default but become visible when focused via keyboard. Activating the skip link SHALL move focus directly to the main content area, bypassing the header and navigation.

#### Scenario: Skip link is first focusable element

- **WHEN** a keyboard user loads any page and presses Tab once
- **THEN** focus moves to the "Skip to main content" link

#### Scenario: Skip link visible on focus

- **WHEN** the skip link receives keyboard focus
- **THEN** it becomes visible on screen (not off-screen or with `opacity: 0`)

#### Scenario: Skip link moves focus to main

- **WHEN** a keyboard user focuses the skip link and presses Enter
- **THEN** focus moves directly to the `<main>` element or the first focusable element within the main content area, bypassing header and navigation

### Requirement: Color Contrast Compliance

All text content SHALL meet WCAG 2.1 AA contrast ratios: 4.5:1 for normal text (< 18pt or < 14pt bold) and 3:1 for large text (>= 18pt or >= 14pt bold). This applies to body text, headings, button labels, link text, telemetry readouts, mission status messages, and any other text rendered on screen. Focus indicators and interactive element borders SHALL meet 3:1 contrast ratio against adjacent colors.

#### Scenario: Body text contrast ratio

- **WHEN** body text (16px DM Sans) is rendered in `--ink` color on `--paper` background
- **THEN** the contrast ratio is at least 4.5:1 as measured by WCAG 2.1 guidelines

#### Scenario: Heading text contrast ratio

- **WHEN** heading text is rendered in `--ink` color on `--paper` background
- **THEN** the contrast ratio is at least 4.5:1 (or 3:1 if the heading is >= 18pt)

#### Scenario: Button label contrast ratio

- **WHEN** a primary button label is rendered in white text on `--spark` background
- **THEN** the contrast ratio is at least 4.5:1

#### Scenario: Domain accent text contrast

- **WHEN** text is rendered using a domain accent color (e.g., physics teal, civics plum) on a light or dark background
- **THEN** the contrast ratio is at least 4.5:1, or the text is adjusted to use a darker/lighter variant

#### Scenario: Focus indicator contrast ratio

- **WHEN** a focus indicator (outline or border) is displayed around an interactive element
- **THEN** the indicator color has at least 3:1 contrast ratio against the adjacent background

### Requirement: Reduced Motion Support

All animations, transitions, and visual effects SHALL respect the user's `prefers-reduced-motion` accessibility preference. Users who have enabled reduced motion in their operating system SHALL experience instant or minimal animations. This applies to CSS animations/transitions, JavaScript-driven UI animations, canvas-rendered particle effects, camera easing, and any other motion effects. Essential motion (e.g., simulation physics) MAY continue but should minimize decorative flourishes.

#### Scenario: CSS animations disabled for reduced motion

- **WHEN** a user with `prefers-reduced-motion: reduce` enabled loads the landing page
- **THEN** all CSS animations and transitions are suppressed or reduced to instant state changes (e.g., fade-ins become instant appearances)

#### Scenario: Simulation effects reduced for reduced motion

- **WHEN** a user with `prefers-reduced-motion: reduce` enabled launches a simulation
- **THEN** decorative visual effects (particle trails, camera easing, flourishes) are minimized or disabled, but core simulation physics (object motion) continues as expected

#### Scenario: Page navigation transitions reduced

- **WHEN** a user with `prefers-reduced-motion: reduce` enabled navigates between pages
- **THEN** page transition animations are instant or minimal (e.g., no slide-in or fade effects)

#### Scenario: Modal and dropdown transitions reduced

- **WHEN** a user with `prefers-reduced-motion: reduce` enabled opens a modal or dropdown
- **THEN** the modal or dropdown appears instantly without fade-in, slide-down, or scale animations

### Requirement: Touch Target Sizing

All interactive elements (buttons, links, slider thumbs, toggle switches) SHALL meet a minimum touch target size of 44x44 CSS pixels at all responsive breakpoints, including mobile (<=640px), tablet (<=768px), and desktop. If the visible element is smaller than 44x44px, sufficient padding or invisible hit area SHALL be added to meet the minimum target size.

#### Scenario: Button touch target on mobile

- **WHEN** a user interacts with a button on a mobile device (screen width <= 640px)
- **THEN** the button's total interactive area (including padding) is at least 44x44 CSS pixels

#### Scenario: Slider thumb touch target

- **WHEN** a user interacts with a parameter slider thumb on a mobile device
- **THEN** the thumb's total interactive area is at least 44x44 CSS pixels

#### Scenario: Navigation link touch target on mobile

- **WHEN** a user taps a navigation link or footer link on a mobile device
- **THEN** the link's total interactive area (including padding) is at least 44x44 CSS pixels

#### Scenario: Icon-only button touch target

- **WHEN** a user taps an icon-only button (play, pause, reset, mute, share) on a mobile device
- **THEN** the button's total interactive area is at least 44x44 CSS pixels, even if the icon itself is smaller

### Requirement: Form Labels and Input Accessibility

All form inputs (text inputs, sliders, checkboxes, radio buttons) SHALL have associated visible labels or descriptive `aria-label` attributes. Labels SHALL be programmatically associated with inputs via the `for` attribute (matching input `id`) or by wrapping the input in a `<label>` element. Error messages and validation feedback SHALL be announced to screen readers via `aria-describedby` or ARIA live regions.

#### Scenario: Newsletter input has visible label

- **WHEN** a user encounters the newsletter email input on the landing page footer
- **THEN** the input has a visible `<label>` element with text such as "Email address" or "Subscribe to newsletter"

#### Scenario: Parameter slider has visible label

- **WHEN** a user encounters a parameter slider (e.g., launch angle) in the episode shell
- **THEN** the slider has a visible label (e.g., "Launch Angle: 45°") or an `aria-label="Launch angle"` attribute

#### Scenario: Form validation error announced

- **WHEN** a user submits the newsletter form with an invalid email address
- **THEN** an error message appears near the input and is announced to screen readers via `aria-describedby` or an aria-live region (e.g., "Please enter a valid email address")

### Requirement: Automated Accessibility Testing

The platform's CI/CD pipeline SHALL include automated accessibility testing using axe-core and Lighthouse. Every UI component SHALL be tested with axe-core on mount in unit tests. Every page SHALL be audited with Lighthouse CI, and the accessibility score SHALL be at least 90. CI builds SHALL fail if axe-core detects violations with severity >= moderate. The ESLint configuration SHALL include the `eslint-plugin-jsx-a11y` plugin with recommended rules enabled.

#### Scenario: axe-core tests run on component mount

- **WHEN** a UI component (Button, Slider, Navigation) is mounted in a Vitest unit test
- **THEN** axe-core is run against the rendered component, and the test fails if any violations are detected

#### Scenario: Lighthouse CI asserts accessibility score

- **WHEN** a pull request is opened or pushed to the main branch
- **THEN** Lighthouse CI runs against the landing page and episode page, and the build fails if the accessibility score is below 90

#### Scenario: ESLint catches accessibility issues

- **WHEN** a developer writes JSX code with missing `alt` text, missing `aria-label`, or improper ARIA attribute usage
- **THEN** ESLint reports an error from the `jsx-a11y` plugin, and the pre-commit hook prevents the commit

### Requirement: Documentation of Accessibility Patterns

The platform SHALL maintain comprehensive accessibility documentation for developers building new episodes or components. Documentation SHALL cover keyboard navigation patterns, screen reader announcement patterns, focus management strategies, canvas accessibility approaches, reduced motion implementation, and testing procedures. An accessibility checklist SHALL be provided for episode development.

#### Scenario: Accessibility guide exists

- **WHEN** a developer needs to implement a new episode or component
- **THEN** they can reference `docs/accessibility-guide.md` for platform accessibility patterns and requirements

#### Scenario: Episode development checklist includes accessibility

- **WHEN** a developer uses the episode development template or checklist
- **THEN** the checklist includes accessibility tasks such as "Add keyboard navigation to all controls", "Test with screen reader", "Verify focus indicators", "Test with reduced motion enabled"

#### Scenario: Canvas accessibility pattern documented

- **WHEN** a developer needs to implement a canvas-based simulation in a new episode
- **THEN** they can reference documentation explaining how to provide text alternatives, announce state changes, and ensure keyboard accessibility for canvas interactions
