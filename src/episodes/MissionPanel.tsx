/**
 * MissionPanel — displays current mission briefing, objectives, hints, and status.
 *
 * Reads mission definitions from the EpisodeConfig and combines them with
 * live MissionState from the engine to show:
 * - Briefing text
 * - Objective checklist with live status
 * - Progressive hint reveal
 * - Success / failure messages
 */

import { useState, useCallback } from 'react'
import type { MissionConfig } from './types.ts'
import type { MissionState, ObjectiveStatus } from '@/engine/types.ts'
import { Card } from '@/components/ui/Card.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { useTranslation } from '@/i18n'
import './MissionPanel.css'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MissionPanelProps {
  readonly missions: readonly MissionConfig[]
  readonly missionState: MissionState
  readonly activeMissionIndex: number
  readonly onSelectMission: (index: number) => void
}

// ---------------------------------------------------------------------------
// Objective status icon
// ---------------------------------------------------------------------------

function statusIcon(status: ObjectiveStatus): string {
  switch (status) {
    case 'completed':
      return '\u2713'
    case 'failed':
      return '\u2717'
    case 'pending':
      return '\u25CB'
  }
}

function statusClassName(status: ObjectiveStatus): string {
  switch (status) {
    case 'completed':
      return 'mission-panel__objective--completed'
    case 'failed':
      return 'mission-panel__objective--failed'
    case 'pending':
      return 'mission-panel__objective--pending'
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MissionPanel({
  missions,
  missionState,
  activeMissionIndex,
  onSelectMission,
}: MissionPanelProps) {
  const { t } = useTranslation()
  const [hintsRevealed, setHintsRevealed] = useState(0)

  const revealNextHint = useCallback(() => {
    setHintsRevealed((prev) => prev + 1)
  }, [])

  if (missions.length === 0) {
    return null
  }

  const activeMission = missions[activeMissionIndex]
  if (!activeMission) {
    return null
  }

  const { phase, objectives: liveObjectives } = missionState
  const hints = activeMission.hints ?? []
  const visibleHints = hints.slice(0, hintsRevealed)
  const hasMoreHints = hintsRevealed < hints.length

  return (
    <Card
      header={<h2 className="mission-panel__title">{t('panels.mission')}</h2>}
      className="mission-panel"
    >
      {/* Mission selector (when multiple missions exist) */}
      {missions.length > 1 && (
        <nav className="mission-panel__selector" aria-label="Mission selector">
          {missions.map((mission, idx) => (
            <Button
              key={mission.id}
              variant={idx === activeMissionIndex ? 'primary' : 'ghost'}
              size="sm"
              className="mission-panel__selector-btn"
              onClick={() => onSelectMission(idx)}
            >
              {idx + 1}. {mission.title}
            </Button>
          ))}
        </nav>
      )}

      {/* Briefing */}
      <div className="mission-panel__section">
        <h3 className="mission-panel__section-heading">{activeMission.title}</h3>
        <p className="mission-panel__briefing">{activeMission.briefing}</p>
      </div>

      {/* Objectives */}
      <div className="mission-panel__section">
        <h3 className="mission-panel__section-heading">{t('panels.objectives')}</h3>
        <ul className="mission-panel__objectives">
          {activeMission.objectives.map((obj, idx) => {
            const liveObj = liveObjectives[idx]
            const status: ObjectiveStatus = liveObj?.status ?? 'pending'

            return (
              <li key={obj.id} className={`mission-panel__objective ${statusClassName(status)}`}>
                <span className="mission-panel__objective-icon" aria-hidden="true">
                  {statusIcon(status)}
                </span>
                <span className="mission-panel__objective-text">{obj.description}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Hints */}
      {hints.length > 0 && phase === 'active' && (
        <div className="mission-panel__section">
          <h3 className="mission-panel__section-heading">{t('panels.hints')}</h3>
          {visibleHints.length > 0 && (
            <ol className="mission-panel__hints">
              {visibleHints.map((hint, idx) => (
                <li key={idx} className="mission-panel__hint">
                  {hint}
                </li>
              ))}
            </ol>
          )}
          {hasMoreHints && (
            <Button
              variant="ghost"
              size="sm"
              className="mission-panel__hint-btn"
              onClick={revealNextHint}
            >
              {t('panels.showHint')
                .replace('{current}', String(hintsRevealed + 1))
                .replace('{total}', String(hints.length))}
            </Button>
          )}
        </div>
      )}

      {/* Success message */}
      {phase === 'success' && (
        <div className="mission-panel__result mission-panel__result--success" role="status">
          <span className="mission-panel__result-icon" aria-hidden="true">
            {'\u2713'}
          </span>
          <p className="mission-panel__result-text">{activeMission.successMessage}</p>
        </div>
      )}

      {/* Failure message */}
      {phase === 'failed' && (
        <div className="mission-panel__result mission-panel__result--failed" role="status">
          <span className="mission-panel__result-icon" aria-hidden="true">
            {'\u2717'}
          </span>
          <p className="mission-panel__result-text">{t('panels.missionFailedRetry')}</p>
        </div>
      )}
    </Card>
  )
}
