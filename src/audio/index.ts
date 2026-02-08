/**
 * Public API for the Essayons audio system.
 */

export { AudioEngine } from './AudioEngine.ts'
export { SoundSynthesizer } from './SoundSynthesizer.ts'
export { SoundEventDispatcher, createDefaultSoundMap } from './SoundEventMap.ts'
export { useAudio } from './useAudio.ts'

export type {
  OscillatorWaveform,
  SoundPresetName,
  SoundEventMap,
  VolumePreferences,
  UseAudioResult,
} from './types.ts'

export { VOLUME_STORAGE_KEY } from './types.ts'
