## 1. Core i18n Infrastructure

- [ ] 1.1 Create `src/i18n/types.ts` with `LocaleCode`, `LocaleMetadata`, `TranslationFunction`, `StringCatalog` types
- [ ] 1.2 Create `src/i18n/catalogs/en.ts` with English string catalog (extract all existing UI strings)
- [ ] 1.3 Create `src/i18n/catalogs/es.ts` with Spanish translations (initial set covering landing page and core UI)
- [ ] 1.4 Create `src/i18n/locale-detection.ts` with detection logic (browser → URL → localStorage → default)
- [ ] 1.5 Create `src/i18n/LocaleContext.tsx` with React context provider and locale state management
- [ ] 1.6 Create `src/i18n/useTranslation.ts` hook returning `{ t, locale, setLocale }`
- [ ] 1.7 Create `src/i18n/index.ts` barrel export

## 2. Locale Switcher UI

- [ ] 2.1 Create `src/components/ui/LocaleSwitcher.tsx` dropdown component
- [ ] 2.2 Style LocaleSwitcher to match design system (Button variant)
- [ ] 2.3 Add locale names and flags/icons to dropdown options
- [ ] 2.4 Integrate LocaleSwitcher into `src/components/Navigation.tsx`
- [ ] 2.5 Persist locale selection to localStorage on change

## 3. Episode Content i18n

- [ ] 3.1 Add `i18n?: Record<LocaleCode, EpisodeI18nOverride>` field to `EpisodeConfig` type
- [ ] 3.2 Define `EpisodeI18nOverride` interface (title, tagline, description, missions, reference)
- [ ] 3.3 Update `EpisodeFactory.create()` to merge locale-specific overrides based on active locale
- [ ] 3.4 Update mission UI generator to resolve mission text from locale overrides
- [ ] 3.5 Update reference panel generator to resolve content from locale overrides
- [ ] 3.6 Update episode card on landing page to resolve title/tagline/description from locale overrides

## 4. Scaffold Generator Integration

- [ ] 4.1 Update `scripts/create-episode.ts` to generate `i18n/en.json` stub alongside `config.ts`
- [ ] 4.2 Update scaffold to generate `i18n/es.json` stub with TODO placeholders
- [ ] 4.3 Add CLI flag `--locale` to generate additional locale stubs
- [ ] 4.4 Update scaffold README template to document i18n workflow

## 5. RTL Preparation

- [ ] 5.1 Audit `src/styles/typography.css` for directional properties
- [ ] 5.2 Replace `margin-left/right` with `margin-inline-start/end`
- [ ] 5.3 Replace `padding-left/right` with `padding-inline-start/end`
- [ ] 5.4 Replace `text-align: left/right` with `text-align: start/end`
- [ ] 5.5 Add `[dir="rtl"]` test utility for future RTL locale testing

## 6. Component Migration

- [ ] 6.1 Wrap root `App.tsx` in `LocaleProvider`
- [ ] 6.2 Migrate `src/pages/LandingPage.tsx` strings to `t()` calls
- [ ] 6.3 Migrate `src/components/Navigation.tsx` strings to `t()` calls
- [ ] 6.4 Migrate `src/components/MissionPanel.tsx` strings to `t()` calls
- [ ] 6.5 Migrate `src/components/ReferencePanel.tsx` strings to `t()` calls
- [ ] 6.6 Migrate `src/components/TelemetryPanel.tsx` strings to `t()` calls
- [ ] 6.7 Migrate all Button and UI component labels to `t()` calls

## 7. Testing

- [ ] 7.1 Write unit tests for `locale-detection.ts` (browser language, URL param, localStorage)
- [ ] 7.2 Write unit tests for `useTranslation` hook (context access, fallback to en)
- [ ] 7.3 Write component tests for LocaleSwitcher (dropdown interaction, locale change)
- [ ] 7.4 Write integration test: switch locale → verify UI strings update
- [ ] 7.5 Write integration test: episode content i18n override → verify mission text changes
- [ ] 7.6 Add E2E test: load page in Spanish → verify hero text in Spanish

## 8. Documentation

- [ ] 8.1 Add i18n section to `README.md` (how to add a locale, how to translate an episode)
- [ ] 8.2 Add contributing guide for translators (`CONTRIBUTING_I18N.md`)
- [ ] 8.3 Document locale code conventions (ISO 639-1 two-letter codes)
- [ ] 8.4 Document episode i18n override structure in episode factory docs

## 9. Initial Spanish Translation

- [ ] 9.1 Translate landing page hero section to Spanish
- [ ] 9.2 Translate navigation labels to Spanish
- [ ] 9.3 Translate episode card metadata (domain names) to Spanish
- [ ] 9.4 Translate mission/reference panel UI labels to Spanish
- [ ] 9.5 Review Spanish translations with native speaker (if available)

## 10. Validation and CI

- [ ] 10.1 Add validation rule: all locale catalogs must have same keys (no missing translations)
- [ ] 10.2 Add CI check: validate locale catalog completeness
- [ ] 10.3 Add CI check: validate episode i18n overrides reference valid locale codes
- [ ] 10.4 Add pre-commit hook: warn if new `t()` call added without corresponding Spanish translation
