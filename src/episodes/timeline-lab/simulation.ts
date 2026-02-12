import type { TimelineState, PolicyParams, HistoricalEvent, HistoricalScenario } from './types'
import type { ParamValues } from '../../engine/types'

// Historical event databases for each scenario
const INDUSTRIAL_EVENTS: HistoricalEvent[] = [
  {
    year: 1769,
    title: 'Steam Engine Patent',
    description: 'James Watt improves steam engine efficiency',
    actual: true,
    impact: { technology: 5, economy: 3 },
  },
  {
    year: 1825,
    title: 'First Railway Opens',
    description: 'Stockton & Darlington Railway begins operation',
    actual: true,
    impact: { economy: 4, population: 2 },
  },
  {
    year: 1844,
    title: 'Telegraph Invented',
    description: 'Samuel Morse sends first telegraph message',
    actual: true,
    impact: { technology: 3, economy: 2, culture: 2 },
  },
  {
    year: 1879,
    title: 'Electric Light',
    description: 'Edison demonstrates practical electric light',
    actual: true,
    impact: { technology: 6, culture: 3 },
  },
]

const ROMAN_EVENTS: HistoricalEvent[] = [
  {
    year: 165,
    title: 'Antonine Plague',
    description: 'Devastating plague sweeps the empire',
    actual: true,
    impact: { population: -15, economy: -8, military: -5 },
  },
  {
    year: 235,
    title: 'Crisis of Third Century',
    description: 'Period of civil wars and economic collapse',
    actual: true,
    impact: { economy: -12, military: -8, territory: -5 },
  },
  {
    year: 313,
    title: 'Constantine Conversion',
    description: 'Emperor converts to Christianity',
    actual: true,
    impact: { culture: 8, military: -2 },
  },
  {
    year: 476,
    title: 'Fall of Rome',
    description: 'Last Western Roman Emperor deposed',
    actual: true,
    impact: { territory: -50, military: -30, culture: -20 },
  },
]

const SPACE_EVENTS: HistoricalEvent[] = [
  {
    year: 1957,
    title: 'Sputnik Launch',
    description: 'Soviet Union launches first artificial satellite',
    actual: true,
    impact: { technology: 8, population: 10 },
  },
  {
    year: 1961,
    title: 'Gagarin Flight',
    description: 'First human in space',
    actual: true,
    impact: { technology: 6, population: 8 },
  },
  {
    year: 1969,
    title: 'Apollo 11',
    description: 'First humans land on the moon',
    actual: true,
    impact: { technology: 12, culture: 10, territory: 5 },
  },
  {
    year: 1975,
    title: 'Apollo-Soyuz',
    description: 'Joint US-Soviet mission in space',
    actual: true,
    impact: { territory: 8, culture: 6 },
  },
]

// Scenario configurations
const SCENARIO_CONFIGS = {
  industrial: {
    startYear: 1750,
    endYear: 1900,
    startingValues: {
      population: 750, // millions
      technology: 15,
      economy: 100,
      military: 25,
      culture: 40,
      territory: 50, // not used
    },
    events: INDUSTRIAL_EVENTS,
  },
  roman: {
    startYear: 100,
    endYear: 500,
    startingValues: {
      population: 50, // millions
      technology: 20,
      economy: 80,
      military: 60,
      culture: 70,
      territory: 25, // million sq km
    },
    events: ROMAN_EVENTS,
  },
  space: {
    startYear: 1945,
    endYear: 1975,
    startingValues: {
      population: 60, // public support %
      technology: 10,
      economy: 50, // budget billions
      military: 40, // program strength
      culture: 30,
      territory: 20, // international cooperation %
    },
    events: SPACE_EVENTS,
  },
} as const

export function createInitialState(params: ParamValues = {}): TimelineState {
  const scenario = (params.scenario as HistoricalScenario) || 'industrial'
  const config = SCENARIO_CONFIGS[scenario]

  return {
    scenario,
    currentYear: config.startYear,
    startYear: config.startYear,
    endYear: config.endYear,
    ...config.startingValues,
    triggeredEvents: [],
    actualEvents: [...config.events],
    missionProgress: {},
    divergenceScore: 0,
  }
}

