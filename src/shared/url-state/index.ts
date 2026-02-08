/**
 * Public API for URL-based state sharing.
 *
 * Re-exports types, codec functions, validation, the React hook,
 * and the ShareButton component from a single entry point.
 */

export type {
  ParameterSchema,
  NumberParameterSchema,
  BooleanParameterSchema,
  StringParameterSchema,
  EnumParameterSchema,
  ParameterValue,
  ParameterValues,
  ValidationResult,
  UseUrlStateResult,
} from './types.ts'

export { URL_LENGTH_THRESHOLD, COMPRESSED_PARAM_KEY } from './types.ts'

export {
  registerEpisodeParams,
  getEpisodeParams,
  unregisterEpisodeParams,
  clearRegistry,
  ORBIT_LAB_PARAMS,
} from './registry.ts'

export { encodeState, decodeState } from './codec.ts'

export { validateParams } from './validator.ts'

export { useUrlState } from './use-url-state.ts'

export { ShareButton } from './ShareButton.tsx'
export type { ShareButtonProps } from './ShareButton.tsx'
