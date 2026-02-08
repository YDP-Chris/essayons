# Change: Add Responsive Episodes

## Why

Episode views currently use a fixed 3-column desktop layout, making them difficult or impossible to use on mobile and tablet devices. This blocks access for mobile learners and fails to meet WCAG AA accessibility requirements. Mobile-first responsive design is essential for reaching broader audiences and enabling learning on any device.

## What Changes

- **EpisodeShell grid layout**: Add responsive breakpoints
  - Mobile (< 480px): Single column, vertical stack
  - Tablet (480-768px): 2-column with canvas + stacked sidebar
  - Desktop (> 768px): Existing 3-column layout (canvas + sidebar + reference)
- **Canvas rendering**: Full-width on mobile, touch gestures (pinch-zoom, drag-pan), DPR optimization for mobile performance
- **Parameter sidebar**: Collapsible drawer on mobile (slide-in from right), inline on desktop
- **Mission panel**: Collapsible accordion sections on mobile, full display on desktop
- **Reference panel**: Bottom sheet on mobile, fixed panel on desktop
- **Touch-friendly controls**: Minimum 44px touch targets, larger slider thumbs, increased tap spacing
- **Landscape phone mode**: Canvas takes full viewport, panels as overlay
- **Performance**: Adaptive canvas rendering (reduce trail points on low-power devices, adjust DPR based on device capabilities)

## Impact

- Affected specs: `responsive-episodes` (NEW)
- Affected code:
  - `src/episodes/EpisodeShell.tsx` - Add breakpoint state, drawer/sheet state management
  - `src/episodes/EpisodeShell.css` - Responsive grid, mobile-first CSS
  - `src/episodes/ParameterPanel.tsx` - Drawer wrapper for mobile
  - `src/episodes/ParameterPanel.css` - Touch-friendly controls
  - `src/episodes/MissionPanel.tsx` - Collapsible sections
  - `src/episodes/MissionPanel.css` - Accordion styling
  - `src/episodes/ReferencePanel.tsx` - Bottom sheet wrapper
  - `src/episodes/ReferencePanel.css` - Sheet transitions
  - `src/engine/SimulationEngine.ts` - Canvas resize handler, DPR detection, performance adaptation
  - `src/components/ui/` - Drawer, BottomSheet, touch gesture handlers (if not existing)
