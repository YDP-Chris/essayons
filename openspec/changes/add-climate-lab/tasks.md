# Tasks: Climate Lab - Energy Balance & Feedback Simulator

## Implementation Checklist

### 1. Core Physics Engine

- [ ] 1.1 Create `ClimateState` interface with temperature, energy balance, parameters
- [ ] 1.2 Implement Stefan-Boltzmann energy balance calculation
- [ ] 1.3 Add CO2 radiative forcing equation (5.35 × ln(CO2/CO2_ref))
- [ ] 1.4 Create ice-albedo feedback mechanism with temperature thresholds
- [ ] 1.5 Add volcanic cooling effects on energy balance
- [ ] 1.6 Implement `createInitialState()` with realistic baseline values
- [ ] 1.7 Create `updateClimateState()` pure function for step-based updates
- [ ] 1.8 Add physics constants and validation for parameter ranges

### 2. Parameter System Integration

- [ ] 2.1 Define 4 climate parameters in episode config (CO2, albedo, solar, volcanic)
- [ ] 2.2 Set appropriate ranges: CO2 (280-800 ppm), albedo (0.1-0.8), solar (1360-1380 W/m²)
- [ ] 2.3 Add parameter validation and clamping functions
- [ ] 2.4 Connect parameters to physics calculations with proper units
- [ ] 2.5 Test parameter changes trigger immediate state recalculation

### 3. Step-Based Simulation Integration

- [ ] 3.1 Configure episode for `step-based` simulation mode
- [ ] 3.2 Implement step function that calls `updateClimateState()`
- [ ] 3.3 Add DiscreteEngine integration with manual/auto-advance
- [ ] 3.4 Test simulation step execution and state persistence

### 4. Canvas Earth Visualization

- [ ] 4.1 Create `renderClimate()` function for Canvas 2D context
- [ ] 4.2 Implement Earth circle with temperature-driven color gradient
- [ ] 4.3 Add ice coverage visualization (white polar caps that shrink/expand)
- [ ] 4.4 Create atmosphere layer overlay with CO2-based opacity
- [ ] 4.5 Add temperature readout and energy balance indicators
- [ ] 4.6 Implement smooth color transitions for temperature changes
- [ ] 4.7 Add responsive canvas sizing for mobile devices
- [ ] 4.8 Optimize rendering performance with dirty flag pattern

### 5. Mission System Implementation

#### 5.1-5.3 Mission 1: Balance the Budget

- [ ] 5.1 Create mission with energy equilibrium objective (±0.5 W/m²)
- [ ] 5.2 Implement success detection for energy balance tolerance
- [ ] 5.3 Add progress indicator showing current energy imbalance

#### 5.4-5.6 Mission 2: Ice Age

- [ ] 5.4 Create mission targeting -10°C cooling from baseline
- [ ] 5.5 Implement success detection for sustained cooling
- [ ] 5.6 Add guidance on using albedo and volcanic parameters

#### 5.7-5.9 Mission 3: Runaway Greenhouse

- [ ] 5.7 Create mission for +50°C warming (Venus scenario)
- [ ] 5.8 Implement success detection for extreme temperature
- [ ] 5.9 Add educational context about tipping points

#### 5.10-5.12 Mission 4: Stabilize at 1.5°C

- [ ] 5.10 Create precision mission for 1.5°C ± 0.2°C warming
- [ ] 5.11 Implement success detection with tolerance range
- [ ] 5.12 Add difficulty progression from previous missions

### 6. Reference Educational Content

- [ ] 6.1 Write energy balance basics explanation with Stefan-Boltzmann law
- [ ] 6.2 Create greenhouse effect content explaining CO2 radiative forcing
- [ ] 6.3 Add ice-albedo feedback description with examples
- [ ] 6.4 Write climate tipping points content with real-world context
- [ ] 6.5 Include equations section with math notation
- [ ] 6.6 Add references to scientific papers and further reading

### 7. Integration & Testing

- [ ] 7.1 Create episode configuration in `config.ts`
- [ ] 7.2 Register episode in main index.ts with proper imports
- [ ] 7.3 Add episode to landing page grid with physics domain
- [ ] 7.4 Write comprehensive unit tests for physics calculations
- [ ] 7.5 Test mission success/failure scenarios
- [ ] 7.6 Add i18n translations for English and Spanish
- [ ] 7.7 Verify TypeScript compilation with strict mode
- [ ] 7.8 Performance test on mobile devices and optimize if needed

## Critical Implementation Notes

### Physics Accuracy

- Use real Stefan-Boltzmann constant (5.67 × 10⁻⁸ W/m²K⁴)
- CO2 radiative forcing based on IPCC AR6 coefficients
- Temperature baseline should be ~15°C (288K) for modern Earth
- Ice-albedo feedback thresholds based on realistic temperatures

### Performance Requirements

- Physics calculations must complete in <50ms per step
- Canvas rendering should maintain 30 FPS minimum
- Memory usage should remain under 100MB during extended use
- Mobile responsiveness must not compromise functionality

### Educational Design

- All parameters must have clear labels and units
- Visual feedback should be immediate and obvious
- Failure states (runaway scenarios) should be educational, not frustrating
- Success celebrations should reinforce learning objectives

### Code Quality

- All functions must be pure (no side effects)
- TypeScript strict mode with no `any` types
- Comprehensive error handling for edge cases
- Unit tests covering physics calculations and mission logic

## Dependencies

- Existing Essayons DiscreteEngine for step-based simulation
- Canvas 2D API for Earth visualization
- Parameter system for interactive controls
- Mission manager for objectives and progress tracking
- i18n system for multilingual support

## Definition of Done

- [ ] All 32 implementation tasks completed
- [ ] TypeScript compilation passes with zero errors
- [ ] Unit tests achieve >90% code coverage
- [ ] All 4 missions can be completed successfully
- [ ] Physics calculations match expected results within 1% tolerance
- [ ] Mobile responsive design works on iOS and Android
- [ ] Episode integrates seamlessly with Essayons platform
- [ ] Performance benchmarks met on target devices
