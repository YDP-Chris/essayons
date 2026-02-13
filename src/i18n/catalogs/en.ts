import type { StringCatalog } from '../types.ts'

export const en: StringCatalog = {
  nav: {
    backToLabs: 'Back to Labs',
    restartTutorial: 'Restart Tutorial',
    mainNavigation: 'Main navigation',
    skipToContent: 'Skip to content',
    episodes: 'Episodes',
    teach: 'Teacher Dashboard',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    home: 'Home',
    siteHeader: 'Site header',
  },
  hero: {
    headline: 'Learn by crashing into things.',
    subheading:
      'Interactive simulations that teach physics, civics, economics, history, and more—through hands-on exploration.',
    cta: 'Start Exploring',
  },
  episodes: {
    chooseYourLab: 'Choose your lab.',
    comingSoon: 'Coming Soon',
    orbitLab: {
      name: 'Orbit Lab',
      hook: 'Crash satellites into Earth until you understand gravity.',
    },
    citizenLab: {
      name: 'Citizen Lab',
      hook: 'Run a democracy. See what breaks.',
    },
    marketLab: {
      name: 'Market Lab',
      hook: 'Watch supply meet demand. Crash markets.',
    },
    timelineLab: {
      name: 'Timeline Lab',
      hook: 'Crash empires. Rewrite history.',
    },
    waveLab: {
      name: 'Wave Lab',
      hook: 'Pluck strings. See resonance. Feel the physics.',
    },
    geneLab: {
      name: 'Gene Lab',
      hook: 'Breed generations. Watch traits emerge.',
    },
    bridgeLab: {
      name: 'Bridge Lab',
      hook: 'Build structures. Apply loads. Watch them fail.',
    },
    circuitLab: {
      name: 'Circuit Lab',
      hook: 'Build circuits. Apply voltage. See electrons flow.',
    },
  },
  domains: {
    physics: 'Physics',
    civics: 'Civics',
    economics: 'Economics',
    history: 'History',
    biology: 'Biology',
    engineering: 'Engineering',
  },
  valueProps: {
    whyEssayons: 'Why Essayons?',
    realComputation: {
      title: 'Real Computation',
      description:
        'Every simulation runs real models. Gravity, elections, markets—computed live, not canned animations.',
    },
    zeroFriction: {
      title: 'Zero Friction',
      description:
        'No accounts, no installs, no waiting. Click a link and start learning in seconds.',
    },
    anyDomain: {
      title: 'Any Domain',
      description:
        'Physics today, civics tomorrow. One platform, many disciplines—all through hands-on exploration.',
    },
  },
  teacher: {
    forEducators: 'For educators',
    description:
      'Share a link, and your students are learning. No setup, no accounts, no IT requests. Essayons is free and instant.',
    instantDeployment: 'Instant deployment — just share a URL',
    freeForAll: 'Free for students and teachers',
    noAccounts: 'No accounts or personal data required',
    teacherTools: 'Teacher Tools',
  },
  footer: {
    tagline: 'Let us try.',
    copyright: '© {year} Essayons. All rights reserved.',
  },
  simulation: {
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    playSimulation: 'Play simulation',
    pauseSimulation: 'Pause simulation',
    resetSimulation: 'Reset simulation',
    relaunch: 'Relaunch',
    relaunchSimulation: 'Relaunch simulation with current parameters',
    relaunchTooltip: 'Restart physics with your current settings — keeps the same mission',
    speed: 'Simulation speed',
    episodeNotFound: 'Episode not found: {id}',
    missionCompleted: 'Mission completed successfully.',
    missionFailed: 'Mission failed.',
    running: 'Simulation running.',
    paused: 'Simulation paused.',
    ready: 'Simulation ready.',
  },
  panels: {
    parameters: 'Parameters',
    reference: 'Reference',
    mission: 'Mission',
    objectives: 'Objectives',
    hints: 'Hints',
    showHint: 'Show hint ({current}/{total})',
    missionFailedRetry: 'Mission failed. Adjust your parameters and try again.',
    noReferenceContent: 'No reference content available.',
    referenceCategories: 'Reference categories',
  },
  referenceCategories: {
    concept: 'Concepts',
    equation: 'Equations',
    history: 'History',
    'fun-fact': 'Fun Facts',
  },
  teacherDashboard: {
    title: 'Teacher Dashboard',
    wordmark: 'Essayons',
  },
  locale: {
    selectLanguage: 'Select language',
  },
}
