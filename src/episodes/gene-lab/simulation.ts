/**
 * Gene Lab simulation step logic.
 *
 * Handles initial population generation and generational breeding cycles
 * with selection, mutation, and statistical analysis.
 */

import type { GeneLabState, Organism, Genotype, Allele } from './types.ts'
import {
  getPhenotype,
  breed,
  applySelection,
  computeAlleleFrequency,
  computeHardyWeinberg,
  computeChiSquare,
} from './genetics.ts'

export interface GeneLabParams {
  'population-size': number
  'dominant-frequency': number
  'mutation-rate': number
  'selection-pressure': number
  'show-genotypes': boolean
}

/**
 * Create initial population with specified allele frequencies.
 */
export function createInitialState(
  params: GeneLabParams,
  rng: () => number = Math.random,
): GeneLabState {
  const populationSize = params['population-size']
  const freqA = params['dominant-frequency']

  const population: Organism[] = []

  for (let i = 0; i < populationSize; i++) {
    // Generate genotype based on allele frequency
    const allele1: Allele = rng() < freqA ? 'A' : 'a'
    const allele2: Allele = rng() < freqA ? 'A' : 'a'
    const genotype: Genotype = [allele1, allele2]

    population.push({
      id: i,
      genotype,
      phenotype: getPhenotype(genotype),
    })
  }

  // Compute initial statistics
  const alleleFrequency = computeAlleleFrequency(population)
  const genotypeRatio = computeGenotypeRatio(population)
  const phenotypeRatio = computePhenotypeRatio(population)
  const hwExpected = computeHardyWeinberg(alleleFrequency.A)
  const hwChiSquare = computeChiSquare(genotypeRatio, hwExpected, populationSize)

  return {
    generation: 0,
    population,
    alleleFrequency,
    genotypeRatio,
    phenotypeRatio,
    hwExpected,
    hwChiSquare,
    history: [
      {
        generation: 0,
        freqA: alleleFrequency.A,
        freqa: alleleFrequency.a,
        dominant: phenotypeRatio.dominant,
        recessive: phenotypeRatio.recessive,
      },
    ],
  }
}

/**
 * Advance to next generation by breeding new population.
 */
export function stepGeneration(
  state: GeneLabState,
  params: GeneLabParams,
  rng: () => number = Math.random,
): GeneLabState {
  const populationSize = params['population-size']
  const mutationRate = params['mutation-rate']
  const selectionPressure = params['selection-pressure']

  // Apply selection pressure to create weighted parent pool
  const parentPool = applySelection(state.population, selectionPressure)

  // Breed next generation
  const nextPopulation: Organism[] = []
  for (let i = 0; i < populationSize; i++) {
    // Select two random parents
    const parent1 = parentPool[Math.floor(rng() * parentPool.length)]!
    const parent2 = parentPool[Math.floor(rng() * parentPool.length)]!

    // Breed offspring
    const genotype = breed(parent1, parent2, mutationRate, rng)

    nextPopulation.push({
      id: i,
      genotype,
      phenotype: getPhenotype(genotype),
    })
  }

  // Compute statistics
  const alleleFrequency = computeAlleleFrequency(nextPopulation)
  const genotypeRatio = computeGenotypeRatio(nextPopulation)
  const phenotypeRatio = computePhenotypeRatio(nextPopulation)
  const hwExpected = computeHardyWeinberg(alleleFrequency.A)
  const hwChiSquare = computeChiSquare(genotypeRatio, hwExpected, populationSize)

  const generation = state.generation + 1

  return {
    generation,
    population: nextPopulation,
    alleleFrequency,
    genotypeRatio,
    phenotypeRatio,
    hwExpected,
    hwChiSquare,
    history: [
      ...state.history,
      {
        generation,
        freqA: alleleFrequency.A,
        freqa: alleleFrequency.a,
        dominant: phenotypeRatio.dominant,
        recessive: phenotypeRatio.recessive,
      },
    ],
  }
}

/**
 * Count genotype occurrences in population.
 */
function computeGenotypeRatio(population: Organism[]): { AA: number; Aa: number; aa: number } {
  let AA = 0
  let Aa = 0
  let aa = 0

  for (const organism of population) {
    const [allele1, allele2] = organism.genotype
    if (allele1 === 'A' && allele2 === 'A') {
      AA++
    } else if (allele1 === 'a' && allele2 === 'a') {
      aa++
    } else {
      Aa++
    }
  }

  return { AA, Aa, aa }
}

/**
 * Count phenotype occurrences in population.
 */
function computePhenotypeRatio(population: Organism[]): { dominant: number; recessive: number } {
  let dominant = 0
  let recessive = 0

  for (const organism of population) {
    if (organism.phenotype === 'dominant') {
      dominant++
    } else {
      recessive++
    }
  }

  return { dominant, recessive }
}
