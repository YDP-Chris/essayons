import { HeroSection } from '@/components/landing/HeroSection'
import { EpisodeGrid } from '@/components/landing/EpisodeGrid'
import { ValueProps } from '@/components/landing/ValueProps'
import { TeacherSection } from '@/components/landing/TeacherSection'
import { Footer } from '@/components/landing/Footer'
import { LazyEpisodeShell } from '@/episodes/LazyEpisodeShell'
import { TeacherDashboard } from '@/pages/TeacherDashboard'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { useRoute, navigate } from '@/shared/router'
import { PerformanceOverlay } from '@/dev/PerformanceOverlay'
import { installMemoryMonitor } from '@/dev/memory-monitor'
import { useTutorial } from '@/features/onboarding/use-tutorial.ts'
import { resetTutorial } from '@/features/onboarding/tutorial-storage.ts'
import { LocaleProvider, useTranslation } from '@/i18n'

// Install memory monitor in dev mode
if (import.meta.env.DEV) {
  installMemoryMonitor()
}

// ---------------------------------------------------------------------------
// EpisodeRoute — extracted so the useTutorial hook can be called at top level
// ---------------------------------------------------------------------------

function EpisodeRoute({ episodeId }: { readonly episodeId: string }) {
  const tutorial = useTutorial()
  const { t } = useTranslation()

  const handleRestartTutorial = () => {
    resetTutorial()
    tutorial.start()
  }

  return (
    <>
      {import.meta.env.DEV && <PerformanceOverlay />}
      <div className="episode-nav">
        <button
          className="episode-nav__restart-tutorial"
          onClick={handleRestartTutorial}
          type="button"
        >
          {t('nav.restartTutorial')}
        </button>
      </div>
      <main id="main-content">
        <LazyEpisodeShell episodeId={episodeId} tutorial={tutorial} />
      </main>
    </>
  )
}

// ---------------------------------------------------------------------------
// AppContent — inner component that uses hooks requiring LocaleProvider
// ---------------------------------------------------------------------------

function AppContent() {
  const route = useRoute()
  const { t } = useTranslation()

  const variant = route.route === 'episode' ? 'compact' : 'full'

  return (
    <div className="app">
      <a className="skip-to-content" href="#main-content">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader variant={variant} currentRoute={route.route} />

      {route.route === 'teach' && <TeacherDashboard />}

      {route.route === 'episode' && <EpisodeRoute episodeId={route.params.id!} />}

      {route.route !== 'teach' && route.route !== 'episode' && (
        <>
          {import.meta.env.DEV && <PerformanceOverlay />}
          <main id="main-content">
            <HeroSection />
            <EpisodeGrid onSelectEpisode={(id) => navigate(`/episode/${id}`)} />
            <ValueProps />
            <TeacherSection />
          </main>
          <Footer />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// App — wraps everything in LocaleProvider
// ---------------------------------------------------------------------------

export function App() {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  )
}
