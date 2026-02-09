import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoHide } from './useAutoHide'

describe('useAutoHide', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts visible', () => {
    const { result } = renderHook(() => useAutoHide(3000, true))
    expect(result.current.visible).toBe(true)
  })

  it('hides after timeout', () => {
    const { result } = renderHook(() => useAutoHide(3000, true))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.visible).toBe(false)
  })

  it('stays visible before timeout', () => {
    const { result } = renderHook(() => useAutoHide(3000, true))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.visible).toBe(true)
  })

  it('show() makes it visible again', () => {
    const { result } = renderHook(() => useAutoHide(3000, true))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.visible).toBe(false)
    act(() => {
      result.current.show()
    })
    expect(result.current.visible).toBe(true)
  })

  it('stays visible when disabled', () => {
    const { result } = renderHook(() => useAutoHide(3000, false))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.visible).toBe(true)
  })

  it('resets timer on interaction events', () => {
    const { result } = renderHook(() => useAutoHide(3000, true))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    // Simulate a click
    act(() => {
      window.dispatchEvent(new Event('click'))
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    // Should still be visible because timer was reset
    expect(result.current.visible).toBe(true)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    // Now the full 3000ms passed since last interaction
    expect(result.current.visible).toBe(false)
  })
})
