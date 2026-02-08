/**
 * Accessibility utility tests.
 *
 * Tests for:
 * - Focus trap utility
 * - AriaLiveRegion component
 * - useReducedMotion hook
 * - Skip link in App
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { activateFocusTrap } from './focus-trap.ts'
import { AriaLiveRegion } from './AriaLiveRegion.tsx'
import { useReducedMotion } from './use-reduced-motion.ts'

// ---------------------------------------------------------------------------
// Focus Trap
// ---------------------------------------------------------------------------

describe('activateFocusTrap', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('wraps focus from last to first element on Tab', () => {
    container.innerHTML = `
      <button id="btn1">First</button>
      <button id="btn2">Second</button>
      <button id="btn3">Third</button>
    `

    const trap = activateFocusTrap({ container })

    const btn3 = container.querySelector<HTMLButtonElement>('#btn3')!
    btn3.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    container.dispatchEvent(event)

    // Focus should wrap to the first button
    expect(document.activeElement?.id).toBe('btn1')

    trap.deactivate()
  })

  it('wraps focus from first to last element on Shift+Tab', () => {
    container.innerHTML = `
      <button id="btn1">First</button>
      <button id="btn2">Second</button>
      <button id="btn3">Third</button>
    `

    const trap = activateFocusTrap({ container })

    const btn1 = container.querySelector<HTMLButtonElement>('#btn1')!
    btn1.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    container.dispatchEvent(event)

    // Focus should wrap to the last button
    expect(document.activeElement?.id).toBe('btn3')

    trap.deactivate()
  })

  it('restores focus to returnFocusTo element on deactivate', () => {
    const trigger = document.createElement('button')
    trigger.id = 'trigger'
    document.body.appendChild(trigger)
    trigger.focus()

    container.innerHTML = `<button id="inside">Inside</button>`

    const trap = activateFocusTrap({
      container,
      returnFocusTo: trigger,
    })

    const inside = container.querySelector<HTMLButtonElement>('#inside')!
    inside.focus()

    trap.deactivate()

    expect(document.activeElement?.id).toBe('trigger')

    document.body.removeChild(trigger)
  })

  it('does not interfere with non-Tab keys', () => {
    container.innerHTML = `
      <button id="btn1">First</button>
      <button id="btn2">Second</button>
    `

    const trap = activateFocusTrap({ container })

    const btn1 = container.querySelector<HTMLButtonElement>('#btn1')!
    btn1.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    container.dispatchEvent(event)

    // Focus should stay on btn1
    expect(document.activeElement?.id).toBe('btn1')

    trap.deactivate()
  })
})

// ---------------------------------------------------------------------------
// AriaLiveRegion
// ---------------------------------------------------------------------------

describe('AriaLiveRegion', () => {
  it('renders with role="status" and aria-live', () => {
    render(<AriaLiveRegion message="Hello" />)

    const region = screen.getByRole('status')
    expect(region).toBeInTheDocument()
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveAttribute('aria-atomic', 'true')
  })

  it('announces the message immediately', () => {
    render(<AriaLiveRegion message="Test announcement" />)

    const region = screen.getByRole('status')
    expect(region).toHaveTextContent('Test announcement')
  })

  it('supports assertive politeness level', () => {
    render(<AriaLiveRegion message="Urgent" politeness="assertive" />)

    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'assertive')
  })

  it('updates message when prop changes', () => {
    const { rerender } = render(<AriaLiveRegion message="First" />)

    const region = screen.getByRole('status')
    expect(region).toHaveTextContent('First')

    rerender(<AriaLiveRegion message="Second" />)

    expect(region).toHaveTextContent('Second')
  })

  it('renders empty string when message is empty', () => {
    render(<AriaLiveRegion message="" />)

    const region = screen.getByRole('status')
    expect(region).toHaveTextContent('')
  })
})

// ---------------------------------------------------------------------------
// useReducedMotion
// ---------------------------------------------------------------------------

describe('useReducedMotion', () => {
  it('returns false when no preference is set', () => {
    // Default mock returns matches: false
    function TestComponent() {
      const prefersReduced = useReducedMotion()
      return <div data-testid="result">{String(prefersReduced)}</div>
    }

    render(<TestComponent />)
    expect(screen.getByTestId('result')).toHaveTextContent('false')
  })

  it('returns true when prefers-reduced-motion: reduce matches', () => {
    // Override matchMedia to return matches: true for reduced motion query
    const originalMatchMedia = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    function TestComponent() {
      const prefersReduced = useReducedMotion()
      return <div data-testid="result">{String(prefersReduced)}</div>
    }

    render(<TestComponent />)
    expect(screen.getByTestId('result')).toHaveTextContent('true')

    // Restore
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    })
  })
})

// ---------------------------------------------------------------------------
// Skip Link (App.tsx)
// ---------------------------------------------------------------------------

describe('Skip link', () => {
  it('exists in the App and points to #main-content', async () => {
    // Dynamically import App to test the skip link
    const { App } = await import('@/App.tsx')
    render(<App />)

    const skipLink = screen.getByText('Skip to content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
    expect(skipLink.tagName).toBe('A')
  })

  it('skip link is the first focusable element', async () => {
    const { App } = await import('@/App.tsx')
    const { container } = render(<App />)

    const user = userEvent.setup()
    await user.tab()

    const skipLink = container.querySelector('.skip-to-content')
    expect(document.activeElement).toBe(skipLink)
  })
})
