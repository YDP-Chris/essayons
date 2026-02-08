import { Button } from '@/components/ui/Button'
import './HeroSection.css'

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-headline">
      <h1 id="hero-headline" className="hero-headline">
        Learn by crashing into things.
      </h1>
      <p className="hero-subhead">
        Interactive simulations that teach physics, civics, economics, history, and
        more&mdash;through hands-on exploration.
      </p>
      <Button
        variant="primary"
        size="lg"
        className="hero-cta"
        onClick={() => {
          document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        Start Exploring
      </Button>
    </section>
  )
}
