# Responsive Episodes Specification

## ADDED Requirements

### Requirement: Breakpoint Detection

The system SHALL detect viewport width and apply appropriate layout breakpoints at mobile (< 768px), tablet (768px - 1023px), and desktop (>= 1024px) sizes.

#### Scenario: Mobile viewport detected

- **WHEN** viewport width is 375px
- **THEN** mobile layout is applied (single column, drawer/sheet controls)

#### Scenario: Tablet viewport detected

- **WHEN** viewport width is 800px
- **THEN** tablet layout is applied (2-column stack, inline controls)

#### Scenario: Desktop viewport detected

- **WHEN** viewport width is 1280px
- **THEN** desktop layout is applied (3-column grid)

#### Scenario: Viewport resize triggers layout change

- **WHEN** viewport is resized from 1280px to 600px
- **THEN** layout transitions from desktop to mobile without data loss

### Requirement: Mobile Canvas Rendering

The system SHALL render the canvas at full viewport width on mobile devices and support touch gestures for zoom and pan.

#### Scenario: Full-width canvas on mobile

- **WHEN** viewport width is 320px (mobile)
- **THEN** canvas width is 100% of viewport width minus padding
- **THEN** canvas maintains aspect ratio

#### Scenario: Pinch-to-zoom on canvas

- **WHEN** user performs two-finger pinch gesture on canvas
- **THEN** canvas zoom level adjusts proportionally to pinch distance
- **THEN** minimum zoom is 50%, maximum zoom is 300%

#### Scenario: Drag-to-pan on canvas

- **WHEN** user performs single-finger drag on zoomed canvas
- **THEN** canvas viewport offset adjusts to follow drag
- **THEN** pan is constrained to canvas bounds

#### Scenario: Double-tap zoom reset

- **WHEN** user double-taps canvas
- **THEN** zoom level resets to 100%
- **THEN** viewport offset resets to center

#### Scenario: Touch event conflict prevention

- **WHEN** user interacts with canvas via touch
- **THEN** browser default gestures (zoom, scroll) are prevented on canvas element
- **THEN** surrounding page elements still allow normal scrolling

### Requirement: Mobile Parameter Panel Drawer

The system SHALL display the parameter panel in a slide-in drawer from the right on mobile viewports, collapsed by default.

#### Scenario: Drawer collapsed by default

- **WHEN** episode loads on mobile viewport (< 768px)
- **THEN** parameter panel drawer is closed
- **THEN** drawer toggle button is visible

#### Scenario: Open drawer via button

- **WHEN** user taps drawer toggle button
- **THEN** parameter panel slides in from right
- **THEN** drawer covers maximum 80% of viewport width
- **THEN** backdrop overlay appears behind drawer

#### Scenario: Close drawer via backdrop

- **WHEN** drawer is open
- **WHEN** user taps backdrop overlay
- **THEN** drawer slides out to right
- **THEN** backdrop overlay fades out

#### Scenario: Close drawer via close button

- **WHEN** drawer is open
- **WHEN** user taps close button in drawer header
- **THEN** drawer slides out to right

#### Scenario: Drawer state persists during parameter changes

- **WHEN** drawer is open
- **WHEN** user adjusts a parameter
- **THEN** drawer remains open
- **THEN** simulation updates in background

### Requirement: Mobile Reference Panel Bottom Sheet

The system SHALL display the reference panel in a bottom sheet on mobile viewports, with draggable snap points.

#### Scenario: Bottom sheet collapsed by default

- **WHEN** episode loads on mobile viewport (< 768px)
- **THEN** bottom sheet is collapsed to 30% viewport height
- **THEN** drag handle is visible at top of sheet

#### Scenario: Expand sheet via drag

- **WHEN** user drags sheet handle upward
- **THEN** sheet expands to nearest snap point (30%, 60%, 90%)
- **THEN** sheet content scrolls when at maximum snap

#### Scenario: Collapse sheet via drag

- **WHEN** user drags sheet handle downward
- **THEN** sheet collapses to nearest snap point
- **THEN** sheet cannot be dragged below 30% (minimum snap)

#### Scenario: Snap point settling

- **WHEN** user releases drag between snap points
- **THEN** sheet animates to nearest snap point
- **THEN** animation duration is 200ms with ease-out timing

#### Scenario: Sheet content scrolling

- **WHEN** sheet is expanded to 90% snap
- **WHEN** reference content exceeds sheet height
- **THEN** content scrolls vertically within sheet
- **THEN** drag on content scrolls content, not sheet position
- **THEN** drag on header/handle moves sheet position

### Requirement: Touch-Friendly Control Sizing

The system SHALL ensure all interactive controls meet minimum touch target size of 44x44 pixels on mobile viewports.

#### Scenario: Slider touch targets

- **WHEN** parameter panel displays number slider on mobile
- **THEN** slider thumb is at least 44px in diameter
- **THEN** slider track is at least 44px in height
- **THEN** user can drag slider with single touch

#### Scenario: Button touch targets

- **WHEN** control buttons render on mobile (Play, Pause, Reset)
- **THEN** each button is at least 44x44 pixels
- **THEN** buttons have at least 8px spacing between them

