import { describe, it, expect } from 'vitest'
import {
  encodeLessonPlan,
  decodeLessonPlan,
  buildLessonPlanUrl,
  LESSON_PLAN_VERSION,
} from './lesson-plan-codec.ts'
import type { LessonPlanConfig } from './lesson-plan-codec.ts'

describe('lesson-plan-codec', () => {
  const sampleConfig: LessonPlanConfig = {
    version: LESSON_PLAN_VERSION,
    title: 'My Lesson Plan',
    episodes: [
      {
        episodeId: 'orbit-lab',
        missions: ['first-orbit', 'crash-course'],
      },
      {
        episodeId: 'market-lab',
        missions: ['supply-demand'],
        parameters: { difficulty: 'hard' },
      },
    ],
    sequenceOrder: ['orbit-lab', 'market-lab'],
  }

  describe('encode/decode round-trip', () => {
    it('round-trips a lesson plan config', () => {
      const encoded = encodeLessonPlan(sampleConfig)
      const decoded = decodeLessonPlan(encoded)
      expect(decoded).toEqual(sampleConfig)
    })

    it('round-trips an empty config', () => {
      const emptyConfig: LessonPlanConfig = {
        version: LESSON_PLAN_VERSION,
        title: '',
        episodes: [],
        sequenceOrder: [],
      }
      const encoded = encodeLessonPlan(emptyConfig)
      const decoded = decodeLessonPlan(encoded)
      expect(decoded).toEqual(emptyConfig)
    })

    it('round-trips a config with special characters in the title', () => {
      const config: LessonPlanConfig = {
        version: LESSON_PLAN_VERSION,
        title: 'Physics & Chemistry: Forces + Reactions (2024)',
        episodes: [{ episodeId: 'orbit-lab', missions: [] }],
        sequenceOrder: ['orbit-lab'],
      }
      const encoded = encodeLessonPlan(config)
      const decoded = decodeLessonPlan(encoded)
      expect(decoded).toEqual(config)
    })

    it('round-trips a config with unicode characters', () => {
      const config: LessonPlanConfig = {
        version: LESSON_PLAN_VERSION,
        title: 'Physique des orbites \u2014 le\u00E7on',
        episodes: [],
        sequenceOrder: [],
      }
      const encoded = encodeLessonPlan(config)
      const decoded = decodeLessonPlan(encoded)
      expect(decoded).toEqual(config)
    })
  })

  describe('encodeLessonPlan', () => {
    it('returns a URL-safe string (no +, /, or = characters)', () => {
      const encoded = encodeLessonPlan(sampleConfig)
      expect(encoded).not.toMatch(/[+/=]/)
    })

    it('returns a non-empty string', () => {
      const encoded = encodeLessonPlan(sampleConfig)
      expect(encoded.length).toBeGreaterThan(0)
    })
  })

  describe('decodeLessonPlan', () => {
    it('returns null for invalid base64', () => {
      expect(decodeLessonPlan('!!!not-valid-base64!!!')).toBeNull()
    })

    it('returns null for valid base64 but invalid JSON', () => {
      const encoded = btoa('not json')
      expect(decodeLessonPlan(encoded)).toBeNull()
    })

    it('returns null for valid JSON but invalid schema', () => {
      const encoded = btoa(JSON.stringify({ foo: 'bar' }))
      expect(decodeLessonPlan(encoded)).toBeNull()
    })

    it('returns null for JSON missing episodes array', () => {
      const encoded = btoa(
        JSON.stringify({
          version: 1,
          title: 'Test',
          sequenceOrder: [],
        }),
      )
      expect(decodeLessonPlan(encoded)).toBeNull()
    })

    it('returns null for JSON with non-string episodeId', () => {
      const encoded = btoa(
        JSON.stringify({
          version: 1,
          title: 'Test',
          episodes: [{ episodeId: 123, missions: [] }],
          sequenceOrder: [],
        }),
      )
      expect(decodeLessonPlan(encoded)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(decodeLessonPlan('')).toBeNull()
    })
  })

  describe('buildLessonPlanUrl', () => {
    it('returns a URL containing #/teach?plan=', () => {
      const url = buildLessonPlanUrl(sampleConfig)
      expect(url).toContain('#/teach?plan=')
    })

    it('URL-encoded plan decodes back to original config', () => {
      const url = buildLessonPlanUrl(sampleConfig)
      const planParam = url.split('plan=')[1]
      expect(planParam).toBeDefined()
      const decoded = decodeLessonPlan(planParam!)
      expect(decoded).toEqual(sampleConfig)
    })
  })
})
