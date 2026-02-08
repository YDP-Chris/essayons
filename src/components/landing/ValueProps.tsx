import { useTranslation } from '@/i18n'
import './ValueProps.css'

interface Pillar {
  icon: string
  titleKey: string
  descriptionKey: string
}

const pillars: Pillar[] = [
  {
    icon: '\u2699\uFE0F',
    titleKey: 'valueProps.realComputation.title',
    descriptionKey: 'valueProps.realComputation.description',
  },
  {
    icon: '\u26A1',
    titleKey: 'valueProps.zeroFriction.title',
    descriptionKey: 'valueProps.zeroFriction.description',
  },
  {
    icon: '\u{1F30D}',
    titleKey: 'valueProps.anyDomain.title',
    descriptionKey: 'valueProps.anyDomain.description',
  },
]

export function ValueProps() {
  const { t } = useTranslation()

  return (
    <section className="value-props" aria-labelledby="value-props-heading">
      <h2 id="value-props-heading" className="text-h1 value-props-heading">
        {t('valueProps.whyEssayons')}
      </h2>
      <div className="value-props-grid">
        {pillars.map((pillar) => (
          <div key={pillar.titleKey} className="value-prop">
            <div className="value-prop-icon" aria-hidden="true">
              {pillar.icon}
            </div>
            <h3 className="value-prop-title">{t(pillar.titleKey)}</h3>
            <p className="value-prop-description">{t(pillar.descriptionKey)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
