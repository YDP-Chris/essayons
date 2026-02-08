import type { EpisodeConfig } from '../types.ts'

export const geneLabConfig: EpisodeConfig = {
  id: 'gene-lab',
  title: 'Gene Lab',
  subtitle: 'Breed generations. Watch traits emerge.',
  domain: 'biology',
  simulationMode: 'step-based',
  description:
    'Explore genetics and inheritance by breeding organisms across generations. ' +
    'Observe how alleles combine, traits appear, and evolution shapes populations.',
  parameters: [
    {
      id: 'population-size',
      label: 'Population Size',
      type: 'number',
      default: 50,
      min: 20,
      max: 200,
      step: 10,
      description: 'Number of organisms per generation',
    },
    {
      id: 'dominant-frequency',
      label: 'Initial Dominant Frequency',
      type: 'number',
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      description: 'Initial frequency of dominant allele (A)',
    },
    {
      id: 'mutation-rate',
      label: 'Mutation Rate',
      type: 'number',
      default: 0.01,
      min: 0,
      max: 0.1,
      step: 0.001,
      description: 'Probability of allele mutation per gamete',
    },
    {
      id: 'selection-pressure',
      label: 'Selection Pressure',
      type: 'number',
      default: 0,
      min: 0,
      max: 1,
      step: 0.01,
      description: 'Fitness advantage of dominant phenotype',
    },
    {
      id: 'show-genotypes',
      label: 'Show Genotypes',
      type: 'boolean',
      default: false,
      description: 'Display genotypes on organisms',
    },
  ],
  equations: [
    {
      id: 'hardy-weinberg',
      label: 'Hardy-Weinberg Equilibrium',
      latex: 'p^2 + 2pq + q^2 = 1',
      description: 'Genotype frequencies in a non-evolving population',
      variables: {
        p: 'Frequency of dominant allele (A)',
        q: 'Frequency of recessive allele (a)',
        'p²': 'Frequency of AA genotype',
        '2pq': 'Frequency of Aa genotype',
        'q²': 'Frequency of aa genotype',
      },
    },
    {
      id: 'allele-frequency',
      label: 'Allele Frequency',
      latex: 'p = \\frac{2N_{AA} + N_{Aa}}{2N}',
      description: 'Calculate frequency of an allele from genotype counts',
      variables: {
        p: 'Frequency of allele A',
        N_AA: 'Number of AA individuals',
        N_Aa: 'Number of Aa individuals',
        N: 'Total population size',
      },
    },
    {
      id: 'selection-coefficient',
      label: 'Selection Coefficient',
      latex: 's = 1 - \\frac{w}{w_{max}}',
      description: 'Measure of selective disadvantage',
      variables: {
        s: 'Selection coefficient',
        w: 'Fitness of genotype',
        w_max: 'Maximum fitness',
      },
    },
  ],
  missions: [
    {
      id: 'mendels-peas',
      title: "Mendel's Peas",
      briefing:
        'Starting with 50% allele frequency and no selection pressure, breed 5 generations ' +
        'and observe the classic 3:1 phenotype ratio emerge. This is the foundation of genetics!',
      objectives: [
        {
          id: 'reach-generation-5',
          description: 'Breed at least 5 generations',
          check: 'checkReachGeneration5',
        },
        {
          id: 'observe-ratio',
          description: 'Observe phenotype ratio near 3:1 dominant:recessive',
          check: 'checkPhenotypeRatio',
        },
      ],
      hints: [
        'With equal allele frequencies and no evolution, Hardy-Weinberg predicts p²:2pq:q² = 1:2:1 genotypes.',
        'Since dominant phenotype includes both AA and Aa, the ratio is (1+2):1 = 3:1.',
        'Click the Step button to advance one generation at a time.',
      ],
      successMessage: "You recreated Mendel's experiments! The 3:1 ratio is biology's signature.",
    },
    {
      id: 'hidden-traits',
      title: 'Hidden Traits',
      briefing:
        'Start with a high dominant frequency (0.9). Can recessive traits still appear? ' +
        'Explore how recessive alleles hide in heterozygotes.',
      objectives: [
        {
          id: 'high-dominant-start',
          description: 'Set dominant frequency to 0.9',
          check: 'checkHighDominantFrequency',
        },
        {
          id: 'recessive-appears',
          description: 'Observe recessive phenotypes appearing',
          check: 'checkRecessivePresent',
        },
      ],
      hints: [
        'Even with 90% A alleles, q² = 0.1² = 0.01, so 1% of population will be recessive.',
        'Heterozygotes (Aa) carry the recessive allele invisibly.',
        'This is why rare genetic diseases can persist in populations.',
      ],
      successMessage: 'Recessive alleles never disappear completely when hidden in carriers!',
    },
    {
      id: 'natural-selection',
      title: 'Natural Selection',
      briefing:
        'Apply selection pressure and watch allele frequencies shift over 10+ generations. ' +
        'This is evolution in action!',
      objectives: [
        {
          id: 'apply-selection',
          description: 'Set selection pressure to at least 0.3',
          check: 'checkSelectionPressure',
        },
        {
          id: 'frequency-shift',
          description: 'Breed 10 generations and observe dominant allele increase',
          check: 'checkFrequencyShift',
        },
      ],
      hints: [
        'Selection pressure gives organisms with dominant phenotype more offspring.',
        'Watch the allele frequency graph shift upward over generations.',
        'This is how favorable traits spread through populations.',
      ],
      successMessage: 'Evolution achieved! Selection changes populations over time.',
    },
    {
      id: 'mutation',
      title: 'Mutation',
      briefing:
        'Increase mutation rate and observe novel allele appearances. Mutation is the ultimate ' +
        'source of genetic variation.',
      objectives: [
        {
          id: 'high-mutation',
          description: 'Set mutation rate to at least 0.05',
          check: 'checkHighMutation',
        },
        {
          id: 'frequency-fluctuation',
          description: 'Observe allele frequencies fluctuating',
          check: 'checkFrequencyFluctuation',
        },
      ],
      hints: [
        'High mutation rates prevent populations from reaching equilibrium.',
        'Watch the chi-square value increase, showing deviation from Hardy-Weinberg.',
        'Mutation introduces new alleles even when selection removes them.',
      ],
      successMessage: 'Mutation is the engine of genetic diversity!',
    },
  ],
  referenceContent: [
    {
      id: 'what-is-gene',
      title: 'What is a Gene?',
      content:
        'A gene is a unit of heredity passed from parent to offspring. Genes come in different ' +
        'versions called **alleles**. You inherit one allele from each parent, giving you two ' +
        'copies of each gene (diploid). Your combination of alleles (genotype) determines your ' +
        'observable traits (phenotype).',
      category: 'concept',
    },
    {
      id: 'dominant-recessive',
      title: 'Dominant and Recessive',
      content:
        'Some alleles are **dominant** (often written as capital letters like A). If you have ' +
        'at least one dominant allele, it "wins" and determines your phenotype. **Recessive** ' +
        'alleles (lowercase, like a) only show their effect when you have two copies (aa). ' +
        'This is why two brown-eyed parents can have a blue-eyed child if both carry the recessive allele!',
      category: 'concept',
    },
    {
      id: 'hardy-weinberg-principle',
      title: 'Hardy-Weinberg Equilibrium',
      content:
        'In a population with no evolution (no selection, mutation, migration, or genetic drift), ' +
        'allele frequencies stay constant. The genotype ratios follow p² + 2pq + q² = 1. This is a ' +
        '**null hypothesis** for evolution—real populations deviate from it because evolution is always happening!',
      category: 'equation',
    },
    {
      id: 'mendel-peas',
      title: "Mendel's Pea Experiments",
      content:
        'In the 1860s, Gregor Mendel bred pea plants and discovered the laws of inheritance. He found ' +
        'that traits like flower color followed predictable ratios: 3:1 for dominant to recessive. ' +
        "He didn't know about DNA or genes, but his math was perfect!",
      category: 'history',
    },
    {
      id: 'sickle-cell-fact',
      title: 'Sickle Cell Anemia',
      content:
        'Sickle cell disease is caused by a recessive allele. People with one copy (heterozygotes) ' +
        'are carriers but also resistant to malaria! This is called **heterozygote advantage** and ' +
        'explains why the allele persists in malaria-prone regions despite being harmful when homozygous.',
      category: 'fun-fact',
    },
    {
      id: 'mutation-rate',
      title: 'Real Mutation Rates',
      content:
        'In humans, the mutation rate is about 1 in 100 million base pairs per generation. That sounds ' +
        'tiny, but with 3 billion base pairs in your genome, you carry about 30-100 new mutations your ' +
        "parents didn't have! Most are harmless, but some drive evolution.",
      category: 'fun-fact',
    },
  ],
  initialState: {},
  renderLayers: [],
}
