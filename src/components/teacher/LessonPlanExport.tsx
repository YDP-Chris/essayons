/**
 * Printable lesson plan export component.
 *
 * Generates a markdown summary from selected episodes and provides
 * download and print functionality.
 */

import { useCallback, useMemo } from 'react'
import { getAllEpisodes } from '@/episodes/registry.ts'
import type { EpisodeConfig } from '@/episodes/types.ts'

interface LessonPlanExportProps {
  readonly selectedEpisodeIds: readonly string[]
}

export function LessonPlanExport({ selectedEpisodeIds }: LessonPlanExportProps) {
  const allEpisodes = getAllEpisodes()
  const episodeMap = useMemo(() => {
    const map = new Map<string, EpisodeConfig>()
    for (const ep of allEpisodes) {
      map.set(ep.id, ep)
    }
    return map
  }, [allEpisodes])

  const selectedEpisodes = useMemo(
    () =>
      selectedEpisodeIds
        .map((id) => episodeMap.get(id))
        .filter((ep): ep is EpisodeConfig => ep != null),
    [selectedEpisodeIds, episodeMap],
  )

  const markdown = useMemo(() => {
    if (selectedEpisodes.length === 0) return ''

    const lines: string[] = []
    lines.push('# Lesson Plan')
    lines.push('')
    lines.push(`**Episodes:** ${selectedEpisodes.length}`)
    lines.push('')

    for (const episode of selectedEpisodes) {
      lines.push(`## ${episode.title}`)
      lines.push('')
      lines.push(`*${episode.subtitle}*`)
      lines.push('')
      lines.push(episode.description)
      lines.push('')

      if (episode.missions.length > 0) {
        lines.push('### Missions')
        lines.push('')
        for (const mission of episode.missions) {
          lines.push(`- **${mission.title}**: ${mission.briefing}`)
        }
        lines.push('')
      }

      if (episode.parameters.length > 0) {
        lines.push('### Parameters')
        lines.push('')
        for (const param of episode.parameters) {
          const desc = param.description ? ` - ${param.description}` : ''
          lines.push(`- **${param.label}**${desc}`)
        }
        lines.push('')
      }

      if (episode.referenceContent.length > 0) {
        lines.push('### Reference Content')
        lines.push('')
        for (const ref of episode.referenceContent) {
          lines.push(`#### ${ref.title}`)
          lines.push('')
          lines.push(ref.content)
          lines.push('')
        }
      }

      lines.push('---')
      lines.push('')
    }

    return lines.join('\n')
  }, [selectedEpisodes])

  const handleDownload = useCallback(() => {
    if (!markdown) return
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lesson-plan.md'
    link.click()
    URL.revokeObjectURL(url)
  }, [markdown])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <section className="lesson-export" aria-labelledby="lesson-export-heading">
      <h2 id="lesson-export-heading" className="lesson-export__heading">
        Lesson Plan Export
      </h2>

      {selectedEpisodes.length === 0 ? (
        <p className="lesson-export__empty">
          Select episodes in the Link Generator or Sequence Builder to generate a lesson plan.
        </p>
      ) : (
        <>
          <div className="lesson-export__preview">
            <pre className="lesson-export__markdown">{markdown}</pre>
          </div>

          <div className="lesson-export__actions">
            <button type="button" className="lesson-export__btn" onClick={handleDownload}>
              Download as Markdown
            </button>
            <button type="button" className="lesson-export__btn" onClick={handlePrint}>
              Print
            </button>
          </div>
        </>
      )}
    </section>
  )
}
