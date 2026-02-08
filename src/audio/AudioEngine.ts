/**
 * AudioEngine wraps the Web Audio API AudioContext lifecycle.
 *
 * - Creates AudioContext in suspended state (browser autoplay compliance).
 * - Resumes on first user gesture (click / keydown / touchstart).
 * - Graceful no-op when Web Audio API is unavailable.
 * - Exposes a master GainNode for volume control.
 */

import type { VolumePreferences } from './types.ts'
import { VOLUME_STORAGE_KEY } from './types.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read persisted volume preferences from localStorage. */
function loadPreferences(): VolumePreferences {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY)
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) {
        const obj = parsed as Record<string, unknown>
        return {
          volume:
            typeof obj['volume'] === 'number'
              ? Math.min(1, Math.max(0, obj['volume'] as number))
              : 1,
          muted: typeof obj['muted'] === 'boolean' ? (obj['muted'] as boolean) : false,
        }
      }
    }
  } catch {
    // localStorage unavailable or corrupt — use defaults
  }
  return { volume: 1, muted: false }
}

/** Persist volume preferences to localStorage. */
function savePreferences(prefs: VolumePreferences): void {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // QuotaExceeded or unavailable — degrade silently
  }
}

// ---------------------------------------------------------------------------
// AudioEngine
// ---------------------------------------------------------------------------

export class AudioEngine {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private unlocked = false
  private readonly available: boolean
  private volume: number
  private muted: boolean
  private readonly listeners: Set<() => void> = new Set()

  /** Bound handler references for cleanup. */
  private readonly handleGesture: () => void

  constructor() {
    this.available = typeof AudioContext !== 'undefined'
    const prefs = loadPreferences()
    this.volume = prefs.volume
    this.muted = prefs.muted
    this.handleGesture = this.unlockContext.bind(this)

    if (this.available) {
      this.context = new AudioContext()
      this.masterGain = this.context.createGain()
      this.masterGain.connect(this.context.destination)
      this.applyGain()
      this.addGestureListeners()
    }
  }

  // ---- Gesture unlocking ---------------------------------------------------

  private addGestureListeners(): void {
    const events = ['click', 'keydown', 'touchstart'] as const
    for (const event of events) {
      document.addEventListener(event, this.handleGesture, { once: false, passive: true })
    }
  }

  private removeGestureListeners(): void {
    const events = ['click', 'keydown', 'touchstart'] as const
    for (const event of events) {
      document.removeEventListener(event, this.handleGesture)
    }
  }

  private unlockContext(): void {
    if (this.unlocked || !this.context) {
      return
    }
    void this.context.resume().then(() => {
      this.unlocked = true
      this.removeGestureListeners()
      this.notify()
    })
  }

  // ---- Gain ---------------------------------------------------------------

  private applyGain(): void {
    if (!this.masterGain) return
    this.masterGain.gain.value = this.muted ? 0 : this.volume
  }

  // ---- Change notification -------------------------------------------------

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }

  // ---- Public API ----------------------------------------------------------

  /** Whether the Web Audio API is available and the context has been unlocked. */
  isReady(): boolean {
    return this.available && this.unlocked
  }

  /** Whether the Web Audio API is supported in the current environment. */
  isAvailable(): boolean {
    return this.available
  }

  /** Return the underlying AudioContext, or null if unavailable. */
  getContext(): AudioContext | null {
    return this.context
  }

  /** Return the master GainNode, or null if unavailable. */
  getMasterGain(): GainNode | null {
    return this.masterGain
  }

  /** Set master volume (0-1). Persists to localStorage. */
  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value))
    this.applyGain()
    savePreferences({ volume: this.volume, muted: this.muted })
    this.notify()
  }

  /** Get current volume (0-1). */
  getVolume(): number {
    return this.volume
  }

  /** Toggle mute on/off. Persists to localStorage. */
  toggleMute(): void {
    this.muted = !this.muted
    this.applyGain()
    savePreferences({ volume: this.volume, muted: this.muted })
    this.notify()
  }

  /** Whether audio is currently muted. */
  isMuted(): boolean {
    return this.muted
  }

  /** Clean up resources and remove event listeners. */
  dispose(): void {
    this.removeGestureListeners()
    if (this.context) {
      void this.context.close()
      this.context = null
    }
    this.masterGain = null
    this.listeners.clear()
  }
}
