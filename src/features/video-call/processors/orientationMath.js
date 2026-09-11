// src/features/video-call/processors/orientationMath.js
//
// Pure orientation math for baking a VideoFrame's rotation into a canvas.
// Zero dependencies so it can be unit-tested in node (see scripts/diag-orient-v6.cjs).
//
// Canvas 2D rotate(θ) maps (x,y) -> (x·cosθ − y·sinθ, x·sinθ + y·cosθ)
// with y growing downward, so positive θ is visually clockwise.
//
// The rotation ITSELF swaps the axes for 90/270 — therefore the frame must
// be drawn at its NATIVE dims centered on the translated origin. Drawing at
// swapped dims (a plausible-looking mistake) double-swaps: the mapped rect
// overflows the canvas on one axis (hard crop = zoom) and under-fills the
// other (letterbox bars), and any downstream cover-fit stretches faces.

/**
 * Resolved working-canvas size for a frame + rotation.
 * 90/270 swap axes; 0/180 keep native dims. Pure so it stays node-testable.
 *
 * @param {number} fw - frame displayWidth
 * @param {number} fh - frame displayHeight
 * @param {number} rotation - 0/90/180/270
 * @returns {{w:number, h:number}}
 */
export const resolveOrientedSize = (fw, fh, rotation) => {
  if (rotation === 90 || rotation === 270) return { w: fh, h: fw }
  return { w: fw, h: fh }
}

/**
 * @param {number} rotation - 0/90/180/270
 * @param {number} fw - frame displayWidth
 * @param {number} fh - frame displayHeight
 * @param {number} cw - canvas width (caller sizes to outW/outH)
 * @param {number} ch - canvas height
 * @returns {{translate:[number,number], rotate:number, dx:number, dy:number, dw:number, dh:number, outW:number, outH:number}}
 */
export const computeOrientedDraw = (rotation, fw, fh, cw, ch) => {
  void cw
  void ch
  if (rotation === 90 || rotation === 270) {
    return {
      translate: [cw / 2, ch / 2],
      rotate: (rotation * Math.PI) / 180,
      dx: -fw / 2,
      dy: -fh / 2,
      dw: fw,
      dh: fh,
      outW: fh,
      outH: fw,
    }
  }
  if (rotation === 180) {
    return {
      translate: [cw, ch],
      rotate: Math.PI,
      dx: 0,
      dy: 0,
      dw: fw,
      dh: fh,
      outW: fw,
      outH: fh,
    }
  }
  return {
    translate: [0, 0],
    rotate: 0,
    dx: 0,
    dy: 0,
    dw: fw,
    dh: fh,
    outW: fw,
    outH: fh,
  }
}
