# i18n Specification

## ADDED Requirements

### Requirement: String Catalog Management

The system SHALL provide a type-safe string catalog structure for storing localized UI strings.

#### Scenario: English catalog lookup

- **WHEN** a component calls `t('nav.home')` with English locale active
- **THEN** the translation function returns `'Home'` from the English catalog

#### Scenario: Spanish catalog lookup

- **WHEN** a component calls `t('nav.home')` with Spanish locale active
- **THEN** the translation function returns `'Inicio'` from the Spanish catalog

#### Scenario: Missing key fallback to English

- **WHEN** a component calls `t('nav.newKey')` with Spanish locale active and the key exists only in English
- **THEN** the translation function returns the English value from the fallback catalog

#### Scenario: Missing key fallback to key itself

- **WHEN** a component calls `t('nonexistent.key')` and the key is missing from all catalogs
- **THEN** the translation function returns `'nonexistent.key'` as the fallback

#### Scenario: Nested key resolution

- **WHEN** a component calls `t('episodes.domains.physics')`
- **THEN** the translation function resolves the nested object path and returns `'Physics'` (English) or `'Física'` (Spanish)

### Requirement: Locale Detection

The system SHALL detect the user's preferred locale using a priority-based resolution strategy.

#### Scenario: URL parameter overrides all

- **WHEN** the page URL includes `?locale=es` and localStorage contains `en`
- **THEN** the detected locale is `es`

#### Scenario: localStorage preference when no URL param

- **WHEN** the page URL has no locale parameter and localStorage contains `es`
- **THEN** the detected locale is `es`

#### Scenario: Browser language when no URL or localStorage

- **WHEN** the page URL has no locale parameter and localStorage is empty and `navigator.language` is `es-MX`
- **THEN** the detected locale is `es` (extracted from language tag)

#### Scenario: Default to English when no detection succeeds

- **WHEN** the page URL has no locale parameter and localStorage is empty and `navigator.language` is `fr-FR`
- **THEN** the detected locale is `en` (default fallback)

#### Scenario: Unsupported locale in URL falls back

- **WHEN** the page URL includes `?locale=fr` and French is not supported
- **THEN** the system falls through to the next detection method (localStorage → browser → default)

### Requirement: Locale Persistence

The system SHALL persist the user's locale selection across sessions.

#### Scenario: Locale switcher updates localStorage

- **WHEN** the user selects Spanish from the locale switcher
- **THEN** localStorage is updated with key `essayons-locale` and value `es`

#### Scenario: Locale switcher updates URL parameter

- **WHEN** the user selects Spanish from the locale switcher
- **THEN** the browser URL updates to include `?locale=es` without page reload

#### Scenario: Persisted locale restored on next visit

- **WHEN** the user returns to the site and localStorage contains `es` and no URL parameter is present
- **THEN** the app initializes with Spanish locale active

### Requirement: Translation Hook

The system SHALL provide a React hook for accessing the translation function and locale state.

#### Scenario: useTranslation returns translation function

- **WHEN** a component calls `const { t } = useTranslation()`
- **THEN** the hook returns a stable translation function

#### Scenario: useTranslation returns current locale

- **WHEN** a component calls `const { locale } = useTranslation()`
- **THEN** the hook returns the current active locale code (e.g., `'en'` or `'es'`)

#### Scenario: useTranslation returns setLocale function

- **WHEN** a component calls `const { setLocale } = useTranslation()`
- **THEN** the hook returns a function that updates the locale when called

#### Scenario: useTranslation triggers re-render on locale change

- **WHEN** any component calls `setLocale('es')` via the hook
- **THEN** all components using `useTranslation` re-render with the new locale's translations

#### Scenario: useTranslation throws outside provider

- **WHEN** a component calls `useTranslation()` without being wrapped in `LocaleProvider`
- **THEN** the hook throws an error with message `'useTranslation must be used within LocaleProvider'`

### Requirement: Locale Switcher UI

The system SHALL provide a UI component for users to manually select their preferred locale.

#### Scenario: Locale switcher displays available locales

- **WHEN** the locale switcher is rendered
- **THEN** it displays a dropdown with options for all supported locales (e.g., "English", "Español")

#### Scenario: Locale switcher shows current selection

- **WHEN** the locale switcher is rendered with Spanish active
- **THEN** the dropdown shows "Español" as the selected value

#### Scenario: Locale switcher changes locale on selection

- **WHEN** the user selects "Español" from the dropdown
- **THEN** the `setLocale('es')` function is called and the app switches to Spanish

#### Scenario: Locale switcher is keyboard accessible

- **WHEN** the user focuses the locale switcher with Tab and presses Enter
- **THEN** the dropdown opens and can be navigated with arrow keys

### Requirement: Episode Content i18n

The system SHALL support locale-specific overrides for episode content defined in `EpisodeConfig`.

#### Scenario: Episode name translation

