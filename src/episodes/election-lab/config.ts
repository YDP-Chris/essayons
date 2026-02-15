/**
 * Election Lab — Episode configuration.
 */

import type { EpisodeConfig } from '../types.ts'

export const electionLabConfig: EpisodeConfig = {
  id: 'election-lab',
  title: 'Election Lab',
  subtitle: 'Manipulate voting systems. Discover democratic paradoxes.',
  domain: 'civics',
  simulationMode: 'step-based',
  description:
    'Explore how different voting systems can produce completely different winners from identical voter preferences. ' +
    'Experiment with plurality, ranked choice, approval voting, and proportional representation. ' +
    'Discover why no voting system is perfect through hands-on manipulation of ballots and districts.',
  parameters: [
    {
      id: 'num-voters',
      label: 'Number of Voters',
      type: 'number',
      default: 100,
      min: 50,
      max: 500,
      step: 25,
      description: 'Total number of voters participating in the election',
    },
    {
      id: 'num-candidates',
      label: 'Number of Candidates',
      type: 'number',
      default: 3,
      min: 2,
      max: 6,
      step: 1,
      description: 'Number of candidates running for office',
    },
    {
      id: 'voting-system',
      label: 'Voting System',
      type: 'enum',
      default: 'plurality',
      options: ['plurality', 'ranked-choice', 'approval', 'proportional'],
      description: 'The voting method used to determine winners',
    },
    {
      id: 'num-districts',
      label: 'Number of Districts',
      type: 'number',
      default: 5,
      min: 1,
      max: 10,
      step: 1,
      description: 'Number of electoral districts (for proportional representation)',
    },
    {
      id: 'preference-polarization',
      label: 'Preference Polarization',
      type: 'number',
      default: 0.3,
      min: 0.0,
      max: 1.0,
      step: 0.1,
      description: 'How clustered voter preferences are (0=uniform, 1=highly polarized)',
    },
    {
      id: 'enable-gerrymandering',
      label: 'Enable Gerrymandering',
      type: 'boolean',
      default: false,
      description: 'Allow manual manipulation of district boundaries',
    },
  ],
  equations: [
    {
      id: 'plurality-vote',
      label: 'Plurality Voting',
      latex: 'W = \\arg\\max_c \\sum_i I(v_i = c)',
      description: 'Winner is the candidate with the most first-choice votes',
      variables: {
        W: 'Winning candidate',
        c: 'Candidate',
        vi: "Voter i's choice",
        I: 'Indicator function',
      },
    },
    {
      id: 'instant-runoff',
      label: 'Ranked Choice Voting (Instant Runoff)',
      latex: 'W = \\text{eliminate}(\\arg\\min_c \\text{votes}_c) \\text{ until } \\text{majority}',
      description: 'Eliminate lowest vote-getter and redistribute until someone has majority',
      variables: {
        W: 'Winner after eliminations',
        c: 'Candidate',
        votes: 'Current vote total',
      },
    },
    {
      id: 'approval-vote',
      label: 'Approval Voting',
      latex: 'W = \\arg\\max_c \\sum_i A_{i,c}',
      description: 'Winner is the candidate approved by the most voters',
      variables: {
        W: 'Winning candidate',
        c: 'Candidate',
        A: 'Approval matrix (1=approved, 0=not approved)',
        i: 'Voter index',
      },
    },
    {
      id: 'proportional-representation',
      label: "Proportional Representation (D'Hondt)",
      latex: 'S_c = \\lfloor \\frac{V_c \\cdot T}{\\sum_j V_j} \\rfloor',
      description: 'Seats allocated proportionally to vote share using highest averages',
      variables: {
        Sc: 'Seats for candidate c',
        Vc: 'Votes for candidate c',
        T: 'Total seats available',
        j: 'All candidates',
      },
    },
  ],
  missions: [
    {
      id: 'spoiler-effect',
      title: 'The Spoiler Effect',
      briefing:
        'Add a third candidate similar to the current winner. Watch how vote splitting ' +
        'allows a less popular candidate to win under plurality voting.',
      objectives: [
        {
          id: 'demonstrate-spoiler',
          description: 'Show how a third candidate changes the election outcome',
          check: 'checkSpoilerEffect',
        },
      ],
      hints: [
        'Start with 2 candidates and plurality voting.',
        'Add a third candidate with similar positions to the winner.',
        'Watch how the original winner loses votes to the similar candidate.',
      ],
      successMessage:
        'Vote splitting demonstrated! This is why many democracies use ranked choice voting.',
    },
    {
      id: 'condorcet-paradox',
      title: 'Condorcet Paradox',
      briefing:
        'Create a scenario where no candidate can beat all others in head-to-head matchups. ' +
        'Discover how majority rule can break down with 3+ candidates.',
      objectives: [
        {
          id: 'create-paradox',
          description: 'Generate voter preferences with no Condorcet winner',
          check: 'checkCondorcetParadox',
        },
      ],
      hints: [
        'You need exactly 3 candidates for the simplest paradox.',
        'Try making voter preferences form a cycle: A beats B, B beats C, C beats A.',
        'Adjust preference polarization to create the right distribution.',
      ],
      successMessage:
        'Paradox achieved! No candidate can claim a majority mandate over all others.',
    },
    {
      id: 'gerrymandering',
      title: 'Gerrymandering',
      briefing:
        'Enable gerrymandering and redraw district boundaries to flip the election outcome. ' +
        'See how the same voters can produce different results through strategic districts.',
      objectives: [
        {
          id: 'flip-election',
          description: 'Change the winner by manipulating district boundaries',
          check: 'checkGerrymandering',
        },
      ],
      hints: [
        'Enable gerrymandering and use proportional representation with 5+ districts.',
        'Try to "pack" opposing voters into fewer districts.',
        '"Crack" supportive voters across multiple districts to maximize seats.',
      ],
      successMessage: 'Democracy hacked! Same voters, different districts, different outcome.',
    },
    {
      id: 'arrows-impossibility',
      title: "Arrow's Impossibility",
      briefing:
        'Try all voting systems with the same voter preferences. Discover why no voting ' +
        'system can satisfy all democratic ideals simultaneously.',
      objectives: [
        {
          id: 'different-winners',
          description: 'Produce different winners using different voting systems',
          check: 'checkArrowsImpossibility',
        },
      ],
      hints: [
        'Use the same voter preferences but switch between voting systems.',
        'Try plurality, ranked choice, approval, and proportional representation.',
        'Look for scenarios where each system picks a different winner.',
      ],
      successMessage:
        "Arrow's theorem proven! No perfect voting system exists - every democracy must make trade-offs.",
    },
  ],
  referenceContent: [
    {
      id: 'plurality-voting',
      title: 'Plurality Voting (First Past the Post)',
      content:
        'The most common voting system worldwide. Each voter picks one candidate, and whoever gets ' +
        'the most votes wins. **Advantages**: Simple, fast, produces clear winners. **Disadvantages**: ' +
        'Can elect candidates with less than 50% support, vulnerable to vote splitting, encourages ' +
        'strategic voting rather than honest preferences.',
      category: 'concept',
    },
    {
      id: 'ranked-choice-voting',
      title: 'Ranked Choice Voting (Instant Runoff)',
      content:
        'Voters rank candidates in order of preference. If no one gets a majority, the last-place ' +
        "candidate is eliminated and their votes redistributed to voters' next choices. Repeat until " +
        'someone has a majority. **Advantages**: Eliminates spoiler effect, encourages positive campaigning. ' +
        '**Disadvantages**: Complex to count, can still produce strategic voting incentives.',
      category: 'concept',
    },
    {
      id: 'approval-voting',
      title: 'Approval Voting',
      content:
        'Voters can approve or disapprove of each candidate independently. The candidate with the most ' +
        'approvals wins. **Advantages**: Simple ballot, eliminates spoiler effect, encourages centrist ' +
        'candidates. **Disadvantages**: Voters must decide approval threshold, can still produce ' +
        'strategic behavior around that threshold.',
      category: 'concept',
    },
    {
      id: 'proportional-representation',
      title: 'Proportional Representation',
      content:
        'Seats in a legislature are allocated proportionally to vote share. Many variants exist, but ' +
        'the goal is ensuring minority voices are represented. **Advantages**: More representative of ' +
        'voter preferences, encourages coalition building. **Disadvantages**: Can produce fragmented ' +
        'governments, complex ballot counting, requires multi-member districts.',
      category: 'concept',
    },
    {
      id: 'spoiler-effect-explanation',
      title: 'The Spoiler Effect',
      content:
        'When a candidate with little chance of winning affects the outcome by drawing votes away from ' +
        'a similar candidate. Famous examples: Ralph Nader in 2000 (potentially costing Al Gore the ' +
        'presidency), Ross Perot in 1992 (affecting Bush vs. Clinton). The spoiler effect is why many ' +
        'democracies have moved to ranked choice or two-round systems.',
      category: 'concept',
    },
    {
      id: 'condorcet-paradox-explanation',
      title: 'Condorcet Paradox',
      content:
        'A situation where collective preferences are intransitive, even though individual preferences ' +
        'are rational. Example: 1/3 prefer A>B>C, 1/3 prefer B>C>A, 1/3 prefer C>A>B. Result: A beats B, ' +
        'B beats C, C beats A in pairwise comparisons. No candidate can claim majority support against ' +
        'all others. Named after Marquis de Condorcet (1785).',
      category: 'concept',
    },
    {
      id: 'gerrymandering-explanation',
      title: 'Gerrymandering',
      content:
        'The practice of manipulating electoral district boundaries to favor one party. Two main strategies: ' +
        '**Packing** - concentrating opposing voters into few districts they win by large margins. ' +
        '**Cracking** - spreading opposing voters across many districts so they never form a majority. ' +
        'Named after Governor Elbridge Gerry of Massachusetts (1812) whose district looked like a salamander.',
      category: 'concept',
    },
    {
      id: 'arrows-theorem',
      title: "Arrow's Impossibility Theorem",
      content:
        'Kenneth Arrow proved (1951) that no voting system can satisfy all reasonable democratic criteria ' +
        'simultaneously with 3+ candidates. The criteria: **Unanimity** (if everyone prefers A to B, A should win), ' +
        '**Non-dictatorship** (no single voter determines outcome), **Independence** (irrelevant alternatives ' +
        "don't matter), **Transitivity** (if A beats B and B beats C, A beats C). Every democracy must sacrifice one.",
      category: 'concept',
    },
    {
      id: 'duvergers-law',
      title: "Duverger's Law",
      content:
        'Political scientist Maurice Duverger observed that plurality voting systems tend to produce two-party systems. ' +
        'Voters abandon third parties to avoid "wasting" their vote, and parties merge to avoid splitting votes. ' +
        'This is why the US has Democrats and Republicans, while proportional systems (like Germany) have many parties.',
      category: 'fun-fact',
    },
  ],
  initialState: {},
  renderLayers: [],
}
