/**
 * Unit tests for onboarding tutorial utilities and hook.
 *
 * Covers localStorage functions, first-visit detection, state transitions,
 * tutorial step definitions, and brand voice compliance.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  isFirstVisit,
  markTutorialCompleted,
  markTutorialDismissed,
  resetTutorial,
} from './tutorial-storage.ts'
import { useTutorial } from './use-tutorial.ts'
import { TUTORIAL_STEPS } from './tutorial-steps.ts'

// ---------------------------------------------------------------------------
// localStorage utilities
// ---------------------------------------------------------------------------

describe('tutorial-storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('isFirstVisit returns true when no flags are set', () => {
    expect(isFirstVisit()).toBe(true)
  })

  it('isFirstVisit returns false after markTutorialCompleted', () => {
    markTutorialCompleted()
    expect(isFirstVisit()).toBe(false)
  })

  it('isFirstVisit returns false after markTutorialDismissed', () => {
    markTutorialDismissed()
    expect(isFirstVisit()).toBe(false)
  })

  it('resetTutorial restores first-visit state', () => {
    markTutorialCompleted()
    markTutorialDismissed()
    expect(isFirstVisit()).toBe(false)
    resetTutorial()
    expect(isFirstVisit()).toBe(true)
  })

  it('markTutorialCompleted sets the correct localStorage key', () => {
    markTutorialCompleted()
    expect(localStorage.getItem('essayons_tutorial_completed')).toBe('true')
  })

  it('markTutorialDismissed sets the correct localStorage key', () => {
    markTutorialDismissed()
    expect(localStorage.getItem('essayons_tutorial_dismissed')).toBe('true')
  })

  it('resetTutorial removes both localStorage keys', () => {
    markTutorialCompleted()
    markTutorialDismissed()
    resetTutorial()
    expect(localStorage.getItem('essayons_tutorial_completed')).toBeNull()
    expect(localStorage.getItem('essayons_tutorial_dismissed')).toBeNull()
  })

  it('degrades gracefully when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })

    // Should not throw
    expect(() => markTutorialCompleted()).not.toThrow()
    expect(() => markTutorialDismissed()).not.toThrow()
    expect(() => resetTutorial()).not.toThrow()
    // Falls back to "first visit" when storage is broken
    expect(isFirstVisit()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useTutorial hook
// ---------------------------------------------------------------------------

describe('useTutorial', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('auto-starts on first visit', () => {
    const { result } = renderHook(() => useTutorial())
    expect(result.current.isActive).toBe(true)
    expect(result.current.currentStep).toBe(0)
  })

  it('does not auto-start when tutorial was previously completed', () => {
    markTutorialCompleted()
    const { result } = renderHook(() => useTutorial())
    expect(result.current.isActive).toBe(false)
  })

  it('does not auto-start when tutorial was previously dismissed', () => {
    markTutorialDismissed()
    const { result } = renderHook(() => useTutorial())
    expect(result.current.isActive).toBe(false)
  })

  it('next() advances the step', () => {
    const { result } = renderHook(() => useTutorial())
    expect(result.current.currentStep).toBe(0)

    act(() => result.current.next())
    expect(result.current.currentStep).toBe(1)

    act(() => result.current.next())
    expect(result.current.currentStep).toBe(2)
  })

  it('next() on the last step completes the tutorial', () => {
    const { result } = renderHook(() => useTutorial())
    const totalSteps = result.current.totalSteps

    // Advance to last step
    for (let i = 0; i < totalSteps - 1; i++) {
      act(() => result.current.next())
    }
    expect(result.current.currentStep).toBe(totalSteps - 1)

    // Advance past last step
    act(() => result.current.next())
    expect(result.current.isActive).toBe(false)
    expect(result.current.isCompleted).toBe(true)
  })

  it('previous() goes back a step', () => {
    const { result } = renderHook(() => useTutorial())
    act(() => result.current.next())
    act(() => result.current.next())
    expect(result.current.currentStep).toBe(2)

    act(() => result.current.previous())
    expect(result.current.currentStep).toBe(1)
  })

  it('previous() is a no-op on step 0', () => {
    const { result } = renderHook(() => useTutorial())
    act(() => result.current.previous())
    expect(result.current.currentStep).toBe(0)
  })

  it('skip() closes the tutorial and marks as completed', () => {
    const { result } = renderHook(() => useTutorial())
    act(() => result.current.skip())
    expect(result.current.isActive).toBe(false)
    expect(result.current.isCompleted).toBe(true)
  })

  it('dismiss() closes the tutorial and marks as dismissed', () => {
    const { result } = renderHook(() => useTutorial())
    act(() => result.current.dismiss())
    expect(result.current.isActive).toBe(false)
    expect(result.current.isDismissed).toBe(true)
  })

  it('start() restarts the tutorial from step 0', () => {
    const { result } = renderHook(() => useTutorial())
    act(() => result.current.skip())
    expect(result.current.isActive).toBe(false)

    act(() => result.current.start())
    expect(result.current.isActive).toBe(true)
    expect(result.current.currentStep).toBe(0)
  })

  it('totalSteps matches TUTORIAL_STEPS length', () => {
    const { result } = renderHook(() => useTutorial())
    expect(result.current.totalSteps).toBe(TUTORIAL_STEPS.length)
  })
})

// ---------------------------------------------------------------------------
// Tutorial step definitions
// ---------------------------------------------------------------------------

describe('TUTORIAL_STEPS', () => {
  it('has exactly 6 steps', () => {
    expect(TUTORIAL_STEPS).toHaveLength(6)
  })

  it('each step has required fields', () => {
    for (const step of TUTORIAL_STEPS) {
      expect(step.id).toBeTruthy()
      expect(step.title).toBeTruthy()
      expect(step.content).toBeTruthy()
      expect(step.targetSelector).toBeTruthy()
      expect(step.positionHint).toBeTruthy()
    }
  })

  it('step IDs are unique', () => {
    const ids = TUTORIAL_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('starts with the welcome step', () => {
    expect(TUTORIAL_STEPS[0]?.id).toBe('welcome')
  })

  it('ends with the share step', () => {
    expect(TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1]?.id).toBe('share')
  })
})

// ---------------------------------------------------------------------------
// Brand voice compliance
// ---------------------------------------------------------------------------

describe('Brand voice compliance', () => {
  const forbiddenWords = [
    'learn',
    'study',
    'memorize',
    'users',
    'students',
    'game',
    'module',
    'lesson',
    'simplified',
    'approximated',
  ]

  it('step content does not contain forbidden brand voice words', () => {
    for (const step of TUTORIAL_STEPS) {
      const text = `${step.title} ${step.content}`.toLowerCase()
      for (const word of forbiddenWords) {
        expect(text).not.toContain(word)
      }
    }
  })

  it('step content uses second-person voice (contains "you" or active verbs)', () => {
    // At least some steps should use "you" or active verbs like "try", "drag", "watch"
    const allContent = TUTORIAL_STEPS.map((s) => s.content)
      .join(' ')
      .toLowerCase()
    expect(allContent).toContain('you')
  })

  it('step content uses brand-approved words (try, experiment, discover, crash)', () => {
    const allContent = TUTORIAL_STEPS.map((s) => s.content)
      .join(' ')
      .toLowerCase()
    const brandWords = ['try', 'experiment', 'discover', 'crash']
    const usedBrandWords = brandWords.filter((word) => allContent.includes(word))
    // At least 2 of 4 brand words should appear across all steps
    expect(usedBrandWords.length).toBeGreaterThanOrEqual(2)
  })
})
