/**
 * Barrel export for all engine modules.
 */

export { TimeController, SPEED_PRESETS } from './TimeController.ts'
export { ParameterSystem } from './ParameterSystem.ts'
export { CanvasRenderer } from './CanvasRenderer.ts'
export { InputHandler } from './InputHandler.ts'
export { MissionManager } from './MissionManager.ts'
export { SimulationEngine } from './SimulationEngine.ts'
export { DiscreteEngine } from './DiscreteEngine.ts'
export { StateMachine } from './StateMachine.ts'
export { TurnManager } from './TurnManager.ts'
export { QualityMonitor } from './adaptive-quality.ts'

export { DEFAULT_ENGINE_CONFIG } from './types.ts'

export type {
  Vector2,
  NumberParam,
  BooleanParam,
  EnumParam,
  Vector2Param,
  ParameterDefinition,
  ParamValueType,
  ParamValues,
  PhysicsState,
  ViewportTransform,
  RenderContext,
  RenderLayer,
  InputBinding,
  InputState,
  ObjectiveStatus,
  MissionObjective,
  MissionPhase,
  MissionDefinition,
  MissionState,
  EngineConfig,
  SimulationState,
  EpisodeDefinition,
  SimulationEngineInterface,
  Unsubscribe,
  Subscribable,
} from './types.ts'

export type { SpeedPreset, TimeControlState } from './TimeController.ts'

export type {
  StepFunction,
  GuardFn,
  ActionFn,
  StateMachineTransition,
  StateMachineConfig,
  TurnOrder,
  ActorDefinition,
  TurnAction,
  ActionValidator,
  TurnConfig,
  DiscreteMode,
  DiscreteEngineConfig,
  DiscreteSimulationState,
} from './discrete-types.ts'

export type { StateMachineSnapshot } from './StateMachine.ts'
export type { TurnManagerSnapshot } from './TurnManager.ts'
export type { QualityLevel, QualitySnapshot } from './adaptive-quality.ts'
