import { useState } from 'react'
import type { ReactNode } from 'react'
import { ProgressContext } from './progress-context.ts'
import { ProgressStorageService } from './progress-storage.ts'

export interface ProgressProviderProps {
  readonly children: ReactNode
  readonly service?: ProgressStorageService
}

export function ProgressProvider({ children, service }: ProgressProviderProps): ReactNode {
  const [instance] = useState(() => service ?? new ProgressStorageService())
  return <ProgressContext value={instance}>{children}</ProgressContext>
}
