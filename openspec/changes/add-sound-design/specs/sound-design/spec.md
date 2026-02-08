## ADDED Requirements

### Requirement: Audio Engine Initialization

The system SHALL create a Web Audio API `AudioContext` in the `suspended` state on page load and SHALL NOT resume it until a qualifying user gesture (click, keydown, or touchstart) has been detected.

#### Scenario: AudioContext created on load

- **WHEN** the application initializes
- **THEN** an `AudioContext` SHALL be created in the `suspended` state
- **AND** no audio output SHALL be produced

#### Scenario: AudioContext resumed after user gesture

- **WHEN** the user performs a click, keydown, or touchstart event
- **THEN** the `AudioContext` SHALL transition to the `running` state
- **AND** subsequent sound triggers SHALL produce audio output (if not muted)

#### Scenario: Web Audio API unavailable

- **WHEN** the browser does not support the Web Audio API
- **THEN** the audio engine SHALL operate as a silent no-op
- **AND** no errors SHALL be thrown or displayed to the user

---

### Requirement: Event Sound Mapping

The system SHALL maintain a configurable mapping of simulation events to sound definitions, and each episode SHALL be able to override the default mapping with domain-specific sounds.

#### Scenario: Default sound map covers all standard events

- **WHEN** an episode does not provide a custom sound map
- **THEN** the system SHALL use the default sound map
- **AND** the default map SHALL include entries for: launch, collision, orbit-achieved, mission-complete, and mission-fail

#### Scenario: Episode overrides default sounds

- **WHEN** an episode configuration provides a custom sound map
- **THEN** the episode's custom entries SHALL take precedence over the default map for matching events
- **AND** any events not overridden SHALL fall back to the default map

#### Scenario: Unmapped event triggers no sound

- **WHEN** a simulation event fires that has no entry in either the episode or default sound map
- **THEN** no sound SHALL be produced
- **AND** no error SHALL be thrown

---

### Requirement: Procedural Sound Generation

The system SHALL generate all sounds procedurally using the Web Audio API (oscillators, gain envelopes, filters) and SHALL NOT require external audio files.

#### Scenario: Sound produced without external files

- **WHEN** a mapped simulation event fires
- **THEN** the system SHALL synthesize the corresponding sound using Web Audio API nodes (OscillatorNode, GainNode, BiquadFilterNode, or similar)
- **AND** no network request for audio assets SHALL be made

#### Scenario: Domain-appropriate sound characteristics

- **WHEN** a sound is synthesized for an episode
- **THEN** the sound parameters (frequency, waveform, envelope, timbre) SHALL reflect the episode's domain
- **AND** physics-domain sounds SHALL be distinct from civics-domain sounds

#### Scenario: Sound duration is bounded

- **WHEN** a sound is triggered
- **THEN** the synthesized sound SHALL complete within 2 seconds
- **AND** all allocated audio nodes SHALL be disconnected and released after playback completes

---

### Requirement: Volume Controls

The system SHALL provide a mute toggle and a volume slider that control the master audio output level, and SHALL persist the user's preference across browser sessions using localStorage.

#### Scenario: Mute toggle silences all audio

- **WHEN** the user activates the mute toggle
- **THEN** the master gain SHALL be set to zero
- **AND** the mute state SHALL be persisted to localStorage

#### Scenario: Volume slider adjusts output level

- **WHEN** the user adjusts the volume slider
- **THEN** the master gain SHALL update to reflect the slider value (0.0 to 1.0)
- **AND** the new volume level SHALL be persisted to localStorage

#### Scenario: Preferences restored on reload

- **WHEN** the application loads and localStorage contains saved volume preferences
- **THEN** the mute state and volume level SHALL be restored from the saved values
- **AND** the volume controls SHALL reflect the restored state

#### Scenario: No saved preferences

- **WHEN** the application loads and localStorage contains no saved volume preferences
- **THEN** the system SHALL default to unmuted with volume at 1.0 (full)

---

### Requirement: Browser Autoplay Compliance

The system SHALL NOT produce any audio output before the user has performed an explicit interaction gesture, in compliance with browser autoplay policies.

#### Scenario: Sound triggered before user gesture

- **WHEN** a simulation event fires before any user gesture has been detected
- **THEN** the sound trigger SHALL be silently discarded
- **AND** no audio output SHALL be produced
- **AND** no error SHALL be thrown

#### Scenario: Visual indicator of audio readiness

- **WHEN** the `AudioContext` transitions from `suspended` to `running`
- **THEN** the volume control UI SHALL visually indicate that audio is now active (e.g., icon changes from greyed-out to full color)

#### Scenario: Audio works immediately after gesture

- **WHEN** the user performs a qualifying gesture and a simulation event fires afterward
- **THEN** the corresponding sound SHALL play without perceptible delay (under 100ms latency)

---

### Requirement: Accessibility of Audio Feedback

All audio feedback SHALL supplement existing visual feedback and SHALL NOT serve as the sole indicator of any simulation event or state change. Audio controls SHALL be fully keyboard-navigable and screen-reader accessible.

#### Scenario: Every sound has a visual counterpart

- **WHEN** a simulation event triggers a sound
- **THEN** the same event SHALL also produce a visual indicator (animation, icon change, status text, or notification)
- **AND** the visual indicator SHALL be sufficient to understand the event without audio

#### Scenario: Mute toggle is keyboard accessible

- **WHEN** the mute toggle has keyboard focus
- **THEN** pressing Enter or Space SHALL toggle the mute state
- **AND** the toggle SHALL have an `aria-label` describing its function
- **AND** the toggle SHALL have `aria-pressed` reflecting its current state

#### Scenario: Volume slider is keyboard accessible

- **WHEN** the volume slider has keyboard focus
- **THEN** Arrow keys SHALL adjust the volume level
- **AND** the slider SHALL have an appropriate ARIA role (`slider`) with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` attributes

#### Scenario: Screen reader announces state changes

- **WHEN** the user toggles mute or adjusts volume
- **THEN** the updated state SHALL be announced to screen readers via appropriate ARIA live regions or attribute updates
