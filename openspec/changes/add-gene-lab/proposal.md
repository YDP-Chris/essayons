# Change: Add Gene Lab — Episode 04 biology simulation using turn-based discrete engine

## Why

Gene Lab is Episode 04 and the first biology-domain episode for Essayons. It teaches genetics and inheritance by letting users breed organisms, observe traits across generations, and discover Mendel's laws through experimentation. Users manipulate allele frequencies, selection pressure, and mutation rates to watch evolution in action — learning genotype-phenotype relationships, dominant/recessive inheritance, and population genetics through cause and effect rather than memorization. As the second DiscreteEngine episode, it validates the step-based simulation pattern for generational processes.

## What Changes

- Add turn-based genetics simulation using discrete step model where each step = one generation with breeding, inheritance, and selection
- Add organism population with visible traits (color, size, shape) determined by underlying genotype using Mendelian inheritance rules
- Add Punnett square visualization showing predicted offspring genotype ratios from selected parent crosses
- Add genotype-to-phenotype mapping with configurable dominant/recessive allele relationships for multiple traits
- Add adjustable parameters: dominant/recessive allele frequencies, mutation rate per generation, population size, selection pressure strength, number of traits to track
- Add Hardy-Weinberg equilibrium calculation and deviation tracking to reveal when selection or mutation is active
- Add four structured missions: Mendel's Peas (breed plants and predict 3:1 ratio), Hidden Traits (discover recessive alleles through unexpected offspring), Natural Selection (apply selection pressure and observe allele frequency shift over 10 generations), and Mutation (increase mutation rate and observe novel traits emerging)
- Add real-time telemetry: allele frequencies for each trait, phenotype ratios, generation count, Hardy-Weinberg equilibrium chi-square statistic, observed vs. expected offspring counts
- Add reference panel presenting Mendel's laws (segregation, independent assortment), dominant/recessive definitions, genotype vs. phenotype, Punnett square construction, and Hardy-Weinberg equilibrium formula
- Add step controls: next generation button, auto-advance toggle with configurable interval, generation counter, reset, and breeding pair selection
- Add Canvas rendering for organism sprites with trait visualization, population grid display, Punnett square overlay, allele frequency bar charts, and Hardy-Weinberg equilibrium plot
- Apply Biology domain accent color #8ac926 throughout the episode UI

## Impact

- Affected specs: `gene-lab` (new capability)
- Affected code:
  - `src/episodes/gene-lab/GeneLabEpisode.ts` — episode entry point, wires DiscreteEngine to genetics-specific logic
  - `src/episodes/gene-lab/GeneticsSimulation.ts` — population model, generation step function, breeding and inheritance implementation
  - `src/episodes/gene-lab/Organism.ts` — organism class with genotype storage, phenotype calculation, trait expression
  - `src/episodes/gene-lab/Genotype.ts` — genotype representation (diploid, multiple loci), allele storage, dominance rules
  - `src/episodes/gene-lab/Phenotype.ts` — phenotype calculation from genotype, trait visibility mapping
  - `src/episodes/gene-lab/Inheritance.ts` — Mendelian inheritance, gamete formation with independent assortment, fertilization
  - `src/episodes/gene-lab/PunnettSquare.ts` — Punnett square generation for 1-locus and 2-locus crosses, probability calculation
  - `src/episodes/gene-lab/Mutation.ts` — mutation application during gamete formation, configurable mutation rate
  - `src/episodes/gene-lab/Selection.ts` — selection pressure application, fitness calculation based on trait values
  - `src/episodes/gene-lab/HardyWeinberg.ts` — expected genotype frequencies under equilibrium, chi-square deviation calculation
  - `src/episodes/gene-lab/missions/MendelsPeasMission.ts` — detect 3:1 phenotype ratio in F2 generation
  - `src/episodes/gene-lab/missions/HiddenTraitsMission.ts` — detect recessive phenotype appearance from heterozygous crosses
  - `src/episodes/gene-lab/missions/NaturalSelectionMission.ts` — track allele frequency change over multiple generations under selection
  - `src/episodes/gene-lab/missions/MutationMission.ts` — detect novel allele appearance and population spread
  - `src/episodes/gene-lab/Telemetry.ts` — compute allele frequencies, phenotype ratios, Hardy-Weinberg statistics
  - `src/episodes/gene-lab/ReferencePanel.tsx` — genetics concepts, Mendel's laws, Punnett squares, Hardy-Weinberg explanation
  - `src/episodes/gene-lab/GeneLabRenderer.ts` — Canvas rendering for organism grid, trait visualization, Punnett square overlay, frequency charts
  - `src/episodes/gene-lab/types.ts` — TypeScript interfaces for genotype, phenotype, organism, population state, breeding records
  - `src/episodes/gene-lab/constants.ts` — default allele frequencies, trait count, mutation rate, selection coefficients, mission thresholds
