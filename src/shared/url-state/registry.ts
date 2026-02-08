/**
 * Episode parameter registry.
 *
 * Each episode registers its shareable parameters here so the URL codec
 * knows which parameters to encode/decode without episode-specific logic.
 */

import type { ParameterSchema } from './types.ts'

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry = new Map<string, readonly ParameterSchema[]>()

/** Register an episode's shareable parameter schemas. */
export function registerEpisodeParams(
  episodeId: string,
  schemas: readonly ParameterSchema[],
): void {
  registry.set(episodeId, schemas)
}

/** Retrieve the parameter schemas for a given episode. */
export function getEpisodeParams(episodeId: string): readonly ParameterSchema[] | undefined {
  return registry.get(episodeId)
}

/** Remove an episode's parameter schemas (useful for testing). */
export function unregisterEpisodeParams(episodeId: string): void {
  registry.delete(episodeId)
}

/** Clear all registered episodes (useful for testing). */
export function clearRegistry(): void {
  registry.clear()
}

// ---------------------------------------------------------------------------
// Orbit Lab Parameters (first registered episode)
// ---------------------------------------------------------------------------

export const ORBIT_LAB_PARAMS: readonly ParameterSchema[] = [
  {
    type: 'number',
    key: 'angle',
    label: 'Launch Angle',
    default: 45,
    min: 0,
    max: 360,
    alias: 'a',
  },
  {
    type: 'number',
    key: 'velocity',
    label: 'Velocity',
    default: 7800,
    min: 0,
    max: 20000,
    alias: 'v',
  },
  {
    type: 'enum',
    key: 'mission',
    label: 'Mission',
    options: ['freeplay', 'leo', 'geo', 'escape'],
    default: 'freeplay',
    alias: 'm',
  },
  {
    type: 'number',
    key: 'timeWarp',
    label: 'Time Warp',
    default: 1,
    min: 1,
    max: 100,
    alias: 't',
  },
] as const

registerEpisodeParams('orbit-lab', ORBIT_LAB_PARAMS)
