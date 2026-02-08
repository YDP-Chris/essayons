## Context

Gene Lab is Episode 04 of Essayons and the first biology-domain episode. It teaches Mendelian genetics, population genetics, and evolution through interactive breeding experiments. Users manipulate organisms with visible traits determined by underlying genotypes, discovering inheritance patterns empirically rather than through textbook memorization.

As the second DiscreteEngine episode (following Market Lab), Gene Lab validates the step-based simulation pattern for generational processes where computation is naturally turn-based. Each step represents one generation, with breeding, inheritance, mutation, and selection occurring instantaneously between generations.

The simulation must handle realistic genetics (diploid genotypes, Mendelian inheritance, Hardy-Weinberg equilibrium) while remaining visually clear and pedagogically effective. The goal is for users to "discover" Mendel's laws by observing 3:1 ratios, hidden recessive traits, and allele frequency changes under selection.

### Constraints

- Client-side only (no server computation)
- Zero external genetics libraries (project convention: minimal dependencies)
- Must integrate with DiscreteEngine's step-based lifecycle
- Must work with keyboard, mouse, and touch input
- WCAG AA accessibility requirements (color-blind-safe trait visualization)
- Population size must scale from 10 to 500 organisms without performance degradation

### Stakeholders

- Solo developer (implementation)
- End users (learners exploring genetics and evolution)

## Goals / Non-Goals

### Goals

- Accurate Mendelian inheritance (diploid genotypes, independent assortment, segregation)
- Discoverable learning — users figure out 3:1 ratios and inheritance patterns through experimentation
- Punnett square visualization that predicts offspring and reinforces probability concepts
- Hardy-Weinberg equilibrium tracking to reveal when selection, mutation, or drift are active
- Four missions teaching progressively: Mendel's laws → hidden traits → selection → mutation
- Clear genotype-to-phenotype mapping with color-blind-safe visual traits
- 60 FPS rendering after each generation step (even with 500 organisms)

### Non-Goals

