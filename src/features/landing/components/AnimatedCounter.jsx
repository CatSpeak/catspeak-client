import { useEffect, useRef, useState } from "react"
import { useInView, animate } from "framer-motion"

/**
 * AnimatedCounter component
 * Rapidly counts up numbers when scrolled into view, settling smoothly with an ease-out curve.
 * Uses tabular figures to prevent horizontal layout shift during the animation.
 */
const AnimatedCounter = ({
  from = 0,
  to = 0,
  duration = 1.8,
  delay = 0.2,
  separator = ".",
  suffix = "",
  prefix = "",
  className = "",
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [count, setCount] = useState(from)

  useEffect(() => {
    if (!isInView) return

    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1], // Fast start, ultra-smooth deceleration
      onUpdate: (latest) => {
        setCount(Math.floor(latest))
      },
      onComplete: () => {
        setCount(to)
      },
    })

    return () => controls.stop()
  }, [isInView, from, to, duration, delay])

  // Format with thousand separator (e.g., 50.000)
  const formattedCount = count
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  return (
    <span ref={ref} className={`tabular-nums font-bold inline-block ${className}`}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  )
}

export default AnimatedCounter
