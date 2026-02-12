import type {
  EpisodeDefinition,
  ParameterDefinition,
  MissionDefinition,
  RenderContext,
  SimulationEngineInterface,
} from '../../engine/types'
import type {
  ParamValues,
  PhysicsState,
  NumberParam,
  EnumParam,
  ObjectiveStatus,
} from '../../engine/types'
import { registerEpisode, registerEpisodeDefinition } from '../registry'

// Import episode components
import { timelineLabConfig } from './config'
import type { TimelineState } from './types'
import {
  createInitialState,
  stepTimelineState,
  checkIndustrialSuccess,
  checkRomanSurvival,
  checkSpaceSuccess,
  checkButterflyEffect,
} from './simulation'
import { renderTimeline } from './renderer'

// Create mission check functions map
const missionChecks: Record<string, (state: TimelineState) => boolean> = {
  checkIndustrialSuccess,
  checkRomanSurvival,
  checkSpaceSuccess,
  checkButterflyEffect,
}

// Map EpisodeConfig parameters to ParameterDefinitions
const parameterDefinitions: ParameterDefinition[] = timelineLabConfig.parameters.map((param) => {
  if (param.type === 'enum') {
    return {
      type: 'enum' as const,
      key: param.id,
      label: param.label,
      default: param.default as string,
      options: (param.options as string[]).map((value) => ({ value, label: value })),
    } as EnumParam
  } else {
    return {
      type: 'number' as const,
      key: param.id,
      label: param.label,
      default: param.default as number,
      min: param.min ?? 0,
      max: param.max ?? 100,
      step: param.step ?? 1,
      unit: param.unit,
    } as NumberParam
  }
})

// Map EpisodeConfig missions to MissionDefinitions
const missionDefinitions: MissionDefinition[] = timelineLabConfig.missions.map((mission) => ({
  id: mission.id,
  name: mission.title,
  description: mission.briefing,
  objectives: mission.objectives.map((obj) => ({
    id: obj.id,
    label: obj.description,
  })),
  evaluate: (state: PhysicsState, _params: ParamValues, _simulationTime: number) => {
    return mission.objectives.map((obj) => {
      const checkFunction = missionChecks[obj.check]
      const success = checkFunction ? checkFunction(state as unknown as TimelineState) : false
      return {
        id: obj.id,
        status: success ? ('completed' as ObjectiveStatus) : ('pending' as ObjectiveStatus),
      }
    })
  },
}))

// Create the EpisodeDefinition
const timelineLabDefinition: EpisodeDefinition = {
  id: timelineLabConfig.id,
  name: timelineLabConfig.title,
  description: timelineLabConfig.description,
  accentColor: '#E9C46A', // History domain color

  parameters: parameterDefinitions,
  missions: missionDefinitions,

  init(_engine: SimulationEngineInterface): void {
    // Initialize any resources if needed
    // For Timeline Lab, no special initialization required
  },

  createInitialState(params?: ParamValues): PhysicsState {
    return createInitialState(params) as unknown as PhysicsState
  },

  update(state: PhysicsState, params: ParamValues, dt: number): PhysicsState {
    return stepTimelineState(
      state as unknown as TimelineState,
      params,
      dt,
    ) as unknown as PhysicsState
  },

  render(ctx: RenderContext, state: PhysicsState, params: ParamValues): void {
    renderTimeline(ctx, state as unknown as TimelineState, params, ctx.width, ctx.height)
  },

  cleanup(): void {
    // Clean up any resources
    // For Timeline Lab, no cleanup required
  },
}

// Register the episode
registerEpisode(timelineLabConfig)
registerEpisodeDefinition(timelineLabDefinition)

// Export for potential external use
export { timelineLabConfig, timelineLabDefinition }
export type { TimelineState }
export { createInitialState, stepTimelineState, renderTimeline }
