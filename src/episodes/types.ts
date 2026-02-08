/**
 * Episode configuration types for the config-driven episode authoring system.
 *
 * An EpisodeConfig fully describes an episode's identity, parameters,
 * equations, missions, reference content, and render layers. The episode
 * factory system consumes these configs to produce complete episode UIs
 * without bespoke per-episode component code.
 */

// ---------------------------------------------------------------------------
// Simulation Mode
// ---------------------------------------------------------------------------

/** The simulation update strategy for an episode. */
export type SimulationMode = 'continuous' | 'step-based' | 'event-driven' | 'turn-based'

/** The subject-matter domain an episode belongs to. */
export type EpisodeDomain =
  | 'physics'
  | 'civics'
  | 'economics'
  | 'history'
  | 'biology'
  | 'engineering'

// ---------------------------------------------------------------------------
// Episode Config (top-level)
// ---------------------------------------------------------------------------

/** Complete declarative description of an episode. */
export interface EpisodeConfig {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly domain: EpisodeDomain
  readonly simulationMode: SimulationMode
  readonly description: string
  readonly parameters: readonly ParameterConfig[]
  readonly equations: readonly EquationConfig[]
  readonly missions: readonly MissionConfig[]
  readonly referenceContent: readonly ReferenceConfig[]
  readonly initialState: Record<string, unknown>
  readonly renderLayers: readonly RenderLayerConfig[]
  readonly i18n?: Partial<Record<string, EpisodeI18nOverride>>
}

/** Locale-specific overrides for episode content. */
export interface EpisodeI18nOverride {
  readonly title?: string
  readonly subtitle?: string
  readonly description?: string
  readonly missions?: readonly {
    readonly id: string
    readonly title?: string
    readonly briefing?: string
    readonly objectives?: readonly {
      readonly id: string
      readonly description?: string
    }[]
    readonly hints?: readonly string[]
    readonly successMessage?: string
  }[]
  readonly referenceContent?: readonly {
    readonly id: string
    readonly title?: string
    readonly content?: string
  }[]
}

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

/** Type discriminator for parameter configs. */
export type ParameterType = 'number' | 'boolean' | 'enum' | 'vector2'

/** Declarative parameter definition with UI hints and constraints. */
export interface ParameterConfig {
  readonly id: string
  readonly label: string
  readonly type: ParameterType
  readonly default: unknown
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly unit?: string
  readonly options?: readonly string[]
  readonly description?: string
}

// ---------------------------------------------------------------------------
// Equations
// ---------------------------------------------------------------------------

/** A mathematical equation displayed in the reference/education panel. */
export interface EquationConfig {
  readonly id: string
  readonly label: string
  readonly latex: string
  readonly description: string
  readonly variables: Readonly<Record<string, string>>
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

/** A mission (challenge) the learner can attempt within the episode. */
export interface MissionConfig {
  readonly id: string
  readonly title: string
  readonly briefing: string
  readonly objectives: readonly ObjectiveConfig[]
  readonly hints?: readonly string[]
  readonly successMessage: string
  readonly initialParams?: Readonly<Record<string, unknown>>
}

/** A single measurable objective within a mission. */
export interface ObjectiveConfig {
  readonly id: string
  readonly description: string
  /** Function name in the episode module to call for evaluation. */
  readonly check: string
  readonly target?: number
  readonly tolerance?: number
}

// ---------------------------------------------------------------------------
// Reference Content
// ---------------------------------------------------------------------------

/** Category of reference content. */
export type ReferenceCategory = 'concept' | 'equation' | 'history' | 'fun-fact'

/** A piece of educational reference content. */
export interface ReferenceConfig {
  readonly id: string
  readonly title: string
  /** Markdown-formatted content body. */
  readonly content: string
  readonly category: ReferenceCategory
}

// ---------------------------------------------------------------------------
// Render Layers
// ---------------------------------------------------------------------------

/** A named render layer with z-ordering for the Canvas renderer. */
export interface RenderLayerConfig {
  readonly id: string
  readonly zIndex: number
  /** Function name in the episode module that performs drawing. */
  readonly render: string
}

// ---------------------------------------------------------------------------
// Validation Result
// ---------------------------------------------------------------------------

/** Result of validating an EpisodeConfig. */
export interface ValidationResult {
  readonly valid: boolean
  readonly errors: readonly string[]
}
