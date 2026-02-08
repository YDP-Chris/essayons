/**
 * Market Lab — Market simulation logic.
 *
 * Implements a simple supply-and-demand market clearing mechanism with
 * support for price controls (floors/ceilings) and taxes/subsidies.
 */

import type { MarketState, MarketParams } from './types.ts'
import type { ParamValues } from '@/engine/types.ts'

/**
 * Generate a random number from a normal distribution using Box-Muller transform.
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0 * stdDev + mean
}

/**
 * Create the initial market state with random buyers and sellers.
 */
export function createInitialMarketState(params: Partial<MarketParams>): MarketState {
  const numBuyers = params['num-buyers'] ?? 50
  const numSellers = params['num-sellers'] ?? 50

  // Generate buyers with willingness-to-pay from normal distribution
  const buyers = Array.from({ length: numBuyers }, (_, i) => ({
    id: i,
    willingnessToPay: Math.max(0, randomNormal(100, 30)),
    bought: false,
  }))

  // Generate sellers with costs from normal distribution
  const sellers = Array.from({ length: numSellers }, (_, i) => ({
    id: i,
    cost: Math.max(0, randomNormal(100, 30)),
    sold: false,
  }))

  // Sort for efficient market clearing
  buyers.sort((a, b) => b.willingnessToPay - a.willingnessToPay) // High to low
  sellers.sort((a, b) => a.cost - b.cost) // Low to high

  // Compute equilibrium without interventions
  const { price: eqPrice, quantity: eqQuantity } = computeEquilibrium(buyers, sellers)

  return {
    day: 0,
    price: eqPrice,
    quantityTraded: 0,
    consumerSurplus: 0,
    producerSurplus: 0,
    deadweightLoss: 0,
    surplus: 0,
    buyers,
    sellers,
    priceHistory: [],
    quantityHistory: [],
    equilibriumPrice: eqPrice,
    equilibriumQuantity: eqQuantity,
  }
}

/**
 * Compute the theoretical equilibrium price and quantity without interventions.
 */
export function computeEquilibrium(
  buyers: Array<{ willingnessToPay: number }>,
  sellers: Array<{ cost: number }>,
): { price: number; quantity: number } {
  // Find the quantity where the marginal buyer's WTP equals the marginal seller's cost
  let quantity = 0
  let price = 0

  for (let q = 0; q < Math.min(buyers.length, sellers.length); q++) {
    const buyer = buyers[q]
    const seller = sellers[q]
    if (buyer && seller && buyer.willingnessToPay >= seller.cost) {
      quantity = q + 1
      price = (buyer.willingnessToPay + seller.cost) / 2
    } else {
      break
    }
  }

  return { price, quantity }
}

/**
 * Find the market clearing price given constraints and interventions.
 */
function findClearingPrice(
  buyers: Array<{ willingnessToPay: number }>,
  sellers: Array<{ cost: number }>,
  priceFloor: number,
  priceCeiling: number,
  taxPerUnit: number,
  subsidyPerUnit: number,
): { price: number; quantityDemanded: number; quantitySupplied: number } {
  // Effective supply curve shifts up by tax, down by subsidy
  const effectiveSellers = sellers.map((s) => ({
    ...s,
    cost: s.cost + taxPerUnit - subsidyPerUnit,
  }))

  // Binary search for clearing price
  let low = Math.max(0, priceFloor)
  let high = Math.min(200, priceCeiling)

  for (let i = 0; i < 50; i++) {
    const testPrice = (low + high) / 2

    // Count quantity demanded at this price
    const qDemanded = buyers.filter((b) => b.willingnessToPay >= testPrice).length

    // Count quantity supplied at this price
    const qSupplied = effectiveSellers.filter((s) => s.cost <= testPrice).length

    if (Math.abs(qDemanded - qSupplied) < 1) {
      return {
        price: testPrice,
        quantityDemanded: qDemanded,
        quantitySupplied: qSupplied,
      }
    }

    if (qDemanded > qSupplied) {
      low = testPrice // Price too low, raise it
    } else {
      high = testPrice // Price too high, lower it
    }
  }

  // Final check at midpoint
  const finalPrice = (low + high) / 2
  const qDemanded = buyers.filter((b) => b.willingnessToPay >= finalPrice).length
  const qSupplied = effectiveSellers.filter((s) => s.cost <= finalPrice).length

  return {
    price: finalPrice,
    quantityDemanded: qDemanded,
    quantitySupplied: qSupplied,
  }
}

