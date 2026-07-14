import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fluentEaseOut } from "@/shared/utils/animations"
import { useLanguage } from "@/shared/context/LanguageContext"

const RADIUS = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = 80 // SVG viewport size

const CountdownCircle = ({ duration = 3, onComplete, label }) => {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(duration)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    startTimeRef.current = Date.now()

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const left = Math.max(0, duration - Math.floor(elapsed))
      setRemaining(left)

      if (left <= 0) {
        clearInterval(intervalRef.current)
        onComplete?.()
      }
    }, 200)

    return () => clearInterval(intervalRef.current)
  }, [duration, onComplete])

  const progress = remaining / duration
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth={4}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#990011"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={remaining}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.25, ease: fluentEaseOut }}
              className="text-xl font-bold text-cath-red-700 tabular-nums select-none"
            >
              {remaining}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight text-center">
        {label || "Vòng tiếp theo bắt đầu sau..."}
      </p>
    </div>
  )
}

export default CountdownCircle
