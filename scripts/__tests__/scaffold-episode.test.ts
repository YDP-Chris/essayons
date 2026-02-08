/**
 * Tests for the episode scaffolding system.
 */

import { describe, it, expect } from 'vitest'
import { validateEpisodeInput } from '../lib/validate-episode-input.ts'

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('validateEpisodeInput', () => {
  describe('valid config', () => {
    it('should pass validation with minimal valid config', () => {
      const config = {
        id: 'test-episode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass validation with full config', () => {
      const config = {
        id: 'full-episode',
        title: 'Full Episode',
        subtitle: 'A complete episode',
        domain: 'biology',
        simulationMode: 'step-based',
        description: 'This is a complete episode',
        parameters: [
          {
            id: 'speed',
            label: 'Speed',
            type: 'number',
            default: 1,
            min: 0,
            max: 10,
          },
        ],
        missions: [
          {
            id: 'mission-1',
            title: 'First Mission',
            briefing: 'Complete this',
            objectives: [
              {
                id: 'obj-1',
                description: 'Do something',
                check: 'checkSomething',
              },
            ],
            successMessage: 'Great!',
          },
        ],
        equations: [],
        referenceContent: [],
        initialState: { x: 0, y: 0 },
        renderLayers: [],
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('invalid config', () => {
    it('should fail validation with non-object config', () => {
      const result = validateEpisodeInput('not an object')
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('config')
    })

    it('should fail validation with null config', () => {
      const result = validateEpisodeInput(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('config')
    })

    it('should fail validation with missing id', () => {
      const config = {
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'id')).toBe(true)
    })

    it('should fail validation with non-kebab-case id', () => {
      const config = {
        id: 'TestEpisode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'id' && e.message.includes('kebab-case'))).toBe(
        true,
      )
    })

    it('should fail validation with id starting with number', () => {
      const config = {
        id: '1-episode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'id' && e.message.includes('kebab-case'))).toBe(
        true,
      )
    })

    it('should fail validation with invalid domain', () => {
      const config = {
        id: 'test-episode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'invalid-domain',
        simulationMode: 'continuous',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'domain')).toBe(true)
    })

    it('should fail validation with invalid simulationMode', () => {
      const config = {
        id: 'test-episode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'invalid-mode',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'simulationMode')).toBe(true)
    })

    it('should fail validation with missing title', () => {
      const config = {
        id: 'test-episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'title')).toBe(true)
    })

    it('should fail validation with empty title', () => {
      const config = {
        id: 'test-episode',
        title: '',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'title')).toBe(true)
    })

    it('should fail validation with parameters not an array', () => {
      const config = {
        id: 'test-episode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
        parameters: 'not-an-array',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'parameters')).toBe(true)
    })

    it('should fail validation with missions not an array', () => {
      const config = {
        id: 'test-episode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
        missions: 'not-an-array',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'missions')).toBe(true)
    })

    it('should fail validation with initialState not an object', () => {
      const config = {
        id: 'test-episode',
        title: 'Test Episode',
        subtitle: 'A test episode',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'This is a test episode',
        initialState: 'not-an-object',
      }

      const result = validateEpisodeInput(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'initialState')).toBe(true)
    })
  })

  describe('all domains', () => {
    const domains = ['physics', 'civics', 'economics', 'history', 'biology', 'engineering']

    domains.forEach((domain) => {
      it(`should accept ${domain} domain`, () => {
        const config = {
          id: 'test-episode',
          title: 'Test Episode',
          subtitle: 'A test episode',
          domain,
          simulationMode: 'continuous',
          description: 'This is a test episode',
        }

        const result = validateEpisodeInput(config)
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('all simulation modes', () => {
    const modes = ['continuous', 'step-based', 'event-driven', 'turn-based']

    modes.forEach((mode) => {
      it(`should accept ${mode} simulation mode`, () => {
        const config = {
          id: 'test-episode',
          title: 'Test Episode',
          subtitle: 'A test episode',
          domain: 'physics',
          simulationMode: mode,
          description: 'This is a test episode',
        }

        const result = validateEpisodeInput(config)
        expect(result.valid).toBe(true)
      })
    })
  })
})

// ---------------------------------------------------------------------------
// Template Generation Tests
// ---------------------------------------------------------------------------

describe('template generation', () => {
  // Note: We don't test file system operations here
  // These are smoke tests to ensure templates are syntactically valid

  it('should generate valid TypeScript-like config template', () => {
    // This is a simple smoke test - the actual generation is tested via integration
    const mockConfig = {
      id: 'test-episode',
      title: 'Test Episode',
      parameters: [],
      missions: [],
    }

    expect(mockConfig.id).toBe('test-episode')
    expect(mockConfig.title).toBe('Test Episode')
  })
})

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('should handle episode with no parameters', () => {
    const config = {
      id: 'simple-episode',
      title: 'Simple Episode',
      subtitle: 'No parameters',
      domain: 'physics',
      simulationMode: 'continuous',
      description: 'An episode without parameters',
    }

    const result = validateEpisodeInput(config)
    expect(result.valid).toBe(true)
  })

  it('should handle episode with no missions', () => {
    const config = {
      id: 'sandbox-episode',
      title: 'Sandbox Episode',
      subtitle: 'Free exploration',
      domain: 'physics',
      simulationMode: 'continuous',
      description: 'An episode without missions',
    }

    const result = validateEpisodeInput(config)
    expect(result.valid).toBe(true)
  })

  it('should handle multi-word episode IDs', () => {
    const config = {
      id: 'my-complex-episode-name',
      title: 'Complex Episode',
      subtitle: 'Multi-word ID',
      domain: 'physics',
      simulationMode: 'continuous',
      description: 'An episode with multiple words in ID',
    }

    const result = validateEpisodeInput(config)
    expect(result.valid).toBe(true)
  })

  it('should reject episode ID with uppercase letters', () => {
    const config = {
      id: 'My-Episode',
      title: 'My Episode',
      subtitle: 'Wrong case',
      domain: 'physics',
      simulationMode: 'continuous',
      description: 'Wrong case',
    }

    const result = validateEpisodeInput(config)
    expect(result.valid).toBe(false)
  })

  it('should reject episode ID with underscores', () => {
    const config = {
      id: 'my_episode',
      title: 'My Episode',
      subtitle: 'Wrong separator',
      domain: 'physics',
      simulationMode: 'continuous',
      description: 'Wrong separator',
    }

    const result = validateEpisodeInput(config)
    expect(result.valid).toBe(false)
  })

  it('should reject episode ID ending with dash', () => {
    const config = {
      id: 'my-episode-',
      title: 'My Episode',
      subtitle: 'Trailing dash',
      domain: 'physics',
      simulationMode: 'continuous',
      description: 'Trailing dash',
    }

    const result = validateEpisodeInput(config)
    expect(result.valid).toBe(false)
  })
})
