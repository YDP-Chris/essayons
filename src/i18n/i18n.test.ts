import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolveKey, createTranslationFunction } from './translation.ts'
import { detectLocale } from './locale-detection.ts'
import { validateCatalogCompleteness } from './validation.ts'
import { en } from './catalogs/en.ts'
import { es } from './catalogs/es.ts'
import type { StringCatalog, LocaleCode } from './types.ts'
import { LOCALE_STORAGE_KEY } from './types.ts'

// ---------------------------------------------------------------------------
// Translation function tests
// ---------------------------------------------------------------------------

describe('resolveKey', () => {
  it('resolves a top-level key', () => {
    const catalog: StringCatalog = { greeting: 'Hello' }
    expect(resolveKey(catalog, 'greeting')).toBe('Hello')
  })

  it('resolves a nested key', () => {
    const catalog: StringCatalog = { nav: { backToLabs: 'Back to Labs' } }
    expect(resolveKey(catalog, 'nav.backToLabs')).toBe('Back to Labs')
  })

  it('returns undefined for missing key', () => {
    const catalog: StringCatalog = { greeting: 'Hello' }
    expect(resolveKey(catalog, 'missing')).toBeUndefined()
  })

  it('returns undefined for invalid nested path', () => {
    const catalog: StringCatalog = { nav: { backToLabs: 'Back to Labs' } }
    expect(resolveKey(catalog, 'nav.missing.deep')).toBeUndefined()
  })

  it('returns undefined when value is an object, not a string', () => {
    const catalog: StringCatalog = { nav: { backToLabs: 'Back to Labs' } }
    expect(resolveKey(catalog, 'nav')).toBeUndefined()
  })
})

describe('createTranslationFunction', () => {
  it('returns English value from English catalog', () => {
    const t = createTranslationFunction(en, en)
    expect(t('hero.headline')).toBe('Learn by crashing into things.')
  })

  it('returns Spanish value from Spanish catalog', () => {
    const t = createTranslationFunction(es, en)
    expect(t('hero.headline')).toBe('Aprende estrellando cosas.')
  })

  it('falls back to English when key missing in Spanish', () => {
    const partialEs: StringCatalog = { hero: { headline: 'Hola' } }
    const t = createTranslationFunction(partialEs, en)
    expect(t('hero.cta')).toBe('Start Exploring')
  })

  it('returns the key itself when missing in all catalogs', () => {
    const t = createTranslationFunction(en, en)
    expect(t('completely.nonexistent.key')).toBe('completely.nonexistent.key')
  })

  it('resolves deeply nested keys', () => {
    const t = createTranslationFunction(en, en)
    expect(t('episodes.orbitLab.name')).toBe('Orbit Lab')
  })
})

// ---------------------------------------------------------------------------
// Locale detection tests
// ---------------------------------------------------------------------------

describe('detectLocale', () => {
  const originalLocation = window.location
  const originalNavigator = window.navigator

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  it('detects locale from URL parameter', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '?locale=es' },
      writable: true,
      configurable: true,
    })
    expect(detectLocale()).toBe('es')
  })

  it('detects locale from localStorage when no URL param', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '' },
      writable: true,
      configurable: true,
    })
    localStorage.setItem(LOCALE_STORAGE_KEY, 'es')
    expect(detectLocale()).toBe('es')
  })

  it('detects locale from browser language', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '' },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, language: 'es-MX' },
      writable: true,
      configurable: true,
    })
    expect(detectLocale()).toBe('es')
  })

  it('defaults to English when no detection succeeds', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '' },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, language: 'zh-CN' },
      writable: true,
      configurable: true,
    })
    expect(detectLocale()).toBe('en')
  })

  it('falls back when URL has unsupported locale', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '?locale=fr' },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, language: 'en-US' },
      writable: true,
      configurable: true,
    })
    expect(detectLocale()).toBe('en')
  })
})

// ---------------------------------------------------------------------------
// Validation tests
// ---------------------------------------------------------------------------

describe('validateCatalogCompleteness', () => {
  it('passes when all keys are present', () => {
    const catalogs: Record<LocaleCode, StringCatalog> = { en, es }
    const issues = validateCatalogCompleteness(catalogs)
    const errors = issues.filter((i) => i.level === 'error')
    expect(errors).toHaveLength(0)
  })

  it('reports errors when keys are missing', () => {
    const incomplete: StringCatalog = { hero: { headline: 'Hola' } }
    const catalogs: Record<LocaleCode, StringCatalog> = {
      en,
      es: incomplete,
    }
    const issues = validateCatalogCompleteness(catalogs)
    const errors = issues.filter((i) => i.level === 'error')
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]?.message).toContain('Missing translation')
  })

  it('warns about extra keys in non-base locale', () => {
    const extended: StringCatalog = {
      ...es,
      extraSection: { extraKey: 'Extra value' },
    }
    const catalogs: Record<LocaleCode, StringCatalog> = {
      en,
      es: extended,
    }
    const issues = validateCatalogCompleteness(catalogs)
    const warnings = issues.filter((i) => i.level === 'warning')
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings.some((w) => w.key === 'extraSection.extraKey')).toBe(true)
  })
})
