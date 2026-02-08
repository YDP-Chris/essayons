## 1. Foundation and Constants

- [ ] 1.1 Define TypeScript interfaces for genotype (diploid allele pairs), phenotype (visible traits), organism (genotype + phenotype + fitness), population state, and breeding records in `types.ts`
- [ ] 1.2 Define biological constants: default mutation rate (e.g., 0.001 per allele per generation), population size (e.g., 100 organisms), number of traits (1-5), selection coefficient range, and mission threshold constants in `constants.ts`
- [ ] 1.3 Create `GeneLabEpisode.ts` entry point that instantiates DiscreteEngine with genetics-specific configuration and registers all subsystems

## 2. Genotype and Allele Representation

- [ ] 2.1 Implement `Genotype` class representing diploid genotype with multiple loci (each locus has two alleles, one from each parent)
- [ ] 2.2 Implement allele storage using typed string identifiers (e.g., "A", "a") or numeric codes with dominance metadata
- [ ] 2.3 Implement dominance rules: given two alleles at a locus, determine which phenotype is expressed (dominant/recessive, co-dominant, incomplete dominance)
- [ ] 2.4 Implement genotype equality checking and serialization for state history and debugging
- [ ] 2.5 Write unit tests: verify heterozygote Aa expresses dominant phenotype; verify homozygote aa expresses recessive; verify multi-locus genotypes are stored correctly

## 3. Phenotype Calculation

- [ ] 3.1 Implement `Phenotype` class that derives visible traits (color, size, shape) from genotype using dominance rules
- [ ] 3.2 Implement trait-to-visual mapping: color trait maps to organism sprite color (RGB values), size trait maps to sprite scale, shape trait maps to sprite geometry
- [ ] 3.3 Implement phenotype caching so repeated lookups from the same genotype are fast
- [ ] 3.4 Support multiple independent traits with independent assortment (e.g., color trait on locus 1, size trait on locus 2)
- [ ] 3.5 Write unit tests: verify genotype AA + dominance rule produces expected color; verify AaBb produces correct two-trait phenotype; verify phenotype updates when genotype changes

## 4. Organism and Population Model

- [ ] 4.1 Implement `Organism` class combining genotype, phenotype, fitness score, and generation metadata
- [ ] 4.2 Implement population as an array of organisms with configurable size (adjustable parameter)
- [ ] 4.3 Implement initial population generation with configurable allele frequencies (e.g., p=0.5 for A, q=0.5 for a) using Hardy-Weinberg expected frequencies
- [ ] 4.4 Implement population reset to restore initial allele frequencies
- [ ] 4.5 Write unit tests: verify initial population matches expected genotype frequencies; verify population size is correct

## 5. Mendelian Inheritance and Breeding

- [ ] 5.1 Implement gamete formation from diploid genotype: randomly select one allele from each locus (meiosis with independent assortment)
- [ ] 5.2 Implement fertilization: combine two gametes to create diploid offspring genotype
- [ ] 5.3 Implement breeding function: given two parent organisms, produce offspring genotype following Mendelian rules
- [ ] 5.4 Implement random mating mode where breeding pairs are selected randomly from the population
- [ ] 5.5 Implement controlled mating mode where user selects specific parent organisms for targeted crosses
- [ ] 5.6 Write unit tests: verify Aa × Aa produces 1 AA : 2 Aa : 1 aa ratio over many offspring; verify AaBb × AaBb produces correct 9:3:3:1 phenotype ratio for two independent traits

## 6. Punnett Square Visualization

- [ ] 6.1 Implement Punnett square generation for single-locus crosses (2×2 grid showing all gamete combinations)
- [ ] 6.2 Implement Punnett square generation for two-locus crosses (4×4 grid for dihybrid crosses)
- [ ] 6.3 Implement probability calculation from Punnett square: genotype ratios and phenotype ratios
- [ ] 6.4 Implement Punnett square overlay rendering on Canvas: grid with parent gametes on axes, offspring genotypes in cells, phenotype colors highlighted
- [ ] 6.5 Implement user-selectable parent organisms to update Punnett square dynamically
- [ ] 6.6 Write unit tests: verify Aa × Aa Punnett square produces correct 1:2:1 genotype ratio; verify AaBb × AaBb produces 16-cell grid with correct phenotype distribution

## 7. Mutation Implementation

