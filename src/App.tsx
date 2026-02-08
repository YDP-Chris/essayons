import { HeroSection } from '@/components/landing/HeroSection'
import { EpisodeGrid } from '@/components/landing/EpisodeGrid'
import { ValueProps } from '@/components/landing/ValueProps'
import { TeacherSection } from '@/components/landing/TeacherSection'
import { Footer } from '@/components/landing/Footer'
import { LazyEpisodeShell } from '@/episodes/LazyEpisodeShell'
import { TeacherDashboard } from '@/pages/TeacherDashboard'
import { useRoute, navigate } from '@/shared/router'
import { PerformanceOverlay } from '@/dev/PerformanceOverlay'
import { installMemoryMonitor } from '@/dev/memory-monitor'
import { useTutorial } from '@/features/onboarding/use-tutorial.ts'
import { resetTutorial } from '@/features/onboarding/tutorial-storage.ts'

// Install memory monitor in dev mode
if (import.meta.env.DEV) {
  installMemoryMonitor()
}

// ---------------------------------------------------------------------------
// EpisodeRoute — extracted so the useTutorial hook can be called at top level
// ---------------------------------------------------------------------------

function EpisodeRoute({ episodeId }: { readonly episodeId: string }) {
  const tutorial = useTutorial()

  const handleRestartTutorial = () => {
    resetTutorial()
    tutorial.start()
  }

  return (
    <div className="app">
      {import.meta.env.DEV && <PerformanceOverlay />}
      <nav className="episode-nav">
        <button className="episode-nav__back" onClick={() => navigate('/')} type="button">
          &larr; Back to Labs
        </button>
        <button
          className="episode-nav__restart-tutorial"
          onClick={handleRestartTutorial}
          type="button"
        >
          Restart Tutorial
        </button>
      </nav>
      <main id="main-content">
        <LazyEpisodeShell episodeId={episodeId} tutorial={tutorial} />
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App() {
  const route = useRoute()

  if (route.route === 'teach') {
    return <TeacherDashboard />
  }

  if (route.route === 'episode') {
    return <EpisodeRoute episodeId={route.params.id!} />
  }

  return (
    <div className="app">
      {import.meta.env.DEV && <PerformanceOverlay />}
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
