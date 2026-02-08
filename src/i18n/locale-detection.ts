import { type LocaleCode, DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_STORAGE_KEY } from './types.ts'

const supportedCodes = SUPPORTED_LOCALES.map((l) => l.code)

function isSupportedLocale(code: string): code is LocaleCode {
  return supportedCodes.includes(code as LocaleCode)
}

export function detectLocale(): LocaleCode {
  // 1. URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  const urlLocale = urlParams.get('locale')
  if (urlLocale && isSupportedLocale(urlLocale)) {
    return urlLocale
  }

  // 2. localStorage
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && isSupportedLocale(stored)) {
      return stored
    }
  } catch {
    // localStorage may be unavailable
  }

  // 3. Browser language
  const browserLang = navigator.language ?? navigator.languages?.[0]
  if (browserLang) {
    const langCode = browserLang.split('-')[0]
    if (langCode && isSupportedLocale(langCode)) {
      return langCode
    }
  }

  // 4. Default
  return DEFAULT_LOCALE
}
