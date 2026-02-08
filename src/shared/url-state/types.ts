/**
 * Type definitions for URL-based state sharing.
 *
 * These interfaces define parameter schemas used to encode, decode,
 * and validate simulation parameters for shareable URLs.
 */

// ---------------------------------------------------------------------------
// Parameter Schema Types
// ---------------------------------------------------------------------------

/** A numeric parameter with optional min/max range constraints. */
export interface NumberParameterSchema {
  readonly type: 'number'
  readonly key: string
  readonly label: string
  readonly default: number
  readonly min?: number
  readonly max?: number
  /** Short alias used in URL query strings (e.g., "v" for velocity). */
  readonly alias?: string
}

/** A boolean toggle parameter. */
export interface BooleanParameterSchema {
  readonly type: 'boolean'
  readonly key: string
  readonly label: string
  readonly default: boolean
  readonly alias?: string
}

/** A string parameter (free-form text). */
export interface StringParameterSchema {
  readonly type: 'string'
  readonly key: string
  readonly label: string
  readonly default: string
  readonly alias?: string
}

/** An enumeration parameter with a fixed set of valid values. */
export interface EnumParameterSchema {
  readonly type: 'enum'
  readonly key: string
  readonly label: string
  readonly options: readonly string[]
  readonly default: string
  readonly alias?: string
}

/** Union of all supported parameter schema types. */
export type ParameterSchema =
  | NumberParameterSchema
  | BooleanParameterSchema
  | StringParameterSchema
  | EnumParameterSchema

/** The runtime value corresponding to a parameter schema. */
export type ParameterValue = number | boolean | string

/** A record mapping parameter keys to their runtime values. */
export type ParameterValues = Readonly<Record<string, ParameterValue>>

// ---------------------------------------------------------------------------
// Codec Configuration
// ---------------------------------------------------------------------------

/** Maximum URL length before compression kicks in. */
export const URL_LENGTH_THRESHOLD = 2000

/** The query parameter key used for compressed state. */
export const COMPRESSED_PARAM_KEY = 's'

// ---------------------------------------------------------------------------
// Validation Result
// ---------------------------------------------------------------------------

/** Result of validating decoded URL parameters against a schema. */
export interface ValidationResult {
  /** Validated and sanitized parameter values. */
  readonly params: ParameterValues
  /** Keys of parameters that had invalid values and were replaced with defaults. */
  readonly warnings: readonly string[]
}

// ---------------------------------------------------------------------------
// Hook Return Type
// ---------------------------------------------------------------------------

/** Return value of the `useUrlState` hook. */
export interface UseUrlStateResult {
  /** The current parameter values (from URL or defaults). */
  readonly params: ParameterValues
  /** Whether the parameters were loaded from a shared URL. */
  readonly isFromUrl: boolean
  /** Generate a shareable URL encoding the given parameter values. */
  readonly shareCurrentState: (currentParams: ParameterValues) => string
}
