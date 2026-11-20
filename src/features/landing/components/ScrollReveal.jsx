import { motion } from "framer-motion"
import { M3_MOTION, getScrollTransition } from "@/shared/constants/motion"

export const defaultItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      y: M3_MOTION.standard.spatial.default,
      opacity: M3_MOTION.standard.effects.slow,
    },
  },
}

/**
 * ScrollReveal container component
 * Supports both single-block scroll reveal and staggered top-to-bottom children reveals.
 */
export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  yOffset = 24,
  preset = "default",
  once = true,
  amount = 0.15,
  margin = "0px 0px -70px 0px",
  stagger = false,
  staggerDelay = 0.1,
  shouldReduceMotion = false,
}) => {
  if (stagger) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount, margin }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: delay,
            },
          },
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin }}
      transition={getScrollTransition(preset, delay, shouldReduceMotion)}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * ScrollItem component
 * To be placed inside a <ScrollReveal stagger> container.
 * Animates sequentially top-to-bottom as the container enters the viewport.
 */
export const ScrollItem = ({
  children,
  className = "",
  yOffset = 24,
  preset = "default",
  customVariants,
}) => {
  const variants = customVariants || {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        y: M3_MOTION.standard.spatial[preset] || M3_MOTION.standard.spatial.default,
        opacity: M3_MOTION.standard.effects[preset] || M3_MOTION.standard.effects.slow,
      },
    },
  }

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}

export default ScrollReveal
