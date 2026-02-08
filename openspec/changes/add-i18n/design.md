## Context

Essayons is a browser-based interactive learning platform currently available only in English. To reach Spanish-speaking learners and establish a foundation for future locales, we need an internationalization (i18n) system. The platform's constraints (zero backend, client-side only, TypeScript strict mode) rule out heavy i18n frameworks like i18next or FormatJS. Additionally, episode content (missions, reference panels) is declaratively defined in `EpisodeConfig` objects, so the i18n system must support both UI strings and episode-specific content.

**Stakeholders**: Solo developer, future translators (community or AI-assisted), AI agents generating localized episode content.

**Constraints**: Zero budget, browser-only, no external i18n dependencies, TypeScript strict mode, must work with episode factory pattern.

## Goals / Non-Goals

**Goals:**

- Provide a lightweight, custom i18n system with per-locale string catalogs
- Support UI string translation via a simple `t('key.path')` API
- Support episode content translation (titles, missions, reference panels) via `EpisodeConfig` locale overrides
- Detect user locale from browser → URL → localStorage → default (en)
- Provide a locale switcher UI component for manual language selection
- Lay groundwork for RTL locales (use CSS logical properties)
- Support initial locales: English (en), Spanish (es)
- Integrate locale file generation into episode scaffold CLI

**Non-Goals:**

- Full i18n framework features (pluralization rules, ICU message format, number/date formatting beyond browser defaults)
- Automated translation via AI or translation services (translators provide content manually)
- Server-side locale detection or content negotiation (no backend)
- Dynamic locale loading (all locales bundled in initial JS payload for simplicity)
- Locale-specific routing (`/es/orbit-lab`) — URL param (`?locale=es`) is sufficient
- Support for more than 2-3 locales in MVP (en, es, and optionally one more)

## Decisions

### Decision 1: Custom lightweight i18n system, not a framework

We implement a minimal i18n system from scratch rather than adopting a library like i18next or react-intl.

**String catalog structure:**

```typescript
// src/i18n/types.ts
export type LocaleCode = 'en' | 'es'

export interface LocaleMetadata {
  code: LocaleCode
  name: string // "English", "Español"
  nativeName: string // "English", "Español"
  direction: 'ltr' | 'rtl' // for future RTL support
}

export type StringCatalog = Record<string, string | StringCatalog>

export type TranslationFunction = (key: string, fallback?: string) => string
```

**Catalog example:**

```typescript
// src/i18n/catalogs/en.ts
export const en: StringCatalog = {
  nav: {
    home: 'Home',
    episodes: 'Episodes',
    about: 'About',
  },
  hero: {
    tagline: 'Learn by doing. Try, fail, discover.',
    cta: 'Start exploring',
  },
  episodes: {
    domains: {
      physics: 'Physics',
      economics: 'Economics',
      civics: 'Civics',
      history: 'History',
    },
  },
}

// src/i18n/catalogs/es.ts
export const es: StringCatalog = {
  nav: {
    home: 'Inicio',
    episodes: 'Episodios',
    about: 'Acerca de',
  },
  hero: {
    tagline: 'Aprende haciendo. Intenta, falla, descubre.',
    cta: 'Comienza a explorar',
  },
  episodes: {
    domains: {
      physics: 'Física',
      economics: 'Economía',
      civics: 'Cívica',
      history: 'Historia',
    },
  },
}
```

**Translation function:**

```typescript
// src/i18n/LocaleContext.tsx
function createTranslationFunction(
  catalog: StringCatalog,
  fallbackCatalog: StringCatalog,
): TranslationFunction {
  return (key: string, fallback?: string): string => {
    const keys = key.split('.')
    let value: any = catalog

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Try fallback catalog (always en)
        value = fallbackCatalog
        for (const fk of keys) {
          if (value && typeof value === 'object' && fk in value) {
            value = value[fk]
          } else {
            return fallback || key
          }
        }
        break
      }
    }

    return typeof value === 'string' ? value : fallback || key
  }
}
```

**Why**: A custom implementation is <200 lines of code and avoids 50-200KB dependencies. We don't need advanced features (pluralization, formatters) for MVP. The string catalog is just a nested TypeScript object, giving full IDE autocomplete and type safety.

**Alternatives considered:**

- **i18next** (~100KB minified): Over-featured for our use case; async loading, namespaces, and plugins add complexity we don't need.
- **react-intl (FormatJS)** (~80KB minified): Heavy API surface; requires ICU message format which is overkill for simple string substitution.
- **LinguiJS**: Smallest (50KB), but still adds build-time complexity and an unfamiliar DSL.

