import { forwardRef, useCallback, useId, useRef, useState, type InputHTMLAttributes } from 'react'
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
    onChange,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const inputId = externalId ?? generatedId
  const editRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const rawValue = String(value ?? defaultValue ?? rest.min ?? '0')
  const formattedValue = formatValue ? formatValue(rawValue) : rawValue

  const containerClasses = ['slider-container', className].filter(Boolean).join(' ')

  const commitEdit = useCallback(
    (text: string) => {
      setEditing(false)
      const num = Number(text)
      if (Number.isNaN(num)) return

      const min = rest.min != null ? Number(rest.min) : -Infinity
      const max = rest.max != null ? Number(rest.max) : Infinity
      const step = rest.step != null ? Number(rest.step) : 1
      const clamped = Math.min(max, Math.max(min, num))
      const snapped = Math.round(clamped / step) * step

      if (onChange) {
        const syntheticEvent = {
          target: { value: String(snapped) },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    },
    [rest.min, rest.max, rest.step, onChange],
  )

  const handleValueClick = useCallback(() => {
    setEditValue(rawValue)
    setEditing(true)
    requestAnimationFrame(() => editRef.current?.select())
  }, [rawValue])

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        commitEdit(editValue)
      } else if (e.key === 'Escape') {
        setEditing(false)
      }
    },
    [editValue, commitEdit],
  )

  const handleEditBlur = useCallback(() => {
    commitEdit(editValue)
  }, [editValue, commitEdit])

  return (
    <div className={containerClasses}>
      <div className="slider-label-row">
        <label className="slider-label" htmlFor={inputId}>
          {label}
        </label>
        {showValue && !editing && (
          <button
            type="button"
            className="slider-value slider-value--clickable"
            aria-live="polite"
            aria-label={`${label}: ${formattedValue}. Click to edit.`}
            onClick={handleValueClick}
          >
            {formattedValue}
          </button>
        )}
        {showValue && editing && (
          <input
            ref={editRef}
            type="number"
            className="slider-value-edit"
            value={editValue}
            min={rest.min}
            max={rest.max}
            step={rest.step}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            aria-label={`Edit ${label}`}
          />
        )}
      </div>
      <input
        ref={ref}
        id={inputId}
        type="range"
        className="slider-input"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        aria-valuemin={rest.min != null ? Number(rest.min) : undefined}
        aria-valuemax={rest.max != null ? Number(rest.max) : undefined}
        aria-valuenow={value != null ? Number(value) : undefined}
        aria-valuetext={formattedValue}
        {...rest}
      />
    </div>
  )
})
