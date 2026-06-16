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
 * as a pre-processing step, then optionally delegates to BackgroundTransformer
 * for background blur / virtual background.
 *
 * BackgroundTransformer is lazy-initialized only when a background effect is
 * actually requested, so beauty works independently of WebGL2 / MediaPipe CDN.
 */
export class CombinedVideoTransformer extends VideoTransformer {
  _beautyOptions = { ...DEFAULT_BEAUTY_OPTIONS }
  _bgOptions = { ...DEFAULT_BG_OPTIONS }

  // BackgroundTransformer is lazy: only created when background is actually needed
  _bgTransformer = null
  _bgTransformerReady = false
  _bgInitializing = false

  // Stored from init() so we can lazy-init BackgroundTransformer later
  _initOpts = null

  // Intermediate canvas for Canvas 2D beauty filters
  _beautyCanvas = null
  _beautyCtx = null

  async init(opts) {
    await super.init(opts)
    this._initOpts = opts
    this._initBeautyCanvas()
  }

  async restart(opts) {
    await super.restart(opts)
    this._initOpts = opts
    this._bgTransformerReady = false
    if (this._bgTransformer) {
      await this._bgTransformer.restart(opts)
      this._bgTransformerReady = true
    }
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

  /**
   * Lazy-initializes BackgroundTransformer using current _bgOptions.
   * Called only when a background effect is actually needed.
   */
  async _ensureBgTransformer() {
    if (this._bgTransformerReady || this._bgInitializing || !this._initOpts) return
    this._bgInitializing = true
    try {
      this._bgTransformer = new BackgroundTransformer({ ...this._bgOptions })
      await this._bgTransformer.init(this._initOpts)
      this._bgTransformerReady = true
    } catch (err) {
      console.error("[CombinedVideoTransformer] BackgroundTransformer init failed:", err)
      this._bgTransformer = null
    } finally {
      this._bgInitializing = false
    }
  }

  _buildFilter() {
    const parts = []
    if (this._beautyOptions.smoothing)    parts.push("blur(4px)")
    if (this._beautyOptions.brightness)   parts.push("brightness(1.2)")
    if (this._beautyOptions.warmth)       parts.push("sepia(0.35) saturate(1.3)")
    if (this._beautyOptions.colorFilter)  parts.push("saturate(1.5) contrast(1.1)")
    return parts.length ? parts.join(" ") : "none"
  }

  _hasBeauty() {
    return Object.values(this._beautyOptions).some(Boolean)
  }

  _hasBg() {
    return (
      !this._bgOptions.backgroundDisabled &&
      (typeof this._bgOptions.imagePath === "string" ||
        typeof this._bgOptions.blurRadius === "number")
    )
  }

  async transform(frame, controller) {
    const hasBeauty = this._hasBeauty()
    const hasBg = this._hasBg()

    // Passthrough: nothing to do
    if (!hasBeauty && !hasBg) {
      controller.enqueue(frame)
      return
    }

    if (hasBeauty) {
      const ts = frame.timestamp
      const w = frame.displayWidth
      const h = frame.displayHeight

      if (this._beautyCanvas.width !== w) this._beautyCanvas.width = w
      if (this._beautyCanvas.height !== h) this._beautyCanvas.height = h

      this._beautyCtx.filter = this._buildFilter()
      this._beautyCtx.drawImage(frame, 0, 0, w, h)
      frame.close()

      if (!hasBg) {
        // Beauty only — enqueue directly, no MediaPipe needed
        controller.enqueue(new VideoFrame(this._beautyCanvas, { timestamp: ts }))
        return
      }

      // Beauty + background — delegate beauty-processed frame to BackgroundTransformer
      await this._ensureBgTransformer()
      const beautyFrame = new VideoFrame(this._beautyCanvas, { timestamp: ts })
      if (this._bgTransformerReady) {
        await this._bgTransformer.transform(beautyFrame, controller)
      } else {
        controller.enqueue(beautyFrame)
      }
      return
    }

    // Background only (no beauty) — lazy-init and delegate
    await this._ensureBgTransformer()
    if (this._bgTransformerReady) {
      await this._bgTransformer.transform(frame, controller)
    } else {
      controller.enqueue(frame)
    }
  }

  update(opts) {
    if (opts.beautyOptions !== undefined) {
      this._beautyOptions = { ...this._beautyOptions, ...opts.beautyOptions }
    }
    if (opts.bgOptions !== undefined) {
      this._bgOptions = { ...this._bgOptions, ...opts.bgOptions }
      if (this._bgTransformerReady) {
        this._bgTransformer.update(this._bgOptions)
      }
    }
  }

  async destroy() {
    if (this._bgTransformerReady) {
      await this._bgTransformer?.destroy().catch(() => {})
    }
    await super.destroy()
  }
}

