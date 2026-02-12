export type HistoricalScenario = 'industrial' | 'roman' | 'space'

export interface HistoricalEvent {
  year: number
  title: string
  description: string
  actual: boolean // true for actual history, false for alternate timeline
  impact: {
    population?: number
    technology?: number
    economy?: number
    military?: number
    culture?: number
    territory?: number
  }
}

export interface TimelineState {
  // Scenario configuration
  scenario: HistoricalScenario
  currentYear: number
  startYear: number
  endYear: number

  // Core metrics (meanings vary by scenario)
  population: number // Industrial: millions, Roman: millions, Space: % public support
  technology: number // 0-100 scale representing advancement
  economy: number // Industrial: GDP index, Roman: trade volume, Space: budget billions
  military: number // Industrial: army size, Roman: legions, Space: program strength
  culture: number // 0-100 scale representing cultural influence/development
  territory: number // Industrial: N/A, Roman: sq km millions, Space: international cooperation

  // Event tracking
  triggeredEvents: HistoricalEvent[]
  actualEvents: HistoricalEvent[]

  // Mission tracking
  missionProgress: Record<string, number>

  // Divergence tracking
  divergenceScore: number // 0-100, how far we've diverged from actual history
}

export interface PolicyParams {
  technologyInvestment: number // 0-50, percentage of resources
  tradeOpenness: number // 0-100, how open to trade/cooperation
  militarySpending: number // 0-50, percentage of resources
  culturalPriority: number // 0-100, focus on culture/diplomacy
}
