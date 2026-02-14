/**
 * Climate Lab — Climate simulation logic.
 *
 * Implements a simplified energy balance model with real climate physics:
 * - Stefan-Boltzmann law for planetary energy balance
 * - CO2 radiative forcing equations
 * - Ice-albedo feedback mechanisms
 * - Volcanic cooling effects
 */

import type { ClimateState, ClimateParams } from './types.ts'
import type { ParamValues } from '@/engine/types.ts'

// Physical constants
const SOLAR_CONSTANT_DEFAULT = 1370 // W/m² at Earth's distance
const BASELINE_TEMP_C = 15 // °C
const BASELINE_CO2 = 280 // ppm pre-industrial
const CLIMATE_SENSITIVITY = 0.8 // °C per W/m² (simplified)

// Ice-albedo feedback parameters
const ICE_MELT_THRESHOLD = 2 // °C above baseline to start melting ice
const ICE_FREEZE_THRESHOLD = -5 // °C below baseline to start forming ice
const ALBEDO_ICE = 0.7 // Fresh ice/snow albedo
const ALBEDO_OCEAN = 0.1 // Open ocean albedo
const ALBEDO_LAND = 0.3 // Land albedo

/**
 * Calculate CO2 radiative forcing using IPCC formula.
 * ΔF = 5.35 × ln(CO2/CO2_ref) W/m²
 */
function calculateCO2Forcing(co2: number, referenceCO2: number): number {
  if (co2 <= 0 || referenceCO2 <= 0) return 0
  return 5.35 * Math.log(co2 / referenceCO2)
}

/**
 * Calculate ice extent based on temperature using feedback mechanism.
 */
function calculateIceExtent(temperature: number, currentIceExtent: number): number {
  if (temperature > ICE_MELT_THRESHOLD) {
    // Warming melts ice
    const meltRate = Math.min(0.1, (temperature - ICE_MELT_THRESHOLD) * 0.02)
    return Math.max(0.1, currentIceExtent - meltRate)
  } else if (temperature < ICE_FREEZE_THRESHOLD) {
    // Cooling forms ice
    const freezeRate = Math.min(0.1, Math.abs(temperature - ICE_FREEZE_THRESHOLD) * 0.02)
    return Math.min(0.8, currentIceExtent + freezeRate)
  }
  return currentIceExtent
}

/**
 * Calculate effective planetary albedo based on ice coverage.
 */
function calculateEffectiveAlbedo(parameterAlbedo: number, iceExtent: number): number {
  // Calculate natural albedo based on ice coverage
  const iceAlbedo = iceExtent * ALBEDO_ICE + (1 - iceExtent) * ALBEDO_OCEAN
  const landAlbedo = ALBEDO_LAND

  // Weight by surface fractions (simplified: 70% ocean, 30% land)
  const naturalAlbedo = 0.7 * iceAlbedo + 0.3 * landAlbedo

  // Blend parameter albedo with natural feedback (allows experimentation but includes feedback)
  return 0.7 * parameterAlbedo + 0.3 * naturalAlbedo
}

/**
 * Calculate volcanic cooling effect on energy balance.
 */
function calculateVolcanicCooling(volcanicLevel: number): number {
  // Each volcanic level reduces energy input by ~2 W/m²
  return volcanicLevel * -2
}

/**
 * Create the initial climate state with Earth-like conditions.
 */
export function createInitialClimateState(params: Partial<ClimateParams>): ClimateState {
  const co2 = params['co2-concentration'] ?? 400 // Modern pre-pandemic levels
  const albedo = params['albedo'] ?? 0.3 // Earth-like reflectivity
  const solarOutput = params['solar-output'] ?? SOLAR_CONSTANT_DEFAULT
  const volcanic = params['volcanic-cooling'] ?? 0

  // Calculate initial energy balance
  const co2Forcing = calculateCO2Forcing(co2, BASELINE_CO2)
  const volcanicCooling = calculateVolcanicCooling(volcanic)

  const energyIn = solarOutput * (1 - albedo) * 0.25 // Factor of 4 for spherical geometry
  const energyOut = 240 // Simplified: Earth radiates ~240 W/m² at equilibrium
  const energyBalance = energyIn - energyOut + co2Forcing + volcanicCooling

  // Temperature change from energy imbalance
  const temperatureChange = energyBalance * CLIMATE_SENSITIVITY

  return {
    temperature: temperatureChange,
    energyIn,
    energyOut,
    energyBalance,
    co2Concentration: co2,
    albedo,
    solarOutput,
    volcanicCooling: volcanic,
    iceExtent: 0.4, // Moderate ice coverage
    atmosphereThickness: Math.min(1, (co2 - BASELINE_CO2) / (800 - BASELINE_CO2)),
    temperatureHistory: [],
    energyBalanceHistory: [],
    step: 0,
    baselineTemperature: BASELINE_TEMP_C,
    baselineCO2: BASELINE_CO2,
  }
}

