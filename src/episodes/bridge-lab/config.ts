import type { EpisodeConfig } from '../types.ts'

export const bridgeLabConfig: EpisodeConfig = {
  id: 'bridge-lab',
  title: 'Bridge Lab',
  subtitle: 'Build structures. Apply loads. Watch them fail.',
  domain: 'engineering',
  simulationMode: 'continuous',
  description:
    'Explore structural engineering by analyzing a truss bridge under load. ' +
    'Adjust materials, loads, and gravity to understand how bridges distribute stress.',
  parameters: [
    {
      id: 'material',
      label: 'Material',
      type: 'enum',
      default: 'steel',
      options: ['wood', 'steel', 'concrete'],
      description: 'Beam material affects strength and weight',
    },
    {
      id: 'load-weight',
      label: 'Load Weight',
      type: 'number',
      default: 1000,
      min: 100,
      max: 10000,
      step: 100,
      unit: 'kg',
      description: 'Applied load at center of bridge',
    },
    {
      id: 'gravity',
      label: 'Gravity',
      type: 'number',
      default: 9.81,
      min: 1,
      max: 20,
      step: 0.1,
      unit: 'm/s²',
      description: 'Gravitational acceleration',
    },
    {
      id: 'show-forces',
      label: 'Show Forces',
      type: 'boolean',
      default: false,
      description: 'Display force vectors on nodes',
    },
    {
      id: 'show-stress',
      label: 'Show Stress',
      type: 'boolean',
      default: true,
      description: 'Color beams by stress level',
    },
  ],
  equations: [
    {
      id: 'stress',
      label: 'Stress',
      latex: '\\sigma = \\frac{F}{A}',
      description: 'Stress is force divided by cross-sectional area',
      variables: {
        σ: 'Stress (Pa)',
        F: 'Force (N)',
        A: 'Area (m²)',
      },
    },
    {
      id: 'strain',
      label: 'Strain',
      latex: '\\varepsilon = \\frac{\\Delta L}{L_0}',
      description: 'Strain is the relative change in length',
      variables: {
        ε: 'Strain (dimensionless)',
        ΔL: 'Change in length (m)',
        L0: 'Original length (m)',
      },
    },
    {
      id: 'hookes-law',
      label: "Hooke's Law",
      latex: 'F = k \\cdot \\Delta x',
      description: 'Force is proportional to displacement (for small deformations)',
      variables: {
        F: 'Force (N)',
        k: 'Spring constant (N/m)',
        Δx: 'Displacement (m)',
      },
    },
  ],
  missions: [
    {
      id: 'first-crossing',
      title: 'First Crossing',
      briefing:
        'Test your bridge under a 1000kg load. Can the default steel structure survive? ' +
        'Watch the stress visualization to see which beams are under the most strain.',
      objectives: [
        {
          id: 'survive-load',
          description: 'Bridge survives 1000kg load for 5 seconds with no broken beams',
          check: 'checkNoBrokenBeams',
        },
      ],
      hints: [
        'Watch the stress colors: green is safe, yellow is warning, red is danger.',
        'The bridge should hold the default load easily with steel.',
        'Let the simulation run for at least 5 seconds.',
      ],
      successMessage: 'Success! Your bridge held the load. Steel is strong! Now try heavier loads.',
    },
    {
      id: 'efficiency-challenge',
      title: 'Efficiency Challenge',
      briefing:
        'Engineers optimize for weight. Can you find a material that survives 1500kg ' +
        'while keeping the total structure weight under 5000kg?',
      objectives: [
        {
          id: 'weight-target',
          description: 'Bridge weighs under 5000kg and survives 1500kg load',
          check: 'checkWeightUnder',
          target: 5000,
        },
      ],
      hints: [
        'Different materials have different densities and strengths.',
        'Wood is lighter but weaker. Concrete is heavy but brittle.',
        'Try adjusting the load-weight parameter to test different scenarios.',
      ],
      initialParams: {
        'load-weight': 1500,
      },
      successMessage: 'Excellent! You found the optimal material for the job!',
    },
    {
      id: 'the-arch',
      title: 'The Arch',
      briefing:
        'Discover why arches are so strong. Observe how stress distributes through ' +
        'the truss structure. Can you keep the safety factor above 2.0 under 2000kg?',
      objectives: [
        {
          id: 'safety-factor',
          description: 'Maintain safety factor ≥ 2.0 under 2000kg load for 5 seconds',
          check: 'checkSafetyFactor',
          target: 2,
        },
      ],
      hints: [
        'Safety factor = yield strength / max stress. Higher is safer.',
        'Watch which beams turn yellow or red — those are critical.',
        'Steel has the highest yield strength.',
      ],
      initialParams: {
        'load-weight': 2000,
      },
      successMessage:
        'Perfect! You understand how stress distributes through a truss. ' +
        'Notice how diagonal members carry load efficiently!',
    },
    {
      id: 'earthquake',
      title: 'Earthquake',
      briefing:
        'Simulate seismic activity by increasing gravity to 15 m/s². ' +
        'Can your bridge survive the increased forces for 10 seconds?',
      objectives: [
        {
          id: 'survive-quake',
          description: 'Bridge survives 10 seconds under high gravity (15 m/s²)',
          check: 'checkSurviveEarthquake',
        },
      ],
      hints: [
        'Higher gravity means more force on every beam and node.',
        'You might need a stronger material.',
        'Watch the deflection — excessive bending is a warning sign.',
      ],
      initialParams: {
        gravity: 15,
        'load-weight': 1000,
      },
      successMessage:
        'Incredible! Your bridge withstood the earthquake! ' +
        'Real earthquake engineering is even more complex!',
    },
  ],
  referenceContent: [
    {
      id: 'what-is-stress',
      title: 'What is Stress?',
      content:
        'Stress is the internal force per unit area within a material. When you pull ' +
        'on a beam, the molecules inside resist being pulled apart — that resistance is stress. ' +
        'Engineers measure stress in Pascals (Pa) or Megapascals (MPa). **Too much stress, ' +
        'and the material breaks.**',
      category: 'concept',
    },
    {
      id: 'tension-compression',
      title: 'Tension vs Compression',
      content:
        '**Tension** is when a beam is being pulled apart (stretched). ' +
        '**Compression** is when a beam is being squeezed together. ' +
        'Different materials handle these forces differently. Steel is strong in both tension ' +
        'and compression. Concrete is strong in compression but weak in tension (that is why ' +
        'we use steel rebar inside concrete!).',
      category: 'concept',
    },
    {
      id: 'truss-bridges',
      title: 'Why Trusses?',
      content:
        'A truss is a structure made of triangular units. Triangles are rigid — you ' +
        'cannot deform a triangle without changing the length of its sides. This makes trusses ' +
        'incredibly efficient at distributing load. The Warren truss (shown here) uses diagonal ' +
        'members to carry load efficiently, making it a popular design for bridges and roofs.',
      category: 'concept',
    },
    {
      id: 'safety-factor-concept',
      title: 'Safety Factor',
      content:
        'The safety factor is the ratio of a material strength to the actual stress it ' +
        'experiences. A safety factor of 2.0 means the material can handle twice the current ' +
        'stress before failing. Engineers design with safety factors of 2-10 depending on the ' +
        'application. Bridges typically use 3-5 to account for unexpected loads and material imperfections.',
      category: 'concept',
    },
    {
      id: 'golden-gate',
      title: 'The Golden Gate Bridge',
      content:
        'The Golden Gate Bridge has a main span of 1,280 meters and uses 80,000 miles ' +
        'of steel wire in its suspension cables! The cables handle enormous tension forces ' +
        '(over 100,000 tons), while the towers carry compression. Each cable is 36 inches ' +
        'in diameter and weighs 11,000 tons.',
      category: 'fun-fact',
    },
    {
      id: 'tacoma-narrows',
      title: 'The Tacoma Narrows Collapse',
      content:
        'In 1940, the Tacoma Narrows Bridge collapsed just 4 months after opening. ' +
        'Wind caused the bridge to oscillate wildly until it tore itself apart. The failure ' +
        'taught engineers about resonance, aerodynamics, and the importance of testing designs ' +
        'against dynamic loads, not just static weight.',
      category: 'history',
    },
  ],
  initialState: {},
  renderLayers: [],
}
