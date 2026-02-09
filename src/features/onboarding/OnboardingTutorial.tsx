/**
 * OnboardingTutorial — orchestrator that manages the full tutorial flow.
 *
 * Renders the current TutorialStep, handles keyboard shortcuts (ESC, arrows),
 * implements a focus trap, announces step changes to screen readers, and
 * coordinates exit/enter transitions between steps.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
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

  // Transition state: when navigating between steps, we play an exit
  // animation on the current tooltip before advancing/retreating.
  const [transitioning, setTransitioning] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)

  // Screen reader announcements
  useEffect(() => {
    if (!isActive) return
    const step = TUTORIAL_STEPS[currentStep]
    if (announceRef.current && step) {
      announceRef.current.textContent = `Step ${currentStep + 1} of ${totalSteps}: ${step.title}`
    }
  }, [isActive, currentStep, totalSteps])

  // Start a transition: trigger exit animation, then run the action
  const startTransition = useCallback((action: () => void) => {
    setTransitioning(true)
    pendingActionRef.current = action
  }, [])

  // Called when exit animation finishes
  const handleExitComplete = useCallback(() => {
    const action = pendingActionRef.current
    pendingActionRef.current = null
    setTransitioning(false)
    if (action) action()
  }, [])

  // Wrapped navigation that triggers transitions
  const handleNext = useCallback(() => {
    if (transitioning) return
    startTransition(next)
  }, [transitioning, startTransition, next])

  const handlePrevious = useCallback(() => {
    if (transitioning) return
    startTransition(previous)
  }, [transitioning, startTransition, previous])

  const handleSkip = useCallback(() => {
    if (transitioning) return
    skip()
  }, [transitioning, skip])

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || transitioning) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          handleSkip()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
      }
    },
    [isActive, transitioning, handleNext, handlePrevious, handleSkip],
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
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onDismiss={dismiss}
        exiting={transitioning}
        disabled={transitioning}
        onExitComplete={handleExitComplete}
      />
    </div>
  )
}
