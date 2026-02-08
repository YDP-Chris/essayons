import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCurrentRoute, navigate, subscribe } from './router.ts'

describe('router', () => {
  beforeEach(() => {
    // Reset hash before each test
    window.location.hash = ''
  })

  afterEach(() => {
    // Clean up hash after each test
    window.location.hash = ''
  })

  describe('getCurrentRoute', () => {
    it('returns landing route for empty hash', () => {
      window.location.hash = ''
      expect(getCurrentRoute()).toEqual({ route: 'landing', params: {} })
    })

    it('returns landing route for # hash', () => {
      window.location.hash = '#'
      expect(getCurrentRoute()).toEqual({ route: 'landing', params: {} })
    })

    it('returns landing route for #/ hash', () => {
      window.location.hash = '#/'
      expect(getCurrentRoute()).toEqual({ route: 'landing', params: {} })
    })

    it('returns landing route for / hash', () => {
      window.location.hash = '/'
      expect(getCurrentRoute()).toEqual({ route: 'landing', params: {} })
    })

    it('returns episode route for /#/episode/:id', () => {
      window.location.hash = '#/episode/orbit-lab'
      expect(getCurrentRoute()).toEqual({ route: 'episode', params: { id: 'orbit-lab' } })
    })

    it('returns episode route for #/episode/:id with different id', () => {
      window.location.hash = '#/episode/citizen-lab'
      expect(getCurrentRoute()).toEqual({ route: 'episode', params: { id: 'citizen-lab' } })
    })

    it('returns episode route ignoring query params', () => {
      window.location.hash = '#/episode/orbit-lab?param=value'
      expect(getCurrentRoute()).toEqual({ route: 'episode', params: { id: 'orbit-lab' } })
    })

    it('returns not-found route for unknown paths', () => {
      window.location.hash = '#/unknown'
      expect(getCurrentRoute()).toEqual({ route: 'not-found', params: {} })
    })

    it('returns not-found route for invalid episode path', () => {
      window.location.hash = '#/episode/'
      expect(getCurrentRoute()).toEqual({ route: 'not-found', params: {} })
    })

    it('returns not-found route for nested episode path', () => {
      window.location.hash = '#/episode/orbit-lab/extra'
      expect(getCurrentRoute()).toEqual({ route: 'not-found', params: {} })
    })
  })

  describe('navigate', () => {
    it('changes window.location.hash', () => {
      navigate('/')
      expect(window.location.hash).toBe('#/')
    })

    it('navigates to episode route', () => {
      navigate('/episode/orbit-lab')
      expect(window.location.hash).toBe('#/episode/orbit-lab')
    })

    it('adds leading slash if missing', () => {
      navigate('episode/orbit-lab')
      expect(window.location.hash).toBe('#/episode/orbit-lab')
    })

    it('scrolls to top', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo')
      navigate('/')
      expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
      scrollToSpy.mockRestore()
    })
  })

  describe('subscribe', () => {
    it('calls listener on hashchange', () => {
      const listener = vi.fn()
      const unsubscribe = subscribe(listener)

      // Change hash
      window.location.hash = '#/episode/orbit-lab'
      // Manually trigger hashchange event
      window.dispatchEvent(new HashChangeEvent('hashchange'))

      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
    })

    it('does not call listener after unsubscribe', () => {
      const listener = vi.fn()
      const unsubscribe = subscribe(listener)

      unsubscribe()

      window.location.hash = '#/episode/orbit-lab'
      window.dispatchEvent(new HashChangeEvent('hashchange'))

      expect(listener).not.toHaveBeenCalled()
    })

    it('supports multiple subscribers', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      const unsubscribe1 = subscribe(listener1)
      const unsubscribe2 = subscribe(listener2)

      window.location.hash = '#/episode/orbit-lab'
      window.dispatchEvent(new HashChangeEvent('hashchange'))

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)

      unsubscribe1()
      unsubscribe2()
    })

    it('removes hashchange listener when last subscriber unsubscribes', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      const unsubscribe1 = subscribe(listener1)
      const unsubscribe2 = subscribe(listener2)

      unsubscribe1()
      unsubscribe2()

      // After all unsubscribe, the event listener should be removed
      window.location.hash = '#/episode/orbit-lab'
      window.dispatchEvent(new HashChangeEvent('hashchange'))

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })
})
