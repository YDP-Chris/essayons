# Design: Responsive Episodes

## Context

The current EpisodeShell uses a fixed 3-column grid layout optimized for desktop screens (1024px+). This creates usability problems on mobile and tablet devices:

- Controls are too small for touch (slider thumbs < 20px)
- Canvas cannot be zoomed or panned
- Three-column layout collapses into unusable narrow columns on tablets
- No accommodation for landscape phone usage (common for simulations)

Responsive design is a core requirement for accessibility and reaching a broader audience. The project constraints mandate mid-range device support and WCAG AA compliance.

## Goals / Non-Goals

### Goals

- Support phone (320px-767px), tablet (768px-1023px), and desktop (1024px+) viewports
- Provide touch-friendly controls (44px minimum touch targets per Apple/Android HIG)
- Enable canvas interaction via touch gestures (pinch-zoom, drag-pan)
- Maintain performance on mid-range devices (>30 FPS per project constraints)
- Preserve all existing functionality across all breakpoints
- Meet WCAG AA accessibility requirements on all screen sizes

### Non-Goals

- Native mobile apps (browser-only per project constraints)
- Server-side rendering or adaptive loading (client-side only for MVP)
- Touch gestures beyond canvas interaction (e.g., swipe navigation between episodes)
- Separate mobile-optimized episode content (same content, responsive presentation)

## Decisions

### Breakpoint Strategy

**Decision**: Use three breakpoints with mobile-first CSS

- Mobile: `< 768px` (phone)
- Tablet: `768px - 1023px`
- Desktop: `>= 1024px`

**Rationale**: Aligns with common device classes. Mobile-first CSS ensures baseline performance and avoids desktop-only bugs.

**Alternatives considered**:

- More granular breakpoints (e.g., separate portrait/landscape phone) - Adds complexity without clear benefit
- Desktop-first CSS - Harder to optimize for mobile constraints

### Layout Transformation

**Decision**: Responsive grid transformation by breakpoint

**Mobile (< 768px)**:

```
┌─────────────────────┐
│ Header + Controls   │
├─────────────────────┤
│                     │
│   Canvas (full)     │
│                     │
├─────────────────────┤
│ ⚙️ Parameters (drawer)│ <- collapsed by default
├─────────────────────┤
│ 🎯 Mission (inline)  │
├─────────────────────┤
│ 📚 Reference (sheet) │ <- bottom sheet
└─────────────────────┘
```

**Tablet (768px - 1023px)**:

```
┌──────────────┬──────────┐
│ Header       │ Controls │
├──────────────┴──────────┤
│                         │
│   Canvas (full-width)   │
│                         │
├─────────────────────────┤
│  ⚙️ Parameters (inline) │
├─────────────────────────┤
│  🎯 Mission (inline)    │
├─────────────────────────┤
│  📚 Reference (inline)  │
└─────────────────────────┘
```

**Desktop (>= 1024px)**: Existing 3-column layout (no change)

**Landscape Phone**: Special case - canvas goes fullscreen, panels overlay as modal

**Rationale**: Progressive enhancement from single-column mobile to multi-column desktop. Prioritizes canvas visibility (primary interaction surface) and keeps controls accessible without overwhelming small screens.

### Touch Gesture Support

**Decision**: Add pinch-zoom and drag-pan to canvas via touch event handlers

**Implementation**:

- `useGestures` hook wraps touch event logic
- Pinch-to-zoom: Track two-finger distance, scale canvas zoom level
- Drag-to-pan: Single-finger drag adjusts canvas viewport offset
- Double-tap: Reset zoom to 100%

**Rationale**: Standard mobile UX patterns. Users expect these interactions on mobile canvas apps.

**Alternatives considered**:

- Zoom/pan buttons - Less intuitive, takes up screen space
- No zoom support - Makes detailed inspection impossible on small screens

### Mobile Panel Patterns

**Decision**: Use native-feeling mobile patterns per panel type

- **ParameterPanel**: Slide-in drawer from right (common for settings/tools)
- **ReferencePanel**: Bottom sheet (common for supplementary content)
- **MissionPanel**: Inline collapsible (always visible, critical context)

**Rationale**: Each panel has different usage frequency and importance. Mission context needs to be always visible (even if collapsed), while parameters and references are accessed less frequently and can be hidden to maximize canvas space.

**Alternatives considered**:

- All panels as drawers - Loses mission context visibility
- All panels inline - Too crowded on mobile screens
- Tab-based single panel - Requires too many taps to switch context

### Performance Adaptation

**Decision**: Detect device capabilities and adapt rendering quality

**Implementation**:

- Measure actual frame rate during simulation
- If FPS drops below 30 for >2 seconds, reduce trail point count by 50%
- Detect device pixel ratio (DPR) and limit canvas scaling to 2x on high-DPI devices
- Add `will-change: transform` to animated panels for GPU acceleration

