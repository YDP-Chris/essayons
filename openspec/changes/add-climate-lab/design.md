# Design: Climate Lab - Energy Balance & Feedback Simulator

## Customer Journey (Fadell's BUILD)

### Discovery Moment

User lands on Climate Lab from Essayons physics domain. The subtitle "Crash climates. Find equilibrium." immediately signals this is about experimentation, not passive learning.

### First 10 Seconds (CRITICAL)

1. **Immediate Visual**: Earth rendered in center with clear temperature color (likely blue-green baseline)
2. **Obvious Controls**: 4 labeled sliders (CO2, Albedo, Solar, Volcanic) positioned intuitively
3. **Clear Action**: Big "Advance Step" button invites first interaction
4. **Context**: Mission panel shows "Balance the Budget" as starting objective

The interface answers: "What can I do?" (adjust parameters), "What will happen?" (Earth changes), "Why does this matter?" (complete missions).

### First Use

User instinctively moves CO2 slider upward. Immediate visual feedback: Earth shifts toward yellow/orange, ice coverage shrinks slightly, atmosphere layer thickens. User clicks "Advance Step" and sees temperature number increase. **Cause and effect established within 20 seconds.**

### The Wow Moment

User discovers ice-albedo feedback: As temperature rises, ice melts (albedo drops), which increases absorption, which increases temperature further. The system **amplifies itself**. This non-linear behavior is the core insight - climate isn't just input/output, it has internal feedback loops that create tipping points.

Alternative wow: User tries to achieve 1.5°C warming and overshoots to +5°C, then realizes how sensitive the system is to small parameter changes.

### Return Value

- **Progressive Challenge**: 4 missions increase in complexity
- **Exploration Space**: Thousands of parameter combinations to explore
- **Teaching Tool**: Instructors can use for climate education
- **Personal Understanding**: Users return to test their intuitions about climate sensitivity

## Technical Architecture

### Stack Decision: Step-Based Simulation

**Why Step-Based vs Continuous**: Climate operates on long timescales (years/decades), making step-based more natural than real-time continuous simulation. Users make policy decisions (adjust parameters) then observe results - this mirrors real climate action.

**Integration**: Uses existing `DiscreteEngine` with manual/auto-advance modes.

### Physics Model Design

**Simplified Energy Balance Model**:

```
Energy In = Solar × (1 - Albedo) × π × R²
Energy Out = σ × T⁴ × 4π × R² × ε
Equilibrium: Energy In = Energy Out
```

**Radiative Forcing from CO2**:

```
ΔF = 5.35 × ln(CO2/CO2_ref) W/m²
ΔT = ΔF × climate_sensitivity
```

**Ice-Albedo Feedback**:

```
If T > T_melt_threshold: albedo decreases
If T < T_freeze_threshold: albedo increases
```

**Why Simplified**: Full climate models have hundreds of variables. This educational model focuses on the core energy balance concept while remaining computationally lightweight.

### File Structure

```
src/episodes/climate-lab/
├── index.ts                    # Episode registration
├── config.ts                   # EpisodeConfig with parameters/missions
├── types.ts                    # ClimateState interface
├── simulation.ts               # Energy balance physics
├── renderer.ts                 # Canvas Earth visualization
├── climate-lab.test.ts         # Unit tests
└── missions/
    ├── balance-budget.ts       # Mission 1: Energy equilibrium
    ├── ice-age.ts             # Mission 2: Trigger cooling
    ├── runaway-greenhouse.ts   # Mission 3: Venus scenario
    └── stabilize-warming.ts    # Mission 4: 1.5°C target
```

### State Management

```typescript
interface ClimateState {
  // Physics
  temperature: number // °C relative to baseline
  energyIn: number // W/m² solar input
  energyOut: number // W/m² thermal output
  energyBalance: number // W/m² net balance

  // Parameters
  co2Concentration: number // ppm
  albedo: number // 0-1 reflectivity
  solarOutput: number // W/m² irradiance
  volcanicCooling: number // 0-5 cooling factor

  // Visual
  iceExtent: number // 0-1 fraction
  atmosphereThickness: number // 0-1 visual weight
}
```

### Canvas Rendering Strategy

**Earth Visualization**:

- **Base**: Circle with temperature-driven color (HSL transition)
- **Ice**: White polar caps that shrink/expand with albedo
- **Atmosphere**: Semi-transparent overlay with opacity tied to CO2
- **Indicators**: Temperature readout, energy balance arrows

**Performance**:

- Render only on state changes (not every frame)
- Use requestAnimationFrame for smooth updates
- Optimize with dirty flag pattern

### Mission Design Philosophy

Each mission teaches a different climate concept:

1. **Balance Budget** → Energy balance fundamentals
2. **Ice Age** → Cooling feedback loops
3. **Runaway Greenhouse** → Warming tipping points
4. **Stabilize 1.5°C** → Precision and climate sensitivity

Success criteria are physics-based, not arbitrary targets.

## Visual Direction

### Color Palette

- **Domain Accent**: #00D4AA (physics domain color)
- **Temperature Scale**: Blue (cold) → Green (baseline) → Yellow (warm) → Red (hot)
- **Ice**: Pure white (#FFFFFF)
- **Atmosphere**: Semi-transparent blue-white (#E8F4F8 at 30% opacity)

### Typography & Layout

- **Parameters**: Left panel with clear slider labels
- **Visualization**: Center canvas with Earth prominently displayed
- **Missions**: Right panel with objective and progress
- **Controls**: Bottom with step/auto-advance buttons

### Responsive Design

- **Desktop**: Side-by-side parameter/visualization/mission layout
- **Tablet**: Stacked with visualization at top
- **Mobile**: Collapsed panels with tabbed interface

### Animation Strategy

- **Parameter Changes**: Immediate visual update (< 100ms)
- **Step Transitions**: Smooth 300ms eased transitions
- **Mission Success**: Celebration animation with color flash
- **No Gratuitous Animation**: Every animation serves educational purpose

## Key Technical Decisions

### Client-Side Only

All physics computations happen in browser. No server required for real-time climate modeling - simplified energy balance model is lightweight enough for JavaScript execution.

### Pure Functions

All simulation logic uses pure functions for predictability and testability:

```typescript
export function updateClimateState(
  currentState: ClimateState,
  parameters: ClimateParameters,
): ClimateState {
  // Always returns new state object
}
```

### TypeScript Strict Mode

No `any` types. Full type safety for physics calculations and state management.

### Canvas over SVG

Canvas provides better performance for real-time Earth rendering and temperature color transitions than SVG DOM manipulation.

### Integration Points

- Uses Essayons `DiscreteEngine` for step management
- Follows established episode configuration patterns
- Integrates with parameter system, mission manager, and reference panel
- Supports existing keyboard shortcuts and accessibility features

This design creates an intuitive, educational, and technically robust climate simulation that fits seamlessly into the Essayons platform while teaching fundamental climate physics through hands-on experimentation.
