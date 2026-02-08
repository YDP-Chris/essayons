/**
 * Share UI component.
 *
 * Renders a "Share" button that generates a shareable URL from the
 * current simulation parameters and copies it to the clipboard.
 * Uses the native Web Share API when available, with clipboard copy
 * as the fallback. Shows a brief "Copied!" toast on success.
 */

import { useCallback, useRef, useState } from 'react'
import type { ParameterValues, ParameterSchema } from './types.ts'
import { encodeState } from './codec.ts'
import './ShareButton.css'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ShareButtonProps {
  /** The parameter schemas for the current episode. */
  readonly schemas: readonly ParameterSchema[]
  /** The current parameter values to share. */
  readonly params: ParameterValues
  /** Optional CSS class name. */
  readonly className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the shareable URL from the current state. */
function buildShareUrl(params: ParameterValues, schemas: readonly ParameterSchema[]): string {
  const query = encodeState(params, schemas)
  const base =
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''
  if (query.length === 0) {
    return base
  }
  return `${base}?${query}`
}

/** Copy text to clipboard, returning true on success. */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to legacy approach
    }
  }

  // Legacy fallback using a temporary textarea
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch {
    return false
  }
}

/** Check if the native Web Share API is available. */
function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TOAST_DURATION_MS = 2000

export function ShareButton({
  schemas,
  params,
  className = '',
}: ShareButtonProps): React.JSX.Element {
  const [toastVisible, setToastVisible] = useState(false)
  const [toastText, setToastText] = useState('Copied!')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((text: string) => {
    setToastText(text)
    setToastVisible(true)

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setToastVisible(false)
      timerRef.current = null
    }, TOAST_DURATION_MS)
  }, [])

  const handleShare = useCallback(async () => {
    const url = buildShareUrl(params, schemas)

    // Try native share first
    if (canNativeShare()) {
      try {
        await navigator.share({ title: 'Essayons Simulation', url })
        return
      } catch {
        // User cancelled or API failed — fall through to clipboard
      }
    }

    // Clipboard copy fallback
    const success = await copyToClipboard(url)
    showToast(success ? 'Copied!' : 'Failed to copy')
  }, [params, schemas, showToast])

  const classes = ['btn', 'btn-domain', className].filter(Boolean).join(' ')

  return (
    <span className="share-button-wrapper">
      <button
        type="button"
        className={classes}
        onClick={() => void handleShare()}
        aria-label="Share simulation link"
      >
        Share
      </button>
      <span
        className="share-button-toast"
        data-visible={toastVisible}
        role="status"
        aria-live="polite"
      >
        {toastText}
      </span>
    </span>
  )
}
