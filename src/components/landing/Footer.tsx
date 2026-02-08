import { useTranslation } from '@/i18n'
import './Footer.css'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="landing-footer">
      <p className="footer-brand">
        <em>E</em>ssayons.
      </p>
      <p className="footer-tagline">{t('footer.tagline')}</p>
      <p className="footer-copyright">{t('footer.copyright').replace('{year}', String(year))}</p>
    </footer>
  )
}
