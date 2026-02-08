import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { Icon } from './Icon'
import { registerIcon } from './icon-registry'
import type { SVGProps } from 'react'

// Create a simple test icon
function TestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg data-testid="test-icon" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

describe('Icon', () => {
  beforeEach(() => {
    // Register test icon before each test
    registerIcon('test', TestIcon)
  })

  it('renders null for unknown icon names', () => {
    const { container } = render(<Icon name="unknown-icon" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders SVG for registered icon names', () => {
    const { container } = render(<Icon name="test" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('applies the correct size prop', () => {
    const { container } = render(<Icon name="test" size={48} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('48')
    expect(svg?.getAttribute('height')).toBe('48')
  })

  it('applies default size of 24 when size not provided', () => {
    const { container } = render(<Icon name="test" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('24')
    expect(svg?.getAttribute('height')).toBe('24')
  })

  it('applies the color prop', () => {
    const { container } = render(<Icon name="test" color="#ff0000" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('fill')).toBe('#ff0000')
  })

  it('applies currentColor as default fill when color not provided', () => {
    const { container } = render(<Icon name="test" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('fill')).toBe('currentColor')
  })

  it('applies the className prop', () => {
    const { container } = render(<Icon name="test" className="custom-class" />)
    const svg = container.querySelector('svg')
    expect(svg?.classList.contains('custom-class')).toBe(true)
  })

  it('sets aria-hidden="true" on the SVG', () => {
    const { container } = render(<Icon name="test" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})
