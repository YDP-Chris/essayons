import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import './Slider.css'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  showValue?: boolean
  formatValue?: (value: string) => string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    showValue = true,
    formatValue,
    className = '',
    id: externalId,
    value,
    defaultValue,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const inputId = externalId ?? generatedId

  const displayValue = String(value ?? defaultValue ?? rest.min ?? '0')
  const formattedValue = formatValue ? formatValue(displayValue) : displayValue

  const containerClasses = ['slider-container', className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <div className="slider-label-row">
        <label className="slider-label" htmlFor={inputId}>
          {label}
        </label>
        {showValue && (
          <span className="slider-value" aria-live="polite">
            {formattedValue}
          </span>
        )}
      </div>
      <input
        ref={ref}
        id={inputId}
        type="range"
        className="slider-input"
        value={value}
        defaultValue={defaultValue}
        aria-valuemin={rest.min != null ? Number(rest.min) : undefined}
        aria-valuemax={rest.max != null ? Number(rest.max) : undefined}
        aria-valuenow={value != null ? Number(value) : undefined}
        aria-valuetext={formattedValue}
        {...rest}
      />
    </div>
  )
})
