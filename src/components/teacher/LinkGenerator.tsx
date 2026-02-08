/**
 * Classroom link generator component.
 *
 * Allows teachers to select episodes and missions, then generates
 * a shareable URL encoding those selections.
 */

import { useState, useCallback } from 'react'
import { getAllEpisodes } from '@/episodes/registry.ts'
import type { EpisodeConfig, MissionConfig } from '@/episodes/types.ts'
import { encodeLessonPlan, LESSON_PLAN_VERSION } from '@/utils/lesson-plan-codec.ts'
import type { LessonPlanConfig, LessonPlanEpisode } from '@/utils/lesson-plan-codec.ts'

export function LinkGenerator() {
  const episodes = getAllEpisodes()
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(new Set())
  const [selectedMissions, setSelectedMissions] = useState<Record<string, Set<string>>>({})
  const [generatedUrl, setGeneratedUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [title, setTitle] = useState('My Lesson Plan')

  const toggleEpisode = useCallback((episodeId: string) => {
    setSelectedEpisodes((prev) => {
      const next = new Set(prev)
      if (next.has(episodeId)) {
        next.delete(episodeId)
      } else {
        next.add(episodeId)
      }
      return next
    })
  }, [])

  const toggleMission = useCallback((episodeId: string, missionId: string) => {
    setSelectedMissions((prev) => {
      const episodeMissions = new Set(prev[episodeId] ?? [])
      if (episodeMissions.has(missionId)) {
        episodeMissions.delete(missionId)
      } else {
        episodeMissions.add(missionId)
      }
      return { ...prev, [episodeId]: episodeMissions }
    })
  }, [])

  const generateLink = useCallback(() => {
    const planEpisodes: LessonPlanEpisode[] = []
    const sequenceOrder: string[] = []

    for (const episodeId of selectedEpisodes) {
      const missions = selectedMissions[episodeId]
      planEpisodes.push({
        episodeId,
        missions: missions ? Array.from(missions) : [],
      })
      sequenceOrder.push(episodeId)
    }

    const config: LessonPlanConfig = {
      version: LESSON_PLAN_VERSION,
      title,
      episodes: planEpisodes,
      sequenceOrder,
    }

    const encoded = encodeLessonPlan(config)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const url = `${origin}${pathname}#/teach?plan=${encoded}`
    setGeneratedUrl(url)
    setCopied(false)
  }, [selectedEpisodes, selectedMissions, title])

  const copyToClipboard = useCallback(async () => {
    if (!generatedUrl) return
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select input text
      const input = document.querySelector<HTMLInputElement>('.link-gen__url-input')
      if (input) {
        input.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }, [generatedUrl])

  return (
    <section className="link-gen" aria-labelledby="link-gen-heading">
      <h2 id="link-gen-heading" className="link-gen__heading">
        Classroom Link Generator
      </h2>

      <div className="link-gen__field">
        <label htmlFor="lesson-title" className="link-gen__label">
          Lesson Title
        </label>
        <input
          id="lesson-title"
          type="text"
          className="link-gen__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <fieldset className="link-gen__fieldset">
        <legend className="link-gen__legend">Select Episodes</legend>
        {episodes.map((episode: EpisodeConfig) => (
          <div key={episode.id} className="link-gen__episode">
            <label className="link-gen__checkbox-label">
              <input
                type="checkbox"
                checked={selectedEpisodes.has(episode.id)}
                onChange={() => toggleEpisode(episode.id)}
              />
              <span>{episode.title}</span>
            </label>
            {selectedEpisodes.has(episode.id) && episode.missions.length > 0 && (
              <div
                className="link-gen__missions"
                role="group"
                aria-label={`Missions for ${episode.title}`}
              >
                {episode.missions.map((mission: MissionConfig) => (
                  <label
                    key={mission.id}
                    className="link-gen__checkbox-label link-gen__checkbox-label--mission"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMissions[episode.id]?.has(mission.id) ?? false}
                      onChange={() => toggleMission(episode.id, mission.id)}
                    />
                    <span>{mission.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </fieldset>

      <button
        type="button"
        className="link-gen__generate-btn"
        onClick={generateLink}
        disabled={selectedEpisodes.size === 0}
      >
        Generate Link
      </button>

      {generatedUrl && (
        <div className="link-gen__result">
          <label htmlFor="generated-url" className="link-gen__label">
            Generated URL
          </label>
          <div className="link-gen__url-row">
            <input
              id="generated-url"
              type="text"
              className="link-gen__url-input"
              value={generatedUrl}
              readOnly
            />
            <button type="button" className="link-gen__copy-btn" onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
