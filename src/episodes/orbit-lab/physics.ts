/**
 * Orbital physics engine for the Orbit Lab episode.
 *
 * Implements Newtonian gravity with Velocity Verlet integration for
 * energy-conserving numerical stability. Provides collision detection,
 * escape detection, orbit completion tracking, and trail recording.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Gravitational constant in N*m^2/kg^2 */
export const G = 6.674e-11

/** Earth's radius in meters (used as default planet radius) */
export const EARTH_RADIUS = 6.371e6

/** Maximum number of trail points before oldest are discarded */
const MAX_TRAIL_POINTS = 2500

/** Seconds of orbital period for geostationary orbit */
const GEO_PERIOD = 86400

/** Tolerance for geostationary period check (5%) */
const GEO_TOLERANCE = 0.05

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Satellite {
  readonly x: number
  readonly y: number
  readonly vx: number
  readonly vy: number
}

export interface Planet {
  readonly x: number
  readonly y: number
  readonly radius: number
  readonly mass: number
}

export interface TrailPoint {
  readonly x: number
  readonly y: number
  readonly speed: number
}

export interface OrbitalState {
  readonly satellite: Satellite
  readonly planet: Planet
  readonly trail: readonly TrailPoint[]
  readonly totalAngle: number
  readonly crashed: boolean
  readonly escaped: boolean
  readonly orbitsCompleted: number
  readonly simTime: number
  readonly orbitalPeriod: number
  readonly eccentricity: number
  readonly semiMajorAxis: number
  readonly apogee: number
  readonly perigee: number
  readonly specificEnergy: number
  readonly acceleration: number
}

export interface OrbitalParams {
  readonly 'planet-mass': number
  readonly 'launch-speed': number
  readonly 'launch-angle': number
  readonly 'show-trail': boolean
  readonly 'show-vectors': boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

function gravitationalAcceleration(
  sx: number,
  sy: number,
  px: number,
  py: number,
  planetMass: number,
): { ax: number; ay: number } {
  const dx = px - sx
  const dy = py - sy
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < 1) {
    return { ax: 0, ay: 0 }
  }

  const forceMag = (G * planetMass) / (dist * dist)
  const ax = forceMag * (dx / dist)
  const ay = forceMag * (dy / dist)

  return { ax, ay }
}

// ---------------------------------------------------------------------------
// State Creation
// ---------------------------------------------------------------------------

/**
 * Create an initial orbital state from user-controlled parameters.
 *
 * The satellite launches from the planet surface. Launch angle 0° fires
 * straight up (radially outward). The angle rotates from radial, so 90°
 * fires tangentially — the direction needed for orbit.
 */
export function createInitialState(params: Record<string, unknown>): OrbitalState {
  const planetMass = (params['planet-mass'] as number | undefined) ?? 5.972e24
  const launchSpeed = (params['launch-speed'] as number | undefined) ?? 7500
  const launchAngleDeg = (params['launch-angle'] as number | undefined) ?? 0

  const planetRadius = EARTH_RADIUS

  // Satellite starts on the planet surface (positive x-axis, just above the radius)
  const satX = planetRadius + 1000 // 1km above surface to avoid immediate collision
  const satY = 0

  // Convert launch angle to radians. 0° = radially outward (+x direction)
  // 90° = tangential (prograde, +y direction) — this is what you need for orbit
  const angleRad = (launchAngleDeg * Math.PI) / 180
  const vx = launchSpeed * Math.cos(angleRad)
  const vy = launchSpeed * Math.sin(angleRad)

  const speed = launchSpeed
  const dist = Math.sqrt(satX * satX + satY * satY)
  const accelMag = (G * planetMass) / (dist * dist)
  const energy = 0.5 * speed * speed - (G * planetMass) / dist
  let ecc = 0
  let sma = 0
  let apo = 0
  let per = 0
  let period = 0

  if (energy < 0) {
    sma = -(G * planetMass) / (2 * energy)
    // Eccentricity from state vectors: e = |((v²-GM/r)*r_vec - (r_vec·v_vec)*v_vec)| / GM
    const mu = G * planetMass
    const v2 = speed * speed
    const rdotv = satX * vx + satY * vy
    const evx = ((v2 - mu / dist) * satX - rdotv * vx) / mu
    const evy = ((v2 - mu / dist) * satY - rdotv * vy) / mu
    ecc = Math.sqrt(evx * evx + evy * evy)
    apo = sma * (1 + ecc) - planetRadius
    per = sma * (1 - ecc) - planetRadius
    period = 2 * Math.PI * Math.sqrt((sma * sma * sma) / mu)
  }

  return {
    satellite: { x: satX, y: satY, vx, vy },
    planet: { x: 0, y: 0, radius: planetRadius, mass: planetMass },
    trail: [{ x: satX, y: satY, speed }],
    totalAngle: 0,
    crashed: false,
    escaped: false,
    orbitsCompleted: 0,
    simTime: 0,
    orbitalPeriod: period,
    eccentricity: ecc,
    semiMajorAxis: sma,
    apogee: apo,
    perigee: per,
    specificEnergy: energy,
    acceleration: accelMag,
  }
}

// ---------------------------------------------------------------------------
// Physics Update (Velocity Verlet)
// ---------------------------------------------------------------------------

/**
 * Advance the orbital simulation by `dt` seconds using Velocity Verlet
 * integration, which conserves energy far better than Euler for orbital
 * mechanics.
 *
 * The algorithm:
 *   1. Compute acceleration at current position
 *   2. Update position using current velocity + 0.5 * a * dt^2
 *   3. Compute acceleration at new position
 *   4. Update velocity using average of old and new acceleration
 */
