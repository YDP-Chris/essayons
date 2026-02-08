/**
 * AriaLiveRegion — reusable component for screen reader announcements.
 *
 * Renders a visually hidden aria-live region that announces messages
 * to assistive technology. Supports both "polite" and "assertive" modes.
 */

export interface AriaLiveRegionProps {
  /** The message to announce. Changing this value triggers a new announcement. */
  readonly message: string
  /** The politeness level. Defaults to "polite". */
  readonly politeness?: 'polite' | 'assertive'
}

/**
 * Visually hidden aria-live region that announces messages to screen readers.
 *
 * Renders the message prop directly into an aria-live region. Screen readers
 * detect content changes and announce them automatically.
 */
export function AriaLiveRegion({
  message,
  politeness = 'polite',
}: AriaLiveRegionProps): React.JSX.Element {
  return (
    <div className="aria-live-region" role="status" aria-live={politeness} aria-atomic="true">
      {message}
    </div>
  )
}
