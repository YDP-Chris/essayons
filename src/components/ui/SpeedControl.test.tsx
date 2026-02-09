import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SpeedControl } from './SpeedControl'

describe('SpeedControl', () => {
  const presets = [1, 2, 5, 10]

  it('renders all preset buttons', () => {
    render(<SpeedControl presets={presets} value={1} onChange={() => {}} />)
    expect(screen.getByText('1x')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.getByText('5x')).toBeInTheDocument()
    expect(screen.getByText('10x')).toBeInTheDocument()
  })

  it('marks active speed with aria-checked', () => {
    render(<SpeedControl presets={presets} value={5} onChange={() => {}} />)
    expect(screen.getByText('5x')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('1x')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange when a button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SpeedControl presets={presets} value={1} onChange={onChange} />)
    await user.click(screen.getByText('10x'))
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('has radiogroup role', () => {
    render(<SpeedControl presets={presets} value={1} onChange={() => {}} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('renders with custom aria-label', () => {
    render(
      <SpeedControl presets={presets} value={1} onChange={() => {}} ariaLabel="Speed selector" />,
    )
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Speed selector')
  })
})
