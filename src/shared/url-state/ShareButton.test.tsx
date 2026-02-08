import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShareButton } from './ShareButton.tsx'
import type { ParameterSchema, ParameterValues } from './types.ts'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const schemas: readonly ParameterSchema[] = [
  {
    type: 'number',
    key: 'angle',
    label: 'Angle',
    default: 45,
    min: 0,
    max: 360,
    alias: 'a',
  },
  {
    type: 'number',
    key: 'velocity',
    label: 'Velocity',
    default: 7800,
    min: 0,
    max: 20000,
    alias: 'v',
  },
]

const nonDefaultParams: ParameterValues = {
  angle: 90,
  velocity: 5000,
}

const defaultParams: ParameterValues = {
  angle: 45,
  velocity: 7800,
}

// ---------------------------------------------------------------------------
// ShareButton tests
// ---------------------------------------------------------------------------

describe('ShareButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Ensure navigator.share is not available so clipboard path is used
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  it('renders a button with "Share" text', () => {
    render(<ShareButton schemas={schemas} params={defaultParams} />)
    const btn = screen.getByRole('button', { name: /share/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Share')
  })

  it('has an accessible aria-label', () => {
    render(<ShareButton schemas={schemas} params={defaultParams} />)
    const btn = screen.getByRole('button', { name: 'Share simulation link' })
    expect(btn).toBeInTheDocument()
  })

  it('copies to clipboard on click and shows toast', async () => {
    // In jsdom, navigator.clipboard.writeText may not work as expected.
    // The component falls back to document.execCommand('copy') which jsdom supports.
    // We verify the user-visible behavior: the "Copied!" toast appears.
    const user = userEvent.setup()
    render(<ShareButton schemas={schemas} params={nonDefaultParams} />)

    await user.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() => {
      const toast = screen.getByRole('status')
      expect(toast).toHaveTextContent('Copied!')
      expect(toast).toHaveAttribute('data-visible', 'true')
    })
  })

  it('shows "Copied!" toast after successful copy', async () => {
    const user = userEvent.setup()
    render(<ShareButton schemas={schemas} params={nonDefaultParams} />)

    await user.click(screen.getByRole('button', { name: /share/i }))

    await waitFor(() => {
      const toast = screen.getByRole('status')
      expect(toast).toHaveTextContent('Copied!')
      expect(toast).toHaveAttribute('data-visible', 'true')
    })
  })

  it('applies custom className', () => {
    render(<ShareButton schemas={schemas} params={defaultParams} className="custom-class" />)
    const btn = screen.getByRole('button', { name: /share/i })
    expect(btn.className).toContain('custom-class')
  })

  it('applies btn-domain class for accent color styling', () => {
    render(<ShareButton schemas={schemas} params={defaultParams} />)
    const btn = screen.getByRole('button', { name: /share/i })
    expect(btn.className).toContain('btn-domain')
  })

  it('is keyboard accessible (button is focusable)', () => {
    render(<ShareButton schemas={schemas} params={defaultParams} />)
    const btn = screen.getByRole('button', { name: /share/i })
    btn.focus()
    expect(document.activeElement).toBe(btn)
  })
})