/**
 * Advance the climate system by one step.
 */
export function stepClimate(state: ClimateState, params: ParamValues): ClimateState {
  const climateParams = params as unknown as ClimateParams
  const co2 = climateParams['co2-concentration'] ?? state.co2Concentration
  const paramAlbedo = climateParams['albedo'] ?? state.albedo
  const solarOutput = climateParams['solar-output'] ?? state.solarOutput
  const volcanic = climateParams['volcanic-cooling'] ?? state.volcanicCooling

  // Update ice extent based on current temperature (feedback)
  const newIceExtent = calculateIceExtent(state.temperature, state.iceExtent)

  // Calculate effective albedo including ice-albedo feedback
  const effectiveAlbedo = calculateEffectiveAlbedo(paramAlbedo, newIceExtent)

  // Calculate energy flows
  const energyIn = solarOutput * (1 - effectiveAlbedo) * 0.25 // 0.25 for spherical geometry

  // CO2 radiative forcing (greenhouse effect)
  const co2Forcing = calculateCO2Forcing(co2, state.baselineCO2)

  // Volcanic cooling
  const volcanicCooling = calculateVolcanicCooling(volcanic)

  // Simplified energy out calculation (baseline + temperature-dependent change)
  const energyOut = 240 + state.temperature * 4 // ~4 W/m² per °C (simplified feedback)

  // Net energy balance
  const energyBalance = energyIn - energyOut + co2Forcing + volcanicCooling

  // Temperature change from energy imbalance (simplified climate sensitivity)
  const temperatureChange = state.temperature + energyBalance * CLIMATE_SENSITIVITY * 0.1 // Gradual change

  // Atmosphere thickness visualization based on CO2
  const atmosphereThickness = Math.min(1, Math.max(0, (co2 - BASELINE_CO2) / (800 - BASELINE_CO2)))

  // Update history (keep last 100 steps)
  const temperatureHistory = [...state.temperatureHistory, temperatureChange].slice(-100)
  const energyBalanceHistory = [...state.energyBalanceHistory, energyBalance].slice(-100)

  return {
    ...state,
    temperature: temperatureChange,
    energyIn,
    energyOut,
    energyBalance,
    co2Concentration: co2,
    albedo: effectiveAlbedo,
    solarOutput,
    volcanicCooling: volcanic,
    iceExtent: newIceExtent,
    atmosphereThickness,
    temperatureHistory,
    energyBalanceHistory,
    step: state.step + 1,
  }
}

/**
 * Mission check: Energy balance is achieved (within tolerance).
 */
export function checkEnergyBalance(state: ClimateState): boolean {
  // Energy balance within ±0.5 W/m² tolerance
  return Math.abs(state.energyBalance) <= 0.5
}

/**
 * Mission check: Ice age conditions achieved (significant cooling).
 */
export function checkIceAge(state: ClimateState): boolean {
  // Temperature 10°C below baseline and sustained ice growth
  return state.temperature <= -10 && state.iceExtent >= 0.6
}

/**
 * Mission check: Runaway greenhouse effect (Venus-like conditions).
 */
export function checkRunawayGreenhouse(state: ClimateState): boolean {
  // Temperature 50°C above baseline (extreme warming)
  return state.temperature >= 50
}

/**
 * Mission check: Temperature stabilized near 1.5°C warming target.
 */
export function checkStabilizeWarming(state: ClimateState): boolean {
  // Within 1.5°C ± 0.2°C range and stable for several steps
  if (state.temperatureHistory.length < 5) return false

  const target = 1.5
  const tolerance = 0.2
  const recentTemps = state.temperatureHistory.slice(-5)

  return recentTemps.every((temp) => Math.abs(temp - target) <= tolerance)
}
