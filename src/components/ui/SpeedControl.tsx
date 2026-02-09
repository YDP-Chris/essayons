/**
 * SpeedControl — segmented button row for simulation speed presets.
 * Used on mobile as a replacement for the <select> speed dropdown.
 */

import './SpeedControl.css'

export interface SpeedControlProps {
  readonly presets: readonly number[]
  readonly value: number
  readonly onChange: (speed: number) => void
  readonly ariaLabel?: string
}

export function SpeedControl({ presets, value, onChange, ariaLabel }: SpeedControlProps) {
  return (
    <div className="speed-control" role="radiogroup" aria-label={ariaLabel ?? 'Simulation speed'}>
      {presets.map((speed) => (
        <button
          key={speed}
          type="button"
          role="radio"
          aria-checked={speed === value}
          className={`speed-control__btn${speed === value ? ' speed-control__btn--active' : ''}`}
          onClick={() => onChange(speed)}
        >
          {speed}x
        </button>
      ))}
    </div>
  )
}
