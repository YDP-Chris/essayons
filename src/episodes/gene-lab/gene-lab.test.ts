/**
 * Tests for Gene Lab genetics simulation.
 */

import { describe, it, expect } from 'vitest'
import {
  getPhenotype,
  createGamete,
  breed,
  applySelection,
  computeAlleleFrequency,
  computeHardyWeinberg,
  computeChiSquare,
} from './genetics.ts'
import { createInitialState, stepGeneration } from './simulation.ts'
import type { Organism } from './types.ts'

// Seeded RNG for reproducible tests
function seededRNG(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

describe('Gene Lab - Genetics', () => {
  describe('getPhenotype', () => {
    it('should return dominant for AA genotype', () => {
      expect(getPhenotype(['A', 'A'])).toBe('dominant')
    })

    it('should return dominant for Aa genotype', () => {
      expect(getPhenotype(['A', 'a'])).toBe('dominant')
    })

    it('should return dominant for aA genotype', () => {
      expect(getPhenotype(['a', 'A'])).toBe('dominant')
    })

    it('should return recessive for aa genotype', () => {
      expect(getPhenotype(['a', 'a'])).toBe('recessive')
    })
  })

  describe('createGamete', () => {
    it('should pick one allele from genotype', () => {
      const rng = seededRNG(42)
      const gamete = createGamete(['A', 'a'], 0, rng)
      expect(gamete === 'A' || gamete === 'a').toBe(true)
    })

    it('should produce only A from AA genotype with no mutation', () => {
      const rng = seededRNG(42)
      for (let i = 0; i < 10; i++) {
        expect(createGamete(['A', 'A'], 0, rng)).toBe('A')
      }
    })

    it('should produce only a from aa genotype with no mutation', () => {
      const rng = seededRNG(42)
      for (let i = 0; i < 10; i++) {
        expect(createGamete(['a', 'a'], 0, rng)).toBe('a')
      }
    })

    it('should mutate alleles at specified rate', () => {
      const rng = () => 0.01 // Always mutate
      const gamete = createGamete(['A', 'A'], 1.0, rng)
      expect(gamete).toBe('a') // A mutates to a
    })

    it('should flip allele on mutation', () => {
      const rng = () => 0.01 // Always mutate
      expect(createGamete(['A', 'A'], 1.0, rng)).toBe('a')
      expect(createGamete(['a', 'a'], 1.0, rng)).toBe('A')
    })
  })

  describe('breed', () => {
    it('should produce valid offspring genotype', () => {
      const parent1: Organism = { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' }
      const parent2: Organism = { id: 1, genotype: ['a', 'a'], phenotype: 'recessive' }
      const rng = seededRNG(42)

      const offspring = breed(parent1, parent2, 0, rng)
      expect(offspring.length).toBe(2)
      expect(offspring[0] === 'A' || offspring[0] === 'a').toBe(true)
      expect(offspring[1] === 'A' || offspring[1] === 'a').toBe(true)
    })

    it('should produce Aa offspring from AA x aa cross', () => {
      const parent1: Organism = { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' }
      const parent2: Organism = { id: 1, genotype: ['a', 'a'], phenotype: 'recessive' }
      const rng = seededRNG(42)

      const offspring = breed(parent1, parent2, 0, rng)
      const hasA = offspring.includes('A')
      const hasa = offspring.includes('a')
      expect(hasA && hasa).toBe(true)
    })

    it('should respect mutation rate during breeding', () => {
      const parent1: Organism = { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' }
      const parent2: Organism = { id: 1, genotype: ['A', 'A'], phenotype: 'dominant' }
      const rng = () => 0.01 // Always mutate

      const offspring = breed(parent1, parent2, 1.0, rng)
      // Both gametes should mutate from A to a
      expect(offspring).toEqual(['a', 'a'])
    })
  })

  describe('applySelection', () => {
    it('should return same population with no selection pressure', () => {
      const population: Organism[] = [
        { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' },
        { id: 1, genotype: ['a', 'a'], phenotype: 'recessive' },
      ]
      const weighted = applySelection(population, 0)
      expect(weighted).toEqual(population)
    })

    it('should increase representation of dominant phenotype', () => {
      const population: Organism[] = [
        { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' },
        { id: 1, genotype: ['a', 'a'], phenotype: 'recessive' },
      ]
      const weighted = applySelection(population, 0.5)
      const dominantCount = weighted.filter((o) => o.phenotype === 'dominant').length
      const recessiveCount = weighted.filter((o) => o.phenotype === 'recessive').length
      expect(dominantCount).toBeGreaterThan(recessiveCount)
    })

    it('should produce weighted pool proportional to fitness', () => {
      const population: Organism[] = [
        { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' },
        { id: 1, genotype: ['a', 'a'], phenotype: 'recessive' },
      ]
      const weighted = applySelection(population, 1.0)
      // Dominant gets 1 + 1.0 = 2 copies, recessive gets 1 copy
      expect(weighted.length).toBe(3)
      const dominantCount = weighted.filter((o) => o.phenotype === 'dominant').length
      expect(dominantCount).toBe(2)
    })
  })

  describe('computeAlleleFrequency', () => {
    it('should compute correct frequencies for homozygous population', () => {
      const population: Organism[] = [
        { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' },
        { id: 1, genotype: ['A', 'A'], phenotype: 'dominant' },
      ]
      const freq = computeAlleleFrequency(population)
      expect(freq.A).toBe(1.0)
      expect(freq.a).toBe(0.0)
    })

    it('should compute correct frequencies for 50/50 split', () => {
      const population: Organism[] = [
        { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' },
        { id: 1, genotype: ['a', 'a'], phenotype: 'recessive' },
      ]
      const freq = computeAlleleFrequency(population)
      expect(freq.A).toBe(0.5)
      expect(freq.a).toBe(0.5)
    })

    it('should compute correct frequencies with heterozygotes', () => {
      const population: Organism[] = [
        { id: 0, genotype: ['A', 'a'], phenotype: 'dominant' },
        { id: 1, genotype: ['A', 'a'], phenotype: 'dominant' },
      ]
      const freq = computeAlleleFrequency(population)
      expect(freq.A).toBe(0.5)
      expect(freq.a).toBe(0.5)
    })

    it('should ensure frequencies sum to 1', () => {
      const population: Organism[] = [
        { id: 0, genotype: ['A', 'A'], phenotype: 'dominant' },
        { id: 1, genotype: ['A', 'a'], phenotype: 'dominant' },
        { id: 2, genotype: ['a', 'a'], phenotype: 'recessive' },
      ]
      const freq = computeAlleleFrequency(population)
      expect(freq.A + freq.a).toBeCloseTo(1.0)
    })

    it('should handle empty population gracefully', () => {
      const freq = computeAlleleFrequency([])
      expect(freq.A).toBe(0.5)
      expect(freq.a).toBe(0.5)
    })
  })

  describe('computeHardyWeinberg', () => {
    it('should compute correct ratios for p=0.5', () => {
      const hw = computeHardyWeinberg(0.5)
      expect(hw.AA).toBeCloseTo(0.25)
      expect(hw.Aa).toBeCloseTo(0.5)
      expect(hw.aa).toBeCloseTo(0.25)
    })

    it('should compute correct ratios for p=0.8', () => {
      const hw = computeHardyWeinberg(0.8)
      expect(hw.AA).toBeCloseTo(0.64) // 0.8^2
      expect(hw.Aa).toBeCloseTo(0.32) // 2 * 0.8 * 0.2
      expect(hw.aa).toBeCloseTo(0.04) // 0.2^2
    })

    it('should ensure ratios sum to 1', () => {
      const hw = computeHardyWeinberg(0.7)
      expect(hw.AA + hw.Aa + hw.aa).toBeCloseTo(1.0)
    })

    it('should handle extreme frequencies', () => {
      const hw1 = computeHardyWeinberg(0.0)
      expect(hw1.AA).toBe(0)
      expect(hw1.aa).toBe(1)

      const hw2 = computeHardyWeinberg(1.0)
      expect(hw2.AA).toBe(1)
      expect(hw2.aa).toBe(0)
    })
  })

  describe('computeChiSquare', () => {
    it('should return 0 when observed matches expected', () => {
      const observed = { AA: 25, Aa: 50, aa: 25 }
      const expected = { AA: 0.25, Aa: 0.5, aa: 0.25 }
      const chiSquare = computeChiSquare(observed, expected, 100)
      expect(chiSquare).toBeCloseTo(0)
    })

    it('should return positive value for deviation', () => {
      const observed = { AA: 40, Aa: 40, aa: 20 }
      const expected = { AA: 0.25, Aa: 0.5, aa: 0.25 }
      const chiSquare = computeChiSquare(observed, expected, 100)
      expect(chiSquare).toBeGreaterThan(0)
    })

    it('should increase with larger deviations', () => {
      const expected = { AA: 0.25, Aa: 0.5, aa: 0.25 }

      const smallDeviation = { AA: 26, Aa: 48, aa: 26 }
      const largeDeviation = { AA: 50, Aa: 30, aa: 20 }

      const chi1 = computeChiSquare(smallDeviation, expected, 100)
      const chi2 = computeChiSquare(largeDeviation, expected, 100)

      expect(chi2).toBeGreaterThan(chi1)
    })
  })
})

describe('Gene Lab - Simulation', () => {
  describe('createInitialState', () => {
    it('should create population of correct size', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      expect(state.population.length).toBe(50)
    })

    it('should start at generation 0', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      expect(state.generation).toBe(0)
    })

    it('should approximate desired allele frequency', () => {
      const state = createInitialState(
        {
          'population-size': 100,
          'dominant-frequency': 0.7,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      // With large population, should be close to target
      expect(state.alleleFrequency.A).toBeGreaterThan(0.6)
      expect(state.alleleFrequency.A).toBeLessThan(0.8)
    })

    it('should assign phenotypes correctly', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      for (const organism of state.population) {
        expect(organism.phenotype).toBe(getPhenotype(organism.genotype))
      }
    })

    it('should initialize history with generation 0', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      expect(state.history.length).toBe(1)
      expect(state.history[0]!.generation).toBe(0)
    })

    it('should compute Hardy-Weinberg statistics', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      expect(state.hwExpected.AA).toBeGreaterThanOrEqual(0)
      expect(state.hwExpected.Aa).toBeGreaterThanOrEqual(0)
      expect(state.hwExpected.aa).toBeGreaterThanOrEqual(0)
      expect(state.hwChiSquare).toBeGreaterThanOrEqual(0)
    })
  })

  describe('stepGeneration', () => {
    it('should increment generation number', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      const nextState = stepGeneration(
        state,
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(43),
      )
      expect(nextState.generation).toBe(1)
    })

    it('should maintain population size', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )
      const nextState = stepGeneration(
        state,
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(43),
      )
      expect(nextState.population.length).toBe(50)
    })

    it('should preserve allele frequencies with no evolution', () => {
      const state = createInitialState(
        {
          'population-size': 100,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )

      let currentState = state
      for (let i = 0; i < 5; i++) {
        currentState = stepGeneration(
          currentState,
          {
            'population-size': 100,
            'dominant-frequency': 0.5,
            'mutation-rate': 0,
            'selection-pressure': 0,
            'show-genotypes': false,
          },
          seededRNG(42 + i),
        )
      }

      // With no selection or mutation, frequencies should stay near 0.5
      expect(currentState.alleleFrequency.A).toBeGreaterThan(0.4)
      expect(currentState.alleleFrequency.A).toBeLessThan(0.6)
    })

    it('should increase dominant allele frequency with selection', () => {
      const state = createInitialState(
        {
          'population-size': 100,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0.5,
          'show-genotypes': false,
        },
        seededRNG(42),
      )

      let currentState = state
      for (let i = 0; i < 10; i++) {
        currentState = stepGeneration(
          currentState,
          {
            'population-size': 100,
            'dominant-frequency': 0.5,
            'mutation-rate': 0,
            'selection-pressure': 0.5,
            'show-genotypes': false,
          },
          seededRNG(42 + i),
        )
      }

      // Selection should increase A frequency
      expect(currentState.alleleFrequency.A).toBeGreaterThan(state.alleleFrequency.A)
    })

    it('should update history each generation', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )

      const nextState = stepGeneration(
        state,
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(43),
      )

      expect(nextState.history.length).toBe(2)
      expect(nextState.history[1]!.generation).toBe(1)
    })

    it('should compute statistics for new generation', () => {
      const state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )

      const nextState = stepGeneration(
        state,
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(43),
      )

      expect(nextState.alleleFrequency.A + nextState.alleleFrequency.a).toBeCloseTo(1.0)
      expect(
        nextState.genotypeRatio.AA + nextState.genotypeRatio.Aa + nextState.genotypeRatio.aa,
      ).toBe(50)
      expect(nextState.phenotypeRatio.dominant + nextState.phenotypeRatio.recessive).toBe(50)
    })
  })

  describe('Integration tests', () => {
    it('should handle multiple generations correctly', () => {
      let state = createInitialState(
        {
          'population-size': 50,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )

      for (let i = 0; i < 10; i++) {
        state = stepGeneration(
          state,
          {
            'population-size': 50,
            'dominant-frequency': 0.5,
            'mutation-rate': 0,
            'selection-pressure': 0,
            'show-genotypes': false,
          },
          seededRNG(42 + i),
        )
      }

      expect(state.generation).toBe(10)
      expect(state.history.length).toBe(11)
    })

    it('should show Hardy-Weinberg equilibrium with no evolution', () => {
      let state = createInitialState(
        {
          'population-size': 200,
          'dominant-frequency': 0.5,
          'mutation-rate': 0,
          'selection-pressure': 0,
          'show-genotypes': false,
        },
        seededRNG(42),
      )

      for (let i = 0; i < 5; i++) {
        state = stepGeneration(
          state,
          {
            'population-size': 200,
            'dominant-frequency': 0.5,
            'mutation-rate': 0,
            'selection-pressure': 0,
            'show-genotypes': false,
          },
          seededRNG(42 + i),
        )
      }

      // Chi-square should be relatively low with large population
      expect(state.hwChiSquare).toBeLessThan(10)
    })
  })
})
