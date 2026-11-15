import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion as Motion } from "framer-motion"
import useScrollLock from "@/shared/hooks/useScrollLock"
import { M3_MOTION, dropdownVariants } from "@/shared/constants/motion"

const useIsMobile = (breakpoint = 425) => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [breakpoint])

  return isMobile
}

const MessageModal = ({ isOpen, children }) => {
  const isMobile = useIsMobile(425)

  // Lock body scroll when fullscreen on mobile
  useScrollLock(isOpen && isMobile)

  // Mobile: fullscreen portal (same pattern as Modal.jsx)
  if (isMobile) {
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <div
            data-message-widget-portal
            className="fixed inset-0 z-[1200] flex items-center justify-center"
          >
            {/* Backdrop */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={M3_MOTION.standard.effects.default}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Fullscreen container */}
            <Motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{
                y: M3_MOTION.standard.spatial.fast,
                opacity: M3_MOTION.standard.effects.fast,
              }}
              className="relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#1A1A1A]"
            >
              {children}
            </Motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body,
    )
  }

  // Desktop: dropdown popover (original behavior)
  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          variants={dropdownVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute right-0 top-full mt-2 z-[1200] flex h-[480px] w-[360px] max-w-[90vw] flex-col overflow-hidden rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-lg origin-top-right"
        >
          {children}
        </Motion.div>
      )}
    </AnimatePresence>
  )
}

export default MessageModal
