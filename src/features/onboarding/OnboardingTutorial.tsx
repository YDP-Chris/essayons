/**
 * OnboardingTutorial — orchestrator that manages the full tutorial flow.
 *
 * Renders the current TutorialStep, handles keyboard shortcuts (ESC, arrows),
 * implements a focus trap, and announces step changes to screen readers.
 */

import { useEffect, useRef, useCallback } from 'react'
import { TUTORIAL_STEPS } from './tutorial-steps.ts'
import { TutorialStepComponent } from './TutorialStep.tsx'
import type { UseTutorialReturn } from './use-tutorial.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OnboardingTutorialProps {
  /** Tutorial state and actions from useTutorial hook. */
  readonly tutorial: UseTutorialReturn
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingTutorial({ tutorial }: OnboardingTutorialProps) {
  const { currentStep, isActive, totalSteps, next, previous, skip, dismiss } = tutorial
  const containerRef = useRef<HTMLDivElement>(null)
  const announceRef = useRef<HTMLDivElement>(null)

  // Screen reader announcements
  useEffect(() => {
    if (!isActive) return
    const step = TUTORIAL_STEPS[currentStep]
    if (announceRef.current && step) {
      announceRef.current.textContent = `Step ${currentStep + 1} of ${totalSteps}: ${step.title}`
    }
  }, [isActive, currentStep, totalSteps])

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          skip()
          break
        case 'ArrowRight':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
          e.preventDefault()
          previous()
          break
      }
    },
    [isActive, next, previous, skip],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Focus trap: cycle Tab through tutorial controls only
  useEffect(() => {
    if (!isActive) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }

      // If focus is outside the tutorial, bring it back
      if (!container.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isActive])

  // Auto-focus the container when tutorial becomes active
  useEffect(() => {
    if (isActive && containerRef.current) {
      // Focus first focusable element in the tooltip
      const firstBtn = containerRef.current.querySelector<HTMLElement>('button')
      if (firstBtn) {
        firstBtn.focus()
      }
    }
  }, [isActive, currentStep])

  if (!isActive) return null

  const step = TUTORIAL_STEPS[currentStep]
  if (!step) return null

  return (
    <div ref={containerRef} data-testid="onboarding-tutorial">
      {/* Screen reader live region */}
      <div
        ref={announceRef}
        className="sr-only"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      />

      <TutorialStepComponent
        key={step.id}
        step={step}
        stepNumber={currentStep + 1}
        totalSteps={totalSteps}
        onNext={next}
        onPrevious={previous}
        onSkip={skip}
        onDismiss={dismiss}
      />
    </div>
  )
}
