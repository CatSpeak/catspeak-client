/**
 * Material Design 3 (M3) Motion Physics System Tokens
 *
 * Web: Convert springs to curves
 * Citing: [Motion – Material Design 3](https://m3.material.io/styles/motion/overview/specs)
 *
 * The motion physics system makes a UI expressive and easy to use.
 * These curves mimic spring physics (damping and stiffness) for animations
 * without interruptions or gestures on the web.
 */

/**
 * M3 Motion Bezier coordinate arrays: [x1, y1, x2, y2]
 * Direct drop-in for Framer Motion (`ease: [...]`) and Web Animations API.
 */
export const m3Curves = {
  // Expressive Spatial (transforms, movement, scale, layout)
  expressiveFastSpatial: [0.42, 1.67, 0.21, 0.90],
  expressiveDefaultSpatial: [0.38, 1.21, 0.22, 1.00],
  expressiveSlowSpatial: [0.39, 1.29, 0.35, 0.98],

  // Expressive Effects (opacity, color, blur, filters)
  expressiveFastEffects: [0.31, 0.94, 0.34, 1.00],
  expressiveDefaultEffects: [0.34, 0.80, 0.34, 1.00],
  expressiveSlowEffects: [0.34, 0.88, 0.34, 1.00],

  // Standard Spatial
  standardFastSpatial: [0.27, 1.06, 0.18, 1.00],
  standardDefaultSpatial: [0.27, 1.06, 0.18, 1.00],
  standardSlowSpatial: [0.27, 1.06, 0.18, 1.00],

  // Standard Effects
  standardFastEffects: [0.31, 0.94, 0.34, 1.00],
  standardDefaultEffects: [0.34, 0.80, 0.34, 1.00],
  standardSlowEffects: [0.34, 0.88, 0.34, 1.00],
}

/**
 * CSS cubic-bezier string representations
 * Suitable for inline CSS styles or styled components: `cubic-bezier(x1, y1, x2, y2)`
 */
export const m3CssCurves = {
  expressiveFastSpatial: `cubic-bezier(${m3Curves.expressiveFastSpatial.join(", ")})`,
  expressiveDefaultSpatial: `cubic-bezier(${m3Curves.expressiveDefaultSpatial.join(", ")})`,
  expressiveSlowSpatial: `cubic-bezier(${m3Curves.expressiveSlowSpatial.join(", ")})`,

  expressiveFastEffects: `cubic-bezier(${m3Curves.expressiveFastEffects.join(", ")})`,
  expressiveDefaultEffects: `cubic-bezier(${m3Curves.expressiveDefaultEffects.join(", ")})`,
  expressiveSlowEffects: `cubic-bezier(${m3Curves.expressiveSlowEffects.join(", ")})`,

  standardFastSpatial: `cubic-bezier(${m3Curves.standardFastSpatial.join(", ")})`,
  standardDefaultSpatial: `cubic-bezier(${m3Curves.standardDefaultSpatial.join(", ")})`,
  standardSlowSpatial: `cubic-bezier(${m3Curves.standardSlowSpatial.join(", ")})`,

  standardFastEffects: `cubic-bezier(${m3Curves.standardFastEffects.join(", ")})`,
  standardDefaultEffects: `cubic-bezier(${m3Curves.standardDefaultEffects.join(", ")})`,
  standardSlowEffects: `cubic-bezier(${m3Curves.standardSlowEffects.join(", ")})`,
}

/**
 * M3 Motion Durations in milliseconds (ms) and seconds (s)
 */
export const m3Durations = {
  expressiveFastSpatial: { ms: 350, s: 0.35 },
  expressiveDefaultSpatial: { ms: 500, s: 0.5 },
  expressiveSlowSpatial: { ms: 650, s: 0.65 },

  expressiveFastEffects: { ms: 150, s: 0.15 },
  expressiveDefaultEffects: { ms: 200, s: 0.2 },
  expressiveSlowEffects: { ms: 300, s: 0.3 },

  standardFastSpatial: { ms: 350, s: 0.35 },
  standardDefaultSpatial: { ms: 500, s: 0.5 },
  standardSlowSpatial: { ms: 750, s: 0.75 },

  standardFastEffects: { ms: 150, s: 0.15 },
  standardDefaultEffects: { ms: 200, s: 0.2 },
  standardSlowEffects: { ms: 300, s: 0.3 },
}

/**
 * Ready-to-use Framer Motion transition configs
 * e.g. `<motion.div transition={m3Transitions.expressiveFastSpatial} />`
 */
export const m3Transitions = {
  expressiveFastSpatial: {
    ease: m3Curves.expressiveFastSpatial,
    duration: m3Durations.expressiveFastSpatial.s,
  },
  expressiveDefaultSpatial: {
    ease: m3Curves.expressiveDefaultSpatial,
    duration: m3Durations.expressiveDefaultSpatial.s,
  },
  expressiveSlowSpatial: {
    ease: m3Curves.expressiveSlowSpatial,
    duration: m3Durations.expressiveSlowSpatial.s,
  },

  expressiveFastEffects: {
    ease: m3Curves.expressiveFastEffects,
    duration: m3Durations.expressiveFastEffects.s,
  },
  expressiveDefaultEffects: {
    ease: m3Curves.expressiveDefaultEffects,
    duration: m3Durations.expressiveDefaultEffects.s,
  },
  expressiveSlowEffects: {
    ease: m3Curves.expressiveSlowEffects,
    duration: m3Durations.expressiveSlowEffects.s,
  },

  standardFastSpatial: {
    ease: m3Curves.standardFastSpatial,
    duration: m3Durations.standardFastSpatial.s,
  },
  standardDefaultSpatial: {
    ease: m3Curves.standardDefaultSpatial,
    duration: m3Durations.standardDefaultSpatial.s,
  },
  standardSlowSpatial: {
    ease: m3Curves.standardSlowSpatial,
    duration: m3Durations.standardSlowSpatial.s,
  },

  standardFastEffects: {
    ease: m3Curves.standardFastEffects,
    duration: m3Durations.standardFastEffects.s,
  },
  standardDefaultEffects: {
    ease: m3Curves.standardDefaultEffects,
    duration: m3Durations.standardDefaultEffects.s,
  },
  standardSlowEffects: {
    ease: m3Curves.standardSlowEffects,
    duration: m3Durations.standardSlowEffects.s,
  },
}

/**
 * Aggregated M3 Motion Object
 */
export const m3Motion = {
  curves: m3Curves,
  cssCurves: m3CssCurves,
  durations: m3Durations,
  transitions: m3Transitions,
}

export default m3Motion

