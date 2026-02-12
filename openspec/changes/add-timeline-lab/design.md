# Design: Timeline Lab - Historical Cause & Effect Simulator

## Customer Journey (Fadell's BUILD)

### Discovery Moment

User sees "Timeline Lab - Crash empires. Rewrite history." in the Essayons episode list and immediately understands they can experiment with historical outcomes.

### First 10 Seconds

User clicks Timeline Lab → loads Industrial Revolution scenario → sees factory smokestacks, steam engines, and policy sliders → immediately drags "Technology Investment" slider → sees immediate visual feedback as the timeline updates.

### First Use

User experiments with the Industrial Revolution scenario, discovering how increasing technology investment accelerates industrialization but may increase social unrest. The timeline visualization shows their alternate history diverging from actual events, creating an "aha" moment about historical causation.

### The Wow Moment

User realizes they've accidentally prevented World War I by changing diplomatic policies in 1800s Europe, watching the cascade of effects ripple through the timeline visualization in real-time.

### Return Value

Users return to explore different scenarios (Roman Empire, Space Race), attempt increasingly complex missions, and develop intuitive understanding of how historical forces interact.

## Technical Architecture

### Stack

- **Framework**: Essayons episode system (TypeScript + React + Canvas)
- **Simulation Mode**: `step-based` (discrete time progression)
- **Domain**: `history`
- **Engine**: DiscreteEngine with manual step advancement

### Historical Scenarios

#### Industrial Revolution (1750-1900)

- **Starting Metrics**: Population 750M, Technology Level 2, Economic Output 100, Military Strength 50
- **Key Variables**: Technology Investment (0-50%), Trade Openness (0-100%), Labor Rights (0-100%)
- **Major Events**: Steam Engine (1769), Railways (1825), Telegraph (1844), Electricity (1879)

#### Roman Empire (100-500 AD)

- **Starting Metrics**: Population 50M, Territory 2.5M sq km, Military 300K, Cultural Influence 80
- **Key Variables**: Military Expansion (0-50%), Infrastructure Investment (0-50%), Cultural Integration (0-100%)
- **Major Events**: Antonine Plague (165), Crisis of Third Century (235), Christianity (313), Fall of Rome (476)

#### Space Race (1945-1975)

- **Starting Metrics**: Rocket Technology 1, Satellite Capability 0, Public Support 60%, Budget $1B
- **Key Variables**: R&D Spending (0-10% GDP), International Cooperation (0-100%), Risk Tolerance (0-100%)
- **Major Events**: Sputnik (1957), Gagarin (1961), Apollo 11 (1969)

### Simulation Engine

#### State Structure

```typescript
interface TimelineState {
  scenario: 'industrial' | 'roman' | 'space'
  currentYear: number
  startYear: number
  endYear: number

  // Core metrics (vary by scenario)
  population: number
  technology: number
  economy: number
  military: number
  culture?: number
  territory?: number

  // Event tracking
  triggeredEvents: HistoricalEvent[]
  alternateEvents: HistoricalEvent[]

  // Mission progress
  missionProgress: Record<string, number>
}
```

#### Time Step Calculation

```typescript
function stepTimeline(state: TimelineState, params: PolicyParams): TimelineState {
  const yearDelta = 5 // 5-year steps
  const newYear = state.currentYear + yearDelta

  // Calculate metric changes based on policies
  const populationGrowth = calculatePopulationGrowth(state, params)
  const techAdvancement = calculateTechAdvancement(state, params)
  const economicChange = calculateEconomicChange(state, params)

  // Check for triggered events
  const newEvents = checkHistoricalEvents(newYear, state, params)

  // Apply cascading effects
  return applyPolicyCascades({
    ...state,
    currentYear: newYear,
    population: state.population + populationGrowth,
    technology: state.technology + techAdvancement,
    economy: state.economy + economicChange,
    triggeredEvents: [...state.triggeredEvents, ...newEvents],
  })
}
```

### Rendering System

#### Timeline Visualization

- **Main Canvas**: 800x600px historical timeline with year markers
- **Dual Track**: Actual history (gray) vs. user timeline (accent color)
- **Event Markers**: Circles for major events with hover details
- **Divergence Indicator**: Visual representation of how far alternate timeline has diverged

#### Policy Dashboard

- **Parameter Sliders**: Technology Investment, Trade Policy, Military Spending, Diplomacy
- **Metric Display**: Real-time updating of population, economy, military, culture
- **Step Controls**: Next Step button, auto-advance toggle, reset to checkpoint

### Mission System

#### Mission 1: Rewrite the Industrial Revolution

- **Objective**: Achieve 50% higher economic output by 1900 without triggering social revolution
- **Success Criteria**: `economy >= 150 && socialUnrest < 80`
- **Teaching Goal**: Balance of technological progress with social stability

#### Mission 2: Save the Roman Empire

- **Objective**: Extend Roman Empire to 600 AD without losing more than 20% territory
- **Success Criteria**: `currentYear >= 600 && territory >= 80% of starting`
- **Teaching Goal**: Sustainable expansion vs. overextension

#### Mission 3: Win the Space Race Early

- **Objective**: Land on the moon by 1965 with international cooperation
- **Success Criteria**: `moonLanding <= 1965 && cooperation >= 60`
- **Teaching Goal**: Collaboration accelerates innovation

#### Mission 4: The Butterfly Effect

- **Objective**: Make one small change that creates the largest timeline divergence
- **Success Criteria**: `divergenceScore >= 75` with minimal initial changes
- **Teaching Goal**: Small causes, large effects in complex systems

## Visual Direction

### Colors & Typography

- **Accent Color**: `#E9C46A` (history domain color)
- **Timeline Colors**: Actual history (gray), alternate timeline (accent)
- **Typography**: Clean, readable fonts for historical text and data displays

### Historical Authenticity

- **Visual Elements**: Period-appropriate imagery (steam engines, Roman legions, rockets)
- **Event Descriptions**: Historically accurate context with counterfactual implications
- **Data Visualization**: Charts and graphs that feel educational but engaging

### Mobile Responsiveness

- **Touch-Friendly**: Large sliders and buttons for policy adjustment
- **Responsive Timeline**: Horizontal scrolling timeline on mobile
- **Collapsible Panels**: Policy controls and metrics collapse to save screen space
