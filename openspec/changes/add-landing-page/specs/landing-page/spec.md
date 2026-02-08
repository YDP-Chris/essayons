## ADDED Requirements

### Requirement: Hero Section

The landing page SHALL display a hero section as the first content area below the navigation bar. The hero section MUST include a headline reading "Learn by crashing into things." rendered in Instrument Serif, a subheadline describing interactive simulations across domains rendered in DM Sans, a primary call-to-action button labeled "Start Exploring" that navigates the user to the episode grid without requiring an account, and a domain orbit animation as a hero visual element.

#### Scenario: Hero renders on page load

- **WHEN** a user navigates to the landing page root URL
- **THEN** the hero section is visible in the viewport with the headline "Learn by crashing into things.", a descriptive subheadline, and a "Start Exploring" button

#### Scenario: CTA scrolls to episode grid

- **WHEN** a user activates the "Start Exploring" button
- **THEN** the page scrolls smoothly to the episode grid section

#### Scenario: Reduced motion preference

- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** the domain orbit animation SHALL be paused or replaced with a static visual

### Requirement: Episode Grid

The landing page SHALL display a visual grid of all available episodes. Each episode card MUST show the episode's domain accent color, icon, name, and a one-line hook. The grid MUST include the following episodes at launch: Orbit Lab (Physics, #00D4AA), Citizen Lab (Civics, #E63946), Market Lab (Economics, #2A9D8F), History Lab (History, #E9C46A), Gene Lab (Biology, #8AC926), and Bridge Lab (Engineering, #FF6B35).

#### Scenario: All episode cards displayed

- **WHEN** the landing page loads
- **THEN** six episode cards are rendered in a grid layout, each displaying its domain color, icon, name, and one-line hook

#### Scenario: Episode card navigation

- **WHEN** a user activates an episode card
- **THEN** the user is navigated to that episode's page (or a placeholder route if the episode is not yet implemented)

#### Scenario: Episode card color contrast

- **WHEN** episode cards are rendered
- **THEN** the text on each card MUST meet WCAG AA contrast ratio (4.5:1 minimum) against the card background

### Requirement: Value Proposition

The landing page SHALL display a value proposition section presenting three pillars: Real Computation (actual equations, not approximations), Zero Friction (no account needed, instant access), and Any Domain (physics to civics to economics and beyond). Each pillar MUST include a concise description and a visual icon or illustration.

#### Scenario: Three pillars displayed

- **WHEN** the landing page loads
- **THEN** the value proposition section displays three distinct pillars with titles "Real Computation", "Zero Friction", and "Any Domain", each with a description and visual element

#### Scenario: Semantic structure

- **WHEN** a screen reader navigates the value proposition section
- **THEN** each pillar is announced with its heading and description in a logical reading order

### Requirement: Teacher Section

The landing page SHALL include a section addressed to teachers that communicates instant classroom deployment, free access, and curriculum alignment. The section MUST provide a clear entry point for teachers seeking more information.

#### Scenario: Teacher messaging displayed

- **WHEN** the landing page loads
- **THEN** a "For Teachers" section is visible containing messaging about instant classroom deployment, free access, and curriculum alignment

#### Scenario: Teacher call-to-action

- **WHEN** a teacher activates the teacher section CTA
- **THEN** the user is directed to additional teacher-specific information or resources

### Requirement: Navigation Bar

The landing page SHALL include a fixed or sticky navigation bar at the top of the page containing the Essayons wordmark (or logo), an "All Episodes" link, and a "For Teachers" link. The navigation bar MUST include a skip-to-content link as the first focusable element.

#### Scenario: Navigation links present

- **WHEN** the landing page loads
- **THEN** the navigation bar displays the Essayons wordmark, an "All Episodes" link, and a "For Teachers" link

#### Scenario: Skip to content

- **WHEN** a keyboard user presses Tab on initial page focus
- **THEN** the first focusable element is a "Skip to content" link that, when activated, moves focus to the main content area

#### Scenario: Mobile navigation

- **WHEN** the viewport width is below the tablet breakpoint (768px)
- **THEN** the navigation links collapse into a hamburger menu that can be toggled open and closed, with `aria-expanded` correctly reflecting the menu state

### Requirement: Footer

The landing page SHALL display a footer containing navigation links (About, All Episodes, For Teachers), a newsletter signup form with an email input, social media links, and copyright information.

#### Scenario: Footer links and content

- **WHEN** the landing page loads
- **THEN** the footer is rendered with links to About, All Episodes, and For Teachers, a newsletter email input with a submit action, social media links with descriptive `aria-label` attributes, and copyright text

#### Scenario: Newsletter signup accessible

- **WHEN** a user interacts with the newsletter email input
- **THEN** the input has an associated visible label or `aria-label`, and the submit button is keyboard-accessible

### Requirement: Responsive Layout

The landing page SHALL use a mobile-first responsive layout. The layout MUST adapt across three breakpoints: mobile (default, below 768px), tablet (768px and above), and desktop (1024px and above). All interactive elements MUST have touch targets of at least 44x44 CSS pixels on mobile viewports.

#### Scenario: Mobile layout

- **WHEN** the viewport width is below 768px
- **THEN** the episode grid displays in a single column, the navigation collapses to a hamburger menu, and all touch targets are at least 44x44px

#### Scenario: Tablet layout

- **WHEN** the viewport width is 768px or above but below 1024px
- **THEN** the episode grid displays in two columns and the navigation is fully visible

#### Scenario: Desktop layout

- **WHEN** the viewport width is 1024px or above
- **THEN** the episode grid displays in three columns, the layout uses wider margins, and all sections are appropriately spaced for large screens

### Requirement: SEO and Open Graph

The landing page SHALL include SEO-friendly semantic HTML with a proper heading hierarchy (single h1, logical h2/h3 nesting). The page MUST include Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) for social sharing previews. The page MUST include a `<title>` element and `<meta name="description">` tag.

#### Scenario: Meta tags present

- **WHEN** the landing page HTML is rendered
- **THEN** the `<head>` contains a `<title>`, a meta description, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), and Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

#### Scenario: Heading hierarchy

- **WHEN** a crawler or screen reader parses the landing page
- **THEN** there is exactly one `<h1>` element, and all subsequent headings follow a logical nesting order (no skipped levels)

#### Scenario: Social sharing preview

- **WHEN** the landing page URL is shared on a social platform
- **THEN** the platform displays a rich preview with the Essayons title, a description of the platform, and a branded preview image (1200x630 pixels)

### Requirement: Performance

The landing page SHALL load in under 3 seconds on a simulated 3G connection. Fonts MUST be loaded with `font-display: swap` to prevent flash of invisible text. Images below the fold MUST use lazy loading. The total page weight (HTML, CSS, JavaScript, and fonts, before compression) MUST be under 500 KB.

#### Scenario: Load time on 3G

- **WHEN** the landing page is tested with a simulated 3G connection (Lighthouse or WebPageTest)
- **THEN** the Time to Interactive is under 3 seconds

#### Scenario: Font loading

- **WHEN** fonts are loading over a slow connection
- **THEN** fallback system fonts are displayed immediately, and custom fonts swap in when ready (`font-display: swap`)

#### Scenario: Below-fold lazy loading

- **WHEN** the landing page loads
- **THEN** images in the episode grid, teacher section, and footer use native lazy loading (`loading="lazy"`) or an equivalent mechanism

#### Scenario: Page weight budget

- **WHEN** the total uncompressed transfer size of the landing page is measured
- **THEN** it is under 500 KB (HTML + CSS + JS + fonts)
