/**
 * Climate Lab — Type definitions for climate simulation state.
 */

export interface ClimateState {
  // Physics state
  temperature: number // °C relative to baseline (15°C)
  energyIn: number // W/m² solar energy input
  energyOut: number // W/m² thermal energy output
  energyBalance: number // W/m² net energy balance (in - out)

  // Environmental variables
  co2Concentration: number // ppm
  albedo: number // 0-1 planetary reflectivity
  solarOutput: number // W/m² solar irradiance
  volcanicCooling: number // 0-5 cooling factor from aerosols

  // Derived state
  iceExtent: number // 0-1 fraction of surface covered by ice
  atmosphereThickness: number // 0-1 visual representation of CO2 concentration

  // History tracking
  temperatureHistory: number[]
  energyBalanceHistory: number[]
  step: number // current simulation step

  // Reference values for comparison
  baselineTemperature: number // Pre-industrial reference (15°C)
  baselineCO2: number // Pre-industrial CO2 (280 ppm)
}

export interface ClimateParams {
  'co2-concentration': number
  albedo: number
  'solar-output': number
  'volcanic-cooling': number
}
