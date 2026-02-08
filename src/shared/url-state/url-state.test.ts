import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ParameterSchema, ParameterValues } from './types.ts'
import { COMPRESSED_PARAM_KEY } from './types.ts'
import { encodeState, decodeState } from './codec.ts'
import { validateParams } from './validator.ts'
import {
  registerEpisodeParams,
  getEpisodeParams,
  unregisterEpisodeParams,
  clearRegistry,
  ORBIT_LAB_PARAMS,
} from './registry.ts'

// ---------------------------------------------------------------------------
// Shared test schemas
// ---------------------------------------------------------------------------

const testSchemas: readonly ParameterSchema[] = [
  {
    type: 'number',
    key: 'angle',
    label: 'Angle',
    default: 45,
    min: 0,
    max: 360,
    alias: 'a',
  },
  {
    type: 'number',
    key: 'velocity',
    label: 'Velocity',
    default: 7800,
    min: 0,
    max: 20000,
    alias: 'v',
  },
  {
    type: 'boolean',
    key: 'showTrail',
    label: 'Show Trail',
    default: true,
    alias: 'st',
  },
  {
    type: 'enum',
    key: 'mission',
    label: 'Mission',
    options: ['freeplay', 'leo', 'geo', 'escape'],
    default: 'freeplay',
    alias: 'm',
  },
  {
    type: 'string',
    key: 'label',
    label: 'Label',
    default: '',
    alias: 'l',
  },
] as const

// ---------------------------------------------------------------------------
// 1. Parameter Registry
// ---------------------------------------------------------------------------

describe('ParameterRegistry', () => {
  beforeEach(() => {
    clearRegistry()
  })

  it('registers and retrieves episode parameters', () => {
    registerEpisodeParams('test-ep', testSchemas)
    const result = getEpisodeParams('test-ep')
    expect(result).toBe(testSchemas)
  })

  it('returns undefined for unregistered episodes', () => {
    expect(getEpisodeParams('nonexistent')).toBeUndefined()
  })

  it('unregisters episode parameters', () => {
    registerEpisodeParams('test-ep', testSchemas)
    unregisterEpisodeParams('test-ep')
    expect(getEpisodeParams('test-ep')).toBeUndefined()
  })

  it('clears all registered episodes', () => {
    registerEpisodeParams('ep1', testSchemas)
    registerEpisodeParams('ep2', testSchemas)
    clearRegistry()
    expect(getEpisodeParams('ep1')).toBeUndefined()
    expect(getEpisodeParams('ep2')).toBeUndefined()
  })

  it('has Orbit Lab params pre-defined', () => {
    expect(ORBIT_LAB_PARAMS).toBeDefined()
    expect(ORBIT_LAB_PARAMS.length).toBeGreaterThan(0)
    // Verify orbit-lab is registered (side-effect of importing registry)
    registerEpisodeParams('orbit-lab', ORBIT_LAB_PARAMS)
    expect(getEpisodeParams('orbit-lab')).toBe(ORBIT_LAB_PARAMS)
  })
})

// ---------------------------------------------------------------------------
// 2. URL State Codec — Encode
// ---------------------------------------------------------------------------

describe('encodeState', () => {
  it('encodes non-default values using aliases', () => {
    const params: ParameterValues = {
      angle: 90,
      velocity: 7800, // default — should be omitted
      showTrail: true, // default — should be omitted
      mission: 'freeplay', // default — should be omitted
      label: '', // default — should be omitted
    }
    const result = encodeState(params, testSchemas)
    expect(result).toContain('a=90')
    expect(result).not.toContain('v=')
    expect(result).not.toContain('st=')
    expect(result).not.toContain('m=')
    expect(result).not.toContain('l=')
  })

  it('omits all parameters when all match defaults', () => {
    const params: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
    }
    const result = encodeState(params, testSchemas)
    expect(result).toBe('')
  })

  it('encodes multiple non-default values', () => {
    const params: ParameterValues = {
      angle: 90,
      velocity: 5000,
      showTrail: false,
      mission: 'leo',
      label: 'test',
    }
    const result = encodeState(params, testSchemas)
    expect(result).toContain('a=90')
    expect(result).toContain('v=5000')
    expect(result).toContain('st=0')
    expect(result).toContain('m=leo')
    expect(result).toContain('l=test')
  })

  it('encodes booleans as 1 and 0', () => {
    const params: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: false,
      mission: 'freeplay',
      label: '',
    }
    const result = encodeState(params, testSchemas)
    expect(result).toBe('st=0')
  })

  it('ignores unknown parameters not in schema', () => {
    const params: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
      unknown: 42,
    }
    const result = encodeState(params, testSchemas)
    expect(result).not.toContain('unknown')
  })
})

