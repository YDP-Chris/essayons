import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SoundSynthesizer } from './SoundSynthesizer.ts'
import type { AudioEngine } from './AudioEngine.ts'

// ---------------------------------------------------------------------------
// Mock infrastructure
// ---------------------------------------------------------------------------

interface MockOscillatorNode {
  type: OscillatorType
  frequency: {
    value: number
    setValueAtTime: ReturnType<typeof vi.fn>
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
  }
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  onended: (() => void) | null
}

interface MockGainNode {
  gain: {
    value: number
    setValueAtTime: ReturnType<typeof vi.fn>
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
  }
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}

interface MockBufferSourceNode {
  buffer: AudioBuffer | null
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  onended: (() => void) | null
}

function createMockOscillator(): MockOscillatorNode {
  return {
    type: 'sine',
    frequency: {
      value: 440,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  }
}

function createMockGainNode(): MockGainNode {
  return {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

function createMockBufferSource(): MockBufferSourceNode {
  return {
    buffer: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  }
}

const oscillators: MockOscillatorNode[] = []
const gainNodes: MockGainNode[] = []
const bufferSources: MockBufferSourceNode[] = []

function createMockEngine(ready: boolean): AudioEngine {
  oscillators.length = 0
  gainNodes.length = 0
  bufferSources.length = 0

  const mockCtx = {
    currentTime: 0,
    sampleRate: 44100,
    createOscillator: vi.fn(() => {
      const osc = createMockOscillator()
      oscillators.push(osc)
      return osc
    }),
    createGain: vi.fn(() => {
      const g = createMockGainNode()
      gainNodes.push(g)
      return g
    }),
    createBufferSource: vi.fn(() => {
      const src = createMockBufferSource()
      bufferSources.push(src)
      return src
    }),
    createBuffer: vi.fn((_channels: number, length: number, sampleRate: number) => ({
      getChannelData: () => new Float32Array(length),
      length,
      sampleRate,
    })),
  } as unknown as AudioContext

  const mockMasterGain = createMockGainNode() as unknown as GainNode

  return {
    getContext: () => mockCtx,
    getMasterGain: () => mockMasterGain,
    isReady: () => ready,
  } as unknown as AudioEngine
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SoundSynthesizer', () => {
  let engine: AudioEngine
  let synth: SoundSynthesizer

  beforeEach(() => {
    engine = createMockEngine(true)
    synth = new SoundSynthesizer(engine)
  })

  // ---- playTone -----------------------------------------------------------

  describe('playTone', () => {
    it('creates an oscillator with the given frequency and type', () => {
      synth.playTone(440, 0.5, 'square')

      expect(oscillators).toHaveLength(1)
      expect(oscillators[0]!.type).toBe('square')
      expect(oscillators[0]!.frequency.value).toBe(440)
    })

    it('connects oscillator -> gain -> master', () => {
      synth.playTone(440, 0.5)

      expect(oscillators[0]!.connect).toHaveBeenCalledWith(gainNodes[0])
      expect(gainNodes[0]!.connect).toHaveBeenCalledWith(engine.getMasterGain())
    })

    it('schedules start and stop', () => {
      synth.playTone(440, 0.5)

      expect(oscillators[0]!.start).toHaveBeenCalled()
      expect(oscillators[0]!.stop).toHaveBeenCalled()
    })

    it('defaults waveform to sine', () => {
      synth.playTone(440, 0.5)
      expect(oscillators[0]!.type).toBe('sine')
    })

    it('does nothing when engine is not ready', () => {
      const notReadyEngine = createMockEngine(false)
      const notReadySynth = new SoundSynthesizer(notReadyEngine)
      notReadySynth.playTone(440, 0.5)
      expect(oscillators).toHaveLength(0)
    })

    it('cleans up nodes via onended callback', () => {
      synth.playTone(440, 0.5)
      oscillators[0]!.onended!()
      expect(oscillators[0]!.disconnect).toHaveBeenCalled()
      expect(gainNodes[0]!.disconnect).toHaveBeenCalled()
    })
  })

  // ---- Preset: launch -----------------------------------------------------

  describe('playLaunch', () => {
    it('creates a sawtooth oscillator with rising frequency', () => {
      synth.playLaunch()

      expect(oscillators).toHaveLength(1)
      expect(oscillators[0]!.type).toBe('sawtooth')
      expect(oscillators[0]!.frequency.setValueAtTime).toHaveBeenCalled()
      expect(oscillators[0]!.frequency.exponentialRampToValueAtTime).toHaveBeenCalled()
    })
  })

  // ---- Preset: collision --------------------------------------------------

  describe('playCollision', () => {
    it('creates a buffer source (noise burst)', () => {
      synth.playCollision()

      expect(bufferSources).toHaveLength(1)
      expect(bufferSources[0]!.start).toHaveBeenCalled()
      expect(bufferSources[0]!.stop).toHaveBeenCalled()
    })
  })

  // ---- Preset: success ----------------------------------------------------

  describe('playSuccess', () => {
    it('creates three oscillators for the major chord', () => {
      synth.playSuccess()
      expect(oscillators).toHaveLength(3)
      // All should be sine
      for (const osc of oscillators) {
        expect(osc.type).toBe('sine')
      }
    })
  })

  // ---- Preset: failure ----------------------------------------------------

  describe('playFailure', () => {
    it('creates three triangle oscillators', () => {
      synth.playFailure()
      expect(oscillators).toHaveLength(3)
      for (const osc of oscillators) {
        expect(osc.type).toBe('triangle')
      }
    })
  })

  // ---- Preset: orbit-achieved ---------------------------------------------

  describe('playOrbitAchieved', () => {
    it('creates two sine oscillators for the chime', () => {
      synth.playOrbitAchieved()
      expect(oscillators).toHaveLength(2)
      for (const osc of oscillators) {
        expect(osc.type).toBe('sine')
      }
    })
  })

  // ---- No-op when engine unavailable --------------------------------------

  describe('no-op when engine has no context', () => {
    it('playLaunch does nothing without context', () => {
      const nullEngine = {
        getContext: () => null,
        getMasterGain: () => null,
        isReady: () => false,
      } as unknown as AudioEngine
      const s = new SoundSynthesizer(nullEngine)
      expect(() => s.playLaunch()).not.toThrow()
      expect(() => s.playCollision()).not.toThrow()
      expect(() => s.playSuccess()).not.toThrow()
      expect(() => s.playFailure()).not.toThrow()
      expect(() => s.playOrbitAchieved()).not.toThrow()
    })
  })
})
