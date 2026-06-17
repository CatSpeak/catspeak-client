// src/features/video-call/processors/CombinedVideoTransformer.js
import { VideoTransformer, BackgroundTransformer } from "@livekit/track-processors"
import {
  FaceMeshProcessor,
  FACE_OVAL,
  LEFT_EYE,
  RIGHT_EYE,
  createFeatheredMask,
} from "./FaceMeshProcessor"

export const DEFAULT_BEAUTY_OPTIONS = {
  smoothing: 0,
  brightness: 0,
  warmth: 0,
  colorFilter: 0,
  faceSlim: 0,       // 0-100 — face-aware, requires MediaPipe
  eyeEnlarge: 0,     // 0-100 — face-aware, requires MediaPipe
  eyeBrighten: 0,
  teethWhiten: 0,
}

export const DEFAULT_BG_OPTIONS = {
  backgroundDisabled: true,
  blurRadius: undefined,
  imagePath: undefined,
}

/**
 * A single VideoTransformer that handles beauty effects (Canvas 2D filters +
 * face-aware targeted effects via MediaPipe Face Mesh) as a pre-processing step,
 * then optionally delegates to BackgroundTransformer for background blur / virtual
 * background.
 *
 * BackgroundTransformer and FaceMeshProcessor are lazy-initialized only when
 * actually needed, so basic beauty works independently of WebGL2 / MediaPipe CDN.
 */
export class CombinedVideoTransformer extends VideoTransformer {
  _beautyOptions = { ...DEFAULT_BEAUTY_OPTIONS }
  _bgOptions = { ...DEFAULT_BG_OPTIONS }

  // ── BackgroundTransformer (lazy) ──────────────────────────────────────────
  _bgTransformer = null
  _bgTransformerReady = false
  _bgInitializing = false

  // ── FaceMeshProcessor (lazy) ──────────────────────────────────────────────
  _faceMesh = null
  _faceMeshReady = false
  _faceMeshInitializing = false

  // ── Stored init options for lazy-init ─────────────────────────────────────
  _initOpts = null

  // ── Beauty intermediate canvas ────────────────────────────────────────────
  _beautyCanvas = null
  _beautyCtx = null

  // ── Scratch canvases for face-aware effects (allocated once) ──────────────
  _scratchCanvas = null
  _scratchCtx = null
  _maskCanvas = null
  _maskCtx = null

  async init(opts) {
    await super.init(opts)
    this._initOpts = opts
    this._initBeautyCanvas()
  }

  async restart(opts) {
    await super.restart(opts)
    this._initOpts = opts
    this._bgTransformerReady = false
    this._faceMeshReady = false
    if (this._bgTransformer) {
      await this._bgTransformer.restart(opts)
      this._bgTransformerReady = true
    }
    if (this._faceMesh) {
      await this._faceMesh.restart()
      this._faceMeshReady = this._faceMesh.initialized
    }
    this._initBeautyCanvas()
  }

  _initBeautyCanvas() {
    const w = this.canvas?.width || 1280
    const h = this.canvas?.height || 720
    const OffCtor =
      typeof OffscreenCanvas !== "undefined"
        ? OffscreenCanvas
        : (w, h) => {
            const c = document.createElement("canvas")
            c.width = w
            c.height = h
            return c
          }
    this._beautyCanvas = new OffCtor(w, h)
    this._beautyCtx = this._beautyCanvas.getContext("2d")
    // Scratch canvases (same dimensions, allocated once)
    this._scratchCanvas = new OffCtor(w, h)
    this._scratchCtx = this._scratchCanvas.getContext("2d")
    this._maskCanvas = new OffCtor(w, h)
    this._maskCtx = this._maskCanvas.getContext("2d")
  }

  // ── Lazy initializers ────────────────────────────────────────────────────

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

