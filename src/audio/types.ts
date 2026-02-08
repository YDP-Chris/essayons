/**
 * Type definitions for the Essayons audio system.
 *
 * Covers oscillator types, sound presets, event-sound mapping,
 * volume preferences, and the public useAudio hook contract.
 */

// ---------------------------------------------------------------------------
// Oscillator
// ---------------------------------------------------------------------------

/** Web Audio API oscillator waveform types. */
export type OscillatorWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle'

// ---------------------------------------------------------------------------
// Sound Presets
// ---------------------------------------------------------------------------

/** Names of built-in procedural sound presets. */
export type SoundPresetName = 'launch' | 'collision' | 'orbit-achieved' | 'success' | 'failure'

// ---------------------------------------------------------------------------
// Event-Sound Mapping
// ---------------------------------------------------------------------------

/** Maps simulation event names to sound-producing functions. */
export type SoundEventMap = Record<string, () => void>

// ---------------------------------------------------------------------------
// Volume Preferences
// ---------------------------------------------------------------------------

/** Persisted volume and mute preferences. */
export interface VolumePreferences {
  readonly volume: number
  readonly muted: boolean
}

/** localStorage key used for persisting volume preferences. */
export const VOLUME_STORAGE_KEY = 'essayons_audio_prefs'

// ---------------------------------------------------------------------------
// useAudio hook return type
// ---------------------------------------------------------------------------

/** Public API returned by the useAudio React hook. */
export interface UseAudioResult {
  readonly playEvent: (eventName: string) => void
  readonly setVolume: (volume: number) => void
  readonly toggleMute: () => void
  readonly isMuted: boolean
  readonly isReady: boolean
}
