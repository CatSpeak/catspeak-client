import React, { useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"

const useIsMobile = (breakpoint = 425) => {
  const [isMobile, setIsMobile] = React.useState(
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
  useEffect(() => {
    if (isOpen && isMobile) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      document.body.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isOpen, isMobile])

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Fullscreen container */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full w-full flex-col overflow-hidden bg-white"
            >
              {children}
            </motion.div>
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
        <FluentAnimation
          animationKey="message-modal"
          direction="down"
          distance={12}
          exit={true}
          className="absolute right-0 top-full mt-2 z-[1200] flex h-[480px] w-[340px] max-w-[90vw] flex-col overflow-hidden rounded-lg border border-[#e5e5e5] bg-white shadow-lg"
        >
          {children}
        </FluentAnimation>
      )}
    </AnimatePresence>
  )
}

export default MessageModal