#### Scenario: Checkbox touch targets

- **WHEN** boolean parameter renders on mobile
- **THEN** checkbox touch area is at least 44x44 pixels
- **THEN** label text is included in touch target

#### Scenario: Tab button touch targets

- **WHEN** reference panel tabs render on mobile
- **THEN** each tab button is at least 44px in height
- **THEN** tabs have at least 4px spacing between them

### Requirement: Landscape Orientation Support

The system SHALL adapt layout for landscape phone orientation by expanding canvas to full viewport and displaying panels as overlays.

#### Scenario: Landscape mode detection

- **WHEN** viewport width is 667px and height is 375px (landscape phone)
- **THEN** landscape layout is applied
- **THEN** canvas expands to full viewport width and height

#### Scenario: Header auto-hide in landscape

- **WHEN** landscape mode is active
- **WHEN** viewport height is less than 500px
- **THEN** episode header auto-hides after 3 seconds of inactivity
- **THEN** header reappears on any touch/click

#### Scenario: Panels as overlay in landscape

- **WHEN** landscape mode is active
- **WHEN** user opens parameter panel
- **THEN** panel appears as modal overlay on top of canvas
- **THEN** canvas dims behind overlay
- **THEN** close button is visible in overlay header

### Requirement: Performance Adaptation

The system SHALL detect frame rate performance and reduce rendering quality on low-power devices to maintain 30 FPS minimum.

#### Scenario: Frame rate monitoring

- **WHEN** simulation is running
- **THEN** system tracks average FPS over 2-second windows
- **THEN** performance metrics are available to adaptation logic

#### Scenario: Trail reduction on frame drop

- **WHEN** average FPS drops below 30 for more than 2 seconds
- **THEN** trail point count is reduced by 50%
- **THEN** rendering continues at reduced quality

#### Scenario: Trail restoration on performance recovery

- **WHEN** average FPS returns above 45 for more than 5 seconds
- **THEN** trail point count is restored to original value
- **THEN** rendering quality improves gradually

#### Scenario: Device pixel ratio limiting

- **WHEN** device pixel ratio is detected as > 2 (high-DPI screen)
- **WHEN** viewport is mobile (< 768px)
- **THEN** canvas pixel ratio is capped at 2x
- **THEN** rendering performance is prioritized over maximum sharpness

### Requirement: Responsive Grid Layout

The system SHALL apply responsive CSS grid layouts that adapt EpisodeShell structure to viewport size.

#### Scenario: Mobile single-column layout

- **WHEN** viewport width is 400px
- **THEN** grid is single column
- **THEN** stacking order is: header, canvas, mission, parameters (drawer), reference (sheet)

#### Scenario: Tablet two-column layout

- **WHEN** viewport width is 900px
- **THEN** grid is two columns
- **THEN** canvas spans full width above sidebars
- **THEN** parameters, mission, and reference stack vertically in right column

#### Scenario: Desktop three-column layout

- **WHEN** viewport width is 1200px
- **THEN** grid is three columns
- **THEN** canvas occupies left column
- **THEN** parameters and mission occupy middle column
- **THEN** reference occupies right column

### Requirement: Keyboard Navigation Compatibility

The system SHALL maintain full keyboard navigation support across all responsive layouts.

#### Scenario: Drawer keyboard open

- **WHEN** drawer toggle button has focus
- **WHEN** user presses Enter or Space
- **THEN** drawer opens
- **THEN** focus moves to first control inside drawer

#### Scenario: Drawer keyboard close

- **WHEN** drawer is open
- **WHEN** user presses Escape key
- **THEN** drawer closes
- **THEN** focus returns to drawer toggle button

#### Scenario: Bottom sheet keyboard navigation

- **WHEN** bottom sheet is visible
- **WHEN** user presses Tab key
- **THEN** focus cycles through sheet content
- **THEN** focus does not leave sheet until user explicitly closes it

#### Scenario: Focus trap in open panels

- **WHEN** drawer or bottom sheet is open
- **WHEN** user tabs through all controls
- **THEN** focus wraps to first control in panel
- **THEN** focus does not escape to background content

### Requirement: Screen Reader Accessibility

The system SHALL provide appropriate ARIA labels and announcements for responsive panel state changes.

#### Scenario: Drawer state announcement

- **WHEN** parameter panel drawer opens
- **THEN** screen reader announces "Parameters panel opened"
- **WHEN** drawer closes
- **THEN** screen reader announces "Parameters panel closed"

#### Scenario: Bottom sheet state announcement

- **WHEN** reference panel sheet expands to new snap point
- **THEN** screen reader announces "Reference panel expanded to [percentage]"

#### Scenario: Canvas zoom announcement

- **WHEN** user changes canvas zoom level via pinch gesture
- **THEN** screen reader announces "Canvas zoom [percentage]" on zoom completion

#### Scenario: ARIA attributes on panels

- **WHEN** drawer renders
- **THEN** drawer has `role="dialog"` and `aria-label="Parameters"`
- **WHEN** bottom sheet renders
- **THEN** sheet has `role="region"` and `aria-label="Reference content"`

