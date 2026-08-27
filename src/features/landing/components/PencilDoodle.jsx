import { useEffect, useRef, useState } from "react"
import { motion as Motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"

/**
 * Reusable animated SVG Doodle Path with a leading cartoon pencil.
 * Supports Left-to-Right (ltr) and Right-to-Left (rtl) drawing directions,
 * viewport triggering, and section-to-section handoff synchronization.
 */
const PencilDoodle = ({
  path,
  viewBox = "0 0 1440 600",
  targetRef,
  duration = 2.2,
  delay = 250,
  direction = "ltr", // "ltr" | "rtl"
  listenHandoff = false,
  handoffEvent = "catspeak-pencil-handoff",
  handoffKey = "__catspeak_response_pencil_done",
  onComplete,
  strokeColor = "#1E293B",
  strokeWidth = 2.5,
  opacity = 0.22,
  className = "",
}) => {
  const pathRef = useRef(null)
  const [totalPathLength, setTotalPathLength] = useState(0)
  const [canStart, setCanStart] = useState(() => {
    if (!listenHandoff) return true
    if (typeof window !== "undefined" && window[handoffKey]) {
      return true
    }
    return false
  })

  const isInView = useInView(targetRef, {
    once: true,
    amount: 0.3,
    margin: "0px 0px -10% 0px",
  })

  const progress = useMotionValue(0)
  const pencilOpacity = useMotionValue(0)

  // Measure total length of the SVG path
  useEffect(() => {
    if (pathRef.current) {
      setTotalPathLength(pathRef.current.getTotalLength())
    }
  }, [])

  // Listen for handoff event if required
  useEffect(() => {
    if (!listenHandoff) return

    const handleHandoff = () => {
      setCanStart(true)
    }

    window.addEventListener(handoffEvent, handleHandoff)
    return () => window.removeEventListener(handoffEvent, handleHandoff)
  }, [listenHandoff, handoffEvent])

  // Animate the stroke and pencil
  useEffect(() => {
    if (isInView && totalPathLength > 0) {
      const startDrawing = () => {
        pencilOpacity.set(1)
        const controls = animate(progress, 1, {
          duration,
          ease: "linear",
          onComplete: () => {
            animate(pencilOpacity, 0, { duration: 0.4, delay: 0.2 })
            if (onComplete) onComplete()
          },
        })
        return () => controls.stop()
      }

      if (canStart) {
        const timer = setTimeout(startDrawing, delay)
        return () => clearTimeout(timer)
      } else {
        // Fallback: If user scrolled directly without previous section triggering
        const fallbackTimer = setTimeout(startDrawing, 700)
        return () => clearTimeout(fallbackTimer)
      }
    }
  }, [isInView, canStart, totalPathLength, progress, pencilOpacity, duration, delay, onComplete])

  // Calculate pencil tip (x, y) along the path
  const pencilX = useTransform(progress, (v) => {
    if (!pathRef.current || !totalPathLength) return direction === "rtl" ? 1480 : -20
    const currentLen = Math.min(Math.max(v * totalPathLength, 0), totalPathLength)
    return pathRef.current.getPointAtLength(currentLen).x
  })

  const pencilY = useTransform(progress, (v) => {
    if (!pathRef.current || !totalPathLength) return 180
    const currentLen = Math.min(Math.max(v * totalPathLength, 0), totalPathLength)
    return pathRef.current.getPointAtLength(currentLen).y
  })

  // Orient the pencil dynamically along tangent
  const pencilRotate = useTransform(progress, (v) => {
    if (!pathRef.current || !totalPathLength) return direction === "rtl" ? 25 : -25
    const currentLen = Math.min(Math.max(v * totalPathLength, 0), totalPathLength)
    let p1, p2
    if (currentLen >= totalPathLength - 4) {
      p1 = pathRef.current.getPointAtLength(Math.max(0, currentLen - 4))
      p2 = pathRef.current.getPointAtLength(currentLen)
    } else {
      p1 = pathRef.current.getPointAtLength(currentLen)
      p2 = pathRef.current.getPointAtLength(Math.min(currentLen + 4, totalPathLength))
    }
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
    // Offset angle: -30 for LTR (tilts left), -150 for RTL (tilts right)
    const offset = direction === "rtl" ? -150 : -30
    return angle + offset
  })

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-visible ${className}`}
      viewBox={viewBox}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Hand-drawn stroke */}
      <Motion.path
        ref={pathRef}
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ pathLength: progress, opacity }}
      />

      {/* Cartoon pencil */}
      <Motion.g
        style={{
          x: pencilX,
          y: pencilY,
          rotate: pencilRotate,
          opacity: pencilOpacity,
        }}
        className="drop-shadow-sm"
      >
        {/* Eraser */}
        <rect x="-3.5" y="-38" width="7" height="6" rx="2" fill="#FB7185" />
        {/* Metal Ferrule */}
        <rect x="-4" y="-32" width="8" height="5" rx="0.5" fill="#94A3B8" />
        <line
          x1="-3.5"
          y1="-29.5"
          x2="3.5"
          y2="-29.5"
          stroke="#64748B"
          strokeWidth="0.6"
        />
        {/* Pencil Body (Yellow) */}
        <rect x="-4" y="-27" width="8" height="19" rx="0.5" fill="#F59E0B" />
        {/* Highlights */}
        <line
          x1="-1.5"
          y1="-27"
          x2="-1.5"
          y2="-8"
          stroke="#D97706"
          strokeWidth="0.8"
        />
        <line
          x1="1.5"
          y1="-27"
          x2="1.5"
          y2="-8"
          stroke="#FDE68A"
          strokeWidth="0.8"
        />
        {/* Wood Cone */}
        <polygon points="-4,-8 4,-8 0,0" fill="#FDE047" />
        {/* Graphite Tip */}
        <polygon points="-1.5,-3 1.5,-3 0,0" fill="#1E293B" />
      </Motion.g>
    </svg>
  )
}

export default PencilDoodle
