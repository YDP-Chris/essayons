import { useEffect, useRef, type ReactNode } from 'react'
import { activateFocusTrap } from '@/shared/accessibility/focus-trap.ts'
import './BottomSheet.css'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Capture the element that triggered the sheet opening
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null
    }
  }, [open])

  // Focus close button when sheet opens
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  // Focus trap: constrain Tab within sheet
  useEffect(() => {
    if (!open || !sheetRef.current) return

    const trap = activateFocusTrap({
      container: sheetRef.current,
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
    <div className="bottom-sheet-container">
      {/* Backdrop */}
      <div className="bottom-sheet-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="bottom-sheet-handle" aria-hidden="true" />
        <div className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">{title}</h2>
          <button
            ref={closeButtonRef}
            className="bottom-sheet-close"
            onClick={onClose}
            aria-label="Close bottom sheet"
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
        <div className="bottom-sheet-content">{children}</div>
      </div>
    </div>
  )
}
