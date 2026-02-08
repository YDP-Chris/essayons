/**
 * Layered 2D Canvas renderer with responsive sizing and viewport controls.
 *
 * Manages an ordered stack of render layers (background, simulation objects,
 * effects, UI overlays). Each layer's draw function receives a RenderContext
 * with the 2D canvas context, viewport transform, and simulation time.
 * Layers are drawn in ascending z-index order.
 */

import type {
  RenderContext,
  RenderLayer,
  ViewportTransform,
  PhysicsState,
  ParamValues,
  Vector2,
} from './types.ts'

/** Internal mutable render layer entry. */
interface LayerEntry {
  readonly name: string
  readonly zIndex: number
  readonly render: RenderLayer['render']
}

export class CanvasRenderer {
  private _canvas: HTMLCanvasElement | null = null
  private _ctx: CanvasRenderingContext2D | null = null
  private _layers: LayerEntry[] = []
  private _width = 0
  private _height = 0
  private _dpr = 1
  private _resizeObserver: ResizeObserver | null = null

  // Viewport / camera state
  private _offsetX = 0
  private _offsetY = 0
  private _scale = 1

  // ---- Lifecycle ----

  /** Attach to a canvas element and begin observing its container for resizes. */
  attach(canvas: HTMLCanvasElement): void {
    this._canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context from canvas')
    this._ctx = ctx

    this._dpr = window.devicePixelRatio || 1
    this._updateSize()

    this._resizeObserver = new ResizeObserver(() => {
      this._updateSize()
    })

    const parent = canvas.parentElement
    if (parent) {
      this._resizeObserver.observe(parent)
    }
  }

  /** Detach from the canvas and stop observing. */
  detach(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }
    this._canvas = null
    this._ctx = null
    this._layers = []
  }

  // ---- Layer Management ----

  /** Add a render layer. Layers are drawn in ascending z-index order. */
  addLayer(name: string, zIndex: number, render: RenderLayer['render']): void {
    // Remove any existing layer with the same name
    this._layers = this._layers.filter((l) => l.name !== name)
    this._layers.push({ name, zIndex, render })
    this._layers.sort((a, b) => a.zIndex - b.zIndex)
  }

  /** Remove a render layer by name. */
  removeLayer(name: string): void {
    this._layers = this._layers.filter((l) => l.name !== name)
  }

  // ---- Viewport / Camera ----

  /** Get the current viewport transform. */
  getViewport(): ViewportTransform {
    return {
      offsetX: this._offsetX,
      offsetY: this._offsetY,
      scale: this._scale,
    }
  }

  /** Set the viewport offset (pan). */
  setOffset(x: number, y: number): void {
    this._offsetX = x
    this._offsetY = y
  }

  /** Set the zoom scale (pixels per world unit). */
  setScale(scale: number): void {
    this._scale = Math.max(0.001, scale)
  }

  /** Pan the viewport by a delta in screen pixels. */
  pan(dx: number, dy: number): void {
    this._offsetX += dx
    this._offsetY += dy
  }

  /** Zoom in/out by a factor, centered on a screen point. */
  zoom(factor: number, centerX: number, centerY: number): void {
    const newScale = Math.max(0.001, this._scale * factor)
    // Adjust offset so the world point under (centerX, centerY) stays fixed
    this._offsetX = centerX - (centerX - this._offsetX) * (newScale / this._scale)
    this._offsetY = centerY - (centerY - this._offsetY) * (newScale / this._scale)
    this._scale = newScale
  }

  // ---- Coordinate Transforms ----

  /** Convert screen (CSS pixel) coordinates to world coordinates. */
  screenToWorld(screenX: number, screenY: number): Vector2 {
    return {
      x: (screenX - this._offsetX) / this._scale,
      y: (screenY - this._offsetY) / this._scale,
    }
  }

  /** Convert world coordinates to screen (CSS pixel) coordinates. */
  worldToScreen(worldX: number, worldY: number): Vector2 {
    return {
      x: worldX * this._scale + this._offsetX,
      y: worldY * this._scale + this._offsetY,
    }
  }

  // ---- Rendering ----

  /** Render all layers for the current frame. */
  render(
    state: PhysicsState,
    params: ParamValues,
    simulationTime: number,
    deltaTime: number,
  ): void {
    const ctx = this._ctx
    if (!ctx) return

    // Clear the canvas
    ctx.save()
    ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0)
    ctx.clearRect(0, 0, this._width, this._height)
    ctx.restore()

    const renderContext: RenderContext = {
      ctx,
      viewport: this.getViewport(),
      width: this._width,
      height: this._height,
      simulationTime,
      deltaTime,
    }

    // Draw each layer in z-index order
    for (const layer of this._layers) {
      ctx.save()
      // Apply device pixel ratio scaling so draw calls use CSS pixels
      ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0)
      layer.render(renderContext, state, params)
      ctx.restore()
    }
  }

  /** Get the current canvas dimensions in CSS pixels. */
  getSize(): { width: number; height: number } {
    return { width: this._width, height: this._height }
  }

  // ---- Internal ----

  private _updateSize(): void {
    const canvas = this._canvas
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    this._dpr = window.devicePixelRatio || 1
    this._width = parent.clientWidth
    this._height = parent.clientHeight

    // Set CSS size
    canvas.style.width = `${this._width}px`
    canvas.style.height = `${this._height}px`

    // Set backing buffer size for crisp rendering
    canvas.width = Math.round(this._width * this._dpr)
    canvas.height = Math.round(this._height * this._dpr)
  }
}
