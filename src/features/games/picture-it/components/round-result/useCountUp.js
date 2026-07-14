import { useEffect, useRef, useState } from "react"
import { animate } from "framer-motion"

/**
 * useCountUp
 *
 * Animates a number from 0 → `target` using Framer Motion's `animate()` utility.
 *
 * @param {number}  target   - The final number to count up to
 * @param {number}  duration - Animation duration in seconds (default: 1.5)
 * @param {boolean} enabled  - Start animation only when true (default: true)
 * @returns {number} The current animated value (rounded)
 */
const useCountUp = (target, duration = 1.5, enabled = true) => {
  const [value, setValue] = useState(0)
  const controlsRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      setValue(0)
      return
    }

    // Stop any previous animation
    if (controlsRef.current) {
      controlsRef.current.stop()
    }

    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1], // fluentEaseOut
      onUpdate: (latest) => setValue(Math.round(latest)),
    })

    controlsRef.current = controls

    return () => controls.stop()
  }, [target, duration, enabled])

  return value
}

export default useCountUp
