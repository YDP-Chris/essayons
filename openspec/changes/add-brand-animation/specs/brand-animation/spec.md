## ADDED Requirements

### Requirement: Domain Orbit Animation

The system SHALL provide a DomainOrbit component that renders an animated visualization of six domain icons orbiting a central "E" logomark. The center logo MUST be a 120px diameter circle with background color #1A1A2E (ink), displaying an italic "E" character in #FFFEF9 (cream) with a box-shadow glow. Three concentric orbit rings MUST be rendered with dashed borders at 220px, 320px, and 420px diameters, with opacity 0.4. Ring 1 MUST spin clockwise over 30 seconds, ring 2 MUST spin counter-clockwise over 45 seconds, and ring 3 MUST spin clockwise over 60 seconds. Six domain nodes (56px diameter circles with cream backgrounds and 2px colored borders) MUST be positioned on the rings: physics (#00D4AA) and civics (#E63946) on ring 1, economics (#2A9D8F) and history (#E9C46A) on ring 2, biology (#8AC926) and engineering (#FF6B35) on ring 3.

#### Scenario: Orbit renders on page load

- **WHEN** the DomainOrbit component is mounted on the landing page hero section
- **THEN** a center logo with italic "E" is rendered, three dashed orbit rings are visible, and six domain nodes (each displaying its domain icon) are positioned on the rings

#### Scenario: Orbit rings spin continuously

- **WHEN** the DomainOrbit component is rendered and the user has not enabled `prefers-reduced-motion`
- **THEN** ring 1 rotates 360 degrees clockwise over 30 seconds and loops infinitely, ring 2 rotates 360 degrees counter-clockwise over 45 seconds and loops infinitely, and ring 3 rotates 360 degrees clockwise over 60 seconds and loops infinitely

#### Scenario: Domain nodes hover effect

- **WHEN** a user hovers over a domain node with a pointing device
- **THEN** the node scales to 115% of its original size with a smooth transition

#### Scenario: Orbit uses pure CSS animation

- **WHEN** the DomainOrbit component is rendered
- **THEN** all animations are implemented using CSS `@keyframes` and `animation` properties, with no JavaScript animation loop running

### Requirement: Icon Component System

The system SHALL provide an Icon component that accepts a `name` prop (string), a `size` prop (number in pixels, default 24), and an optional `color` prop (CSS color string). The Icon component MUST render the corresponding inline SVG icon. All icons MUST be implemented as React components returning SVG JSX, co-located in `src/components/icons/` with subdirectories `domains/` and `ui/`. The Icon component MUST apply `aria-hidden="true"` by default to treat icons as decorative. Icons MUST use `currentColor` for SVG fill or stroke to inherit text color.

#### Scenario: Icon renders with default size

- **WHEN** an Icon component is rendered with `name="physics"` and no size prop
- **THEN** the physics SVG icon is rendered at 24x24 pixels

#### Scenario: Icon renders with custom size

- **WHEN** an Icon component is rendered with `name="civics"` and `size={32}`
- **THEN** the civics SVG icon is rendered at 32x32 pixels

#### Scenario: Icon renders with custom color

- **WHEN** an Icon component is rendered with `name="play"` and `color="#FF6B35"`
- **THEN** the play SVG icon is rendered with fill or stroke color #FF6B35

#### Scenario: Icon is decorative by default

- **WHEN** an Icon component is rendered
- **THEN** the root SVG element has `aria-hidden="true"` attribute

#### Scenario: Icon inherits text color

- **WHEN** an Icon component is rendered without a `color` prop inside a parent element with `color: #1A1A2E`
- **THEN** the SVG icon's fill or stroke uses `currentColor` and inherits #1A1A2E

### Requirement: Domain Icon Set

The system SHALL provide SVG icons for six domains: physics, civics, economics, history, biology, and engineering. Each icon MUST have a visually distinct shape that remains recognizable in grayscale or under color vision deficiency filters. Physics MUST use a satellite or orbit shape, civics MUST use a columned building or capitol shape, economics MUST use an upward trend line with data points, history MUST use a scroll or document shape, biology MUST use a double helix or DNA structure, and engineering MUST use a gear or cog shape.

#### Scenario: Domain icons are colorblind-safe

- **WHEN** domain icons are rendered and viewed through color vision deficiency filters (protanopia, deuteranopia, tritanopia)
- **THEN** each domain icon is distinguishable from the others by shape alone, not requiring color to convey identity

#### Scenario: Physics icon renders satellite shape

- **WHEN** an Icon component is rendered with `name="physics"`
- **THEN** an SVG icon depicting a satellite or orbit shape is displayed

#### Scenario: Civics icon renders building shape

- **WHEN** an Icon component is rendered with `name="civics"`
- **THEN** an SVG icon depicting a columned building or capitol is displayed

#### Scenario: Economics icon renders trend line shape

- **WHEN** an Icon component is rendered with `name="economics"`
- **THEN** an SVG icon depicting an upward trend line with data points is displayed

#### Scenario: History icon renders scroll shape

- **WHEN** an Icon component is rendered with `name="history"`
- **THEN** an SVG icon depicting a scroll or document is displayed

#### Scenario: Biology icon renders DNA shape

- **WHEN** an Icon component is rendered with `name="biology"`
- **THEN** an SVG icon depicting a double helix or DNA structure is displayed

#### Scenario: Engineering icon renders gear shape

