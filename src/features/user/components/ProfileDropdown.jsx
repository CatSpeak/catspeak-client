import React, { useState, useRef, useEffect } from "react"
import useScrollLock from "@/shared/hooks/useScrollLock"
import useClickOutside from "@/shared/hooks/useClickOutside"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Settings,
  LogOut,
  Loader2,
  User,
  ArrowLeft,
  CreditCard,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Compass,
  Globe,
  Sun,
  Moon,
  SunMoon,
} from "lucide-react"
import Radio from "@/shared/components/ui/inputs/Radio"
import Avatar from "@/shared/components/ui/Avatar"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { useGetProfileQuery, useAuth, useLogoutMutation } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTheme } from "@/shared/context/ThemeContext"
import { VietNam, China, UK, Japan } from "@/shared/assets/icons/flags"
import { useSidebar } from "@/shared/context/SidebarContext"
import { M3_MOTION, dropdownVariants } from "@/shared/constants/motion"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import ListItem from "@/shared/components/ui/ListItem"
import { ChevronRight as ChevronRightIcon } from "lucide-react"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useTourGuide } from "@/features/tour-guide"

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

const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt", flag: VietNam },
  { key: "zh", label: "中文", flag: China },
  { key: "en", label: "English", flag: UK },
  { key: "ja", label: "日本語", flag: Japan },
]

