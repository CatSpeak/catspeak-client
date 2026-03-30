import React, { useState, useRef, useEffect, useContext } from "react"
import { createPortal } from "react-dom"
import { Bell } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import NotificationDropdown from "./NotificationDropdown"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"

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

const NotificationWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useContext(AuthModalContext)
  const isMobile = useIsMobile(425)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, isMobile])

  // Lock body scroll when fullscreen on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth

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

  const toggleDropdown = () => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    setIsOpen(!isOpen)
  }

  // Mobile: fullscreen portal
  const mobileDropdown = createPortal(
    <AnimatePresence>
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full w-full flex-col overflow-hidden bg-white"
          >
            <NotificationDropdown onClose={() => setIsOpen(false)} isMobile />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )

  return null;
  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#E5E5E5] ${isOpen ? "" : ""}`}
        aria-label="Notifications"
      >
        <Bell />
      </button>

      {/* Desktop: dropdown */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <FluentAnimation
            direction="down"
            distance={10}
            exit={true}
            className="absolute right-0 top-full z-[1200] mt-2 w-80"
          >
            <NotificationDropdown onClose={() => setIsOpen(false)} />
          </FluentAnimation>
        )}
      </AnimatePresence>

      {/* Mobile: fullscreen portal */}
      {mobileDropdown}
    </div>
  )
}

export default NotificationWidget
