import { M3_MOTION, tabContentVariants, getTabTransition } from "../constants/motion"

export { M3_MOTION, tabContentVariants, getTabTransition }

/**
 * Fluent design motion curve
 * Bezier curve params: [0.16, 1, 0.3, 1]
 */
export const fluentEaseOut = [0.16, 1, 0.3, 1]

const animations = {
  fluentEaseOut,
  M3_MOTION,
  tabContentVariants,
  getTabTransition,
}

export default animations
