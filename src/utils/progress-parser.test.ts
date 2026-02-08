import { describe, it, expect } from 'vitest'
import { parseProgressJson, isValidProgressData, exportToCsv } from './progress-parser.ts'

describe('progress-parser', () => {
  const validProgressJson = JSON.stringify({
    version: 1,
    episodes: {
      'orbit-lab': {
        missions: {
          'first-orbit': { completedAt: '2024-01-15T10:00:00.000Z' },
          'crash-course': { completedAt: '2024-01-15T10:30:00.000Z' },
        },
        visit: {
          firstVisit: '2024-01-15T09:00:00.000Z',
          lastVisit: '2024-01-15T11:00:00.000Z',
        },
      },
      'market-lab': {
        missions: {
          'supply-demand': { completedAt: '2024-01-16T10:00:00.000Z' },
        },
      },
    },
    lastSessionTimestamp: '2024-01-16T12:00:00.000Z',
  })

  describe('isValidProgressData', () => {
    it('returns true for valid progress data', () => {
      const parsed = JSON.parse(validProgressJson)
      expect(isValidProgressData(parsed)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isValidProgressData(null)).toBe(false)
    })

    it('returns false for a string', () => {
      expect(isValidProgressData('hello')).toBe(false)
    })

    it('returns false for a number', () => {
      expect(isValidProgressData(42)).toBe(false)
    })

    it('returns false for an object without version', () => {
      expect(isValidProgressData({ episodes: {} })).toBe(false)
    })

    it('returns false for an object without episodes', () => {
      expect(isValidProgressData({ version: 1 })).toBe(false)
    })

    it('returns false for an object with non-object episodes', () => {
      expect(isValidProgressData({ version: 1, episodes: 'bad' })).toBe(false)
    })

    it('returns false when episode data has non-object missions', () => {
      expect(
        isValidProgressData({
          version: 1,
          episodes: { 'orbit-lab': { missions: 'not-an-object' } },
        }),
      ).toBe(false)
    })
  })

  describe('parseProgressJson', () => {
    it('successfully parses valid progress JSON', () => {
      const result = parseProgressJson(validProgressJson, 'student-1')
      expect(result.success).toBe(true)
      expect(result.studentId).toBe('student-1')
      expect(result.rows.length).toBe(2)
    })

    it('extracts correct mission data from orbit-lab', () => {
      const result = parseProgressJson(validProgressJson, 'student-1')
      const orbitRow = result.rows.find((r) => r.episodeId === 'orbit-lab')
      expect(orbitRow).toBeDefined()
      expect(orbitRow!.completedMissions).toContain('first-orbit')
      expect(orbitRow!.completedMissions).toContain('crash-course')
      expect(orbitRow!.totalMissions).toBe(2)
      expect(orbitRow!.lastVisit).toBe('2024-01-15T11:00:00.000Z')
    })

    it('returns null lastVisit when visit data is missing', () => {
      const result = parseProgressJson(validProgressJson, 'student-1')
      const marketRow = result.rows.find((r) => r.episodeId === 'market-lab')
      expect(marketRow).toBeDefined()
      expect(marketRow!.lastVisit).toBeNull()
    })

    it('returns error for invalid JSON', () => {
      const result = parseProgressJson('not json {{{', 'student-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid JSON format')
      expect(result.rows).toHaveLength(0)
    })

    it('returns error for valid JSON but invalid schema', () => {
      const result = parseProgressJson(JSON.stringify({ foo: 'bar' }), 'student-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid progress data schema')
      expect(result.rows).toHaveLength(0)
    })

    it('returns empty rows for progress data with no episodes', () => {
      const json = JSON.stringify({
        version: 1,
        episodes: {},
        lastSessionTimestamp: null,
      })
      const result = parseProgressJson(json, 'student-1')
      expect(result.success).toBe(true)
      expect(result.rows).toHaveLength(0)
    })
  })

  describe('exportToCsv', () => {
    it('produces a CSV with header and data rows', () => {
      const result = parseProgressJson(validProgressJson, 'student-1')
      const csv = exportToCsv(result.rows)
      const lines = csv.split('\n')
      expect(lines[0]).toBe('Student ID,Episode,Completed Missions,Total Completed,Last Visit')
      expect(lines.length).toBe(3) // header + 2 data rows
    })

    it('returns only the header for an empty row set', () => {
      const csv = exportToCsv([])
      const lines = csv.split('\n')
      expect(lines.length).toBe(1)
      expect(lines[0]).toContain('Student ID')
    })

    it('escapes values properly in CSV', () => {
      const csv = exportToCsv([
        {
          studentId: 'student-1',
          episodeId: 'orbit-lab',
          completedMissions: ['first-orbit', 'crash-course'],
          totalMissions: 2,
          lastVisit: '2024-01-15T11:00:00.000Z',
        },
      ])
      expect(csv).toContain('"student-1"')
      expect(csv).toContain('"orbit-lab"')
      expect(csv).toContain('first-orbit; crash-course')
    })
  })
})
