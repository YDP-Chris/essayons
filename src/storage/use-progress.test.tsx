import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ProgressProvider } from './ProgressProvider.tsx'
import { useProgress } from './use-progress.tsx'
import { ProgressStorageService } from './progress-storage.ts'

// ---------------------------------------------------------------------------
// Test helper component that exposes hook values
// ---------------------------------------------------------------------------

function TestConsumer() {
  const {
    markMissionComplete,
    isMissionComplete,
    getCompletedMissions,
    recordEpisodeVisit,
    getEpisodeVisits,
    isReturnVisit,
  } = useProgress()

  return (
    <div>
      <span data-testid="is-complete">{String(isMissionComplete('ep1', 'm1'))}</span>
      <span data-testid="completed-list">{getCompletedMissions('ep1').join(',')}</span>
      <span data-testid="return-visit">{String(isReturnVisit())}</span>
      <span data-testid="visits">{JSON.stringify(getEpisodeVisits())}</span>
      <button data-testid="complete-btn" onClick={() => markMissionComplete('ep1', 'm1')} />
      <button data-testid="visit-btn" onClick={() => recordEpisodeVisit('ep1')} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useProgress hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides initial empty state', () => {
    render(
      <ProgressProvider>
        <TestConsumer />
      </ProgressProvider>,
    )
    expect(screen.getByTestId('is-complete').textContent).toBe('false')
    expect(screen.getByTestId('completed-list').textContent).toBe('')
    expect(screen.getByTestId('return-visit').textContent).toBe('false')
  })

  it('re-renders when a mission is marked complete', () => {
    render(
      <ProgressProvider>
        <TestConsumer />
      </ProgressProvider>,
    )
    expect(screen.getByTestId('is-complete').textContent).toBe('false')

    act(() => {
      screen.getByTestId('complete-btn').click()
    })

    expect(screen.getByTestId('is-complete').textContent).toBe('true')
    expect(screen.getByTestId('completed-list').textContent).toBe('m1')
  })

  it('re-renders when an episode visit is recorded', () => {
    render(
      <ProgressProvider>
        <TestConsumer />
      </ProgressProvider>,
    )

    act(() => {
      screen.getByTestId('visit-btn').click()
    })

    const visits = JSON.parse(screen.getByTestId('visits').textContent ?? '{}') as Record<
      string,
      unknown
    >
    expect(visits['ep1']).toBeDefined()
  })

  it('accepts an injected service instance', () => {
    const service = new ProgressStorageService()
    service.markMissionComplete('ep1', 'm1')

    render(
      <ProgressProvider service={service}>
        <TestConsumer />
      </ProgressProvider>,
    )

    expect(screen.getByTestId('is-complete').textContent).toBe('true')
  })

  it('throws when used outside ProgressProvider', () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useProgress must be used within a <ProgressProvider>',
    )
    spy.mockRestore()
  })
})
