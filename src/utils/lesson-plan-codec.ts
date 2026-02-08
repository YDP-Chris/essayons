/**
 * Lesson plan codec.
 *
 * Encodes and decodes lesson plan configurations to/from URL-safe base64.
 * Uses JSON.stringify + btoa/atob for simplicity (no external deps).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single episode entry within a lesson plan. */
export interface LessonPlanEpisode {
  readonly episodeId: string
  readonly missions: readonly string[]
  readonly parameters?: Readonly<Record<string, unknown>>
}

/** Full lesson plan configuration. */
export interface LessonPlanConfig {
  readonly version: number
  readonly title: string
  readonly episodes: readonly LessonPlanEpisode[]
  readonly sequenceOrder: readonly string[]
}

/** Current schema version for lesson plan configs. */
export const LESSON_PLAN_VERSION = 1

// ---------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------

/**
 * Encode a LessonPlanConfig into a URL-safe base64 string.
 *
 * @param config - The lesson plan configuration to encode.
 * @returns A URL-safe base64 string.
 */
export function encodeLessonPlan(config: LessonPlanConfig): string {
  const json = JSON.stringify(config)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  // Make URL-safe: replace +, /, and remove trailing =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ---------------------------------------------------------------------------
// Decode
// ---------------------------------------------------------------------------

/**
 * Decode a URL-safe base64 string back to a LessonPlanConfig.
 *
 * @param encoded - The URL-safe base64 string.
 * @returns The decoded lesson plan configuration, or null if invalid.
 */
export function decodeLessonPlan(encoded: string): LessonPlanConfig | null {
  try {
    // Restore standard base64: replace - and _, add padding
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const remainder = base64.length % 4
    if (remainder === 2) {
      base64 += '=='
    } else if (remainder === 3) {
      base64 += '='
    }
    const json = decodeURIComponent(escape(atob(base64)))
    const parsed: unknown = JSON.parse(json)
    return validateLessonPlan(parsed)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate that an unknown value conforms to the LessonPlanConfig shape.
 *
 * @param data - The value to validate.
 * @returns A valid LessonPlanConfig, or null if invalid.
 */
function validateLessonPlan(data: unknown): LessonPlanConfig | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  const obj = data as Record<string, unknown>

  if (typeof obj['version'] !== 'number') return null
  if (typeof obj['title'] !== 'string') return null
  if (!Array.isArray(obj['episodes'])) return null
  if (!Array.isArray(obj['sequenceOrder'])) return null

  const episodes = obj['episodes'] as unknown[]
  for (const ep of episodes) {
    if (typeof ep !== 'object' || ep === null) return null
    const epObj = ep as Record<string, unknown>
    if (typeof epObj['episodeId'] !== 'string') return null
    if (!Array.isArray(epObj['missions'])) return null
    for (const m of epObj['missions'] as unknown[]) {
      if (typeof m !== 'string') return null
    }
  }

  const sequenceOrder = obj['sequenceOrder'] as unknown[]
  for (const s of sequenceOrder) {
    if (typeof s !== 'string') return null
  }

  return {
    version: obj['version'] as number,
    title: obj['title'] as string,
    episodes: (obj['episodes'] as Record<string, unknown>[]).map((ep) => ({
      episodeId: ep['episodeId'] as string,
      missions: ep['missions'] as string[],
      parameters: ep['parameters'] as Record<string, unknown> | undefined,
    })),
    sequenceOrder: obj['sequenceOrder'] as string[],
  }
}

// ---------------------------------------------------------------------------
// URL Builder
// ---------------------------------------------------------------------------

/**
 * Build a full shareable URL with the lesson plan encoded in the hash.
 *
 * @param config - The lesson plan configuration to encode.
 * @returns A full URL string.
 */
export function buildLessonPlanUrl(config: LessonPlanConfig): string {
  const encoded = encodeLessonPlan(config)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  return `${origin}${pathname}#/teach?plan=${encoded}`
}
