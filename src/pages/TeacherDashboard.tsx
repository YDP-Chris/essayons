/**
 * Teacher Dashboard page component.
 *
 * Composes all teacher tools: LinkGenerator, SequenceBuilder,
 * ProgressViewer, and LessonPlanExport into a single dashboard page.
 */

import { useState, useCallback } from 'react'
import { navigate } from '@/shared/router/router.ts'
import { LinkGenerator } from '@/components/teacher/LinkGenerator.tsx'
import { SequenceBuilder } from '@/components/teacher/SequenceBuilder.tsx'
import { ProgressViewer } from '@/components/teacher/ProgressViewer.tsx'
import { LessonPlanExport } from '@/components/teacher/LessonPlanExport.tsx'
import './TeacherDashboard.css'

export function TeacherDashboard() {
  const [sequence, setSequence] = useState<string[]>([])

  const handleSequenceChange = useCallback((newSequence: string[]) => {
    setSequence(newSequence)
  }, [])

  return (
    <div className="teach-dashboard">
      <nav className="teach-dashboard__nav">
        <span className="teach-dashboard__wordmark">Essayons</span>
        <button type="button" className="teach-dashboard__back" onClick={() => navigate('/')}>
          &larr; Back to Labs
        </button>
      </nav>

      <main className="teach-dashboard__main">
        <h1 className="teach-dashboard__title">Teacher Dashboard</h1>

        <div className="teach-dashboard__grid">
          <div className="teach-dashboard__section">
            <LinkGenerator />
          </div>

          <div className="teach-dashboard__section">
            <SequenceBuilder sequence={sequence} onSequenceChange={handleSequenceChange} />
          </div>

          <div className="teach-dashboard__section">
            <ProgressViewer />
          </div>

          <div className="teach-dashboard__section">
            <LessonPlanExport selectedEpisodeIds={sequence} />
          </div>
        </div>
      </main>
    </div>
  )
}
