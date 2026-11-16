import { useRef, useEffect } from "react"
import { useAnimation } from "framer-motion"

/**
 * useElasticStretch — Custom Framer Motion animation hook for tactile squash-and-stretch physics.
 * Simulates fluid volume preservation (scaleX expansion + scaleY compression for horizontal movement,
 * or scaleY expansion + scaleX compression for vertical movement) across tabs, segments, or button groups.
 *
 * @param {string|number} target - Current active target value (e.g. view key or tab index)
 * @param {((val: any) => number) | Record<string|number, number>} getOffset - Offset calculator function or mapping dictionary
 * @param {Object} [options]
 * @param {"x"|"y"} [options.axis="x"] - Movement axis ("x" for horizontal, "y" for vertical)
 * @param {number} [options.stretchFactor=1.35] - Peak stretch ratio along movement axis
 * @param {number} [options.squashFactor=0.88] - Peak compression ratio across perpendicular axis
 * @param {number} [options.stiffness=380] - Spring stiffness for translation
 * @param {number} [options.damping=26] - Spring damping for translation
 * @param {number} [options.duration=0.28] - Keyframe duration for squash/stretch
 * @returns {import("framer-motion").AnimationControls} controls - Pass directly to `<Motion.div animate={controls} />`
 */
export function useElasticStretch(
  target,
  getOffset,
  {
    axis = "x",
    stretchFactor = 1.35,
    squashFactor = 0.88,
    stiffness = 380,
    damping = 26,
    duration = 0.28,
  } = {},
) {
  const controls = useAnimation()
  const isFirstMount = useRef(true)
  const prevTargetRef = useRef(target)
  const getOffsetRef = useRef(getOffset)
  getOffsetRef.current = getOffset

  const coordProp = axis === "y" ? "y" : "x"
  const stretchProp = axis === "y" ? "scaleY" : "scaleX"
  const squashProp = axis === "y" ? "scaleX" : "scaleY"

  useEffect(() => {
    const resolver = getOffsetRef.current
    const rawOffset =
      typeof resolver === "function" ? resolver(target) : resolver?.[target]
    const hasTarget = target != null && rawOffset != null
    const targetCoord = hasTarget ? rawOffset : 0

    // On initial mount: position immediately without stretching
    if (isFirstMount.current) {
      isFirstMount.current = false
      prevTargetRef.current = target

      const updateInitialPosition = () => {
        const offset =
          typeof getOffsetRef.current === "function"
            ? getOffsetRef.current(target)
            : getOffsetRef.current?.[target]
        const has = target != null && offset != null
        controls.set({
          [coordProp]: has ? offset : 0,
          scaleX: 1,
          scaleY: 1,
          opacity: has ? 1 : 0,
        })
      }

      updateInitialPosition()
      const rafId = requestAnimationFrame(updateInitialPosition)
      return () => cancelAnimationFrame(rafId)
    }

    // Only run animation when target actually changes value
    if (prevTargetRef.current === target) {
      return
    }
    prevTargetRef.current = target

    if (!hasTarget) {
      controls.start({
        opacity: 0,
        transition: { duration: 0.15 },
      })
      return
    }

    controls.start({
      [coordProp]: targetCoord,
      opacity: 1,
      [stretchProp]: [1, stretchFactor, 1],
      [squashProp]: [1, squashFactor, 1],
      transition: {
        [coordProp]: { type: "spring", stiffness, damping },
        [stretchProp]: { duration, times: [0, 0.45, 1], ease: "easeInOut" },
        [squashProp]: { duration, times: [0, 0.45, 1], ease: "easeInOut" },
        opacity: { duration: 0.15 },
      },
    })
  }, [
    target,
    controls,
    coordProp,
    stretchProp,
    squashProp,
    stretchFactor,
    squashFactor,
    stiffness,
    damping,
    duration,
  ])

  // Reposition on window resize without re-animating stretch
  useEffect(() => {
    const handleResize = () => {
      const resolver = getOffsetRef.current
      const rawOffset =
        typeof resolver === "function" ? resolver(target) : resolver?.[target]
      if (rawOffset != null && target != null) {
        controls.set({
          [coordProp]: rawOffset,
        })
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [target, controls, coordProp])

  return controls
}

export default useElasticStretch