- **WHEN** an episode config includes `i18n.es.name: 'Laboratorio Orbital'` and Spanish locale is active
- **THEN** the episode card displays `'Laboratorio Orbital'` instead of the default English name

#### Scenario: Episode tagline translation

- **WHEN** an episode config includes `i18n.es.tagline: 'Explora la mecánica orbital'` and Spanish locale is active
- **THEN** the episode card displays the Spanish tagline

#### Scenario: Mission name translation

- **WHEN** an episode config includes a mission override with `i18n.es.missions[0].name: 'Logra una Órbita Estable'` and Spanish locale is active
- **THEN** the mission panel displays the Spanish mission name

#### Scenario: Mission objective translation

- **WHEN** an episode config includes an objective override with `i18n.es.missions[0].objectives[0].description: 'Alcanza una altitud de 200 km'` and Spanish locale is active
- **THEN** the mission checklist displays the Spanish objective description

#### Scenario: Reference panel translation

- **WHEN** an episode config includes a reference override with `i18n.es.reference[0].content: '# Leyes de Newton...'` and Spanish locale is active
- **THEN** the reference panel displays the Spanish markdown content

#### Scenario: No locale override falls back to default

- **WHEN** an episode config has no `i18n` field and Spanish locale is active
- **THEN** the episode card and mission panel display the default English content

#### Scenario: Partial locale override merges with default

- **WHEN** an episode config includes `i18n.es.name` but not `i18n.es.tagline` and Spanish locale is active
- **THEN** the episode card displays the Spanish name and the English tagline

### Requirement: RTL Layout Support

The system SHALL prepare the CSS codebase for right-to-left (RTL) locales using logical properties.

#### Scenario: Margin uses logical properties

- **WHEN** the design system defines a component margin
- **THEN** the CSS uses `margin-inline-start` and `margin-inline-end` instead of `margin-left` and `margin-right`

#### Scenario: Padding uses logical properties

- **WHEN** the design system defines a component padding
- **THEN** the CSS uses `padding-inline-start` and `padding-inline-end` instead of `padding-left` and `padding-right`

#### Scenario: Text alignment uses logical properties

- **WHEN** the design system defines text alignment
- **THEN** the CSS uses `text-align: start` or `text-align: end` instead of `text-align: left` or `text-align: right`

#### Scenario: HTML dir attribute reflects locale direction

- **WHEN** the locale is set to a future RTL locale (e.g., Arabic)
- **THEN** the `<html>` element's `dir` attribute is set to `'rtl'`

#### Scenario: HTML dir attribute is LTR for current locales

- **WHEN** the locale is set to English or Spanish
- **THEN** the `<html>` element's `dir` attribute is set to `'ltr'`

### Requirement: Locale Catalog Completeness Validation

The system SHALL validate that all locale catalogs define the same set of keys.

#### Scenario: Validation passes when all keys present

- **WHEN** the English catalog defines keys `['nav.home', 'nav.episodes']` and the Spanish catalog defines the same keys
- **THEN** the validation returns zero errors

#### Scenario: Validation fails when keys missing

- **WHEN** the English catalog defines key `'nav.home'` and the Spanish catalog does not define this key
- **THEN** the validation returns an error with message `'Missing translation for key "nav.home" in locale "es"'`

#### Scenario: Validation ignores extra keys in non-base locale

- **WHEN** the Spanish catalog defines an extra key `'nav.experimental'` not present in English
- **THEN** the validation returns a warning (not an error)

#### Scenario: CI fails on incomplete translations

- **WHEN** the locale catalog validation runs in CI and Spanish is missing keys
- **THEN** the CI build fails with validation error output

### Requirement: Episode Scaffold Locale File Generation

The system SHALL generate locale stub files when creating a new episode via the scaffold CLI.

#### Scenario: Scaffold creates English locale file

- **WHEN** the CLI command `npm run episode:create -- --id wave-lab` is executed
- **THEN** the scaffold creates `src/episodes/wave-lab/i18n/en.json` with episode content extracted from `config.ts`

#### Scenario: Scaffold creates Spanish stub file

- **WHEN** the CLI command `npm run episode:create -- --id wave-lab` is executed
- **THEN** the scaffold creates `src/episodes/wave-lab/i18n/es.json` with TODO placeholders for translation

#### Scenario: Scaffold creates additional locale stubs via flag

- **WHEN** the CLI command `npm run episode:create -- --id wave-lab --locale fr` is executed
- **THEN** the scaffold creates `src/episodes/wave-lab/i18n/fr.json` with TODO placeholders

#### Scenario: Scaffold JSON includes mission structure

- **WHEN** the episode config defines 2 missions with objectives
- **THEN** the generated `en.json` includes the full mission structure (ids, names, descriptions, objectives)

#### Scenario: Scaffold JSON includes reference structure

- **WHEN** the episode config defines 3 reference sections
- **THEN** the generated `en.json` includes all reference section ids, titles, and content

### Requirement: Locale Metadata

