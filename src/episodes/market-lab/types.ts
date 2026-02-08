/**
 * Market Lab — Type definitions for market simulation state.
 */

export interface MarketState {
  day: number
  price: number
  quantityTraded: number
  consumerSurplus: number
  producerSurplus: number
  deadweightLoss: number
  surplus: number // positive = excess supply, negative = excess demand
  buyers: Array<{ id: number; willingnessToPay: number; bought: boolean }>
  sellers: Array<{ id: number; cost: number; sold: boolean }>
  priceHistory: number[]
  quantityHistory: number[]
  equilibriumPrice: number
  equilibriumQuantity: number
}

export interface MarketParams {
  'num-buyers': number
  'num-sellers': number
  'price-floor': number
  'price-ceiling': number
  'tax-per-unit': number
  'subsidy-per-unit': number
}
