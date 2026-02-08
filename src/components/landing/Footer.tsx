import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="landing-footer">
      <p className="footer-brand">
        <em>E</em>ssayons.
      </p>
      <p className="footer-tagline">Let us try.</p>
      <p className="footer-copyright">&copy; {year} Essayons. All rights reserved.</p>
    </footer>
  )
}
