## 1. Audio Engine Foundation

- [ ] 1.1 Create `AudioEngine` class wrapping Web Audio API (`AudioContext` creation, suspend/resume lifecycle)
- [ ] 1.2 Implement user-gesture detection to unlock `AudioContext` on first interaction (click, keydown, touchstart)
- [ ] 1.3 Add graceful fallback when Web Audio API is unavailable (silent no-op, no errors)
- [ ] 1.4 Write unit tests for `AudioEngine` initialization and context state management

## 2. Procedural Sound Generation

- [ ] 2.1 Implement base `SoundSynthesizer` module with oscillator, gain envelope, and filter utilities
- [ ] 2.2 Create procedural sound presets for core simulation events: launch, collision, orbit-achieved, mission-complete, mission-fail
- [ ] 2.3 Add domain-variant sound parameters (e.g., physics sounds use lower frequencies, civics uses tonal chimes)
- [ ] 2.4 Write unit tests verifying each preset produces audio nodes with expected parameters

## 3. Event-Sound Mapping

- [ ] 3.1 Define `SoundMap` TypeScript interface for per-episode event-to-sound configuration
- [ ] 3.2 Create default sound map covering all standard simulation events
- [ ] 3.3 Integrate `SoundMap` into episode configuration so each episode can override default sounds
- [ ] 3.4 Wire simulation event dispatch (launch, collision, orbit, mission outcome) to trigger mapped sounds
- [ ] 3.5 Write integration tests verifying events trigger correct sound lookups

## 4. Volume and Mute Controls

- [ ] 4.1 Add `VolumeControl` React component with mute toggle button and volume slider
- [ ] 4.2 Persist volume level and mute state to localStorage
- [ ] 4.3 Restore persisted preferences on page load and apply to `AudioEngine` master gain
- [ ] 4.4 Add keyboard shortcut for mute toggle (e.g., `M` key when simulation is focused)
- [ ] 4.5 Write component tests for `VolumeControl` (render, interaction, persistence)

## 5. Browser Autoplay Compliance

- [ ] 5.1 Ensure `AudioContext` is created in `suspended` state and only resumed after user gesture
- [ ] 5.2 Queue any sounds triggered before user gesture and discard them silently (no error, no delayed playback)
- [ ] 5.3 Add visual indicator showing audio is available once unlocked (e.g., un-grey the volume icon)
- [ ] 5.4 Write e2e test verifying no audio plays before user interaction

## 6. Accessibility

- [ ] 6.1 Audit all sound-triggered events to confirm each has a corresponding visual indicator (animation, icon, text)
- [ ] 6.2 Add `aria-label` and `aria-pressed` attributes to mute toggle button
- [ ] 6.3 Ensure volume slider is keyboard-navigable with proper ARIA role and value attributes
- [ ] 6.4 Document in episode authoring guide that sounds must never be the sole feedback channel
- [ ] 6.5 Write accessibility tests (keyboard navigation, screen reader labels) for volume controls

## 7. Integration and Polish

- [ ] 7.1 Integrate sound triggers into Orbit Lab (Episode 01) as reference implementation
- [ ] 7.2 Verify performance: sound synthesis must not drop frame rate below 30 FPS on mid-range devices
- [ ] 7.3 Run full CI pipeline (build, lint, unit, e2e) and fix any regressions
