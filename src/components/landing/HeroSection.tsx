import { Button } from '@/components/ui/Button'
import { DomainOrbit } from '@/components/DomainOrbit'
import { useTranslation } from '@/i18n'
import './HeroSection.css'

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="hero" aria-labelledby="hero-headline">
      <DomainOrbit />
      <h1 id="hero-headline" className="hero-headline">
        {t('hero.headline')}
      </h1>
      <p className="hero-subhead">{t('hero.subheading')}</p>
      <Button
        variant="primary"
        size="lg"
        className="hero-cta"
        onClick={() => {
          document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        {t('hero.cta')}
      </Button>
    </section>
  )
}
