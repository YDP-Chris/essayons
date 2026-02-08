/**
 * SoundSynthesizer — procedural sound generation using Web Audio API.
 *
 * Generates all sounds programmatically (zero external audio files).
 * Each method creates short-lived oscillator/gain nodes that are
 * automatically cleaned up after their scheduled duration.
 */

import type { AudioEngine } from './AudioEngine.ts'
import type { OscillatorWaveform } from './types.ts'

// ---------------------------------------------------------------------------
// SoundSynthesizer
// ---------------------------------------------------------------------------

export class SoundSynthesizer {
  private readonly engine: AudioEngine

  constructor(engine: AudioEngine) {
    this.engine = engine
  }

  // ---- Core primitive ------------------------------------------------------

  /**
   * Play a single tone through the engine's master gain.
   * The oscillator and gain nodes are automatically disconnected
   * after the specified duration.
   */
  playTone(frequency: number, duration: number, type: OscillatorWaveform = 'sine'): void {
    const ctx = this.engine.getContext()
    const master = this.engine.getMasterGain()
    if (!ctx || !master || !this.engine.isReady()) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(master)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)

    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
    }
  }

  // ---- Event presets -------------------------------------------------------

  /** Rising frequency sweep — evokes ignition and acceleration. */
  playLaunch(): void {
    const ctx = this.engine.getContext()
    const master = this.engine.getMasterGain()
    if (!ctx || !master || !this.engine.isReady()) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const duration = 0.6

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(master)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)

    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
    }
  }

  /** Short noise burst — percussive impact. */
  playCollision(): void {
    const ctx = this.engine.getContext()
    const master = this.engine.getMasterGain()
    if (!ctx || !master || !this.engine.isReady()) return

    const duration = 0.15

    // White noise via a buffer
    const sampleRate = ctx.sampleRate
    const bufferSize = Math.ceil(sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    source.connect(gain)
    gain.connect(master)
    source.start(ctx.currentTime)
    source.stop(ctx.currentTime + duration)

    source.onended = () => {
      source.disconnect()
      gain.disconnect()
    }
  }

  /** Major chord arpeggio — triumphant, satisfying. */
  playSuccess(): void {
    const ctx = this.engine.getContext()
    const master = this.engine.getMasterGain()
    if (!ctx || !master || !this.engine.isReady()) return

    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    const noteDuration = 0.25

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = ctx.currentTime + i * 0.1

      osc.type = 'sine'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0.2, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration)

      osc.connect(gain)
      gain.connect(master)
      osc.start(startTime)
      osc.stop(startTime + noteDuration)

      osc.onended = () => {
        osc.disconnect()
        gain.disconnect()
      }
    })
  }

  /** Descending tones — disappointment or loss. */
  playFailure(): void {
    const ctx = this.engine.getContext()
    const master = this.engine.getMasterGain()
    if (!ctx || !master || !this.engine.isReady()) return

    const notes = [440, 349.23, 261.63] // A4, F4, C4
    const noteDuration = 0.3

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = ctx.currentTime + i * 0.15

      osc.type = 'triangle'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0.2, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration)

      osc.connect(gain)
      gain.connect(master)
      osc.start(startTime)
      osc.stop(startTime + noteDuration)

      osc.onended = () => {
        osc.disconnect()
        gain.disconnect()
      }
    })
  }

  /** Gentle chime — a soft bell-like tone for orbit achieved. */
  playOrbitAchieved(): void {
    const ctx = this.engine.getContext()
    const master = this.engine.getMasterGain()
    if (!ctx || !master || !this.engine.isReady()) return

    const duration = 0.8

    // Fundamental
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.value = 880 // A5

    gain1.gain.setValueAtTime(0.2, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc1.connect(gain1)
    gain1.connect(master)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + duration)

    // Overtone for shimmer
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = 1318.5 // E6

    gain2.gain.setValueAtTime(0.1, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.7)

    osc2.connect(gain2)
    gain2.connect(master)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + duration)

    osc1.onended = () => {
      osc1.disconnect()
      gain1.disconnect()
    }
    osc2.onended = () => {
      osc2.disconnect()
      gain2.disconnect()
    }
  }
}
