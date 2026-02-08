import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { App } from './App'

describe('App', () => {
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

  it('renders all six episode cards', () => {
    render(<App />)
    expect(screen.getByText('Orbit Lab')).toBeInTheDocument()
    expect(screen.getByText('Citizen Lab')).toBeInTheDocument()
    expect(screen.getByText('Market Lab')).toBeInTheDocument()
    expect(screen.getByText('History Lab')).toBeInTheDocument()
    expect(screen.getByText('Gene Lab')).toBeInTheDocument()
    expect(screen.getByText('Bridge Lab')).toBeInTheDocument()
  })

  it('shows Coming Soon badges for unavailable episodes', () => {
    render(<App />)
    const badges = screen.getAllByText('Coming Soon')
    expect(badges).toHaveLength(5)
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
})