  /**
   * Lazy-initializes FaceMeshProcessor.
   * Called only when a face-aware effect (faceSlim / eyeEnlarge / skin smoothing)
   * is actually active.
   */
  async _ensureFaceMesh() {
    if (this._faceMeshReady || this._faceMeshInitializing) return
    this._faceMeshInitializing = true
    try {
      this._faceMesh = new FaceMeshProcessor()
      await this._faceMesh.init()
      this._faceMeshReady = this._faceMesh.initialized
      if (!this._faceMeshReady) {
        console.warn(
          "[CombinedVideoTransformer] FaceMesh init failed — falling back to global filters"
        )
      }
    } catch (err) {
      console.error("[CombinedVideoTransformer] FaceMeshProcessor init error:", err)
      this._faceMesh = null
    } finally {
      this._faceMeshInitializing = false
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Build a CSS filter string for global Canvas 2D effects.
   * @param {{ includeSmoothing?: boolean }} opts
   */
  _buildFilter({ includeSmoothing = true } = {}) {
    const parts = []
    if (includeSmoothing && this._beautyOptions.smoothing) parts.push("blur(4px)")
    if (this._beautyOptions.brightness) parts.push("brightness(1.2)")
    if (this._beautyOptions.warmth) parts.push("sepia(0.35) saturate(1.3)")
    if (this._beautyOptions.colorFilter) parts.push("saturate(1.5) contrast(1.1)")
    return parts.length ? parts.join(" ") : "none"
  }

  _hasBeauty() {
    return Object.values(this._beautyOptions).some(Boolean)
  }

  /** True when any face-aware effect is active AND above zero. */
  _needsFaceMesh() {
    return (
      this._beautyOptions.faceSlim > 0 ||
      this._beautyOptions.eyeEnlarge > 0
      // smoothing uses face mesh when available, but isn't a hard requirement
    )
  }

  _hasBg() {
    return (
      !this._bgOptions.backgroundDisabled &&
      (typeof this._bgOptions.imagePath === "string" ||
        typeof this._bgOptions.blurRadius === "number")
    )
  }

  // ── Face-aware effect implementations ─────────────────────────────────────

  /**
   * Skin smoothing: blur only inside the face oval (convex hull).
   * Falls back to global blur when landmarks unavailable.
   *
   * @param {CanvasRenderingContext2D} ctx — main beauty canvas context
   * @param {Array} landmarks — 468-point MediaPipe landmarks
   * @param {number} width
   * @param {number} height
   * @param {number} factor — 0-100
   */
  _applySkinSmoothing(ctx, landmarks, width, height, factor) {
    if (factor <= 0) return

    const blurPx = Math.max(1, Math.round((factor / 100) * 6) + 1) // 1-7 px
    const featherPx = blurPx * 4

    if (!landmarks) {
      // Fallback: global blur (will be handled by _buildFilter later)
      return
    }

    // 1. Build feathered face-oval mask
    const ovalPx = FACE_OVAL.map((i) => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height,
    }))
    const maskCtx = createFeatheredMask(ovalPx, width, height, featherPx)

    // 2. Create blurred copy of current canvas
    this._scratchCtx.clearRect(0, 0, width, height)
    this._scratchCtx.filter = `blur(${blurPx}px)`
    this._scratchCtx.drawImage(ctx.canvas, 0, 0, width, height)
    this._scratchCtx.filter = "none"
    // _scratchCanvas now holds the blurred full frame

    // 3. Apply mask to blurred copy → keep only blurred pixels inside oval
    this._scratchCtx.globalCompositeOperation = "destination-in"
    this._scratchCtx.drawImage(maskCtx.canvas, 0, 0)

    // 4. Save original pixels
    const original = ctx.getImageData(0, 0, width, height)

    // 5. Draw the masked-blurred version on top of the original
    ctx.putImageData(original, 0, 0)
    ctx.globalCompositeOperation = "source-over"
    ctx.drawImage(this._scratchCanvas, 0, 0)

    // Reset compositing
    ctx.globalCompositeOperation = "source-over"
  }