// ---------------------------------------------------------------------------
// 3. URL State Codec — Decode
// ---------------------------------------------------------------------------

describe('decodeState', () => {
  it('decodes aliased parameters from query string', () => {
    const result = decodeState('a=90&v=5000', testSchemas)
    expect(result['angle']).toBe(90)
    expect(result['velocity']).toBe(5000)
  })

  it('fills in defaults for missing parameters', () => {
    const result = decodeState('a=90', testSchemas)
    expect(result['angle']).toBe(90)
    expect(result['velocity']).toBe(7800) // default
    expect(result['showTrail']).toBe(true) // default
    expect(result['mission']).toBe('freeplay') // default
    expect(result['label']).toBe('') // default
  })

  it('decodes from full URL with query string', () => {
    const result = decodeState('https://essayons.app/orbit-lab?a=120&m=geo', testSchemas)
    expect(result['angle']).toBe(120)
    expect(result['mission']).toBe('geo')
    expect(result['velocity']).toBe(7800)
  })

  it('decodes boolean values from 1/0', () => {
    const result = decodeState('st=0', testSchemas)
    expect(result['showTrail']).toBe(false)
  })

  it('decodes boolean values from true/false strings', () => {
    const result = decodeState('st=true', testSchemas)
    expect(result['showTrail']).toBe(true)

    const result2 = decodeState('st=false', testSchemas)
    expect(result2['showTrail']).toBe(false)
  })

  it('returns all defaults for empty query string', () => {
    const result = decodeState('', testSchemas)
    expect(result['angle']).toBe(45)
    expect(result['velocity']).toBe(7800)
    expect(result['showTrail']).toBe(true)
    expect(result['mission']).toBe('freeplay')
    expect(result['label']).toBe('')
  })

  it('ignores unknown query parameters', () => {
    const result = decodeState('a=90&unknown=42', testSchemas)
    expect(result['angle']).toBe(90)
    expect(result['unknown']).toBeUndefined()
  })

  it('returns defaults for invalid number values', () => {
    const result = decodeState('a=not_a_number', testSchemas)
    expect(result['angle']).toBe(45) // default, since "not_a_number" won't parse
  })

  it('returns defaults for invalid boolean values', () => {
    const result = decodeState('st=maybe', testSchemas)
    // "maybe" doesn't match 1/0/true/false, so parseValue returns undefined -> default
    expect(result['showTrail']).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. Encode/Decode Round-Trip
// ---------------------------------------------------------------------------

describe('encode/decode round-trip', () => {
  it('round-trips non-default values correctly', () => {
    const original: ParameterValues = {
      angle: 120,
      velocity: 5000,
      showTrail: false,
      mission: 'geo',
      label: 'my-test',
    }
    const encoded = encodeState(original, testSchemas)
    const decoded = decodeState(encoded, testSchemas)
    expect(decoded['angle']).toBe(120)
    expect(decoded['velocity']).toBe(5000)
    expect(decoded['showTrail']).toBe(false)
    expect(decoded['mission']).toBe('geo')
    expect(decoded['label']).toBe('my-test')
  })

  it('round-trips all-default values correctly', () => {
    const original: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
    }
    const encoded = encodeState(original, testSchemas)
    expect(encoded).toBe('') // all defaults omitted
    const decoded = decodeState(encoded, testSchemas)
    expect(decoded['angle']).toBe(45)
    expect(decoded['velocity']).toBe(7800)
    expect(decoded['showTrail']).toBe(true)
    expect(decoded['mission']).toBe('freeplay')
    expect(decoded['label']).toBe('')
  })

  it('round-trips with only some non-defaults', () => {
    const original: ParameterValues = {
      angle: 45, // default
      velocity: 10000, // non-default
      showTrail: true, // default
      mission: 'escape', // non-default
      label: '', // default
    }
    const encoded = encodeState(original, testSchemas)
    const decoded = decodeState(encoded, testSchemas)
    expect(decoded['angle']).toBe(45)
    expect(decoded['velocity']).toBe(10000)
    expect(decoded['showTrail']).toBe(true)
    expect(decoded['mission']).toBe('escape')
    expect(decoded['label']).toBe('')
  })
})

// ---------------------------------------------------------------------------
// 5. Compressed Encoding
// ---------------------------------------------------------------------------

describe('compressed encoding', () => {
  it('decodes compressed state from s= parameter', () => {
    const data = { angle: 90, velocity: 5000 }
    const compressed = btoa(JSON.stringify(data))
    const query = `${COMPRESSED_PARAM_KEY}=${encodeURIComponent(compressed)}`
    const decoded = decodeState(query, testSchemas)
    expect(decoded['angle']).toBe(90)
    expect(decoded['velocity']).toBe(5000)
    expect(decoded['showTrail']).toBe(true) // default
  })

  it('returns defaults for invalid compressed data', () => {
    const query = `${COMPRESSED_PARAM_KEY}=not-valid-base64!!!`
    const decoded = decodeState(query, testSchemas)
    expect(decoded['angle']).toBe(45)
    expect(decoded['velocity']).toBe(7800)
  })

  it('returns defaults for compressed non-object JSON', () => {
    const compressed = btoa('"just a string"')
    const query = `${COMPRESSED_PARAM_KEY}=${encodeURIComponent(compressed)}`
    const decoded = decodeState(query, testSchemas)
    expect(decoded['angle']).toBe(45)
  })
})

// ---------------------------------------------------------------------------
// 6. Parameter Validation
// ---------------------------------------------------------------------------

describe('validateParams', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('returns defaults for missing parameters', () => {
    const { params, warnings } = validateParams({}, testSchemas)
    expect(params['angle']).toBe(45)
    expect(params['velocity']).toBe(7800)
    expect(params['showTrail']).toBe(true)
    expect(params['mission']).toBe('freeplay')
    expect(params['label']).toBe('')
    expect(warnings).toHaveLength(0)
  })

  it('passes through valid values unchanged', () => {
    const input: ParameterValues = {
      angle: 90,
      velocity: 5000,
      showTrail: false,
      mission: 'leo',
      label: 'test',
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['angle']).toBe(90)
    expect(params['velocity']).toBe(5000)
    expect(params['showTrail']).toBe(false)
    expect(params['mission']).toBe('leo')
    expect(params['label']).toBe('test')
    expect(warnings).toHaveLength(0)
  })

  it('clamps numbers below min to min', () => {
    const input: ParameterValues = {
      angle: -10,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['angle']).toBe(0)
    expect(warnings).toContain('angle')
  })

  it('clamps numbers above max to max', () => {
    const input: ParameterValues = {
      angle: 500,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['angle']).toBe(360)
    expect(warnings).toContain('angle')
  })

  it('replaces wrong-type number with default', () => {
    const input: ParameterValues = {
      angle: 'not-a-number' as unknown as number,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['angle']).toBe(45)
    expect(warnings).toContain('angle')
  })

  it('replaces wrong-type boolean with default', () => {
    const input: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: 'yes' as unknown as boolean,
      mission: 'freeplay',
      label: '',
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['showTrail']).toBe(true)
    expect(warnings).toContain('showTrail')
  })

  it('replaces invalid enum value with default', () => {
    const input: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: true,
      mission: 'invalid-mission',
      label: '',
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['mission']).toBe('freeplay')
    expect(warnings).toContain('mission')
  })

  it('replaces wrong-type enum value with default', () => {
    const input: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: true,
      mission: 42 as unknown as string,
      label: '',
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['mission']).toBe('freeplay')
    expect(warnings).toContain('mission')
  })

  it('replaces wrong-type string value with default', () => {
    const input: ParameterValues = {
      angle: 45,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: 123 as unknown as string,
    }
    const { params, warnings } = validateParams(input, testSchemas)
    expect(params['label']).toBe('')
    expect(warnings).toContain('label')
  })

  it('silently drops unknown parameters', () => {
    const input: ParameterValues = {
      angle: 90,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
      unknownParam: 999,
    }
    const { params } = validateParams(input, testSchemas)
    // unknownParam should not appear in output
    expect(params['unknownParam']).toBeUndefined()
    expect(params['angle']).toBe(90)
  })

  it('logs warnings to console for invalid parameters', () => {
    const consoleSpy = vi.spyOn(console, 'warn')
    const input: ParameterValues = {
      angle: -10,
      velocity: 7800,
      showTrail: true,
      mission: 'freeplay',
      label: '',
    }
    validateParams(input, testSchemas)
    expect(consoleSpy).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// 7. Full pipeline: decode -> validate
// ---------------------------------------------------------------------------

describe('decode + validate pipeline', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('handles out-of-range values in URL by clamping', () => {
    const decoded = decodeState('a=500&v=-100', testSchemas)
    const { params } = validateParams(decoded, testSchemas)
    expect(params['angle']).toBe(360) // clamped to max
    expect(params['velocity']).toBe(0) // clamped to min
  })

  it('handles completely invalid URL gracefully', () => {
    const decoded = decodeState('garbage=!!&=&a=&v=abc', testSchemas)
    const { params } = validateParams(decoded, testSchemas)
    // 'a=' parses as 0 (Number('') === 0), which is valid min
    expect(params['angle']).toBe(0)
    // 'v=abc' is NaN -> default
    expect(params['velocity']).toBe(7800)
    expect(params['showTrail']).toBe(true)
    expect(params['mission']).toBe('freeplay')
  })
})
