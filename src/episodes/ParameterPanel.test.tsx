import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ParameterPanel } from './ParameterPanel'
import type { ParameterConfig } from './types'

// Mock analytics
vi.mock('@/analytics/plausible.ts', () => ({
  trackParameterChange: vi.fn(),
}))

// Mock i18n
vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'panels.parameters': 'Parameters',
      }
      return translations[key] ?? key
    },
  }),
}))

const makeParam = (overrides: Partial<ParameterConfig> & { id: string }): ParameterConfig => ({
  label: overrides.id,
  type: 'number',
  default: 50,
  min: 0,
  max: 100,
  step: 1,
  ...overrides,
})

describe('ParameterPanel', () => {
  const defaultProps = {
    episodeId: 'test-episode',
    onParameterChange: vi.fn(),
    values: {} as Record<string, unknown>,
  }

  it('renders nothing when parameters is empty', () => {
    const { container } = render(<ParameterPanel {...defaultProps} parameters={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders ungrouped parameters without collapsible wrapper', () => {
    const params = [
      makeParam({ id: 'mass', label: 'Mass' }),
      makeParam({ id: 'speed', label: 'Speed' }),
    ]
    render(<ParameterPanel {...defaultProps} parameters={params} />)
    expect(screen.getByText('Mass')).toBeInTheDocument()
    expect(screen.getByText('Speed')).toBeInTheDocument()
    // No details/summary elements
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('renders grouped parameters in collapsible details sections', () => {
    const params = [
      makeParam({ id: 'mass', label: 'Mass', group: 'Physics' }),
      makeParam({ id: 'radius', label: 'Radius', group: 'Physics' }),
      makeParam({ id: 'color', label: 'Color', group: 'Visuals' }),
    ]
    render(<ParameterPanel {...defaultProps} parameters={params} />)

    // Group headings appear as summary elements
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('Visuals')).toBeInTheDocument()

    // Parameters are still rendered
    expect(screen.getByText('Mass')).toBeInTheDocument()
    expect(screen.getByText('Radius')).toBeInTheDocument()
    expect(screen.getByText('Color')).toBeInTheDocument()
  })

  it('renders mixed grouped and ungrouped parameters', () => {
    const params = [
      makeParam({ id: 'mass', label: 'Mass' }),
      makeParam({ id: 'radius', label: 'Radius', group: 'Advanced' }),
      makeParam({ id: 'density', label: 'Density', group: 'Advanced' }),
    ]
    render(<ParameterPanel {...defaultProps} parameters={params} />)

    // Ungrouped parameter renders directly
    expect(screen.getByText('Mass')).toBeInTheDocument()

    // Group heading appears
    expect(screen.getByText('Advanced')).toBeInTheDocument()

    // Grouped parameters rendered
    expect(screen.getByText('Radius')).toBeInTheDocument()
    expect(screen.getByText('Density')).toBeInTheDocument()
  })

  it('groups parameters in the same group together', () => {
    const params = [
      makeParam({ id: 'a', label: 'Param A', group: 'Group1' }),
      makeParam({ id: 'b', label: 'Param B', group: 'Group2' }),
      makeParam({ id: 'c', label: 'Param C', group: 'Group1' }),
    ]
    render(<ParameterPanel {...defaultProps} parameters={params} />)

    // Both group headings appear
    expect(screen.getByText('Group1')).toBeInTheDocument()
    expect(screen.getByText('Group2')).toBeInTheDocument()

    // All params rendered
    expect(screen.getByText('Param A')).toBeInTheDocument()
    expect(screen.getByText('Param B')).toBeInTheDocument()
    expect(screen.getByText('Param C')).toBeInTheDocument()
  })

  it('renders the panel heading', () => {
    const params = [makeParam({ id: 'mass', label: 'Mass' })]
    render(<ParameterPanel {...defaultProps} parameters={params} />)
    expect(screen.getByText('Parameters')).toBeInTheDocument()
  })
})
