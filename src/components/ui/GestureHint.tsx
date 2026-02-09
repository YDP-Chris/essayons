/**
 * GestureHint — translucent overlay on first mobile visit showing
 * "Pinch to zoom" and "Drag to pan" hints. Auto-dismisses after 3s
 * or on first touch. Persists shown state in localStorage.
 */

import { useEffect, useState, useCallback } from 'react'
import './GestureHint.css'

const STORAGE_KEY = 'essayons:gesture-hint-shown'

function shouldShow(enabled: boolean): boolean {
  if (!enabled) return false
  try {
    return !localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
}

export interface GestureHintProps {
  /** Whether to enable the hint (e.g., only on mobile). */
  readonly enabled: boolean
}

export function GestureHint({ enabled }: GestureHintProps) {
  const [visible, setVisible] = useState(() => shouldShow(enabled))

  const dismiss = useCallback(() => {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // localStorage not available
    }
  }, [])

  // Auto-dismiss after 3s
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(dismiss, 3000)
    return () => clearTimeout(timer)
  }, [visible, dismiss])

  // Dismiss on first touch
  useEffect(() => {
    if (!visible) return
    const handler = () => dismiss()
    window.addEventListener('touchstart', handler, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', handler)
  }, [visible, dismiss])

  if (!visible) return null

  return (
    <div className="gesture-hint" role="status" aria-live="polite" onTouchStart={dismiss}>
      <div className="gesture-hint__content">
        <div className="gesture-hint__item">
          <span className="gesture-hint__icon" aria-hidden="true">
            {/* Pinch icon: two fingers */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="12" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 17L16 10L20 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="gesture-hint__text">Pinch to zoom</span>
        </div>
        <div className="gesture-hint__item">
          <span className="gesture-hint__icon" aria-hidden="true">
            {/* Drag icon: hand with arrows */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 8V24M16 8L12 12M16 8L20 12M16 24L12 20M16 24L20 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 16H24M8 16L12 12M8 16L12 20M24 16L20 12M24 16L20 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="gesture-hint__text">Drag to pan</span>
        </div>
      </div>
    </div>
  )
}