const ProfileDropdown = () => {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { setIsDesktopExpanded } = useSidebar()
  const navigate = useNavigate()
  const { user: authUser, isAuthenticated } = useAuth()
  const { resetTour } = useTourGuide()
  const [logoutApi] = useLogoutMutation()
  const { data: userData, isLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const { data: detailedProfile } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const { isTeacherProfile, isTeacher, isStudent, switchRole, isSwitching } =
    useRoleOverride()
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState("root") // "root" | "settings" | "theme" | "language" | "role"
  const prevViewRef = useRef("root")
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)
  const menuRef = useRef(null)
  const isMobile = useIsMobile(425)
  const { isInCall } = useSelector((state) => state.videoCall)

  useEffect(() => {
    prevViewRef.current = currentView
  }, [currentView])

  const user = {
    ...(userData?.data ?? userData ?? authUser ?? {}),
    ...(detailedProfile?.data ?? detailedProfile ?? {}),
  }

  const handleToggleMenu = () => {
    if (!isOpen) {
      setCurrentView("root")
    }
    setIsOpen((prev) => !prev)
  }

  const handleCloseMenu = () => {
    setIsOpen(false)
    setCurrentView("root")
  }

  const handleLogout = () => {
    if (isInCall) {
      setShowLogoutWarning(true)
    } else {
      executeLogout()
    }
  }

  const executeLogout = () => {
    setShowLogoutWarning(false)
    logoutApi()
    handleCloseMenu()
    navigate("/")
  }

  const handleProfileClick = () => {
    handleCloseMenu()
    navigate("/workspace/profile")
  }

  const handleSettingsClick = () => {
    setIsDesktopExpanded(true)
    handleCloseMenu()
    navigate("/setting/system")
  }

  const handleAccountClick = () => {
    setIsDesktopExpanded(true)
    handleCloseMenu()
    navigate("/setting/account")
  }

  const handleInstructorClick = () => {
    setIsDesktopExpanded(true)
    handleCloseMenu()
    navigate("/setting/instructor")
  }

  const handleBillingClick = () => {
    setIsDesktopExpanded(true)
    handleCloseMenu()
    navigate("/billing")
  }

  // Click outside to close (desktop only)
  useClickOutside(menuRef, handleCloseMenu, { enabled: isOpen && !isMobile })

  // Lock body scroll when fullscreen on mobile
  useScrollLock(isOpen && isMobile)

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const menuItemClass =
    "flex w-full items-center gap-3 px-3 h-10 rounded-lg text-sm text-gray-700 dark:text-[#AAAAAA] hover:text-gray-900 dark:hover:text-white hover:bg-[#F2F2F2] active:bg-[#E6E6E6] dark:hover:bg-[#272727] dark:active:bg-[#3D3D3D] transition-colors cursor-pointer"

  const menuItemDisabledClass =
    "flex w-full items-center gap-3 px-3 h-10 rounded-lg text-sm text-[#7A7574] cursor-not-allowed"

  const currentLanguageOption = LANGUAGES.find((l) => l.key === language)

  const roleOptions = [
    {
      key: "Student",
      label: t.header?.studentRole || "Học viên",
      icon: <BookOpen size={18} />,
      isActive: isStudent,
    },
    {
      key: "Teacher",
      label: t.header?.teacherRole || "Giảng viên",
      icon: <GraduationCap size={18} />,
      isActive: isTeacher,
    },
  ]

  const currentRoleOption =
    roleOptions.find((r) => r.isActive) || roleOptions[0]

  const handleRoleSelect = async (roleKey) => {
    if (roleKey === (isStudent ? "Student" : isTeacher ? "Teacher" : null)) {
      handleCloseMenu()
      return
    }
    const success = await switchRole(roleKey)
    if (success) {
      handleCloseMenu()
      window.location.reload()
    }
  }

  const themeOptions = [
    {
      key: "light",
      label: t.nav?.themeLight || "Sáng",
      icon: <Sun />,
    },
    { key: "dark", label: t.nav?.themeDark || "Tối", icon: <Moon /> },
    {
      key: "system",
      label: t.nav?.themeSystem || "Hệ thống",
      icon: <SunMoon />,
    },
  ]

  const renderSubmenuHeader = (title) => (
    <div className="border-b border-border dark:border-[#3F3F3F] pt-[2px] pb-[2px]">
      <MenuItem
        icon={<ArrowLeft />}
        label={
          <span className="font-semibold text-gray-900 dark:text-white">
            {title}
          </span>
        }
        onClick={() => setCurrentView("root")}
        roundedClass="group-first:rounded-t-xl rounded-b"
      />
    </div>
  )

  const renderItem = ({
    key,
    icon,
    label,
    rightText,
    rightContent,
    hasSubmenu,
    isSelected,
    disabled,
    onClick,
    isFirst,
    isLast,
  }) => {
    if (isMobile) {
      return (
        <ListItem
          key={key}
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          selected={isSelected}
          hoverEffect={!disabled}
          leftContent={icon}
          rightContent={
            hasSubmenu ? (
              <div className="flex items-center gap-1 text-gray-500 dark:text-[#AAAAAA]">
                {rightText && <span className="text-sm">{rightText}</span>}
                <ChevronRightIcon className="w-5 h-5" />
              </div>
            ) : rightText ? (
              <span className="text-sm text-gray-500 dark:text-[#AAAAAA]">
                {rightText}
              </span>
            ) : (
              rightContent
            )
          }
          className="w-full h-12 min-h-[48px]"
          contentClassName={`px-4 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {label}
          </span>
        </ListItem>
      )
    }

    return (
      <MenuItem
        key={key}
        icon={icon}
        label={label}
        rightText={rightText}
        rightContent={rightContent}
        hasSubmenu={hasSubmenu}
        isSelected={isSelected}
        disabled={disabled}
        onClick={onClick}
        isFirst={isFirst}
        isLast={isLast}
      />
    )
  }

  const dropdownContent = (
    <div className="w-full flex flex-col">
      {/* Mobile Top Navigation Header */}
      <div className="flex md:hidden items-center gap-1 border-b border-[#F0F0F0] dark:border-[#3F3F3F] h-[56px] px-1 text-gray-800 dark:text-white">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={
            currentView === "root"
              ? handleCloseMenu
              : () => setCurrentView("root")
          }
          title={
            currentView === "root"
              ? t.common?.close || "Close"
              : t.common?.back || "Back"
          }
        >
          <ArrowLeft />
        </IconButton>
        <span className="text-xl font-bold">
          {currentView === "settings"
            ? t.nav?.settings || "Cài đặt"
            : currentView === "theme"
              ? t.nav?.themeTitle || "Giao diện"
              : currentView === "language"
                ? t.header?.language || "Ngôn ngữ"
                : currentView === "role"
                  ? t.header?.switchRole || "Vai trò"
                  : t.header.profile || "Profile"}
        </span>
      </div>

      {currentView === "settings" ? (
        /* Submenu: Settings */
        <Motion.div
          key="settings"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{
            x: M3_MOTION.standard.spatial.fast,
            opacity: M3_MOTION.standard.effects.fast,
          }}
          className="flex flex-col w-full"
        >
          <div className="hidden md:block">
            {renderSubmenuHeader(t.nav?.settings || "Cài đặt")}
          </div>

          <div className="flex flex-col w-full py-[2px]">
            {renderItem({
              key: "systemConfig",
              icon: <Settings />,
              label: t.nav?.systemConfig || "Thiết lập hệ thống",
              onClick: handleSettingsClick,
              isFirst: false,
              isLast: false,
            })}
            {renderItem({
              key: "accountInfo",
              icon: <User />,
              label: t.nav?.accountInfo || "Thông tin tài khoản",
              onClick: handleAccountClick,
              isFirst: false,
              isLast: !isTeacherProfile && false,
            })}
            {isTeacherProfile &&
              renderItem({
                key: "instructor",
                icon: <GraduationCap />,
                label: t.nav?.instructor || "Hồ sơ giáo viên",
                onClick: handleInstructorClick,
                isFirst: false,
                isLast: false,
              })}
            {renderItem({
              key: "billing",
              icon: <CreditCard />,
              label: t.nav?.billing || "Lịch sử thanh toán",
              onClick: handleBillingClick,
              isFirst: false,
              isLast: true,
            })}
          </div>
        </Motion.div>
      ) : currentView === "theme" ? (
        /* Submenu: Theme */
        <Motion.div
          key="theme"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{
            x: M3_MOTION.standard.spatial.fast,
            opacity: M3_MOTION.standard.effects.fast,
          }}
          className="flex flex-col w-full"
        >
          <div className="hidden md:block">
            {renderSubmenuHeader(t.nav?.themeTitle || "Giao diện")}
          </div>

          <div className="flex flex-col w-full py-[2px]">
            {themeOptions.map((opt, index) =>
              renderItem({
                key: opt.key,
                icon: opt.icon,
                label: opt.label,
                isSelected: theme === opt.key,
                rightContent: <Radio checked={theme === opt.key} />,
                onClick: () => setTheme(opt.key),
                isFirst: false,
                isLast: index === themeOptions.length - 1,
              }),
            )}
          </div>
        </Motion.div>
      ) : currentView === "language" ? (
        /* Submenu: Language */
        <Motion.div
          key="language"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{
            x: M3_MOTION.standard.spatial.fast,
            opacity: M3_MOTION.standard.effects.fast,
          }}
          className="flex flex-col w-full"
        >
          <div className="hidden md:block">
            {renderSubmenuHeader(t.header?.language || "Ngôn ngữ")}
          </div>

          <div className="flex flex-col w-full py-[2px]">
            {LANGUAGES.map((l, index) =>
              renderItem({
                key: l.key,
                icon: (
                  <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border">
                    <img
                      src={l.flag}
                      alt={l.label}
                      className="block h-full w-full object-cover"
                      draggable={false}
                    />
                  </span>
                ),
                label: t.header?.languages?.[l.key] || l.label,
                isSelected: language === l.key,
                rightContent: <Radio checked={language === l.key} />,
                onClick: () => setLanguage(l.key),
                isFirst: false,
                isLast: index === LANGUAGES.length - 1,
              }),
            )}
          </div>
        </Motion.div>
      ) : currentView === "role" ? (
        /* Submenu: Role */
        <Motion.div
          key="role"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{
            x: M3_MOTION.standard.spatial.fast,
            opacity: M3_MOTION.standard.effects.fast,
          }}
          className="flex flex-col w-full"
        >
          <div className="hidden md:block">
            {renderSubmenuHeader(t.header?.switchRole || "Vai trò")}
          </div>

          <div className="flex flex-col w-full py-[2px]">
            {roleOptions.map((role, index) =>
              renderItem({
                key: role.key,
                icon: role.icon,
                label: role.label,
                isSelected: role.isActive,
                disabled: isSwitching,
                rightContent:
                  isSwitching && !role.isActive ? null : (
                    <Radio checked={role.isActive} disabled={isSwitching} />
                  ),
                onClick: () => handleRoleSelect(role.key),
                isFirst: false,
                isLast: index === roleOptions.length - 1,
              }),
            )}
          </div>
        </Motion.div>
      ) : (
        /* Root View */
        <Motion.div
          key="root"
          initial={
            prevViewRef.current !== "root"
              ? { opacity: 0, x: -12 }
              : { opacity: 1, x: 0 }
          }
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{
            x: M3_MOTION.standard.spatial.fast,
            opacity: M3_MOTION.standard.effects.fast,
          }}
          className="flex flex-col w-full"
        >
          {/* Avatar and names */}
          <div className="w-full flex items-center">
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full h-[72px] px-4 py-1 flex items-center gap-4 text-left transition-colors hover:bg-itemHover active:bg-itemActiveHover dark:hover:bg-[#272727] dark:active:bg-[#3D3D3D] cursor-pointer focus:outline-none"
            >
              <Avatar
                size={40}
                src={user?.avatarImageUrl}
                alt={user?.username || "User"}
                name={user?.nickname || user?.fullName || user?.username}
              />

              <div className="min-w-0 flex flex-col justify-center">
                <p className="m-0 truncate text-base font-semibold text-gray-900 dark:text-white">
                  {user?.fullName || user?.username || "User"}
                </p>
                {user?.nickname && (
                  <p className="m-0 truncate text-sm text-gray-500 dark:text-[#AAAAAA] mt-0.5">
                    {user.nickname} (
                    {t.profile?.personalInfo?.nickname || "Biệt danh"})
                  </p>
                )}
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border dark:border-[#3F3F3F]" />

          {/* Menu Actions */}
          <div className="flex flex-col py-[2px]">
            {isTeacherProfile &&
              renderItem({
                key: "role",
                icon: <GraduationCap />,
                label: t.header?.switchRole || "Vai trò",
                hasSubmenu: true,
                rightText: currentRoleOption?.label,
                onClick: () => setCurrentView("role"),
                isFirst: false,
                isLast: false,
              })}

            {renderItem({
              key: "settings",
              icon: <Settings />,
              label: t.nav?.settings || "Cài đặt",
              hasSubmenu: true,
              onClick: () => setCurrentView("settings"),
              isFirst: false,
              isLast: false,
            })}

            {renderItem({
              key: "theme",
              icon: theme === "dark" ? <Moon /> : <Sun />,
              label: t.nav?.themeTitle || "Giao diện",
              hasSubmenu: true,
              rightText:
                theme === "dark"
                  ? t.nav?.themeDark || "Tối"
                  : theme === "light"
                    ? t.nav?.themeLight || "Sáng"
                    : t.nav?.themeSystem || "Hệ thống",
              onClick: () => setCurrentView("theme"),
              isFirst: false,
              isLast: false,
            })}

            {renderItem({
              key: "language",
              icon: <Globe />,
              label: t.header?.language || "Ngôn ngữ",
              hasSubmenu: true,
              rightText: currentLanguageOption?.label,
              onClick: () => setCurrentView("language"),
              isFirst: false,
              isLast: false,
            })}

            {renderItem({
              key: "help",
              icon: <HelpCircle />,
              label: t.helpBox?.helpTooltip || t.header?.help || "Trợ giúp",
              onClick: () => {
                handleCloseMenu()
                window.dispatchEvent(new CustomEvent("catspeak:open-help"))
              },
              isFirst: false,
              isLast: false,
            })}

            {renderItem({
              key: "tour",
              icon: <Compass />,
              label: t.header?.tourGuide || "Hướng dẫn người dùng mới",
              onClick: () => {
                handleCloseMenu()
                resetTour()
              },
              isFirst: false,
              isLast: false,
            })}

            {renderItem({
              key: "logout",
              icon: <LogOut />,
              label: t.header.logout,
              onClick: handleLogout,
              isFirst: false,
              isLast: true,
            })}
          </div>
        </Motion.div>
      )}
    </div>
  )

  // Mobile: fullscreen portal
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
            className="relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#1A1A1A]"
          >
            {dropdownContent}
          </Motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )

  return (
    <div className="relative h-12 w-12" ref={menuRef}>
      {isLoading ? (
        <div className="flex h-10 w-10 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#7A7574]" />
        </div>
      ) : (
        <IconButton
          onClick={handleToggleMenu}
          variant="ghost"
          innerClassName="overflow-hidden rounded-full"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Avatar
            size={40}
            src={user?.avatarImageUrl}
            alt={user?.username || "User"}
            name={user?.nickname || user?.fullName || user?.username}
          />
        </IconButton>
      )}

      {/* Desktop: dropdown */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <Motion.div
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute right-0 top-full z-[1200] mt-2 origin-top-right"
          >
            <MenuList
              py="py-0"
              className="w-[300px] min-w-[300px] max-w-[300px] overflow-hidden focus:outline-none"
            >
              {dropdownContent}
            </MenuList>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: fullscreen portal */}
      {mobileDropdown}

      <ConfirmationModal
        open={showLogoutWarning}
        onClose={() => setShowLogoutWarning(false)}
        onConfirm={executeLogout}
        title={t.header.logoutWarning?.title || "End Call & Log Out"}
        message={
          t.header.logoutWarning?.message ||
          "You are currently in a call. Logging out will disconnect you. Are you sure you want to log out?"
        }
        cancelText={t.header.logoutWarning?.cancel || "Cancel"}
        confirmText={t.header.logoutWarning?.confirm || "Log Out"}
        confirmVariant="destructive"
      />
    </div>
  )
}

export default ProfileDropdown
