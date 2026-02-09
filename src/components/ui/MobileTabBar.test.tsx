import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MobileTabBar } from './MobileTabBar'

describe('MobileTabBar', () => {
  it('renders three tabs', () => {
    render(<MobileTabBar activeTab={null} onTabSelect={() => {}} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('renders tab labels', () => {
    render(<MobileTabBar activeTab={null} onTabSelect={() => {}} />)
    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('Mission')).toBeInTheDocument()
    expect(screen.getByText('Reference')).toBeInTheDocument()
  })

  it('marks active tab with aria-selected', () => {
    render(<MobileTabBar activeTab="mission" onTabSelect={() => {}} />)
    const missionTab = screen.getByText('Mission').closest('[role="tab"]')
    expect(missionTab).toHaveAttribute('aria-selected', 'true')

    const paramsTab = screen.getByText('Parameters').closest('[role="tab"]')
    expect(paramsTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabSelect when a tab is clicked', async () => {
    const user = userEvent.setup()
    const onTabSelect = vi.fn()
    render(<MobileTabBar activeTab={null} onTabSelect={onTabSelect} />)
    await user.click(screen.getByText('Reference'))
    expect(onTabSelect).toHaveBeenCalledWith('reference')
  })

  it('has tablist role on container', () => {
    render(<MobileTabBar activeTab={null} onTabSelect={() => {}} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('has aria-label on container', () => {
    render(<MobileTabBar activeTab={null} onTabSelect={() => {}} />)
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Episode panels')
  })
})
