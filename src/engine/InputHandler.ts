/**
 * Maps physical inputs (keyboard, mouse, touch) to named actions.
 *
 * Tracks which actions are held, which were pressed this frame, and the
 * current pointer position in both screen and world coordinates.
 * Call `poll()` each frame to get a snapshot and clear per-frame data.
 */

import type { InputBinding, InputState, Vector2 } from './types.ts'
import type { CanvasRenderer } from './CanvasRenderer.ts'

export class InputHandler {
  private _bindings: InputBinding[] = []
  private _heldKeys: Set<string> = new Set()
  private _heldMouse: Set<string> = new Set()
  private _pressedThisFrame: Set<string> = new Set()
  private _pointerScreen: Vector2 | null = null
  private _element: HTMLElement | null = null
  private _renderer: CanvasRenderer | null = null

  // Pinch-to-zoom state
  private _pinchStartDistance: number | null = null
  private _pinchZoomDelta: number = 0

  // Bound event handlers for clean detach
  private _onKeyDown: ((e: KeyboardEvent) => void) | null = null
  private _onKeyUp: ((e: KeyboardEvent) => void) | null = null
  private _onMouseDown: ((e: MouseEvent) => void) | null = null
  private _onMouseUp: ((e: MouseEvent) => void) | null = null
  private _onMouseMove: ((e: MouseEvent) => void) | null = null
  private _onTouchStart: ((e: TouchEvent) => void) | null = null
  private _onTouchEnd: ((e: TouchEvent) => void) | null = null
  private _onTouchMove: ((e: TouchEvent) => void) | null = null

  /** Compute distance between two touch points. */
  private _touchDistance(t1: Touch, t2: Touch): number {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  /** Register input bindings (replaces any previous bindings). */
  registerBindings(bindings: ReadonlyArray<InputBinding>): void {
    this._bindings = [...bindings]
  }

  /** Set the renderer used for screen-to-world coordinate conversion. */
  setRenderer(renderer: CanvasRenderer): void {
    this._renderer = renderer
  }

  /** Attach event listeners to the given element. */
  attach(element: HTMLElement): void {
    this.detach()
    this._element = element

    this._onKeyDown = (e: KeyboardEvent) => {
      if (!this._heldKeys.has(e.code)) {
        this._heldKeys.add(e.code)
        // Check bindings for press
        for (const binding of this._bindings) {
          if (binding.keys?.includes(e.code)) {
            this._pressedThisFrame.add(binding.action)
          }
        }
      }
    }

    this._onKeyUp = (e: KeyboardEvent) => {
      this._heldKeys.delete(e.code)
    }

    this._onMouseDown = (e: MouseEvent) => {
      const btn = `mouse${e.button}`
      this._heldMouse.add(btn)
      for (const binding of this._bindings) {
        if (binding.mouse === btn) {
          this._pressedThisFrame.add(binding.action)
        }
      }
    }

    this._onMouseUp = (e: MouseEvent) => {
      const btn = `mouse${e.button}`
      this._heldMouse.delete(btn)
    }

    this._onMouseMove = (e: MouseEvent) => {
      const rect = this._element?.getBoundingClientRect()
      if (rect) {
        this._pointerScreen = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    }

    this._onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Start pinch tracking
        this._pinchStartDistance = this._touchDistance(e.touches[0]!, e.touches[1]!)
      } else if (e.touches.length === 1) {
        const touch = e.touches[0]!
        const rect = this._element?.getBoundingClientRect()
        if (rect) {
          this._pointerScreen = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          }
        }
        for (const binding of this._bindings) {
          if (binding.touch === 'tap') {
            this._pressedThisFrame.add(binding.action)
          }
        }
      }
    }

    this._onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        this._pinchStartDistance = null
      }
    }

    this._onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && this._pinchStartDistance !== null) {
        // Pinch gesture active
        const currentDistance = this._touchDistance(e.touches[0]!, e.touches[1]!)
        this._pinchZoomDelta +=
          (currentDistance - this._pinchStartDistance) / this._pinchStartDistance
        this._pinchStartDistance = currentDistance
      } else if (e.touches.length === 1) {
        const touch = e.touches[0]!
        const rect = this._element?.getBoundingClientRect()
        if (rect) {
          this._pointerScreen = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          }
        }
      }
    }

    // Use window for keyboard events (so they work even when canvas isn't focused)
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
    element.addEventListener('mousedown', this._onMouseDown)
    element.addEventListener('mouseup', this._onMouseUp)
    element.addEventListener('mousemove', this._onMouseMove)
    element.addEventListener('touchstart', this._onTouchStart)
    element.addEventListener('touchend', this._onTouchEnd)
    element.addEventListener('touchmove', this._onTouchMove)
  }

  /** Detach all event listeners. */
  detach(): void {
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown)
    }
    if (this._onKeyUp) {
      window.removeEventListener('keyup', this._onKeyUp)
    }
    if (this._element) {
      if (this._onMouseDown) {
        this._element.removeEventListener('mousedown', this._onMouseDown)
      }
      if (this._onMouseUp) {
        this._element.removeEventListener('mouseup', this._onMouseUp)
      }
      if (this._onMouseMove) {
        this._element.removeEventListener('mousemove', this._onMouseMove)
      }
      if (this._onTouchStart) {
        this._element.removeEventListener('touchstart', this._onTouchStart)
      }
      if (this._onTouchEnd) {
        this._element.removeEventListener('touchend', this._onTouchEnd)
      }
      if (this._onTouchMove) {
        this._element.removeEventListener('touchmove', this._onTouchMove)
      }
    }

    this._element = null
    this._onKeyDown = null
    this._onKeyUp = null
    this._onMouseDown = null
    this._onMouseUp = null
    this._onMouseMove = null
    this._onTouchStart = null
    this._onTouchEnd = null
    this._onTouchMove = null
    this._heldKeys.clear()
    this._heldMouse.clear()
    this._pressedThisFrame.clear()
    this._pointerScreen = null
    this._pinchStartDistance = null
    this._pinchZoomDelta = 0
  }

  /**
   * Poll for the current input state snapshot.
   * Clears per-frame pressed data after returning.
   */
  poll(): InputState {
    // Build the set of currently held actions
    const actionsHeld = new Set<string>()
    for (const binding of this._bindings) {
      // Check keyboard
      if (binding.keys) {
        for (const key of binding.keys) {
          if (this._heldKeys.has(key)) {
            actionsHeld.add(binding.action)
            break
          }
        }
      }
      // Check mouse
      if (binding.mouse && this._heldMouse.has(binding.mouse)) {
        actionsHeld.add(binding.action)
      }
    }

    // Compute world coordinates from screen pointer
    let pointerWorld: Vector2 | null = null
    if (this._pointerScreen && this._renderer) {
      pointerWorld = this._renderer.screenToWorld(this._pointerScreen.x, this._pointerScreen.y)
    }

    const state: InputState = {
      actionsHeld,
      actionsPressed: [...this._pressedThisFrame],
      pointerScreen: this._pointerScreen,
      pointerWorld,
      pinchZoom: this._pinchZoomDelta,
    }

    // Clear per-frame data
    this._pressedThisFrame.clear()
    this._pinchZoomDelta = 0

    return state
  }
}