- **WHEN** an Icon component is rendered with `name="engineering"`
- **THEN** an SVG icon depicting a gear or cog is displayed

### Requirement: UI Icon Set

The system SHALL provide SVG icons for common UI actions and states: play, pause, reset, share, settings, close, chevron (directional arrow), check, x (cross), and hint-bulb (lightbulb). Each icon MUST be recognizable and follow standard iconographic conventions.

#### Scenario: Play icon renders triangle

- **WHEN** an Icon component is rendered with `name="play"`
- **THEN** an SVG icon depicting a right-pointing triangle is displayed

#### Scenario: Pause icon renders two bars

- **WHEN** an Icon component is rendered with `name="pause"`
- **THEN** an SVG icon depicting two vertical bars is displayed

#### Scenario: Reset icon renders circular arrow

- **WHEN** an Icon component is rendered with `name="reset"`
- **THEN** an SVG icon depicting a circular arrow is displayed

#### Scenario: Share icon renders network nodes

- **WHEN** an Icon component is rendered with `name="share"`
- **THEN** an SVG icon depicting connected nodes or a share symbol is displayed

#### Scenario: Settings icon renders gear

- **WHEN** an Icon component is rendered with `name="settings"`
- **THEN** an SVG icon depicting a gear or cog is displayed

#### Scenario: Close icon renders X

- **WHEN** an Icon component is rendered with `name="close"`
- **THEN** an SVG icon depicting an X or close symbol is displayed

#### Scenario: Chevron icon renders directional arrow

- **WHEN** an Icon component is rendered with `name="chevron"`
- **THEN** an SVG icon depicting a directional arrow (chevron) is displayed

#### Scenario: Check icon renders checkmark

- **WHEN** an Icon component is rendered with `name="check"`
- **THEN** an SVG icon depicting a checkmark is displayed

#### Scenario: X icon renders cross

- **WHEN** an Icon component is rendered with `name="x"`
- **THEN** an SVG icon depicting a cross or removal symbol is displayed

#### Scenario: Hint-bulb icon renders lightbulb

- **WHEN** an Icon component is rendered with `name="hint-bulb"`
- **THEN** an SVG icon depicting a lightbulb is displayed

### Requirement: Reduced Motion Support

The system SHALL respect the user's `prefers-reduced-motion` operating system setting. When `prefers-reduced-motion: reduce` is active, all orbit ring animations in the DomainOrbit component MUST be paused using `animation-play-state: paused`. The visual structure (center logo, rings, and nodes) MUST remain visible and static.

#### Scenario: Animations pause with reduced motion preference

- **WHEN** the user has enabled `prefers-reduced-motion: reduce` in their operating system settings and the DomainOrbit component is rendered
- **THEN** all three orbit rings are rendered but remain static with `animation-play-state: paused`

#### Scenario: Visual structure remains with reduced motion

- **WHEN** the user has enabled `prefers-reduced-motion: reduce`
- **THEN** the center logo, orbit rings, and domain nodes are still visible in their original layout, forming a static diagram

### Requirement: Responsive Orbit Behavior

The system SHALL adapt the DomainOrbit component size and layout across viewport widths. On desktop viewports (1024px and above), the orbit MUST render at full size (420px outer ring diameter). On tablet viewports (768px to 1023px), the orbit MUST scale down proportionally. On mobile viewports (below 768px), the orbit MUST either scale down further or be replaced with a simplified layout (e.g., stacked domain icons) to ensure usability and performance.

#### Scenario: Full-size orbit on desktop

- **WHEN** the DomainOrbit component is rendered on a viewport 1024px or wider
- **THEN** the outer orbit ring (ring 3) has a diameter of 420px, and all other elements are sized proportionally

#### Scenario: Scaled orbit on tablet

- **WHEN** the DomainOrbit component is rendered on a viewport between 768px and 1023px wide
- **THEN** the orbit scales down proportionally (e.g., outer ring approximately 320px) to fit the viewport

#### Scenario: Simplified or scaled orbit on mobile

- **WHEN** the DomainOrbit component is rendered on a viewport below 768px wide
- **THEN** the orbit either scales down further (e.g., outer ring approximately 240px, center logo 80px) or is replaced with a simplified stacked layout of domain icons

#### Scenario: Orbit maintains smooth animation on mobile

- **WHEN** the DomainOrbit component is rendered on a mid-range mobile device with animations enabled
- **THEN** the orbit animation maintains at least 30 frames per second without visible jank

### Requirement: Emoji Replacement Platform-Wide

The system SHALL replace all emoji Unicode characters used for domain icons and UI elements with the Icon component throughout the codebase. Episode cards, episode grids, reference panels, simulation controls, and any other components currently displaying emoji icons MUST be updated to use `<Icon name="..." />` instead.

#### Scenario: Episode card uses Icon component

- **WHEN** an EpisodeCard component is rendered for the physics domain
- **THEN** the card displays `<Icon name="physics" />` instead of the 🛰️ emoji Unicode character

#### Scenario: Simulation controls use Icon components

- **WHEN** simulation UI controls (play, pause, reset buttons) are rendered
- **THEN** the buttons display `<Icon name="play" />`, `<Icon name="pause" />`, and `<Icon name="reset" />` instead of emoji Unicode characters

#### Scenario: Reference panel uses Icon components

- **WHEN** a reference panel or hint system is rendered
- **THEN** hint icons display `<Icon name="hint-bulb" />` instead of emoji Unicode characters
