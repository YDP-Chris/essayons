/**
 * Episode sequence builder component.
 *
 * Allows teachers to build an ordered playlist of episodes,
 * reorder them with Move Up / Move Down buttons, and add/remove episodes.
 */

import { useState, useCallback } from 'react'
import { getAllEpisodes } from '@/episodes/registry.ts'
import type { EpisodeConfig } from '@/episodes/types.ts'

interface SequenceBuilderProps {
  readonly sequence: readonly string[]
  readonly onSequenceChange: (sequence: string[]) => void
}

export function SequenceBuilder({ sequence, onSequenceChange }: SequenceBuilderProps) {
  const allEpisodes = getAllEpisodes()
  const [addEpisodeId, setAddEpisodeId] = useState('')

  const episodeMap = new Map<string, EpisodeConfig>()
  for (const ep of allEpisodes) {
    episodeMap.set(ep.id, ep)
  }

  const availableEpisodes = allEpisodes.filter((ep) => !sequence.includes(ep.id))

  const moveUp = useCallback(
    (index: number) => {
      if (index <= 0) return
      const next = [...sequence]
      const item = next[index]!
      next[index] = next[index - 1]!
      next[index - 1] = item
      onSequenceChange(next)
    },
    [sequence, onSequenceChange],
  )

  const moveDown = useCallback(
    (index: number) => {
      if (index >= sequence.length - 1) return
      const next = [...sequence]
      const item = next[index]!
      next[index] = next[index + 1]!
      next[index + 1] = item
      onSequenceChange(next)
    },
    [sequence, onSequenceChange],
  )

  const removeEpisode = useCallback(
    (index: number) => {
      const next = sequence.filter((_, i) => i !== index)
      onSequenceChange([...next])
    },
    [sequence, onSequenceChange],
  )

  const addEpisode = useCallback(() => {
    if (!addEpisodeId) return
    onSequenceChange([...sequence, addEpisodeId])
    setAddEpisodeId('')
  }, [addEpisodeId, sequence, onSequenceChange])

  return (
    <section className="seq-builder" aria-labelledby="seq-builder-heading">
      <h2 id="seq-builder-heading" className="seq-builder__heading">
        Episode Sequence Builder
      </h2>

      {sequence.length === 0 ? (
        <p className="seq-builder__empty">No episodes in sequence. Add one below.</p>
      ) : (
        <ol className="seq-builder__list" aria-label="Episode sequence">
          {sequence.map((episodeId, index) => {
            const episode = episodeMap.get(episodeId)
            return (
              <li key={episodeId} className="seq-builder__item">
                <span className="seq-builder__number">{index + 1}</span>
                <span className="seq-builder__title">{episode?.title ?? episodeId}</span>
                <div className="seq-builder__actions">
                  <button
                    type="button"
                    className="seq-builder__btn"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    aria-label={`Move ${episode?.title ?? episodeId} up`}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="seq-builder__btn"
                    onClick={() => moveDown(index)}
                    disabled={index === sequence.length - 1}
                    aria-label={`Move ${episode?.title ?? episodeId} down`}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="seq-builder__btn seq-builder__btn--remove"
                    onClick={() => removeEpisode(index)}
                    aria-label={`Remove ${episode?.title ?? episodeId}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {availableEpisodes.length > 0 && (
        <div className="seq-builder__add-row">
          <label htmlFor="add-episode-select" className="seq-builder__label">
            Add episode
          </label>
          <select
            id="add-episode-select"
            className="seq-builder__select"
            value={addEpisodeId}
            onChange={(e) => setAddEpisodeId(e.target.value)}
          >
            <option value="">-- Select --</option>
            {availableEpisodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="seq-builder__add-btn"
            onClick={addEpisode}
            disabled={!addEpisodeId}
          >
            Add
          </button>
        </div>
      )}
    </section>
  )
}
