/**
 * React hook for URL-based state sharing.
 *
 * Reads simulation parameters from the current URL on mount, validates
 * them against the episode's parameter schema, and provides a function
 * to generate shareable URLs from the current state.
 */

import { useMemo } from 'react'
import type { ParameterSchema, ParameterValues, UseUrlStateResult } from './types.ts'
import { decodeState, encodeState } from './codec.ts'
import { validateParams } from './validator.ts'

/**
 * Read URL parameters on mount and provide a share function.
 *
 * @param schemas - The parameter schemas for the current episode.
 * @returns An object with decoded params, whether they came from a URL, and a share function.
 */
export function useUrlState(schemas: readonly ParameterSchema[]): UseUrlStateResult {
  const { params, isFromUrl } = useMemo(() => {
    const url = typeof window !== 'undefined' ? window.location.search : ''
    const hasParams = url.length > 1 // more than just "?"

    const decoded = decodeState(url, schemas)
    const { params: validated } = validateParams(decoded, schemas)

    return {
      params: validated,
      isFromUrl: hasParams,
    }
  }, [schemas])

  const shareCurrentState = useMemo(() => {
    return (currentParams: ParameterValues): string => {
      const query = encodeState(currentParams, schemas)
      const base =
        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''
      if (query.length === 0) {
        return base
      }
      return `${base}?${query}`
    }
  }, [schemas])

  return { params, isFromUrl, shareCurrentState }
}
