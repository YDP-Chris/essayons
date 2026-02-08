/**
 * TutorialStep — renders a spotlight overlay with a tooltip for a single step.
 *
 * Uses an SVG mask to cut out a transparent window around the target element.
 * Falls back to a centered tooltip when the target selector does not match.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import type { TutorialStep as TutorialStepType, PositionHint } from './types.ts'
import './TutorialStep.css'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TutorialStepProps {
  /** The step definition to render. */
  readonly step: TutorialStepType
  /** 1-based index of the current step. */
  readonly stepNumber: number
  /** Total number of steps. */
  readonly totalSteps: number
  /** Called when the user clicks "Next" (or "Finish" on the last step). */
  readonly onNext: () => void
  /** Called when the user clicks "Back". */
  readonly onPrevious: () => void
  /** Called when the user clicks "Skip". */
  readonly onSkip: () => void
  /** Called when the user checks "Don't show again" and finishes. */
  readonly onDismiss: () => void
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PADDING = 8

function getTargetRect(selector: string): Rect | null {
  if (selector === 'body') return null
  const el = document.querySelector(selector)
  if (!el) return null
  const box = el.getBoundingClientRect()
  if (box.width === 0 && box.height === 0) return null
  return {
    top: box.top - PADDING,
    left: box.left - PADDING,
    width: box.width + PADDING * 2,
    height: box.height + PADDING * 2,
  }
}

interface TooltipPosition {
  top?: number
  bottom?: number
  left?: number
  right?: number
  centered: boolean
}

function computeTooltipPosition(
  targetRect: Rect | null,
  hint: PositionHint,
  viewportIsMobile: boolean,
): TooltipPosition {
  if (viewportIsMobile || !targetRect || hint === 'center') {
    return { centered: true }
  }

  const gap = 12
  const tooltipWidth = 380

  switch (hint) {
    case 'bottom':
      return {
        top: targetRect.top + targetRect.height + gap,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - tooltipWidth - 16)),
        centered: false,
      }
    case 'top':
      return {
        bottom: window.innerHeight - targetRect.top + gap,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - tooltipWidth - 16)),
        centered: false,
      }
    case 'left':
      return {
        top: Math.max(16, targetRect.top),
        right: window.innerWidth - targetRect.left + gap,
        centered: false,
      }
    case 'right':
      return {
        top: Math.max(16, targetRect.top),
        left: targetRect.left + targetRect.width + gap,
        centered: false,
      }
    default:
      return { centered: true }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TutorialStepComponent({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onDismiss,
}: TutorialStepProps) {
  // Compute initial layout synchronously to avoid set-state-in-effect
  const [targetRect, setTargetRect] = useState<Rect | null>(() =>
    getTargetRect(step.targetSelector),
  )
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const isLastStep = stepNumber === totalSteps
  const isFirstStep = stepNumber === 1

  // Re-measure on resize/scroll (only via event callbacks — not synchronous in effect)
  const handleResize = useCallback(() => {
    setTargetRect(getTargetRect(step.targetSelector))
    setIsMobile(window.innerWidth < 768)
  }, [step.targetSelector])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
    }
  }, [handleResize])

  const tooltipPos = computeTooltipPosition(targetRect, step.positionHint, isMobile)

  const tooltipStyle: React.CSSProperties = tooltipPos.centered
    ? {}
    : {
        ...(tooltipPos.top != null ? { top: tooltipPos.top } : {}),
        ...(tooltipPos.bottom != null ? { bottom: tooltipPos.bottom } : {}),
        ...(tooltipPos.left != null ? { left: tooltipPos.left } : {}),
        ...(tooltipPos.right != null ? { right: tooltipPos.right } : {}),
      }

  const handleNext = () => {
    if (isLastStep && dontShowAgain) {
      onDismiss()
    } else {
      onNext()
    }
  }

  // Viewport dimensions for SVG mask
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080

  const titleId = `tutorial-title-${step.id}`
  const contentId = `tutorial-content-${step.id}`

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="tutorial-overlay" data-testid="tutorial-overlay" onClick={onSkip}>
      {/* SVG spotlight mask — purely visual, pointer-events: none in CSS */}
      <svg className="tutorial-overlay__backdrop tutorial-overlay__mask" aria-hidden="true">
        <defs>
          <mask id={`spotlight-mask-${step.id}`}>
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx={8}
                ry={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={vw}
          height={vh}
          fill="rgba(0,0,0,0.7)"
          mask={`url(#spotlight-mask-${step.id})`}
        />
      </svg>

      {/* Tooltip — uses CSS animation for fade-in on mount */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={tooltipRef}
        className={[
          'tutorial-tooltip',
          'tutorial-tooltip--animate-in',
          tooltipPos.centered ? 'tutorial-tooltip--center' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={tooltipStyle}
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={contentId}
        aria-modal="true"
        data-testid="tutorial-tooltip"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tutorial-tooltip__counter">
          Step {stepNumber} of {totalSteps}
        </div>

        <h2 className="tutorial-tooltip__title" id={titleId}>
          {step.title}
        </h2>

        <p className="tutorial-tooltip__content" id={contentId}>
          {step.content}
        </p>

        {/* Progress dots */}
        <div className="tutorial-tooltip__dots" aria-hidden="true">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={[
                'tutorial-tooltip__dot',
                i === stepNumber - 1 ? 'tutorial-tooltip__dot--active' : '',
                i < stepNumber - 1 ? 'tutorial-tooltip__dot--completed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>

        <div className="tutorial-tooltip__actions">
          {!isFirstStep && (
            <button
              type="button"
              className="tutorial-tooltip__btn tutorial-tooltip__btn--prev"
              onClick={onPrevious}
              data-testid="tutorial-prev"
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="tutorial-tooltip__btn tutorial-tooltip__btn--next"
            onClick={handleNext}
            data-testid="tutorial-next"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
          {!isLastStep && (
            <button
              type="button"
              className="tutorial-tooltip__btn tutorial-tooltip__btn--skip"
              onClick={onSkip}
              data-testid="tutorial-skip"
            >
              Skip
            </button>
          )}
        </div>

        {/* "Don't show again" on final step */}
        {isLastStep && (
          <div className="tutorial-tooltip__dismiss">
            <input
              type="checkbox"
              id="tutorial-dismiss-check"
              className="tutorial-tooltip__dismiss-checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              data-testid="tutorial-dismiss-checkbox"
            />
            <label htmlFor="tutorial-dismiss-check" className="tutorial-tooltip__dismiss-label">
              Don&apos;t show again
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
