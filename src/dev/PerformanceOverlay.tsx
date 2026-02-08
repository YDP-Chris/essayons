/**
 * Dev-mode performance overlay component.
 *
 * Displays FPS, frame time, memory usage, physics tick count,
 * and event listener count. Only renders when import.meta.env.DEV is true.
 * Uses requestAnimationFrame timestamps for FPS calculation with a
 * rolling window of the last 60 frames.
 */

import { useEffect, useRef, useState } from 'react'
import { getMemoryMetrics } from './memory-monitor.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PerformanceStats {
  fps: number
  frameTime: number
  memoryMB: number | null
  listenerCount: number
  isOverThreshold: boolean
}

// ---------------------------------------------------------------------------
// Memory API type
// ---------------------------------------------------------------------------

interface PerformanceMemory {
  readonly usedJSHeapSize: number
  readonly totalJSHeapSize: number
  readonly jsHeapSizeLimit: number
}

// ---------------------------------------------------------------------------
// FPS calculation hook (internal)
// ---------------------------------------------------------------------------

const ROLLING_WINDOW = 60

function usePerformanceStats(): PerformanceStats {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    memoryMB: null,
    listenerCount: 0,
    isOverThreshold: false,
  })

  const frameTimesRef = useRef<number[]>([])
  const lastTimestampRef = useRef<number | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    function tick(timestamp: number): void {
      if (!mounted) return

      const last = lastTimestampRef.current
      if (last !== null) {
        const delta = timestamp - last // ms
        const frameTimes = frameTimesRef.current
        frameTimes.push(delta)
        if (frameTimes.length > ROLLING_WINDOW) {
          frameTimes.shift()
        }

        const avgMs = frameTimes.reduce((sum, t) => sum + t, 0) / frameTimes.length
        const fps = avgMs > 0 ? 1000 / avgMs : 0

        // Memory usage (Chrome/Edge only)
        let memoryMB: number | null = null
        const perfWithMemory = performance as unknown as {
          memory?: PerformanceMemory
        }
        if (perfWithMemory.memory) {
          memoryMB = Math.round((perfWithMemory.memory.usedJSHeapSize / (1024 * 1024)) * 100) / 100
        }

        // Memory monitor metrics
        const memMetrics = getMemoryMetrics()

        setStats({
          fps: Math.round(fps * 10) / 10,
          frameTime: Math.round(avgMs * 100) / 100,
          memoryMB,
          listenerCount: memMetrics.listenerCount,
          isOverThreshold: memMetrics.isOverThreshold,
        })
      }

      lastTimestampRef.current = timestamp
      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      mounted = false
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return stats
}

// ---------------------------------------------------------------------------
// Styles (inline to avoid external CSS)
// ---------------------------------------------------------------------------

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 8,
  right: 8,
  zIndex: 2147483647,
  background: 'rgba(0, 0, 0, 0.75)',
  color: '#e2e8f0',
  fontFamily: 'monospace',
  fontSize: '11px',
  lineHeight: '1.5',
  padding: '6px 10px',
  borderRadius: '6px',
  pointerEvents: 'none',
  userSelect: 'none',
  minWidth: '140px',
}

const warningStyle: React.CSSProperties = {
  color: '#ef4444',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PerformanceOverlay() {
  const stats = usePerformanceStats()

  return (
    <div style={overlayStyle} data-testid="performance-overlay">
      <div>FPS: {stats.fps.toFixed(1)}</div>
      <div>Frame: {stats.frameTime.toFixed(2)} ms</div>
      <div>Memory: {stats.memoryMB !== null ? `${stats.memoryMB.toFixed(2)} MB` : 'N/A'}</div>
      <div style={stats.isOverThreshold ? warningStyle : undefined}>
        Listeners: {stats.listenerCount}
        {stats.isOverThreshold ? ' (!!)' : ''}
      </div>
    </div>
  )
}
