import {
  m3Curves,
  m3CssCurves,
  m3Durations,
  m3Transitions,
  m3Motion,
} from "../constants/motion"

export { m3Curves, m3CssCurves, m3Durations, m3Transitions, m3Motion }

/**
 * Fluent design motion curve
 * Bezier curve params: [0.16, 1, 0.3, 1]
 */
export const fluentEaseOut = [0.16, 1, 0.3, 1]

const animations = {
  fluentEaseOut,
  m3Curves,
  m3CssCurves,
  m3Durations,
  m3Transitions,
  m3Motion,
}

export default animations
