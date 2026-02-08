# Change: Add Sound Design for Simulation Event Audio Feedback

## Why

Interactive simulations feel flat without audio reinforcement. Sound design provides satisfying auditory cues that strengthen cause-and-effect learning — a launch sounds powerful, a collision sounds impactful, and achieving orbit feels triumphant — making each interaction more memorable and engaging.

## What Changes

- Add a Web Audio API-based audio engine for procedural/synthesized sound generation (zero external audio files)
- Define a configurable event-to-sound mapping system so each episode can have domain-appropriate sounds
- Implement persistent mute/volume controls (localStorage) accessible from the simulation UI
- Enforce browser autoplay policy compliance: no audio output until a user gesture is detected
- Integrate sound triggers into the simulation event lifecycle (launch, collision, orbit achieved, mission complete, mission fail)
- Ensure all sounds supplement existing visual feedback and never serve as the sole indicator of any event

## Impact

- Affected specs: `sound-design` (new capability)
- Affected code: simulation engine event dispatch, episode configuration modules, UI controls (volume/mute), localStorage persistence layer
