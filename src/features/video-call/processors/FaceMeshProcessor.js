// src/features/video-call/processors/FaceMeshProcessor.js
//
// Lazy-initialized MediaPipe Face Mesh (468 landmarks) helper.
// Caches detection results for 2 frames to reduce per-frame overhead.
// Follows the same lazy-init pattern as BackgroundTransformer in CombinedVideoTransformer.

// ── Landmark index constants ─────────────────────────────────────────────────
// Face oval / silhouette (36 points — used for skin mask & face bounding)
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
]

// Jawline (17 points — used for face slimming)
export const JAWLINE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

// Left eye (10 points including center)
export const LEFT_EYE = [33, 133, 155, 154, 153, 145, 144, 163, 7, 173]

// Right eye (10 points including center)
export const RIGHT_EYE = [362, 263, 387, 386, 385, 373, 374, 380, 382, 398]

// Inner lip / mouth interior (closed polygon — used for teeth whitening)
export const LIPS_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
  324, 318, 402, 317, 14, 87, 178, 88, 95,
]

// CDN root for WASM + data files
const MEDIAPIPE_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4"

// ── Safari / browser capability checks ──────────────────────────────────────

/**
 * True when CanvasRenderingContext2D.filter is supported.
 * Safari < 18 silently ignores `ctx.filter = "…"`, so canvas filter effects
 * (blur, brightness, etc.) need a pixel-level fallback on those browsers.
 */
export const supportsCanvasFilter = (() => {
  try {
    let ctx
    if (typeof OffscreenCanvas !== "undefined") {
      ctx = new OffscreenCanvas(1, 1).getContext("2d")
    } else if (typeof document !== "undefined") {
      ctx = document.createElement("canvas").getContext("2d")
    } else {
      return false // Worker without OffscreenCanvas
    }
    if (!ctx) return false
    ctx.filter = "brightness(1.1)"
    return typeof ctx.filter === "string" && ctx.filter.includes("brightness")
  } catch {
    return false
  }
})()

/**
 * Create an OffscreenCanvas when available (Workers / modern browsers),
 * or fall back to a regular HTMLCanvasElement.
 * Never calls `new` on an arrow function (the old OffCtor pattern).
 */
export function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(w, h)
  }
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas")
    c.width = w
    c.height = h
    return c
  }
  throw new Error("[makeCanvas] No canvas API available")
}

export class FaceMeshProcessor {
  constructor() {
    /** @type {import('@mediapipe/face_mesh').FaceMesh|null} */
    this._faceMesh = null
    this._initialized = false
    this._initializing = false

    // Detection cache
    /** @type {Array<{x:number,y:number,z:number}>|null} */
    this._lastLandmarks = null
    this._cacheTTL = 0 // frames remaining before re-detect
    this._maxCacheFrames = 2

    // Small input canvas sent to MediaPipe (kept <= 640px wide for perf)
    this._inputCanvas = null
    this._inputCtx = null

    // Promise resolution bridge: send() returns before onResults fires,
    // so we use a one-shot resolver to make detect() await-able.
    this._resolveNextResult = null
    this._resultTimer = null

    // Bound result handler (stable reference for onResults)
    this._onResults = this._onResults.bind(this)
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  /**
   * Lazy-initialize MediaPipe Face Mesh.
   * Idempotent — safe to call multiple times.
   */
  async init() {
    if (this._initialized || this._initializing) return
    this._initializing = true
    try {
      // Dynamic import so the module is only fetched when actually needed
      const { FaceMesh } = await import("@mediapipe/face_mesh")

      this._faceMesh = new FaceMesh({
        locateFile: (file) => `${MEDIAPIPE_CDN}/${file}`,
      })

      this._faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      this._faceMesh.onResults(this._onResults)

      // Create a tiny input canvas — MediaPipe resizes internally,
      // but keeping it small reduces the drawImage cost.
      this._inputCanvas = makeCanvas(320, 240)
      this._inputCtx = this._inputCanvas.getContext("2d")

      // Warm-up: send an empty frame to trigger model / WASM download
      await this._faceMesh.send({ image: this._inputCanvas })

      this._initialized = true
      console.log("[FaceMeshProcessor] Initialized successfully")
    } catch (err) {
      console.error("[FaceMeshProcessor] Init failed:", err)
      this._faceMesh = null
    } finally {
      this._initializing = false
    }
  }

  async restart() {
    await this.destroy()
    await this.init()
  }

  async destroy() {
    this._initialized = false
    this._lastLandmarks = null
    this._cacheTTL = 0
    this._resolveNextResult = null
    if (this._resultTimer) {
      clearTimeout(this._resultTimer)
      this._resultTimer = null
    }
    if (this._faceMesh) {
      try {
        await this._faceMesh.close()
      } catch {
        /* ignore */
      }
      this._faceMesh = null
    }
    this._inputCanvas = null
    this._inputCtx = null
  }

  // ── Detection ────────────────────────────────────────────────────────────────

  /**
   * Run face detection on a VideoFrame.
   * Returns cached landmarks if within the cache TTL.
   *
   * @param {VideoFrame} frame
   * @returns {Promise<Array<{x:number,y:number,z:number}>|null>}
   */
  async detect(frame) {
    if (!this._initialized || !this._faceMesh) return null

    // Serve from cache while TTL > 0
    if (this._cacheTTL > 0 && this._lastLandmarks) {
      this._cacheTTL--
      return this._lastLandmarks
    }

    try {
      const w = frame.displayWidth
      const h = frame.displayHeight

      // Guard: dimensions must be positive finite integers (OffscreenCanvas.width
      // requires an unsigned long; NaN/undefined/float throws a TypeError).
      if (!w || !h || !isFinite(w) || !isFinite(h)) return null

      // Keep the input canvas small for performance.
      // MediaPipe normalises landmarks to 0-1 anyway, so resolution doesn't matter.
      const iw = Math.max(1, Math.round(Math.min(w, 640)))
      const ih = Math.max(1, Math.round(Math.min(h, 480)))
      if (this._inputCanvas.width !== iw) this._inputCanvas.width = iw
      if (this._inputCanvas.height !== ih) this._inputCanvas.height = ih

      this._inputCtx.drawImage(frame, 0, 0, iw, ih)

      // Create a promise that resolves when onResults fires
      const resultPromise = new Promise((resolve) => {
        this._resolveNextResult = resolve
        // Safety timeout: if onResults never fires, resolve with whatever we have
        this._resultTimer = setTimeout(() => {
          if (this._resolveNextResult) {
            this._resolveNextResult(this._lastLandmarks)
            this._resolveNextResult = null
          }
        }, 200)
      })

      await this._faceMesh.send({ image: this._inputCanvas })

      const landmarks = await resultPromise
      this._cacheTTL = this._maxCacheFrames
      return landmarks
    } catch (err) {
      console.error("[FaceMeshProcessor] Detection error:", err)
      this._lastLandmarks = null
      this._cacheTTL = 0
      return null
    }
  }

  // ── Internals ────────────────────────────────────────────────────────────────

  /**
   * MediaPipe onResults callback.
   * Stores latest landmarks and resolves the current detect() promise.
   */
  _onResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      this._lastLandmarks = results.multiFaceLandmarks[0]
      this._cacheTTL = this._maxCacheFrames
    } else {
      this._lastLandmarks = null
      this._cacheTTL = 0
    }

