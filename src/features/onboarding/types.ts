/**
 * Types for the onboarding tutorial system.
 *
 * Defines the shape of individual tutorial steps and the overall
 * tutorial state managed by the useTutorial hook.
 */

/** Hint for where to position the tooltip relative to the target element. */
export type PositionHint = 'top' | 'bottom' | 'left' | 'right' | 'center'

/** A single step in the onboarding tutorial. */
export interface TutorialStep {
  /** Unique identifier for this step. */
  readonly id: string
  /** Short heading displayed in the tooltip. */
  readonly title: string
  /** Body text explaining the highlighted element. */
  readonly content: string
  /** CSS selector for the element to spotlight. */
  readonly targetSelector: string
  /** Preferred tooltip placement relative to the target. */
  readonly positionHint: PositionHint
}

/** Runtime state of the tutorial managed by useTutorial. */
export interface TutorialState {
  /** Index of the currently visible step (0-based). */
  readonly currentStep: number
  /** Whether the tutorial overlay is currently showing. */
  readonly isActive: boolean
  /** Whether the user has completed the full tutorial. */
  readonly isCompleted: boolean
  /** Whether the user has dismissed (skipped) the tutorial. */
  readonly isDismissed: boolean
}
