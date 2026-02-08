# Implementation Tasks

## 1. Infrastructure

- [ ] 1.1 Add viewport meta tag to index.html (if not present)
- [ ] 1.2 Create breakpoint constants in design system tokens
- [ ] 1.3 Add useMediaQuery hook for breakpoint detection
- [ ] 1.4 Create Drawer component for mobile sidebars
- [ ] 1.5 Create BottomSheet component for mobile reference panel
- [ ] 1.6 Create useGestures hook for touch interactions (pinch-zoom, drag-pan)

## 2. EpisodeShell Responsive Layout

- [ ] 2.1 Update EpisodeShell.css with mobile-first grid
- [ ] 2.2 Add tablet breakpoint styles (2-column stack)
- [ ] 2.3 Add desktop breakpoint styles (3-column)
- [ ] 2.4 Add landscape phone orientation detection
- [ ] 2.5 Implement drawer state management for parameter panel
- [ ] 2.6 Implement bottom sheet state management for reference panel
- [ ] 2.7 Add toggle buttons for drawer/sheet on mobile
- [ ] 2.8 Test grid layout at all breakpoints

## 3. Canvas Responsive Behavior

- [ ] 3.1 Add canvas resize observer to SimulationEngine
- [ ] 3.2 Implement full-width canvas on mobile
- [ ] 3.3 Add touch gesture support (pinch-zoom, drag-pan)
- [ ] 3.4 Detect device DPR and adjust canvas scaling
- [ ] 3.5 Add performance detection (frame rate monitoring)
- [ ] 3.6 Implement adaptive rendering (reduce trail points on low-power)
- [ ] 3.7 Test canvas touch interactions on physical devices
- [ ] 3.8 Handle landscape orientation (fullscreen canvas)

## 4. ParameterPanel Mobile Adaptations

- [ ] 4.1 Wrap ParameterPanel in Drawer component on mobile
- [ ] 4.2 Increase slider thumb size for touch (min 44px target)
- [ ] 4.3 Add vertical spacing between controls (min 8px)
- [ ] 4.4 Increase slider track height for easier touch
- [ ] 4.5 Ensure checkbox touch targets are 44x44px minimum
- [ ] 4.6 Test parameter controls on touch devices

## 5. MissionPanel Mobile Adaptations

- [ ] 5.1 Implement collapsible accordion for mission sections
- [ ] 5.2 Ensure objective items are touch-friendly (44px min height)
- [ ] 5.3 Increase button spacing in mission selector
- [ ] 5.4 Add expand/collapse icons for clarity
- [ ] 5.5 Test mission interaction on mobile

## 6. ReferencePanel Mobile Adaptations

- [ ] 6.1 Wrap ReferencePanel in BottomSheet component on mobile
- [ ] 6.2 Add drag handle to bottom sheet
- [ ] 6.3 Implement snap points (collapsed, half, full)
- [ ] 6.4 Ensure tab buttons are touch-friendly (44px min)
- [ ] 6.5 Test reference panel gestures on mobile

## 7. Performance Optimization

- [ ] 7.1 Measure canvas render time per frame
- [ ] 7.2 Add frame budget monitoring (target 16.67ms for 60 FPS)
- [ ] 7.3 Implement trail point reduction on frame drop
- [ ] 7.4 Test performance on mid-range Android devices
- [ ] 7.5 Verify load time under 3s on 3G (per project constraints)

## 8. Testing

- [ ] 8.1 Unit tests for useMediaQuery hook
- [ ] 8.2 Unit tests for useGestures hook
- [ ] 8.3 Component tests for Drawer component
- [ ] 8.4 Component tests for BottomSheet component
- [ ] 8.5 Visual regression tests at 320px, 480px, 768px, 1024px widths
- [ ] 8.6 E2E test: complete mission on mobile viewport
- [ ] 8.7 E2E test: parameter adjustment via touch on tablet
- [ ] 8.8 E2E test: canvas zoom/pan gestures
- [ ] 8.9 Manual testing on iOS Safari (iPhone)
- [ ] 8.10 Manual testing on Chrome Android (mid-range device)
- [ ] 8.11 Manual testing in landscape orientation

## 9. Accessibility

- [ ] 9.1 Verify keyboard navigation for drawer/sheet controls
- [ ] 9.2 Add ARIA labels to drawer/sheet close buttons
- [ ] 9.3 Ensure focus trap in open drawer/sheet
- [ ] 9.4 Test screen reader announcements for panel state changes
- [ ] 9.5 Verify color contrast at all breakpoints (4.5:1 minimum)
- [ ] 9.6 Test with zoom at 200% on mobile

## 10. Documentation

- [ ] 10.1 Update component API documentation (Drawer, BottomSheet)
- [ ] 10.2 Document breakpoint conventions in design system
- [ ] 10.3 Add responsive design guidelines to project.md
- [ ] 10.4 Document touch gesture patterns for future episodes
