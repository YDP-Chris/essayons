/**
 * Runtime validation for EpisodeConfig objects.
 *
 * Checks structural completeness, type correctness of parameter defaults,
 * constraint consistency, ID uniqueness, and cross-references between
 * missions and objectives.
 */

import type { ParameterConfig, ValidationResult } from './types.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_DOMAINS = new Set([
  'physics',
  'civics',
  'economics',
  'history',
  'biology',
  'engineering',
])

const VALID_SIM_MODES = new Set(['continuous', 'step-based', 'event-driven', 'turn-based'])

const VALID_PARAM_TYPES = new Set(['number', 'boolean', 'enum', 'vector2'])

const VALID_REF_CATEGORIES = new Set(['concept', 'equation', 'history', 'fun-fact'])

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

// ---------------------------------------------------------------------------
// Parameter default validation
// ---------------------------------------------------------------------------

function validateParameterDefault(param: ParameterConfig, errors: string[]): void {
  switch (param.type) {
    case 'number': {
      if (typeof param.default !== 'number') {
        errors.push(
          `Parameter "${param.id}": default must be a number, got ${typeof param.default}`,
        )
        return
      }
      if (param.min !== undefined && param.default < param.min) {
        errors.push(
          `Parameter "${param.id}": default (${param.default}) is less than min (${param.min})`,
        )
      }
      if (param.max !== undefined && param.default > param.max) {
        errors.push(
          `Parameter "${param.id}": default (${param.default}) is greater than max (${param.max})`,
        )
      }
      if (param.min !== undefined && param.max !== undefined && param.min > param.max) {
        errors.push(
          `Parameter "${param.id}": min (${param.min}) is greater than max (${param.max})`,
        )
      }
      if (param.step !== undefined && param.step <= 0) {
        errors.push(`Parameter "${param.id}": step must be positive, got ${param.step}`)
      }
      break
    }
    case 'boolean': {
      if (typeof param.default !== 'boolean') {
        errors.push(
          `Parameter "${param.id}": default must be a boolean, got ${typeof param.default}`,
        )
      }
      break
    }
    case 'enum': {
      if (typeof param.default !== 'string') {
        errors.push(
          `Parameter "${param.id}": default must be a string, got ${typeof param.default}`,
        )
        return
      }
      if (!param.options || param.options.length === 0) {
        errors.push(`Parameter "${param.id}": enum type requires non-empty options array`)
        return
      }
      if (!param.options.includes(param.default)) {
        errors.push(
          `Parameter "${param.id}": default "${param.default}" is not in options [${param.options.join(', ')}]`,
        )
      }
      break
    }
    case 'vector2': {
      if (
        typeof param.default !== 'object' ||
        param.default === null ||
        !('x' in param.default) ||
        !('y' in param.default)
      ) {
        errors.push(`Parameter "${param.id}": default must be a {x, y} object for vector2 type`)
      }
      break
    }
  }
}

// ---------------------------------------------------------------------------
// Main validation
// ---------------------------------------------------------------------------

