import { useEffect, useRef, type ReactNode } from 'react'
import { activateFocusTrap } from '@/shared/accessibility/focus-trap.ts'
import './Drawer.css'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Capture the element that triggered the drawer opening
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null
    }
  }, [open])

  // Focus close button when drawer opens
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  // Focus trap: constrain Tab within drawer
  useEffect(() => {
    if (!open || !drawerRef.current) return

    const trap = activateFocusTrap({
      container: drawerRef.current,
      returnFocusTo: triggerRef.current,
    })

    return () => {
      trap.deactivate()
    }
  }, [open])

  // Escape key handler
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="drawer-container">
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div ref={drawerRef} className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-header">
          <h2 className="drawer-title">{title}</h2>
          <button
            ref={closeButtonRef}
            className="drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="drawer-content">{children}</div>
      </div>
    </div>
  )
}