    if (this._resolveNextResult) {
      if (this._resultTimer) {
        clearTimeout(this._resultTimer)
        this._resultTimer = null
      }
      this._resolveNextResult(this._lastLandmarks)
      this._resolveNextResult = null
    }
  }

  // ── Public getters ───────────────────────────────────────────────────────────

  get initialized() {
    return this._initialized
  }
}

// ── Utility helpers (pure functions, exported for use by CombinedVideoTransformer) ──

/**
 * Compute the centre of a set of landmarks in pixel space.
 */
export function getFaceCenter(landmarks, width, height) {
  let cx = 0
  let cy = 0
  const n = landmarks.length
  for (const lm of landmarks) {
    cx += lm.x * width
    cy += lm.y * height
  }
  return { x: cx / n, y: cy / n }
}

/**
 * Approximate the face radius (half of diagonal of oval bounding box).
 */
export function getFaceRadius(landmarks, width, height) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const lm of landmarks) {
    const px = lm.x * width
    const py = lm.y * height
    if (px < minX) minX = px
    if (px > maxX) maxX = px
    if (py < minY) minY = py
    if (py > maxY) maxY = py
  }
  return Math.max(maxX - minX, maxY - minY) / 2
}

/**
 * Create a feathered mask canvas from a set of landmark points.
 * White inside the polygon, black outside, with blurred edges.
 *
 * @param {Array<{x:number,y:number}>} points — pixel-space points
 * @param {number} width
 * @param {number} height
 * @param {number} featherRadius — blur radius for edge feathering
 * @returns {CanvasRenderingContext2D} context of the mask canvas
 */
export function createFeatheredMask(points, width, height, featherRadius = 10) {
  const maskCanvas = makeCanvas(width, height)
  const maskCtx = maskCanvas.getContext("2d")

  // Draw filled polygon
  maskCtx.fillStyle = "white"
  maskCtx.beginPath()
  if (points.length > 0) {
    maskCtx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      maskCtx.lineTo(points[i].x, points[i].y)
    }
  }
  maskCtx.closePath()
  maskCtx.fill()

  // Feather via blur — only when ctx.filter is supported (Safari < 18 silently
  // ignores it, so we keep the solid mask instead of an unblurred copy).
  if (supportsCanvasFilter && featherRadius > 0.5) {
    const temp = makeCanvas(width, height)
    const tempCtx = temp.getContext("2d")
    tempCtx.filter = `blur(${featherRadius}px)`
    tempCtx.drawImage(maskCanvas, 0, 0)
    maskCtx.clearRect(0, 0, width, height)
    maskCtx.drawImage(temp, 0, 0)
  }

  return maskCtx
}
