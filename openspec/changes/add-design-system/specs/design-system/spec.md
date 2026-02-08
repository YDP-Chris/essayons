## ADDED Requirements

### Requirement: CSS Custom Properties Design Tokens

The system SHALL define all design tokens as CSS Custom Properties on the `:root` element. Tokens SHALL include the core color palette (`--ink: #1A1A2E`, `--graphite: #2D2D44`, `--slate: #4A4A68`, `--stone: #8E8EA0`, `--paper: #F7F6F3`, `--cream: #FFFEF9`), action colors (`--spark: #FF6B35`, `--growth: #2EC4B6`, `--think: #7B68EE`, `--warm: #FFB800`), domain accent colors, spacing scale, border-radius, and shadow tokens. All visual styling across the platform MUST reference these tokens rather than hardcoded values.

#### Scenario: Tokens are available globally

- **WHEN** any page in the application loads
- **THEN** all CSS Custom Properties defined in `tokens.css` are available on the `:root` element and can be referenced by any component's stylesheet

#### Scenario: Token value override for theming

- **WHEN** a parent element redefines a CSS Custom Property (e.g., `--domain-accent`)
- **THEN** all descendant elements referencing that property inherit the overridden value

#### Scenario: Spacing scale consistency

- **WHEN** a developer uses a spacing token (e.g., `--space-4`)
- **THEN** the value corresponds to a 4px base unit multiplied by the token index (e.g., `--space-4` equals `16px`)

---

### Requirement: Typography System

The system SHALL load three font families via Google Fonts: Instrument Serif (display and headings), DM Sans (body and UI text), and IBM Plex Mono (data and telemetry readouts). The system SHALL define a type scale with semantic CSS classes: `.text-display` (48-64px), `.text-h1` (32-40px), `.text-h2` (24-28px), `.text-h3` (18-20px), `.text-body` (16-18px), `.text-ui` (14px), `.text-data` (14-16px), and `.text-label` (11-12px). Font loading MUST use `font-display: swap` to prevent invisible text during load.

#### Scenario: Fonts load with swap behavior

- **WHEN** the application loads on a slow connection
- **THEN** text is immediately visible using fallback system fonts and swaps to the branded fonts once they finish downloading

#### Scenario: Display text uses Instrument Serif

- **WHEN** an element has the `.text-display` class applied
- **THEN** it renders in Instrument Serif at 48-64px (responsive) with appropriate line-height and letter-spacing

#### Scenario: Telemetry data uses IBM Plex Mono

- **WHEN** an element has the `.text-data` class applied
- **THEN** it renders in IBM Plex Mono at 14-16px, ensuring numerical data is displayed in a monospaced font for alignment

#### Scenario: Fallback font stacks

- **WHEN** Google Fonts fails to load
- **THEN** Instrument Serif falls back to `Georgia, 'Times New Roman', serif`; DM Sans falls back to `'Helvetica Neue', Arial, sans-serif`; IBM Plex Mono falls back to `'Courier New', Courier, monospace`

---

### Requirement: Color System

The system SHALL provide a color system consisting of three layers: core palette (ink, graphite, slate, stone, paper, cream), action colors (spark for CTAs, growth for success states, think for processing/active states, warm for highlights and warnings), and domain accent colors (one per learning domain). The system SHALL define semantic color aliases (e.g., `--color-text-primary`, `--color-bg-primary`) that map to the core palette for consistent usage across components.

#### Scenario: Core palette applied to default UI

