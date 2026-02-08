export type LocaleCode = 'en' | 'es'

export interface LocaleMetadata {
  readonly code: LocaleCode
  readonly name: string
  readonly nativeName: string
  readonly direction: 'ltr' | 'rtl'
}

export interface StringCatalog {
  readonly [key: string]: string | StringCatalog
}

export type TranslationFunction = (key: string) => string

export const SUPPORTED_LOCALES: readonly LocaleMetadata[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
] as const

export const DEFAULT_LOCALE: LocaleCode = 'en'

export const LOCALE_STORAGE_KEY = 'essayons-locale'
