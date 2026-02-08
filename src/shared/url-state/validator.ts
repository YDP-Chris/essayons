/**
 * Parameter validation.
 *
 * Validates decoded URL parameter values against their schemas.
 * Checks types, clamps numeric ranges, validates enum membership,
 * and substitutes defaults for any invalid or missing values.
 * Logs developer-facing warnings to the console.
 */

import type { ParameterSchema, ParameterValue, ParameterValues, ValidationResult } from './types.ts'

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate decoded parameter values against a set of schemas.
 *
 * - Missing parameters are filled with defaults.
 * - Wrong-type values are replaced with defaults.
 * - Numbers are clamped to [min, max] when specified.
 * - Enum values not in the options list are replaced with defaults.
 * - Unknown parameters (not in schema) are silently dropped.
 *
 * @param decoded - The raw decoded parameter values to validate.
 * @param schemas - The parameter schemas to validate against.
 * @returns Validated parameter values and a list of warning keys.
 */
export function validateParams(
  decoded: ParameterValues,
  schemas: readonly ParameterSchema[],
): ValidationResult {
  const params: Record<string, ParameterValue> = {}
  const warnings: string[] = []

  for (const schema of schemas) {
    const raw = decoded[schema.key]
    const validated = validateSingle(raw, schema, warnings)
    params[schema.key] = validated
  }

  return { params, warnings }
}

/** Validate a single parameter value. */
function validateSingle(
  raw: ParameterValue | undefined,
  schema: ParameterSchema,
  warnings: string[],
): ParameterValue {
  // Missing value — use default
  if (raw === undefined) {
    return schema.default
  }

  switch (schema.type) {
    case 'number':
      return validateNumber(raw, schema.key, schema.default, schema.min, schema.max, warnings)
    case 'boolean':
      return validateBoolean(raw, schema.key, schema.default, warnings)
    case 'string':
      return validateString(raw, schema.key, schema.default, warnings)
    case 'enum':
      return validateEnum(raw, schema.key, schema.default, schema.options, warnings)
  }
}

/** Validate a number parameter: type check and range clamp. */
function validateNumber(
  raw: ParameterValue,
  key: string,
  defaultValue: number,
  min: number | undefined,
  max: number | undefined,
  warnings: string[],
): number {
  if (typeof raw !== 'number' || Number.isNaN(raw)) {
    warnings.push(key)
    console.warn(
      `[url-state] Parameter "${key}" expected number, got ${typeof raw}. Using default.`,
    )
    return defaultValue
  }

  let value = raw

  if (min !== undefined && value < min) {
    warnings.push(key)
    console.warn(`[url-state] Parameter "${key}" value ${value} below min ${min}. Clamping.`)
    value = min
  }

  if (max !== undefined && value > max) {
    warnings.push(key)
    console.warn(`[url-state] Parameter "${key}" value ${value} above max ${max}. Clamping.`)
    value = max
  }

  return value
}

/** Validate a boolean parameter: type check. */
function validateBoolean(
  raw: ParameterValue,
  key: string,
  defaultValue: boolean,
  warnings: string[],
): boolean {
  if (typeof raw !== 'boolean') {
    warnings.push(key)
    console.warn(
      `[url-state] Parameter "${key}" expected boolean, got ${typeof raw}. Using default.`,
    )
    return defaultValue
  }
  return raw
}

/** Validate a string parameter: type check. */
function validateString(
  raw: ParameterValue,
  key: string,
  defaultValue: string,
  warnings: string[],
): string {
  if (typeof raw !== 'string') {
    warnings.push(key)
    console.warn(
      `[url-state] Parameter "${key}" expected string, got ${typeof raw}. Using default.`,
    )
    return defaultValue
  }
  return raw
}

/** Validate an enum parameter: type check and membership. */
function validateEnum(
  raw: ParameterValue,
  key: string,
  defaultValue: string,
  options: readonly string[],
  warnings: string[],
): string {
  if (typeof raw !== 'string') {
    warnings.push(key)
    console.warn(
      `[url-state] Parameter "${key}" expected enum string, got ${typeof raw}. Using default.`,
    )
    return defaultValue
  }

  if (!options.includes(raw)) {
    warnings.push(key)
    console.warn(
      `[url-state] Parameter "${key}" value "${raw}" not in options [${options.join(', ')}]. Using default.`,
    )
    return defaultValue
  }

  return raw
}
