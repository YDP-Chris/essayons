import { createContext } from 'react'
import type { ProgressStorageService } from './progress-storage.ts'

export const ProgressContext = createContext<ProgressStorageService | null>(null)
