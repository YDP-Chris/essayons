## 1. Foundation

- [ ] 1.1 Add landing page route to `src/App.tsx` as the default `/` route
- [ ] 1.2 Create `src/pages/LandingPage.tsx` page component that composes all landing sections
- [ ] 1.3 Ensure brand CSS variables (ink, spark, paper, cream, domain colors) are available globally from design system

## 2. Navigation Bar

- [ ] 2.1 Create `NavBar` component with Essayons wordmark, "All Episodes" link, and "For Teachers" link
- [ ] 2.2 Implement mobile hamburger menu with accessible toggle (aria-expanded, focus trap)
- [ ] 2.3 Add skip-to-content link as first focusable element

## 3. Hero Section

- [ ] 3.1 Create `HeroSection` component with "Learn by crashing into things." headline (Instrument Serif)
- [ ] 3.2 Add subheadline about interactive simulations across domains (DM Sans)
- [ ] 3.3 Add "Start Exploring" CTA button linking to the episode grid (spark color, no account required)
- [ ] 3.4 Integrate domain orbit animation as hero visual (or static fallback for reduced-motion)

## 4. Episode Grid

- [ ] 4.1 Create `EpisodeCard` component displaying domain color, icon, episode name, and one-line hook
- [ ] 4.2 Create `EpisodeGrid` component rendering all six episode cards in a responsive grid
- [ ] 4.3 Wire each card to link to its episode route (or placeholder if episode not yet built)
- [ ] 4.4 Ensure domain accent colors meet 4.5:1 contrast ratio against card backgrounds

## 5. Value Proposition

- [ ] 5.1 Create `ValueProp` component with three pillars: Real Computation, Zero Friction, Any Domain
- [ ] 5.2 Add concise copy and a visual icon/illustration for each pillar
- [ ] 5.3 Use semantic HTML (section, headings) for screen reader structure

## 6. For Teachers Section

- [ ] 6.1 Create `TeacherSection` component with messaging about instant classroom deployment and free access
- [ ] 6.2 Include curriculum alignment mention
- [ ] 6.3 Add a CTA or anchor link for teacher-specific information

## 7. Footer

- [ ] 7.1 Create `Footer` component with navigation links: About, All Episodes, For Teachers
- [ ] 7.2 Add newsletter signup email input with accessible label
- [ ] 7.3 Add social media links (placeholder hrefs) with appropriate aria-labels
- [ ] 7.4 Include copyright and project attribution

## 8. SEO and Open Graph

- [ ] 8.1 Add `<title>`, `<meta name="description">`, and semantic heading hierarchy to `index.html` / page head
- [ ] 8.2 Add Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- [ ] 8.3 Add Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- [ ] 8.4 Create or source a 1200x630 social sharing image

## 9. Responsive Layout

- [ ] 9.1 Implement mobile-first CSS with breakpoints for tablet (768px) and desktop (1024px)
- [ ] 9.2 Episode grid: 1 column on mobile, 2 columns on tablet, 3 columns on desktop
- [ ] 9.3 Verify touch targets are at least 44x44px on mobile
- [ ] 9.4 Test layout across viewport widths (320px, 375px, 768px, 1024px, 1440px)

## 10. Performance

- [ ] 10.1 Ensure fonts are loaded with `font-display: swap` to prevent invisible text
- [ ] 10.2 Lazy-load any images below the fold (episode card illustrations, social icons)
- [ ] 10.3 Measure and verify <3s load on simulated 3G (Lighthouse or WebPageTest)
- [ ] 10.4 Ensure total page weight is under 500 KB (HTML + CSS + JS + fonts, before gzip)

## 11. Accessibility

- [ ] 11.1 Verify full keyboard navigation through all interactive elements (tab order, focus indicators)
- [ ] 11.2 Run axe or Lighthouse accessibility audit and fix all AA violations
- [ ] 11.3 Test with screen reader (VoiceOver or NVDA) for logical reading order
- [ ] 11.4 Respect `prefers-reduced-motion` for the domain orbit animation

## 12. Testing

- [ ] 12.1 Write component tests for each landing section (Hero, EpisodeGrid, ValueProp, TeacherSection, Footer, NavBar)
- [ ] 12.2 Write E2E test: load landing page, verify hero visible, click episode card, verify navigation
- [ ] 12.3 Write E2E test: verify responsive layout at mobile and desktop breakpoints
- [ ] 12.4 Add Lighthouse CI assertion for performance score >= 90 and accessibility score >= 90
