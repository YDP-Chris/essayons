/**
 * EpisodeShell — generic React component that renders any episode from its config.
 *
 * Looks up the EpisodeConfig from the registry, creates the appropriate
 * simulation engine, and assembles the full episode UI from sub-panels:
 * - Canvas (simulation viewport)
 * - ParameterPanel (sidebar controls)
 * - MissionPanel (objectives and hints)
 * - ReferencePanel (educational content)
 *
 * Uses existing design system components (Slider, Button, Card) and
 * integrates with analytics and progress storage.
 */

import { useRef, useEffect, useMemo, useState, useCallback, useSyncExternalStore } from 'react'
import type { EpisodeConfig } from './types.ts'
import type {
  EpisodeDefinition,
  MissionDefinition,
  MissionState,
  ObjectiveStatus,
  ParamValues,
  PhysicsState,
} from '@/engine/types.ts'
import { SimulationEngine } from '@/engine/SimulationEngine.ts'
import { SPEED_PRESETS } from '@/engine/TimeController.ts'
import { getEpisode, getEpisodeDefinition } from './registry.ts'
import { ParameterPanel } from './ParameterPanel.tsx'
import { MissionPanel } from './MissionPanel.tsx'
import { ReferencePanel } from './ReferencePanel.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { Drawer } from '@/components/ui/Drawer.tsx'
import { BottomSheet } from '@/components/ui/BottomSheet.tsx'
import { SpeedControl } from '@/components/ui/SpeedControl.tsx'
import { MobileTabBar, type MobileTab } from '@/components/ui/MobileTabBar.tsx'
import { GestureHint } from '@/components/ui/GestureHint.tsx'
import { useIsMobile, useIsTablet, useIsLandscape } from '@/hooks/useMediaQuery.ts'
import { useAutoHide } from '@/hooks/useAutoHide.ts'
import {
  trackSimulationInteraction,
  trackMissionStart,
  trackMissionComplete,
  trackMissionFail,
  setDomainMetadata,
} from '@/analytics/plausible.ts'
import { OnboardingTutorial } from '@/features/onboarding/OnboardingTutorial.tsx'
import type { UseTutorialReturn } from '@/features/onboarding/use-tutorial.ts'
import { AriaLiveRegion } from '@/shared/accessibility/AriaLiveRegion.tsx'
import { useTranslation } from '@/i18n'
import './EpisodeShell.css'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EpisodeShellProps {
  readonly episodeId: string
  /** Optional tutorial state from useTutorial, rendered when provided. */
  readonly tutorial?: UseTutorialReturn
}

// ---------------------------------------------------------------------------
// Speed presets for mobile segmented control (subset of full presets)
// ---------------------------------------------------------------------------

const MOBILE_SPEED_PRESETS = [1, 2, 5, 10] as const

// ---------------------------------------------------------------------------
// Config-to-engine adapter
// ---------------------------------------------------------------------------

/**
 * Convert an EpisodeConfig into the EpisodeDefinition interface that
 * SimulationEngine expects. Mission evaluation uses a simple no-op
 * since the config's `check` field is a function name string — real
 * evaluation is provided by episode module code that registers a
 * check map.
 */
function configToEpisodeDefinition(config: EpisodeConfig): EpisodeDefinition {
  const engineParams = config.parameters.map((p) => {
    switch (p.type) {
      case 'number':
        return {
          type: 'number' as const,
          key: p.id,
          label: p.label,
          default: (p.default as number) ?? 0,
          min: p.min ?? 0,
          max: p.max ?? 100,
          step: p.step ?? 1,
          unit: p.unit,
        }
      case 'boolean':
        return {
          type: 'boolean' as const,
          key: p.id,
          label: p.label,
          default: (p.default as boolean) ?? false,
        }
      case 'enum':
        return {
          type: 'enum' as const,
          key: p.id,
          label: p.label,
          default: (p.default as string) ?? '',
          options: (p.options ?? []).map((opt) => ({ value: opt, label: opt })),
        }
      case 'vector2':
        return {
          type: 'vector2' as const,
          key: p.id,
          label: p.label,
          default: (p.default as { x: number; y: number }) ?? { x: 0, y: 0 },
        }
    }
  })

  const engineMissions: MissionDefinition[] = config.missions.map((m) => ({
    id: m.id,
    name: m.title,
    description: m.briefing,
    objectives: m.objectives.map((o) => ({
      id: o.id,
      label: o.description,
    })),
    evaluate: (
      _state: PhysicsState,
      _params: ParamValues,
      _simTime: number,
    ): ReadonlyArray<{ id: string; status: ObjectiveStatus }> => {
      // Config-driven episodes rely on external check functions.
      // By default, objectives stay pending until a check map is provided.
      return m.objectives.map((o) => ({ id: o.id, status: 'pending' as const }))
    },
  }))

  return {
    id: config.id,
    name: config.title,
    description: config.description,
    accentColor: domainAccentColor(config.domain),
    parameters: engineParams,
    missions: engineMissions,
    init: () => {
      // Config-driven episodes register render layers externally
    },
    createInitialState: () => ({ ...config.initialState }),
    update: (state: PhysicsState, _params: ParamValues, _dt: number) => state,
    render: () => {
      // Render layers are managed via the config
    },
    cleanup: () => {
      // No resources to release in config-driven mode
    },
  }
}

