import type { EpisodeConfig } from '../types.ts'

export const orbitLabConfig: EpisodeConfig = {
  id: 'orbit-lab',
  title: 'Orbit Lab',
  subtitle: 'Launch satellites. Crash into things. Learn gravity.',
  domain: 'physics',
  simulationMode: 'continuous',
  description:
    'Explore orbital mechanics by launching satellites around a planet. ' +
    'Tweak speed, angle, and altitude to discover how orbits really work.',
  parameters: [
    {
      id: 'planet',
      label: 'Planet',
      type: 'enum',
      default: 'Earth',
      options: ['Moon', 'Mars', 'Earth', 'Venus', 'Jupiter', 'Saturn'],
      description: 'Which planet to orbit',
    },
    {
      id: 'launch-speed',
      label: 'Launch Speed',
      type: 'number',
      default: 7500,
      min: 500,
      max: 50000,
      step: 10,
      unit: 'm/s',
      description: 'Initial velocity of the satellite',
    },
    {
      id: 'launch-angle',
      label: 'Launch Angle',
      type: 'number',
      default: 80,
      min: 0,
      max: 90,
      step: 1,
      unit: '\u00B0',
      description: '0\u00B0 = straight up, 90\u00B0 = sideways (needed for orbit)',
    },
    {
      id: 'show-trail',
      label: 'Show Trail',
      type: 'boolean',
      default: true,
      description: 'Display orbit trajectory trail',
    },
    {
      id: 'show-vectors',
      label: 'Show Vectors',
      type: 'boolean',
      default: false,
      description: 'Display velocity and gravity force vectors',
    },
    {
      id: 'show-metrics',
      label: 'Show Metrics',
      type: 'boolean',
      default: true,
      description: 'Display expanded orbital metrics (eccentricity, apogee, perigee, energy)',
    },
    {
      id: 'show-grid',
      label: 'Altitude Grid',
      type: 'boolean',
      default: true,
      description: 'Display altitude reference rings (Surface, LEO, GEO)',
    },
    {
      id: 'follow',
      label: 'Follow Satellite',
      type: 'boolean',
      default: false,
      description: 'Camera tracks the satellite',
    },
  ],
  equations: [
    {
      id: 'gravity',
      label: 'Gravitational Force',
      latex: 'F = G \\frac{m_1 m_2}{r^2}',
      description: 'The force of gravity between two objects',
      variables: {
        F: 'Force (N)',
        G: '6.674\u00D710\u207B\u00B9\u00B9 N\u22C5m\u00B2/kg\u00B2',
        m1: 'Mass 1',
        m2: 'Mass 2',
        r: 'Distance',
      },
    },
    {
      id: 'orbital-velocity',
      label: 'Orbital Velocity',
      latex: 'v = \\sqrt{\\frac{GM}{r}}',
      description: 'Speed needed for a circular orbit at radius r',
      variables: {
        v: 'Orbital velocity (m/s)',
        G: 'Gravitational constant',
        M: 'Central body mass',
        r: 'Orbital radius',
      },
    },
    {
      id: 'escape-velocity',
      label: 'Escape Velocity',
      latex: 'v_e = \\sqrt{\\frac{2GM}{r}}',
      description: 'Minimum speed to escape gravitational pull',
      variables: {
        ve: 'Escape velocity (m/s)',
        G: 'Gravitational constant',
        M: 'Central body mass',
        r: 'Distance from center',
      },
    },
  ],
  missions: [
    {
      id: 'first-orbit',
      title: 'First Orbit',
      briefing:
        'Launch a satellite that completes one full orbit without crashing. ' +
        'Hint: you need just the right speed!',
      objectives: [
        {
          id: 'complete-orbit',
          description: 'Complete one full orbit (360\u00B0)',
          check: 'checkOrbitComplete',
        },
        {
          id: 'no-crash',
          description: 'Avoid crashing into the planet',
          check: 'checkNoCrash',
        },
      ],
      hints: [
        'Try adjusting the launch speed and angle. You need to go sideways, not just up!',
        'Set the launch angle close to 90\u00B0 (sideways) and speed around 7,800 m/s.',
        'The orbital velocity formula is v = \u221A(GM/r). Use the speed multiplier to fast-forward!',
      ],
      successMessage: 'You did it! Your satellite is in orbit! \uD83D\uDEF0\uFE0F',
    },
    {
      id: 'crash-course',
      title: 'Crash Course',
      briefing:
        'Sometimes you learn the most from failure. Launch and intentionally crash into the planet.',
      objectives: [
        {
          id: 'crash-planet',
          description: 'Crash the satellite into the planet',
          check: 'checkCrash',
        },
      ],
      hints: ['Launch with very low speed. Gravity will do the rest.'],
      successMessage: "Boom! That's what happens when gravity wins. Now you know!",
    },
    {
      id: 'escape-artist',
      title: 'Escape Artist',
      briefing: "Can you launch a satellite fast enough to escape the planet's gravity entirely?",
      objectives: [
        {
          id: 'escape-orbit',
          description: 'Reach escape velocity and leave the system',
          check: 'checkEscape',
        },
      ],
      hints: [
        'Escape velocity is \u221A2 times the orbital velocity.',
        'At 400km altitude from Earth, escape velocity is about 10,850 m/s.',
      ],
      successMessage: 'Gone! Your satellite has escaped into deep space! \uD83D\uDE80',
    },
    {
      id: 'geostationary',
      title: 'Geostationary Orbit',
      briefing:
        'Place a satellite in geostationary orbit \u2014 the special altitude where ' +
        'the satellite orbits in exactly 24 hours.',
      objectives: [
        {
          id: 'reach-geo',
          description: 'Achieve geostationary orbit (period \u2248 24 hours)',
          check: 'checkGeostationary',
        },
      ],
      hints: [
        'Geostationary orbit is at about 35,786 km altitude above Earth.',
        'You need enough speed to reach that altitude and the right angle to circularize.',
        'Try a high speed (~10,200 m/s) at an angle around 85\u00B0. Use the speed multiplier to fast-forward!',
      ],
      successMessage:
        'Perfect! Your satellite hangs motionless over one spot on the planet! \uD83D\uDCE1',
    },
  ],
  referenceContent: [
    {
      id: 'what-is-orbit',
      title: 'What is an Orbit?',
      content:
        'An orbit is a curved path of an object around a point in space. When you throw ' +
        'a ball, it follows a curved path and hits the ground. If you could throw it fast ' +
        "enough, it would curve around the entire Earth and come back to you \u2014 that's an " +
        'orbit! The key insight: **an orbiting object is constantly falling**, but moving ' +
        'sideways fast enough that it keeps missing the ground.',
      category: 'concept',
    },
    {
      id: 'newton-cannonball',
      title: "Newton's Cannonball",
      content:
        'Isaac Newton imagined a cannon on top of a very tall mountain. Fire the cannonball ' +
        'slowly, and it falls to Earth. Fire it faster, and it lands farther away. Fire it ' +
        "at just the right speed, and it falls *around* the Earth continuously \u2014 congratulations, it's " +
        "in orbit! Fire it even faster, and it escapes Earth's gravity entirely.",
      category: 'concept',
    },
    {
      id: 'gravity-equation',
      title: 'The Gravity Equation',
      content:
        'Every object with mass attracts every other object. The force gets weaker with ' +
        'distance (inverse square law). Double the distance, and gravity is 1/4 as strong. ' +
        'This is why higher orbits are slower \u2014 gravity is weaker up there.',
      category: 'equation',
    },
    {
      id: 'iss-fact',
      title: 'The ISS Orbits at 7.66 km/s',
      content:
        'The International Space Station orbits Earth at about 7,660 m/s (17,100 mph) at an ' +
        'altitude of 408 km. It completes one orbit every 90 minutes! Astronauts see 16 ' +
        'sunrises and sunsets every day.',
      category: 'fun-fact',
    },
    {
      id: 'kepler-laws',
      title: "Kepler's Laws",
      content:
        '1. **Orbits are ellipses** with the central body at one focus.\n' +
        '2. **Equal areas in equal times** \u2014 a satellite sweeps out equal areas in equal ' +
        'time intervals (faster when closer).\n' +
        '3. **Period squared \u221D radius cubed** \u2014 farther orbits take longer, following a ' +
        'precise mathematical relationship.',
      category: 'concept',
    },
  ],
  initialState: {},
  renderLayers: [],
}
