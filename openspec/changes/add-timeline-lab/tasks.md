# Tasks: Timeline Lab - Historical Cause & Effect Simulator

## Implementation Checklist

### Core Episode Structure

- [ ] Create `/mnt/data/essayons/src/episodes/timeline-lab/` directory
- [ ] Implement `config.ts` with EpisodeConfig for history domain, step-based mode
- [ ] Define `types.ts` with TimelineState interface and policy parameters
- [ ] Create `simulation.ts` with createInitialState() and stepTimeline() functions
- [ ] Implement `renderer.ts` with timeline canvas visualization
- [ ] Create `index.ts` to register episode and wire components together

### Historical Scenarios Implementation

- [ ] Implement Industrial Revolution scenario (1750-1900) with factory/steam engine mechanics
- [ ] Implement Roman Empire scenario (100-500 AD) with territory/military mechanics
- [ ] Implement Space Race scenario (1945-1975) with R&D/cooperation mechanics
- [ ] Create scenario switching logic in simulation.ts

### Simulation Engine

- [ ] Implement time step advancement (5-year increments)
- [ ] Create policy parameter system (Technology, Trade, Military, Diplomacy)
- [ ] Build cascading effect calculations (policy changes affect multiple metrics)
- [ ] Implement historical event triggering system
- [ ] Create divergence scoring algorithm comparing alternate vs. actual timeline

### Timeline Visualization

- [ ] Render dual-track timeline (actual history vs. user timeline)
- [ ] Draw year markers and event indicators on canvas
- [ ] Implement event hover details and tooltips
- [ ] Create divergence visualization showing how far timelines have separated
- [ ] Add smooth animations for timeline updates

### Mission System

- [ ] Implement Mission 1: Rewrite Industrial Revolution (balance progress/stability)
- [ ] Implement Mission 2: Save Roman Empire (extend to 600 AD)
- [ ] Implement Mission 3: Win Space Race Early (moon by 1965 with cooperation)
- [ ] Implement Mission 4: Butterfly Effect (maximize divergence with minimal changes)
- [ ] Create mission progress tracking and completion detection

### User Interface

- [ ] Create policy adjustment sliders with real-time feedback
- [ ] Implement metric display dashboard (population, economy, military, culture)
- [ ] Add step control buttons (Next Step, Auto-Advance, Reset)
- [ ] Create scenario selection interface
- [ ] Implement mobile-responsive layout with touch controls

### Episode Registration

- [ ] Add timeline-lab to LazyEpisodeShell.tsx episodeLoaders map
- [ ] Update episode registry with Timeline Lab configuration
- [ ] Test episode loading and initialization in Essayons app

### Testing & Validation

- [ ] Create unit tests for simulation logic (createInitialState, stepTimeline)
- [ ] Test all mission completion conditions
- [ ] Verify TypeScript compilation without errors
- [ ] Test mobile responsiveness and touch interactions
- [ ] Validate historical accuracy of scenarios and events

### Polish & Documentation

- [ ] Add reference content explaining historical cause-and-effect principles
- [ ] Create equation displays showing simplified historical models
- [ ] Implement error handling for edge cases (timeline boundaries, invalid states)
- [ ] Add loading states and smooth transitions between scenarios
