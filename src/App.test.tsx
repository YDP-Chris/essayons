import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    // Reset hash to landing page before each test
    window.location.hash = ''
  })

  it('renders without crashing', () => {
    render(<App />)
    const matches = screen.getAllByText(/ssayons/)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders the hero headline', () => {
    render(<App />)
    expect(screen.getByText('Learn by crashing into things.')).toBeInTheDocument()
  })

  it('renders the Start Exploring CTA', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Start Exploring' })).toBeInTheDocument()
  })

  it('renders all episode cards', () => {
    render(<App />)
    expect(screen.getByText('Orbit Lab')).toBeInTheDocument()
    expect(screen.getByText('Citizen Lab')).toBeInTheDocument()
    expect(screen.getByText('Market Lab')).toBeInTheDocument()
    expect(screen.getByText('Timeline Lab')).toBeInTheDocument()
    expect(screen.getByText('Wave Lab')).toBeInTheDocument()
    expect(screen.getByText('Gene Lab')).toBeInTheDocument()
    expect(screen.getByText('Bridge Lab')).toBeInTheDocument()
  })

  it('all episodes are available (no Coming Soon badges)', () => {
    render(<App />)
    const badges = screen.queryAllByText('Coming Soon')
    expect(badges).toHaveLength(0)
  })

  it('makes Orbit Lab clickable', () => {
    render(<App />)
    const orbitButton = screen.getByText('Orbit Lab').closest('button')
    expect(orbitButton).not.toBeNull()
    expect(orbitButton).toBeInTheDocument()
  })

  it('renders the three value propositions', () => {
    render(<App />)
    expect(screen.getByText('Real Computation')).toBeInTheDocument()
    expect(screen.getByText('Zero Friction')).toBeInTheDocument()
    expect(screen.getByText('Any Domain')).toBeInTheDocument()
  })

  it('renders the teacher section', () => {
    render(<App />)
    expect(screen.getByText('For educators')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<App />)
    expect(screen.getByText('Let us try.')).toBeInTheDocument()
  })

  it('has a skip-to-content link', () => {
    render(<App />)
    const skipLink = screen.getByText('Skip to content')
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('uses semantic main landmark', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders site header on landing page', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders site header with nav links on landing page', () => {
    render(<App />)
    // Nav links appear in both desktop and mobile sections of the header
    const episodesLinks = screen.getAllByText('Episodes')
    expect(episodesLinks.length).toBeGreaterThanOrEqual(1)
    const teachLinks = screen.getAllByText('Teacher Dashboard')
    expect(teachLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders compact site header on episode route', () => {
    window.location.hash = '#/episode/orbit-lab'
    render(<App />)
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    expect(header.className).toContain('site-header--compact')
  })
})
