/**
 * Tutorial step definitions for the Orbit Lab onboarding flow.
 *
 * Each step targets a specific UI element in the EpisodeShell layout
 * using CSS selectors that match the existing class names.
 */

import type { TutorialStep } from './types.ts'

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Essayons',
    content:
      'This is Essayons \u2014 learn by trying. Explore interactive simulations that make science click.',
    targetSelector: 'body',
    positionHint: 'center',
  },
  {
    id: 'canvas',
    title: 'Your Simulation',
    content: 'This is your simulation \u2014 watch what happens when you change the physics.',
    targetSelector: '.episode-shell__canvas-wrapper',
    positionHint: 'bottom',
  },
  {
    id: 'parameters',
    title: 'Tweak the Physics',
    content:
      'Drag these sliders to change the physics. Every parameter you adjust updates the simulation in real time.',
    targetSelector: '.episode-shell__sidebar',
    positionHint: 'left',
  },
  {
    id: 'missions',
    title: 'Complete Missions',
    content:
      'Complete objectives to learn concepts. Each mission gives you a goal and hints to guide your exploration.',
    targetSelector: '.mission-panel',
    positionHint: 'left',
  },
  {
    id: 'reference',
    title: 'Science Reference',
    content:
      'Read about the science behind what you see. Equations, concepts, and fun facts are all here.',
    targetSelector: '.episode-shell__reference',
    positionHint: 'left',
  },
  {
    id: 'share',
    title: 'Share Your Discoveries',
    content:
      'Share your discoveries with a link. Anyone who opens it will see the exact simulation state you set up.',
    targetSelector: '.share-button-wrapper',
    positionHint: 'bottom',
  },
] as const