- **WHEN** no domain theme is active
- **THEN** text uses `--ink` (#1A1A2E) on `--paper` (#F7F6F3) background, providing a warm, readable default appearance

#### Scenario: Action colors convey meaning

- **WHEN** a primary call-to-action button is rendered
- **THEN** it uses `--spark` (#FF6B35) as the background color
- **WHEN** a success state is indicated
- **THEN** it uses `--growth` (#2EC4B6)
- **WHEN** a processing or active-thinking state is shown
- **THEN** it uses `--think` (#7B68EE)

#### Scenario: Semantic aliases resolve correctly

- **WHEN** a component references `--color-text-primary`
- **THEN** it resolves to `--ink` (#1A1A2E) by default

---

### Requirement: Shared UI Components

The system SHALL provide reusable React components: `Button`, `Slider`, `Card`, and `Navigation`. Each component MUST consume design tokens via CSS Custom Properties, accept a `className` prop for composition, and forward refs to the underlying DOM element. Components MUST NOT contain episode-specific or domain-specific logic; domain theming is achieved solely through CSS variable inheritance.

#### Scenario: Button component renders variants

- **WHEN** a `Button` is rendered with `variant="primary"`
- **THEN** it displays with `--spark` background, `--cream` text, and brand border-radius
- **WHEN** a `Button` is rendered with `variant="secondary"`
- **THEN** it displays with a transparent background, `--ink` text, and a 1px `--slate` border
- **WHEN** a `Button` is rendered with `variant="ghost"`
- **THEN** it displays with no background or border, and `--ink` text with underline on hover

#### Scenario: Slider component wraps native range input

- **WHEN** a `Slider` is rendered with `min`, `max`, `value`, and `onChange` props
- **THEN** it renders a styled `<input type="range">` with a track using `--stone` and a thumb using `--domain-accent` (or `--spark` if no domain theme is active)
- **THEN** it renders an associated `<label>` element linked via `htmlFor`/`id`

#### Scenario: Card component provides content slots

- **WHEN** a `Card` is rendered with `header`, `children`, and `footer` props
- **THEN** it renders a container with `--paper` background, subtle border using `--stone`, brand border-radius, and the three content areas in vertical layout

#### Scenario: Navigation component renders links

- **WHEN** a `Navigation` component is rendered with a list of episode links
- **THEN** it renders a `<nav>` element with `aria-label`, containing styled links that highlight the current route

#### Scenario: Components accept className for composition

- **WHEN** any shared UI component receives a `className` prop
- **THEN** the provided class is merged with the component's default classes, allowing style overrides without modifying the component

---

### Requirement: Accessibility Baseline

The system SHALL enforce WCAG AA accessibility standards across all shared components. All text/background color combinations MUST meet a minimum 4.5:1 contrast ratio. All interactive elements MUST have visible focus indicators using `:focus-visible`. All interactive elements MUST have a minimum touch target size of 44x44 CSS pixels. The system MUST NOT rely solely on color to convey information (icons or text MUST reinforce color meaning). The system MUST support full keyboard navigation for all interactive components. The system MUST provide skip-navigation functionality and ARIA landmarks.

#### Scenario: Contrast ratio meets WCAG AA

- **WHEN** any text is rendered on a background using the design system's color tokens
- **THEN** the text/background combination achieves at least a 4.5:1 contrast ratio as measured by WCAG 2.1 guidelines

#### Scenario: Focus indicators are visible

- **WHEN** a user navigates to an interactive element using the keyboard (Tab key)
- **THEN** a visible focus ring appears around the element using the `--think` color (#7B68EE) with sufficient contrast against the background

#### Scenario: Keyboard navigation works for all interactive components

- **WHEN** a user presses Tab to move through the page
- **THEN** focus moves to each interactive element in a logical DOM order
- **WHEN** a user presses Enter or Space on a focused Button
- **THEN** the button's click handler is invoked
- **WHEN** a user presses Arrow keys on a focused Slider
- **THEN** the slider value adjusts by its defined step increment

#### Scenario: Color is not the sole indicator

- **WHEN** a status is communicated using color (e.g., green for success, red for error)
- **THEN** an accompanying icon or text label also conveys the same meaning, ensuring colorblind users receive the information

#### Scenario: Screen reader landmarks are present

- **WHEN** the main application layout renders
- **THEN** it includes ARIA landmarks: `banner` (header), `navigation` (nav), `main` (content area), and `contentinfo` (footer)
- **THEN** a skip-to-content link is the first focusable element on the page

#### Scenario: Touch targets meet minimum size

- **WHEN** any button, link, or interactive control is rendered
- **THEN** its clickable/tappable area is at least 44x44 CSS pixels

#### Scenario: Reduced motion is respected

- **WHEN** the user's operating system has `prefers-reduced-motion: reduce` enabled
- **THEN** all CSS animations and transitions are disabled or reduced to essential-only motion

---

### Requirement: Responsive Design

The system SHALL implement a mobile-first responsive design approach with defined breakpoints: small (`640px`), medium (`768px`), large (`1024px`), and extra-large (`1280px`). Base styles MUST target mobile viewports, with progressive enhancement via `min-width` media queries. All shared UI components MUST reflow and remain usable across the full breakpoint range.

#### Scenario: Mobile-first base styles

- **WHEN** the application loads on a viewport narrower than 640px
- **THEN** all content displays in a single-column layout, navigation collapses to a compact format, and text remains readable without horizontal scrolling

#### Scenario: Components reflow at breakpoints

- **WHEN** the viewport width crosses the medium breakpoint (768px)
- **THEN** layout components transition from stacked (mobile) to side-by-side (tablet/desktop) arrangements where appropriate

#### Scenario: Content remains accessible at all sizes

- **WHEN** the viewport is at any width between 320px and 2560px
- **THEN** no content is clipped, hidden, or requires horizontal scrolling to access, and all interactive elements remain operable

#### Scenario: Breakpoint tokens are consistent

- **WHEN** a developer writes a media query using the design system's breakpoint values
- **THEN** the breakpoints are `640px` (sm), `768px` (md), `1024px` (lg), and `1280px` (xl), matching the values defined in `tokens.css`

---

### Requirement: Domain Theming

The system SHALL provide a per-episode domain theming mechanism that applies a unique accent color to all accent-aware UI elements. Domain colors SHALL be: Physics `#00D4AA`, Civics `#E63946`, Economics `#2A9D8F`, History `#E9C46A`, Biology `#8AC926`, Engineering `#FF6B35`. A `ThemeProvider` React component MUST accept a `domain` prop and set `--domain-accent` on its subtree. A `useDomainTheme` hook MUST expose the current domain's accent color and label. Components MUST reference `--domain-accent` for accent-colored elements rather than hardcoding domain-specific colors.

#### Scenario: Physics episode applies its accent

- **WHEN** a `ThemeProvider` renders with `domain="physics"`
- **THEN** `--domain-accent` is set to `#00D4AA` on the provider's wrapper element
- **THEN** all descendant components using `var(--domain-accent)` display the Physics teal-green accent

#### Scenario: Switching domains updates accent

- **WHEN** the user navigates from the Physics episode to the Civics episode
- **THEN** the `ThemeProvider`'s `domain` prop changes to `"civics"` and `--domain-accent` updates to `#E63946`
- **THEN** all accent-colored elements within the subtree re-render with the Civics red accent

#### Scenario: useDomainTheme hook provides context

- **WHEN** a component calls `useDomainTheme()` inside a `ThemeProvider` with `domain="economics"`
- **THEN** the hook returns `{ accent: '#2A9D8F', domain: 'economics', label: 'Economics' }`

#### Scenario: Default accent without ThemeProvider

- **WHEN** a component references `var(--domain-accent)` outside of any `ThemeProvider`
- **THEN** the value falls back to `--spark` (#FF6B35), the default action color, as defined on `:root`

#### Scenario: Adding a new domain requires no component changes

- **WHEN** a new episode domain is added to the platform
- **THEN** only the domain-to-color mapping object and the `ThemeProvider` configuration need updating; no shared UI component code changes are required
