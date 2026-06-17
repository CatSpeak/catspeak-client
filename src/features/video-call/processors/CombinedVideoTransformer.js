// src/features/video-call/processors/CombinedVideoTransformer.js
import { VideoTransformer, BackgroundTransformer } from "@livekit/track-processors"
import {
  FaceMeshProcessor,
  FACE_OVAL,
  LEFT_EYE,
  RIGHT_EYE,
  LIPS_INNER,
  supportsCanvasFilter,
  makeCanvas,
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
    this._beautyCanvas = makeCanvas(w, h)
    this._beautyCtx = this._beautyCanvas.getContext("2d")
    this._scratchCanvas = makeCanvas(w, h)
    this._scratchCtx = this._scratchCanvas.getContext("2d")
    this._maskCanvas = makeCanvas(w, h)
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
   * All values are intensity-based (0–100), interpolated so higher
   * values produce stronger effects.
   *
   * @param {{ includeSmoothing?: boolean }} opts
   */
  _buildFilter({ includeSmoothing = true } = {}) {
    const parts = []
    const { smoothing, brightness, warmth, colorFilter } =
      this._beautyOptions

    // Skin smoothing fallback (face mesh unavailable): very subtle global softening.
    // Max 1.5 px — noticeably different from 0 but not a distracting blur.
    if (includeSmoothing && smoothing > 0) {
      parts.push(`blur(${(smoothing / 100 * 1.5).toFixed(1)}px)`)
    }

    // Brightness boost: 0→1.0, 50→1.5, 100→2.0
    if (brightness > 0) {
      parts.push(`brightness(${(1 + brightness / 100).toFixed(2)})`)
    }

    // Warm tone: mixed sepia + saturate
    if (warmth > 0) {
      parts.push(
        `sepia(${(warmth / 200).toFixed(3)}) saturate(${(1 + warmth / 200).toFixed(2)})`,
      )
    }

    // Color filter (vivid): saturate + contrast boost
    if (colorFilter > 0) {
      parts.push(
        `saturate(${(1 + colorFilter / 100).toFixed(2)}) contrast(${(1 + colorFilter / 200).toFixed(2)})`,
      )
    }

    // eyeBrighten and teethWhiten are handled as face-aware pixel effects
    // (_applyEyeBrighten / _applyTeethWhiten) — not as global CSS filters.

    return parts.length ? parts.join(" ") : "none"
  }

  _hasBeauty() {
    return Object.values(this._beautyOptions).some(Boolean)
  }

  /** True when any face-aware effect is active AND above zero. */
  _needsFaceMesh() {
    return (
      this._beautyOptions.faceSlim > 0 ||
      this._beautyOptions.eyeEnlarge > 0 ||
      this._beautyOptions.eyeBrighten > 0 ||
      this._beautyOptions.teethWhiten > 0
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

    // blur() requires ctx.filter support; skip entirely on Safari < 18
    if (!supportsCanvasFilter) return

    const blurPx = Math.max(1, Math.round((factor / 100) * 6) + 1) // 1-7 px
    const featherPx = blurPx * 4

    if (!landmarks) {
      // No face mesh → global blur handled by _buildFilter
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
    this._scratchCtx.globalCompositeOperation = "source-over"

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
   * Face slimming via reverse-map warp.
   * For each destination pixel inside the face oval, we sample from a source
   * position that is slightly *further* from the face centre horizontally.
   * This makes the face appear narrower without leaving gaps at the edges.
   * Works on all browsers — uses getImageData / putImageData, no ctx.filter.
   */
  _applyFaceSlim(ctx, landmarks, width, height, factor) {
    if (factor <= 0 || !landmarks) return

    const ovalPx = FACE_OVAL.map((i) => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height,
    }))

    let cx = 0, cy = 0
    for (const p of ovalPx) { cx += p.x; cy += p.y }
    cx /= ovalPx.length
    cy /= ovalPx.length

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of ovalPx) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
    }

    const halfW = (maxX - minX) / 2
    const halfH = (maxY - minY) / 2
    if (halfW < 4 || halfH < 4) return

    // Expand factor: sample further from centre → face appears narrower.
    // Max 15 % at factor = 100.
    const expand = 1 + (factor / 100) * 0.15

    const margin = 8
    const rx = Math.max(0, Math.floor(minX - margin))
    const ry = Math.max(0, Math.floor(minY - margin))
    const rw = Math.min(width - rx, Math.ceil(maxX - minX + margin * 2))
    const rh = Math.min(height - ry, Math.ceil(maxY - minY + margin * 2))
    if (rw < 4 || rh < 4) return

    const srcData = ctx.getImageData(rx, ry, rw, rh)
    const src = srcData.data
    const out = new Uint8ClampedArray(src.length)

    const lcx = cx - rx
    const lcy = cy - ry

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const dx = x - lcx
        const dy = y - lcy
        const nx = dx / halfW
        const ny = dy / halfH
        const dist = Math.sqrt(nx * nx + ny * ny)
        const oi = (y * rw + x) * 4

        if (dist < 1.5) {
          // Smooth falloff: full warp inside the oval, fading to 0 at 1.5× boundary
          const falloff = dist < 1 ? 1 : Math.max(0, 1 - (dist - 1) / 0.5)
          const eff = 1 + (expand - 1) * falloff

          // Reverse-map: read from further out in the horizontal axis
          const sx = lcx + dx * eff
          const sy = lcy + dy

          const fx = Math.floor(sx)
          const fy = Math.floor(sy)
          const wx = sx - fx
          const wy = sy - fy

          if (fx >= 0 && fx < rw - 1 && fy >= 0 && fy < rh - 1) {
            for (let c = 0; c < 4; c++) {
              const i00 = (fy * rw + fx) * 4 + c
              const i10 = (fy * rw + fx + 1) * 4 + c
              const i01 = ((fy + 1) * rw + fx) * 4 + c
              const i11 = ((fy + 1) * rw + fx + 1) * 4 + c
              out[oi + c] = Math.round(
                src[i00] * (1 - wx) * (1 - wy) +
                src[i10] * wx * (1 - wy) +
                src[i01] * (1 - wx) * wy +
                src[i11] * wx * wy,
              )
            }
          } else {
            out[oi] = src[oi]; out[oi + 1] = src[oi + 1]
            out[oi + 2] = src[oi + 2]; out[oi + 3] = src[oi + 3]
          }
        } else {
          out[oi] = src[oi]; out[oi + 1] = src[oi + 1]
          out[oi + 2] = src[oi + 2]; out[oi + 3] = src[oi + 3]
        }
      }
    }

    ctx.putImageData(new ImageData(out, rw, rh), rx, ry)
  }

  /**
   * Eye enlargement via reverse-map warp.
   * For each destination pixel inside the eye warp radius, sample from a source
   * position closer to the eye centre — creating a magnifying-lens effect that
   * makes the eye appear larger.  Works without ctx.filter (Safari compatible).
   */
  _applyEyeEnlarge(ctx, landmarks, width, height, factor) {
    if (factor <= 0 || !landmarks) return

    const scale = 1 + (factor / 100) * 0.20 // up to 20 % magnification
    if (scale <= 1.001) return

    for (const eyeIndices of [LEFT_EYE, RIGHT_EYE]) {
      this._enlargeOneEye(ctx, landmarks, eyeIndices, width, height, scale)
    }
  }

  _enlargeOneEye(ctx, landmarks, eyeIndices, width, height, scale) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const i of eyeIndices) {
      const lm = landmarks[i]
      if (!lm) continue
      const px = lm.x * width, py = lm.y * height
      if (px < minX) minX = px; if (px > maxX) maxX = px
      if (py < minY) minY = py; if (py > maxY) maxY = py
    }
    if (!isFinite(minX)) return

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const eyeSize = Math.max(maxX - minX, maxY - minY)
    const R = eyeSize * 1.4  // warp radius — slightly larger than the eye

    const margin = R + 2
    const rx = Math.max(0, Math.floor(cx - margin))
    const ry = Math.max(0, Math.floor(cy - margin))
    const rw = Math.min(width - rx, Math.ceil(margin * 2))
    const rh = Math.min(height - ry, Math.ceil(margin * 2))
    if (rw < 4 || rh < 4) return

    const srcData = ctx.getImageData(rx, ry, rw, rh)
    const src = srcData.data
    const out = new Uint8ClampedArray(src.length)

    const lcx = cx - rx
    const lcy = cy - ry

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const dx = x - lcx
        const dy = y - lcy
        const r = Math.sqrt(dx * dx + dy * dy)
        const oi = (y * rw + x) * 4

        if (r < R) {
          // Smooth falloff: strong magnification at centre, tapers to 1× at edge R
          const t = r / R
          const falloff = 1 - t * t  // quadratic: 1 at centre, 0 at edge
          const eff = 1 + (scale - 1) * falloff

          // Reverse-map: dest pixel reads from source closer to eye centre
          const sx = lcx + dx / eff
          const sy = lcy + dy / eff

          const fx = Math.floor(sx)
          const fy = Math.floor(sy)
          const wx = sx - fx
          const wy = sy - fy

          if (fx >= 0 && fx < rw - 1 && fy >= 0 && fy < rh - 1) {
            for (let c = 0; c < 4; c++) {
              const i00 = (fy * rw + fx) * 4 + c
              const i10 = (fy * rw + fx + 1) * 4 + c
              const i01 = ((fy + 1) * rw + fx) * 4 + c
              const i11 = ((fy + 1) * rw + fx + 1) * 4 + c
              out[oi + c] = Math.round(
                src[i00] * (1 - wx) * (1 - wy) +
                src[i10] * wx * (1 - wy) +
                src[i01] * (1 - wx) * wy +
                src[i11] * wx * wy,
              )
            }
          } else {
            out[oi] = src[oi]; out[oi + 1] = src[oi + 1]
            out[oi + 2] = src[oi + 2]; out[oi + 3] = src[oi + 3]
          }
        } else {
          out[oi] = src[oi]; out[oi + 1] = src[oi + 1]
          out[oi + 2] = src[oi + 2]; out[oi + 3] = src[oi + 3]
        }
      }
    }

    ctx.putImageData(new ImageData(out, rw, rh), rx, ry)
  }

  /**
   * Eye brightening: boost brightness + contrast in a localised region around
   * each eye using pixel manipulation (no ctx.filter — Safari compatible).
   * A radial weight ensures a smooth, natural-looking blend.
   */
  _applyEyeBrighten(ctx, landmarks, width, height, factor) {
    if (factor <= 0 || !landmarks) return

    for (const eyeIndices of [LEFT_EYE, RIGHT_EYE]) {
      this._brightenEyeRegion(ctx, landmarks, eyeIndices, width, height, factor)
    }
  }

  _brightenEyeRegion(ctx, landmarks, eyeIndices, width, height, factor) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const i of eyeIndices) {
      const lm = landmarks[i]
      if (!lm) continue
      const px = lm.x * width, py = lm.y * height
      if (px < minX) minX = px; if (px > maxX) maxX = px
      if (py < minY) minY = py; if (py > maxY) maxY = py
    }
    if (!isFinite(minX)) return

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const eyeW = (maxX - minX) * 2.5
    const eyeH = (maxY - minY) * 2.5

    const rx = Math.max(0, Math.floor(cx - eyeW / 2))
    const ry = Math.max(0, Math.floor(cy - eyeH / 2))
    const rw = Math.min(width - rx, Math.ceil(eyeW))
    const rh = Math.min(height - ry, Math.ceil(eyeH))
    if (rw < 4 || rh < 4) return

    const imageData = ctx.getImageData(rx, ry, rw, rh)
    const data = imageData.data

    // factor 0→1, 50→1.3, 100→1.5 brightness; contrast scales similarly
    const brightF = 1 + (factor / 100) * 0.5
    const contrastF = 1 + (factor / 100) * 0.25

    const halfW = rw / 2
    const halfH = rh / 2

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const nx = (x - halfW) / halfW
        const ny = (y - halfH) / halfH
        // Radial weight: 1 at centre, 0 at ellipse boundary
        const weight = Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny))
        if (weight <= 0) continue

        const i = (y * rw + x) * 4
        let r = data[i], g = data[i + 1], b = data[i + 2]

        // Apply contrast then brightness
        r = (r - 127.5) * contrastF + 127.5
        g = (g - 127.5) * contrastF + 127.5
        b = (b - 127.5) * contrastF + 127.5
        r *= brightF; g *= brightF; b *= brightF

        // Blend with original based on radial weight
        data[i]     = Math.min(255, Math.max(0, data[i]     + (r - data[i])     * weight))
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (g - data[i + 1]) * weight))
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (b - data[i + 2]) * weight))
      }
    }

    ctx.putImageData(imageData, rx, ry)
  }

  /**
   * Teeth whitening: brighten and desaturate the mouth interior region using
   * pixel manipulation (no ctx.filter — Safari compatible).
   */
  _applyTeethWhiten(ctx, landmarks, width, height, factor) {
    if (factor <= 0 || !landmarks) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const i of LIPS_INNER) {
      const lm = landmarks[i]
      if (!lm) continue
      const px = lm.x * width, py = lm.y * height
      if (px < minX) minX = px; if (px > maxX) maxX = px
      if (py < minY) minY = py; if (py > maxY) maxY = py
    }
    if (!isFinite(minX)) return

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const mouthW = (maxX - minX) * 2.0
    const mouthH = (maxY - minY) * 2.2

    const rx = Math.max(0, Math.floor(cx - mouthW / 2))
    const ry = Math.max(0, Math.floor(cy - mouthH / 2))
    const rw = Math.min(width - rx, Math.ceil(mouthW))
    const rh = Math.min(height - ry, Math.ceil(mouthH))
    if (rw < 4 || rh < 4) return

    const imageData = ctx.getImageData(rx, ry, rw, rh)
    const data = imageData.data

    // factor 0→1.0, 100→1.35 brightness; desat 0→0, 100→0.5
    const brightF = 1 + (factor / 100) * 0.35
    const desat = (factor / 100) * 0.5

    const halfW = rw / 2
    const halfH = rh / 2

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const nx = (x - halfW) / halfW
        const ny = (y - halfH) / halfH
        const weight = Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny))
        if (weight <= 0) continue

        const i = (y * rw + x) * 4
        let r = data[i] * brightF
        let g = data[i + 1] * brightF
        let b = data[i + 2] * brightF

        // Desaturate toward luminance (BT.709 weights)
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        r = r + (lum - r) * desat
        g = g + (lum - g) * desat
        b = b + (lum - b) * desat

        data[i]     = Math.min(255, Math.max(0, data[i]     + (r - data[i])     * weight))
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (g - data[i + 1]) * weight))
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (b - data[i + 2]) * weight))
      }
    }

    ctx.putImageData(imageData, rx, ry)
  }

  /**
   * Pixel-level fallback for global filters when ctx.filter is unsupported
   * (Safari < 18).  Handles brightness, warmth, and colorFilter.
   */
  _applyPixelFilters(ctx, width, height) {
    const { brightness, warmth, colorFilter } = this._beautyOptions
    if (brightness === 0 && warmth === 0 && colorFilter === 0) return

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const bFactor = brightness > 0 ? 1 + brightness / 100 : 1
    const wSepia = warmth / 200          // partial sepia factor (0–0.5)
    const wSat = warmth > 0 ? 1 + warmth / 200 : 1
    const cSat = colorFilter > 0 ? 1 + colorFilter / 100 : 1
    const cCon = colorFilter > 0 ? 1 + colorFilter / 200 : 1

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2]

      // Brightness
      if (brightness > 0) { r *= bFactor; g *= bFactor; b *= bFactor }

      // Warmth: partial sepia then saturate
      if (warmth > 0) {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b
        const sg = 0.349 * r + 0.686 * g + 0.168 * b
        const sb = 0.272 * r + 0.534 * g + 0.131 * b
        r = r + (sr - r) * wSepia
        g = g + (sg - g) * wSepia
        b = b + (sb - b) * wSepia
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        r = lum + (r - lum) * wSat
        g = lum + (g - lum) * wSat
        b = lum + (b - lum) * wSat
      }

      // Color filter: saturate + contrast
      if (colorFilter > 0) {
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        r = lum + (r - lum) * cSat
        g = lum + (g - lum) * cSat
        b = lum + (b - lum) * cSat
        r = (r - 127.5) * cCon + 127.5
        g = (g - 127.5) * cCon + 127.5
        b = (b - 127.5) * cCon + 127.5
      }

      data[i]     = Math.min(255, Math.max(0, Math.round(r)))
      data[i + 1] = Math.min(255, Math.max(0, Math.round(g)))
      data[i + 2] = Math.min(255, Math.max(0, Math.round(b)))
    }

    ctx.putImageData(imageData, 0, 0)
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
        // 1. Skin smoothing (face oval blur — skipped if ctx.filter unsupported)
        // 2. Face slimming (reverse-map warp)
        // 3. Eye enlargement (reverse-map warp)
        // 4. Eye brightening (pixel brightness around eyes)
        // 5. Teeth whitening (pixel brighten/desaturate in mouth region)
        this._applySkinSmoothing(
          this._beautyCtx, landmarks, w, h, this._beautyOptions.smoothing
        )
        this._applyFaceSlim(
          this._beautyCtx, landmarks, w, h, this._beautyOptions.faceSlim
        )
        this._applyEyeEnlarge(
          this._beautyCtx, landmarks, w, h, this._beautyOptions.eyeEnlarge
        )
        this._applyEyeBrighten(
          this._beautyCtx, landmarks, w, h, this._beautyOptions.eyeBrighten
        )
        this._applyTeethWhiten(
          this._beautyCtx, landmarks, w, h, this._beautyOptions.teethWhiten
        )
        faceMeshUsed = true
      }

      // ── Step 3: Global filters (brightness, warmth, colorFilter) ─────────
      // When face mesh handled smoothing, skip the global blur fallback.
      const includeSmoothing = !faceMeshUsed || !smoothingOn
      const filter = this._buildFilter({ includeSmoothing })

      if (supportsCanvasFilter && filter !== "none") {
        // Use CSS canvas filter (Chrome, Firefox, Safari 18+)
        this._scratchCtx.clearRect(0, 0, w, h)
        this._scratchCtx.globalCompositeOperation = "source-over"
        this._scratchCtx.filter = filter
        this._scratchCtx.drawImage(this._beautyCanvas, 0, 0, w, h)
        this._scratchCtx.filter = "none"
        this._beautyCtx.clearRect(0, 0, w, h)
        this._beautyCtx.drawImage(this._scratchCanvas, 0, 0)
      } else if (!supportsCanvasFilter) {
        // Safari < 18: use pixel-level fallback for brightness / warmth / colorFilter
        this._applyPixelFilters(this._beautyCtx, w, h)
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