  /**
   * Face slimming: horizontally squeeze the face region toward centre.
   * Uses face oval + jawline to determine the face bounding box,
   * then applies a subtle horizontal scale centred on the face.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array} landmarks
   * @param {number} width
   * @param {number} height
   * @param {number} factor — 0-100
   */
  _applyFaceSlim(ctx, landmarks, width, height, factor) {
    if (factor <= 0 || !landmarks) return

    const ovalPx = FACE_OVAL.map((i) => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height,
    }))
    // Compute centre and radius directly from pixel coords (ovalPx is already in px)
    let cx = 0, cy = 0
    for (const p of ovalPx) { cx += p.x; cy += p.y }
    cx /= ovalPx.length
    cy /= ovalPx.length
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of ovalPx) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
    }
    const radius = Math.max(maxX - minX, maxY - minY) / 2
    const center = { x: cx, y: cy }
    const scaleX = 1 - (factor / 100) * 0.08 // squeeze up to 8 %

    if (scaleX >= 0.99) return // negligible effect

    // Expanded face oval for the feather mask (covers the whole face + margin)
    const expand = 1.25
    const expandedOval = ovalPx.map((p) => ({
      x: center.x + (p.x - center.x) * expand,
      y: center.y + (p.y - center.y) * expand,
    }))
    const maskCtx = createFeatheredMask(expandedOval, width, height, radius * 0.5)

    // Save the original canvas content
    this._scratchCtx.clearRect(0, 0, width, height)
    this._scratchCtx.drawImage(ctx.canvas, 0, 0)

    // Draw the slimmed face region into a temp canvas
    this._maskCtx.clearRect(0, 0, width, height)
    this._maskCtx.save()
    this._maskCtx.translate(center.x, center.y)
    this._maskCtx.scale(scaleX, 1)
    this._maskCtx.translate(-center.x, -center.y)
    this._maskCtx.drawImage(this._scratchCanvas, 0, 0)
    this._maskCtx.restore()

    // Apply feathered mask to the slimmed result
    this._maskCtx.globalCompositeOperation = "destination-in"
    this._maskCtx.drawImage(maskCtx.canvas, 0, 0)
    this._maskCtx.globalCompositeOperation = "source-over"

    // Composite: original back, then slimmed face on top
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(this._scratchCanvas, 0, 0)
    ctx.drawImage(this._maskCanvas, 0, 0)
  }

  /**
   * Eye enlargement: scale the eye region around its centre, then
   * blend with a circular feathered mask.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array} landmarks
   * @param {number} width
   * @param {number} height
   * @param {number} factor — 0-100
   */
  _applyEyeEnlarge(ctx, landmarks, width, height, factor) {
    if (factor <= 0 || !landmarks) return

    const scale = 1 + (factor / 100) * 0.12 // enlarge up to 12 %
    if (scale <= 1.001) return

    // Process each eye
    for (const eyeIndices of [LEFT_EYE, RIGHT_EYE]) {
      this._enlargeOneEye(ctx, landmarks, eyeIndices, width, height, scale)
    }
  }

  /**
   * Enlarge a single eye region.
   */
  _enlargeOneEye(ctx, landmarks, eyeIndices, width, height, scale) {
    // Compute bounding box of eye landmarks
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const i of eyeIndices) {
      const lm = landmarks[i]
      if (!lm) continue
      const px = lm.x * width
      const py = lm.y * height
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
    }
    if (!isFinite(minX)) return

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const eyeW = maxX - minX
    const eyeH = maxY - minY

    // Expand region to include margin for scaling
    const margin = 1.6
    const regionW = eyeW * margin
    const regionH = eyeH * margin
    const rx = cx - regionW / 2
    const ry = cy - regionH / 2

    // Clamp to canvas bounds
    const srcX = Math.max(0, Math.floor(rx))
    const srcY = Math.max(0, Math.floor(ry))
    const srcW = Math.min(width - srcX, Math.ceil(regionW))
    const srcH = Math.min(height - srcY, Math.ceil(regionH))
    if (srcW < 4 || srcH < 4) return

    // Save the eye region from the current canvas into _scratchCanvas
    this._scratchCtx.clearRect(0, 0, width, height)
    this._scratchCtx.drawImage(
      ctx.canvas,
      srcX, srcY, srcW, srcH,
      0, 0, srcW, srcH
    )

    // Compute scale parameters
    const drawW = srcW / scale
    const drawH = srcH / scale
    const drawX = (srcW - drawW) / 2
    const drawY = (srcH - drawH) / 2
    const maskCenterX = srcW / 2
    const maskCenterY = srcH / 2
    const maskRadius = Math.min(srcW, srcH) * 0.55
    const featherRadius = maskRadius * 0.35

    // Build feathered circular mask into _maskCanvas
    this._maskCtx.clearRect(0, 0, srcW, srcH)
    this._maskCtx.fillStyle = "white"
    this._maskCtx.beginPath()
    this._maskCtx.arc(maskCenterX, maskCenterY, maskRadius, 0, Math.PI * 2)
    this._maskCtx.fill()

    if (featherRadius > 0.5) {
      const temp = typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(srcW, srcH)
        : (() => { const c = document.createElement("canvas"); c.width = srcW; c.height = srcH; return c })()
      const tempCtx = temp.getContext("2d")
      tempCtx.filter = `blur(${featherRadius}px)`
      tempCtx.drawImage(this._maskCanvas, 0, 0, srcW, srcH, 0, 0, srcW, srcH)
      this._maskCtx.clearRect(0, 0, srcW, srcH)
      this._maskCtx.drawImage(temp, 0, 0)
    }

    // Composite scaled eye region through the mask using source-in
    this._maskCtx.globalCompositeOperation = "source-in"
    this._maskCtx.drawImage(this._scratchCanvas, 0, 0, srcW, srcH, drawX, drawY, drawW, drawH)
    this._maskCtx.globalCompositeOperation = "source-over"

    // Draw the masked enlarged eye back onto the main canvas
    ctx.drawImage(this._maskCanvas, 0, 0, srcW, srcH, srcX, srcY, srcW, srcH)
  }

  // ── Main transform ─────────────────────────────────────────────────────────

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

      // Ensure canvases are the correct size
      if (this._beautyCanvas.width !== w) this._beautyCanvas.width = w
      if (this._beautyCanvas.height !== h) this._beautyCanvas.height = h
      if (this._scratchCanvas.width !== w) this._scratchCanvas.width = w
      if (this._scratchCanvas.height !== h) this._scratchCanvas.height = h
      if (this._maskCanvas.width !== w) this._maskCanvas.width = w
      if (this._maskCanvas.height !== h) this._maskCanvas.height = h

      // ── Step 1: Draw raw frame onto beauty canvas ─────────────────────────
      this._beautyCtx.filter = "none"
      this._beautyCtx.drawImage(frame, 0, 0, w, h)
      frame.close()

      // ── Step 2: Face-aware effects (if mesh available) ────────────────────
      let faceMeshUsed = false
      const needsMesh = this._needsFaceMesh()
      const smoothingOn = this._beautyOptions.smoothing > 0

      // Only spin up MediaPipe when we have a face-aware effect active.
      // Smoothing also benefits from the face mask, so we try to use it.
      if (needsMesh || smoothingOn) {
        await this._ensureFaceMesh()
      }

      let landmarks = null
      if (this._faceMeshReady) {
        landmarks = await this._faceMesh.detect(this._beautyCanvas)
      }

      if (landmarks) {
        // Face mesh is available — apply face-aware effects in order:
        // 1. Skin smoothing (uses face oval mask)
        // 2. Face slimming (warps face shape)
        // 3. Eye enlargement (scales eye regions)
        this._applySkinSmoothing(
          this._beautyCtx,
          landmarks,
          w,
          h,
          this._beautyOptions.smoothing
        )
        this._applyFaceSlim(
          this._beautyCtx,
          landmarks,
          w,
          h,
          this._beautyOptions.faceSlim
        )
        this._applyEyeEnlarge(
          this._beautyCtx,
          landmarks,
          w,
          h,
          this._beautyOptions.eyeEnlarge
        )
        faceMeshUsed = true
      }

      // ── Step 3: Apply global CSS filters for non-face-aware effects ───────
      // When face mesh was used for smoothing, skip the global blur.
      const includeSmoothing = !faceMeshUsed || !smoothingOn
      const filter = this._buildFilter({ includeSmoothing })

      if (filter !== "none") {
        // Apply the filter by drawing the canvas onto itself via a temp copy
        this._scratchCtx.clearRect(0, 0, w, h)
        this._scratchCtx.filter = filter
        this._scratchCtx.drawImage(this._beautyCanvas, 0, 0, w, h)
        this._scratchCtx.filter = "none"

        // Copy back
        this._beautyCtx.clearRect(0, 0, w, h)
        this._beautyCtx.drawImage(this._scratchCanvas, 0, 0)
      }

      // ── Step 4: Background (if requested) ─────────────────────────────────
      if (!hasBg) {
        controller.enqueue(
          new VideoFrame(this._beautyCanvas, { timestamp: ts })
        )
        return
      }

      // Beauty + background: delegate the beauty-processed frame to BackgroundTransformer
      await this._ensureBgTransformer()
      const beautyFrame = new VideoFrame(this._beautyCanvas, { timestamp: ts })
      if (this._bgTransformerReady) {
        await this._bgTransformer.transform(beautyFrame, controller)
      } else {
        controller.enqueue(beautyFrame)
      }
      return
    }

    // ── Background only (no beauty) ─────────────────────────────────────────
    await this._ensureBgTransformer()
    if (this._bgTransformerReady) {
      await this._bgTransformer.transform(frame, controller)
    } else {
      controller.enqueue(frame)
    }
  }

  // ── Configuration update ──────────────────────────────────────────────────

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

  // ── Cleanup ───────────────────────────────────────────────────────────────

  async destroy() {
    if (this._faceMesh) {
      await this._faceMesh.destroy().catch(() => {})
      this._faceMesh = null
      this._faceMeshReady = false
    }
    if (this._bgTransformerReady) {
      await this._bgTransformer?.destroy().catch(() => {})
    }
    await super.destroy()
  }
}