### Decision 2: Locale detection priority: browser → URL → localStorage → default

Locale resolution follows this order:

1. **URL parameter**: `?locale=es` overrides everything (allows shareable links in specific languages)
2. **localStorage**: If user previously selected a locale via LocaleSwitcher, persist that preference
3. **Browser language**: Read `navigator.language` or `navigator.languages[0]`
4. **Default**: Fall back to `en`

```typescript
// src/i18n/locale-detection.ts
export function detectLocale(): LocaleCode {
  const supportedLocales: LocaleCode[] = ['en', 'es']

  // 1. Check URL param
  const urlParams = new URLSearchParams(window.location.search)
  const urlLocale = urlParams.get('locale')
  if (urlLocale && supportedLocales.includes(urlLocale as LocaleCode)) {
    return urlLocale as LocaleCode
  }

  // 2. Check localStorage
  const storedLocale = localStorage.getItem('essayons-locale')
  if (storedLocale && supportedLocales.includes(storedLocale as LocaleCode)) {
    return storedLocale as LocaleCode
  }

  // 3. Check browser language
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0])
  if (browserLang) {
    const langCode = browserLang.split('-')[0] as LocaleCode
    if (supportedLocales.includes(langCode)) {
      return langCode
    }
  }

  // 4. Default
  return 'en'
}
```

**Why**: URL param is highest priority so shareable links maintain language. localStorage provides persistence. Browser language is a sensible default. Fallback to English ensures the app always works.

**Alternatives considered:**

- Locale prefix in path (`/es/orbit-lab`): Requires router changes and server-side support for clean URLs; URL param is simpler for client-only app.
- Subdomain (`es.essayons.com`): Over-engineered for 2-3 locales; adds DNS and hosting complexity.

### Decision 3: Episode content i18n via locale-specific overrides in EpisodeConfig

Episode-specific content (title, tagline, missions, reference panels) is translated via an `i18n` field in `EpisodeConfig`:

```typescript
// src/factory/types/EpisodeConfig.ts
export interface EpisodeI18nOverride {
  name?: string // episode name
  tagline?: string // episode tagline
  description?: string // episode description
  missions?: Array<{
    id: string // mission ID to override
    name?: string
    description?: string
    briefing?: string
    objectives?: Array<{
      id: string // objective ID to override
      description?: string
    }>
  }>
  reference?: Array<{
    id: string // reference section ID to override
    title?: string
    content?: string // markdown content
  }>
}

export interface EpisodeConfig {
  // ... existing fields
  i18n?: Record<LocaleCode, EpisodeI18nOverride>
}
```

**Usage example:**

```typescript
// src/episodes/orbit-lab/config.ts
export const config: EpisodeConfig = {
  id: 'orbit-lab',
  name: 'Orbit Lab',
  tagline: 'Explore orbital mechanics',
  missions: [
    {
      id: 'achieve-orbit',
      name: 'Achieve Stable Orbit',
      description: 'Launch a satellite into a circular orbit',
      // ...
    },
  ],
  i18n: {
    es: {
      name: 'Laboratorio Orbital',
      tagline: 'Explora la mecánica orbital',
      missions: [
        {
          id: 'achieve-orbit',
          name: 'Logra una Órbita Estable',
          description: 'Lanza un satélite a una órbita circular',
        },
      ],
    },
  },
}
```

At runtime, `EpisodeFactory.create()` merges the active locale's override into the base config before returning the `EpisodeDefinition`.

**Why**: Locale overrides are co-located with episode definitions (single source of truth). AI agents generating episodes can output both English content and Spanish overrides in one pass. The override structure mirrors the base config structure, making it easy to understand what can be translated.

**Alternatives considered:**

- Separate locale files per episode (`orbit-lab.es.json`): Harder to keep in sync; requires filesystem scanning at build time.
- Store translations in a central catalog: Breaks episode encapsulation; all episodes share one giant translation file.
- Server-side content API: No backend in MVP.

### Decision 4: useTranslation hook with React Context

A React context provides the translation function and locale state to all components:

