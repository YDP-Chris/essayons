/**
 * useTutorial — custom hook that manages onboarding tutorial state.
 *
 * Reads localStorage on mount to decide whether to auto-start.
 * Exposes imperative methods for step navigation and dismissal.
 */

import { useState, useCallback } from 'react'
import type { TutorialState } from './types.ts'
import { isFirstVisit, markTutorialCompleted, markTutorialDismissed } from './tutorial-storage.ts'
import { TUTORIAL_STEPS } from './tutorial-steps.ts'

export interface UseTutorialReturn extends TutorialState {
  /** Total number of steps. */
  readonly totalSteps: number
  /** Advance to the next step, or complete on the last step. */
  next: () => void
  /** Go back to the previous step (no-op on step 0). */
  previous: () => void
  /** Skip (close) the tutorial without marking "don't show again". */
  skip: () => void
  /** Dismiss the tutorial and mark it as "don't show again". */
  dismiss: () => void
  /** Manually start (or restart) the tutorial. */
  start: () => void
}

export function useTutorial(): UseTutorialReturn {
  // Compute initial state synchronously — auto-start on first visit
  const [state, setState] = useState<TutorialState>(() => ({
    currentStep: 0,
    isActive: isFirstVisit(),
    isCompleted: false,
    isDismissed: false,
  }))

  const totalSteps = TUTORIAL_STEPS.length

  const next = useCallback(() => {
    setState((prev) => {
      if (!prev.isActive) return prev
      if (prev.currentStep >= totalSteps - 1) {
        // Last step — complete
        markTutorialCompleted()
        return { ...prev, isActive: false, isCompleted: true }
      }
      return { ...prev, currentStep: prev.currentStep + 1 }
    })
  }, [totalSteps])

  const previous = useCallback(() => {
    setState((prev) => {
      if (!prev.isActive || prev.currentStep <= 0) return prev
      return { ...prev, currentStep: prev.currentStep - 1 }
    })
  }, [])

  const skip = useCallback(() => {
    setState((prev) => {
      if (!prev.isActive) return prev
      markTutorialCompleted()
      return { ...prev, isActive: false, isCompleted: true }
    })
  }, [])

  const dismiss = useCallback(() => {
    markTutorialDismissed()
    setState((prev) => ({
      ...prev,
      isActive: false,
      isDismissed: true,
    }))
  }, [])

  const start = useCallback(() => {
    setState({
      currentStep: 0,
      isActive: true,
      isCompleted: false,
      isDismissed: false,
    })
  }, [])

  return {
    ...state,
    totalSteps,
    next,
    previous,
    skip,
    dismiss,
    start,
  }
}
