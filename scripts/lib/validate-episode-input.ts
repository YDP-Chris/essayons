/**
 * Validates episode input from JSON config before file generation.
 * Provides CLI-friendly error messages for common issues.
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const VALID_DOMAINS = ['physics', 'civics', 'economics', 'history', 'biology', 'engineering']
const VALID_SIM_MODES = ['continuous', 'step-based', 'event-driven', 'turn-based']

/**
 * Validate episode input configuration from JSON.
 * Returns structured errors for each invalid field.
 */
export function validateEpisodeInput(
  config: unknown,
  options?: { force?: boolean },
): ValidationResult {
  const errors: ValidationError[] = []

  // Check it's a valid object
  if (typeof config !== 'object' || config === null) {
    return {
      valid: false,
      errors: [{ field: 'config', message: 'Config must be a non-null object' }],
    }
  }

  const c = config as Record<string, unknown>

  // Check required fields
  if (!c.id || typeof c.id !== 'string') {
    errors.push({ field: 'id', message: 'Episode ID is required and must be a string' })
  } else {
    // Validate kebab-case format
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(c.id)) {
      errors.push({ field: 'id', message: 'Episode ID must be kebab-case (e.g., "my-episode")' })
    }
    // Check for duplicate
    if (!options?.force) {
      const episodeDir = resolve('src/episodes', c.id)
      if (existsSync(episodeDir)) {
        errors.push({
          field: 'id',
          message: `Episode directory already exists: ${episodeDir}. Use --force to overwrite.`,
        })
      }
    }
  }

  // Check title
  if (!c.title || typeof c.title !== 'string' || c.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Episode title is required and must be a non-empty string',
    })
  }

  // Check subtitle
  if (!c.subtitle || typeof c.subtitle !== 'string' || c.subtitle.trim().length === 0) {
    errors.push({
      field: 'subtitle',
      message: 'Episode subtitle is required and must be a non-empty string',
    })
  }

  // Check description
  if (!c.description || typeof c.description !== 'string' || c.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Episode description is required and must be a non-empty string',
    })
  }

  // Check domain
  if (!VALID_DOMAINS.includes(c.domain as string)) {
    errors.push({ field: 'domain', message: `Domain must be one of: ${VALID_DOMAINS.join(', ')}` })
  }

  // Check simulationMode
  if (!VALID_SIM_MODES.includes(c.simulationMode as string)) {
    errors.push({
      field: 'simulationMode',
      message: `Simulation mode must be one of: ${VALID_SIM_MODES.join(', ')}`,
    })
  }

  // Check parameters (optional, but if provided must be array)
  if (c.parameters !== undefined && !Array.isArray(c.parameters)) {
    errors.push({ field: 'parameters', message: 'Parameters must be an array if provided' })
  }

  // Check missions (optional, but if provided must be array)
  if (c.missions !== undefined && !Array.isArray(c.missions)) {
    errors.push({ field: 'missions', message: 'Missions must be an array if provided' })
  }

  // Check equations (optional, but if provided must be array)
  if (c.equations !== undefined && !Array.isArray(c.equations)) {
    errors.push({ field: 'equations', message: 'Equations must be an array if provided' })
  }

  // Check referenceContent (optional, but if provided must be array)
  if (c.referenceContent !== undefined && !Array.isArray(c.referenceContent)) {
    errors.push({
      field: 'referenceContent',
      message: 'Reference content must be an array if provided',
    })
  }

  // Check renderLayers (optional, but if provided must be array)
  if (c.renderLayers !== undefined && !Array.isArray(c.renderLayers)) {
    errors.push({ field: 'renderLayers', message: 'Render layers must be an array if provided' })
  }

  // Check initialState (optional, but if provided must be object)
  if (
    c.initialState !== undefined &&
    (typeof c.initialState !== 'object' || c.initialState === null)
  ) {
    errors.push({ field: 'initialState', message: 'Initial state must be an object if provided' })
  }

  return { valid: errors.length === 0, errors }
}