```typescript
// src/i18n/LocaleContext.tsx
interface LocaleContextValue {
  locale: LocaleCode
  setLocale: (locale: LocaleCode) => void
  t: TranslationFunction
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(detectLocale)

  const setLocale = (newLocale: LocaleCode) => {
    setLocaleState(newLocale)
    localStorage.setItem('essayons-locale', newLocale)
    // Update URL param for shareability
    const url = new URL(window.location.href)
    url.searchParams.set('locale', newLocale)
    window.history.replaceState({}, '', url)
  }

  const catalog = locale === 'en' ? en : es
  const t = useMemo(
    () => createTranslationFunction(catalog, en),
    [catalog]
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useTranslation must be used within LocaleProvider')
  }
  return context
}
```

**Usage in components:**

```typescript
function Navigation() {
  const { t } = useTranslation()
  return (
    <nav>
      <a href="/">{t('nav.home')}</a>
      <a href="/episodes">{t('nav.episodes')}</a>
    </nav>
  )
}
```

**Why**: React Context is the standard pattern for global state. The `t()` function is memoized and stable across renders. All components get translations reactively when locale changes.

**Alternatives considered:**

- Global singleton: Doesn't trigger re-renders when locale changes.
- Prop drilling: Unsustainable for deeply nested components.

### Decision 5: LocaleSwitcher as a dropdown in the navigation bar

The locale switcher is a small dropdown component embedded in the navigation bar:

```typescript
// src/components/ui/LocaleSwitcher.tsx
export function LocaleSwitcher() {
  const { locale, setLocale } = useTranslation()

  const locales: LocaleMetadata[] = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  ]

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as LocaleCode)}
      aria-label="Select language"
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeName}
        </option>
      ))}
    </select>
  )
}
```

The dropdown is styled as a Button variant from the design system for visual consistency.

**Why**: A dropdown in the nav bar is discoverable without being intrusive. Native `<select>` provides accessibility out of the box (keyboard nav, screen reader support). Locale changes are instant (no page reload).

**Alternatives considered:**

