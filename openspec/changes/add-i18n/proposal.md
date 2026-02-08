# Change: Add internationalization (i18n) support to the platform

## Why

Essayons aims to make interactive learning accessible globally. Currently, all UI strings, episode content, and reference materials are hardcoded in English. To reach Spanish-speaking learners (and lay the foundation for future locales), we need a lightweight, maintainable i18n system that works with zero backend complexity and integrates seamlessly with the episode factory pattern.

## What Changes

- Add lightweight custom i18n system with per-locale string catalogs (`src/i18n/en.ts`, `src/i18n/es.ts`)
- Add `useTranslation` React hook for component-level string lookup: `const { t } = useTranslation()` → `t('hero.tagline')`
- Add locale-specific overrides to `EpisodeConfig` for episode title, description, mission text, and reference content
- Add locale detection and resolution: browser language → URL param (`?locale=es`) → localStorage preference → default (en)
- Add locale switcher UI component (dropdown in navigation bar)
- Add RTL preparation: migrate inline styles to CSS logical properties (`margin-left` → `margin-inline-start`)
- Add locale file generation to episode scaffold: CLI generates stub locale files alongside `config.ts`
- Add initial locales: English (en) as default, Spanish (es) as first additional locale

## Impact

- Affected specs: `i18n` (new capability)
- Affected code:
  - `src/i18n/types.ts` — locale type, translation function type, locale metadata
  - `src/i18n/catalogs/en.ts` — English string catalog
  - `src/i18n/catalogs/es.ts` — Spanish string catalog (initial translation)
  - `src/i18n/LocaleContext.tsx` — React context for current locale and translation function
  - `src/i18n/useTranslation.ts` — hook for accessing `t()` function
  - `src/i18n/locale-detection.ts` — browser/URL/localStorage detection logic
  - `src/components/ui/LocaleSwitcher.tsx` — dropdown UI component for locale selection
  - `src/factory/types/EpisodeConfig.ts` — add `i18n?: Record<LocaleCode, EpisodeI18nOverride>` field
  - `src/factory/EpisodeFactory.ts` — merge locale-specific overrides into runtime config
  - `scripts/create-episode.ts` — scaffold stub locale files for new episodes
  - `src/styles/typography.css` — update to use CSS logical properties for RTL support
  - `src/components/Navigation.tsx` — embed LocaleSwitcher in nav bar
  - All existing components with user-facing strings — migrate to `t()` calls
