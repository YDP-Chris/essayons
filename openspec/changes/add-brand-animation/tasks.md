## 1. Domain Orbit Component

- [ ] 1.1 Create `src/components/DomainOrbit.tsx` component with center logo, 3 orbit rings, and 6 domain nodes
- [ ] 1.2 Create `src/components/DomainOrbit.css` with pure CSS animations for orbit spinning (ring-1: 30s clockwise, ring-2: 45s counter-clockwise, ring-3: 60s clockwise)
- [ ] 1.3 Add domain accent colors from brand system (#00d4aa physics, #e63946 civics, #2a9d8f economics, #e9c46a history, #8ac926 biology, #ff6b35 engineering)
- [ ] 1.4 Implement center logo as 120px dark circle (#1A1A2E) with italic "E" in cream, box-shadow glow
- [ ] 1.5 Position domain nodes on rings: physics and civics on ring-1, economics and history on ring-2, biology and engineering on ring-3
- [ ] 1.6 Add hover scale effect on domain nodes (1.15x)

## 2. Icon Component System

- [ ] 2.1 Create `src/components/icons/Icon.tsx` base component with props: `name` (string), `size` (number, default 24), `color` (string, optional), `className` (string, optional)
- [ ] 2.2 Create icon directory structure: `src/components/icons/domains/` and `src/components/icons/ui/`
- [ ] 2.3 Export all icons from `src/components/icons/index.ts` for tree-shaking

## 3. Domain SVG Icons

- [ ] 3.1 Create `PhysicsIcon.tsx` (satellite/orbit shape, colorblind-safe via unique outline)
- [ ] 3.2 Create `CivicsIcon.tsx` (columns/building shape, distinct from other icons)
- [ ] 3.3 Create `EconomicsIcon.tsx` (upward trend line with data points, distinguishable)
- [ ] 3.4 Create `HistoryIcon.tsx` (scroll/document shape, unique silhouette)
- [ ] 3.5 Create `BiologyIcon.tsx` (double helix/DNA structure, recognizable shape)
- [ ] 3.6 Create `EngineeringIcon.tsx` (gear/cog shape, distinct mechanical form)
- [ ] 3.7 Ensure all domain icons are colorblind-safe: shape distinguishes domains, not just color

## 4. UI SVG Icons

- [ ] 4.1 Create `PlayIcon.tsx` (triangle pointing right)
- [ ] 4.2 Create `PauseIcon.tsx` (two vertical bars)
- [ ] 4.3 Create `ResetIcon.tsx` (circular arrow)
- [ ] 4.4 Create `ShareIcon.tsx` (share nodes/network)
- [ ] 4.5 Create `SettingsIcon.tsx` (gear)
- [ ] 4.6 Create `CloseIcon.tsx` (X shape)
- [ ] 4.7 Create `ChevronIcon.tsx` (directional arrow, support up/down/left/right via props or rotation)
- [ ] 4.8 Create `CheckIcon.tsx` (checkmark)
- [ ] 4.9 Create `XIcon.tsx` (cross for errors/removal)
- [ ] 4.10 Create `HintBulbIcon.tsx` (lightbulb for hints)

## 5. Landing Page Integration

- [ ] 5.1 Import DomainOrbit component in `HeroSection.tsx`
- [ ] 5.2 Replace placeholder hero visual with DomainOrbit component
- [ ] 5.3 Replace emoji domain icons in DomainOrbit with Icon component (fallback until SVG icons ready)
- [ ] 5.4 Verify orbit animation plays on page load (unless prefers-reduced-motion is active)

## 6. Replace Emoji Icons Platform-Wide

- [ ] 6.1 Update `EpisodeCard` component to use Icon component instead of emoji for domain icons
- [ ] 6.2 Update `EpisodeGrid` component to pass domain icon names to cards
- [ ] 6.3 Update `ReferencePanel` component (if exists) to use Icon for info/hint icons
- [ ] 6.4 Update any simulation UI controls to use Icon for play/pause/reset buttons
- [ ] 6.5 Search codebase for emoji Unicode characters and replace with Icon components where appropriate

## 7. Accessibility and Reduced Motion

- [ ] 7.1 Add `prefers-reduced-motion: reduce` media query to `DomainOrbit.css`
- [ ] 7.2 When reduced-motion is active, pause all orbit ring animations (animation-play-state: paused)
- [ ] 7.3 Add `aria-hidden="true"` to all Icon components (decorative icons don't need screen reader announcement)
- [ ] 7.4 Ensure Icon components use `currentColor` for SVG fill/stroke to inherit text color for accessibility

## 8. Responsive Design

- [ ] 8.1 Add CSS media query for mobile viewports (<768px)
- [ ] 8.2 Scale down orbit dimensions on mobile: center logo 80px, rings proportionally smaller
- [ ] 8.3 Alternatively, replace orbit with simplified stacked domain icons on small screens if scaling is insufficient
- [ ] 8.4 Test orbit visibility and performance on mobile devices (ensure smooth animations on mid-range hardware)

## 9. Testing

- [ ] 9.1 Write unit test for Icon component rendering with various props (name, size, color)
- [ ] 9.2 Write snapshot test for each domain icon (ensures SVG structure doesn't regress)
- [ ] 9.3 Write component test for DomainOrbit rendering center logo, 3 rings, 6 nodes
- [ ] 9.4 Write E2E test: load landing page, verify orbit animation is visible and spinning (unless prefers-reduced-motion)
- [ ] 9.5 Write E2E test: enable prefers-reduced-motion, verify orbit animation is paused
- [ ] 9.6 Verify colorblind accessibility: test domain icons with color filters (protanopia, deuteranopia, tritanopia) to ensure shapes remain distinguishable

## 10. Documentation

- [ ] 10.1 Add JSDoc comments to Icon component explaining usage and props
- [ ] 10.2 Add JSDoc comments to DomainOrbit component
- [ ] 10.3 Document icon naming convention in code comments (e.g., `<Icon name="physics" />`)
