// src/features/video-call/processors/CombinedVideoTransformer.js
import { VideoTransformer, BackgroundTransformer } from "@livekit/track-processors"

export const DEFAULT_BEAUTY_OPTIONS = {
  smoothing: false,
  brightness: false,
  warmth: false,
  colorFilter: false,
}

export const DEFAULT_BG_OPTIONS = {
  backgroundDisabled: true,
  blurRadius: undefined,
  imagePath: undefined,
}

/**
 * A single VideoTransformer that handles beauty effects (Canvas 2D filters)
 * as a pre-processing step, then delegates to BackgroundTransformer for
 * background blur / virtual background.
 *
 * Both beauty and background can be active simultaneously.
 * When both are off the transform is a cheap passthrough via BackgroundTransformer.
 */
export class CombinedVideoTransformer extends VideoTransformer {
  _beautyOptions = { ...DEFAULT_BEAUTY_OPTIONS }
  _bgOptions = { ...DEFAULT_BG_OPTIONS }
  _bgTransformer = null
  _beautyCanvas = null
  _beautyCtx = null

  async init(opts) {
    await super.init(opts)
    this._bgTransformer = new BackgroundTransformer({ backgroundDisabled: true })
    await this._bgTransformer.init(opts)
    this._initBeautyCanvas()
  }

  async restart(opts) {
    await super.restart(opts)
    await this._bgTransformer?.restart(opts)
    this._initBeautyCanvas()
  }

  _initBeautyCanvas() {
    const w = this.canvas?.width || 1280
    const h = this.canvas?.height || 720
    if (typeof OffscreenCanvas !== "undefined") {
      this._beautyCanvas = new OffscreenCanvas(w, h)
    } else {
      this._beautyCanvas = document.createElement("canvas")
      this._beautyCanvas.width = w
      this._beautyCanvas.height = h
    }
    this._beautyCtx = this._beautyCanvas.getContext("2d")
  }

  _buildFilter() {
    const parts = []
    if (this._beautyOptions.smoothing) parts.push("blur(2px)")
    if (this._beautyOptions.brightness) parts.push("brightness(1.15)")
    if (this._beautyOptions.warmth) parts.push("sepia(0.2) saturate(1.15)")
    if (this._beautyOptions.colorFilter) parts.push("saturate(1.4) contrast(1.05)")
    return parts.length ? parts.join(" ") : "none"
  }

  _hasBeauty() {
    return Object.values(this._beautyOptions).some(Boolean)
  }

  async transform(frame, controller) {
    if (!this._hasBeauty()) {
      // No beauty — delegate entirely to bgTransformer (handles bg-on, bg-off, passthrough)
      await this._bgTransformer.transform(frame, controller)
      return
    }

    const ts = frame.timestamp
    const w = frame.displayWidth
    const h = frame.displayHeight

    // Resize intermediate canvas if needed
    if (this._beautyCanvas.width !== w) this._beautyCanvas.width = w
    if (this._beautyCanvas.height !== h) this._beautyCanvas.height = h

    // Draw frame with beauty filter onto intermediate canvas
    this._beautyCtx.filter = this._buildFilter()
    this._beautyCtx.drawImage(frame, 0, 0, w, h)
    frame.close()

    // Create beauty-processed VideoFrame and pass to bgTransformer
    // bgTransformer handles both "bg active" and "bg disabled" (passthrough) cases
    const beautyFrame = new VideoFrame(this._beautyCanvas, { timestamp: ts })
    await this._bgTransformer.transform(beautyFrame, controller)
  }

  update(opts) {
    if (opts.beautyOptions !== undefined) {
      this._beautyOptions = { ...this._beautyOptions, ...opts.beautyOptions }
    }
    if (opts.bgOptions !== undefined) {
      this._bgOptions = { ...this._bgOptions, ...opts.bgOptions }
      this._bgTransformer?.update(this._bgOptions)
    }
  }

  async destroy() {
    await this._bgTransformer?.destroy()
    await super.destroy()
  }
}
