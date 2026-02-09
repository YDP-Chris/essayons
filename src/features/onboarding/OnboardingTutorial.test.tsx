/**
 * Component tests for the OnboardingTutorial orchestrator.
 *
 * Verifies rendering, step navigation, skip/dismiss behavior,
 * keyboard interaction, progress bar, arrow, and transitions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { OnboardingTutorial } from './OnboardingTutorial.tsx'
import { TUTORIAL_STEPS } from './tutorial-steps.ts'
import type { UseTutorialReturn } from './use-tutorial.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockTutorial(overrides?: Partial<UseTutorialReturn>): UseTutorialReturn {
  return {
    currentStep: 0,
    isActive: true,
    isCompleted: false,
    isDismissed: false,
    totalSteps: TUTORIAL_STEPS.length,
    next: vi.fn(),
    previous: vi.fn(),
    skip: vi.fn(),
    dismiss: vi.fn(),
    start: vi.fn(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OnboardingTutorial', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders the first step on mount', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByTestId('onboarding-tutorial')).toBeInTheDocument()
    expect(screen.getByTestId('tutorial-tooltip')).toBeInTheDocument()
    expect(screen.getByText('Welcome to Essayons')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
  })

  it('renders nothing when tutorial is not active', () => {
    const tutorial = createMockTutorial({ isActive: false })
    const { container } = render(<OnboardingTutorial tutorial={tutorial} />)
    expect(container.innerHTML).toBe('')
  })

  it('calls skip when the Skip tutorial link is clicked', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    const skipBtn = screen.getByTestId('tutorial-skip')
    fireEvent.click(skipBtn)
    expect(tutorial.skip).toHaveBeenCalledTimes(1)
  })

  it('calls skip when ESC key is pressed', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(tutorial.skip).toHaveBeenCalledTimes(1)
  })

  it('shows the correct step content for step 2', () => {
    const tutorial = createMockTutorial({ currentStep: 1 })
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByText('Your Simulation')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
  })

  it('shows "Finish" button on the last step', () => {
    const lastStepIndex = TUTORIAL_STEPS.length - 1
    const tutorial = createMockTutorial({ currentStep: lastStepIndex })
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByTestId('tutorial-next')).toHaveTextContent('Finish')
  })

  it('shows "Don\'t show again" checkbox on the last step', () => {
    const lastStepIndex = TUTORIAL_STEPS.length - 1
    const tutorial = createMockTutorial({ currentStep: lastStepIndex })
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByTestId('tutorial-dismiss-checkbox')).toBeInTheDocument()
  })

  it('does not show "Don\'t show again" on non-final steps', () => {
    const tutorial = createMockTutorial({ currentStep: 0 })
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.queryByTestId('tutorial-dismiss-checkbox')).not.toBeInTheDocument()
  })

  it('calls dismiss when "Don\'t show again" is checked and Finish is clicked', () => {
    const lastStepIndex = TUTORIAL_STEPS.length - 1
    const tutorial = createMockTutorial({ currentStep: lastStepIndex })
    render(<OnboardingTutorial tutorial={tutorial} />)

    const checkbox = screen.getByTestId('tutorial-dismiss-checkbox')
    fireEvent.click(checkbox)

    const finishBtn = screen.getByTestId('tutorial-next')
    fireEvent.click(finishBtn)
    expect(tutorial.dismiss).toHaveBeenCalledTimes(1)
  })

  it('shows Back button on non-first steps', () => {
    const tutorial = createMockTutorial({ currentStep: 2 })
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByTestId('tutorial-prev')).toBeInTheDocument()
  })

  it('does not show Back button on the first step', () => {
    const tutorial = createMockTutorial({ currentStep: 0 })
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.queryByTestId('tutorial-prev')).not.toBeInTheDocument()
  })

  it('has ARIA dialog attributes', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    const tooltip = screen.getByTestId('tutorial-tooltip')
    expect(tooltip).toHaveAttribute('role', 'dialog')
    expect(tooltip).toHaveAttribute('aria-modal', 'true')
    expect(tooltip).toHaveAttribute('aria-labelledby')
    expect(tooltip).toHaveAttribute('aria-describedby')
  })

  it('shows "Skip tutorial" link on all steps including the last', () => {
    const lastStepIndex = TUTORIAL_STEPS.length - 1
    const tutorial = createMockTutorial({ currentStep: lastStepIndex })
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByTestId('tutorial-skip')).toBeInTheDocument()
    expect(screen.getByText('Skip tutorial')).toBeInTheDocument()
  })

  // Progress bar tests
  it('renders a segmented progress bar instead of dots', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByTestId('tutorial-progress')).toBeInTheDocument()
    // Dots should not exist
    expect(screen.queryByClassName?.('tutorial-tooltip__dots')).toBeFalsy()
  })

  it('progress bar has correct number of segments', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    const progress = screen.getByTestId('tutorial-progress')
    const segments = progress.querySelectorAll('.tutorial-tooltip__progress-segment')
    expect(segments).toHaveLength(TUTORIAL_STEPS.length)
  })

  it('progress bar marks the active segment', () => {
    const tutorial = createMockTutorial({ currentStep: 2 })
    render(<OnboardingTutorial tutorial={tutorial} />)

    const progress = screen.getByTestId('tutorial-progress')
    const segments = progress.querySelectorAll('.tutorial-tooltip__progress-segment')
    // Steps 0, 1 should be completed, step 2 should be active
    expect(segments[0]?.classList.contains('tutorial-tooltip__progress-segment--completed')).toBe(
      true,
    )
    expect(segments[1]?.classList.contains('tutorial-tooltip__progress-segment--completed')).toBe(
      true,
    )
    expect(segments[2]?.classList.contains('tutorial-tooltip__progress-segment--active')).toBe(true)
  })

  it('progress bar is aria-hidden', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByTestId('tutorial-progress')).toHaveAttribute('aria-hidden', 'true')
  })

  // Arrow tests
  it('renders data-arrow attribute on the tooltip', () => {
    const tutorial = createMockTutorial({ currentStep: 0 })
    render(<OnboardingTutorial tutorial={tutorial} />)

    const tooltip = screen.getByTestId('tutorial-tooltip')
    expect(tooltip).toHaveAttribute('data-arrow')
  })

  it('sets data-arrow to "none" for centered steps', () => {
    // Step 0 (welcome) has positionHint 'center'
    const tutorial = createMockTutorial({ currentStep: 0 })
    render(<OnboardingTutorial tutorial={tutorial} />)

    const tooltip = screen.getByTestId('tutorial-tooltip')
    expect(tooltip).toHaveAttribute('data-arrow', 'none')
  })

  // Keyboard hint test
  it('shows keyboard hint text', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    expect(screen.getByText('Arrow keys to navigate, Esc to skip')).toBeInTheDocument()
  })

  // Skip link position test
  it('renders skip link as a button with class tutorial-tooltip__skip-link', () => {
    const tutorial = createMockTutorial()
    render(<OnboardingTutorial tutorial={tutorial} />)

    const skipLink = screen.getByTestId('tutorial-skip')
    expect(skipLink.tagName).toBe('BUTTON')
    expect(skipLink.classList.contains('tutorial-tooltip__skip-link')).toBe(true)
  })
})