The system SHALL provide metadata for each supported locale including name, native name, and text direction.

#### Scenario: English locale metadata

- **WHEN** the app queries locale metadata for `'en'`
- **THEN** it returns `{ code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' }`

#### Scenario: Spanish locale metadata

- **WHEN** the app queries locale metadata for `'es'`
- **THEN** it returns `{ code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' }`

#### Scenario: Locale switcher uses native names

- **WHEN** the locale switcher renders dropdown options
- **THEN** each option displays the locale's `nativeName` (e.g., "English", "Español" not "English", "Spanish")

### Requirement: Component Migration to Translation Function

The system SHALL migrate all existing UI components with hardcoded English strings to use the translation function.

#### Scenario: Landing page hero uses translation

- **WHEN** the landing page hero component renders
- **THEN** the tagline text is retrieved via `t('hero.tagline')` instead of hardcoded string

#### Scenario: Navigation links use translation

- **WHEN** the navigation component renders
- **THEN** all link labels are retrieved via `t('nav.home')`, `t('nav.episodes')`, etc.

#### Scenario: Mission panel labels use translation

- **WHEN** the mission panel renders
- **THEN** UI labels like "Objectives", "Success", "Retry" are retrieved via `t()` calls

#### Scenario: Telemetry panel labels use translation

- **WHEN** the telemetry panel renders unit labels
- **THEN** generic labels like "Velocity", "Altitude" are retrieved via `t()` calls

#### Scenario: Button labels use translation

- **WHEN** a Button component renders with a text label
- **THEN** the label is passed through `t()` if it's a UI constant (not dynamic content)

### Requirement: Locale-Specific Content Merging in EpisodeFactory

The system SHALL merge locale-specific overrides into the episode definition at runtime based on the active locale.

#### Scenario: Factory merges Spanish mission names

- **WHEN** `EpisodeFactory.create(config)` is called with Spanish locale active and config includes `i18n.es.missions[0].name`
- **THEN** the returned `EpisodeDefinition` contains the Spanish mission name in the mission data structure

#### Scenario: Factory preserves English content when no override

- **WHEN** `EpisodeFactory.create(config)` is called with Spanish locale active and config has no `i18n.es` field
- **THEN** the returned `EpisodeDefinition` contains the default English content

#### Scenario: Factory merges partial overrides

- **WHEN** `EpisodeFactory.create(config)` is called with Spanish locale active and only `i18n.es.name` is defined
- **THEN** the returned `EpisodeDefinition` uses the Spanish name but preserves English tagline, missions, and reference content

#### Scenario: Factory handles multiple locales in config

- **WHEN** an episode config defines both `i18n.es` and `i18n.fr` and French locale is active
- **THEN** the factory merges the French overrides (ignoring Spanish)

### Requirement: Locale Change URL Synchronization

The system SHALL synchronize the URL parameter with locale changes to enable shareable links.

#### Scenario: setLocale updates URL without reload

- **WHEN** a user calls `setLocale('es')`
- **THEN** the browser URL updates to include `?locale=es` via `history.replaceState` (no page reload)

#### Scenario: Shareable link preserves locale

- **WHEN** a user shares a link with `?locale=es` and another user opens it
- **THEN** the app initializes with Spanish locale active

#### Scenario: URL parameter overrides persisted preference

- **WHEN** a user has `en` in localStorage but opens a link with `?locale=es`
- **THEN** the app loads with Spanish locale active (URL takes priority)

### Requirement: Translation Function Type Safety

The system SHALL provide TypeScript type checking for translation keys to catch missing translations at compile time.

#### Scenario: Valid key compiles

- **WHEN** a developer writes `t('nav.home')` and the key exists in the English catalog
- **THEN** TypeScript compilation succeeds

#### Scenario: Typo in key produces type error

- **WHEN** a developer writes `t('nav.hoem')` (typo) and the key does not exist
- **THEN** TypeScript produces a compile-time error (if strict key typing is enabled)

#### Scenario: Nested key path is type-checked

- **WHEN** a developer writes `t('episodes.domains.physics')` and the nested path exists
- **THEN** TypeScript compilation succeeds

#### Scenario: Invalid nested path produces type error

- **WHEN** a developer writes `t('episodes.domains.invalid')` and the path does not exist
- **THEN** TypeScript produces a compile-time error (if strict key typing is enabled)

### Requirement: No-Bundle-Split Locale Loading

The system SHALL include all locale catalogs in the initial JavaScript bundle (no lazy loading).

#### Scenario: All locales available immediately

- **WHEN** the app initializes
- **THEN** both English and Spanish catalogs are loaded and available without additional network requests

#### Scenario: Locale switch is instant

- **WHEN** a user switches from English to Spanish via the locale switcher
- **THEN** the UI updates immediately without waiting for a network request

#### Scenario: Offline locale switching works

- **WHEN** the app is loaded once and then the user goes offline and switches locales
- **THEN** the locale switch succeeds (catalogs are already in memory)
