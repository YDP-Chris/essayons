/**
 * Episode configuration for Citizen Lab (Civics).
 *
 * Defines parameters, missions, reference content, and metadata for
 * the legislative process simulation.
 */

import type { EpisodeConfig } from '../types.ts'

export const citizenLabConfig: EpisodeConfig = {
  id: 'citizen-lab',
  title: 'Citizen Lab',
  subtitle: 'Run a democracy. See what breaks.',
  domain: 'civics',
  simulationMode: 'event-driven',
  description:
    'Navigate the legislative process from proposal to law. Experience how bills ' +
    'move through committees, floor debates, votes, and potential vetoes. Discover ' +
    'the delicate balance of party politics, public opinion, and institutional checks.',

  parameters: [
    {
      id: 'party-composition',
      label: 'Party Composition',
      type: 'number',
      default: 55,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      description: 'Percentage of seats held by the majority party',
    },
    {
      id: 'public-approval',
      label: 'Public Approval',
      type: 'number',
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      description: 'Public support for the proposed legislation',
    },
    {
      id: 'lobbying-pressure',
      label: 'Lobbying Pressure',
      type: 'number',
      default: 30,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      description: 'Intensity of special interest lobbying efforts',
    },
    {
      id: 'media-coverage',
      label: 'Media Coverage',
      type: 'number',
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      description: 'Level of media attention on the legislation',
    },
    {
      id: 'filibuster-threshold',
      label: 'Filibuster Threshold',
      type: 'number',
      default: 60,
      min: 51,
      max: 67,
      step: 1,
      unit: ' votes',
      description: 'Votes required to invoke cloture and overcome a filibuster',
    },
  ],

  equations: [
    {
      id: 'simple-majority',
      label: 'Simple Majority',
      latex: 'V_{pass} > 50\\%',
      description: 'A bill passes with more than half the votes',
      variables: {
        V_pass: 'Votes needed to pass',
      },
    },
    {
      id: 'supermajority',
      label: 'Veto Override (Supermajority)',
      latex: 'V_{override} \\geq \\frac{2}{3}',
      description: 'A veto override requires a two-thirds supermajority',
      variables: {
        V_override: 'Votes needed to override veto',
      },
    },
    {
      id: 'cloture',
      label: 'Cloture Vote',
      latex: 'V_{cloture} \\geq 60',
      description: 'Ending a filibuster typically requires 60 votes in the Senate',
      variables: {
        V_cloture: 'Votes needed for cloture',
      },
    },
  ],

  missions: [
    {
      id: 'pass-first-bill',
      title: 'Pass Your First Bill',
      briefing:
        'Welcome to the legislative process! Your goal is to successfully pass a bill ' +
        'into law. Navigate through committee approval, floor debate, and voting. ' +
        'Watch how party composition and public approval affect outcomes.',
      objectives: [
        {
          id: 'bill-passed',
          description: 'Successfully pass a bill (reach PASSED state)',
          check: 'checkBillPassed',
        },
      ],
      hints: [
        'Start by submitting your bill to committee.',
        'Higher public approval and lobbying pressure help in committee.',
        'You need a simple majority (>50%) to pass the floor vote.',
      ],
      successMessage:
        'Congratulations! Your bill is now law. You navigated the legislative process successfully!',
    },
    {
      id: 'survive-veto',
      title: 'Survive a Veto',
      briefing:
        'Sometimes the executive branch vetoes legislation. Your challenge is to ' +
        'experience a veto and then successfully override it with a supermajority vote.',
      objectives: [
        {
          id: 'veto-occurred',
          description: 'Have a bill vetoed by the executive',
          check: 'checkVetoOccurred',
        },
        {
          id: 'override-success',
          description: 'Successfully override the veto',
          check: 'checkOverrideSuccess',
        },
      ],
      hints: [
        'Lower public approval increases veto likelihood.',
        'You need 67% of votes to override a veto.',
        'Try setting party composition to 70% or higher for override success.',
      ],
      successMessage:
        'Amazing! You overcame a veto with a supermajority. This is checks and balances in action!',
      initialParams: {
        'party-composition': 70,
        'public-approval': 35,
      },
    },
    {
      id: 'gridlock',
      title: 'Gridlock',
      briefing:
        'Experience legislative gridlock. Try to get a bill rejected in committee ' +
        'or blocked by a filibuster. Sometimes understanding failure is as important ' +
        'as achieving success.',
      objectives: [
        {
          id: 'bill-rejected',
          description: 'Have a bill rejected (reach REJECTED state)',
          check: 'checkBillRejected',
        },
      ],
      hints: [
        'Lower lobbying pressure and public approval make committee rejection likely.',
        'A filibuster can block legislation during floor debate.',
      ],
      successMessage: 'You experienced gridlock! This is a common reality in divided governments.',
      initialParams: {
        'party-composition': 52,
        'public-approval': 30,
        'lobbying-pressure': 15,
      },
    },
    {
      id: 'filibuster',
      title: 'The Filibuster',
      briefing:
        'The filibuster is a procedural tactic that requires a supermajority to overcome. ' +
        'Try to get a bill blocked by a filibuster, then adjust parameters to overcome it.',
      objectives: [
        {
          id: 'filibuster-invoked',
          description: 'Have a filibuster block legislation',
          check: 'checkFilibusterInvoked',
        },
      ],
      hints: [
        'You need votes equal to or above the filibuster threshold to avoid a filibuster.',
        'Try setting party composition below the filibuster threshold.',
        'The filibuster threshold parameter controls how many votes are needed.',
      ],
      successMessage:
        'You witnessed the power of the filibuster! This procedure shapes much of modern legislation.',
      initialParams: {
        'party-composition': 55,
        'filibuster-threshold': 60,
      },
    },
  ],

  referenceContent: [
    {
      id: 'separation-of-powers',
      title: 'Separation of Powers',
      content:
        'The U.S. government divides power among three branches: Legislative (Congress), ' +
        'Executive (President), and Judicial (Supreme Court). Each branch has distinct ' +
        'powers and can check the others. Congress makes laws, the President enforces them, ' +
        'and the courts interpret them. This system prevents any single branch from becoming ' +
        'too powerful.',
      category: 'concept',
    },
    {
      id: 'how-bill-becomes-law',
      title: 'How a Bill Becomes Law',
      content:
        '1. **Proposal**: A bill is drafted and introduced.\n' +
        '2. **Committee Review**: Experts examine and amend the bill.\n' +
        '3. **Floor Debate**: The full chamber discusses the bill.\n' +
        '4. **Vote**: Members vote to pass or reject.\n' +
        '5. **Executive Action**: The President signs or vetoes.\n' +
        '6. **Override (if vetoed)**: Congress can override with 2/3 vote.\n\n' +
        'This process happens in both the House and Senate before reaching the President.',
      category: 'concept',
    },
    {
      id: 'checks-and-balances',
      title: 'Checks and Balances',
      content:
        'Each branch can limit the power of the others:\n\n' +
        '- **Congress** can override presidential vetoes, impeach officials, and approve appointments.\n' +
        '- **President** can veto legislation and appoint judges.\n' +
        '- **Courts** can declare laws unconstitutional.\n\n' +
        'This system ensures no branch becomes dominant and protects against tyranny.',
      category: 'concept',
    },
    {
      id: 'filibuster-history',
      title: 'History of the Filibuster',
      content:
        'The filibuster is a Senate procedure that allows unlimited debate, effectively blocking ' +
        'a vote unless 60 senators vote for cloture (ending debate). Originally rare, it became ' +
        'common in the 20th century. The 60-vote threshold was established in 1975 (reduced from 67). ' +
        'Today, the filibuster shapes nearly all major legislation, requiring bipartisan support ' +
        'for most bills to pass.',
      category: 'history',
    },
    {
      id: 'veto-override-rarity',
      title: 'Veto Overrides Are Rare',
      content:
        'From 1789 to 2023, presidents have vetoed over 2,500 bills. Congress has successfully ' +
        'overridden only about 110 vetoes (roughly 4%). The 2/3 supermajority requirement makes ' +
        'overrides very difficult, requiring strong bipartisan support. This gives the President ' +
        'significant power in the legislative process.',
      category: 'fun-fact',
    },
    {
      id: 'committee-power',
      title: 'The Power of Committees',
      content:
        'Congressional committees are where most legislative work happens. They have immense power ' +
        'to shape, delay, or kill bills. Committee chairs control the agenda and can prevent bills ' +
        'from ever reaching a floor vote. This "gatekeeping" function means that committee composition ' +
        'and lobbying at the committee level are crucial to legislative success.',
      category: 'concept',
    },
  ],

  initialState: {},
  renderLayers: [],
}
