import React, { useState, useRef, useEffect, useContext } from "react"
import { createPortal } from "react-dom"
import { Bell } from "lucide-react"
import { AnimatePresence, motion as Motion } from "framer-motion"
import NotificationDropdown from "./NotificationDropdown"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import useClickOutside from "@/shared/hooks/useClickOutside"
import useScrollLock from "@/shared/hooks/useScrollLock"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useNotifications } from "../hooks/useNotifications"
import IconButton from "@/shared/components/ui/buttons/IconButton"
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

const NotificationWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useContext(AuthModalContext)
  const isMobile = useIsMobile(425)
  const { t } = useLanguage()
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()

  useClickOutside(dropdownRef, () => setIsOpen(false), {
    enabled: isOpen && !isMobile,
  })
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
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={M3_MOTION.standard.effects.default}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{
              y: M3_MOTION.standard.spatial.fast,
              opacity: M3_MOTION.standard.effects.fast,
            }}
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
          </Motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <IconButton
        onClick={toggleDropdown}
        variant="ghost"
        aria-label={t.header?.notifications || "Notifications"}
        badge={
          unreadCount > 0 && (
            <span className="absolute top-0 right-0 z-10 flex h-4 min-w-[1rem] items-center justify-center rounded-full border-2 border-white bg-cath-red-700 px-1 text-[10px] font-bold leading-none text-white shadow-xs pointer-events-none dark:border-gray-800">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )
        }
      >
        <Bell size={20} strokeWidth={2} />
      </IconButton>

      <AnimatePresence>
        {isOpen && !isMobile && (
          <Motion.div
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute right-0 top-full z-[1200] mt-2 w-80 origin-top-right"
          >
            <NotificationDropdown
              onClose={() => setIsOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
            />
          </Motion.div>
        )}
      </AnimatePresence>

      {mobileDropdown}
    </div>
  )
}

export default NotificationWidget
