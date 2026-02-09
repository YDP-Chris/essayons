import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeacherDashboard } from './TeacherDashboard.tsx'
import { LocaleProvider } from '@/i18n'

// Register at least one episode so the dashboard has content
vi.mock('@/episodes/registry.ts', async () => {
  const actual =
    await vi.importActual<typeof import('@/episodes/registry.ts')>('@/episodes/registry.ts')
  return {
    ...actual,
    getAllEpisodes: () => [
      {
        id: 'orbit-lab',
        title: 'Orbit Lab',
        subtitle: 'Launch satellites',
        domain: 'physics',
        simulationMode: 'continuous',
        description: 'Explore orbital mechanics',
        parameters: [],
        equations: [],
        missions: [
          {
            id: 'first-orbit',
            title: 'First Orbit',
            briefing: 'Launch a satellite',
            objectives: [],
            hints: [],
            successMessage: 'Done!',
          },
        ],
        referenceContent: [],
        initialState: {},
        renderLayers: [],
      },
    ],
  }
})

describe('TeacherDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(
      <LocaleProvider>
        <TeacherDashboard />
      </LocaleProvider>,
    )
    expect(container).toBeTruthy()
  })

  it('displays the Teacher Dashboard title', () => {
    render(
      <LocaleProvider>
        <TeacherDashboard />
      </LocaleProvider>,
    )
    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument()
  })

  it('renders the Link Generator section', () => {
    render(
      <LocaleProvider>
        <TeacherDashboard />
      </LocaleProvider>,
    )
    expect(screen.getByText('Classroom Link Generator')).toBeInTheDocument()
  })

  it('renders the Sequence Builder section', () => {
    render(
      <LocaleProvider>
        <TeacherDashboard />
      </LocaleProvider>,
    )
    expect(screen.getByText('Episode Sequence Builder')).toBeInTheDocument()
  })

  it('renders the Progress Viewer section', () => {
    render(
      <LocaleProvider>
        <TeacherDashboard />
      </LocaleProvider>,
    )
    expect(screen.getByText('Student Progress Viewer')).toBeInTheDocument()
  })

  it('renders the Lesson Plan Export section', () => {
    render(
      <LocaleProvider>
        <TeacherDashboard />
      </LocaleProvider>,
    )
    expect(screen.getByText('Lesson Plan Export')).toBeInTheDocument()
  })
})