- Polyploidy or non-diploid organisms (diploid is sufficient for Mendel's laws)
- Linkage and recombination (independent assortment is enough for Episode 04)
- Epistasis, pleiotropy, or polygenic traits (keep trait mapping 1-to-1 for clarity)
- Genetic drift beyond what naturally occurs in finite populations
- DNA/molecular level simulation (abstract alleles, not nucleotide sequences)
- Sex chromosomes or sex-linked inheritance (autosomal traits only)
- Server-side genetics validation or leaderboards

## Decisions

### Genotype Representation: Diploid with Multiple Loci

**Decision**: Represent each organism's genotype as a diploid genome with N independent loci (default N=2, adjustable 1-5). Each locus has two alleles (one from each parent), stored as a pair. For example: `{ locus1: ["A", "a"], locus2: ["B", "b"] }` represents a two-trait heterozygote (AaBb).

**Why**: Diploid representation matches biological reality and directly supports Mendelian genetics. Storing alleles as pairs makes gamete formation (meiosis) and fertilization straightforward to implement. Independent loci enable teaching independent assortment (Mendel's Second Law) through dihybrid crosses.

**Implementation**:

```typescript
interface Genotype {
  loci: AllelesPair[] // Array of loci, each with two alleles
}

type AllelesPair = [Allele, Allele]

interface Allele {
  id: string // "A", "a", "B", "b", etc.
  dominance: number // Higher value = more dominant (for co-dominance)
}
```

**Alternatives considered**:

- **Haploid representation**: Simpler but doesn't support dominant/recessive or Punnett squares. Rejected — Mendelian genetics requires diploid.
- **Bit-vector encoding**: More memory-efficient but harder to debug and visualize. Rejected — clarity is more important than memory for ~500 organisms.
- **Linked loci (recombination)**: More realistic but adds complexity without pedagogical benefit for Episode 04. Deferred to future episodes.

### Phenotype Calculation: Dominance Rules per Locus

**Decision**: For each locus, determine phenotype by comparing allele dominance values. If alleles differ, the one with higher dominance value determines phenotype (classical dominance). If equal, blend or show co-dominant phenotype.

**Why**: This model covers classical Mendelian dominance (A dominant over a) while remaining extensible to co-dominance or incomplete dominance if needed. It keeps genotype-to-phenotype mapping transparent for learners.

**Implementation**:

```typescript
function getPhenotypeForLocus(pair: AllelesPair): TraitValue {
  const [allele1, allele2] = pair

  if (allele1.dominance > allele2.dominance) {
    return allele1.traitValue
  } else if (allele2.dominance > allele1.dominance) {
    return allele2.traitValue
  } else {
    // Co-dominance: blend or show both
    return blendTraitValues(allele1.traitValue, allele2.traitValue)
  }
}
```

**Alternatives considered**:

- **Look-up table for every genotype**: Flexible but doesn't generalize. Rejected — dominance rule is more elegant and extensible.
- **Epistasis or gene interactions**: More realistic but hides 1-to-1 mapping that helps learners understand inheritance. Deferred to advanced episodes.

### Trait Visualization: Color, Size, Shape

**Decision**: Map each locus to a visible trait: locus 1 controls color (e.g., green vs. yellow), locus 2 controls size (large vs. small), locus 3 controls shape (round vs. wrinkled). Use both color and shape/pattern to ensure color-blind accessibility.

**Why**: Multiple independent visual traits let users observe independent assortment (e.g., green-large, green-small, yellow-large, yellow-small in 9:3:3:1 ratio). Using both color and shape ensures WCAG AA compliance and avoids relying solely on color to convey information.

**Color-blind-safe palette**:

- Green (#8ac926, biology accent) vs. Yellow (#ffca3a)
- Large (1.5× scale) vs. Small (1.0× scale)
- Circle vs. Square shapes

**Alternatives considered**:

- **Color only**: Fails accessibility. Rejected.
- **Procedural textures**: Visually noisy. Rejected — simple shapes are clearer.
- **Text labels**: Clutters UI. Rejected — visual traits are more engaging.

### Mendelian Inheritance: Gamete Formation and Fertilization

**Decision**: Implement gamete formation (meiosis) by randomly selecting one allele from each locus independently. Implement fertilization by combining two gametes to form a diploid offspring.

**Why**: This directly models Mendel's laws: segregation (alleles separate during meiosis) and independent assortment (different loci segregate independently). Randomness captures biological probability.

**Algorithm**:

```typescript
function formGamete(genotype: Genotype): Gamete {
  return genotype.loci.map((pair) => {
    // Randomly pick one allele from this locus
    return Math.random() < 0.5 ? pair[0] : pair[1]
  })
}

function fertilize(gamete1: Gamete, gamete2: Gamete): Genotype {
  return {
    loci: gamete1.map((allele, i) => [allele, gamete2[i]]),
  }
}
```

**Alternatives considered**:

- **Fixed probabilities instead of random sampling**: Deterministic but unrealistic. Rejected — randomness is essential to genetics.
- **Linkage (non-independent assortment)**: More realistic but complicates independent assortment teaching. Deferred.

### Punnett Square: Combinatorial Grid

**Decision**: Generate Punnett squares by enumerating all possible gamete combinations from two parents. For single-locus (Aa × Aa), produce 2×2 grid. For two-locus (AaBb × AaBb), produce 4×4 grid.

**Why**: Punnett squares are the standard pedagogical tool for predicting offspring ratios. Visualizing them reinforces probability and shows users _why_ 3:1 or 9:3:3:1 ratios occur.

**Implementation**:

```typescript
function generatePunnettSquare(parent1: Genotype, parent2: Genotype): PunnettSquare {
  const gametes1 = enumerateGametes(parent1) // All possible gametes from parent1
  const gametes2 = enumerateGametes(parent2)

  const grid: Genotype[][] = []
  for (const g1 of gametes1) {
    const row: Genotype[] = []
    for (const g2 of gametes2) {
      row.push(fertilize(g1, g2))
    }
    grid.push(row)
  }
  return { grid, gametes1, gametes2 }
}

function enumerateGametes(genotype: Genotype): Gamete[] {
  // For each locus, list both alleles, then compute Cartesian product
  const alleleChoices = genotype.loci.map((pair) => [pair[0], pair[1]])
  return cartesianProduct(alleleChoices)
}
```

**Alternatives considered**:

- **Statistical prediction instead of enumeration**: Faster but loses educational value of seeing all combinations. Rejected — Punnett square visualization is central to pedagogy.
- **Random sampling instead of enumeration**: Simpler but doesn't guarantee exact ratios. Rejected — users need to see theoretical predictions.

### Mutation: Per-Allele Probability During Meiosis

**Decision**: Apply mutation during gamete formation. For each allele in the gamete, with probability μ (mutation rate parameter), replace it with a novel allele at the same locus.

**Why**: Mutation is the source of genetic variation. Applying it during meiosis (gamete formation) matches biological timing. Configurable mutation rate lets users explore how variation arises.

**Implementation**:

```typescript
function formGameteWithMutation(genotype: Genotype, mutationRate: number): Gamete {
  return genotype.loci.map((pair) => {
    let allele = Math.random() < 0.5 ? pair[0] : pair[1]

    // Apply mutation
    if (Math.random() < mutationRate) {
      allele = generateNovelAllele(pair) // Create new allele with distinct trait
    }

    return allele
  })
}
```

**Novel allele generation**: If locus controls color and existing alleles are "Green" and "Yellow", novel allele might be "Blue". Track novel alleles in telemetry.

**Alternatives considered**:

- **Mutation during fertilization**: Less biologically accurate. Rejected.
- **Fixed mutation per generation instead of per allele**: Simpler but doesn't scale with genome size. Rejected.
- **Back-mutation (mutate to existing alleles)**: More realistic but harder to observe novel traits. Deferred.

### Selection Pressure: Fitness-Weighted Breeding

**Decision**: Assign fitness scores to organisms based on their phenotype. When forming the next generation, select parents with probability proportional to fitness. Selection pressure parameter s scales fitness differences.

**Why**: Natural selection is allele frequency change due to differential reproduction. Fitness-weighted sampling lets favored alleles increase in frequency over generations, demonstrating evolution.

**Implementation**:

```typescript
function calculateFitness(
  phenotype: Phenotype,
  selectionTarget: Phenotype,
  selectionPressure: number,
): number {
  // Base fitness = 1.0
  let fitness = 1.0

  // If phenotype matches selection target, increase fitness
  if (phenotypeMatches(phenotype, selectionTarget)) {
    fitness += selectionPressure // e.g., s=0.5 → fitness=1.5
  }

  return fitness
}

function selectParents(population: Organism[], count: number): Organism[] {
  // Fitness-proportional selection (roulette wheel)
  const totalFitness = population.reduce((sum, org) => sum + org.fitness, 0)
  const selected: Organism[] = []

  for (let i = 0; i < count; i++) {
    let random = Math.random() * totalFitness
    for (const org of population) {
      random -= org.fitness
      if (random <= 0) {
        selected.push(org)
        break
      }
    }
  }

  return selected
}
```

**Alternatives considered**:

- **Deterministic selection (always pick fittest)**: Unrealistic and too fast. Rejected.
- **Truncation selection**: Simpler but less smooth. Rejected — fitness-proportional is more pedagogical.
- **Tournament selection**: More realistic but harder to explain. Deferred.

### Hardy-Weinberg Equilibrium: Chi-Square Goodness-of-Fit

**Decision**: Calculate expected genotype frequencies under Hardy-Weinberg equilibrium (p² AA, 2pq Aa, q² aa) given observed allele frequencies p and q. Compare observed vs. expected using chi-square statistic. Large chi-square indicates deviation from equilibrium (selection, mutation, drift, or non-random mating).

**Why**: Hardy-Weinberg equilibrium is a foundational concept in population genetics. Tracking it teaches users that populations _stay the same_ unless forces act on them (analogous to Newton's First Law). Deviations reveal when evolution is happening.

**Implementation**:

```typescript
function calculateHardyWeinberg(population: Organism[], locusIndex: number): HWEquilibrium {
  // Count alleles
  const alleleCounts = countAlleles(population, locusIndex)
  const totalAlleles = population.length * 2 // Diploid

  const p = alleleCounts['A'] / totalAlleles
  const q = alleleCounts['a'] / totalAlleles

  // Expected genotype frequencies
  const expectedAA = p * p * population.length
  const expectedAa = 2 * p * q * population.length
  const expectedaa = q * q * population.length

  // Observed genotype counts
  const observedAA = countGenotype(population, locusIndex, ['A', 'A'])
  const observedAa =
    countGenotype(population, locusIndex, ['A', 'a']) +
    countGenotype(population, locusIndex, ['a', 'A'])
  const observedaa = countGenotype(population, locusIndex, ['a', 'a'])

  // Chi-square statistic
  const chiSquare =
    (observedAA - expectedAA) ** 2 / expectedAA +
    (observedAa - expectedAa) ** 2 / expectedAa +
    (observedaa - expectedaa) ** 2 / expectedaa

  return {
    p,
    q,
    chiSquare,
    expected: [expectedAA, expectedAa, expectedaa],
    observed: [observedAA, observedAa, observedaa],
  }
}
```

**Chi-square interpretation**: χ² > 3.84 (p < 0.05, df=1) indicates significant deviation. Display in telemetry and plot over generations.

**Alternatives considered**:

- **Skip Hardy-Weinberg**: Simpler but loses key population genetics concept. Rejected — it's essential.
- **Exact test instead of chi-square**: More accurate for small populations but harder to explain. Rejected — chi-square is standard.

### Generation Step Function: Replace Population

**Decision**: Each generation step replaces the entire population. Select parents (random or fitness-weighted), breed to produce N offspring (where N = population size), compute phenotypes and fitness, replace old generation with new.

**Why**: Non-overlapping generations simplify logic and match many teaching contexts (annual plants, Drosophila experiments). It also makes generation count unambiguous.

**Algorithm**:

```typescript
function advanceGeneration(state: PopulationState, params: Parameters): PopulationState {
  const newPopulation: Organism[] = []

  for (let i = 0; i < params.populationSize; i++) {
    // Select two parents
    const parent1 = selectParent(state.population, params)
    const parent2 = selectParent(state.population, params)

    // Form gametes with mutation
    const gamete1 = formGameteWithMutation(parent1.genotype, params.mutationRate)
    const gamete2 = formGameteWithMutation(parent2.genotype, params.mutationRate)

    // Fertilize to create offspring
    const offspringGenotype = fertilize(gamete1, gamete2)
    const offspringPhenotype = calculatePhenotype(offspringGenotype)
    const offspringFitness = calculateFitness(
      offspringPhenotype,
      params.selectionTarget,
      params.selectionPressure,
    )

    newPopulation.push({
      genotype: offspringGenotype,
      phenotype: offspringPhenotype,
      fitness: offspringFitness,
      generation: state.generation + 1,
    })
  }

  return {
    population: newPopulation,
    generation: state.generation + 1,
  }
}
```

**Alternatives considered**:

- **Overlapping generations**: More realistic but complicates age tracking. Deferred.
- **Partial replacement**: Simpler but loses clarity of generational boundary. Rejected.

### Canvas Rendering: Grid Layout with Trait Visualization

**Decision**: Render organisms in a grid (e.g., 10×10 for 100 organisms). Each organism is a sprite (circle/square) with color and size determined by phenotype. Highlight selected organisms with colored outline. Render Punnett square overlay as a floating grid in bottom-left corner.

**Why**: Grid layout is visually organized and scales well. Trait visualization (color/size/shape) makes genotype-phenotype connection obvious. Punnett square overlay reinforces predictions.

**Performance**: For 500 organisms, rendering 500 sprites at 60 FPS requires ~8ms (well within 16ms budget). Use `requestAnimationFrame` and batch Canvas draw calls.

**Layout**:

```
┌─────────────────────────────────────────┐
│  [HW Plot]          [Telemetry]         │
│                                          │
│   O  O  O  O  O  O  O  O  O  O          │
│   O  O  O  O  O  O  O  O  O  O          │
│   O  O  O  O  O  O  O  O  O  O          │
│   O  O  O  O  O  O  O  O  O  O          │
│                                          │
│  [Punnett Square]   [Frequency Bars]    │
└─────────────────────────────────────────┘
```

**Alternatives considered**:

- **List layout**: Harder to see population patterns. Rejected.
- **WebGL for rendering**: Overkill for 500 sprites. Rejected — Canvas 2D is sufficient.

## Risks / Trade-offs

### Risk: Population Size Performance

**Risk**: Rendering 500 organisms at 60 FPS may be challenging on low-end devices.

**Mitigation**: Profile early. Implement rendering optimizations (sprite batching, dirty regions). Cap population size at 500. If needed, reduce default to 100 and make 500 an advanced option.

### Risk: Punnett Square Complexity for 3+ Traits

**Risk**: For 3 traits (AaBbCc × AaBbCc), Punnett square is 8×8 (64 cells) — hard to visualize.

**Mitigation**: Default to 2 traits. Only unlock 3+ traits in sandbox mode. For 3+ traits, show statistical predictions instead of full Punnett square.

### Risk: Genetic Drift Dominates in Small Populations

**Risk**: With population size 10, random drift can overpower selection, confusing users.

**Mitigation**: Set default population size to 100 (large enough to minimize drift). Warn users in mission briefings if population size is too small for selection to be effective.

### Trade-off: Realism vs. Clarity

**Trade-off**: Real genetics includes linkage, epistasis, pleiotropy, sex chromosomes, etc. Simplifying to independent diploid loci with classical dominance sacrifices realism for pedagogical clarity.

**Decision**: Accept simplified model for Episode 04. Future episodes can layer in complexity (e.g., "Gene Lab Advanced" with linkage and recombination).

## Migration Plan

N/A — this is a new episode, not a migration.

## Open Questions

1. **Should mutation produce entirely novel alleles or mutate back to existing alleles?**
   - **Proposal**: Novel alleles for Mission: Mutation. More dramatic and easier to observe. Back-mutation can be added later if needed.

2. **Should selection favor specific alleles or phenotypes?**
   - **Proposal**: Favor phenotypes (e.g., "green color" rather than "A allele"). More intuitive for users. Under the hood, this translates to allele frequency change.

3. **Should we visualize individual organisms or aggregate population statistics?**
   - **Proposal**: Both. Grid shows individual organisms (helps users see variation). Telemetry and bar charts show aggregate statistics (helps users see trends).

4. **How to handle multi-locus Punnett squares (4×4 or 8×8)?**
   - **Proposal**: Default to single-locus (2×2) for simplicity. Allow two-locus (4×4) for advanced users. For 3+ loci, show statistical predictions instead of full grid.
