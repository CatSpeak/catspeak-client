/**
 * ============================================================================
 * Material Design 3 (M3) Motion System & Baseline Tokens
 * ============================================================================
 *
 * M3 Motion Architecture:
 * - Spatial curves: Used for movement, dimensions, and translation (x, y, scale).
 * - Effects curves: Used for visual property changes (opacity, color, blur).
 *
 * Standard Pairing Combination:
 * In M3, transitions combine spatial and effects tokens simultaneously:
 * - `x` (standard.spatial.fast): 350ms [0.27, 1.06, 0.18, 1.00]
 * - `opacity` (standard.effects.fast): 150ms [0.31, 0.94, 0.34, 1.00]
 * 
 * Why this combination?
 * Fading opacity in 150ms ensures the target view is instantly visible without
 * an "empty screen" flash, while the 350ms spatial curve smoothly settles
 * the element into position without feeling sluggish.
 * ============================================================================
 */
export const M3_MOTION = {
  expressive: {
    spatial: {
      fast: { ease: [0.42, 1.67, 0.21, 0.9], duration: 0.35 },
      default: { ease: [0.38, 1.21, 0.22, 1.0], duration: 0.5 },
      slow: { ease: [0.39, 1.29, 0.35, 0.98], duration: 0.65 },
    },
    effects: {
      fast: { ease: [0.31, 0.94, 0.34, 1.0], duration: 0.15 },
      default: { ease: [0.34, 0.8, 0.34, 1.0], duration: 0.2 },
      slow: { ease: [0.34, 0.88, 0.34, 1.0], duration: 0.3 },
    },
  },
  standard: {
    spatial: {
      fast: { ease: [0.27, 1.06, 0.18, 1.0], duration: 0.35 },
      default: { ease: [0.27, 1.06, 0.18, 1.0], duration: 0.5 },
      slow: { ease: [0.27, 1.06, 0.18, 1.0], duration: 0.75 },
    },
    effects: {
      fast: { ease: [0.31, 0.94, 0.34, 1.0], duration: 0.15 },
      default: { ease: [0.34, 0.8, 0.34, 1.0], duration: 0.2 },
      slow: { ease: [0.34, 0.88, 0.34, 1.0], duration: 0.3 },
    },
  },
}

/**
 * Standard directional tab content transition variants based on M3 motion tokens
 */
export const tabContentVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: (direction || 1) * 20,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: (direction || 1) * -20,
  }),
}

/**
 * Helper to build Framer Motion transition matching M3 standard tokens.
 * Defaults to 'fast' preset (spatial: 350ms, effects: 150ms) for snappy, zero-lag tab transitions.
 */
export const getTabTransition = (shouldReduceMotion = false, preset = "fast") =>
  shouldReduceMotion
    ? { duration: 0 }
    : {
        x: M3_MOTION.standard.spatial[preset] || M3_MOTION.standard.spatial.fast,
        opacity: M3_MOTION.standard.effects[preset] || M3_MOTION.standard.effects.fast,
      }

/**
 * Standard M3 dropdown / menu transition variants (vertical unroll matching Dropdown.jsx)
 */
export const dropdownVariants = {
  initial: { opacity: 0, scaleY: 0, transformOrigin: "top" },
  animate: {
    opacity: 1,
    scaleY: 1,
    transformOrigin: "top",
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    opacity: 0,
    scaleY: 0,
    transformOrigin: "top",
    transition: {
      duration: 0.15,
      ease: [0.25, 1, 0.5, 1],
    },
  },
}

export default M3_MOTION
