/**
 * Typed parameter system for simulation variables.
 *
 * Parameters are defined declaratively by episodes (NumberParam, BooleanParam,
 * EnumParam, Vector2Param). The system validates changes against constraints,
 * batches change notifications, and serializes to/from localStorage.
 */

import type {
  ParameterDefinition,
  ParamValues,
  Vector2,
  Subscribable,
  Unsubscribe,
} from './types.ts'

/** Storage key prefix for localStorage persistence. */
const STORAGE_PREFIX = 'essayons_params_'

export class ParameterSystem implements Subscribable<ParamValues> {
  private _definitions: Map<string, ParameterDefinition> = new Map()
  private _values: ParamValues = {}
  private _listeners: Set<() => void> = new Set()
  private _snapshot: ParamValues = {}
  private _episodeId: string | null = null
  private _batchDepth = 0
  private _batchDirty = false

  // ---- Registration ----

  /** Register parameter definitions and initialize values from defaults. */
  register(episodeId: string, definitions: ReadonlyArray<ParameterDefinition>): void {
    this._episodeId = episodeId
    this._definitions.clear()
    this._values = {}

    for (const def of definitions) {
      this._definitions.set(def.key, def)
      this._values[def.key] = def.default as ParamValues[string]
    }

    // Try to restore from localStorage
    this._loadFromStorage()
    this._notify()
  }

  /** Remove all parameter definitions and values. */
  clear(): void {
    this._definitions.clear()
    this._values = {}
    this._episodeId = null
    this._notify()
  }

  // ---- Value access ----

  /** Get the current value of a parameter by key. */
  getValue(key: string): number | boolean | string | Vector2 | undefined {
    return this._values[key]
  }

  /** Get all current parameter values. */
  getAll(): ParamValues {
    return { ...this._values }
  }

  /** Get a parameter definition by key. */
  getDefinition(key: string): ParameterDefinition | undefined {
    return this._definitions.get(key)
  }

  /** Get all registered parameter definitions. */
  getAllDefinitions(): ReadonlyArray<ParameterDefinition> {
    return Array.from(this._definitions.values())
  }

  // ---- Value mutation ----

  /** Set a parameter value, validating against constraints. Returns true if accepted. */
  setValue(key: string, value: number | boolean | string | Vector2): boolean {
    const def = this._definitions.get(key)
    if (!def) return false

    const validated = this._validate(def, value)
    if (validated === undefined) return false

    this._values[key] = validated
    this._saveToStorage()

    if (this._batchDepth > 0) {
      this._batchDirty = true
    } else {
      this._notify()
    }
    return true
  }

  /** Reset a single parameter to its default value. */
  resetToDefault(key: string): void {
    const def = this._definitions.get(key)
    if (def) {
      this._values[key] = def.default as ParamValues[string]
      this._saveToStorage()
      this._notify()
    }
  }

  /** Reset all parameters to their default values. */
  resetAllToDefaults(): void {
    for (const def of this._definitions.values()) {
      this._values[def.key] = def.default as ParamValues[string]
    }
    this._saveToStorage()
    this._notify()
  }

  // ---- Batching ----

  /** Begin a batch — notifications are deferred until endBatch(). */
  beginBatch(): void {
    this._batchDepth++
  }

  /** End a batch — fires notification if any values changed. */
  endBatch(): void {
    this._batchDepth = Math.max(0, this._batchDepth - 1)
    if (this._batchDepth === 0 && this._batchDirty) {
      this._batchDirty = false
      this._notify()
    }
  }

  // ---- Subscribable implementation ----

  subscribe(listener: () => void): Unsubscribe {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  getSnapshot(): ParamValues {
    return this._snapshot
  }

  // ---- Validation ----

  private _validate(def: ParameterDefinition, value: unknown): ParamValues[string] | undefined {
    switch (def.type) {
      case 'number': {
        if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
        // Clamp to [min, max]
        const clamped = Math.max(def.min, Math.min(def.max, value))
        // Snap to step
        const steps = Math.round((clamped - def.min) / def.step)
        return def.min + steps * def.step
      }
      case 'boolean': {
        if (typeof value !== 'boolean') return undefined
        return value
      }
      case 'enum': {
        if (typeof value !== 'string') return undefined
        const valid = def.options.some((opt) => opt.value === value)
        return valid ? value : undefined
      }
      case 'vector2': {
        if (typeof value !== 'object' || value === null || !('x' in value) || !('y' in value))
          return undefined
        const v = value as Vector2
        if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) return undefined
        let x = v.x
        let y = v.y
        if (def.min) {
          x = Math.max(def.min.x, x)
          y = Math.max(def.min.y, y)
        }
        if (def.max) {
          x = Math.min(def.max.x, x)
          y = Math.min(def.max.y, y)
        }
        return { x, y }
      }
    }
  }

  // ---- Persistence ----

  private _storageKey(): string {
    return `${STORAGE_PREFIX}${this._episodeId ?? 'default'}`
  }

  private _saveToStorage(): void {
    try {
      const serializable: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(this._values)) {
        serializable[key] = value
      }
      localStorage.setItem(this._storageKey(), JSON.stringify(serializable))
    } catch {
      // localStorage may be unavailable — silently ignore.
    }
  }

  private _loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this._storageKey())
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null) return

      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        const def = this._definitions.get(key)
        if (!def) continue
        const validated = this._validate(def, value)
        if (validated !== undefined) {
          this._values[key] = validated
        }
      }
    } catch {
      // Corrupted or unavailable — silently ignore.
    }
  }

  // ---- Notification ----

  private _notify(): void {
    this._snapshot = { ...this._values }
    for (const listener of this._listeners) {
      listener()
    }
  }
}
