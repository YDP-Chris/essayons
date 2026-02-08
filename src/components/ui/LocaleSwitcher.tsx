import { useTranslation } from '@/i18n'
import { SUPPORTED_LOCALES, type LocaleCode } from '@/i18n'
import './LocaleSwitcher.css'

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useTranslation()

  return (
    <select
      className="locale-switcher"
      value={locale}
      onChange={(e) => setLocale(e.target.value as LocaleCode)}
      aria-label={t('locale.selectLanguage')}
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeName}
        </option>
      ))}
    </select>
  )
}
