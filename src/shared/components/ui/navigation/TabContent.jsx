import React, { useState, useMemo } from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { useTabAnimation } from "@/shared/hooks/useTabAnimation"
import { tabContentVariants, getTabTransition } from "@/shared/constants/motion"

/**
 * Reusable animated container for Tab panel transitions.
 * Eliminates empty-screen flashes and keeps tab transitions DRY across the codebase.
 *
 * @param {string|number} activeTab - The currently active tab key/id
 * @param {Array<string|object>} [tabOrder] - Optional tab list/order to compute slide direction
 * @param {Array<string|object>} [tabs] - Alias for tabOrder
 * @param {number} [direction] - Explicit direction override (1 = right, -1 = left)
 * @param {string} [className] - Class applied to the animated motion.div tab pane
 * @param {string} [containerClassName] - Class applied to the outer wrapper
 * @param {'popLayout'|'wait'|'sync'} [mode='popLayout'] - Framer Motion AnimatePresence mode
 * @param {object} [variants] - Custom motion variants (defaults to M3 tabContentVariants)
 * @param {object} [transition] - Custom motion transition (defaults to M3 fast spatial/effects)
 * @param {React.ReactNode} children - Active tab content
 */
const TabContent = ({
  activeTab,
  tabOrder,
  tabs,
  direction: customDirection,
  className = "w-full",
  containerClassName = "",
  mode = "popLayout",
  preset = "default",
  variants = tabContentVariants,
  transition,
  children,
  ...rest
}) => {
  const { shouldReduceMotion } = useTabAnimation()

  const tabKeys = useMemo(() => {
    const list = tabOrder || tabs
    if (!Array.isArray(list)) return null
    return list.map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item)
      }
      return String(item?.id ?? item?.value ?? item?.key ?? "")
    })
  }, [tabOrder, tabs])

  const [prevTab, setPrevTab] = useState(activeTab)
  const [direction, setDirection] = useState(1)

  if (activeTab !== prevTab) {
    if (tabKeys && tabKeys.length > 0) {
      const prevIndex = tabKeys.indexOf(String(prevTab))
      const nextIndex = tabKeys.indexOf(String(activeTab))
      if (prevIndex !== -1 && nextIndex !== -1) {
        setDirection(nextIndex >= prevIndex ? 1 : -1)
      }
    }
    setPrevTab(activeTab)
  }

  const effectiveDirection =
    customDirection !== undefined ? customDirection : direction

  const effectiveTransition =
    transition || getTabTransition(shouldReduceMotion, preset)

  if (shouldReduceMotion) {
    return (
      <div className={`w-full ${containerClassName}`}>
        <div key={activeTab} className={`w-full ${className}`} {...rest}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full ${containerClassName}`}>
      <AnimatePresence
        mode={mode}
        initial={false}
        custom={effectiveDirection}
      >
        <Motion.div
          key={activeTab}
          custom={effectiveDirection}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={effectiveTransition}
          className={className}
          {...rest}
        >
          {children}
        </Motion.div>
      </AnimatePresence>
    </div>
  )
}

export default TabContent
