import React from "react"
import { motion } from "framer-motion"

/**
 * A reusable animated card component.
 * Hover: optional smooth lift + soft glow shadow.
 * Tap: fluid physics-based tactile spring feedback.
 */
const Animated3DCard = ({
  children,
  className = "",
  containerClassName = "",
  onClick,
  style,
  liftOnHover = true,
  disableHover = false,
  rounded = "rounded-2xl",
  ...props
}) => {
  const resolvedRounded = className.includes("rounded") ? "" : rounded

  return (
    <motion.div
      onClick={onClick}
      whileHover={liftOnHover && !disableHover ? { y: -5 } : undefined}
      whileTap={!disableHover ? { scale: 0.98 } : undefined}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
        mass: 0.8,
      }}
      className={`relative group/card outline-offset-4 touch-manipulation block select-none ${
        onClick ? "cursor-pointer" : ""
      } ${containerClassName}`}
      style={style}
      {...props}
    >
      {/* Card front */}
      <div
        className={`relative ${resolvedRounded} bg-white dark:bg-[#1A1A1A] flex flex-col overflow-hidden [isolation:isolate] border border-border dark:border-[#3F3F3F] transition-all duration-200 ease-out shadow-sm ${
          !disableHover
            ? "dark:sm:group-hover/card:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.35),0_2px_8px_-2px_rgba(0,0,0,0.2)]"
            : ""
        } ${className}`}
      >
        {children}
      </div>
    </motion.div>
  )
}

export default Animated3DCard
