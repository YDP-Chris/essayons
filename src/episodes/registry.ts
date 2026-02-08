/**
 * Central episode registry.
 *
 * Stores EpisodeConfig instances and provides lookup by id and domain.
 * The registry is a singleton module — import it from anywhere to register
 * or retrieve episodes.
 */

import type { EpisodeConfig, EpisodeDomain } from './types.ts'

// ---------------------------------------------------------------------------
// Internal store
// ---------------------------------------------------------------------------

const episodes: Map<string, EpisodeConfig> = new Map()

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register an episode configuration.
 * Overwrites any previously registered config with the same id.
 */
export function registerEpisode(config: EpisodeConfig): void {
  episodes.set(config.id, config)
}

/** Retrieve an episode configuration by id. */
export function getEpisode(id: string): EpisodeConfig | undefined {
  return episodes.get(id)
}

/** Return all registered episode configurations, ordered by registration. */
export function getAllEpisodes(): EpisodeConfig[] {
  return Array.from(episodes.values())
}

/** Return all episodes belonging to a specific domain. */
export function getEpisodesByDomain(domain: EpisodeDomain): EpisodeConfig[] {
  return Array.from(episodes.values()).filter((ep) => ep.domain === domain)
}

/**
 * Remove all registered episodes.
 * Primarily useful in tests.
 */
export function clearRegistry(): void {
  episodes.clear()
}
