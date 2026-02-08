/**
 * ReferencePanel — renders educational reference content from episode config.
 *
 * Displays reference cards organized by category (concept, equation,
 * history, fun-fact) in a tabbed view. Each card is collapsible and
 * renders its content as plain text (markdown rendering can be added
 * when a markdown library is integrated).
 */

import { useState, useCallback } from 'react'
import type { ReferenceConfig, ReferenceCategory } from './types.ts'
import { Card } from '@/components/ui/Card.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { useTranslation } from '@/i18n'
import './ReferencePanel.css'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReferencePanelProps {
  readonly references: readonly ReferenceConfig[]
}

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

interface CategoryTab {
  readonly key: ReferenceCategory
  readonly labelKey: string
}

const CATEGORY_TABS: readonly CategoryTab[] = [
  { key: 'concept', labelKey: 'referenceCategories.concept' },
  { key: 'equation', labelKey: 'referenceCategories.equation' },
  { key: 'history', labelKey: 'referenceCategories.history' },
  { key: 'fun-fact', labelKey: 'referenceCategories.fun-fact' },
] as const

// ---------------------------------------------------------------------------
// Collapsible reference item
// ---------------------------------------------------------------------------

interface ReferenceItemProps {
  readonly reference: ReferenceConfig
}

function ReferenceItem({ reference }: ReferenceItemProps) {
  const [expanded, setExpanded] = useState(false)

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return (
    <div className="reference-panel__item" data-expanded={expanded}>
      <button
        className="reference-panel__item-header"
        onClick={toggle}
        aria-expanded={expanded}
        type="button"
      >
        <span className="reference-panel__item-title">{reference.title}</span>
        <span className="reference-panel__item-chevron" aria-hidden="true">
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </button>
      {expanded && (
        <div className="reference-panel__item-body">
          <p className="reference-panel__item-content">{reference.content}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ReferencePanel({ references }: ReferencePanelProps) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<ReferenceCategory>('concept')

  // Only show tabs that have at least one reference
  const availableTabs = CATEGORY_TABS.filter((tab) =>
    references.some((ref) => ref.category === tab.key),
  )

  const filteredRefs = references.filter((ref) => ref.category === activeCategory)

  if (references.length === 0) {
    return null
  }

  // If active tab has no items, switch to first available
  const effectiveCategory =
    filteredRefs.length > 0 ? activeCategory : (availableTabs[0]?.key ?? 'concept')

  const displayRefs =
    effectiveCategory === activeCategory
      ? filteredRefs
      : references.filter((ref) => ref.category === effectiveCategory)

  return (
    <Card
      header={<h2 className="reference-panel__title">{t('panels.reference')}</h2>}
      className="reference-panel"
    >
      {availableTabs.length > 1 && (
        <div
          className="reference-panel__tabs"
          role="tablist"
          aria-label={t('panels.referenceCategories')}
        >
          {availableTabs.map((tab) => (
            <Button
              key={tab.key}
              role="tab"
              aria-selected={effectiveCategory === tab.key || undefined}
              variant={effectiveCategory === tab.key ? 'primary' : 'ghost'}
              size="sm"
              className="reference-panel__tab"
              onClick={() => setActiveCategory(tab.key)}
            >
              {t(tab.labelKey)}
            </Button>
          ))}
        </div>
      )}

      <div className="reference-panel__list" role="tabpanel">
        {displayRefs.length > 0 ? (
          displayRefs.map((ref) => <ReferenceItem key={ref.id} reference={ref} />)
        ) : (
          <p className="reference-panel__empty">{t('panels.noReferenceContent')}</p>
        )}
      </div>
    </Card>
  )
}