/**
 * Validate an EpisodeConfig at runtime.
 *
 * Returns `{ valid: true, errors: [] }` when all checks pass, or
 * `{ valid: false, errors: [...] }` with human-readable messages.
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors: string[] = []

  // ---- Top-level type check ----
  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['Config must be a non-null object'] }
  }

  const c = config as Record<string, unknown>

  // ---- Required string fields ----
  const requiredStrings = ['id', 'title', 'subtitle', 'description'] as const
  for (const field of requiredStrings) {
    if (!isNonEmptyString(c[field])) {
      errors.push(`Missing or empty required field: "${field}"`)
    }
  }

  // ---- Domain ----
  if (!VALID_DOMAINS.has(c['domain'] as string)) {
    errors.push(
      `Invalid domain: "${String(c['domain'])}". ` +
        `Must be one of: ${Array.from(VALID_DOMAINS).join(', ')}`,
    )
  }

  // ---- Simulation mode ----
  if (!VALID_SIM_MODES.has(c['simulationMode'] as string)) {
    errors.push(
      `Invalid simulationMode: "${String(c['simulationMode'])}". ` +
        `Must be one of: ${Array.from(VALID_SIM_MODES).join(', ')}`,
    )
  }

  // ---- Required arrays ----
  const requiredArrays = [
    'parameters',
    'equations',
    'missions',
    'referenceContent',
    'renderLayers',
  ] as const
  for (const field of requiredArrays) {
    if (!Array.isArray(c[field])) {
      errors.push(`"${field}" must be an array`)
    }
  }

  // ---- Initial state ----
  if (typeof c['initialState'] !== 'object' || c['initialState'] === null) {
    errors.push('"initialState" must be a non-null object')
  }

  // If basic structure is broken, return early
  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // From here on we can safely cast
  const ep = c as unknown as {
    parameters: ParameterConfig[]
    equations: Array<{ id: string }>
    missions: Array<{
      id: string
      title: string
      briefing: string
      objectives: Array<{ id: string; description: string; check: string }>
      successMessage: string
    }>
    referenceContent: Array<{ id: string; title: string; content: string; category: string }>
    renderLayers: Array<{ id: string; zIndex: number; render: string }>
  }

  // ---- Collect all IDs for uniqueness check ----
  const allIds = new Set<string>()
  function checkUniqueId(id: unknown, context: string): void {
    if (!isNonEmptyString(id)) {
      errors.push(`${context}: missing or empty id`)
      return
    }
    if (allIds.has(id)) {
      errors.push(`Duplicate id: "${id}" (found in ${context})`)
    }
    allIds.add(id)
  }

  // ---- Parameters ----
  for (const param of ep.parameters) {
    checkUniqueId(param.id, 'parameters')

    if (!isNonEmptyString(param.label)) {
      errors.push(`Parameter "${param.id}": missing or empty label`)
    }

    if (!VALID_PARAM_TYPES.has(param.type)) {
      errors.push(
        `Parameter "${param.id}": invalid type "${param.type}". ` +
          `Must be one of: ${Array.from(VALID_PARAM_TYPES).join(', ')}`,
      )
    } else {
      validateParameterDefault(param, errors)
    }
  }

  // ---- Equations ----
  for (const eq of ep.equations) {
    checkUniqueId(eq.id, 'equations')
  }

  // ---- Missions & objectives ----
  for (const mission of ep.missions) {
    checkUniqueId(mission.id, 'missions')

    if (!isNonEmptyString(mission.title)) {
      errors.push(`Mission "${mission.id}": missing or empty title`)
    }
    if (!isNonEmptyString(mission.briefing)) {
      errors.push(`Mission "${mission.id}": missing or empty briefing`)
    }
    if (!isNonEmptyString(mission.successMessage)) {
      errors.push(`Mission "${mission.id}": missing or empty successMessage`)
    }
    if (!Array.isArray(mission.objectives) || mission.objectives.length === 0) {
      errors.push(`Mission "${mission.id}": must have at least one objective`)
    } else {
      for (const obj of mission.objectives) {
        checkUniqueId(obj.id, `mission "${mission.id}" objectives`)

        if (!isNonEmptyString(obj.description)) {
          errors.push(`Objective "${obj.id}": missing or empty description`)
        }
        if (!isNonEmptyString(obj.check)) {
          errors.push(`Objective "${obj.id}": missing or empty check function name`)
        }
      }
    }
  }

  // ---- Reference content ----
  for (const ref of ep.referenceContent) {
    checkUniqueId(ref.id, 'referenceContent')

    if (!isNonEmptyString(ref.title)) {
      errors.push(`Reference "${ref.id}": missing or empty title`)
    }
    if (!isNonEmptyString(ref.content)) {
      errors.push(`Reference "${ref.id}": missing or empty content`)
    }
    if (!VALID_REF_CATEGORIES.has(ref.category)) {
      errors.push(
        `Reference "${ref.id}": invalid category "${ref.category}". ` +
          `Must be one of: ${Array.from(VALID_REF_CATEGORIES).join(', ')}`,
      )
    }
  }

  // ---- Render layers ----
  for (const layer of ep.renderLayers) {
    checkUniqueId(layer.id, 'renderLayers')

    if (typeof layer.zIndex !== 'number') {
      errors.push(`RenderLayer "${layer.id}": zIndex must be a number`)
    }
    if (!isNonEmptyString(layer.render)) {
      errors.push(`RenderLayer "${layer.id}": missing or empty render function name`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
