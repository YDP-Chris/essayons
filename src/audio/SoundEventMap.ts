/**
 * Event-sound mapping system.
 *
 * Provides a default mapping of simulation event names to sound presets,
 * allows per-episode overrides, and dispatches playback by event name.
 */

import type { SoundSynthesizer } from './SoundSynthesizer.ts'
import type { SoundEventMap } from './types.ts'

// ---------------------------------------------------------------------------
// Default event map
// ---------------------------------------------------------------------------

/** Build the default event-to-sound mapping for standard simulation events. */
export function createDefaultSoundMap(synth: SoundSynthesizer): SoundEventMap {
  return {
    launch: () => synth.playLaunch(),
    collision: () => synth.playCollision(),
    'orbit-achieved': () => synth.playOrbitAchieved(),
    'mission-complete': () => synth.playSuccess(),
    'mission-fail': () => synth.playFailure(),
    success: () => synth.playSuccess(),
    failure: () => synth.playFailure(),
  }
}

// ---------------------------------------------------------------------------
// Event dispatcher
// ---------------------------------------------------------------------------

export class SoundEventDispatcher {
  private eventMap: SoundEventMap

  constructor(defaultMap: SoundEventMap) {
    this.eventMap = { ...defaultMap }
  }

  /**
   * Merge episode-specific overrides into the event map.
   * Keys not present in the override keep their default binding.
   */
  applyOverrides(overrides: SoundEventMap): void {
    this.eventMap = { ...this.eventMap, ...overrides }
  }

  /** Reset to the given base map, discarding all overrides. */
  resetToDefault(defaultMap: SoundEventMap): void {
    this.eventMap = { ...defaultMap }
  }

  /**
   * Play the sound mapped to the given event name.
   * If no mapping exists the call is a silent no-op.
   */
  playEvent(eventName: string): void {
    const handler = this.eventMap[eventName]
    if (handler) {
      handler()
    }
  }

  /** Return a read-only snapshot of the current event names. */
  getEventNames(): readonly string[] {
    return Object.keys(this.eventMap)
  }
}
