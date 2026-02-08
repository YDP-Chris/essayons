import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('renders children when open', () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="Test Sheet">
        <div>Sheet content</div>
      </BottomSheet>,
    )
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    render(
      <BottomSheet open={false} onClose={() => {}} title="Test Sheet">
        <div>Sheet content</div>
      </BottomSheet>,
    )
    expect(screen.queryByText('Sheet content')).not.toBeInTheDocument()
  })

  it('displays the title', () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="Test Title">
        <div>Content</div>
      </BottomSheet>,
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={onClose} title="Test">
        <div>Content</div>
      </BottomSheet>,
    )
    const closeButton = screen.getByLabelText('Close bottom sheet')
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('backdrop click calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={onClose} title="Test">
        <div>Content</div>
      </BottomSheet>,
    )
    const backdrop = screen.getByRole('dialog').previousSibling as HTMLElement
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has proper ARIA attributes', () => {
    render(
      <BottomSheet open={true} onClose={() => {}} title="Test">
        <div>Content</div>
      </BottomSheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Test')
  })
})
