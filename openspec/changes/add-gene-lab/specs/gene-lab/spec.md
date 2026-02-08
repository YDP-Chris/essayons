## ADDED Requirements

### Requirement: Diploid Genotype Representation

The system SHALL represent each organism's genotype as a diploid genome with N independent loci (default N=2, adjustable from 1 to 5). Each locus SHALL store two alleles (one from each parent) as an ordered pair. Each allele SHALL have an identifier (string) and a dominance value (numeric) to support classical Mendelian dominance, co-dominance, and incomplete dominance. The genotype SHALL be serializable for state history and debugging.

#### Scenario: Two-locus diploid genotype storage

- **WHEN** an organism has genotype AaBb (heterozygous at two loci)
- **THEN** the genotype SHALL store locus 1 as ["A", "a"] and locus 2 as ["B", "b"] with allele dominance metadata

#### Scenario: Homozygous genotype storage

- **WHEN** an organism has genotype AABB (homozygous dominant at two loci)
- **THEN** the genotype SHALL store locus 1 as ["A", "A"] and locus 2 as ["B", "B"]

#### Scenario: Single-locus genotype

- **WHEN** the user configures the simulation to track only one trait
- **THEN** the genotype SHALL store exactly one locus with two alleles

#### Scenario: Five-locus genotype

- **WHEN** the user configures the simulation to track five traits (sandbox mode)
- **THEN** the genotype SHALL store five loci, each with two alleles

### Requirement: Phenotype Calculation from Genotype

The system SHALL calculate phenotype (observable traits) from genotype by applying dominance rules to each locus. For each locus, if the two alleles differ in dominance value, the allele with higher dominance SHALL determine the trait value (classical dominance). If the two alleles have equal dominance, the system SHALL express both traits (co-dominance) or blend them (incomplete dominance). The phenotype SHALL include trait values for color, size, and shape, mapped from the genotype's loci.

#### Scenario: Classical dominant phenotype expression

- **WHEN** an organism has genotype Aa (heterozygote) where A has dominance=1 and a has dominance=0
- **THEN** the phenotype SHALL express the trait associated with allele A (e.g., green color)

#### Scenario: Recessive phenotype expression

- **WHEN** an organism has genotype aa (homozygous recessive) where a has dominance=0
- **THEN** the phenotype SHALL express the trait associated with allele a (e.g., yellow color)

#### Scenario: Co-dominant phenotype expression

- **WHEN** an organism has genotype Aa where A and a have equal dominance values
- **THEN** the phenotype SHALL express both traits simultaneously or blend them (e.g., green-yellow striped)

#### Scenario: Multi-trait phenotype

- **WHEN** an organism has genotype AaBb with two loci
- **THEN** the phenotype SHALL express the trait from locus 1 (color) and the trait from locus 2 (size) independently

#### Scenario: Phenotype caching for performance

- **WHEN** the phenotype is calculated for a genotype
- **THEN** subsequent lookups for the same genotype SHALL return the cached phenotype without recomputation

### Requirement: Trait Visualization

The system SHALL visualize organism phenotypes using color, size, and shape. Locus 1 SHALL control color (mapped to sprite fill color), locus 2 SHALL control size (mapped to sprite scale factor), and locus 3 SHALL control shape (mapped to sprite geometry: circle, square, or triangle). The visualization SHALL be color-blind-safe by using both color and shape/pattern to distinguish phenotypes. Color contrast SHALL meet WCAG AA standards (4.5:1 minimum contrast ratio).

#### Scenario: Color trait visualization

