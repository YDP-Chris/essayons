/**
 * Type definitions for the Gene Lab (Biology) episode.
 *
 * Models Mendelian genetics with diploid organisms, allele frequencies,
 * Hardy-Weinberg equilibrium, and evolutionary forces like selection and mutation.
 */

export type Allele = 'A' | 'a' // A = dominant, a = recessive
export type Genotype = [Allele, Allele] // diploid
export type Phenotype = 'dominant' | 'recessive'

export interface Organism {
  id: number
  genotype: Genotype
  phenotype: Phenotype
}

export interface GeneLabState {
  generation: number
  population: Organism[]
  alleleFrequency: { A: number; a: number } // frequencies sum to 1
  genotypeRatio: { AA: number; Aa: number; aa: number } // counts
  phenotypeRatio: { dominant: number; recessive: number }
  hwExpected: { AA: number; Aa: number; aa: number } // Hardy-Weinberg expected
  hwChiSquare: number // deviation from HW equilibrium
  history: Array<{
    generation: number
    freqA: number
    freqa: number
    dominant: number
    recessive: number
  }>
}
