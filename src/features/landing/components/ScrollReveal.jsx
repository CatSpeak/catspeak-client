import { motion } from "framer-motion"

export const defaultItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Gentle, luxurious deceleration curve
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
  yOffset = 32,
  duration = 0.85,
  once = true,
  amount = 0.15,
  margin = "0px 0px -70px 0px",
  stagger = false,
  staggerDelay = 0.14,
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
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
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
  duration = 0.8,
  customVariants,
}) => {
  const variants = customVariants || {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
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