export function updateOrbitalState(
  state: OrbitalState,
  params: Record<string, unknown>,
  dt: number,
): OrbitalState {
  // If already crashed or escaped, freeze the simulation
  if (state.crashed || state.escaped) {
    return { ...state, simTime: state.simTime + dt }
  }

  const planetMass = (params['planet-mass'] as number | undefined) ?? state.planet.mass

  // Update planet mass if it changed
  const planet: Planet =
    planetMass !== state.planet.mass ? { ...state.planet, mass: planetMass } : state.planet

  const { x, y, vx, vy } = state.satellite

  // Step 1: acceleration at current position
  const a1 = gravitationalAcceleration(x, y, planet.x, planet.y, planet.mass)

  // Step 2: update position
  const newX = x + vx * dt + 0.5 * a1.ax * dt * dt
  const newY = y + vy * dt + 0.5 * a1.ay * dt * dt

  // Step 3: acceleration at new position
  const a2 = gravitationalAcceleration(newX, newY, planet.x, planet.y, planet.mass)

  // Step 4: update velocity with average acceleration
  const newVx = vx + 0.5 * (a1.ax + a2.ax) * dt
  const newVy = vy + 0.5 * (a1.ay + a2.ay) * dt

  const newSatellite: Satellite = { x: newX, y: newY, vx: newVx, vy: newVy }

  // --- Collision detection ---
  const dist = distance(newX, newY, planet.x, planet.y)
  const crashed = dist <= planet.radius

  // --- Escape detection ---
  const speed = Math.sqrt(newVx * newVx + newVy * newVy)
  const escapeSpeed = Math.sqrt((2 * G * planet.mass) / dist)
  const escaped = speed >= escapeSpeed && dist > planet.radius * 10

  // --- Angle tracking ---
  const oldAngle = Math.atan2(y - planet.y, x - planet.x)
  const newAngle = Math.atan2(newY - planet.y, newX - planet.x)
  let angleDelta = newAngle - oldAngle

  // Normalize angle delta to [-PI, PI]
  if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI
  if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI

  const totalAngle = state.totalAngle + angleDelta
  const orbitsCompleted = Math.floor(Math.abs(totalAngle) / (2 * Math.PI))

  // --- Orbital metrics ---
  const mu = G * planet.mass
  const specificEnergy = 0.5 * speed * speed - mu / dist
  const accelMag = mu / (dist * dist)
  let orbitalPeriod = state.orbitalPeriod
  let semiMajorAxis = 0
  let eccentricity = 0
  let apogee = 0
  let perigee = 0

  if (specificEnergy < 0) {
    semiMajorAxis = -mu / (2 * specificEnergy)
    orbitalPeriod = 2 * Math.PI * Math.sqrt((semiMajorAxis * semiMajorAxis * semiMajorAxis) / mu)

    // Eccentricity from state vectors: e_vec = ((v²-μ/r)*r_vec - (r·v)*v_vec) / μ
    const v2 = speed * speed
    const rdotv = newX * newVx + newY * newVy
    const evx = ((v2 - mu / dist) * newX - rdotv * newVx) / mu
    const evy = ((v2 - mu / dist) * newY - rdotv * newVy) / mu
    eccentricity = Math.sqrt(evx * evx + evy * evy)
    apogee = semiMajorAxis * (1 + eccentricity) - planet.radius
    perigee = semiMajorAxis * (1 - eccentricity) - planet.radius
  } else {
    // Unbound orbit — compute eccentricity for display but apogee/perigee are undefined
    const v2 = speed * speed
    const rdotv = newX * newVx + newY * newVy
    const evx = ((v2 - mu / dist) * newX - rdotv * newVx) / mu
    const evy = ((v2 - mu / dist) * newY - rdotv * newVy) / mu
    eccentricity = Math.sqrt(evx * evx + evy * evy)
  }

  // --- Trail ---
  const showTrail = (params['show-trail'] as boolean | undefined) ?? true
  let trail = state.trail

  if (showTrail && !crashed && !escaped) {
    const newTrail = [...state.trail, { x: newX, y: newY, speed }]
    // Cap trail length
    trail =
      newTrail.length > MAX_TRAIL_POINTS
        ? newTrail.slice(newTrail.length - MAX_TRAIL_POINTS)
        : newTrail
  }

  return {
    satellite: newSatellite,
    planet,
    trail,
    totalAngle,
    crashed,
    escaped,
    orbitsCompleted,
    simTime: state.simTime + dt,
    orbitalPeriod,
    eccentricity,
    semiMajorAxis,
    apogee,
    perigee,
    specificEnergy,
    acceleration: accelMag,
  }
}

// ---------------------------------------------------------------------------
// Mission Check Functions
// ---------------------------------------------------------------------------

/** Check if the satellite has completed at least one full orbit (360 degrees). */
export function checkOrbitComplete(state: OrbitalState): boolean {
  return Math.abs(state.totalAngle) >= 2 * Math.PI
}

/** Check if the satellite has NOT crashed (for the no-crash objective). */
export function checkNoCrash(state: OrbitalState): boolean {
  return !state.crashed
}

/** Check if the satellite has crashed into the planet. */
export function checkCrash(state: OrbitalState): boolean {
  return state.crashed
}

/** Check if the satellite has escaped the planet's gravity. */
export function checkEscape(state: OrbitalState): boolean {
  return state.escaped
}

/**
 * Check if the satellite is in a geostationary orbit.
 *
 * A geostationary orbit has a period of approximately 86,400 seconds (24 hours).
 * We allow a 5% tolerance.
 */
export function checkGeostationary(state: OrbitalState): boolean {
  if (state.crashed || state.escaped) return false
  if (state.orbitalPeriod <= 0) return false

  const deviation = Math.abs(state.orbitalPeriod - GEO_PERIOD) / GEO_PERIOD
  return deviation <= GEO_TOLERANCE
}
