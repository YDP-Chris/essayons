import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useAutoHide — returns a `visible` boolean that resets to true on
 * touch/click and hides after a configurable timeout (default 3s).
 */
export function useAutoHide(
  timeout = 3000,
  enabled = true,
): {
  visible: boolean
  show: () => void
} {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), timeout)
  }, [timeout])

  const show = useCallback(() => {
    setVisible(true)
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const handleInteraction = () => {
      setVisible(true)
      resetTimer()
    }

    // Start the initial timer
    resetTimer()

    window.addEventListener('touchstart', handleInteraction, { passive: true })
    window.addEventListener('click', handleInteraction)
    window.addEventListener('mousemove', handleInteraction)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('mousemove', handleInteraction)
    }
  }, [enabled, resetTimer])

  return { visible: !enabled || visible, show }
}
