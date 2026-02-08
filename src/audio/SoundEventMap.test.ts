import { describe, it, expect, vi } from 'vitest'
import { SoundEventDispatcher, createDefaultSoundMap } from './SoundEventMap.ts'
import type { SoundSynthesizer } from './SoundSynthesizer.ts'

// ---------------------------------------------------------------------------
// Mock SoundSynthesizer
// ---------------------------------------------------------------------------

function createMockSynth(): SoundSynthesizer {
  return {
    playTone: vi.fn(),
    playLaunch: vi.fn(),
    playCollision: vi.fn(),
    playSuccess: vi.fn(),
    playFailure: vi.fn(),
    playOrbitAchieved: vi.fn(),
  } as unknown as SoundSynthesizer
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createDefaultSoundMap', () => {
  it('maps standard event names to synth methods', () => {
    const synth = createMockSynth()
    const map = createDefaultSoundMap(synth)

    expect(map['launch']).toBeDefined()
    expect(map['collision']).toBeDefined()
    expect(map['orbit-achieved']).toBeDefined()
    expect(map['mission-complete']).toBeDefined()
    expect(map['mission-fail']).toBeDefined()
    expect(map['success']).toBeDefined()
    expect(map['failure']).toBeDefined()
  })

  it('calls the correct synth method for each event', () => {
    const synth = createMockSynth()
    const map = createDefaultSoundMap(synth)

    map['launch']!()
    expect(synth.playLaunch).toHaveBeenCalledTimes(1)

    map['collision']!()
    expect(synth.playCollision).toHaveBeenCalledTimes(1)

    map['orbit-achieved']!()
    expect(synth.playOrbitAchieved).toHaveBeenCalledTimes(1)

    map['mission-complete']!()
    expect(synth.playSuccess).toHaveBeenCalledTimes(1)

    map['mission-fail']!()
    expect(synth.playFailure).toHaveBeenCalledTimes(1)
  })
})

describe('SoundEventDispatcher', () => {
  it('dispatches events to the correct handler', () => {
    const handler = vi.fn()
    const dispatcher = new SoundEventDispatcher({ launch: handler })

    dispatcher.playEvent('launch')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('silently ignores unknown event names', () => {
    const dispatcher = new SoundEventDispatcher({})
    // Should not throw
    expect(() => dispatcher.playEvent('unknown-event')).not.toThrow()
  })

  it('applies overrides on top of defaults', () => {
    const defaultHandler = vi.fn()
    const overrideHandler = vi.fn()

    const dispatcher = new SoundEventDispatcher({
      launch: defaultHandler,
      collision: defaultHandler,
    })

    dispatcher.applyOverrides({ launch: overrideHandler })

    dispatcher.playEvent('launch')
    expect(defaultHandler).not.toHaveBeenCalled()
    expect(overrideHandler).toHaveBeenCalledTimes(1)

    // collision still uses default
    dispatcher.playEvent('collision')
    expect(defaultHandler).toHaveBeenCalledTimes(1)
  })

  it('adds new events through overrides', () => {
    const handler = vi.fn()
    const dispatcher = new SoundEventDispatcher({})

    dispatcher.applyOverrides({ 'custom-event': handler })
    dispatcher.playEvent('custom-event')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('resets to default map', () => {
    const defaultHandler = vi.fn()
    const overrideHandler = vi.fn()

    const defaultMap = { launch: defaultHandler }
    const dispatcher = new SoundEventDispatcher(defaultMap)
    dispatcher.applyOverrides({ launch: overrideHandler })

    dispatcher.resetToDefault(defaultMap)
    dispatcher.playEvent('launch')
    expect(defaultHandler).toHaveBeenCalledTimes(1)
    expect(overrideHandler).not.toHaveBeenCalled()
  })

  it('returns event names', () => {
    const dispatcher = new SoundEventDispatcher({
      launch: vi.fn(),
      collision: vi.fn(),
    })

    const names = dispatcher.getEventNames()
    expect(names).toContain('launch')
    expect(names).toContain('collision')
    expect(names).toHaveLength(2)
  })
})