**Rationale**: Mid-range devices can struggle with full-fidelity rendering. Adaptive quality maintains usability without requiring manual settings.

**Alternatives considered**:

- Static low-quality mode for mobile - Penalizes high-end devices unnecessarily
- User-controlled quality settings - Adds complexity, most users won't understand
- No adaptation - Risks unusable performance on target devices

### Component Architecture

**Decision**: Create reusable Drawer and BottomSheet components in design system

**Drawer API**:

```tsx
<Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} side="right" maxWidth="80vw">
  {children}
</Drawer>
```

**BottomSheet API**:

```tsx
<BottomSheet
  open={sheetOpen}
  onClose={() => setSheetOpen(false)}
  snapPoints={[0.3, 0.6, 0.9]}
  defaultSnap={0.3}
>
  {children}
</BottomSheet>
```

**Rationale**: Encapsulates complex gesture/animation logic. Reusable across future mobile UI needs.

**Alternatives considered**:

- Inline implementation in EpisodeShell - Duplicates code for each panel type
- Third-party component library - Adds dependency, increases bundle size

## Risks / Trade-offs

### Risk: Touch Gesture Conflicts

**Problem**: Pinch-zoom may conflict with browser zoom, drag-pan may conflict with scrolling

**Mitigation**:

- Use `touch-action: none` on canvas to prevent browser gestures
- Add `preventDefault()` to touch handlers
- Provide visual feedback during gestures (zoom level indicator)
- Include "Reset view" button as escape hatch

### Risk: Performance on Low-End Devices

**Problem**: Even with adaptation, some devices may struggle

**Mitigation**:

- Set adaptive rendering thresholds conservatively (30 FPS cutoff)
- Add manual "reduce motion" toggle in parameter panel
- Test on lowest-tier target device (e.g., 2019 Android phone)
- Monitor analytics for high bounce rates on mobile

### Risk: Landscape Orientation Edge Cases

**Problem**: Landscape phones have minimal vertical space for UI chrome

**Mitigation**:

- Auto-hide header in landscape if < 500px height
- Show floating action button (FAB) to toggle panels
- Test on real devices (iPhone SE, Pixel 4a) in landscape

### Trade-off: Mobile vs Desktop Development Complexity

**Trade-off**: Adding responsive behavior doubles CSS complexity and adds state management overhead

**Acceptance**: This is necessary complexity. Mobile support is not optional for a learning platform in 2026. The component architecture (Drawer, BottomSheet) amortizes cost across future features.

### Trade-off: Gesture Learning Curve

**Trade-off**: Touch gestures are discoverable only through trial or instruction

**Acceptance**: Pinch-zoom and drag-pan are industry-standard mobile patterns. We'll add a brief tooltip on first mobile visit ("Pinch to zoom, drag to pan") that dismisses after 3 seconds.

## Migration Plan

### Phase 1: Infrastructure (Non-breaking)

1. Add breakpoint constants to design system
2. Create Drawer and BottomSheet components
3. Add useMediaQuery and useGestures hooks
4. Update project.md with responsive guidelines

### Phase 2: EpisodeShell Layout (Breaking for in-progress episodes)

1. Update EpisodeShell.css with responsive grid
2. Add drawer/sheet wrappers conditionally by breakpoint
3. Update all panel components with mobile styles
4. Test existing episodes at all breakpoints

### Phase 3: Canvas Touch Support (Additive)

1. Add touch event handlers to SimulationEngine
2. Implement gesture recognition
3. Add zoom/pan state to engine
4. Update render loop to apply viewport transform

### Phase 4: Performance Optimization (Additive)

1. Add frame rate monitoring
2. Implement adaptive trail reduction
3. Test on target devices
4. Tune thresholds based on analytics

### Rollback Plan

If critical bugs emerge post-deployment:

1. Feature flag: `ENABLE_RESPONSIVE_LAYOUT` (default true)
2. If disabled, revert to desktop-only layout with mobile warning message
3. Fix bugs in separate hotfix branch
4. Re-enable after validation

## Open Questions

1. **Should we support stylus input (e.g., Apple Pencil)?**
   - Initial answer: No, out of scope for MVP. Gestures work with stylus as-is.
   - Revisit if analytics show high iPad usage.

2. **Should canvas zoom persist across parameter changes?**
   - Initial answer: No, reset zoom on parameter change to avoid confusion.
   - User testing may reveal otherwise.

3. **Should we add haptic feedback on touch interactions?**
   - Initial answer: No, adds complexity and may not be universally supported.
   - Consider for future enhancement if mobile usage is high.

4. **How should we handle very large reference content on mobile?**
   - Initial answer: Bottom sheet scrolls internally, user can expand to 90% viewport.
   - May need virtual scrolling if reference content exceeds 50 items.
