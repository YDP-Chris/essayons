import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LinkGenerator } from './LinkGenerator.tsx'
import { SequenceBuilder } from './SequenceBuilder.tsx'
import { ProgressViewer } from './ProgressViewer.tsx'
import { LessonPlanExport } from './LessonPlanExport.tsx'

// Mock the episode registry with test episodes
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
        description: 'Explore orbital mechanics by launching satellites.',
        parameters: [
          {
            id: 'launch-speed',
            label: 'Launch Speed',
            type: 'number',
            default: 7500,
            description: 'Initial velocity',
          },
        ],
        equations: [],
        missions: [
          {
            id: 'first-orbit',
            title: 'First Orbit',
            briefing: 'Launch a satellite that completes one full orbit.',
            objectives: [],
            hints: [],
            successMessage: 'Done!',
          },
          {
            id: 'crash-course',
            title: 'Crash Course',
            briefing: 'Crash into the planet.',
            objectives: [],
            hints: [],
            successMessage: 'Boom!',
          },
        ],
        referenceContent: [
          {
            id: 'what-is-orbit',
            title: 'What is an Orbit?',
            content: 'An orbit is a curved path around a point in space.',
            category: 'concept',
          },
        ],
        initialState: {},
        renderLayers: [],
      },
      {
        id: 'market-lab',
        title: 'Market Lab',
        subtitle: 'Supply and demand',
        domain: 'economics',
        simulationMode: 'step-based',
        description: 'Learn economics through markets.',
        parameters: [],
        equations: [],
        missions: [
          {
            id: 'supply-demand',
            title: 'Supply & Demand',
            briefing: 'Balance the market.',
            objectives: [],
            hints: [],
            successMessage: 'Balanced!',
          },
        ],
        referenceContent: [],
        initialState: {},
        renderLayers: [],
      },
    ],
  }
})

describe('LinkGenerator', () => {
  it('renders without crashing', () => {
    const { container } = render(<LinkGenerator />)
    expect(container).toBeTruthy()
  })

  it('displays the heading', () => {
    render(<LinkGenerator />)
    expect(screen.getByText('Classroom Link Generator')).toBeInTheDocument()
  })

  it('displays a lesson title input', () => {
    render(<LinkGenerator />)
    expect(screen.getByLabelText('Lesson Title')).toBeInTheDocument()
  })

  it('displays episode checkboxes', () => {
    render(<LinkGenerator />)
    expect(screen.getByText('Orbit Lab')).toBeInTheDocument()
    expect(screen.getByText('Market Lab')).toBeInTheDocument()
  })

  it('shows missions when an episode is selected', async () => {
    const user = userEvent.setup()
    render(<LinkGenerator />)

    const orbitCheckbox = screen.getByText('Orbit Lab').closest('label')!.querySelector('input')!
    await user.click(orbitCheckbox)

    expect(screen.getByText('First Orbit')).toBeInTheDocument()
    expect(screen.getByText('Crash Course')).toBeInTheDocument()
  })

  it('disables Generate Link button when no episodes are selected', () => {
    render(<LinkGenerator />)
    const btn = screen.getByRole('button', { name: /generate link/i })
    expect(btn).toBeDisabled()
  })

  it('enables Generate Link button when an episode is selected', async () => {
    const user = userEvent.setup()
    render(<LinkGenerator />)

    const orbitCheckbox = screen.getByText('Orbit Lab').closest('label')!.querySelector('input')!
    await user.click(orbitCheckbox)

    const btn = screen.getByRole('button', { name: /generate link/i })
    expect(btn).not.toBeDisabled()
  })

  it('generates a URL when Generate Link is clicked', async () => {
    const user = userEvent.setup()
    render(<LinkGenerator />)

    const orbitCheckbox = screen.getByText('Orbit Lab').closest('label')!.querySelector('input')!
    await user.click(orbitCheckbox)

    const btn = screen.getByRole('button', { name: /generate link/i })
    await user.click(btn)

    expect(screen.getByLabelText('Generated URL')).toBeInTheDocument()
  })
})

