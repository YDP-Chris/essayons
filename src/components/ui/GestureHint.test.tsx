import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GestureHint } from './GestureHint'

describe('GestureHint', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not render when disabled', () => {
    render(<GestureHint enabled={false} />)
    expect(screen.queryByText('Pinch to zoom')).not.toBeInTheDocument()
  })

  it('renders when enabled and not previously shown', () => {
    render(<GestureHint enabled={true} />)
    expect(screen.getByText('Pinch to zoom')).toBeInTheDocument()
    expect(screen.getByText('Drag to pan')).toBeInTheDocument()
  })

  it('does not render when previously dismissed', () => {
    localStorage.setItem('essayons:gesture-hint-shown', '1')
    render(<GestureHint enabled={true} />)
    expect(screen.queryByText('Pinch to zoom')).not.toBeInTheDocument()
  })

  it('has role="status" and aria-live', () => {
    render(<GestureHint enabled={true} />)
    const hint = screen.getByRole('status')
    expect(hint).toHaveAttribute('aria-live', 'polite')
  })

  it('auto-dismisses after 3 seconds', async () => {
    vi.useFakeTimers()
    render(<GestureHint enabled={true} />)
    expect(screen.getByText('Pinch to zoom')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    // After timeout, should be dismissed
    expect(screen.queryByText('Pinch to zoom')).not.toBeInTheDocument()
    // Should set localStorage
    expect(localStorage.getItem('essayons:gesture-hint-shown')).toBe('1')
    vi.useRealTimers()
  })
})
