import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('renders children when open', () => {
    render(
      <Drawer open={true} onClose={() => {}} title="Test Drawer">
        <div>Drawer content</div>
      </Drawer>,
    )
    expect(screen.getByText('Drawer content')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    render(
      <Drawer open={false} onClose={() => {}} title="Test Drawer">
        <div>Drawer content</div>
      </Drawer>,
    )
    expect(screen.queryByText('Drawer content')).not.toBeInTheDocument()
  })

  it('displays the title', () => {
    render(
      <Drawer open={true} onClose={() => {}} title="Test Title">
        <div>Content</div>
      </Drawer>,
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Drawer>,
    )
    const closeButton = screen.getByLabelText('Close drawer')
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('backdrop click calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Drawer>,
    )
    const backdrop = screen.getByRole('dialog').previousSibling as HTMLElement
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has proper ARIA attributes', () => {
    render(
      <Drawer open={true} onClose={() => {}} title="Test">
        <div>Content</div>
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Test')
  })
})