### Requirement: Visual Regression Prevention

The system SHALL maintain visual consistency at all supported breakpoints without layout breaks or content overflow.

#### Scenario: No horizontal scroll on mobile

- **WHEN** viewport width is 320px (smallest supported)
- **THEN** no horizontal scrollbar appears
- **THEN** all content fits within viewport width

#### Scenario: Canvas aspect ratio preservation

- **WHEN** viewport resizes from 1200px to 400px
- **THEN** canvas maintains 16:9 aspect ratio (or episode-specified ratio)
- **THEN** canvas does not distort or stretch

#### Scenario: Text readability at all sizes

- **WHEN** viewport is mobile (< 768px)
- **THEN** body text is minimum 16px font size
- **THEN** heading text is minimum 20px font size
- **THEN** all text has minimum 4.5:1 color contrast

#### Scenario: Control spacing consistency

- **WHEN** parameter controls render on mobile
- **THEN** vertical spacing between controls is at least 16px
- **THEN** controls do not overlap or crowd

### Requirement: Touch Gesture Visual Feedback

The system SHALL provide clear visual feedback during touch gestures to indicate system responsiveness.

#### Scenario: Zoom level indicator during pinch

- **WHEN** user performs pinch-to-zoom gesture
- **THEN** zoom level indicator appears on canvas (e.g., "150%")
- **THEN** indicator fades out 1 second after gesture completes

#### Scenario: Pan direction indicator during drag

- **WHEN** user drags canvas to pan
- **THEN** canvas content moves in real-time with finger
- **THEN** no visual lag exceeds 100ms

#### Scenario: Drawer slide animation

- **WHEN** drawer opens or closes
- **THEN** slide animation duration is 300ms
- **THEN** animation uses ease-out timing function
- **THEN** backdrop fades in/out over 200ms

#### Scenario: Bottom sheet drag feedback

- **WHEN** user drags bottom sheet handle
- **THEN** sheet position follows finger in real-time
- **THEN** resistance effect appears when dragging beyond snap points
- **THEN** snap animation settles within 200ms of release

### Requirement: Offline Responsive Behavior

The system SHALL maintain full responsive functionality when offline, without requiring network requests for layout assets.

#### Scenario: Offline mobile layout

- **WHEN** device is offline
- **WHEN** episode loads from cache on mobile viewport
- **THEN** responsive layout applies correctly
- **THEN** all CSS and JavaScript for responsive behavior is cached

#### Scenario: Offline touch gestures

- **WHEN** device is offline
- **WHEN** user performs touch gestures on canvas
- **THEN** gestures work identically to online mode
- **THEN** no network errors appear

### Requirement: Progressive Enhancement

The system SHALL provide baseline functionality on browsers without full touch event support, degrading gracefully.

#### Scenario: Fallback for browsers without touch events

- **WHEN** browser does not support TouchEvent API
- **THEN** canvas still renders at full width on mobile
- **THEN** mouse events are used as fallback for pan/zoom
- **THEN** zoom controls (buttons) are visible for manual zoom

#### Scenario: Fallback for browsers without CSS grid

- **WHEN** browser does not support CSS Grid (very old browsers)
- **THEN** layout falls back to flexbox vertical stack
- **THEN** all content remains accessible in single column

### Requirement: Analytics for Responsive Usage

The system SHALL track viewport size and interaction patterns to inform future responsive improvements.

#### Scenario: Viewport size tracking

- **WHEN** episode loads
- **THEN** viewport width and height are sent to analytics (bucketed, not exact)
- **THEN** breakpoint category (mobile/tablet/desktop) is recorded

#### Scenario: Touch gesture usage tracking

- **WHEN** user performs pinch-to-zoom on canvas
- **THEN** "canvas_pinch_zoom" event is sent to analytics
- **WHEN** user performs drag-to-pan
- **THEN** "canvas_drag_pan" event is sent to analytics

#### Scenario: Drawer/sheet interaction tracking

- **WHEN** user opens parameter panel drawer on mobile
- **THEN** "parameter_drawer_open" event is sent to analytics
- **WHEN** user expands reference bottom sheet
- **THEN** "reference_sheet_expand" event is sent with snap point value

#### Scenario: Performance degradation tracking

- **WHEN** adaptive rendering reduces trail points due to low FPS
- **THEN** "performance_adaptation" event is sent with device info
- **THEN** average FPS before and after adaptation is included

### Requirement: Viewport Meta Tag Configuration

The system SHALL include proper viewport meta tag to enable responsive behavior and prevent unwanted scaling on mobile browsers.

#### Scenario: Viewport meta tag present

- **WHEN** HTML document loads
- **THEN** `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">` is present in `<head>`
- **THEN** mobile browsers render at device width, not desktop width

#### Scenario: User scaling allowed

- **WHEN** user performs browser pinch-to-zoom (not canvas gesture)
- **THEN** entire page zooms up to 5x
- **THEN** zoom does not interfere with canvas touch gestures (prevented separately via `touch-action`)
