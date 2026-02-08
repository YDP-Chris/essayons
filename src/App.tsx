import { HeroSection } from '@/components/landing/HeroSection'
import { EpisodeGrid } from '@/components/landing/EpisodeGrid'
import { ValueProps } from '@/components/landing/ValueProps'
import { TeacherSection } from '@/components/landing/TeacherSection'
import { Footer } from '@/components/landing/Footer'
import { EpisodeShell } from '@/episodes/EpisodeShell'
import { useRoute, navigate } from '@/shared/router'

// Register episodes (side-effect imports trigger registerEpisode)
import '@/episodes/orbit-lab/index.ts'
import '@/episodes/market-lab/index.ts'
import '@/episodes/citizen-lab/index.ts'
import '@/episodes/gene-lab/index.ts'
import '@/episodes/bridge-lab/index.ts'

export function App() {
  const route = useRoute()

  if (route.route === 'episode') {
    return (
      <div className="app">
        <nav className="episode-nav">
          <button className="episode-nav__back" onClick={() => navigate('/')} type="button">
            &larr; Back to Labs
          </button>
        </nav>
        <main id="main-content">
          <EpisodeShell episodeId={route.params.id!} />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <a className="skip-to-content" href="#main-content">
        Skip to content
      </a>
      <main id="main-content">
        <HeroSection />
        <EpisodeGrid onSelectEpisode={(id) => navigate(`/episode/${id}`)} />
        <ValueProps />
        <TeacherSection />
      </main>
      <Footer />
    </div>
  )
}
