/**
 * Public API for the episode authoring system.
 *
 * Re-exports types, registry functions, validation, and React components.
 */

// ---- Types ----
export type {
  SimulationMode,
  EpisodeDomain,
  EpisodeConfig,
  ParameterType,
  ParameterConfig,
  EquationConfig,
  MissionConfig,
  ObjectiveConfig,
  ReferenceCategory,
  ReferenceConfig,
  RenderLayerConfig,
  ValidationResult,
} from './types.ts'

// ---- Registry ----
export {
  registerEpisode,
  getEpisode,
  getAllEpisodes,
  getEpisodesByDomain,
  clearRegistry,
} from './registry.ts'

// ---- Validation ----
export { validateConfig } from './validate-config.ts'

// ---- Components ----
export { EpisodeShell } from './EpisodeShell.tsx'
export type { EpisodeShellProps } from './EpisodeShell.tsx'

export { ParameterPanel } from './ParameterPanel.tsx'
export type { ParameterPanelProps } from './ParameterPanel.tsx'

export { MissionPanel } from './MissionPanel.tsx'
export type { MissionPanelProps } from './MissionPanel.tsx'

export { ReferencePanel } from './ReferencePanel.tsx'
export type { ReferencePanelProps } from './ReferencePanel.tsx'
