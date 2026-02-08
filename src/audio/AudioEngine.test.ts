import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AudioEngine } from './AudioEngine.ts'
import { VOLUME_STORAGE_KEY } from './types.ts'

// ---------------------------------------------------------------------------
// Mock AudioContext
// ---------------------------------------------------------------------------

function createMockGainNode(): GainNode {
  return {
    gain: { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as GainNode
}

function createMockAudioContext(options?: { state?: AudioContextState }): AudioContext {
  const state = options?.state ?? 'suspended'
  return {
    state,
    currentTime: 0,
    sampleRate: 44100,
    createGain: vi.fn(() => createMockGainNode()),
    createOscillator: vi.fn(),
    createBufferSource: vi.fn(),
    createBuffer: vi.fn(),
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    destination: {} as AudioDestinationNode,
  } as unknown as AudioContext
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AudioEngine', () => {
  let originalAudioContext: typeof globalThis.AudioContext

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    originalAudioContext = globalThis.AudioContext
    // Install mock AudioContext globally
    globalThis.AudioContext = vi.fn(() =>
      createMockAudioContext(),
    ) as unknown as typeof AudioContext
  })

  afterEach(() => {
    globalThis.AudioContext = originalAudioContext
  })

  // ---- Initialization ----------------------------------------------------

  it('creates an AudioContext when Web Audio API is available', () => {
    const engine = new AudioEngine()
    expect(engine.getContext()).not.toBeNull()
    expect(engine.isAvailable()).toBe(true)
    engine.dispose()
  })

  it('starts as not ready (context not yet unlocked)', () => {
    const engine = new AudioEngine()
    expect(engine.isReady()).toBe(false)
    engine.dispose()
  })

  it('reports unavailable when AudioContext is missing', () => {
    // Remove AudioContext from global
    ;(globalThis as Record<string, unknown>)['AudioContext'] = undefined
    const engine = new AudioEngine()
    expect(engine.isAvailable()).toBe(false)
    expect(engine.isReady()).toBe(false)
    expect(engine.getContext()).toBeNull()
    expect(engine.getMasterGain()).toBeNull()
    engine.dispose()
  })

  // ---- Gesture unlocking --------------------------------------------------

  it('resumes AudioContext on user gesture (click)', async () => {
    const engine = new AudioEngine()
    const ctx = engine.getContext()!
    expect(engine.isReady()).toBe(false)

    // Simulate click
    document.dispatchEvent(new MouseEvent('click'))

    // Wait for resume promise to settle
    await vi.waitFor(() => {
      expect(engine.isReady()).toBe(true)
    })

    expect(ctx.resume).toHaveBeenCalledTimes(1)
    engine.dispose()
  })

  it('resumes AudioContext on keydown', async () => {
    const engine = new AudioEngine()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))

    await vi.waitFor(() => {
      expect(engine.isReady()).toBe(true)
    })

    engine.dispose()
  })

  it('does not call resume more than once', async () => {
    const engine = new AudioEngine()
    const ctx = engine.getContext()!

    document.dispatchEvent(new MouseEvent('click'))
    await vi.waitFor(() => {
      expect(engine.isReady()).toBe(true)
    })

    // Second click should not call resume again
    document.dispatchEvent(new MouseEvent('click'))
    expect(ctx.resume).toHaveBeenCalledTimes(1)

    engine.dispose()
  })

  // ---- Volume control -----------------------------------------------------

  it('sets and gets volume', () => {
    const engine = new AudioEngine()
    engine.setVolume(0.5)
    expect(engine.getVolume()).toBe(0.5)
    engine.dispose()
  })

  it('clamps volume to 0-1 range', () => {
    const engine = new AudioEngine()
    engine.setVolume(-0.5)
    expect(engine.getVolume()).toBe(0)
    engine.setVolume(2.0)
    expect(engine.getVolume()).toBe(1)
    engine.dispose()
  })

  // ---- Mute toggle --------------------------------------------------------

  it('toggles mute state', () => {
    const engine = new AudioEngine()
    expect(engine.isMuted()).toBe(false)
    engine.toggleMute()
    expect(engine.isMuted()).toBe(true)
    engine.toggleMute()
    expect(engine.isMuted()).toBe(false)
    engine.dispose()
  })

  // ---- Persistence --------------------------------------------------------

  it('persists volume and mute to localStorage', () => {
    const engine = new AudioEngine()
    engine.setVolume(0.7)
    engine.toggleMute()

    const raw = localStorage.getItem(VOLUME_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as Record<string, unknown>
    expect(parsed['volume']).toBe(0.7)
    expect(parsed['muted']).toBe(true)
    engine.dispose()
  })

  it('restores persisted preferences on construction', () => {
    localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify({ volume: 0.3, muted: true }))

    const engine = new AudioEngine()
    expect(engine.getVolume()).toBe(0.3)
    expect(engine.isMuted()).toBe(true)
    engine.dispose()
  })

  it('uses defaults when localStorage has corrupt data', () => {
    localStorage.setItem(VOLUME_STORAGE_KEY, '{not valid json')

    const engine = new AudioEngine()
    expect(engine.getVolume()).toBe(1)
    expect(engine.isMuted()).toBe(false)
    engine.dispose()
  })

  // ---- Subscription -------------------------------------------------------

  it('notifies subscribers when volume changes', () => {
    const engine = new AudioEngine()
    const listener = vi.fn()
    engine.subscribe(listener)
    engine.setVolume(0.5)
    expect(listener).toHaveBeenCalledTimes(1)
    engine.dispose()
  })

  it('notifies subscribers when mute toggles', () => {
    const engine = new AudioEngine()
    const listener = vi.fn()
    engine.subscribe(listener)
    engine.toggleMute()
    expect(listener).toHaveBeenCalledTimes(1)
    engine.dispose()
  })

  it('unsubscribes correctly', () => {
    const engine = new AudioEngine()
    const listener = vi.fn()
    const unsub = engine.subscribe(listener)
    unsub()
    engine.setVolume(0.5)
    expect(listener).not.toHaveBeenCalled()
    engine.dispose()
  })

  // ---- Dispose ------------------------------------------------------------

  it('closes AudioContext on dispose', () => {
    const engine = new AudioEngine()
    const ctx = engine.getContext()!
    engine.dispose()
    expect(ctx.close).toHaveBeenCalled()
    expect(engine.getContext()).toBeNull()
  })
})