export function stepTimelineState(
  state: TimelineState,
  params: ParamValues,
  _dt: number,
): TimelineState {
  const policyParams: PolicyParams = {
    technologyInvestment: (params.technologyInvestment as number) || 20,
    tradeOpenness: (params.tradeOpenness as number) || 50,
    militarySpending: (params.militarySpending as number) || 15,
    culturalPriority: (params.culturalPriority as number) || 30,
  }

  const yearStep = 5 // Advance 5 years per step
  const newYear = Math.min(state.currentYear + yearStep, state.endYear)

  // Calculate metric changes based on policies and scenario
  const changes = calculateMetricChanges(state, policyParams)

  const newState: TimelineState = {
    ...state,
    currentYear: newYear,
    population: Math.max(0, state.population + changes.population),
    technology: Math.min(100, Math.max(0, state.technology + changes.technology)),
    economy: Math.max(0, state.economy + changes.economy),
    military: Math.max(0, state.military + changes.military),
    culture: Math.min(100, Math.max(0, state.culture + changes.culture)),
    territory: Math.max(0, state.territory + changes.territory),
  }

  // Check for triggered events
  const triggeredEvents = checkEventTriggers(newState, policyParams)
  newState.triggeredEvents.push(...triggeredEvents)

  // Apply event impacts
  for (const event of triggeredEvents) {
    if (event.impact.population) newState.population += event.impact.population
    if (event.impact.technology) newState.technology += event.impact.technology
    if (event.impact.economy) newState.economy += event.impact.economy
    if (event.impact.military) newState.military += event.impact.military
    if (event.impact.culture) newState.culture += event.impact.culture
    if (event.impact.territory) newState.territory += event.impact.territory
  }

  // Calculate divergence from actual history
  newState.divergenceScore = calculateDivergence(newState)

  return newState
}

function calculateMetricChanges(state: TimelineState, params: PolicyParams) {
  const techBonus = params.technologyInvestment / 100
  const tradeBonus = params.tradeOpenness / 100
  const militaryDrain = params.militarySpending / 100
  const culturalBonus = params.culturalPriority / 100

  // Base growth rates vary by scenario
  let baseRates
  switch (state.scenario) {
    case 'industrial':
      baseRates = {
        population: 2.0, // % per step
        technology: 1.5,
        economy: 2.5,
        military: 0.5,
        culture: 1.0,
        territory: 0,
      }
      break
    case 'roman':
      baseRates = {
        population: 0.8,
        technology: 0.3,
        economy: 1.2,
        military: 0.8,
        culture: 0.6,
        territory: 0.2,
      }
      break
    case 'space':
      baseRates = {
        population: 1.0, // public support
        technology: 2.0,
        economy: 0.5, // budget growth
        military: 1.0, // program strength
        culture: 0.8,
        territory: 0.3, // international cooperation
      }
      break
  }

  return {
    population: baseRates.population * (1 + 0.5 * tradeBonus - 0.3 * militaryDrain),
    technology: baseRates.technology * (1 + 2 * techBonus + 0.5 * tradeBonus),
    economy: baseRates.economy * (1 + 0.8 * techBonus + 0.6 * tradeBonus - 0.4 * militaryDrain),
    military: baseRates.military * (1 + 3 * militaryDrain - 0.2 * culturalBonus),
    culture: baseRates.culture * (1 + 2 * culturalBonus + 0.3 * tradeBonus),
    territory: baseRates.territory * (1 + 0.5 * militaryDrain + 0.3 * culturalBonus),
  }
}

function checkEventTriggers(state: TimelineState, params: PolicyParams): HistoricalEvent[] {
  const triggered: HistoricalEvent[] = []
  const scenarioConfig = SCENARIO_CONFIGS[state.scenario]

  // Check if we're past any actual historical events that we might have prevented/altered
  for (const actualEvent of scenarioConfig.events) {
    if (actualEvent.year <= state.currentYear) {
      const shouldTrigger = evaluateEventTrigger(actualEvent, state, params)
      if (!shouldTrigger) {
        // Event was prevented - create alternate event
        const alternateEvent: HistoricalEvent = {
          ...actualEvent,
          actual: false,
          title: `Alternate: ${actualEvent.title}`,
          description: `Alternative outcome: ${actualEvent.description}`,
          impact: scaleImpact(actualEvent.impact, 0.5), // Reduced impact for alternate events
        }
        triggered.push(alternateEvent)
      }
    }
  }

  return triggered
}

