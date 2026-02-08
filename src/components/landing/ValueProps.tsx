import './ValueProps.css'

interface Pillar {
  icon: string
  title: string
  description: string
}

const pillars: Pillar[] = [
  {
    icon: '\u2699\uFE0F',
    title: 'Real Computation',
    description:
      'Every simulation runs real models. Gravity, elections, markets\u2014computed live, not canned animations.',
  },
  {
    icon: '\u26A1',
    title: 'Zero Friction',
    description:
      'No accounts, no installs, no waiting. Click a link and start learning in seconds.',
  },
  {
    icon: '\u{1F30D}',
    title: 'Any Domain',
    description:
      'Physics today, civics tomorrow. One platform, many disciplines\u2014all through hands-on exploration.',
  },
]

export function ValueProps() {
  return (
    <section className="value-props" aria-labelledby="value-props-heading">
      <h2 id="value-props-heading" className="text-h1 value-props-heading">
        Why Essayons?
      </h2>
      <div className="value-props-grid">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="value-prop">
            <div className="value-prop-icon" aria-hidden="true">
              {pillar.icon}
            </div>
            <h3 className="value-prop-title">{pillar.title}</h3>
            <p className="value-prop-description">{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
