import { useContext } from 'react'
import { ThemeContext } from '@/components/ui/theme-context.ts'
import type { DomainTheme } from '@/components/ui/theme-context.ts'

export function useDomainTheme(): DomainTheme {
  return useContext(ThemeContext)
}
