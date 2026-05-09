import React, { useState, useRef, useEffect } from "react"
import useScrollLock from "@/shared/hooks/useScrollLock"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Settings, LogOut, Loader2, User, ArrowLeft } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { AnimatePresence, motion } from "framer-motion"
import { useGetProfileQuery, useAuth, useLogoutMutation } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"

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

const ProfileDropdown = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [logoutApi] = useLogoutMutation()
  const { data: userData, isLoading } = useGetProfileQuery()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const isMobile = useIsMobile(425)

  const user = userData?.data ?? authUser ?? {}

  const handleToggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  const handleCloseMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    logoutApi()
    handleCloseMenu()
    navigate("/")
  }

  const handleProfileClick = () => {
    handleCloseMenu()
    navigate("/profile")
  }

  const handleSettingsClick = () => {
    handleCloseMenu()
    navigate("/setting")
  }

  // Click outside to close (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleCloseMenu()
      }
    }

    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, isMobile])

  // Lock body scroll when fullscreen on mobile
  useScrollLock(isOpen && isMobile)

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const menuItemClass =
    "flex w-full items-center gap-3 px-3 h-10 rounded-lg text-sm hover:bg-[#F6F6F6]"

  const menuItemDisabledClass =
    "flex w-full items-center gap-3 px-3 h-10 rounded-lg text-sm text-[#7A7574] cursor-not-allowed"

  const dropdownContent = (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden items-center gap-3 border-b border-[#F0F0F0] p-4 text-gray-800">
        <button
          onClick={handleCloseMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <span className="text-lg font-semibold">
          {t.header.profile || "Profile"}
        </span>
      </div>

      <div className="flex items-center gap-3 p-3">
        <Avatar
          size={40}
          src={user?.avatarImageUrl}
          alt={user?.username || "User"}
          name={user?.fullName || user?.username}
        />

        <div className="min-w-0">
          <p className="m-0 truncate text-base font-medium">
            {user?.username || "User"}
          </p>
          <p className="m-0 truncate text-sm text-[#7A7574]">
            {user?.email || ""}
          </p>
        </div>
      </div>

      <div className="border-t border-[#e5e5e5]" />

      <div className="flex flex-col gap-1 p-1">
        <button onClick={handleProfileClick} className={menuItemClass}>
          <User size={20} />
          <span>{t.header.profile}</span>
        </button>

        <button onClick={handleSettingsClick} className={menuItemClass}>
          <Settings size={20} />
          <span>{t.header.settings || "Settings"}</span>
        </button>
        <button onClick={handleLogout} className={menuItemClass}>
          <LogOut size={20} />
          <span>{t.header.logout}</span>
        </button>
      </div>
    </>
  )

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
            {dropdownContent}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )

  return (
    <div className="relative" ref={menuRef}>
      {isLoading ? (
        <div className="flex h-10 w-10 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#7A7574]" />
        </div>
      ) : (
        <button
          onClick={handleToggleMenu}
          className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors hover:bg-[#E5E5E5] focus:outline-none ${isOpen ? "bg-[#E5E5E5]" : ""}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Avatar
            size={40}
            src={user?.avatarImageUrl}
            alt={user?.username || "User"}
            name={user?.fullName || user?.username}
          />
        </button>
      )}

      {/* Desktop: dropdown */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <FluentAnimation
            animationKey="profile-dropdown"
            direction="down"
            distance={12}
            exit={true}
            className="absolute right-0 top-full z-[1200] mt-2 w-64"
          >
            <div className="flex flex-col bg-white overflow-hidden rounded-lg border border-[#e5e5e5] shadow-lg focus:outline-none">
              {dropdownContent}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>

      {/* Mobile: fullscreen portal */}
      {mobileDropdown}
    </div>
  )
}

export default ProfileDropdown