- Modal or settings panel: Adds clicks; less discoverable.
- Flag icons only: Not accessible (flags don't always map to languages; "Spanish" is spoken in 20+ countries).

### Decision 6: RTL preparation via CSS logical properties

To support future RTL locales (Arabic, Hebrew), we migrate directional CSS properties to logical equivalents:

| Old (physical)      | New (logical)          |
| ------------------- | ---------------------- |
| `margin-left`       | `margin-inline-start`  |
| `margin-right`      | `margin-inline-end`    |
| `padding-left`      | `padding-inline-start` |
| `padding-right`     | `padding-inline-end`   |
| `text-align: left`  | `text-align: start`    |
| `text-align: right` | `text-align: end`      |
| `border-left`       | `border-inline-start`  |
| `border-right`      | `border-inline-end`    |

The `<html>` element gets a `dir` attribute based on locale direction:

```typescript
// In LocaleProvider effect
useEffect(() => {
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('dir', direction)
}, [locale])
```

**Why**: CSS logical properties automatically flip layout for RTL without manual style overrides. Browser support is excellent (95%+ as of 2024). This is future-proofing; we don't add an RTL locale in this change, but the CSS is ready.

**Alternatives considered:**

- Wait until we add an RTL locale: Retrofitting is harder; better to do it now while the codebase is small.
- Use `[dir="rtl"]` selectors for overrides: More verbose; logical properties are cleaner.

### Decision 7: Episode scaffold generates locale stubs

The `create-episode.ts` script generates i18n stub files alongside the episode config:

```
src/episodes/wave-lab/
  config.ts
  computation.ts
  renderer.ts
  i18n/
    en.json       # Full content in English (extracted from config.ts)
    es.json       # Stub with TODO placeholders
```

The `i18n/en.json` file is auto-populated from `config.ts`:

```json
{
  "name": "Wave Lab",
  "tagline": "Explore wave propagation",
  "missions": [
    {
      "id": "standing-wave",
      "name": "Create a Standing Wave",
      "description": "Adjust frequency to create a standing wave pattern"
    }
  ]
}
```

The `i18n/es.json` file is a skeleton for translators:

```json
{
  "name": "TODO: Translate 'Wave Lab'",
  "tagline": "TODO: Translate 'Explore wave propagation'",
  "missions": [
    {
      "id": "standing-wave",
      "name": "TODO: Translate 'Create a Standing Wave'",
      "description": "TODO: Translate 'Adjust frequency to create a standing wave pattern'"
    }
  ]
}
```

The scaffold CLI supports a `--locale` flag to generate additional stubs:

```bash
npm run episode:create -- --id wave-lab --locale es --locale fr
```

**Why**: Auto-generating locale stubs ensures translators always have a complete template. AI agents can fill in translations directly. The JSON format is simpler for non-technical translators than editing TypeScript.

**Alternatives considered:**

- No scaffolding; translators edit `config.ts` directly: Requires TypeScript knowledge; error-prone.
- Centralized translation file: Doesn't scale; breaks episode encapsulation.

### Decision 8: Locale catalog completeness validation

A validation rule checks that all locale catalogs define the same keys (no missing translations):

```typescript
// src/i18n/validation.ts
export function validateCatalogCompleteness(
  catalogs: Record<LocaleCode, StringCatalog>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const baseKeys = getAllKeys(catalogs['en']) // English is the reference

  for (const [locale, catalog] of Object.entries(catalogs)) {
    if (locale === 'en') continue
    const localeKeys = getAllKeys(catalog)
    const missing = baseKeys.filter((key) => !localeKeys.includes(key))

    for (const key of missing) {
      issues.push({
        level: 'error',
        rule: 'catalog-completeness',
        field: `i18n.${locale}.${key}`,
        message: `Missing translation for key "${key}" in locale "${locale}"`,
      })
    }
  }

  return issues
}
```

This runs in CI and fails the build if translations are incomplete.

**Why**: Prevents deploying with missing translations. Forces translators (or AI agents) to provide complete coverage before merge.

**Alternatives considered:**

- Allow missing translations (fall back to English at runtime): Silent failures; users see mixed languages.
- Manual review: Error-prone; easy to miss keys.

## Risks / Trade-offs

- **Bundle size increase**: Each locale adds ~5-10KB to the bundle. **Mitigation**: Start with only 2 locales (en, es). If we add many locales, consider code-splitting (lazy-load locale catalogs).
- **Translation quality**: Spanish translations may be machine-generated or low-quality. **Mitigation**: Mark MVP Spanish translations as "beta" and solicit community feedback; iterate based on native speaker input.
- **Translation maintenance burden**: Every new UI string or episode requires translation. **Mitigation**: Validation catches incomplete translations in CI. For MVP, only translate landing page and core UI; episodes can remain English-only initially.
- **Locale-specific content drift**: Episode content in Spanish may fall out of sync with English. **Mitigation**: Episode i18n overrides are co-located with the base config, making it easier to spot inconsistencies during updates.
- **No pluralization support**: The simple `t(key)` API doesn't handle "1 item" vs "2 items". **Mitigation**: For MVP, avoid strings requiring pluralization; if needed later, add a `t(key, { count })` API with basic English/Spanish rules.

## Migration Plan

This is a greenfield addition. Existing components are migrated incrementally.

1. **Phase 1**: Implement core i18n infrastructure (`LocaleContext`, `useTranslation`, locale detection). Verify with a minimal test component.
2. **Phase 2**: Extract all existing UI strings to `en.ts` catalog. Migrate landing page and navigation to `t()` calls.
3. **Phase 3**: Translate landing page and navigation to Spanish. Add LocaleSwitcher to navigation bar.
4. **Phase 4**: Add `i18n` field to `EpisodeConfig` type. Update `EpisodeFactory` to merge locale overrides. Verify with one test episode.
5. **Phase 5**: Update episode scaffold generator to create locale stub files. Document translation workflow.
6. **Phase 6**: Migrate all remaining components (mission panel, reference panel, telemetry) to `t()` calls.
7. **Phase 7**: Add locale catalog completeness validation to CI.

**Rollback**: Delete `src/i18n/`, remove `i18n` field from `EpisodeConfig`, revert components to hardcoded English strings. No data loss; locales are additive.

## Open Questions

- **Should we support locale-specific number/date formatting?** Browser `Intl` APIs (e.g., `Intl.NumberFormat`) provide this, but it's unclear if we need it for MVP. Most telemetry values are simple numbers with units.
- **Should AI agents generate Spanish translations automatically?** AI-generated translations could accelerate localization, but quality may vary. Deferred -- start with human translations for MVP, then evaluate AI assistance for subsequent locales.
- **Should we provide a translation UI for non-technical contributors?** A web form for editing translations could lower the barrier for community contributors. Deferred -- manual JSON editing is sufficient for MVP.
- **Should we support regional variants (e.g., es-MX vs es-ES)?** Spanish varies between regions. For MVP, use neutral Spanish; add regional variants later if needed.
