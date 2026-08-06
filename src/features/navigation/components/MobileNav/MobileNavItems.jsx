import React, { useState, useEffect } from "react"
import { Home, Settings, ChevronRight, ChevronLeft, Globe } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DesktopNavItem from "../DesktopNav/DesktopNavItem"
import { navLinks, footerLinks, settingNavLinks } from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useAuth } from "@/features/auth"
import MobileLanguageSwitcher from "./MobileLanguageSwitcher"
import MobileCommunitySwitcher from "./MobileCommunitySwitcher"

const NavIcon = ({ img, icon: Icon, color, size = 20 }) => {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [img])

  const IconComponent = Icon || Globe

  if (img && !imgError) {
    return (
      <img
        src={img}
        alt=""
        onError={() => setImgError(true)}
        className="w-5 h-5 object-contain shrink-0 rounded-sm"
      />
    )
  }

  return (
    <IconComponent
      size={size}
      className="shrink-0"
      style={color ? { color } : undefined}
    />
  )
}

const MobileNavItems = ({ isMobileOpen, setIsMobileOpen, isHorizontal = false }) => {
  const { t } = useLanguage()
  const { isStudent, isTeacher } = useRoleOverride()
  const { resolvePath, checkIsActive, pathname, currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()
  const [activeDrilldownItem, setActiveDrilldownItem] = useState(null)
  const { user } = useAuth()
  const userId = user?.accountId || user?.id || ""

  // Sync drilldown state when drawer opens or when navigating
  const isSettings = pathname.startsWith("/setting") || pathname.startsWith("/pricing") || pathname.startsWith("/billing")

  useEffect(() => {
    if (isMobileOpen) {
      const activeLinks = isSettings ? settingNavLinks : navLinks
      const activeItem = activeLinks.find(
        (item) =>
          item.hasDropdown && item.subItems?.length > 0 && checkIsActive(item),
      )
      setActiveDrilldownItem(activeItem || null)
    } else {
      const timer = setTimeout(() => {
        const activeLinks = isSettings ? settingNavLinks : navLinks
        const activeItem = activeLinks.find(
          (item) =>
            item.hasDropdown &&
            item.subItems?.length > 0 &&
            checkIsActive(item),
        )
        setActiveDrilldownItem(activeItem || null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isMobileOpen, pathname])

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col w-full h-full">
      {/* Main View Container */}
      <div
        className={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ${activeDrilldownItem ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div className="p-3 shrink-0 border-b border-border">
          <MobileCommunitySwitcher />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-1 scrollbar-none">
          {(isSettings ? settingNavLinks : navLinks)
            .filter((item) => {
              if (item.hideInSidebar) return false
              if (item.lang && item.lang !== currentLang) return false
              if (isHorizontal && item.showOnHorizontalBar === false) return false
              if (item.isPrivate && !isAuthenticated) return false
              const teacherTabs = ["myCourses", "myClass", "analytics", "schedule", "teachingTasks"]
              if (teacherTabs.includes(item.key) && isStudent) return false
              return true
            })
            .map((item) => {
              if (item.isHorizontalBar) {
                return (
                  <div
                    key={item.key}
                    className="my-2 border-t border-border -mx-3"
                  />
                )
              }
              const label = t.nav?.[item.key] || item.label || item.key
              const IconComponent = item.icon || Globe

              if (
                item.hasDropdown &&
                item.subItems &&
                item.subItems.length > 0
              ) {
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveDrilldownItem(item)}
                    className="relative flex items-center shrink-0 h-11 px-4 gap-3 rounded-lg transition-all duration-300 group overflow-hidden w-full hover:bg-gray-100"
                    title={label}
                  >
                    <NavIcon
                      img={item.img}
                      icon={IconComponent}
                      color={item.color}
                    />
                    <span
                      className="text-sm font-medium text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate"
                      style={item.color ? { color: item.color } : undefined}
                    >
                      {label}
                    </span>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-gray-500 ml-auto"
                    />
                  </button>
                )
              }

              return (
                <DesktopNavItem
                  key={item.key}
                  to={resolvePath(item.path)}
                  icon={IconComponent}
                  label={label}
                  color={item.color}
                  img={item.img}
                  onClick={() => setIsMobileOpen?.(false)}
                />
              )
            })}
        </div>

        <div className="p-3 flex flex-col gap-1 mt-auto border-t border-border shrink-0">
          <MobileLanguageSwitcher />

          {footerLinks.map((item) => {
            const label = t.nav?.[item.key] || item.label || item.key
            const IconComponent = item.icon || Settings

            return (
              <DesktopNavItem
                key={item.key}
                to={resolvePath(item.path)}
                icon={IconComponent}
                label={label}
                color={item.color}
                img={item.img}
                onClick={() => setIsMobileOpen?.(false)}
              />
            )
          })}
        </div>
      </div>

      {/* Drilldown View Container */}
      <div
        className={`absolute inset-0 w-full h-full bg-white flex flex-col transition-transform duration-300 ${activeDrilldownItem ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drilldown Header */}
        <div className="flex items-center px-3 shrink-0">
          <button
            onClick={() => setActiveDrilldownItem(null)}
            className="relative flex items-center justify-center w-full px-1 h-12 hover:bg-[#F2F2F2] rounded-lg transition-colors"
            title={
              activeDrilldownItem
                ? t.nav?.[activeDrilldownItem.key] ||
                activeDrilldownItem.label ||
                activeDrilldownItem.key
                : undefined
            }
          >
            <ChevronLeft size={20} className="absolute left-1" />
            {activeDrilldownItem && (
              <span
                className="font-semibold truncate max-w-[80%]"
                style={
                  activeDrilldownItem.color
                    ? { color: activeDrilldownItem.color }
                    : undefined
                }
              >
                {t.nav?.[activeDrilldownItem.key] ||
                  activeDrilldownItem.label ||
                  activeDrilldownItem.key}
              </span>
            )}
          </button>
        </div>

        {/* Drilldown Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 flex flex-col gap-1 scrollbar-none">
          {(activeDrilldownItem?.subItems || [])
            .filter((sub) => {
              const teacherTabs = ["myCourses", "myClass", "analytics", "schedule", "teachingTasks"]
              if (teacherTabs.includes(sub.key) && isStudent) return false
              if (sub.lang && sub.lang !== currentLang) return false
              if (isHorizontal && sub.showOnHorizontalBar === false) return false
              if (sub.isPrivate && !isAuthenticated) return false
              return true
            })
            .map((sub) => {
              const subLabel = t.nav?.[sub.key] || sub.key || sub.label
              const SubIconComponent = sub.icon || Globe
              let subPath = sub.path
              if (sub.key === "profile" && userId) {
                subPath = `/workspace/profile/${userId}`
              }

              return (
                <div key={sub.key} className="w-full">
                  <DesktopNavItem
                    to={resolvePath(subPath)}
                    icon={SubIconComponent}
                    label={subLabel}
                    color={sub.color}
                    img={sub.img}
                    onClick={() => setIsMobileOpen?.(false)}
                  />
                  {sub.key === "analytics" && (
                    <div className="my-1.5 mx-3 border-b border-black" />
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default MobileNavItems