- [ ] 7.1 Implement mutation application during gamete formation: with probability μ (mutation rate parameter), an allele switches to a different allele at the same locus
- [ ] 7.2 Implement novel allele generation when mutation occurs (e.g., A mutates to A' with new phenotype)
- [ ] 7.3 Implement mutation rate as an adjustable parameter (0 to 0.1 per allele per generation)
- [ ] 7.4 Track mutation events and display in telemetry (count of mutations per generation)
- [ ] 7.5 Write unit tests: verify mutation rate of 0.01 produces ~1% mutated alleles per generation over large sample; verify mutated alleles produce distinct phenotypes

## 8. Selection Pressure

- [ ] 8.1 Implement fitness calculation based on phenotype: organisms with favored trait have higher fitness scores
- [ ] 8.2 Implement selection pressure parameter (0 = no selection, 1 = strong selection) controlling fitness differences
- [ ] 8.3 Implement fitness-proportional breeding: organisms with higher fitness are more likely to be selected as parents for next generation
- [ ] 8.4 Implement generation step under selection: select parents weighted by fitness, breed to produce next generation, replace old population
- [ ] 8.5 Write unit tests: verify selection for trait A increases frequency of A allele over generations; verify selection strength parameter scales allele frequency change rate

## 9. Hardy-Weinberg Equilibrium Calculations

- [ ] 9.1 Implement Hardy-Weinberg expected genotype frequencies: p² (AA), 2pq (Aa), q² (aa) given allele frequencies p and q
- [ ] 9.2 Implement observed genotype frequency calculation from current population
- [ ] 9.3 Implement chi-square goodness-of-fit test comparing observed vs. expected frequencies under Hardy-Weinberg equilibrium
- [ ] 9.4 Implement deviation tracking to detect when population is not in equilibrium (indicating selection, mutation, drift, or non-random mating)
- [ ] 9.5 Write unit tests: verify population with p=0.5, no selection, no mutation stays near Hardy-Weinberg equilibrium; verify selection causes significant chi-square deviation

## 10. Generation Step Function

- [ ] 10.1 Implement discrete step function that advances population by one generation: select breeding pairs (random or fitness-weighted), produce offspring genotypes via Mendelian inheritance with mutation, calculate offspring phenotypes, replace old generation
- [ ] 10.2 Implement generation counter tracking number of steps (generations) elapsed since start
- [ ] 10.3 Implement step history storage for undo functionality (store population state snapshots)
- [ ] 10.4 Integrate step function with DiscreteEngine's step lifecycle hook
- [ ] 10.5 Write unit tests: verify step advances generation counter; verify allele frequencies change appropriately under selection; verify population size remains constant

## 11. Mission: Mendel's Peas

- [ ] 11.1 Define success criteria: user starts with homozygous parents (AA × aa), breeds F1 generation (all Aa), then breeds F1 × F1 to produce F2 generation with 3:1 phenotype ratio (within tolerance, e.g., 70-80% dominant phenotype)
- [ ] 11.2 Implement per-generation condition checking: detect when F2 generation is reached and phenotype ratio matches expectation
- [ ] 11.3 Implement mission briefing UI text explaining Mendel's pea experiment and the expected 3:1 ratio
- [ ] 11.4 Implement success/failure messages with brand voice
- [ ] 11.5 Write unit tests: verify mission succeeds when F2 ratio is 3:1; verify mission provides hints if ratio is far from expected

## 12. Mission: Hidden Traits

- [ ] 12.1 Define success criteria: user breeds organisms that appear identical (all dominant phenotype) but discovers recessive phenotype offspring, revealing hidden heterozygosity
- [ ] 12.2 Implement detection of recessive phenotype appearance from heterozygous crosses (Aa × Aa producing aa)
- [ ] 12.3 Implement mission briefing explaining concept of carriers and recessive alleles
- [ ] 12.4 Implement success message when recessive phenotype is discovered and failure guidance if only homozygous dominant crosses are attempted
- [ ] 12.5 Write unit tests: verify mission succeeds when aa offspring appear from Aa × Aa cross; verify mission detects when user only breeds AA × AA (no hidden traits)

## 13. Mission: Natural Selection

- [ ] 13.1 Define success criteria: start with balanced allele frequencies (p ≈ q ≈ 0.5), apply selection pressure favoring one phenotype, run for 10 generations, verify favored allele increases to >80% frequency
- [ ] 13.2 Implement per-generation allele frequency tracking and trend detection
- [ ] 13.3 Implement mission briefing explaining natural selection and allele frequency change
- [ ] 13.4 Implement success message when target frequency is reached and progress feedback showing frequency trend
- [ ] 13.5 Write unit tests: verify allele frequency increases under positive selection; verify mission succeeds when threshold is reached after 10 generations

## 14. Mission: Mutation

- [ ] 14.1 Define success criteria: increase mutation rate parameter to high value (e.g., 0.05), observe novel allele appearance within population, verify novel allele spreads to >5% frequency over multiple generations
- [ ] 14.2 Implement novel allele detection and tracking
- [ ] 14.3 Implement mission briefing explaining mutation as source of genetic variation
- [ ] 14.4 Implement success message when novel trait is established in population and failure guidance if mutation rate is too low
- [ ] 14.5 Write unit tests: verify high mutation rate produces novel alleles; verify novel alleles can spread in population

## 15. Sandbox Mode

- [ ] 15.1 Implement sandbox mode toggle that disables all mission condition checking and fail states
- [ ] 15.2 Unlock all parameters in sandbox: mutation rate (0-0.1), selection pressure (0-1), population size (10-500), trait count (1-5), starting allele frequencies
- [ ] 15.3 Add reset button to restore initial population without leaving sandbox
- [ ] 15.4 Write unit tests: verify no mission callbacks fire in sandbox mode; verify all parameters are adjustable

## 16. Telemetry Display

- [ ] 16.1 Implement telemetry computation module calculating allele frequencies for each trait, phenotype ratios, generation count, Hardy-Weinberg chi-square statistic, and observed vs. expected counts
- [ ] 16.2 Implement telemetry overlay rendering on Canvas: monospace font (IBM Plex Mono), positioned top-right, values update each generation
- [ ] 16.3 Implement value formatting: allele frequencies as percentages (0-100%), phenotype ratios as integers (e.g., 75:25), chi-square to 2 decimal places
- [ ] 16.4 Apply Biology accent color #8ac926 to telemetry labels and key values
- [ ] 16.5 Write unit tests: verify telemetry values match population state; verify formatting rules

## 17. Reference Panel

- [ ] 17.1 Implement collapsible reference panel as a React component (`ReferencePanel.tsx`) overlaying the canvas
- [ ] 17.2 Write content for Mendel's First Law (Law of Segregation): alleles separate during gamete formation, each gamete gets one allele
- [ ] 17.3 Write content for Mendel's Second Law (Law of Independent Assortment): alleles for different traits are inherited independently
- [ ] 17.4 Write content for dominant/recessive definitions: dominant allele masks recessive in heterozygotes, recessive only expressed in homozygotes
- [ ] 17.5 Write content for genotype vs. phenotype: genotype is genetic makeup, phenotype is observable traits
- [ ] 17.6 Write content for Punnett square construction: how to predict offspring ratios from parent genotypes
- [ ] 17.7 Write content for Hardy-Weinberg equilibrium: p² + 2pq + q² = 1, conditions required, and what deviations reveal
- [ ] 17.8 Apply Biology accent color #8ac926 to reference panel headings and key terms
- [ ] 17.9 Implement toggle to show/hide reference panel without losing user's place
- [ ] 17.10 Write unit tests: verify reference panel renders all content sections; verify toggle behavior

## 18. Canvas Rendering

- [ ] 18.1 Implement organism sprite rendering with trait visualization: color mapped to fill color, size mapped to scale, shape mapped to geometry (circle, square, triangle)
- [ ] 18.2 Implement population grid layout: organisms arranged in rows/columns, spacing adjustable based on population size
- [ ] 18.3 Implement Punnett square overlay: positioned bottom-left, 2×2 or 4×4 grid, parent gametes labeled on axes, offspring cells filled with phenotype colors
- [ ] 18.4 Implement allele frequency bar charts: stacked bars showing proportion of each allele in population, positioned bottom-right
- [ ] 18.5 Implement Hardy-Weinberg equilibrium plot: line graph showing chi-square statistic over generations, positioned top-left
- [ ] 18.6 Implement selection highlighting: selected organisms for breeding have colored outlines
- [ ] 18.7 Apply Biology accent color #8ac926 to UI elements, grid lines, and highlights
- [ ] 18.8 Implement Canvas clearing and re-render on each generation step (discrete mode pattern)
- [ ] 18.9 Optimize rendering for large populations (e.g., 500 organisms) to maintain 60 FPS re-renders
- [ ] 18.10 Write unit tests: verify organisms render with correct colors; verify Punnett square shows correct genotypes; verify bar charts match telemetry allele frequencies

## 19. Step Controls and Interaction

- [ ] 19.1 Implement "Next Generation" button that calls step function to advance one generation
- [ ] 19.2 Implement "Auto-Advance" toggle that automatically steps at configurable interval (0.5s, 1s, 2s, 5s)
- [ ] 19.3 Implement generation counter display showing current generation number
- [ ] 19.4 Implement "Reset" button that restores population to initial state
- [ ] 19.5 Implement organism selection interaction: click/tap organism to select for breeding pair
- [ ] 19.6 Implement breeding pair display showing selected parents and their genotypes
- [ ] 19.7 Implement parameter sliders for mutation rate, selection pressure, population size (sandbox mode only)
- [ ] 19.8 Implement keyboard shortcuts: Space = next generation, R = reset, A = toggle auto-advance
- [ ] 19.9 Write unit tests: verify next generation button advances state; verify auto-advance interval is correct; verify reset restores initial allele frequencies

## 20. Mobile and Touch Support

- [ ] 20.1 Implement touch-friendly organism selection (larger hit areas for organisms on small screens)
- [ ] 20.2 Implement touch controls for parameter adjustment (drag sliders work well on touch)
- [ ] 20.3 Implement responsive layout: reference panel collapses to bottom drawer on mobile, telemetry relocates to avoid overlap with controls
- [ ] 20.4 Test on mobile devices to ensure organism sprites are visible and controls are usable
- [ ] 20.5 Write unit tests: verify touch events trigger organism selection; verify responsive layout at various screen widths

## 21. Accessibility

- [ ] 21.1 Implement ARIA labels for all interactive elements (buttons, sliders, organism selection)
- [ ] 21.2 Implement keyboard navigation for organism selection (Tab to cycle through organisms, Enter to select)
- [ ] 21.3 Implement screen reader announcements for generation advancement, allele frequency changes, and mission success/failure
- [ ] 21.4 Ensure color-blind-safe phenotype visualization: use both color and shape/pattern to distinguish phenotypes
- [ ] 21.5 Ensure 4.5:1 contrast ratio for all text and UI elements against Biology accent color background
- [ ] 21.6 Write accessibility tests: verify ARIA labels are present; verify keyboard navigation works; verify color contrast meets WCAG AA

## 22. Integration and Deployment

- [ ] 22.1 Register Gene Lab episode in episode factory/registry so it appears in episode selection menu
- [ ] 22.2 Integrate Gene Lab with analytics to track episode load, mission completion, and parameter usage (Plausible events)
- [ ] 22.3 Add Gene Lab to CI/CD pipeline: unit tests must pass, build must succeed, e2e test for loading episode and completing Mendel's Peas mission
- [ ] 22.4 Write e2e test: load Gene Lab, advance one generation, verify population updates
- [ ] 22.5 Write e2e test: load Gene Lab, select breeding pair, verify Punnett square updates
- [ ] 22.6 Write e2e test: load Gene Lab, complete Mendel's Peas mission, verify success message
- [ ] 22.7 Deploy to Vercel staging environment and verify episode loads correctly in production-like conditions

## 23. Performance Optimization

- [ ] 23.1 Profile generation step function to ensure it completes in <50ms for population size 100
- [ ] 23.2 Profile Canvas rendering to ensure re-render after step completes in <16ms (60 FPS budget)
- [ ] 23.3 Implement organism sprite rendering optimizations: use sprite batching or instancing if many organisms
- [ ] 23.4 Implement lazy calculation of Hardy-Weinberg statistics (only when telemetry is visible)
- [ ] 23.5 Verify memory usage is stable across 100+ generations (no memory leaks from step history)
- [ ] 23.6 Write performance tests: assert generation step completes within budget; assert rendering frame time <16ms

## 24. Documentation and Polish

- [ ] 24.1 Write inline code comments explaining key genetics algorithms (Mendelian inheritance, Punnett square, Hardy-Weinberg calculation)
- [ ] 24.2 Document parameter ranges and their effects in code comments
- [ ] 24.3 Add JSDoc comments to all public functions and classes
- [ ] 24.4 Review all mission briefings and success/failure messages for brand voice consistency (encouraging, direct, no jargon)
- [ ] 24.5 Review reference panel content for accuracy and clarity (suitable for high school level)
- [ ] 24.6 Proofread all UI strings for typos and grammar
