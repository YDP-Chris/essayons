/**
 * URL state codec.
 *
 * Encodes simulation parameters into URL query strings and decodes them
 * back to typed values. Uses human-readable key aliases when available
 * and omits parameters that match their default values to keep URLs short.
 *
 * When the resulting URL exceeds the length threshold, falls back to a
 * compressed Base64-encoded JSON representation in a single `s=` parameter.
 */

import type { ParameterSchema, ParameterValues } from './types.ts'
import { COMPRESSED_PARAM_KEY, URL_LENGTH_THRESHOLD } from './types.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a map from alias (or key) to schema for decoding. */
function buildAliasMap(schemas: readonly ParameterSchema[]): Map<string, ParameterSchema> {
  const map = new Map<string, ParameterSchema>()
  for (const schema of schemas) {
    const urlKey = schema.alias ?? schema.key
    map.set(urlKey, schema)
  }
  return map
}

/** Build a map from key to schema. */
function buildKeyMap(schemas: readonly ParameterSchema[]): Map<string, ParameterSchema> {
  const map = new Map<string, ParameterSchema>()
  for (const schema of schemas) {
    map.set(schema.key, schema)
  }
  return map
}

/** Encode a single value to its string representation. */
function encodeValue(value: number | boolean | string): string {
  if (typeof value === 'boolean') {
    return value ? '1' : '0'
  }
  return String(value)
}

/** Check if a value matches the schema default. */
function isDefault(schema: ParameterSchema, value: number | boolean | string): boolean {
  return value === schema.default
}

// ---------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------

/**
 * Encode parameter values into a URL query string.
 *
 * Parameters matching their schema defaults are omitted for brevity.
 * Uses alias keys when available for shorter URLs.
 *
 * @param params - The parameter values to encode.
 * @param schemas - The parameter schemas defining types, defaults, and aliases.
 * @returns A query string (without leading `?`).
 */
export function encodeState(params: ParameterValues, schemas: readonly ParameterSchema[]): string {
  const keyMap = buildKeyMap(schemas)
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    const schema = keyMap.get(key)
    if (!schema) continue
    if (isDefault(schema, value)) continue

    const urlKey = schema.alias ?? schema.key
    searchParams.set(urlKey, encodeValue(value))
  }

  const readable = searchParams.toString()

  // If short enough, return the readable version
  if (readable.length <= URL_LENGTH_THRESHOLD) {
    return readable
  }

  // Compress: strip defaults, then Base64-encode JSON
  const nonDefaults: Record<string, number | boolean | string> = {}
  for (const [key, value] of Object.entries(params)) {
    const schema = keyMap.get(key)
    if (!schema) continue
    if (isDefault(schema, value)) continue
    nonDefaults[key] = value
  }

  const json = JSON.stringify(nonDefaults)
  const compressed = btoa(json)
  return `${COMPRESSED_PARAM_KEY}=${encodeURIComponent(compressed)}`
}

// ---------------------------------------------------------------------------
// Decode
// ---------------------------------------------------------------------------

/**
 * Decode a URL (or query string) back to parameter values.
 *
 * Recognises both alias and full-key parameter names. Falls back to
 * default values for any missing parameters. Handles compressed `s=`
 * parameter format as well.
 *
 * @param url - A full URL string, or just the query portion (with or without `?`).
 * @param schemas - The parameter schemas to decode against.
 * @returns A record of decoded parameter values (unvalidated beyond type coercion).
 */
export function decodeState(url: string, schemas: readonly ParameterSchema[]): ParameterValues {
  const queryString = url.includes('?') ? (url.split('?')[1] ?? '') : url
  const searchParams = new URLSearchParams(queryString)

  // Check for compressed format first
  const compressed = searchParams.get(COMPRESSED_PARAM_KEY)
  if (compressed !== null) {
    return decodeCompressed(compressed, schemas)
  }

  return decodeReadable(searchParams, schemas)
}

/** Decode from human-readable query parameters. */
function decodeReadable(
  searchParams: URLSearchParams,
  schemas: readonly ParameterSchema[],
): ParameterValues {
  const aliasMap = buildAliasMap(schemas)
  const result: Record<string, number | boolean | string> = {}

  // Start with defaults
  for (const schema of schemas) {
    result[schema.key] = schema.default
  }

  // Override with URL values
  for (const [urlKey, rawValue] of searchParams.entries()) {
    const schema = aliasMap.get(urlKey)
    if (!schema) continue

    const parsed = parseValue(rawValue, schema)
    if (parsed !== undefined) {
      result[schema.key] = parsed
    }
  }

  return result
}

/** Decode from compressed Base64 JSON format. */
function decodeCompressed(
  compressed: string,
  schemas: readonly ParameterSchema[],
): ParameterValues {
  const result: Record<string, number | boolean | string> = {}
  const keyMap = buildKeyMap(schemas)

  // Start with defaults
  for (const schema of schemas) {
    result[schema.key] = schema.default
  }

  try {
    const json = atob(decodeURIComponent(compressed))
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null) {
      return result
    }

    const obj = parsed as Record<string, unknown>
    for (const [key, value] of Object.entries(obj)) {
      const schema = keyMap.get(key)
      if (!schema) continue
      if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
        result[key] = value
      }
    }
  } catch {
    // Invalid compressed data — return defaults
  }

  return result
}

/** Parse a raw URL string value into the expected type. */
function parseValue(raw: string, schema: ParameterSchema): number | boolean | string | undefined {
  switch (schema.type) {
    case 'number': {
      const num = Number(raw)
      if (Number.isNaN(num)) return undefined
      return num
    }
    case 'boolean':
      if (raw === '1' || raw === 'true') return true
      if (raw === '0' || raw === 'false') return false
      return undefined
    case 'string':
      return raw
    case 'enum':
      return raw
  }
}
