import { useRef, useEffect } from "react"
import { useAnimation } from "framer-motion"

/**
 * useElasticStretch — Custom Framer Motion animation hook for tactile squash-and-stretch physics.
 * Simulates fluid volume preservation (horizontal scaleX expansion + vertical scaleY compression)
 * across gaps or between tabs/buttons.
 *
 * @param {string|number} target - Current active target value (e.g. view key or tab index)
 * @param {((val: any) => number) | Record<string|number, number>} getOffset - Offset calculator function or mapping dictionary
 * @param {Object} [options]
 * @param {number} [options.stretchFactor=1.45] - Peak horizontal stretch ratio (scaleX)
 * @param {number} [options.squashFactor=0.88] - Peak vertical compression ratio (scaleY)
 * @param {number} [options.stiffness=360] - Spring stiffness for translation
 * @param {number} [options.damping=25] - Spring damping for translation
 * @param {number} [options.duration=0.28] - Keyframe duration for squash/stretch
 * @returns {import("framer-motion").AnimationControls} controls - Pass directly to `<Motion.div animate={controls} />`
 */
export function useElasticStretch(
  target,
  getOffset,
  {
    stretchFactor = 1.45,
    squashFactor = 0.88,
    stiffness = 360,
    damping = 25,
    duration = 0.28,
  } = {},
) {
  const controls = useAnimation()
  const isFirstMount = useRef(true)
  const prevTargetRef = useRef(target)
  const getOffsetRef = useRef(getOffset)
  getOffsetRef.current = getOffset

  useEffect(() => {
    const resolver = getOffsetRef.current
    const targetX =
      typeof resolver === "function" ? resolver(target) : resolver?.[target] ?? 0

    // On initial mount, position without animating
    if (isFirstMount.current) {
      isFirstMount.current = false
      prevTargetRef.current = target
      controls.set({
        x: targetX,
        scaleX: 1,
        scaleY: 1,
      })
      return
    }

    // Only run animation when target actually changes value
    if (prevTargetRef.current === target) {
      return
    }
    prevTargetRef.current = target

    controls.start({
      x: targetX,
      scaleX: [1, stretchFactor, 1],
      scaleY: [1, squashFactor, 1],
      transition: {
        x: { type: "spring", stiffness, damping },
        scaleX: { duration, times: [0, 0.45, 1], ease: "easeInOut" },
        scaleY: { duration, times: [0, 0.45, 1], ease: "easeInOut" },
      },
    })
  }, [target, controls, stretchFactor, squashFactor, stiffness, damping, duration])

  return controls
}

export default useElasticStretch

