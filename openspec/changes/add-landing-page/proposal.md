# Change: Add Landing Page

## Why

Essayons currently has no public-facing entry point. A landing page is required to communicate the platform's multi-domain, interactive learning value proposition and give visitors zero-friction access to episodes — no account, no onboarding, just exploration.

## What Changes

- Add a new `landing-page` capability with hero section, episode grid, value proposition pillars, teacher section, navigation bar, and footer
- Implement responsive layout (mobile-first) with brand design system tokens (Instrument Serif, DM Sans, IBM Plex Mono; ink/spark/paper/cream palette)
- Include Open Graph and SEO meta tags for social sharing and discoverability
- Display all six launch episodes (Orbit Lab, Citizen Lab, Market Lab, History Lab, Gene Lab, Bridge Lab) as visual cards with domain accent colors
- Meet performance target of <3 second load on 3G connections
- Achieve WCAG AA accessibility compliance

## Impact

- Affected specs: `landing-page` (new capability)
- Affected code: `src/pages/LandingPage.tsx` (new), `src/components/landing/` (new directory for Hero, EpisodeGrid, ValueProp, TeacherSection, Footer, NavBar components), `src/App.tsx` (route addition), `index.html` (meta tags)
