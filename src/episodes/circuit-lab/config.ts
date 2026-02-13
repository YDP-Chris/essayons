import type { EpisodeConfig } from '../types.ts'

export const circuitLabConfig: EpisodeConfig = {
  id: 'circuit-lab',
  title: 'Circuit Lab',
  subtitle: 'Build circuits. Apply voltage. See electrons flow.',
  domain: 'engineering',
  simulationMode: 'continuous',
  description:
    'Build electrical circuits from components on a grid and watch real physics unfold. ' +
    "Apply Kirchhoff's laws to see how current flows and voltage drops across resistors, " +
    'capacitors, and other components.',
  parameters: [
    {
      id: 'grid-size',
      label: 'Grid Size',
      type: 'number',
      default: 20,
      min: 10,
      max: 40,
      step: 1,
      unit: 'cells',
      description: 'Size of the circuit construction grid',
    },
    {
      id: 'show-current',
      label: 'Show Current',
      type: 'boolean',
      default: true,
      description: 'Display current flow with animated particles',
    },
    {
      id: 'show-voltage',
      label: 'Show Voltage',
      type: 'boolean',
      default: true,
      description: 'Color-code components by voltage level',
    },
    {
      id: 'show-power',
      label: 'Show Power',
      type: 'boolean',
      default: false,
      description: 'Display power dissipation values',
    },
    {
      id: 'show-values',
      label: 'Show Values',
      type: 'boolean',
      default: true,
      description: 'Display component values (resistance, voltage, etc.)',
    },
    {
      id: 'animation-speed',
      label: 'Animation Speed',
      type: 'number',
      default: 1.0,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      unit: 'x',
      description: 'Speed of current flow animation',
    },
    {
      id: 'wire-thickness',
      label: 'Wire Thickness',
      type: 'number',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      unit: 'px',
      description: 'Visual thickness of connecting wires',
    },
  ],
  equations: [
    {
      id: 'ohms-law',
      label: "Ohm's Law",
      latex: 'V = I \\cdot R',
      description: 'Voltage equals current times resistance',
      variables: {
        V: 'Voltage (V)',
        I: 'Current (A)',
        R: 'Resistance (Ω)',
      },
    },
    {
      id: 'power-law',
      label: 'Power Law',
      latex: 'P = V \\cdot I = I^2 \\cdot R = \\frac{V^2}{R}',
      description: 'Power dissipated in a resistor',
      variables: {
        P: 'Power (W)',
        V: 'Voltage (V)',
        I: 'Current (A)',
        R: 'Resistance (Ω)',
      },
    },
    {
      id: 'kvl',
      label: "Kirchhoff's Voltage Law",
      latex: '\\sum_{loop} V = 0',
      description: 'The sum of voltage drops around any closed loop is zero',
      variables: {
        V: 'Voltage drop',
      },
    },
    {
      id: 'kcl',
      label: "Kirchhoff's Current Law",
      latex: '\\sum_{node} I = 0',
      description: 'The sum of currents at any node equals zero',
      variables: {
        I: 'Current',
      },
    },
    {
      id: 'capacitor-voltage',
      label: 'Capacitor Voltage',
      latex: 'V_C(t) = V_0 \\cdot (1 - e^{-t/RC})',
      description: 'Voltage across a charging capacitor',
      variables: {
        VC: 'Capacitor voltage (V)',
        V0: 'Source voltage (V)',
        t: 'Time (s)',
        R: 'Resistance (Ω)',
        C: 'Capacitance (F)',
      },
    },
  ],
  missions: [
    {
      id: 'light-the-bulb',
      title: 'Light the Bulb',
      briefing:
        'Connect a battery to a light bulb using wires. Make the bulb glow by completing ' +
        'the circuit. This teaches the basic concept of a closed electrical loop.',
      objectives: [
        {
          id: 'bulb-powered',
          description: 'Make the light bulb receive power',
          check: 'checkBulbPowered',
        },
        {
          id: 'circuit-complete',
          description: 'Create a complete circuit with no breaks',
          check: 'checkCircuitComplete',
        },
      ],
      hints: [
        'Drag a battery from the component palette onto the grid.',
        'Add a light bulb somewhere else on the grid.',
        'Use wires to connect the positive terminal of the battery to one side of the bulb.',
        'Connect the other side of the bulb back to the negative terminal of the battery.',
        'Current needs a complete path to flow!',
      ],
      successMessage:
        "Brilliant! Your bulb is shining bright! 💡 You've mastered the basic circuit.",
    },
    {
      id: 'voltage-divider',
      title: 'Voltage Divider',
      briefing:
        'Build a voltage divider using two resistors. This circuit splits the input voltage ' +
        'into two smaller voltages - a fundamental building block in electronics.',
      objectives: [
        {
          id: 'two-resistors',
          description: 'Use exactly two resistors in series',
          check: 'checkTwoResistorsInSeries',
        },
        {
          id: 'voltage-split',
          description: 'Achieve voltage division (middle node ≠ 0V or source V)',
          check: 'checkVoltageSplit',
        },
      ],
      hints: [
        'Place a battery and two resistors on the grid.',
        'Connect them in series: battery → resistor1 → resistor2 → battery.',
        'The voltage at the connection between the two resistors will be divided.',
        'Try different resistor values to see how the voltage changes.',
      ],
      successMessage:
        "Perfect! You've split the voltage. This is how many sensors and circuits work! ⚡",
    },
    {
      id: 'rc-time-constant',
      title: 'RC Time Constant',
      briefing:
        'Build an RC circuit with a resistor and capacitor. Watch how the capacitor charges ' +
        'exponentially over time, demonstrating the RC time constant (τ = RC).',
      objectives: [
        {
          id: 'rc-circuit',
          description: 'Create a circuit with one resistor and one capacitor',
          check: 'checkRCCircuit',
        },
        {
          id: 'capacitor-charging',
          description: 'Observe capacitor voltage rising over time',
          check: 'checkCapacitorCharging',
        },
      ],
      hints: [
        'Connect a battery, resistor, and capacitor in series.',
        'The capacitor starts at 0V and charges toward the battery voltage.',
        'The time constant τ = R × C determines charging speed.',
        'Larger R or C means slower charging.',
        'Watch the voltage across the capacitor increase exponentially!',
      ],
      successMessage:
        "Excellent! You've seen exponential charging in action! 📈 This timing principle powers countless circuits.",
    },
    {
      id: 'short-circuit',
      title: 'Short Circuit',
      briefing:
        'Sometimes circuits go wrong. Create a short circuit by connecting the battery terminals ' +
        'directly with a wire. See what happens to current and power when resistance approaches zero.',
      objectives: [
        {
          id: 'short-created',
          description: 'Create a short circuit (wire directly across battery)',
          check: 'checkShortCircuit',
        },
        {
          id: 'high-current',
          description: 'Observe very high current through the short',
          check: 'checkHighCurrent',
        },
      ],
      hints: [
        'Place a battery on the grid.',
        'Connect a wire directly from the positive terminal to the negative terminal.',
        'Notice the high current - this is dangerous in real circuits!',
        'Real batteries would heat up and potentially catch fire.',
        'This is why circuits have fuses and circuit breakers.',
      ],
      successMessage:
        'Dangerous but educational! 🔥 You understand why short circuits are hazardous.',
    },
  ],
  referenceContent: [
    {
      id: 'what-is-current',
      title: 'What is Electric Current?',
      content:
        'Electric current is the flow of electric charge through a conductor. Think of it like ' +
        'water flowing through pipes - electrons flow through wires. Current is measured in ' +
        'amperes (A). Higher voltage pushes more current through the same resistance, just like ' +
        'higher water pressure pushes more water through the same pipe.',
      category: 'concept',
    },
    {
      id: 'resistance-analogy',
      title: 'Resistance is Like Friction',
      content:
        'Electrical resistance opposes the flow of current, just like friction opposes motion. ' +
        'A narrow pipe has more resistance to water flow than a wide pipe. Similarly, a thin ' +
        'wire has more electrical resistance than a thick wire. Different materials also have ' +
        'different resistance properties.',
      category: 'concept',
    },
    {
      id: 'kirchhoff-explained',
      title: "Kirchhoff's Laws Simplified",
      content:
        '**Voltage Law (KVL):** If you walk around any closed loop in a circuit, the voltage ' +
        "rises must equal the voltage drops. It's like walking up and down hills - you end up " +
        'at the same height you started.\n\n' +
        '**Current Law (KCL):** At any junction, current flowing in equals current flowing out. ' +
        'Like water at a pipe junction - what goes in must come out.',
      category: 'concept',
    },
    {
      id: 'capacitor-behavior',
      title: 'How Capacitors Work',
      content:
        'A capacitor stores electrical energy like a small battery, but it charges and discharges ' +
        'in a specific pattern. When first connected, it acts like a short circuit (low resistance). ' +
        'As it charges up, it increasingly resists current flow. When fully charged, it acts like ' +
        'an open circuit (infinite resistance). This creates the exponential charging curve.',
      category: 'concept',
    },
    {
      id: 'real-world-circuits',
      title: 'Circuits in Everyday Life',
      content:
        "Every electronic device contains thousands of these basic circuit elements. Your phone's " +
        'processor uses voltage dividers to create different signal levels. Camera flashes use ' +
        'RC circuits for timing. LED lights use resistors to limit current. Understanding these ' +
        'fundamentals unlocks how all modern technology works.',
      category: 'fun-fact',
    },
  ],
  initialState: {},
  renderLayers: [],
}