function evaluateEventTrigger(
  _event: HistoricalEvent,
  state: TimelineState,
  _params: PolicyParams,
): boolean {
  // Simplified logic - events are more likely to happen as historically if we follow similar policies
  const historicalProbability = 0.8

  // Adjust probability based on how much we've diverged
  const divergenceReduction = state.divergenceScore / 200 // 0 to 0.5
  const adjustedProbability = Math.max(0.2, historicalProbability - divergenceReduction)

  return Math.random() < adjustedProbability
}

function scaleImpact(impact: Record<string, number>, scale: number): Record<string, number> {
  const scaled: Record<string, number> = {}
  for (const [key, value] of Object.entries(impact)) {
    scaled[key] = Math.round(value * scale)
  }
  return scaled
}

function calculateDivergence(state: TimelineState): number {
  const config = SCENARIO_CONFIGS[state.scenario]
  const expectedValues = extrapolateHistoricalValues(config, state.currentYear, state.scenario)

  const differences = [
    Math.abs(state.population - (expectedValues.population || 0)) /
      Math.max(1, expectedValues.population || 1),
    Math.abs(state.technology - (expectedValues.technology || 0)) /
      Math.max(1, expectedValues.technology || 1),
    Math.abs(state.economy - (expectedValues.economy || 0)) /
      Math.max(1, expectedValues.economy || 1),
    Math.abs(state.military - (expectedValues.military || 0)) /
      Math.max(1, expectedValues.military || 1),
    Math.abs(state.culture - (expectedValues.culture || 0)) /
      Math.max(1, expectedValues.culture || 1),
  ]

  if (state.scenario === 'roman') {
    differences.push(
      Math.abs(state.territory - (expectedValues.territory || 0)) /
        Math.max(1, expectedValues.territory || 1),
    )
  }

  const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length
  return Math.min(100, averageDifference * 100)
}

function extrapolateHistoricalValues(
  config: (typeof SCENARIO_CONFIGS)[keyof typeof SCENARIO_CONFIGS],
  currentYear: number,
  scenario: string,
) {
  const progress = (currentYear - config.startYear) / (config.endYear - config.startYear)
  const growthRates = {
    industrial: { population: 2.0, technology: 3.0, economy: 2.8, military: 1.2, culture: 1.5 },
    roman: {
      population: -0.5,
      technology: 0.1,
      economy: -1.0,
      military: -0.8,
      culture: -0.3,
      territory: -1.2,
    },
    space: {
      population: 1.5,
      technology: 4.0,
      economy: 1.8,
      military: 2.2,
      culture: 1.0,
      territory: 0.8,
    },
  }

  const rates =
    (growthRates as Record<string, Record<string, number>>)[scenario] || growthRates.industrial
  const expected: Record<string, number> = {}

  for (const [metric, startValue] of Object.entries(config.startingValues)) {
    const rate = (rates as Record<string, number>)[metric] || 0
    expected[metric] = (startValue as number) + rate * progress * 10 // 10 steps over the period
  }

  return expected
}

// Mission check functions
export function checkIndustrialSuccess(state: TimelineState): boolean {
  return (
    state.scenario === 'industrial' &&
    state.currentYear >= 1900 &&
    state.economy >= 150 &&
    state.divergenceScore < 60
  ) // Not too much social upheaval
}

export function checkRomanSurvival(state: TimelineState): boolean {
  return state.scenario === 'roman' && state.currentYear >= 500 && state.territory >= 20 // At least 80% of starting territory (25)
}

export function checkSpaceSuccess(state: TimelineState): boolean {
  return (
    state.scenario === 'space' &&
    state.currentYear >= 1965 &&
    state.technology >= 80 &&
    state.territory >= 60
  ) // High international cooperation
}

export function checkButterflyEffect(state: TimelineState): boolean {
  // Success if we achieve high divergence (75+)
  return state.divergenceScore >= 75
}
