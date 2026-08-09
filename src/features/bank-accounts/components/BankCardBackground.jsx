import React, { useMemo } from "react"
import { motion } from "framer-motion"

/**
 * Animated background layer for BankAccountCard featuring soft ambient lights
 * and a banknote guilloche wave pattern.
 *
 * @param {Object} props
 * @param {string|number} props.id - Card identifier used for deterministic seed animation parameters
 */
export default function BankCardBackground({ id }) {
  // Randomize animation parameters per card instance so multiple cards animate out of sync
  const animConfig = useMemo(() => {
    const seed =
      typeof id === "number"
        ? id
        : id
          ? String(id)
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0)
          : Math.floor(Math.random() * 100)
    const offset = (seed % 7) * 0.6

    return {
      dot1: { duration: 5.5 + (seed % 3) * 0.8, delay: offset },
      dot2: {
        duration: 7.2 + ((seed + 2) % 4) * 0.7,
        delay: (offset + 1.2) % 3,
      },
      svg: {
        duration: 6.5 + ((seed + 1) % 3) * 0.9,
        delay: (offset + 0.5) % 4,
      },
      path1: {
        duration: 7.5 + ((seed + 3) % 4) * 0.8,
        delay: (offset + 1.8) % 3,
      },
      path2: {
        duration: 8.5 + ((seed + 2) % 3) * 0.9,
        delay: (offset + 0.9) % 4,
      },
    }
  }, [id])

  return (
    <>
      {/* Base: Full Red-to-Amber Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#990011] via-[#c00015] to-amber-500 z-0" />

      {/* Animated Background Details: Moving Light Dots & Animated Waves */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Circle 1: Small Soft White Light Dot */}
        <motion.div
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: animConfig.dot1.duration,
            delay: animConfig.dot1.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute top-2 left-6 w-14 h-14 rounded-full bg-white/25 blur-xl"
        />

        {/* Circle 2: Small Soft Amber Light Dot */}
        <motion.div
          animate={{
            x: [0, -20, 15, 0],
            y: [0, 15, -10, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: animConfig.dot2.duration,
            delay: animConfig.dot2.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute bottom-3 right-8 w-16 h-16 rounded-full bg-amber-200/30 blur-xl"
        />

        {/* Animated Banknote Guilloche Waves Watermark SVG */}
        <motion.svg
          animate={{
            x: [0, 25, -15, 0],
            opacity: [0.1, 0.18, 0.12, 0.1],
          }}
          transition={{
            duration: animConfig.svg.duration,
            delay: animConfig.svg.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute inset-y-0 -left-16 w-[calc(100%+8rem)] h-full text-white pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <motion.path
            animate={{
              d: [
                "M-150 100 Q 100 0 250 100 T 650 100",
                "M-150 85 Q 100 25 250 85 T 650 85",
                "M-150 115 Q 100 -15 250 115 T 650 115",
                "M-150 100 Q 100 0 250 100 T 650 100",
              ],
            }}
            transition={{
              duration: animConfig.path1.duration,
              delay: animConfig.path1.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <motion.path
            animate={{
              d: [
                "M-150 120 Q 100 20 250 120 T 650 120",
                "M-150 135 Q 100 5 250 135 T 650 135",
                "M-150 105 Q 100 35 250 105 T 650 105",
                "M-150 120 Q 100 20 250 120 T 650 120",
              ],
            }}
            transition={{
              duration: animConfig.path2.duration,
              delay: animConfig.path2.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </motion.svg>
      </div>

      {/* Glass Glossy Sheen Overlay */}
      <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />
    </>
  )
}
