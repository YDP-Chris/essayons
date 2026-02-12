import type { EpisodeConfig } from '../types'

export const timelineLabConfig: EpisodeConfig = {
  id: 'timeline-lab',
  title: 'Timeline Lab',
  subtitle: 'Crash empires. Rewrite history.',
  domain: 'history',
  simulationMode: 'step-based',
  description:
    'Explore pivotal moments in history by adjusting key variables and observing how timelines diverge. Change one policy, watch civilizations rise and fall. Real cause-and-effect chains cascade through economics, population, territory, and cultural output.',

  parameters: [
    {
      id: 'scenario',
      label: 'Historical Scenario',
      description: 'Select the historical period to explore',
      type: 'enum',
      default: 'industrial',
      options: ['industrial', 'roman', 'space'],
    },
    {
      id: 'technologyInvestment',
      label: 'Technology Investment',
      description: 'Percentage of resources devoted to technological advancement',
      type: 'number',
      default: 20,
      unit: '%',
      min: 0,
      max: 50,
      step: 5,
    },
    {
      id: 'tradeOpenness',
      label: 'Trade & Cooperation',
      description: 'How open to trade, diplomacy, and international cooperation',
      type: 'number',
      default: 50,
      unit: '%',
      min: 0,
      max: 100,
      step: 10,
    },
    {
      id: 'militarySpending',
      label: 'Military Spending',
      description: 'Percentage of resources devoted to military expansion',
      type: 'number',
      default: 15,
      unit: '%',
      min: 0,
      max: 50,
      step: 5,
    },
    {
      id: 'culturalPriority',
      label: 'Cultural Development',
      description: 'Focus on arts, education, and cultural influence',
      type: 'number',
      default: 30,
      unit: '%',
      min: 0,
      max: 100,
      step: 10,
    },
  ],

  equations: [
    {
      id: 'populationGrowth',
      label: 'Population Growth',
      latex:
        '\\Delta P = P \\times (0.02 + 0.01 \\times \\frac{economy}{100} - 0.005 \\times \\frac{military}{100})',
      description: 'Population grows with economic prosperity but declines with military conflict',
      variables: {
        P: 'Current population',
        economy: 'Economic output index',
        military: 'Military spending percentage',
      },
    },
    {
      id: 'technologicalAdvancement',
      label: 'Technological Progress',
      latex: '\\Delta T = techInvestment \\times (0.5 + 0.3 \\times \\frac{trade}{100})',
      description: 'Technology advances through investment and international exchange',
      variables: {
        techInvestment: 'Technology investment percentage',
        trade: 'Trade openness percentage',
      },
    },
    {
      id: 'economicGrowth',
      label: 'Economic Development',
      latex: '\\Delta E = 0.8 \\times technology + 0.6 \\times trade - 0.4 \\times military',
      description: 'Economy grows with technology and trade but suffers from military spending',
      variables: {
        technology: 'Technology level',
        trade: 'Trade openness',
        military: 'Military spending',
      },
    },
    {
      id: 'divergence',
      label: 'Timeline Divergence',
      latex: 'D = \\sum \\frac{|actualMetric - userMetric|}{actualMetric} \\times 100',
      description: 'Measures how far the alternate timeline has diverged from actual history',
      variables: {
        actualMetric: 'Historical values',
        userMetric: 'Simulated values',
      },
    },
  ],

  missions: [
    {
      id: 'rewrite-industrial',
      title: 'Rewrite the Industrial Revolution',
      briefing:
        'Achieve 50% higher economic output by 1900 without triggering social revolution. Balance technological progress with social stability.',
      objectives: [
        {
          id: 'economic-growth',
          description: 'Achieve 50% higher economic output by 1900',
          check: 'checkIndustrialSuccess',
        },
      ],
      hints: [
        'High technology investment boosts economy, but watch social unrest from rapid change.',
      ],
      successMessage:
        'You rewrote history! The Industrial Revolution proceeded faster and more peacefully.',
    },
    {
      id: 'save-rome',
      title: 'Save the Roman Empire',
      briefing:
        'Extend the Roman Empire to 600 AD without losing more than 20% of starting territory. Sustainable expansion over conquest.',
      objectives: [
        {
          id: 'extend-empire',
          description: 'Extend the Roman Empire to 600 AD with minimal territory loss',
          check: 'checkRomanSurvival',
        },
      ],
      hints: ['Focus on cultural integration and infrastructure over pure military expansion.'],
      successMessage:
        'The Roman Empire lives on! Your policies ensured its survival through sustainable growth.',
    },
    {
      id: 'space-race-early',
      title: 'Win the Space Race Early',
      briefing:
        'Land on the moon by 1965 with high international cooperation. Collaboration accelerates innovation.',
      objectives: [
        {
          id: 'early-moon-landing',
          description: 'Land on the moon by 1965 with high international cooperation',
          check: 'checkSpaceSuccess',
        },
      ],
      hints: [
        'International cooperation multiplies R&D effectiveness but requires diplomatic investment.',
      ],
      successMessage: 'Humanity reaches the moon early through international collaboration!',
    },
    {
      id: 'butterfly-effect',
      title: 'The Butterfly Effect',
      briefing:
        'Create the largest timeline divergence with minimal initial changes. Small causes, large effects.',
      objectives: [
        {
          id: 'max-divergence',
          description: 'Create high timeline divergence (75%+) with balanced policies',
          check: 'checkButterflyEffect',
        },
      ],
      hints: ['Look for cascade effects - one small change that triggers many others.'],
      successMessage: 'Amazing! Small changes created massive historical ripple effects.',
    },
  ],

  referenceContent: [
    {
      id: 'cause-effect',
      title: 'Historical Cause & Effect',
      content:
        'Historical events rarely have single causes. Instead, multiple factors interact in complex ways. A technology breakthrough can boost the economy, which funds military expansion, which changes diplomatic relationships, creating cascading effects across decades.',
      category: 'concept',
    },
    {
      id: 'counterfactual',
      title: 'Counterfactual History',
      content:
        'What if Rome had never fallen? What if the Industrial Revolution started in China? Counterfactual analysis helps us understand which historical outcomes were inevitable versus contingent on specific decisions and circumstances.',
      category: 'concept',
    },
    {
      id: 'butterfly-principle',
      title: 'The Butterfly Effect in History',
      content:
        'Small changes can have large consequences in complex systems. The assassination of Archduke Franz Ferdinand was a relatively minor event that triggered World War I because of the specific network of alliances and tensions at that moment.',
      category: 'concept',
    },
    {
      id: 'historical-momentum',
      title: 'Historical Momentum',
      content:
        'Some historical trends have strong momentum and are hard to change (like population growth), while others are more sensitive to policy decisions (like technological development). Understanding this helps predict which interventions might be effective.',
      category: 'concept',
    },
  ],

  initialState: {},
  renderLayers: [],
} as const
