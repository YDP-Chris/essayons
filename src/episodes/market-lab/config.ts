/**
 * Market Lab — Episode configuration.
 */

import type { EpisodeConfig } from '../types.ts'

export const marketLabConfig: EpisodeConfig = {
  id: 'market-lab',
  title: 'Market Lab',
  subtitle: 'Watch supply meet demand. Crash markets.',
  domain: 'economics',
  simulationMode: 'step-based',
  description:
    'Explore how markets coordinate resources through price discovery. ' +
    'Watch buyers and sellers interact, see how price controls distort outcomes, ' +
    'and discover why economists trust the invisible hand.',
  parameters: [
    {
      id: 'num-buyers',
      label: 'Number of Buyers',
      type: 'number',
      default: 50,
      min: 10,
      max: 100,
      step: 5,
      description: 'How many buyers participate in the market',
    },
    {
      id: 'num-sellers',
      label: 'Number of Sellers',
      type: 'number',
      default: 50,
      min: 10,
      max: 100,
      step: 5,
      description: 'How many sellers participate in the market',
    },
    {
      id: 'price-floor',
      label: 'Price Floor',
      type: 'number',
      default: 0,
      min: 0,
      max: 50,
      step: 5,
      unit: '$',
      description: 'Minimum legal price (0 = no floor)',
    },
    {
      id: 'price-ceiling',
      label: 'Price Ceiling',
      type: 'number',
      default: 200,
      min: 50,
      max: 200,
      step: 10,
      unit: '$',
      description: 'Maximum legal price (200 = no ceiling)',
    },
    {
      id: 'tax-per-unit',
      label: 'Tax per Unit',
      type: 'number',
      default: 0,
      min: 0,
      max: 20,
      step: 1,
      unit: '$',
      description: 'Tax charged per unit sold (shifts supply up)',
    },
    {
      id: 'subsidy-per-unit',
      label: 'Subsidy per Unit',
      type: 'number',
      default: 0,
      min: 0,
      max: 20,
      step: 1,
      unit: '$',
      description: 'Subsidy paid per unit sold (shifts supply down)',
    },
  ],
  equations: [
    {
      id: 'supply-demand',
      label: 'Supply and Demand',
      latex: 'Q_d = Q_s',
      description: 'Market equilibrium occurs where quantity demanded equals quantity supplied',
      variables: {
        Qd: 'Quantity demanded',
        Qs: 'Quantity supplied',
      },
    },
    {
      id: 'consumer-surplus',
      label: 'Consumer Surplus',
      latex: 'CS = \\sum_{i=1}^{Q} (WTP_i - P)',
      description: 'Total benefit consumers receive above what they pay',
      variables: {
        CS: 'Consumer surplus',
        WTP: 'Willingness to pay',
        P: 'Market price',
        Q: 'Quantity traded',
      },
    },
    {
      id: 'producer-surplus',
      label: 'Producer Surplus',
      latex: 'PS = \\sum_{i=1}^{Q} (P - C_i)',
      description: 'Total profit producers earn above their costs',
      variables: {
        PS: 'Producer surplus',
        P: 'Market price',
        C: 'Cost of production',
        Q: 'Quantity traded',
      },
    },
    {
      id: 'deadweight-loss',
      label: 'Deadweight Loss',
      latex: 'DWL = (CS + PS)_{eq} - (CS + PS)_{actual}',
      description: 'Economic efficiency lost due to market interventions',
      variables: {
        DWL: 'Deadweight loss',
        CS: 'Consumer surplus',
        PS: 'Producer surplus',
        eq: 'At equilibrium',
        actual: 'Under intervention',
      },
    },
  ],
  missions: [
    {
      id: 'find-equilibrium',
      title: 'Find Equilibrium',
      briefing:
        'Remove all interventions and watch the market self-organize. ' +
        'Let supply and demand find their natural balance.',
      objectives: [
        {
          id: 'reach-equilibrium',
          description: 'Let the market reach stable equilibrium price',
          check: 'checkEquilibrium',
        },
      ],
      hints: [
        'Set all interventions (floor, ceiling, tax, subsidy) to their neutral values.',
        'Run the simulation for at least 5 days to see stability.',
        'The price should stabilize near the equilibrium point.',
      ],
      successMessage:
        'The invisible hand works! Without intervention, the market found its own balance.',
    },
    {
      id: 'price-floor-disaster',
      title: 'Price Floor Disaster',
      briefing:
        'Set a price floor above equilibrium and watch the market struggle. ' +
        'See how minimum prices create surpluses and inefficiency.',
      objectives: [
        {
          id: 'create-surplus',
          description: 'Create excess supply with a binding price floor',
          check: 'checkPriceFloorEffect',
        },
      ],
      hints: [
        'A price floor only matters if it is ABOVE the equilibrium price.',
        'Try setting the floor to $120 or higher.',
        'Watch the gap between quantity supplied and quantity demanded.',
      ],
      successMessage:
        "You've created a surplus! When price can't fall to equilibrium, sellers can't find buyers.",
    },
    {
      id: 'invisible-hand',
      title: 'The Invisible Hand',
      briefing:
        'Start with heavy interventions, then remove them all at once. ' +
        'Watch the market heal itself through price discovery.',
      objectives: [
        {
          id: 'self-organize',
          description: 'Market returns to equilibrium after removing interventions',
          check: 'checkSelfOrganization',
        },
      ],
      hints: [
        'Set a price floor of $120 and tax of $10, run for 5 days.',
        'Then reset floor to $0 and tax to $0.',
        'Watch the price converge back to equilibrium over the next 5-10 days.',
      ],
      successMessage:
        'Adam Smith was right! The market found its way back to efficiency on its own.',
    },
    {
      id: 'market-crash',
      title: 'Market Crash',
      briefing:
        'Create conditions for maximum inefficiency. Can you maximize deadweight loss ' +
        'and prove why economists hate price controls?',
      objectives: [
        {
          id: 'maximize-dwl',
          description: 'Generate significant deadweight loss (> $50)',
          check: 'checkDeadweightLoss',
        },
      ],
      hints: [
        'Combine multiple interventions: price controls AND taxes.',
        'A tight price ceiling or high floor creates the most distortion.',
        'Deadweight loss represents economic value destroyed by intervention.',
      ],
      successMessage:
        'You destroyed value that could have been created! This is why economists prefer free markets.',
    },
  ],
  referenceContent: [
    {
      id: 'supply-demand',
      title: 'Supply and Demand',
      content:
        'The fundamental model of microeconomics. The **demand curve** shows how many units ' +
        'buyers want at each price (downward sloping). The **supply curve** shows how many ' +
        'units sellers will produce at each price (upward sloping). Where they intersect, ' +
        'the market clears — every buyer who values the good above the price can buy it, ' +
        'and every seller whose cost is below the price can sell it.',
      category: 'concept',
    },
    {
      id: 'equilibrium',
      title: 'Market Equilibrium',
      content:
        'Equilibrium is the price where quantity demanded equals quantity supplied. At this price, ' +
        "there are no shortages or surpluses — the market 'clears.' If price is too high, " +
        'sellers have excess supply (surplus). If price is too low, buyers want more than is ' +
        'available (shortage). Market forces push price toward equilibrium.',
      category: 'concept',
    },
    {
      id: 'price-controls',
      title: 'Price Controls',
      content:
        'Governments sometimes impose price floors (minimum prices) or price ceilings (maximum prices). ' +
        '**Price floors** (like minimum wage) create surpluses when set above equilibrium. ' +
        '**Price ceilings** (like rent control) create shortages when set below equilibrium. ' +
        'Both reduce total surplus and create deadweight loss — economic value that is destroyed.',
      category: 'concept',
    },
    {
      id: 'invisible-hand',
      title: 'The Invisible Hand',
      content:
        'Adam Smith\'s famous metaphor: individuals pursuing their own self-interest are "led by ' +
        'an invisible hand" to promote the social good. In markets, buyers seeking low prices ' +
        'and sellers seeking high profits create an efficient allocation of resources through ' +
        'price discovery — no central planner needed.',
      category: 'concept',
    },
    {
      id: 'consumer-surplus-explained',
      title: 'Consumer Surplus',
      content:
        'The difference between what consumers are willing to pay and what they actually pay. ' +
        'If you would pay $150 for something but buy it for $100, you gained $50 in surplus. ' +
        'Total consumer surplus is the area between the demand curve and the market price — ' +
        'it represents the total benefit consumers receive from participating in the market.',
      category: 'concept',
    },
    {
      id: 'producer-surplus-explained',
      title: 'Producer Surplus',
      content:
        'The difference between the price producers receive and their cost of production. ' +
        'If it costs you $80 to make something and you sell it for $100, you gained $20 in surplus. ' +
        'Total producer surplus is the area between the market price and the supply curve — ' +
        'it represents the total profit producers earn from participating in the market.',
      category: 'concept',
    },
    {
      id: 'deadweight-loss-explained',
      title: 'Deadweight Loss',
      content:
        'The loss in total economic surplus that occurs when a market is not at equilibrium. ' +
        "It represents trades that WOULD have happened at equilibrium but DON'T happen because " +
        'of intervention. This is "lost wealth" — value that could have been created but wasn\'t. ' +
        'Price controls, taxes, and monopolies all create deadweight loss.',
      category: 'concept',
    },
    {
      id: 'rent-control-fact',
      title: 'Rent Control Creates Shortages',
      content:
        'When cities impose rent control (a price ceiling on apartments), the result is predictable: ' +
        'more people want apartments than are available. Landlords have less incentive to build or ' +
        'maintain housing. Black markets emerge. The people who get apartments win, but many who ' +
        'would have found housing at market price are left out. Economists across the political ' +
        'spectrum agree: rent control reduces the quantity and quality of housing.',
      category: 'fun-fact',
    },
  ],
  initialState: {},
  renderLayers: [],
}
