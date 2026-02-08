import type { ReactNode } from 'react'
import { ThemeContext, DOMAIN_MAP } from './theme-context.ts'
import type { Domain } from './theme-context.ts'

export interface ThemeProviderProps {
  domain: Domain
  children: ReactNode
}

export function ThemeProvider({ domain, children }: ThemeProviderProps) {
  const theme = DOMAIN_MAP[domain]

  return (
    <ThemeContext.Provider value={theme}>
      <div
        className={`domain-${domain}`}
        style={
          {
            '--domain-accent': theme.accentColor,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
