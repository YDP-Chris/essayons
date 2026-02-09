import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLandscape,
} from './useMediaQuery'

describe('useMediaQuery', () => {
  beforeEach(() => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('returns a boolean', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(typeof result.current).toBe('boolean')
  })

  it('returns false by default', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('useIsMobile returns a boolean', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe('boolean')
  })

  it('useIsTablet returns a boolean', () => {
    const { result } = renderHook(() => useIsTablet())
    expect(typeof result.current).toBe('boolean')
  })

  it('useIsDesktop returns a boolean', () => {
    const { result } = renderHook(() => useIsDesktop())
    expect(typeof result.current).toBe('boolean')
  })

  it('useIsLandscape returns a boolean', () => {
    const { result } = renderHook(() => useIsLandscape())
    expect(typeof result.current).toBe('boolean')
  })

  it('useIsLandscape returns false by default', () => {
    const { result } = renderHook(() => useIsLandscape())
    expect(result.current).toBe(false)
  })

  it('useIsLandscape uses correct media query', () => {
    renderHook(() => useIsLandscape())
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(orientation: landscape) and (max-height: 500px)',
    )
  })
})
