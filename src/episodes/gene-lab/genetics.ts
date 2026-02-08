/**
 * Core genetics simulation logic for Gene Lab.
 *
 * Implements Mendelian inheritance, gamete formation, mutation,
 * selection pressure, and Hardy-Weinberg equilibrium calculations.
 */

import type { Allele, Genotype, Phenotype, Organism } from './types.ts'

/**
 * Determine phenotype from genotype.
 * AA or Aa → dominant, aa → recessive
 */
export function getPhenotype(genotype: Genotype): Phenotype {
  const [allele1, allele2] = genotype
  if (allele1 === 'A' || allele2 === 'A') {
    return 'dominant'
  }
  return 'recessive'
}

/**
 * Create a gamete from a diploid genotype.
 * Picks one allele at random, then applies mutation.
 */
export function createGamete(
  genotype: Genotype,
  mutationRate: number,
  rng: () => number = Math.random,
): Allele {
  // Random segregation: pick one of the two alleles
  const allele = rng() < 0.5 ? genotype[0] : genotype[1]

  // Apply mutation
  if (rng() < mutationRate) {
    return allele === 'A' ? 'a' : 'A'
  }

  return allele
}

/**
 * Breed two organisms to produce offspring.
 * Creates gametes from each parent and combines them.
 */
export function breed(
  parent1: Organism,
  parent2: Organism,
  mutationRate: number,
  rng: () => number = Math.random,
): Genotype {
  const gamete1 = createGamete(parent1.genotype, mutationRate, rng)
  const gamete2 = createGamete(parent2.genotype, mutationRate, rng)
  return [gamete1, gamete2]
}

/**
 * Apply selection pressure to population.
 * Returns a weighted array where organisms with dominant phenotype
 * appear more frequently based on selection pressure.
 */
export function applySelection(population: Organism[], pressure: number): Organism[] {
  if (pressure === 0) {
    return population
  }

  const weighted: Organism[] = []
  for (const organism of population) {
    const copies = organism.phenotype === 'dominant' ? 1 + Math.round(pressure * 4) : 1
    for (let i = 0; i < copies; i++) {
      weighted.push(organism)
    }
  }

  return weighted
}

/**
 * Compute allele frequencies from population.
 * Returns frequencies that sum to 1.
 */
export function computeAlleleFrequency(population: Organism[]): { A: number; a: number } {
  let countA = 0
  let countTotal = 0

  for (const organism of population) {
    for (const allele of organism.genotype) {
      if (allele === 'A') {
        countA++
      }
      countTotal++
    }
  }

  if (countTotal === 0) {
    return { A: 0.5, a: 0.5 }
  }

  const freqA = countA / countTotal
  const freqa = 1 - freqA

  return { A: freqA, a: freqa }
}

/**
 * Compute expected genotype ratios under Hardy-Weinberg equilibrium.
 * p² + 2pq + q² = 1 where p = freq(A), q = freq(a)
 */
export function computeHardyWeinberg(freqA: number): { AA: number; Aa: number; aa: number } {
  const p = freqA
  const q = 1 - freqA

  return {
    AA: p * p,
    Aa: 2 * p * q,
    aa: q * q,
  }
}

/**
 * Compute chi-square statistic comparing observed to expected genotype ratios.
 * Returns the chi-square value (lower = closer to expected).
 */
export function computeChiSquare(
  observed: { AA: number; Aa: number; aa: number },
  expected: { AA: number; Aa: number; aa: number },
  total: number,
): number {
  const expectedAA = expected.AA * total
  const expectedAa = expected.Aa * total
  const expectedaa = expected.aa * total

  let chiSquare = 0

  if (expectedAA > 0) {
    chiSquare += Math.pow(observed.AA - expectedAA, 2) / expectedAA
  }
  if (expectedAa > 0) {
    chiSquare += Math.pow(observed.Aa - expectedAa, 2) / expectedAa
  }
  if (expectedaa > 0) {
    chiSquare += Math.pow(observed.aa - expectedaa, 2) / expectedaa
  }

  return chiSquare
}
