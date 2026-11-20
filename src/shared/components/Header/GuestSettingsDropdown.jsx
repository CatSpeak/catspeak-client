import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Settings,
  ArrowLeft,
  Sun,
  Moon,
  SunMoon,
  Globe,
  ChevronRight as ChevronRightIcon,
} from "lucide-react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion as Motion } from "framer-motion"

import { useLanguage } from "@/shared/context/LanguageContext"
import { useTheme } from "@/shared/context/ThemeContext"
import { VietNam, China, UK, Japan } from "@/shared/assets/icons/flags"
import { M3_MOTION, dropdownVariants } from "@/shared/constants/motion"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import ListItem from "@/shared/components/ui/ListItem"
import Radio from "@/shared/components/ui/inputs/Radio"
import useClickOutside from "@/shared/hooks/useClickOutside"
import useScrollLock from "@/shared/hooks/useScrollLock"

const useIsMobile = (breakpoint = 425) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint,
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

/**
 * GuestSettingsDropdown
 * Reusable dropdown menu for unauthenticated visitors.
 * - Desktop: Animated MenuList with MenuItem drilldowns
 * - Mobile (< 425px): Fullscreen portal sheet using ListItem
 */
const GuestSettingsDropdown = ({ className = "" }) => {
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()

  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState("root") // "root" | "theme" | "language"
  const prevViewRef = useRef("root")
  const menuRef = useRef(null)
  const isMobile = useIsMobile(425)

  useEffect(() => {
    prevViewRef.current = currentView
  }, [currentView])

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

  useClickOutside(menuRef, handleCloseMenu, { enabled: isOpen && !isMobile })
  useScrollLock(isOpen && isMobile)

  const themeOptions = [
    { key: "light", label: t.nav?.themeLight || "Sáng", icon: <Sun /> },
    { key: "dark", label: t.nav?.themeDark || "Tối", icon: <Moon /> },
    { key: "system", label: t.nav?.themeSystem || "Hệ thống", icon: <SunMoon /> },
  ]

  const currentLanguageOption = LANGUAGES.find((l) => l.key === language)

  const handleSettingsClick = () => {
    handleCloseMenu()
    navigate("/setting/system")
  }

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
          {currentView === "theme"
            ? t.nav?.themeTitle || "Giao diện"
            : currentView === "language"
              ? t.header?.language || "Ngôn ngữ"
              : t.header?.settings || t.nav?.systemConfig || "Cài đặt"}
        </span>
      </div>

      {currentView === "theme" ? (
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
          <div className="flex flex-col py-[2px]">
            {/* System Settings Navigation */}
            {renderItem({
              key: "systemConfig",
              icon: <Settings />,
              label: t.nav?.systemConfig || "Thiết lập hệ thống",
              onClick: handleSettingsClick,
              isFirst: true,
              isLast: false,
            })}

            {/* Theme Submenu Trigger */}
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

            {/* Language Submenu Trigger */}
            {renderItem({
              key: "language",
              icon: <Globe />,
              label: t.header?.language || "Ngôn ngữ",
              hasSubmenu: true,
              rightText: currentLanguageOption?.label,
              onClick: () => setCurrentView("language"),
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
            onClick={handleCloseMenu}
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
    <div className={`relative h-12 w-12 flex items-center justify-center ${className}`} ref={menuRef}>
      <IconButton
        onClick={handleToggleMenu}
        variant="ghost"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t.header?.settings || t.nav?.systemConfig || "Cài đặt"}
        aria-label={t.header?.settings || t.nav?.systemConfig || "Cài đặt"}
      >
        <Settings />
      </IconButton>

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
              className="w-[280px] min-w-[280px] max-w-[280px] overflow-hidden focus:outline-none"
            >
              {dropdownContent}
            </MenuList>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: fullscreen portal */}
      {mobileDropdown}
    </div>
  )
}

export default GuestSettingsDropdown
