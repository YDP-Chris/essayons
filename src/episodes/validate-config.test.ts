/**
 * Unit tests for EpisodeConfig validation.
 */

import { describe, it, expect } from 'vitest'
import { validateConfig } from './validate-config.ts'
import type { EpisodeConfig } from './types.ts'

// ---------------------------------------------------------------------------
// Test fixture: a valid, minimal EpisodeConfig
// ---------------------------------------------------------------------------

function createValidConfig(overrides?: Partial<EpisodeConfig>): EpisodeConfig {
  return {
    id: 'test-episode',
    title: 'Test Episode',
    subtitle: 'A test subtitle',
    domain: 'physics',
    simulationMode: 'continuous',
    description: 'A test episode description',
    parameters: [
      {
        id: 'gravity',
        label: 'Gravity',
        type: 'number',
        default: 9.81,
        min: 0,
        max: 20,
        step: 0.01,
        unit: 'm/s\u00B2',
        description: 'Gravitational acceleration',
      },
      {
        id: 'show-vectors',
        label: 'Show Vectors',
        type: 'boolean',
        default: true,
      },
      {
        id: 'material',
        label: 'Material',
        type: 'enum',
        default: 'steel',
        options: ['steel', 'wood', 'rubber'],
      },
    ],
    equations: [
      {
        id: 'eq-gravity',
        label: 'Gravitational Force',
        latex: 'F = mg',
        description: 'Force due to gravity',
        variables: { F: 'Force (N)', m: 'Mass (kg)', g: 'Gravity (m/s\u00B2)' },
      },
    ],
    missions: [
      {
        id: 'mission-1',
        title: 'First Mission',
        briefing: 'Complete the first objective.',
        objectives: [
          {
            id: 'obj-1',
            description: 'Reach the target',
            check: 'checkReachTarget',
            target: 100,
            tolerance: 5,
          },
        ],
        hints: ['Try increasing gravity.'],
        successMessage: 'Great job!',
      },
    ],
    referenceContent: [
      {
        id: 'ref-gravity',
        title: 'What is Gravity?',
        content: 'Gravity is a force that attracts objects toward each other.',
        category: 'concept',
      },
    ],
    initialState: { position: 0, velocity: 0 },
    renderLayers: [
      {
        id: 'background',
        zIndex: 0,
        render: 'renderBackground',
      },
    ],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateConfig', () => {
  describe('valid configs', () => {
    it('should accept a complete, valid config', () => {
      const result = validateConfig(createValidConfig())
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept all valid domains', () => {
      const domains = [
        'physics',
        'civics',
        'economics',
        'history',
        'biology',
        'engineering',
      ] as const

      for (const domain of domains) {
        const result = validateConfig(createValidConfig({ domain }))
        expect(result.valid).toBe(true)
      }
    })

    it('should accept all valid simulation modes', () => {
      const modes = ['continuous', 'step-based', 'event-driven', 'turn-based'] as const

      for (const simulationMode of modes) {
        const result = validateConfig(createValidConfig({ simulationMode }))
        expect(result.valid).toBe(true)
      }
    })
  })

  describe('missing required fields', () => {
    it('should reject non-object config', () => {
      const result = validateConfig(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Config must be a non-null object')
    })

    it('should reject config with missing id', () => {
      const config = createValidConfig()
      const broken = { ...config, id: '' }
      const result = validateConfig(broken)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('"id"'))).toBe(true)
    })

    it('should reject config with missing title', () => {
      const config = createValidConfig()
      const broken = { ...config, title: '' }
      const result = validateConfig(broken)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('"title"'))).toBe(true)
    })

    it('should reject config with missing description', () => {
      const config = createValidConfig()
      const broken = { ...config, description: '' }
      const result = validateConfig(broken)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('"description"'))).toBe(true)
    })

    it('should reject config with missing subtitle', () => {
      const config = createValidConfig()
      const broken = { ...config, subtitle: '' }
      const result = validateConfig(broken)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('"subtitle"'))).toBe(true)
    })

    it('should reject config with invalid domain', () => {
      const config = createValidConfig()
      const broken = { ...config, domain: 'astrology' as 'physics' }
      const result = validateConfig(broken)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('domain'))).toBe(true)
    })

    it('should reject config with invalid simulationMode', () => {
      const config = createValidConfig()
      const broken = { ...config, simulationMode: 'realtime' as 'continuous' }
      const result = validateConfig(broken)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('simulationMode'))).toBe(true)
    })
  })

  describe('parameter validation', () => {
    it('should reject number parameter with non-number default', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'bad-param',
            label: 'Bad',
            type: 'number',
            default: 'not-a-number',
            min: 0,
            max: 10,
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('bad-param') && e.includes('number'))).toBe(true)
    })

    it('should reject number parameter with default below min', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'below-min',
            label: 'Below Min',
            type: 'number',
            default: -5,
            min: 0,
            max: 10,
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('below-min') && e.includes('less than min')),
      ).toBe(true)
    })

    it('should reject number parameter with default above max', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'above-max',
            label: 'Above Max',
            type: 'number',
            default: 15,
            min: 0,
            max: 10,
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('above-max') && e.includes('greater than max')),
      ).toBe(true)
    })

    it('should reject number parameter with min > max', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'inverted',
            label: 'Inverted',
            type: 'number',
            default: 5,
            min: 10,
            max: 0,
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('inverted') && e.includes('min'))).toBe(true)
    })

    it('should reject number parameter with non-positive step', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'bad-step',
            label: 'Bad Step',
            type: 'number',
            default: 5,
            min: 0,
            max: 10,
            step: -1,
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('bad-step') && e.includes('step'))).toBe(true)
    })

    it('should reject boolean parameter with non-boolean default', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'bad-bool',
            label: 'Bad Bool',
            type: 'boolean',
            default: 'yes',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('bad-bool') && e.includes('boolean'))).toBe(true)
    })

    it('should reject enum parameter with default not in options', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'bad-enum',
            label: 'Bad Enum',
            type: 'enum',
            default: 'plastic',
            options: ['steel', 'wood'],
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('bad-enum') && e.includes('not in options')),
      ).toBe(true)
    })

    it('should reject enum parameter with empty options', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'empty-enum',
            label: 'Empty Enum',
            type: 'enum',
            default: 'something',
            options: [],
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('empty-enum') && e.includes('non-empty options')),
      ).toBe(true)
    })

    it('should reject vector2 parameter with invalid default', () => {
      const config = createValidConfig({
        parameters: [
          {
            id: 'bad-vec',
            label: 'Bad Vector',
            type: 'vector2',
            default: 42,
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('bad-vec') && e.includes('vector2'))).toBe(true)
    })
  })

  describe('duplicate IDs', () => {
    it('should reject duplicate parameter IDs', () => {
      const config = createValidConfig({
        parameters: [
          { id: 'dupe', label: 'First', type: 'number', default: 1, min: 0, max: 10 },
          { id: 'dupe', label: 'Second', type: 'number', default: 2, min: 0, max: 10 },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Duplicate id') && e.includes('dupe'))).toBe(true)
    })

    it('should reject duplicate IDs across different sections', () => {
      const config = createValidConfig({
        parameters: [
          { id: 'shared-id', label: 'Param', type: 'number', default: 1, min: 0, max: 10 },
        ],
        equations: [
          {
            id: 'shared-id',
            label: 'Equation',
            latex: 'x = 1',
            description: 'desc',
            variables: {},
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Duplicate id') && e.includes('shared-id'))).toBe(
        true,
      )
    })

    it('should reject duplicate objective IDs within a mission', () => {
      const config = createValidConfig({
        missions: [
          {
            id: 'mission-dup',
            title: 'Mission',
            briefing: 'Do stuff',
            objectives: [
              { id: 'obj-dup', description: 'First', check: 'check1' },
              { id: 'obj-dup', description: 'Second', check: 'check2' },
            ],
            successMessage: 'Done!',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Duplicate id') && e.includes('obj-dup'))).toBe(
        true,
      )
    })
  })

  describe('mission validation', () => {
    it('should reject mission with empty objectives', () => {
      const config = createValidConfig({
        missions: [
          {
            id: 'empty-mission',
            title: 'Empty Mission',
            briefing: 'Nothing to do',
            objectives: [],
            successMessage: 'Done!',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('empty-mission') && e.includes('at least one')),
      ).toBe(true)
    })

    it('should reject mission with missing title', () => {
      const config = createValidConfig({
        missions: [
          {
            id: 'no-title',
            title: '',
            briefing: 'Some briefing',
            objectives: [{ id: 'obj-ok', description: 'Do it', check: 'checkIt' }],
            successMessage: 'Done!',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('no-title') && e.includes('title'))).toBe(true)
    })

    it('should reject mission with missing briefing', () => {
      const config = createValidConfig({
        missions: [
          {
            id: 'no-briefing',
            title: 'Has Title',
            briefing: '',
            objectives: [{ id: 'obj-ok2', description: 'Do it', check: 'checkIt' }],
            successMessage: 'Done!',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('no-briefing') && e.includes('briefing'))).toBe(
        true,
      )
    })

    it('should reject objective with missing check function', () => {
      const config = createValidConfig({
        missions: [
          {
            id: 'bad-check',
            title: 'Bad Check',
            briefing: 'Briefing',
            objectives: [{ id: 'obj-no-check', description: 'Do it', check: '' }],
            successMessage: 'Done!',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('obj-no-check') && e.includes('check'))).toBe(
        true,
      )
    })
  })

  describe('reference content validation', () => {
    it('should reject reference with invalid category', () => {
      const config = createValidConfig({
        referenceContent: [
          {
            id: 'bad-ref',
            title: 'Bad Ref',
            content: 'Some content',
            category: 'trivia' as 'concept',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('bad-ref') && e.includes('category'))).toBe(true)
    })

    it('should reject reference with empty content', () => {
      const config = createValidConfig({
        referenceContent: [
          {
            id: 'empty-ref',
            title: 'Empty Ref',
            content: '',
            category: 'concept',
          },
        ],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('empty-ref') && e.includes('content'))).toBe(true)
    })
  })

  describe('render layer validation', () => {
    it('should reject render layer with missing render function name', () => {
      const config = createValidConfig({
        renderLayers: [{ id: 'bad-layer', zIndex: 0, render: '' }],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('bad-layer') && e.includes('render'))).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should accept config with empty optional arrays', () => {
      const config = createValidConfig({
        parameters: [],
        equations: [],
        missions: [],
        referenceContent: [],
        renderLayers: [],
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should collect multiple errors at once', () => {
      const config = createValidConfig({
        id: '',
        title: '',
        description: '',
        subtitle: '',
      })
      const result = validateConfig(config)
      expect(result.valid).toBe(false)
      // Should have at least 4 errors for the 4 empty required strings
      expect(result.errors.length).toBeGreaterThanOrEqual(4)
    })
  })
})
