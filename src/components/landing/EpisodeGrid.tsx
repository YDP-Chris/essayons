import './EpisodeGrid.css'

interface Episode {
  name: string
  episodeId: string
  domain: string
  icon: string
  hook: string
  color: string
  available: boolean
}

const episodes: Episode[] = [
  {
    name: 'Orbit Lab',
    episodeId: 'orbit-lab',
    domain: 'Physics',
    icon: '\u{1F6F0}\uFE0F',
    hook: 'Crash satellites into Earth until you understand gravity.',
    color: 'var(--physics)',
    available: true,
  },
  {
    name: 'Citizen Lab',
    episodeId: 'citizen-lab',
    domain: 'Civics',
    icon: '\u{1F3DB}\uFE0F',
    hook: 'Run a democracy. See what breaks.',
    color: 'var(--civics)',
    available: false,
  },
  {
    name: 'Market Lab',
    episodeId: 'market-lab',
    domain: 'Economics',
    icon: '\u{1F4C8}',
    hook: 'Watch supply meet demand. Crash markets.',
    color: 'var(--economics)',
    available: false,
  },
  {
    name: 'History Lab',
    episodeId: 'history-lab',
    domain: 'History',
    icon: '\u{1F4DC}',
    hook: 'What if? Change variables, see consequences.',
    color: 'var(--history)',
    available: false,
  },
  {
    name: 'Gene Lab',
    episodeId: 'gene-lab',
    domain: 'Biology',
    icon: '\u{1F9EC}',
    hook: 'Breed generations. Watch traits emerge.',
    color: 'var(--biology)',
    available: false,
  },
  {
    name: 'Bridge Lab',
    episodeId: 'bridge-lab',
    domain: 'Engineering',
    icon: '\u2699\uFE0F',
    hook: 'Build structures. Apply loads. Watch them fail.',
    color: 'var(--engineering)',
    available: false,
  },
]

export interface EpisodeGridProps {
  readonly onSelectEpisode?: (episodeId: string) => void
}

function EpisodeCard({
  episode,
  onSelect,
}: {
  episode: Episode
  onSelect?: (episodeId: string) => void
}) {
  const style = { '--episode-color': episode.color } as React.CSSProperties

  if (episode.available) {
    return (
      <button
        className="episode-card episode-card--clickable"
        style={style}
        type="button"
        onClick={(e) => {
          e.preventDefault()
          onSelect?.(episode.episodeId)
        }}
      >
        <span className="episode-card-icon" aria-hidden="true">
          {episode.icon}
        </span>
        <span className="episode-card-name">{episode.name}</span>
        <span className="episode-card-domain">{episode.domain}</span>
        <p className="episode-card-hook">{episode.hook}</p>
      </button>
    )
  }

  return (
    <div className="episode-card episode-card--disabled" style={style}>
      <span className="episode-card-icon" aria-hidden="true">
        {episode.icon}
      </span>
      <span className="episode-card-name">{episode.name}</span>
      <span className="episode-card-domain">{episode.domain}</span>
      <p className="episode-card-hook">{episode.hook}</p>
      <span className="episode-card-badge">Coming Soon</span>
    </div>
  )
}

export function EpisodeGrid({ onSelectEpisode }: EpisodeGridProps) {
  return (
    <section id="episodes" className="episodes" aria-labelledby="episodes-heading">
      <h2 id="episodes-heading" className="text-h1 episodes-heading">
        Choose your lab.
      </h2>
      <div className="episodes-grid">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.name} episode={episode} onSelect={onSelectEpisode} />
        ))}
      </div>
    </section>
  )
}
