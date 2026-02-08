import { createContext } from 'react'
import type { LocaleCode, TranslationFunction } from './types.ts'

export interface LocaleContextValue {
  readonly locale: LocaleCode
  readonly setLocale: (locale: LocaleCode) => void
  readonly t: TranslationFunction
}

export const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)
