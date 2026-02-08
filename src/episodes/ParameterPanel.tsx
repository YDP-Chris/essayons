/**
 * ParameterPanel — renders parameter controls from EpisodeConfig.parameters.
 *
 * Maps parameter types to the appropriate UI component:
 * - number  -> Slider
 * - boolean -> checkbox
 * - enum    -> select dropdown
 * - vector2 -> paired x/y Sliders
 *
 * Fires analytics events on parameter changes.
 */

import { useCallback } from 'react'
import type { ParameterConfig } from './types.ts'
import { Slider } from '@/components/ui/Slider.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { trackParameterChange } from '@/analytics/plausible.ts'
import './ParameterPanel.css'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ParameterPanelProps {
  readonly parameters: readonly ParameterConfig[]
  readonly values: Readonly<Record<string, unknown>>
  readonly episodeId: string
  readonly onParameterChange: (id: string, value: unknown) => void
}

// ---------------------------------------------------------------------------
// Individual controls
// ---------------------------------------------------------------------------

interface NumberControlProps {
  readonly param: ParameterConfig
  readonly value: number
  readonly episodeId: string
  readonly onChange: (id: string, value: unknown) => void
}

function NumberControl({ param, value, episodeId, onChange }: NumberControlProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = Number(e.target.value)
      onChange(param.id, numValue)
      trackParameterChange(param.id, 'slider', episodeId)
    },
    [param.id, episodeId, onChange],
  )

  const formatValue = useCallback(
    (v: string) => (param.unit ? `${v} ${param.unit}` : v),
    [param.unit],
  )

  return (
    <Slider
      label={param.label}
      min={param.min ?? 0}
      max={param.max ?? 100}
      step={param.step ?? 1}
      value={value}
      onChange={handleChange}
      formatValue={formatValue}
    />
  )
}

interface BooleanControlProps {
  readonly param: ParameterConfig
  readonly value: boolean
  readonly episodeId: string
  readonly onChange: (id: string, value: unknown) => void
}

function BooleanControl({ param, value, episodeId, onChange }: BooleanControlProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(param.id, e.target.checked)
      trackParameterChange(param.id, 'button', episodeId)
    },
    [param.id, episodeId, onChange],
  )

  return (
    <div className="parameter-panel__boolean">
      <label className="parameter-panel__boolean-label" htmlFor={`param-${param.id}`}>
        <input
          id={`param-${param.id}`}
          type="checkbox"
          className="parameter-panel__checkbox"
          checked={value}
          onChange={handleChange}
        />
        <span className="parameter-panel__boolean-text">{param.label}</span>
      </label>
      {param.description && (
        <span className="parameter-panel__description">{param.description}</span>
      )}
    </div>
  )
}

interface EnumControlProps {
  readonly param: ParameterConfig
  readonly value: string
  readonly episodeId: string
  readonly onChange: (id: string, value: unknown) => void
}

function EnumControl({ param, value, episodeId, onChange }: EnumControlProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(param.id, e.target.value)
      trackParameterChange(param.id, 'button', episodeId)
    },
    [param.id, episodeId, onChange],
  )

  return (
    <div className="parameter-panel__enum">
      <label className="parameter-panel__enum-label" htmlFor={`param-${param.id}`}>
        {param.label}
      </label>
      <select
        id={`param-${param.id}`}
        className="parameter-panel__select"
        value={value}
        onChange={handleChange}
      >
        {param.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {param.description && (
        <span className="parameter-panel__description">{param.description}</span>
      )}
    </div>
  )
}

interface Vector2ControlProps {
  readonly param: ParameterConfig
  readonly value: { x: number; y: number }
  readonly episodeId: string
  readonly onChange: (id: string, value: unknown) => void
}

function Vector2Control({ param, value, episodeId, onChange }: Vector2ControlProps) {
  const handleXChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(param.id, { x: Number(e.target.value), y: value.y })
      trackParameterChange(param.id, 'slider', episodeId)
    },
    [param.id, value.y, episodeId, onChange],
  )

  const handleYChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(param.id, { x: value.x, y: Number(e.target.value) })
      trackParameterChange(param.id, 'slider', episodeId)
    },
    [param.id, value.x, episodeId, onChange],
  )

  return (
    <div className="parameter-panel__vector2">
      <span className="parameter-panel__vector2-label">{param.label}</span>
      <div className="parameter-panel__vector2-axes">
        <Slider
          label="X"
          min={param.min ?? -100}
          max={param.max ?? 100}
          step={param.step ?? 1}
          value={value.x}
          onChange={handleXChange}
        />
        <Slider
          label="Y"
          min={param.min ?? -100}
          max={param.max ?? 100}
          step={param.step ?? 1}
          value={value.y}
          onChange={handleYChange}
        />
      </div>
      {param.description && (
        <span className="parameter-panel__description">{param.description}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ParameterPanel({
  parameters,
  values,
  episodeId,
  onParameterChange,
}: ParameterPanelProps) {
  if (parameters.length === 0) {
    return null
  }

  return (
    <Card
      header={<h2 className="parameter-panel__title">Parameters</h2>}
      className="parameter-panel"
    >
      <div className="parameter-panel__controls">
        {parameters.map((param) => {
          const value = values[param.id] ?? param.default

          switch (param.type) {
            case 'number':
              return (
                <NumberControl
                  key={param.id}
                  param={param}
                  value={value as number}
                  episodeId={episodeId}
                  onChange={onParameterChange}
                />
              )
            case 'boolean':
              return (
                <BooleanControl
                  key={param.id}
                  param={param}
                  value={value as boolean}
                  episodeId={episodeId}
                  onChange={onParameterChange}
                />
              )
            case 'enum':
              return (
                <EnumControl
                  key={param.id}
                  param={param}
                  value={value as string}
                  episodeId={episodeId}
                  onChange={onParameterChange}
                />
              )
            case 'vector2':
              return (
                <Vector2Control
                  key={param.id}
                  param={param}
                  value={value as { x: number; y: number }}
                  episodeId={episodeId}
                  onChange={onParameterChange}
                />
              )
            default:
              return null
          }
        })}
      </div>
    </Card>
  )
}
