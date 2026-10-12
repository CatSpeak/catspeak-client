import React, { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"

/**
 * StackTransition — Reusable native app-style stacked sliding navigation transition (zero-fade).
 * Supports simultaneous forward (push) and backward (pop) screen transitions with parallax background depth
 * and a layered edge drop-shadow, matching native iOS/Android navigation stacks.
 *
 * @param {string|number} activeKey - The unique key identifying the active view/screen (e.g. "list", "detail").
 * @param {number} direction - 1 for forward (push), -1 for backward (pop). Default is 1.
 * @param {React.ReactNode} children - The active screen content to render.
 * @param {string} className - CSS classes for the outer relative container.
 * @param {string} screenClassName - CSS classes for the absolute screen container.
 * @param {boolean} showShadow - Whether to apply the subtle physical drop shadow on the top layer. Default is true.
 * @param {string} parallax - Negative offset for the recessed background screen. Default is "-25%".
 * @param {number} stiffness - Spring stiffness. Default is 360.
 * @param {number} damping - Spring damping. Default is 36.
 */
const StackTransition = ({
  activeKey,
  direction = 1,
  children,
  className = "relative flex-1 w-full h-full min-h-0 overflow-hidden bg-white",
  screenClassName = "absolute inset-0 flex flex-col w-full h-full bg-white overflow-hidden",
  showShadow = true,
  shadowStyle = "-4px 0 16px rgba(0, 0, 0, 0.08)",
  parallax = "-25%",
  stiffness = 360,
  damping = 36,
  onExitComplete,
}) => {
  const variants = useMemo(() => {
    const shadow = showShadow ? shadowStyle : "none"

    return {
      enter: (dir) => ({
        x: dir > 0 ? "100%" : parallax,
        zIndex: dir > 0 ? 2 : 1,
        boxShadow: dir > 0 ? shadow : "none",
      }),
      center: (dir) => ({
        x: "0%",
        zIndex: dir < 0 ? 1 : 2,
        boxShadow: dir > 0 ? shadow : "none",
        transition: {
          x: { type: "spring", stiffness, damping },
        },
      }),
      exit: (dir) => ({
        x: dir > 0 ? parallax : "100%",
        zIndex: dir > 0 ? 1 : 2,
        boxShadow: dir < 0 ? shadow : "none",
        transition: {
          x: { type: "spring", stiffness, damping },
        },
      }),
    }
  }, [showShadow, shadowStyle, parallax, stiffness, damping])

  return (
    <div className={className}>
      <AnimatePresence initial={false} custom={direction} onExitComplete={onExitComplete}>
        <motion.div
          key={activeKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className={screenClassName}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default StackTransition
