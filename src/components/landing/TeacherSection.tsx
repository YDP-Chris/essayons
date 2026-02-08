import './TeacherSection.css'

export function TeacherSection() {
  return (
    <section className="teacher-section" aria-labelledby="teacher-heading">
      <div className="teacher-inner">
        <h2 id="teacher-heading" className="text-h1 teacher-heading">
          For educators
        </h2>
        <p className="teacher-description">
          Share a link, and your students are learning. No setup, no accounts, no IT requests.
          Essayons is free and instant.
        </p>
        <ul className="teacher-features" role="list">
          <li className="teacher-feature">
            <span className="teacher-feature-icon" aria-hidden="true">
              {'\u{1F517}'}
            </span>
            <span>Instant deployment — just share a URL</span>
          </li>
          <li className="teacher-feature">
            <span className="teacher-feature-icon" aria-hidden="true">
              {'\u{1F4B0}'}
            </span>
            <span>Free for students and teachers</span>
          </li>
          <li className="teacher-feature">
            <span className="teacher-feature-icon" aria-hidden="true">
              {'\u{1F512}'}
            </span>
            <span>No accounts or personal data required</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
