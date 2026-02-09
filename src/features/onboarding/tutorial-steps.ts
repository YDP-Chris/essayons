/**
 * Tutorial step definitions for the Orbit Lab onboarding flow.
 *
 * Each step targets a specific UI element in the EpisodeShell layout
 * using CSS selectors that match the existing class names.
 *
 * Copy follows the Essayons brand voice: encouraging, direct, curious.
 * Active verbs, second-person ("you"), words we use (try, experiment,
 * discover, crash). Words we avoid (learn, study, memorize, users,
 * students, game, module, lesson).
 */

import type { TutorialStep } from './types.ts'

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Essayons',
    content:
      'You discover by doing here. Try things, crash things, and figure out how the universe works \u2014 one experiment at a time.',
    targetSelector: 'body',
    positionHint: 'center',
  },
  {
    id: 'canvas',
    title: 'Your Simulation',
    content:
      'This is where it all happens. Watch orbits form, collide, and break apart \u2014 every frame is real physics, computed live.',
    targetSelector: '.episode-shell__canvas-wrapper',
    positionHint: 'bottom',
  },
  {
    id: 'parameters',
    title: 'Tweak the Physics',
    content:
      'Try dragging these sliders! Every parameter you change updates the simulation instantly. Push values to extremes and see what breaks.',
    targetSelector: '.episode-shell__sidebar',
    positionHint: 'left',
  },
  {
    id: 'missions',
    title: 'Take On Missions',
    content:
      'Each mission is a puzzle. You get an objective, a few hints, and the freedom to experiment until you crack it. Failing is part of the process.',
    targetSelector: '.mission-panel',
    positionHint: 'left',
  },
  {
    id: 'reference',
    title: 'The Science Behind It',
    content:
      'Curious why that orbit decayed? Dive into the real equations, concepts, and stories behind what you just saw.',
    targetSelector: '.episode-shell__reference',
    positionHint: 'left',
  },
  {
    id: 'share',
    title: 'Share What You Found',
    content:
      'Discovered something wild? Share your exact simulation state with a single link \u2014 anyone who opens it picks up right where you left off.',
    targetSelector: '.share-button-wrapper',
    positionHint: 'bottom',
  },
] as const
