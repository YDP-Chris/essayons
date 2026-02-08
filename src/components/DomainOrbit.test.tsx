import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DomainOrbit } from './DomainOrbit'

describe('DomainOrbit', () => {
  it('renders without crashing', () => {
    const { container } = render(<DomainOrbit />)
    expect(container).toBeTruthy()
  })

  it('renders the center logo with "E"', () => {
    const { container } = render(<DomainOrbit />)
    const logo = container.querySelector('.domain-orbit__logo')
    expect(logo).toBeTruthy()
    expect(logo?.textContent).toBe('E')
  })

  it('renders 3 orbit rings', () => {
    const { container } = render(<DomainOrbit />)
    const rings = container.querySelectorAll('.domain-orbit__ring')
    expect(rings.length).toBe(3)
  })

  it('renders 6 domain nodes', () => {
    const { container } = render(<DomainOrbit />)
    const nodes = container.querySelectorAll('.domain-orbit__node')
    expect(nodes.length).toBe(6)
  })

  it('has aria-hidden="true" on the container', () => {
    const { container } = render(<DomainOrbit />)
    const orbit = container.querySelector('.domain-orbit')
    expect(orbit?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders ring 1 with 2 nodes', () => {
    const { container } = render(<DomainOrbit />)
    const ring1 = container.querySelector('.domain-orbit__ring--1')
    const ring1Nodes = ring1?.querySelectorAll('.domain-orbit__node')
    expect(ring1Nodes?.length).toBe(2)
  })

  it('renders ring 2 with 2 nodes', () => {
    const { container } = render(<DomainOrbit />)
    const ring2 = container.querySelector('.domain-orbit__ring--2')
    const ring2Nodes = ring2?.querySelectorAll('.domain-orbit__node')
    expect(ring2Nodes?.length).toBe(2)
  })

  it('renders ring 3 with 2 nodes', () => {
    const { container } = render(<DomainOrbit />)
    const ring3 = container.querySelector('.domain-orbit__ring--3')
    const ring3Nodes = ring3?.querySelectorAll('.domain-orbit__node')
    expect(ring3Nodes?.length).toBe(2)
  })
})