/** Map domain to CSS accent color variable fallback. */
function domainAccentColor(domain: string): string {
  const colors: Record<string, string> = {
    physics: '#6366f1',
    civics: '#ef4444',
    economics: '#f59e0b',
    history: '#8b5cf6',
    biology: '#22c55e',
    engineering: '#3b82f6',
  }
  return colors[domain] ?? '#6366f1'
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function EpisodeShell({ episodeId, tutorial }: EpisodeShellProps) {
  const config = getEpisode(episodeId)
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeMissionIndex, setActiveMissionIndex] = useState(0)

  // Responsive state
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isSmallScreen = isMobile || isTablet
  const isLandscape = useIsLandscape()
  const { visible: headerVisible } = useAutoHide(3000, isLandscape)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [referenceOpen, setReferenceOpen] = useState(false)
  const [missionSheetOpen, setMissionSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<MobileTab | null>(null)

  // Landscape FAB state
  const [fabOpen, setFabOpen] = useState(false)

  // Zoom badge state
  const [zoomLevel, setZoomLevel] = useState<string | null>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- Create engine synchronously when config changes ----
  const engine = useMemo(() => {
    if (!config) return null
    const newEngine = new SimulationEngine()
    // Prefer a registered EpisodeDefinition (with real physics/render) over
    // the generic config-to-definition adapter (which has no-op stubs).
    const registeredDef = getEpisodeDefinition(config.id)
    const episodeDef = registeredDef ?? configToEpisodeDefinition(config)
    newEngine.loadEpisode(episodeDef)
    return newEngine
  }, [config])

  // ---- Cleanup engine on change / unmount ----
  useEffect(() => {
    return () => {
      engine?.destroy()
    }
  }, [engine])

  // ---- Analytics on config change ----
  useEffect(() => {
    if (!config) return
    setDomainMetadata({ episodeId: config.id, domain: config.domain })
    if (config.missions.length > 0) {
      const firstMission = config.missions[0]
      if (firstMission) {
        trackMissionStart(config.id, firstMission.id)
      }
    }
  }, [config])

  // ---- Attach canvas ----
  useEffect(() => {
    const canvas = canvasRef.current
    if (!engine || !canvas) return

    engine.attachCanvas(canvas)

    // Start the render loop for all simulation modes.
    // Even event-driven and step-based episodes need the rAF loop
    // running so the canvas renderer draws each frame.
    engine.start()

    // Start paused so the user can explore parameters and read the
    // mission briefing before the simulation begins running.
    engine.time.pause()

    return () => {
      engine.stop()
      engine.detachCanvas()
    }
  }, [engine])

  // ---- Subscribe to engine state ----
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!engine) return () => {}
      return engine.subscribe(cb)
    },
    [engine],
  )

  const getSnapshot = useCallback(() => {
    if (!engine) {
      return {
        running: false,
        paused: false,
        simulationTime: 0,
        speedMultiplier: 1,
        fps: 0,
        physicsState: {},
        params: {},
        missionState: {
          phase: 'briefing' as const,
          activeMissionId: null,
          objectives: [],
          elapsedTime: 0,
        },
      }
    }
    return engine.getSnapshot()
  }, [engine])

  const state = useSyncExternalStore(subscribe, getSnapshot)

  // ---- Track mission state changes for analytics ----
  const prevPhaseRef = useRef(state.missionState.phase)
  useEffect(() => {
    if (!config) return
    const prevPhase = prevPhaseRef.current
    const currentPhase = state.missionState.phase
    prevPhaseRef.current = currentPhase

    if (prevPhase === currentPhase) return

    const missionId = state.missionState.activeMissionId
    if (!missionId) return

    if (currentPhase === 'success') {
      trackMissionComplete(config.id, missionId, 1)
    } else if (currentPhase === 'failed') {
      trackMissionFail(config.id, missionId)
    }
  }, [state.missionState.phase, state.missionState.activeMissionId, config])

  // ---- Handlers ----
  const handleParameterChange = useCallback(
    (id: string, value: unknown) => {
      if (!engine) return
      engine.setParameterValue(id, value as number | boolean | string | { x: number; y: number })
    },
    [engine],
  )

  const handlePlay = useCallback(() => {
    if (!engine || !config) return
    // When starting from time 0, reinitialize physics with current
    // param values so the user's slider changes take effect.
    if (engine.time.simulationTime === 0) {
      engine.reinitialize()
    }
    engine.start()
    engine.time.play()
    trackSimulationInteraction('play', config.id)
  }, [engine, config])

  const handlePause = useCallback(() => {
    if (!engine || !config) return
    engine.time.pause()
    trackSimulationInteraction('pause', config.id)
  }, [engine, config])

  const handleRelaunch = useCallback(() => {
    if (!engine || !config) return
    engine.relaunch()
    trackSimulationInteraction('relaunch', config.id)
  }, [engine, config])

  const handleReset = useCallback(() => {
    if (!engine || !config) return
    engine.reset()
    // Restart render loop but keep paused so the user can adjust
    // parameters before running the simulation again.
    engine.start()
    engine.time.pause()
    setActiveMissionIndex(0)
    trackSimulationInteraction('reset', config.id)
  }, [engine, config])

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!engine) return
      engine.time.setSpeed(Number(e.target.value))
    },
    [engine],
  )

  const handleMobileSpeedChange = useCallback(
    (speed: number) => {
      if (!engine) return
      engine.time.setSpeed(speed)
    },
    [engine],
  )

  const handleSelectMission = useCallback(
    (index: number) => {
      if (!config) return
      setActiveMissionIndex(index)
      const mission = config.missions[index]
      if (mission && engine) {
        engine.missions.startMission(mission.id)
        trackMissionStart(config.id, mission.id)
      }
    },
    [config, engine],
  )

  // ---- Mobile tab bar handler ----
  const handleTabSelect = useCallback(
    (tab: MobileTab) => {
      if (activeTab === tab) {
        // Toggle off: close all panels
        setActiveTab(null)
        setSidebarOpen(false)
        setMissionSheetOpen(false)
        setReferenceOpen(false)
        return
      }
      setActiveTab(tab)
      setSidebarOpen(tab === 'parameters')
      setMissionSheetOpen(tab === 'mission')
      setReferenceOpen(tab === 'reference')
    },
    [activeTab],
  )

  const handleClosePanel = useCallback(() => {
    setActiveTab(null)
    setSidebarOpen(false)
    setMissionSheetOpen(false)
    setReferenceOpen(false)
  }, [])

  // ---- Landscape FAB handler ----
  const handleFabPanel = useCallback(
    (panel: MobileTab) => {
      setFabOpen(false)
      handleTabSelect(panel)
    },
    [handleTabSelect],
  )

  // ---- Zoom level badge ----
  const showZoomBadge = useCallback((level: number) => {
    setZoomLevel(`${Math.round(level * 100)}%`)
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    zoomTimerRef.current = setTimeout(() => setZoomLevel(null), 1000)
  }, [])

  // Listen for wheel zoom on canvas to show badge
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isSmallScreen) return

    let currentZoom = 1
    const handleWheel = (e: WheelEvent) => {
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      currentZoom = Math.max(0.05, Math.min(50, currentZoom * factor))
      showZoomBadge(currentZoom)
    }
    canvas.addEventListener('wheel', handleWheel, { passive: true })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [isSmallScreen, showZoomBadge])

  // ---- Simulation status message for screen readers ----
  const simulationStatus = useMemo(() => {
    const phase = state.missionState.phase
    if (phase === 'success') return t('simulation.missionCompleted')
    if (phase === 'failed') return t('simulation.missionFailed')
    if (state.running && !state.paused) return t('simulation.running')
    if (state.paused) return t('simulation.paused')
    return t('simulation.ready')
  }, [state.missionState.phase, state.running, state.paused, t])

  // ---- Render ----
  if (!config) {
    return (
      <div className="episode-shell episode-shell--error">
        <p>{t('simulation.episodeNotFound').replace('{id}', episodeId)}</p>
      </div>
    )
  }

  const shellClasses = [
    'episode-shell',
    `domain-${config.domain}`,
    isLandscape ? 'episode-shell--landscape' : '',
    isSmallScreen ? 'episode-shell--mobile' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClasses}>
      {/* Header */}
      <header
        className={`episode-shell__header${isLandscape && !headerVisible ? ' episode-shell__header--hidden' : ''}`}
      >
        <div className="episode-shell__header-text">
          <h1 className="episode-shell__title">{config.title}</h1>
          <p className="episode-shell__subtitle">{config.subtitle}</p>
        </div>
        <div className="episode-shell__controls">
          {state.paused || !state.running ? (
            <Button
              variant="domain"
              size="sm"
              onClick={handlePlay}
              aria-label={t('simulation.playSimulation')}
            >
              {t('simulation.play')}
            </Button>
          ) : (
            <Button
              variant="domain"
              size="sm"
              onClick={handlePause}
              aria-label={t('simulation.pauseSimulation')}
            >
              {t('simulation.pause')}
            </Button>
          )}
          {state.simulationTime > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRelaunch}
              aria-label={t('simulation.relaunchSimulation')}
              title={t('simulation.relaunchTooltip')}
            >
              {t('simulation.relaunch')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            aria-label={t('simulation.resetSimulation')}
          >
            {t('simulation.reset')}
          </Button>
          {/* Speed control: segmented on mobile, select on desktop */}
          {isSmallScreen ? (
            <SpeedControl
              presets={[...MOBILE_SPEED_PRESETS]}
              value={state.speedMultiplier}
              onChange={handleMobileSpeedChange}
              ariaLabel={t('simulation.speed')}
            />
          ) : (
            <select
              className="episode-shell__speed"
              value={state.speedMultiplier}
              onChange={handleSpeedChange}
              aria-label={t('simulation.speed')}
            >
              {SPEED_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Main grid */}
      <div className="episode-shell__grid">
        {/* Canvas area */}
        <div className="episode-shell__canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="episode-shell__canvas"
            role="img"
            aria-label={`${config.title} simulation`}
          />
          {/* Gesture hint overlay (mobile first visit) */}
          {isSmallScreen && <GestureHint enabled={isSmallScreen} />}
          {/* Zoom level badge */}
          {zoomLevel && (
            <div className="episode-shell__zoom-badge" role="status" aria-live="polite">
              {zoomLevel}
            </div>
          )}
        </div>

        {/* Sidebar — desktop only (inline) */}
        {!isSmallScreen && (
          <aside className="episode-shell__sidebar">
            <ParameterPanel
              parameters={config.parameters}
              values={state.params}
              episodeId={config.id}
              onParameterChange={handleParameterChange}
            />

            <MissionPanel
              missions={config.missions}
              missionState={state.missionState as MissionState}
              activeMissionIndex={activeMissionIndex}
              onSelectMission={handleSelectMission}
            />
          </aside>
        )}

        {/* Reference panel — desktop only (inline) */}
        {!isSmallScreen && (
          <aside className="episode-shell__reference">
            <ReferencePanel references={config.referenceContent} />
          </aside>
        )}
      </div>

      {/* Mobile panels: Drawer for parameters, BottomSheet for mission and reference */}
      {isSmallScreen && (
        <>
          <Drawer open={sidebarOpen} onClose={handleClosePanel} title={t('panels.parameters')}>
            <ParameterPanel
              parameters={config.parameters}
              values={state.params}
              episodeId={config.id}
              onParameterChange={handleParameterChange}
            />
          </Drawer>

          <BottomSheet
            open={missionSheetOpen}
            onClose={handleClosePanel}
            title={t('panels.mission')}
          >
            <MissionPanel
              missions={config.missions}
              missionState={state.missionState as MissionState}
              activeMissionIndex={activeMissionIndex}
              onSelectMission={handleSelectMission}
            />
          </BottomSheet>

          <BottomSheet
            open={referenceOpen}
            onClose={handleClosePanel}
            title={t('panels.reference')}
          >
            <ReferencePanel references={config.referenceContent} />
          </BottomSheet>
        </>
      )}

      {/* Bottom tab bar — mobile portrait only */}
      {isSmallScreen && !isLandscape && (
        <MobileTabBar activeTab={activeTab} onTabSelect={handleTabSelect} />
      )}

      {/* Landscape FAB for panel access */}
      {isLandscape && (
        <div className="episode-shell__fab-container">
          {fabOpen && (
            <div className="episode-shell__fab-menu">
              <button
                type="button"
                className="episode-shell__fab-item"
                onClick={() => handleFabPanel('parameters')}
              >
                Parameters
              </button>
              <button
                type="button"
                className="episode-shell__fab-item"
                onClick={() => handleFabPanel('mission')}
              >
                Mission
              </button>
              <button
                type="button"
                className="episode-shell__fab-item"
                onClick={() => handleFabPanel('reference')}
              >
                Reference
              </button>
            </div>
          )}
          <button
            type="button"
            className="episode-shell__fab"
            onClick={() => setFabOpen((prev) => !prev)}
            aria-label="Open panel menu"
            aria-expanded={fabOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="6" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="18" r="2" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}

      {/* Onboarding tutorial overlay */}
      {tutorial && <OnboardingTutorial tutorial={tutorial} />}

      {/* Screen reader announcements for simulation status */}
      <AriaLiveRegion message={simulationStatus} />
    </div>
  )
}
