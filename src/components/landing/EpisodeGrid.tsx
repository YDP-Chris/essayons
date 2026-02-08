import './EpisodeGrid.css'
import { Icon } from '@/components/icons'
import { useTranslation } from '@/i18n'
import type { TranslationFunction } from '@/i18n'

interface Episode {
  nameKey: string
  episodeId: string
  domainKey: string
  iconName: string
  hookKey: string
  color: string
  available: boolean
}

const episodes: Episode[] = [
  {
    nameKey: 'episodes.orbitLab.name',
    episodeId: 'orbit-lab',
    domainKey: 'domains.physics',
    iconName: 'physics',
    hookKey: 'episodes.orbitLab.hook',
    color: 'var(--physics)',
    available: true,
  },
  {
    nameKey: 'episodes.citizenLab.name',
    episodeId: 'citizen-lab',
    domainKey: 'domains.civics',
    iconName: 'civics',
    hookKey: 'episodes.citizenLab.hook',
    color: 'var(--civics)',
    available: true,
  },
  {
    nameKey: 'episodes.marketLab.name',
    episodeId: 'market-lab',
    domainKey: 'domains.economics',
    iconName: 'economics',
    hookKey: 'episodes.marketLab.hook',
    color: 'var(--economics)',
    available: true,
  },
  {
    nameKey: 'episodes.historyLab.name',
    episodeId: 'history-lab',
    domainKey: 'domains.history',
    iconName: 'history',
    hookKey: 'episodes.historyLab.hook',
    color: 'var(--history)',
    available: false,
  },
  {
    nameKey: 'episodes.geneLab.name',
    episodeId: 'gene-lab',
    domainKey: 'domains.biology',
    iconName: 'biology',
    hookKey: 'episodes.geneLab.hook',
    color: 'var(--biology)',
    available: true,
  },
  {
    nameKey: 'episodes.bridgeLab.name',
    episodeId: 'bridge-lab',
    domainKey: 'domains.engineering',
    iconName: 'engineering',
    hookKey: 'episodes.bridgeLab.hook',
    color: 'var(--engineering)',
    available: true,
  },
]

export interface EpisodeGridProps {
  readonly onSelectEpisode?: (episodeId: string) => void
}

function EpisodeCard({
  episode,
  onSelect,
  t,
}: {
  episode: Episode
  onSelect?: (episodeId: string) => void
  t: TranslationFunction
}) {
  const style = { '--episode-color': episode.color } as React.CSSProperties
  const name = t(episode.nameKey)
  const domain = t(episode.domainKey)
  const hook = t(episode.hookKey)

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
          <Icon name={episode.iconName} size={32} />
        </span>
        <span className="episode-card-name">{name}</span>
        <span className="episode-card-domain">{domain}</span>
        <p className="episode-card-hook">{hook}</p>
      </button>
    )
  }

  return (
    <div className="episode-card episode-card--disabled" style={style}>
      <span className="episode-card-icon" aria-hidden="true">
        <Icon name={episode.iconName} size={32} />
      </span>
      <span className="episode-card-name">{name}</span>
      <span className="episode-card-domain">{domain}</span>
      <p className="episode-card-hook">{hook}</p>
      <span className="episode-card-badge">{t('episodes.comingSoon')}</span>
    </div>
  )
}

export function EpisodeGrid({ onSelectEpisode }: EpisodeGridProps) {
  const { t } = useTranslation()

  return (
    <section id="episodes" className="episodes" aria-labelledby="episodes-heading">
      <h2 id="episodes-heading" className="text-h1 episodes-heading">
        {t('episodes.chooseYourLab')}
      </h2>
      <div className="episodes-grid">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.episodeId} episode={episode} onSelect={onSelectEpisode} t={t} />
        ))}
      </div>
    </section>
  )
}
