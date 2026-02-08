/**
 * Focus trap utility for modals, drawers, and other overlay components.
 *
 * When activated, constrains Tab/Shift+Tab cycling to focusable elements
 * within a container. Returns a cleanup function to deactivate the trap
 * and optionally restore focus to the element that triggered the overlay.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface FocusTrapOptions {
  /** The container element to trap focus within. */
  container: HTMLElement
  /** Element to restore focus to when the trap is deactivated. */
  returnFocusTo?: HTMLElement | null
}

export interface FocusTrapHandle {
  /** Deactivate the focus trap and optionally restore focus. */
  deactivate: () => void
}

/**
 * Activate a focus trap within the given container.
 *
 * Focus is constrained to focusable elements inside the container.
 * When deactivated, focus is returned to `returnFocusTo` if provided.
 */
export function activateFocusTrap(options: FocusTrapOptions): FocusTrapHandle {
  const { container, returnFocusTo } = options

  function isVisible(el: HTMLElement): boolean {
    // Check if the element or any ancestor is hidden via CSS
    // offsetParent is null for hidden elements in real browsers,
    // but in jsdom it's always null, so also check getComputedStyle.
    if (el.offsetParent !== null) return true
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  }

  function getFocusableElements(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible)
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return

    const focusable = getFocusableElements()
    if (focusable.length === 0) return

    const firstElement = focusable[0]!
    const lastElement = focusable[focusable.length - 1]!

    if (event.shiftKey) {
      // Shift+Tab: if focus is on the first element, wrap to last
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: if focus is on the last element, wrap to first
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  function deactivate(): void {
    container.removeEventListener('keydown', handleKeyDown)
    if (returnFocusTo && typeof returnFocusTo.focus === 'function') {
      returnFocusTo.focus()
    }
  }

  return { deactivate }
}
