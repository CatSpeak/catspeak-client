import React from "react"
import { motion } from "framer-motion"

/**
 * Fluent Animation wrapper
 * - Enter/Exit: slides in from specified direction
 * - direction: "up" | "down" | "left" | "right" | "none" (default: "up")
 * - distance: How far it slides from. Default 20 (px). Can be string e.g. "100%"
 * - exit: boolean (default: false), configures if an exit animation should play
 */
const FluentAnimation = React.forwardRef(
  (
    {
      children,
      animationKey,
      direction = "up",
      distance = 20,
      exit = false,
      duration = 0.28,
      className,
    },
    ref,
  ) => {
    const getInitialPosition = () => {
      // Determine negative distance value
      const negDistance =
        typeof distance === "number" ? -distance : `-${distance}`

      switch (direction) {
        case "down":
          return { y: negDistance, x: 0 }
        case "left":
          return { x: distance, y: 0 }
        case "right":
          return { x: negDistance, y: 0 }
        case "none":
          return { x: 0, y: 0 }
        case "up":
        default:
          return { y: distance, x: 0 }
      }
    }

    const initialPos = getInitialPosition()

    return (
      <motion.div
        ref={ref}
        key={animationKey}
        initial={{ y: initialPos.y, x: initialPos.x, opacity: 0 }}
        animate={{ y: 0, x: 0, opacity: 1 }}
        exit={
          exit ? { y: initialPos.y, x: initialPos.x, opacity: 0 } : undefined
        }
        transition={{
          duration: duration,
          ease: [0.16, 1, 0.3, 1], // Strong ease-out (fast → slow)
        }}
        className={className || "w-full h-full"}
      >
        {children}
      </motion.div>
    )
  },
)

export default FluentAnimation
