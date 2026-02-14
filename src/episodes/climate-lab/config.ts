/**
 * Climate Lab — Episode configuration.
 */

import type { EpisodeConfig } from '../types.ts'

export const climateLabConfig: EpisodeConfig = {
  id: 'climate-lab',
  title: 'Climate Lab',
  subtitle: 'Crash climates. Find equilibrium.',
  domain: 'physics',
  simulationMode: 'step-based',
  description:
    'Explore planetary energy balance through real climate physics. ' +
    'Adjust CO2 levels, ice coverage, solar output, and volcanic activity. ' +
    'Discover greenhouse effects, ice-albedo feedback loops, and climate tipping points.',
  parameters: [
    {
      id: 'co2-concentration',
      label: 'CO₂ Concentration',
      type: 'number',
      default: 400,
      min: 280,
      max: 800,
      step: 10,
      unit: 'ppm',
      description: 'Atmospheric CO₂ concentration (pre-industrial: 280 ppm)',
    },
    {
      id: 'albedo',
      label: 'Planetary Albedo',
      type: 'number',
      default: 0.3,
      min: 0.1,
      max: 0.8,
      step: 0.05,
      description: 'Fraction of solar energy reflected (0.1 = dark, 0.8 = bright/icy)',
    },
    {
      id: 'solar-output',
      label: 'Solar Output',
      type: 'number',
      default: 1370,
      min: 1360,
      max: 1380,
      step: 2,
      unit: 'W/m²',
      description: 'Solar irradiance reaching Earth (sun brightness)',
    },
    {
      id: 'volcanic-cooling',
      label: 'Volcanic Activity',
      type: 'number',
      default: 0,
      min: 0,
      max: 5,
      step: 1,
      description: 'Volcanic aerosols blocking sunlight (0 = none, 5 = major eruption)',
    },
  ],
  equations: [
    {
      id: 'energy-balance',
      label: 'Energy Balance',
      latex: 'E_{in} = E_{out}',
      description: 'Equilibrium occurs when energy input equals energy output',
      variables: {
        E_in: 'Solar energy absorbed',
        E_out: 'Thermal energy radiated',
      },
    },
    {
      id: 'stefan-boltzmann',
      label: 'Stefan-Boltzmann Law',
      latex: 'E_{out} = \\sigma T^4',
      description: 'Thermal radiation increases with fourth power of temperature',
      variables: {
        E_out: 'Energy radiated (W/m²)',
        σ: 'Stefan-Boltzmann constant',
        T: 'Temperature (Kelvin)',
      },
    },
    {
      id: 'co2-forcing',
      label: 'CO₂ Radiative Forcing',
      latex: '\\Delta F = 5.35 \\ln\\left(\\frac{CO_2}{CO_{2,ref}}\\right)',
      description: 'Additional energy trapped by greenhouse gases',
      variables: {
        ΔF: 'Radiative forcing (W/m²)',
        'CO₂': 'Current CO₂ concentration',
        'CO₂,ref': 'Reference CO₂ (280 ppm)',
      },
    },
    {
      id: 'ice-albedo-feedback',
      label: 'Ice-Albedo Feedback',
      latex: '\\alpha = f(T, \\alpha_{ice})',
      description: 'Ice coverage changes reflectivity, amplifying temperature changes',
      variables: {
        α: 'Effective albedo',
        T: 'Temperature',
        α_ice: 'Ice coverage fraction',
      },
    },
  ],
  missions: [
    {
      id: 'balance-the-budget',
      title: 'Balance the Budget',
      briefing:
        "Find conditions where Earth's energy input equals energy output. " +
        'Achieve stable equilibrium where the planet neither heats nor cools.',
      objectives: [
        {
          id: 'reach-energy-balance',
          description: 'Achieve energy balance within ±0.5 W/m²',
          check: 'checkEnergyBalance',
        },
      ],
      hints: [
        'Energy balance occurs when Energy In = Energy Out.',
        'Try adjusting parameters gradually to fine-tune the balance.',
        'A balanced system has near-zero net energy flow.',
      ],
      successMessage:
        'Perfect equilibrium! You found conditions where Earth neither heats nor cools.',
    },
    {
      id: 'ice-age',
      title: 'Ice Age',
      briefing:
        'Trigger an ice age by creating conditions for sustained global cooling. ' +
        'Use the ice-albedo feedback loop to amplify cooling effects.',
      objectives: [
        {
          id: 'create-ice-age',
          description: 'Cool planet by 10°C and increase ice coverage to 60%',
          check: 'checkIceAge',
        },
      ],
      hints: [
        'Reduce solar output or increase volcanic activity for initial cooling.',
        'Lower CO₂ concentration reduces greenhouse warming.',
        'Once cooling starts, ice-albedo feedback amplifies the effect.',
      ],
      successMessage:
        'Ice age achieved! The ice-albedo feedback created a self-reinforcing cooling cycle.',
    },
    {
      id: 'runaway-greenhouse',
      title: 'Runaway Greenhouse',
      briefing:
        'Create a runaway greenhouse effect like Venus. Push the system beyond ' +
        'the point where it can naturally cool itself.',
      objectives: [
        {
          id: 'create-runaway',
          description: 'Heat planet by 50°C (Venus-like conditions)',
          check: 'checkRunawayGreenhouse',
        },
      ],
      hints: [
        'Maximize CO₂ concentration for strong greenhouse effect.',
        'Reduce albedo so more solar energy is absorbed.',
        'Once ice melts completely, cooling becomes very difficult.',
      ],
      successMessage:
        "Runaway greenhouse! You've created Venus-like conditions where cooling is impossible.",
    },
    {
      id: 'stabilize-warming',
      title: 'Stabilize at 1.5°C',
      briefing:
        'The Paris Climate Agreement aims to limit warming to 1.5°C above pre-industrial. ' +
        'Can you find parameter settings that stabilize at this target?',
      objectives: [
        {
          id: 'reach-paris-target',
          description: 'Stabilize temperature at 1.5°C ± 0.2°C above baseline',
          check: 'checkStabilizeWarming',
        },
      ],
      hints: [
        'This requires precise parameter tuning - small changes matter.',
        'Start near current CO₂ levels (~400 ppm) and adjust carefully.',
        'The system must be stable for several steps to complete the mission.',
      ],
      successMessage: '1.5°C target achieved! This shows how precise climate policy must be.',
    },
  ],
  referenceContent: [
    {
      id: 'energy-balance',
      title: 'Planetary Energy Balance',
      content:
        'Earth receives energy from the Sun and radiates energy to space. In **equilibrium**, ' +
        'these two flows balance exactly. Energy input = Solar irradiance × (1 - albedo). ' +
        'Energy output follows the **Stefan-Boltzmann law**: σT⁴, where hotter planets radiate ' +
        'more energy. When the system is out of balance, temperature changes until equilibrium is restored.',
      category: 'concept',
    },
    {
      id: 'greenhouse-effect',
      title: 'The Greenhouse Effect',
      content:
        'Greenhouse gases like CO₂ absorb infrared radiation that would otherwise escape to space. ' +
        'This creates **radiative forcing** - extra energy trapped in the atmosphere. The equation ' +
        'ΔF = 5.35 × ln(CO₂/CO₂_ref) shows how CO₂ forcing increases logarithmically. ' +
        'Doubling CO₂ from 280 to 560 ppm adds ~3.7 W/m² of forcing, equivalent to about 3°C of warming.',
      category: 'concept',
    },
    {
      id: 'ice-albedo-feedback',
      title: 'Ice-Albedo Feedback',
      content:
        'Ice and snow are highly reflective (albedo ~0.7), while dark ocean absorbs most solar energy (albedo ~0.1). ' +
        'When warming melts ice, the exposed dark surface absorbs more energy, causing **additional warming**. ' +
        'This positive feedback amplifies climate changes in both directions: warming melts ice → more absorption → more warming. ' +
        'Cooling creates ice → more reflection → more cooling.',
      category: 'concept',
    },
    {
      id: 'climate-sensitivity',
      title: 'Climate Sensitivity',
      content:
        'Climate sensitivity measures how much temperature changes for each 1 W/m² of radiative forcing. ' +
        'The simplified model uses ~0.8°C per W/m², but real climate sensitivity includes complex feedbacks. ' +
        '**Positive feedbacks** (ice-albedo, water vapor) amplify warming. ' +
        '**Negative feedbacks** (clouds, weathering) provide stability. The net effect determines how sensitive climate is to changes.',
      category: 'concept',
    },
    {
      id: 'tipping-points',
      title: 'Climate Tipping Points',
      content:
        'Climate systems can have **tipping points** - thresholds beyond which changes become self-reinforcing and irreversible. ' +
        'Examples: complete Arctic ice loss, Amazon rainforest dieback, permafrost methane release. ' +
        'These represent shifts from stable equilibrium to runaway change. The ice-albedo feedback in this simulation ' +
        'demonstrates how systems can tip from cooling to warming states.',
      category: 'concept',
    },
    {
      id: 'volcanic-cooling',
      title: 'Volcanic Climate Effects',
      content:
        'Major volcanic eruptions inject sulfur compounds into the stratosphere, forming aerosols that reflect sunlight. ' +
        'This creates temporary global cooling lasting 1-3 years. Historical examples: **Mount Tambora (1815)** caused the ' +
        '"year without a summer." **Mount Pinatubo (1991)** cooled global temperatures by ~0.5°C. ' +
        'Volcanic cooling demonstrates how quickly solar input changes can affect climate.',
      category: 'concept',
    },
    {
      id: 'paris-agreement',
      title: '1.5°C Target',
      content:
        'The Paris Climate Agreement aims to limit warming to 1.5°C above pre-industrial levels (~1880). ' +
        'This target requires **immediate and unprecedented** reductions in greenhouse gas emissions. ' +
        'At current emission rates, we reach 1.5°C around 2030-2035. Beyond this threshold, impacts become ' +
        'significantly more severe: coral reef die-offs, ice sheet collapse, extreme weather amplification.',
      category: 'fun-fact',
    },
  ],
  initialState: {},
  renderLayers: [],
}
