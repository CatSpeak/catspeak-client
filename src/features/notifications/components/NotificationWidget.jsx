import React, { useState, useRef, useEffect, useContext } from "react"
import { createPortal } from "react-dom"
import { Bell } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import NotificationDropdown from "./NotificationDropdown"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import useClickOutside from "@/shared/hooks/useClickOutside"
import useScrollLock from "@/shared/hooks/useScrollLock"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useNotifications } from "../hooks/useNotifications"

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
  const { t } = useLanguage()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  useClickOutside(dropdownRef, () => setIsOpen(false), { enabled: isOpen && !isMobile })
  useScrollLock(isOpen && isMobile)

  const toggleDropdown = () => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    setIsOpen(!isOpen)
  }

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
            <NotificationDropdown
              onClose={() => setIsOpen(false)}
              isMobile
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors bg-primaryBg hover:bg-[#D9D9D9] ${isOpen ? "" : ""}`}
        aria-label={t.header?.notifications || "Notifications"}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && !isMobile && (
          <FluentAnimation
            direction="down"
            distance={10}
            exit={true}
            className="absolute right-0 top-full z-[1200] mt-2 w-80"
          >
            <NotificationDropdown
              onClose={() => setIsOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
            />
          </FluentAnimation>
        )}
      </AnimatePresence>

      {mobileDropdown}
    </div>
  )
}

export default NotificationWidget
