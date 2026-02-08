/**
 * Progress parser.
 *
 * Parses and validates student progress JSON exports from localStorage.
 * Extracts mission completion data for display in the teacher dashboard.
 */

import type { ProgressData, EpisodeData } from '@/storage/types.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Summary row for a single student's progress across episodes. */
export interface StudentProgressRow {
  readonly studentId: string
  readonly episodeId: string
  readonly completedMissions: readonly string[]
  readonly totalMissions: number
  readonly lastVisit: string | null
}

/** Result of parsing a student progress file. */
export interface ParseResult {
  readonly success: boolean
  readonly studentId: string
  readonly rows: readonly StudentProgressRow[]
  readonly error?: string
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate that an unknown value conforms to the ProgressData shape.
 *
 * @param data - The value to validate.
 * @returns True if the data is a valid ProgressData object.
 */
export function isValidProgressData(data: unknown): data is ProgressData {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>
  if (typeof obj['version'] !== 'number') return false
  if (typeof obj['episodes'] !== 'object' || obj['episodes'] === null) return false

  const episodes = obj['episodes'] as Record<string, unknown>
  for (const [_key, value] of Object.entries(episodes)) {
    if (typeof value !== 'object' || value === null) return false
    const ep = value as Record<string, unknown>
    if (typeof ep['missions'] !== 'object' || ep['missions'] === null) return false
  }

  return true
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a raw JSON string as student progress data.
 *
 * @param jsonString - The raw JSON string to parse.
 * @param studentId - An identifier for the student (e.g., filename).
 * @returns A ParseResult with success/failure and extracted rows.
 */
export function parseProgressJson(jsonString: string, studentId: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return {
      success: false,
      studentId,
      rows: [],
      error: 'Invalid JSON format',
    }
  }

  if (!isValidProgressData(parsed)) {
    return {
      success: false,
      studentId,
      rows: [],
      error: 'Invalid progress data schema',
    }
  }

  const rows = extractRows(parsed, studentId)
  return {
    success: true,
    studentId,
    rows,
  }
}

/**
 * Extract summary rows from validated progress data.
 */
function extractRows(data: ProgressData, studentId: string): StudentProgressRow[] {
  const rows: StudentProgressRow[] = []

  for (const [episodeId, episodeData] of Object.entries(data.episodes)) {
    if (!episodeData) continue
    const ep = episodeData as EpisodeData
    const completedMissions = Object.keys(ep.missions)
    rows.push({
      studentId,
      episodeId,
      completedMissions,
      totalMissions: completedMissions.length,
      lastVisit: ep.visit?.lastVisit ?? null,
    })
  }

  return rows
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

/**
 * Convert an array of StudentProgressRow into CSV format.
 *
 * @param rows - The rows to convert.
 * @returns A CSV string.
 */
export function exportToCsv(rows: readonly StudentProgressRow[]): string {
  const header = 'Student ID,Episode,Completed Missions,Total Completed,Last Visit'
  const lines = rows.map((row) => {
    const missions = row.completedMissions.join('; ')
    const lastVisit = row.lastVisit ?? 'N/A'
    return `"${row.studentId}","${row.episodeId}","${missions}",${row.totalMissions},"${lastVisit}"`
  })
  return [header, ...lines].join('\n')
}