describe('SequenceBuilder', () => {
  it('renders without crashing', () => {
    const { container } = render(<SequenceBuilder sequence={[]} onSequenceChange={() => {}} />)
    expect(container).toBeTruthy()
  })

  it('displays the heading', () => {
    render(<SequenceBuilder sequence={[]} onSequenceChange={() => {}} />)
    expect(screen.getByText('Episode Sequence Builder')).toBeInTheDocument()
  })

  it('shows empty message when no episodes in sequence', () => {
    render(<SequenceBuilder sequence={[]} onSequenceChange={() => {}} />)
    expect(screen.getByText(/no episodes in sequence/i)).toBeInTheDocument()
  })

  it('displays episodes in the sequence as a numbered list', () => {
    render(<SequenceBuilder sequence={['orbit-lab', 'market-lab']} onSequenceChange={() => {}} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Orbit Lab')).toBeInTheDocument()
    expect(screen.getByText('Market Lab')).toBeInTheDocument()
  })

  it('calls onSequenceChange when Move Down is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SequenceBuilder sequence={['orbit-lab', 'market-lab']} onSequenceChange={onChange} />)

    const downBtn = screen.getByRole('button', { name: /move orbit lab down/i })
    await user.click(downBtn)
    expect(onChange).toHaveBeenCalledWith(['market-lab', 'orbit-lab'])
  })

  it('calls onSequenceChange when Remove is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SequenceBuilder sequence={['orbit-lab', 'market-lab']} onSequenceChange={onChange} />)

    const removeBtn = screen.getByRole('button', { name: /remove orbit lab/i })
    await user.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith(['market-lab'])
  })

  it('disables Move Up on the first item', () => {
    render(<SequenceBuilder sequence={['orbit-lab', 'market-lab']} onSequenceChange={() => {}} />)
    const upBtn = screen.getByRole('button', { name: /move orbit lab up/i })
    expect(upBtn).toBeDisabled()
  })

  it('disables Move Down on the last item', () => {
    render(<SequenceBuilder sequence={['orbit-lab', 'market-lab']} onSequenceChange={() => {}} />)
    const downBtn = screen.getByRole('button', { name: /move market lab down/i })
    expect(downBtn).toBeDisabled()
  })
})

describe('ProgressViewer', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressViewer />)
    expect(container).toBeTruthy()
  })

  it('displays the heading', () => {
    render(<ProgressViewer />)
    expect(screen.getByText('Student Progress Viewer')).toBeInTheDocument()
  })

  it('displays a file upload input', () => {
    render(<ProgressViewer />)
    expect(screen.getByLabelText(/upload student progress/i)).toBeInTheDocument()
  })
})

describe('LessonPlanExport', () => {
  it('renders without crashing', () => {
    const { container } = render(<LessonPlanExport selectedEpisodeIds={[]} />)
    expect(container).toBeTruthy()
  })

  it('displays the heading', () => {
    render(<LessonPlanExport selectedEpisodeIds={[]} />)
    expect(screen.getByText('Lesson Plan Export')).toBeInTheDocument()
  })

  it('shows empty message when no episodes selected', () => {
    render(<LessonPlanExport selectedEpisodeIds={[]} />)
    expect(screen.getByText(/select episodes/i)).toBeInTheDocument()
  })

  it('generates markdown when episodes are selected', () => {
    render(<LessonPlanExport selectedEpisodeIds={['orbit-lab']} />)
    expect(screen.getByText(/# Lesson Plan/)).toBeInTheDocument()
  })

  it('displays Download as Markdown button when episodes are selected', () => {
    render(<LessonPlanExport selectedEpisodeIds={['orbit-lab']} />)
    expect(screen.getByRole('button', { name: /download as markdown/i })).toBeInTheDocument()
  })

  it('displays Print button when episodes are selected', () => {
    render(<LessonPlanExport selectedEpisodeIds={['orbit-lab']} />)
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument()
  })
})
