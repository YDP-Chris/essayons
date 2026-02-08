import { useState, useCallback } from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { EpisodeGrid } from '@/components/landing/EpisodeGrid'
import { ValueProps } from '@/components/landing/ValueProps'
import { TeacherSection } from '@/components/landing/TeacherSection'
import { Footer } from '@/components/landing/Footer'
import { EpisodeShell } from '@/episodes/EpisodeShell'

// Register Orbit Lab episode (side-effect import triggers registerEpisode)
import '@/episodes/orbit-lab/index.ts'

export function App() {
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null)

  const handleNavigateToEpisode = useCallback((episodeId: string) => {
    setActiveEpisodeId(episodeId)
    window.scrollTo(0, 0)
  }, [])

  const handleBackToLanding = useCallback(() => {
    setActiveEpisodeId(null)
    window.scrollTo(0, 0)
  }, [])

  if (activeEpisodeId) {
    return (
      <div className="app">
        <nav className="episode-nav">
          <button className="episode-nav__back" onClick={handleBackToLanding} type="button">
            &larr; Back to Labs
          </button>
        </nav>
        <main id="main-content">
          <EpisodeShell episodeId={activeEpisodeId} />
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
        <EpisodeGrid onSelectEpisode={handleNavigateToEpisode} />
        <ValueProps />
        <TeacherSection />
      </main>
      <Footer />
    </div>
  )
}
