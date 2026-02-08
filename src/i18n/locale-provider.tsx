import { useState, useMemo, useEffect, useCallback } from 'react'
import { LocaleContext, type LocaleContextValue } from './locale-context.ts'
import { detectLocale } from './locale-detection.ts'
import { createTranslationFunction } from './translation.ts'
import { en } from './catalogs/en.ts'
import { es } from './catalogs/es.ts'
import { type LocaleCode, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from './types.ts'
import type { StringCatalog } from './types.ts'

const catalogs: Record<LocaleCode, StringCatalog> = { en, es }

export function LocaleProvider({ children }: { readonly children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(detectLocale)

  const setLocale = useCallback((newLocale: LocaleCode) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    } catch {
      // localStorage may be unavailable
    }
    // Update URL param for shareability
    const url = new URL(window.location.href)
    if (newLocale === 'en') {
      url.searchParams.delete('locale')
    } else {
      url.searchParams.set('locale', newLocale)
    }
    window.history.replaceState({}, '', url.toString())
  }, [])

  // Set dir attribute on html element
  useEffect(() => {
    const meta = SUPPORTED_LOCALES.find((l) => l.code === locale)
    document.documentElement.setAttribute('dir', meta?.direction ?? 'ltr')
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const catalog = catalogs[locale] ?? en

  const t = useMemo(() => createTranslationFunction(catalog, en), [catalog])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
