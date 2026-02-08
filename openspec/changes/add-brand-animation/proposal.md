# Change: Add Brand Animation and Icon System

## Why

The landing page hero section needs visual depth and brand identity. The domain orbit animation from the Brand Visual System v2 provides an engaging visual that communicates the multi-domain nature of Essayons at a glance. Additionally, the platform currently uses emoji icons throughout, which render inconsistently across platforms and browsers. Replacing emojis with SVG icons creates a professional, accessible, and consistent visual language while supporting colorblind users through distinct shapes.

## What Changes

- Add animated domain orbit visualization to the hero section of the landing page (center "E" logo with 3 spinning concentric rings and 6 domain nodes)
- Create a reusable DomainOrbit React component with pure CSS animations (no JavaScript runtime cost)
- Establish a platform-wide icon system replacing emoji icons with inline SVG components
- Create an Icon component with props for name, size, and color
- Build SVG icon set for 6 domains (physics, civics, economics, history, biology, engineering) with unique, colorblind-safe shapes
- Build UI icon set (play, pause, reset, share, settings, close, chevron, check, x, hint-bulb)
- Add `prefers-reduced-motion` support to pause orbit animation for accessibility
- Implement responsive behavior: full orbit on desktop, simplified or scaled-down version on mobile (<768px)

## Impact

- Affected specs: `brand-animation` (new capability), `landing-page` (modified to reference orbit animation integration)
- Affected code: `src/components/DomainOrbit.tsx` (new), `src/components/DomainOrbit.css` (new), `src/components/icons/` (new directory), `src/components/icons/Icon.tsx` (new), `src/components/icons/domains/` (new), `src/components/icons/ui/` (new), `src/pages/LandingPage.tsx` (modified for orbit integration), `src/components/landing/HeroSection.tsx` (modified), all components using emoji icons (EpisodeGrid, ReferencePanel, etc.) will be updated to use the Icon component
