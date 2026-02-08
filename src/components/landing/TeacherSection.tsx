import { navigate } from '@/shared/router/router.ts'
import { useTranslation } from '@/i18n'
import './TeacherSection.css'

export function TeacherSection() {
  const { t } = useTranslation()

  return (
    <section className="teacher-section" aria-labelledby="teacher-heading">
      <div className="teacher-inner">
        <h2 id="teacher-heading" className="text-h1 teacher-heading">
          {t('teacher.forEducators')}
        </h2>
        <p className="teacher-description">{t('teacher.description')}</p>
        <ul className="teacher-features">
          <li className="teacher-feature">
            <span className="teacher-feature-icon" aria-hidden="true">
              {'\u{1F517}'}
            </span>
            <span>{t('teacher.instantDeployment')}</span>
          </li>
          <li className="teacher-feature">
            <span className="teacher-feature-icon" aria-hidden="true">
              {'\u{1F4B0}'}
            </span>
            <span>{t('teacher.freeForAll')}</span>
          </li>
          <li className="teacher-feature">
            <span className="teacher-feature-icon" aria-hidden="true">
              {'\u{1F512}'}
            </span>
            <span>{t('teacher.noAccounts')}</span>
          </li>
        </ul>
        <button type="button" className="teacher-tools-link" onClick={() => navigate('/teach')}>
          {t('teacher.teacherTools')}
        </button>
      </div>
    </section>
  )
}