/**
 * Advance the market by one day (step).
 */
export function stepMarket(state: MarketState, params: ParamValues): MarketState {
  const marketParams = params as unknown as MarketParams
  const priceFloor = marketParams['price-floor'] ?? 0
  const priceCeiling = marketParams['price-ceiling'] ?? 200
  const taxPerUnit = marketParams['tax-per-unit'] ?? 0
  const subsidyPerUnit = marketParams['subsidy-per-unit'] ?? 0

  // Find clearing price with interventions
  const { price, quantityDemanded, quantitySupplied } = findClearingPrice(
    state.buyers,
    state.sellers,
    priceFloor,
    priceCeiling,
    taxPerUnit,
    subsidyPerUnit,
  )

  // Quantity traded is the minimum of demand and supply
  const quantityTraded = Math.min(quantityDemanded, quantitySupplied)

  // Mark buyers and sellers who traded
  const buyers = state.buyers.map((b, i) => ({
    ...b,
    bought: i < quantityTraded && b.willingnessToPay >= price,
  }))

  const effectiveSellerCost = (seller: { cost: number }) =>
    seller.cost + taxPerUnit - subsidyPerUnit

  const sellers = state.sellers.map((s, i) => ({
    ...s,
    sold: i < quantityTraded && effectiveSellerCost(s) <= price,
  }))

  // Calculate consumer surplus (area between demand curve and price)
  const consumerSurplus = buyers
    .slice(0, quantityTraded)
    .reduce((sum, b) => sum + Math.max(0, b.willingnessToPay - price), 0)

  // Calculate producer surplus (area between price and supply curve)
  // Producers receive price, but their cost is affected by tax/subsidy
  const producerSurplus = sellers
    .slice(0, quantityTraded)
    .reduce((sum, s) => sum + Math.max(0, price - effectiveSellerCost(s)), 0)

  // Calculate deadweight loss (efficiency loss from interventions)
  // Compare total surplus with and without interventions
  const equilibriumSurplus =
    state.buyers
      .slice(0, state.equilibriumQuantity)
      .reduce((sum, b) => sum + (b.willingnessToPay - state.equilibriumPrice), 0) +
    state.sellers
      .slice(0, state.equilibriumQuantity)
      .reduce((sum, s) => sum + (state.equilibriumPrice - s.cost), 0)

  const actualSurplus = consumerSurplus + producerSurplus
  const deadweightLoss = Math.max(0, equilibriumSurplus - actualSurplus)

  // Market surplus (positive = excess supply, negative = excess demand)
  const surplus = quantitySupplied - quantityDemanded

  // Update price and quantity history
  const priceHistory = [...state.priceHistory, price].slice(-100)
  const quantityHistory = [...state.quantityHistory, quantityTraded].slice(-100)

  return {
    ...state,
    day: state.day + 1,
    price,
    quantityTraded,
    consumerSurplus,
    producerSurplus,
    deadweightLoss,
    surplus,
    buyers,
    sellers,
    priceHistory,
    quantityHistory,
  }
}

/**
 * Mission check: Market has reached equilibrium (price is stable).
 */
export function checkEquilibrium(state: MarketState): boolean {
  if (state.priceHistory.length < 5) return false

  // Check if price is stable (within 5% for last 5 days)
  const recentPrices = state.priceHistory.slice(-5)
  const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length
  const maxDeviation = Math.max(...recentPrices.map((p) => Math.abs(p - avgPrice)))

  return maxDeviation / avgPrice < 0.05
}

/**
 * Mission check: Price floor is causing excess supply.
 */
export function checkPriceFloorEffect(state: MarketState): boolean {
  // Price should be at floor and there should be excess supply
  return state.surplus > 5 && state.price > state.equilibriumPrice
}

/**
 * Mission check: Market has self-organized after removing interventions.
 */
export function checkSelfOrganization(state: MarketState): boolean {
  // Price should be close to equilibrium
  if (state.day < 10) return false
  return Math.abs(state.price - state.equilibriumPrice) / state.equilibriumPrice < 0.1
}

/**
 * Mission check: Deadweight loss is significant.
 */
export function checkDeadweightLoss(state: MarketState): boolean {
  return state.deadweightLoss > 50
}
