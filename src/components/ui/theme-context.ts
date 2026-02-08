import { createContext } from 'react'

export type Domain = 'physics' | 'civics' | 'economics' | 'history' | 'biology' | 'engineering'

export interface DomainTheme {
  domain: Domain
  accentColor: string
  label: string
}

export const DOMAIN_MAP: Record<Domain, DomainTheme> = {
  physics: { domain: 'physics', accentColor: '#00d4aa', label: 'Physics' },
  civics: { domain: 'civics', accentColor: '#e63946', label: 'Civics' },
  economics: {
    domain: 'economics',
    accentColor: '#2a9d8f',
    label: 'Economics',
  },
  history: { domain: 'history', accentColor: '#e9c46a', label: 'History' },
  biology: { domain: 'biology', accentColor: '#8ac926', label: 'Biology' },
  engineering: {
    domain: 'engineering',
    accentColor: '#ff6b35',
    label: 'Engineering',
  },
}

const DEFAULT_THEME: DomainTheme = DOMAIN_MAP.physics

export const ThemeContext = createContext<DomainTheme>(DEFAULT_THEME)
