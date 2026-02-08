/**
 * useAudio — React hook for the Essayons audio system.
 *
 * Returns controls for playing event sounds, adjusting volume,
 * toggling mute, and checking readiness.
 *
 * The hook manages a singleton AudioEngine + SoundSynthesizer +
 * SoundEventDispatcher. Callers only interact through the stable
 * returned object.
 */

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { AudioEngine } from './AudioEngine.ts'
import { SoundSynthesizer } from './SoundSynthesizer.ts'
import { SoundEventDispatcher, createDefaultSoundMap } from './SoundEventMap.ts'
import type { UseAudioResult, SoundEventMap } from './types.ts'

// ---------------------------------------------------------------------------
// Module-level singleton
// ---------------------------------------------------------------------------

let sharedEngine: AudioEngine | null = null
let sharedSynth: SoundSynthesizer | null = null
let sharedDispatcher: SoundEventDispatcher | null = null

function getEngine(): AudioEngine {
  if (!sharedEngine) {
    sharedEngine = new AudioEngine()
  }
  return sharedEngine
}

function getSynth(engine: AudioEngine): SoundSynthesizer {
  if (!sharedSynth) {
    sharedSynth = new SoundSynthesizer(engine)
  }
  return sharedSynth
}

function getDispatcher(synth: SoundSynthesizer): SoundEventDispatcher {
  if (!sharedDispatcher) {
    sharedDispatcher = new SoundEventDispatcher(createDefaultSoundMap(synth))
  }
  return sharedDispatcher
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook that provides the full audio API surface.
 *
 * @param eventOverrides - Optional per-episode sound overrides that replace
 *   or extend the default event-sound mapping.
 */
export function useAudio(eventOverrides?: SoundEventMap): UseAudioResult {
  const engine = useMemo(() => getEngine(), [])
  const synth = useMemo(() => getSynth(engine), [engine])
  const dispatcher = useMemo(() => getDispatcher(synth), [synth])

  // Apply episode overrides when they change
  const overridesRef = useRef(eventOverrides)
  useEffect(() => {
    if (eventOverrides) {
      dispatcher.applyOverrides(eventOverrides)
    } else if (overridesRef.current) {
      // Overrides were removed — reset to default
      dispatcher.resetToDefault(createDefaultSoundMap(synth))
    }
    overridesRef.current = eventOverrides
  }, [eventOverrides, dispatcher, synth])

  // Subscribe to engine state changes (ready, mute, volume)
  const subscribe = useCallback(
    (onStoreChange: () => void) => engine.subscribe(onStoreChange),
    [engine],
  )

  // Build a snapshot key that changes when relevant state changes
  const getSnapshot = useCallback(
    () => ({
      isMuted: engine.isMuted(),
      isReady: engine.isReady(),
    }),
    [engine],
  )

  const state = useSyncExternalStore(subscribe, getSnapshot)

  const playEvent = useCallback(
    (eventName: string) => dispatcher.playEvent(eventName),
    [dispatcher],
  )

  const setVolume = useCallback((volume: number) => engine.setVolume(volume), [engine])

  const toggleMute = useCallback(() => engine.toggleMute(), [engine])

  return useMemo(
    () => ({
      playEvent,
      setVolume,
      toggleMute,
      isMuted: state.isMuted,
      isReady: state.isReady,
    }),
    [playEvent, setVolume, toggleMute, state.isMuted, state.isReady],
  )
}