- **WHEN** an organism has genotype AA at locus 1 expressing "green" trait
- **THEN** the organism sprite SHALL render with green fill color (#8ac926)

#### Scenario: Size trait visualization

- **WHEN** an organism has genotype Bb at locus 2 expressing "large" trait
- **THEN** the organism sprite SHALL render at 1.5× scale relative to small organisms

#### Scenario: Shape trait visualization

- **WHEN** an organism has genotype cc at locus 3 expressing "square" trait
- **THEN** the organism sprite SHALL render as a square instead of a circle

#### Scenario: Combined multi-trait visualization

- **WHEN** an organism has genotype AaBbCc expressing green color, large size, and round shape
- **THEN** the organism sprite SHALL render as a large green circle

#### Scenario: Color-blind-safe differentiation

- **WHEN** two organisms differ in phenotype
- **THEN** the distinction SHALL be perceivable through both color AND shape/pattern, not color alone

### Requirement: Mendelian Inheritance - Gamete Formation

The system SHALL implement gamete formation (meiosis) by randomly selecting one allele from each locus independently. For a diploid organism with genotype [A, a] at locus 1 and [B, b] at locus 2, the system SHALL produce four possible gametes: AB, Ab, aB, ab, each with equal probability 0.25 (independent assortment). The system SHALL apply mutation to alleles during gamete formation with probability equal to the mutation rate parameter.

#### Scenario: Simple segregation for single locus

- **WHEN** an organism with genotype Aa forms a gamete
- **THEN** the gamete SHALL contain either allele A with probability 0.5 or allele a with probability 0.5

#### Scenario: Independent assortment for two loci

- **WHEN** an organism with genotype AaBb forms gametes
- **THEN** gamete AB SHALL occur with probability 0.25, Ab with 0.25, aB with 0.25, and ab with 0.25

#### Scenario: Gamete formation from homozygote

- **WHEN** an organism with genotype AA forms a gamete
- **THEN** the gamete SHALL always contain allele A

#### Scenario: Gamete mutation during formation

- **WHEN** an organism with genotype Aa forms a gamete AND the mutation rate is 0.1
- **THEN** approximately 10% of gametes SHALL contain a novel mutated allele instead of A or a

### Requirement: Mendelian Inheritance - Fertilization

The system SHALL implement fertilization by combining two gametes (one from each parent) to form a diploid offspring genotype. For each locus, the offspring SHALL receive one allele from the first parent's gamete and one allele from the second parent's gamete. The resulting genotype SHALL be diploid with allele pairs at each locus.

#### Scenario: Heterozygote cross producing homozygotes

- **WHEN** parent 1 with gamete A and parent 2 with gamete A fertilize
- **THEN** the offspring genotype SHALL be AA (homozygous dominant)

#### Scenario: Heterozygote cross producing heterozygotes

- **WHEN** parent 1 with gamete A and parent 2 with gamete a fertilize
- **THEN** the offspring genotype SHALL be Aa (heterozygote)

#### Scenario: Two-locus fertilization

- **WHEN** parent 1 gamete AB and parent 2 gamete ab fertilize
- **THEN** the offspring genotype SHALL be AaBb

#### Scenario: Mendel's 3:1 ratio from Aa × Aa

- **WHEN** 100 offspring are produced from Aa × Aa crosses
- **THEN** the genotype distribution SHALL approximate 25 AA : 50 Aa : 25 aa, and the phenotype distribution SHALL approximate 75 dominant : 25 recessive (3:1 ratio)

### Requirement: Punnett Square Visualization

The system SHALL generate and display Punnett squares showing all possible offspring genotypes from a selected pair of parent organisms. For single-locus crosses, the system SHALL display a 2×2 grid with parent gametes labeled on the axes and offspring genotypes in the cells. For two-locus crosses, the system SHALL display a 4×4 grid. Each cell SHALL be color-coded by phenotype to show predicted offspring appearance. The system SHALL calculate and display genotype ratios and phenotype ratios from the Punnett square.

#### Scenario: Single-locus Punnett square for Aa × Aa

- **WHEN** the user selects two heterozygote parents (Aa × Aa) for breeding
- **THEN** the Punnett square SHALL display a 2×2 grid with gametes A and a on both axes, cells showing AA, Aa, Aa, aa, and genotype ratio 1:2:1 and phenotype ratio 3:1

#### Scenario: Two-locus Punnett square for AaBb × AaBb

- **WHEN** the user selects two dihybrid parents (AaBb × AaBb) for breeding
- **THEN** the Punnett square SHALL display a 4×4 grid with gametes AB, Ab, aB, ab on both axes, 16 offspring genotypes in cells, and phenotype ratio 9:3:3:1

#### Scenario: Homozygous cross Punnett square

- **WHEN** the user selects parents AA × aa
- **THEN** the Punnett square SHALL show all offspring as Aa (100% heterozygotes)

#### Scenario: Phenotype color-coding in Punnett square

- **WHEN** the Punnett square is displayed
- **THEN** each cell SHALL be filled with the color corresponding to the offspring's predicted phenotype

#### Scenario: User selects different parents

- **WHEN** the user selects a new pair of parents
- **THEN** the Punnett square SHALL update immediately to show the new predicted offspring distribution

### Requirement: Mutation During Gamete Formation

The system SHALL apply mutation during gamete formation with probability μ (mutation rate parameter, adjustable from 0 to 0.1). For each allele in a gamete, with probability μ, the system SHALL replace the allele with a novel allele at the same locus. Novel alleles SHALL have distinct trait values (e.g., if existing alleles are "green" and "yellow", a novel allele might be "blue"). The system SHALL track novel alleles and display mutation events in telemetry.

#### Scenario: Mutation creating novel allele

- **WHEN** mutation rate is 0.1 AND an organism forms 100 gametes
- **THEN** approximately 10 gametes SHALL contain a mutated allele with a novel trait value

#### Scenario: Novel allele produces distinct phenotype

- **WHEN** a novel allele is created through mutation
- **THEN** organisms carrying the novel allele SHALL display a phenotype distinct from all pre-existing phenotypes

#### Scenario: No mutation at zero mutation rate

- **WHEN** mutation rate is 0
- **THEN** all gametes SHALL contain only the original parental alleles with no novel alleles

#### Scenario: Mutation tracking in telemetry

- **WHEN** mutations occur during a generation
- **THEN** the telemetry display SHALL show the count of mutation events and list novel alleles present in the population

### Requirement: Selection Pressure and Fitness

The system SHALL calculate fitness scores for organisms based on their phenotype. Organisms with phenotypes matching the selection target SHALL have higher fitness. The selection pressure parameter (0 to 1, where 0=no selection, 1=strong selection) SHALL scale fitness differences. When forming the next generation, the system SHALL select parents with probability proportional to their fitness (fitness-proportional selection). Over multiple generations under positive selection, the frequency of favored alleles SHALL increase.

#### Scenario: Fitness calculation under selection

- **WHEN** an organism has a phenotype matching the selection target AND selection pressure is 0.5
- **THEN** the organism's fitness SHALL be 1.5 (base fitness 1.0 + 0.5 bonus)

#### Scenario: Fitness calculation without selection

- **WHEN** selection pressure is 0
- **THEN** all organisms SHALL have equal fitness of 1.0 regardless of phenotype

#### Scenario: Fitness-proportional parent selection

- **WHEN** forming the next generation under selection pressure 0.5
- **THEN** organisms with higher fitness SHALL be more likely to be selected as parents

#### Scenario: Allele frequency increase under selection

- **WHEN** a population starts with allele A at 50% frequency AND selection favors phenotype A AND 10 generations pass
- **THEN** allele A frequency SHALL increase to above 80%

### Requirement: Hardy-Weinberg Equilibrium Calculation

The system SHALL calculate expected genotype frequencies under Hardy-Weinberg equilibrium: p² (AA), 2pq (Aa), q² (aa), where p and q are the observed allele frequencies in the current population. The system SHALL compute observed genotype frequencies by counting genotypes in the population. The system SHALL calculate the chi-square goodness-of-fit statistic comparing observed vs. expected frequencies. A chi-square value greater than 3.84 SHALL indicate significant deviation from equilibrium (p < 0.05). The system SHALL display chi-square values in telemetry and plot them over generations.

#### Scenario: Population in Hardy-Weinberg equilibrium

- **WHEN** a population has no selection, no mutation, and random mating for 5 generations
- **THEN** the chi-square statistic SHALL remain below 3.84, indicating the population is in Hardy-Weinberg equilibrium

#### Scenario: Deviation from equilibrium under selection

- **WHEN** selection pressure favors one phenotype for 5 generations
- **THEN** the chi-square statistic SHALL exceed 3.84, indicating deviation from Hardy-Weinberg equilibrium

#### Scenario: Allele frequency calculation

- **WHEN** a population of 100 diploid organisms contains 60 A alleles and 140 a alleles (out of 200 total alleles)
- **THEN** the calculated allele frequencies SHALL be p=0.3 for A and q=0.7 for a

#### Scenario: Expected genotype frequencies

- **WHEN** allele frequencies are p=0.5 and q=0.5
- **THEN** the expected Hardy-Weinberg genotype frequencies SHALL be 25% AA, 50% Aa, 25% aa

### Requirement: Generation Step Function

The system SHALL advance the population by one generation using a discrete step function. Each step SHALL replace the entire population with a new generation by: (1) selecting parent pairs (randomly or fitness-weighted based on selection pressure), (2) forming gametes from each parent with mutation applied, (3) fertilizing gametes to produce offspring genotypes, (4) calculating offspring phenotypes and fitness, (5) replacing the old population with offspring. The generation counter SHALL increment by 1 with each step. The system SHALL store previous population states in step history for undo functionality.

#### Scenario: Generation advancement increments counter

- **WHEN** the user clicks "Next Generation" button
- **THEN** the generation counter SHALL increment by 1 and the population SHALL be replaced with offspring

#### Scenario: Population size remains constant

- **WHEN** a population of size 100 advances one generation
- **THEN** the new population SHALL also have size 100

#### Scenario: Offspring replace parents

- **WHEN** a generation step occurs
- **THEN** all organisms in the new generation SHALL be offspring produced by breeding the previous generation's organisms

#### Scenario: Step history for undo

- **WHEN** a generation step occurs
- **THEN** the previous population state SHALL be stored in step history, allowing the user to undo to the previous generation

### Requirement: Mission - Mendel's Peas

The system SHALL provide a "Mendel's Peas" mission that challenges the user to replicate Mendel's classic experiment. The mission SHALL start with two homozygous parent organisms (AA × aa). The user SHALL breed them to produce F1 generation (all Aa heterozygotes). The user SHALL then breed F1 × F1 to produce F2 generation. The mission SHALL evaluate success when the F2 generation exhibits a phenotype ratio within tolerance of 3:1 dominant to recessive (e.g., 70-80% dominant phenotype). The mission SHALL detect failure if the user skips F1 generation or breeds incorrect parents.

#### Scenario: Successful completion of Mendel's Peas

- **WHEN** the user breeds AA × aa to produce F1 (Aa) AND breeds F1 × F1 to produce F2 AND F2 phenotype ratio is 75% dominant : 25% recessive (within 5% tolerance)
- **THEN** the mission SHALL transition to SUCCESS state and display congratulatory message

#### Scenario: F1 generation detection

- **WHEN** the user breeds homozygous parents AA × aa
- **THEN** the system SHALL detect that all offspring are Aa and confirm F1 generation is correct

#### Scenario: F2 generation detection

- **WHEN** the user breeds F1 × F1 heterozygotes
- **THEN** the system SHALL detect F2 generation and evaluate phenotype ratio

#### Scenario: Failure from incorrect cross

- **WHEN** the user breeds AA × AA or aa × aa instead of AA × aa
- **THEN** the mission SHALL provide guidance that homozygous crosses do not produce heterozygotes

### Requirement: Mission - Hidden Traits

The system SHALL provide a "Hidden Traits" mission that challenges the user to discover recessive alleles hidden in heterozygous organisms. The mission SHALL present a population of organisms that all display the dominant phenotype (AA and Aa genotypes mixed). The user SHALL breed organisms to discover which are heterozygotes (Aa) by observing offspring with recessive phenotype (aa). The mission SHALL evaluate success when the user successfully produces at least one recessive phenotype offspring, revealing the hidden recessive allele.

#### Scenario: Successful discovery of recessive trait

- **WHEN** the user breeds two organisms with genotypes Aa × Aa AND offspring include at least one aa (recessive phenotype)
- **THEN** the mission SHALL transition to SUCCESS state and explain that the parents were carriers of the recessive allele

#### Scenario: Breeding homozygous dominant fails to reveal recessive

- **WHEN** the user breeds organisms with genotypes AA × AA
- **THEN** no recessive offspring SHALL appear and the mission SHALL provide hint to try different parents

#### Scenario: Identifying heterozygotes

- **WHEN** the user breeds an organism with unknown genotype with a known recessive (aa) AND recessive offspring appear
- **THEN** the system SHALL indicate that the unknown organism was a heterozygote (Aa)

### Requirement: Mission - Natural Selection

The system SHALL provide a "Natural Selection" mission that challenges the user to observe allele frequency change over multiple generations under selection pressure. The mission SHALL start with a population at balanced allele frequencies (p ≈ q ≈ 0.5). The user SHALL apply selection pressure favoring one phenotype. The mission SHALL evaluate success when the favored allele's frequency increases to above 80% within 10 generations. The mission SHALL display allele frequency trends over generations to show evolution in action.

#### Scenario: Successful allele frequency shift under selection

- **WHEN** the user starts with p=0.5 for allele A AND applies selection pressure 0.5 favoring phenotype A AND advances 10 generations
- **THEN** allele A frequency SHALL increase to above 80% and the mission SHALL transition to SUCCESS state

#### Scenario: No frequency change without selection

- **WHEN** the user does not apply selection pressure AND advances 10 generations
- **THEN** allele frequencies SHALL remain near 0.5 (within drift tolerance) and the mission SHALL provide hint to apply selection

#### Scenario: Allele frequency tracking

- **WHEN** each generation advances during the Natural Selection mission
- **THEN** the system SHALL display current allele frequencies and plot frequency trend over time

#### Scenario: Hardy-Weinberg deviation under selection

- **WHEN** selection pressure is applied
- **THEN** the Hardy-Weinberg chi-square statistic SHALL increase above 3.84, indicating evolution is occurring

### Requirement: Mission - Mutation

The system SHALL provide a "Mutation" mission that challenges the user to observe novel trait emergence through mutation. The mission SHALL start with a population containing only two alleles at each locus. The user SHALL increase the mutation rate parameter to a high value (e.g., 0.05). The mission SHALL evaluate success when a novel allele appears in the population AND spreads to at least 5% frequency within 10 generations. The mission SHALL track novel alleles and display them in telemetry.

#### Scenario: Successful novel trait emergence

- **WHEN** the user sets mutation rate to 0.05 AND advances 10 generations AND a novel allele reaches 5% frequency
- **THEN** the mission SHALL transition to SUCCESS state and explain that mutation introduced genetic variation

#### Scenario: Novel allele appearance detection

- **WHEN** mutation rate is high AND a generation step occurs
- **THEN** the system SHALL detect novel alleles and display them in telemetry with distinct phenotype labels

#### Scenario: No novel traits at low mutation rate

- **WHEN** mutation rate is 0 or very low (< 0.001) AND 10 generations pass
- **THEN** no novel alleles SHALL appear and the mission SHALL provide hint to increase mutation rate

#### Scenario: Novel allele spread tracking

- **WHEN** a novel allele appears
- **THEN** the system SHALL track its frequency over subsequent generations and display the frequency trend

### Requirement: Sandbox Mode

The system SHALL provide a sandbox mode that disables all mission condition checking and fail states. In sandbox mode, the user SHALL have access to all adjustable parameters: mutation rate (0 to 0.1), selection pressure (0 to 1), population size (10 to 500), number of traits (1 to 5), and starting allele frequencies. The user SHALL be able to reset the population to initial conditions at any time without leaving sandbox mode. No mission success or failure messages SHALL appear in sandbox mode.

#### Scenario: Unlocked parameters in sandbox

- **WHEN** the user enters sandbox mode
- **THEN** all parameters (mutation rate, selection pressure, population size, trait count, starting allele frequencies) SHALL be adjustable without restrictions

#### Scenario: No mission evaluation in sandbox

- **WHEN** the user is in sandbox mode AND advances multiple generations
- **THEN** no mission success or failure messages SHALL appear

#### Scenario: Reset in sandbox mode

- **WHEN** the user clicks "Reset" in sandbox mode
- **THEN** the population SHALL return to initial allele frequencies and generation counter SHALL reset to 0

#### Scenario: Extreme parameter values in sandbox

- **WHEN** the user sets population size to 500 and trait count to 5 in sandbox mode
- **THEN** the simulation SHALL handle these parameters without errors and rendering SHALL complete within performance budget

### Requirement: Telemetry Display

The system SHALL display real-time telemetry showing: allele frequencies for each trait (as percentages), phenotype ratios (as integers), generation count, Hardy-Weinberg chi-square statistic (to 2 decimal places), and observed vs. expected genotype counts. Telemetry SHALL be rendered in a fixed overlay positioned in the top-right corner of the canvas using monospace font (IBM Plex Mono). Telemetry values SHALL update after each generation step. The system SHALL apply Biology domain accent color (#8ac926) to telemetry labels and key values.

#### Scenario: Allele frequency display

- **WHEN** a population has 60% A alleles and 40% a alleles at locus 1
- **THEN** the telemetry SHALL display "Locus 1: A=60%, a=40%"

#### Scenario: Phenotype ratio display

- **WHEN** a population has 75 dominant phenotype organisms and 25 recessive phenotype organisms
- **THEN** the telemetry SHALL display "Phenotype Ratio: 75:25"

#### Scenario: Generation count display

- **WHEN** 5 generation steps have occurred since start
- **THEN** the telemetry SHALL display "Generation: 5"

#### Scenario: Hardy-Weinberg statistic display

- **WHEN** the chi-square statistic is 4.23
- **THEN** the telemetry SHALL display "H-W χ²: 4.23"

#### Scenario: Telemetry updates after generation step

- **WHEN** a generation step occurs
- **THEN** all telemetry values SHALL update within 50ms to reflect the new population state

### Requirement: Reference Panel

The system SHALL provide a collapsible reference panel displaying educational content including: Mendel's First Law (Law of Segregation), Mendel's Second Law (Law of Independent Assortment), dominant and recessive allele definitions, genotype vs. phenotype explanation, Punnett square construction guide, and Hardy-Weinberg equilibrium formula and interpretation. The reference panel SHALL be implemented as a React component overlaying the canvas. The user SHALL be able to toggle the panel visibility without losing simulation state. The system SHALL apply Biology domain accent color (#8ac926) to reference panel headings and key terms.

#### Scenario: Reference panel toggle

- **WHEN** the user clicks the reference panel toggle button
- **THEN** the reference panel SHALL open or close without affecting the simulation state

#### Scenario: Mendel's First Law content

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display "Law of Segregation: Alleles separate during gamete formation, each gamete receives one allele"

#### Scenario: Dominant/recessive definition

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display "Dominant allele: expressed in heterozygotes; Recessive allele: only expressed in homozygotes"

#### Scenario: Punnett square guide

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL include a step-by-step guide for constructing Punnett squares

#### Scenario: Hardy-Weinberg formula display

- **WHEN** the user opens the reference panel
- **THEN** the panel SHALL display the Hardy-Weinberg equation "p² + 2pq + q² = 1" with explanations of each term

### Requirement: Step Controls

The system SHALL provide step controls allowing the user to advance generations manually or automatically. The controls SHALL include: "Next Generation" button (advances one generation), "Auto-Advance" toggle (automatically steps at configurable interval: 0.5s, 1s, 2s, 5s), generation counter display, "Reset" button (restores initial population), and organism selection for breeding pairs. The controls SHALL be accessible via mouse, touch, and keyboard (Space=next generation, R=reset, A=toggle auto-advance).

#### Scenario: Manual generation advancement

- **WHEN** the user clicks "Next Generation" button
- **THEN** the simulation SHALL advance by exactly one generation and update the display

#### Scenario: Auto-advance toggle

- **WHEN** the user enables "Auto-Advance" with 1s interval
- **THEN** the simulation SHALL automatically advance one generation every 1 second until auto-advance is disabled

#### Scenario: Generation counter display

- **WHEN** the simulation has advanced 15 generations
- **THEN** the generation counter display SHALL show "Generation: 15"

#### Scenario: Reset button

- **WHEN** the user clicks "Reset" button
- **THEN** the population SHALL restore to initial allele frequencies, generation counter SHALL reset to 0, and step history SHALL be cleared

#### Scenario: Organism selection for breeding

- **WHEN** the user clicks on an organism in the population grid
- **THEN** the organism SHALL be highlighted and added to the breeding pair selection

#### Scenario: Keyboard shortcut for next generation

- **WHEN** the user presses the Space key
- **THEN** the simulation SHALL advance by one generation (equivalent to clicking "Next Generation")

### Requirement: Canvas Rendering

The system SHALL render the simulation on an HTML5 Canvas using 2D context. Rendering SHALL include: organism sprites in grid layout with trait visualization (color, size, shape), Punnett square overlay (bottom-left corner), allele frequency bar charts (bottom-right corner), Hardy-Weinberg chi-square plot (top-left corner), telemetry overlay (top-right corner), and selected organism highlighting (colored outline). The system SHALL clear and re-render the entire canvas after each generation step. Rendering SHALL complete within 16ms (60 FPS budget) even for populations of 500 organisms. The system SHALL apply Biology domain accent color (#8ac926) to UI elements, grid lines, and highlights.

#### Scenario: Organism grid rendering

- **WHEN** the population has 100 organisms
- **THEN** the system SHALL render 100 organism sprites in a 10×10 grid layout with appropriate spacing

#### Scenario: Organism trait visualization rendering

- **WHEN** an organism has phenotype (green, large, circle)
- **THEN** the organism sprite SHALL render as a green circle scaled to 1.5× size

#### Scenario: Punnett square overlay rendering

- **WHEN** two parent organisms are selected for breeding
- **THEN** a Punnett square overlay SHALL render in the bottom-left corner showing predicted offspring

#### Scenario: Allele frequency bar chart rendering

- **WHEN** the population has 60% A alleles and 40% a alleles
- **THEN** a stacked bar chart SHALL render in the bottom-right corner with green bar (60% height) and yellow bar (40% height)

#### Scenario: Hardy-Weinberg plot rendering

- **WHEN** 10 generations have passed
- **THEN** a line graph plotting chi-square values over 10 generations SHALL render in the top-left corner

#### Scenario: Selected organism highlighting

- **WHEN** the user selects an organism for breeding
- **THEN** the organism sprite SHALL render with a colored outline (Biology accent color #8ac926)

#### Scenario: Rendering performance for large populations

- **WHEN** the population size is 500 organisms
- **THEN** the system SHALL complete Canvas rendering in less than 16ms (60 FPS requirement)

### Requirement: Mobile and Touch Support

The system SHALL support touch input on mobile devices. Touch interactions SHALL include: tap organism to select for breeding, drag on sliders to adjust parameters, tap "Next Generation" button, and pinch-to-zoom on Punnett square overlay. The system SHALL implement responsive layout: reference panel collapses to bottom drawer on screens narrower than 768px, telemetry relocates to avoid overlap with controls, and organism sprites increase hit area size for easier touch selection. All interactive elements SHALL have minimum touch target size of 44×44px.

#### Scenario: Touch selection of organism

- **WHEN** the user taps an organism on a touch device
- **THEN** the organism SHALL be selected and highlighted for breeding

#### Scenario: Touch slider adjustment

- **WHEN** the user drags a parameter slider on a touch device
- **THEN** the parameter value SHALL adjust smoothly in response to touch movement

#### Scenario: Responsive layout on mobile

- **WHEN** the simulation is loaded on a device with screen width 375px
- **THEN** the reference panel SHALL collapse to a bottom drawer and telemetry SHALL relocate to avoid overlap

#### Scenario: Minimum touch target size

- **WHEN** rendering on a touch device
- **THEN** all interactive elements (buttons, sliders, organisms) SHALL have touch target size of at least 44×44px

### Requirement: Accessibility

The system SHALL meet WCAG AA accessibility standards. All interactive elements SHALL have ARIA labels. Keyboard navigation SHALL support Tab to cycle through interactive elements, Enter to activate buttons, and arrow keys to select organisms. Screen reader announcements SHALL occur for generation advancement, allele frequency changes, and mission success/failure. Phenotype visualization SHALL be color-blind-safe by using both color and shape/pattern. All text SHALL meet 4.5:1 contrast ratio minimum against background colors.

#### Scenario: ARIA labels on buttons

- **WHEN** a screen reader encounters the "Next Generation" button
- **THEN** the button SHALL announce "Next Generation button" via ARIA label

#### Scenario: Keyboard navigation for organism selection

- **WHEN** the user presses Tab key
- **THEN** focus SHALL cycle through organisms in the population grid

#### Scenario: Screen reader announcement for generation advancement

- **WHEN** a generation step occurs
- **THEN** a screen reader SHALL announce "Generation 5. Allele A frequency: 65%."

#### Scenario: Color-blind-safe phenotype distinction

- **WHEN** two organisms have different phenotypes
- **THEN** the distinction SHALL be perceivable through both color difference (green vs. yellow) and shape difference (circle vs. square)

#### Scenario: Text contrast ratio

- **WHEN** text is rendered over Biology accent color (#8ac926) background
- **THEN** the text color SHALL provide at least 4.5:1 contrast ratio

### Requirement: Performance Optimization

The system SHALL complete generation step computation in less than 50ms for population size 100. Canvas rendering after a step SHALL complete in less than 16ms (60 FPS budget) for populations up to 500 organisms. The system SHALL implement lazy calculation of Hardy-Weinberg statistics (only when telemetry is visible). Memory usage SHALL remain stable across 100+ generations (no memory leaks from step history). The system SHALL cap step history at 50 entries to prevent unbounded memory growth.

#### Scenario: Generation step performance

- **WHEN** a generation step occurs for a population of 100 organisms
- **THEN** the step function SHALL complete in less than 50ms

#### Scenario: Rendering performance budget

- **WHEN** Canvas is re-rendered after a generation step with 500 organisms
- **THEN** rendering SHALL complete in less than 16ms

#### Scenario: Lazy telemetry calculation

- **WHEN** telemetry display is hidden
- **THEN** Hardy-Weinberg chi-square calculation SHALL be skipped to save computation

#### Scenario: Memory stability over many generations

- **WHEN** 100 generation steps occur
- **THEN** memory usage SHALL not increase by more than 10% from baseline

#### Scenario: Step history cap

- **WHEN** more than 50 generation steps occur
- **THEN** step history SHALL contain only the most recent 50 states

### Requirement: Integration with Episode Factory

The system SHALL register Gene Lab episode in the episode factory/registry so it appears in the episode selection menu. The episode SHALL have metadata: id="gene-lab", name="Gene Lab", domain="biology", accentColor="#8ac926", mode="discrete", and description="Breed generations. Watch traits emerge. Discover inheritance." The episode SHALL be loadable from the main menu and SHALL initialize with DiscreteEngine configuration.

#### Scenario: Episode appears in selection menu

- **WHEN** the user opens the episode selection menu
- **THEN** "Gene Lab" SHALL appear in the list with Biology accent color and description

#### Scenario: Episode loads correctly

- **WHEN** the user selects "Gene Lab" from the menu
- **THEN** the episode SHALL load, display the initial population, and render the Canvas

#### Scenario: Episode metadata

- **WHEN** the episode factory retrieves Gene Lab metadata
- **THEN** the metadata SHALL include id="gene-lab", domain="biology", accentColor="#8ac926", and mode="discrete"

### Requirement: Analytics Integration

The system SHALL track analytics events using Plausible (privacy-respecting analytics). Events SHALL include: episode loaded (event: "gene-lab-loaded"), mission started (event: "mission-started", property: missionName), mission completed (event: "mission-completed", property: missionName and completionTime), generation advanced (event: "generation-advanced", property: generationCount), and parameter adjusted (event: "parameter-adjusted", property: parameterName and value). All analytics SHALL be aggregate-only with no personal data collection.

#### Scenario: Episode load tracking

- **WHEN** Gene Lab episode loads
- **THEN** the system SHALL send analytics event "gene-lab-loaded" to Plausible

#### Scenario: Mission completion tracking

- **WHEN** the user completes "Mendel's Peas" mission
- **THEN** the system SHALL send analytics event "mission-completed" with properties missionName="mendels-peas" and completionTime (in seconds)

#### Scenario: Parameter adjustment tracking

- **WHEN** the user adjusts mutation rate parameter to 0.05
- **THEN** the system SHALL send analytics event "parameter-adjusted" with properties parameterName="mutationRate" and value=0.05

#### Scenario: No personal data collection

- **WHEN** analytics events are sent
- **THEN** no user identifiers, IP addresses, or personal data SHALL be included in the event data
