import type { EpisodeConfig } from '../types.ts'

export const waveLabConfig: EpisodeConfig = {
  id: 'wave-lab',
  title: 'Wave Lab',
  subtitle: 'Pluck strings. See resonance. Feel the physics.',
  domain: 'physics',
  simulationMode: 'continuous',
  description:
    'Explore wave mechanics by manipulating string properties and driving frequency. ' +
    'Discover how length, tension, and density affect pitch, and experience the power of resonance.',
  parameters: [
    {
      id: 'string-length',
      label: 'String Length',
      type: 'number',
      default: 1.0,
      min: 0.2,
      max: 2.0,
      step: 0.05,
      unit: 'm',
      description: 'Length of the vibrating string',
    },
    {
      id: 'string-tension',
      label: 'String Tension',
      type: 'number',
      default: 100,
      min: 10,
      max: 500,
      step: 5,
      unit: 'N',
      description: 'Tension force applied to the string',
    },
    {
      id: 'linear-density',
      label: 'Linear Density',
      type: 'number',
      default: 0.005,
      min: 0.001,
      max: 0.02,
      step: 0.001,
      unit: 'kg/m',
      description: 'Mass per unit length of the string',
    },
    {
      id: 'driving-frequency',
      label: 'Driving Frequency',
      type: 'number',
      default: 70,
      min: 10,
      max: 500,
      step: 1,
      unit: 'Hz',
      description: 'Frequency of the driving oscillation',
    },
    {
      id: 'driving-amplitude',
      label: 'Driving Amplitude',
      type: 'number',
      default: 0.01,
      min: 0.001,
      max: 0.05,
      step: 0.001,
      unit: 'm',
      description: 'Amplitude of the driving force',
    },
    {
      id: 'show-nodes',
      label: 'Show Nodes',
      type: 'boolean',
      default: true,
      description: 'Highlight wave nodes (zero displacement)',
    },
    {
      id: 'show-antinodes',
      label: 'Show Antinodes',
      type: 'boolean',
      default: true,
      description: 'Highlight wave antinodes (maximum displacement)',
    },
    {
      id: 'show-harmonics',
      label: 'Show Harmonics',
      type: 'boolean',
      default: false,
      description: 'Display harmonic frequency markers',
    },
    {
      id: 'animation-speed',
      label: 'Animation Speed',
      type: 'number',
      default: 1.0,
      min: 0.1,
      max: 3.0,
      step: 0.1,
      unit: '×',
      description: 'Speed multiplier for wave animation',
    },
  ],
  equations: [
    {
      id: 'wave-speed',
      label: 'Wave Speed',
      latex: 'v = \\sqrt{\\frac{T}{\\mu}}',
      description: 'Speed of waves traveling along the string',
      variables: {
        v: 'Wave speed (m/s)',
        T: 'String tension (N)',
        μ: 'Linear density (kg/m)',
      },
    },
    {
      id: 'fundamental-frequency',
      label: 'Fundamental Frequency',
      latex: 'f_1 = \\frac{1}{2L} \\sqrt{\\frac{T}{\\mu}}',
      description: 'Lowest natural frequency of a fixed string',
      variables: {
        f1: 'Fundamental frequency (Hz)',
        L: 'String length (m)',
        T: 'String tension (N)',
        μ: 'Linear density (kg/m)',
      },
    },
    {
      id: 'harmonic-series',
      label: 'Harmonic Series',
      latex: 'f_n = n \\cdot f_1',
      description: 'Integer multiples of the fundamental frequency',
      variables: {
        fn: 'nth harmonic frequency (Hz)',
        n: 'Harmonic number (1, 2, 3, ...)',
        f1: 'Fundamental frequency (Hz)',
      },
    },
    {
      id: 'standing-wave',
      label: 'Standing Wave',
      latex: 'y(x,t) = A \\sin(kx) \\cos(\\omega t)',
      description: 'Mathematical form of a standing wave pattern',
      variables: {
        y: 'Displacement',
        A: 'Amplitude',
        k: 'Wave number (2π/λ)',
        ω: 'Angular frequency (2πf)',
        x: 'Position',
        t: 'Time',
      },
    },
  ],
  missions: [
    {
      id: 'find-fundamental',
      title: 'Find the Fundamental',
      briefing:
        'Every string has a natural frequency — its fundamental. Can you tune the driving frequency ' +
        'to make the string resonate with maximum amplitude?',
      objectives: [
        {
          id: 'achieve-resonance',
          description: 'Achieve resonance by matching driving frequency to fundamental',
          check: 'checkFundamentalResonance',
        },
        {
          id: 'sustain-resonance',
          description: 'Sustain resonance for at least 3 seconds',
          check: 'checkSustainedResonance',
        },
      ],
      hints: [
        'The fundamental frequency depends on string length, tension, and density.',
        'Try adjusting the driving frequency slowly and watch the amplitude change.',
        'At resonance, the wave amplitude will be at its maximum and the string will "light up".',
        'Use the equation: f₁ = (1/2L)√(T/μ) to calculate the exact fundamental frequency.',
      ],
      successMessage: 'Perfect resonance! The string is vibrating at its fundamental frequency! 🎸',
    },
    {
      id: 'harmonic-series',
      title: 'Harmonic Series',
      briefing:
        "Strings don't just vibrate at one frequency — they support a whole series of harmonics. " +
        'Can you find the 2nd and 3rd harmonics?',
      objectives: [
        {
          id: 'find-second-harmonic',
          description: 'Create resonance at the 2nd harmonic (2 × fundamental)',
          check: 'checkSecondHarmonic',
        },
        {
          id: 'find-third-harmonic',
          description: 'Create resonance at the 3rd harmonic (3 × fundamental)',
          check: 'checkThirdHarmonic',
        },
        {
          id: 'observe-nodes',
          description: 'Count the nodes in each harmonic pattern',
          check: 'checkNodeCounting',
        },
      ],
      hints: [
        'Harmonics are exact integer multiples of the fundamental frequency.',
        'The 2nd harmonic has 3 nodes (including the ends), the 3rd has 4 nodes.',
        'Higher harmonics create more complex standing wave patterns.',
        'Enable "Show Nodes" to see the zero-displacement points clearly.',
      ],
      successMessage:
        "Beautiful! You've discovered the harmonic series — the foundation of all musical harmony! 🎼",
    },
    {
      id: 'resonance-explorer',
      title: 'Resonance Explorer',
      briefing:
        'Now you understand resonance and harmonics. Can you predict what happens when you ' +
        "change the string's physical properties?",
      objectives: [
        {
          id: 'predict-length-change',
          description: 'Halve the string length and find the new fundamental',
          check: 'checkLengthResonance',
        },
        {
          id: 'predict-tension-change',
          description: 'Double the tension and find the new fundamental',
          check: 'checkTensionResonance',
        },
        {
          id: 'understand-relationship',
          description: 'Demonstrate understanding of the T/μ relationship',
          check: 'checkPhysicsUnderstanding',
        },
      ],
      hints: [
        'Shorter strings have higher fundamental frequencies (think guitar frets).',
        'Higher tension also increases the fundamental frequency.',
        'The relationship follows f ∝ √(T/μ) / L — wave speed divided by wavelength.',
        'Try predicting the new frequency before adjusting the driving frequency.',
      ],
      successMessage:
        'Excellent! You now understand the physics behind every stringed instrument! 🏆',
    },
  ],
  referenceContent: [
    {
      id: 'what-are-waves',
      title: 'What Are Waves?',
      content:
        'Waves are disturbances that carry energy without carrying matter. When you pluck a guitar string, ' +
        "the disturbance travels along the string at the wave speed, but the string itself doesn't move " +
        'from place to place. Standing waves form when waves traveling in opposite directions interfere, ' +
        'creating fixed patterns of nodes (no movement) and antinodes (maximum movement).',
      category: 'concept',
    },
    {
      id: 'resonance-explained',
      title: 'Resonance: When Physics Sings',
      content:
        'Resonance occurs when you drive a system at exactly its natural frequency. The energy adds up ' +
        'constructively, leading to large amplitudes with minimal driving force. This is why you can ' +
        'shatter a wine glass with the right frequency, or why soldiers break step when crossing bridges. ' +
        'In musical instruments, resonance is how we amplify and control sound.',
      category: 'concept',
    },
    {
      id: 'guitar-physics',
      title: 'The Physics of Guitar',
      content:
        'A guitar string vibrates at its fundamental frequency plus many harmonics. When you press a fret, ' +
        'you shorten the string length, raising the pitch. Thicker strings (higher linear density) have ' +
        'lower pitches. Tuning pegs adjust tension to fine-tune the pitch. The guitar body resonates ' +
        'with these vibrations, amplifying the sound and giving each guitar its unique tone.',
      category: 'fun-fact',
    },
    {
      id: 'wave-equation-derivation',
      title: 'The Wave Equation',
      content:
        "The 1D wave equation ∂²y/∂t² = (T/μ)∂²y/∂x² comes from Newton's second law applied to a " +
        'small segment of string. The wave speed v = √(T/μ) emerges naturally from this analysis. ' +
        'For fixed boundaries, only certain wavelengths "fit" on the string: λₙ = 2L/n, giving ' +
        'the harmonic series fₙ = nv/(2L).',
      category: 'equation',
    },
    {
      id: 'standing-wave-nodes',
      title: 'Nodes and Antinodes',
      content:
        "In a standing wave, nodes are points that never move — they're where the two traveling waves " +
        'always cancel out. Antinodes are points of maximum oscillation where the waves always add up. ' +
        'For a string fixed at both ends, there are always nodes at x = 0 and x = L. The nth harmonic ' +
        'has (n+1) nodes total, creating n "humps" or half-wavelengths along the string.',
      category: 'concept',
    },
  ],
  initialState: {},
  renderLayers: [],
}
