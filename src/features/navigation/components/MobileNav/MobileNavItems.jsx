import React, { useState, useEffect } from "react"
import { Settings, ChevronRight, ChevronLeft, Globe } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DesktopNavItem from "../DesktopNav/DesktopNavItem"
import { navLinks, footerLinks, settingNavLinks } from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useAuth } from "@/features/auth"
import ListItem from "@/shared/components/ui/ListItem"
import MobileCommunitySwitcher from "./MobileCommunitySwitcher"
import MobileLanguageSwitcher from "./MobileLanguageSwitcher"

const NavIcon = ({ img, icon: Icon, color, size = 24 }) => {
  const [imgError, setImgError] = useState(false)
  const [prevImg, setPrevImg] = useState(img)

  if (prevImg !== img) {
    setPrevImg(img)
    setImgError(false)
  }

  const IconComponent = Icon || Globe

  if (img && !imgError) {
    return (
      <img
        src={img}
        alt=""
        onError={() => setImgError(true)}
        className="w-6 h-6 object-contain shrink-0 rounded-sm"
      />
    )
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={1.5}
      className="shrink-0"
      style={color ? { color } : undefined}
    />
  )
}

const MobileNavItems = ({ isMobileOpen, setIsMobileOpen, isHorizontal = false }) => {
  const { t } = useLanguage()
  const { isStudent } = useRoleOverride()
  const { resolvePath, checkIsActive, pathname, currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()
  const [activeDrilldownItem, setActiveDrilldownItem] = useState(null)
  const { user } = useAuth()
  const userId = user?.accountId || user?.id || ""

  // Sync drilldown state when drawer opens or when navigating
  const isSettings = pathname.startsWith("/setting") || pathname.startsWith("/pricing") || pathname.startsWith("/billing")

  useEffect(() => {
    const activeLinks = isSettings ? settingNavLinks : navLinks
    const activeItem = activeLinks.find(
      (item) =>
        item.hasDropdown && item.subItems?.length > 0 && checkIsActive(item),
    )
    if (isMobileOpen) {
      setActiveDrilldownItem(activeItem || null)
    } else {
      const timer = setTimeout(() => {
        setActiveDrilldownItem(activeItem || null)
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-6 flex flex-col gap-1 scrollbar-none scrollbar-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {(isSettings ? settingNavLinks : navLinks)
            .filter((item) => {
              if (item.hideInSidebar) return false
              if (item.lang && item.lang !== currentLang) return false
              if (isHorizontal && item.showOnHorizontalBar === false) return false
              if (item.isPrivate && !isAuthenticated) return false
              const teacherTabs = ["dashboard", "myCourses", "myClass", "analytics", "schedule", "teachingTasks"]
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
                  <ListItem
                    key={item.key}
                    onClick={() => setActiveDrilldownItem(item)}
                    leftContent={
                      <NavIcon
                        img={item.img}
                        icon={IconComponent}
                        color={item.color}
                        size={24}
                      />
                    }
                    rightContent={
                      <ChevronRight
                        size={24}
                        strokeWidth={1.5}
                        className="shrink-0 text-gray-500"
                      />
                    }
                    className="rounded-xl transition-all duration-200 w-full"
                    contentClassName="rounded-xl transition-all duration-200 px-4 hover:bg-primaryBg"
                    title={label}
                  >
                    <span
                      className="text-base font-normal text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate"
                      style={item.color ? { color: item.color } : undefined}
                    >
                      {label}
                    </span>
                  </ListItem>
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

        <div className="p-3 pb-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-1 mt-auto border-t border-border shrink-0">
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
            className="relative flex items-center justify-center w-full px-1 h-12 hover:bg-primaryBg rounded-lg transition-colors"
            title={
              activeDrilldownItem
                ? t.nav?.[activeDrilldownItem.key] ||
                activeDrilldownItem.label ||
                activeDrilldownItem.key
                : undefined
            }
          >
            <ChevronLeft size={20} strokeWidth={1.5} className="absolute left-1" />
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 pb-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-1 scrollbar-none scrollbar-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {(activeDrilldownItem?.subItems || [])
            .filter((sub) => {
              const teacherTabs = ["dashboard", "myCourses", "myClass", "analytics", "schedule", "teachingTasks"]
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
                  {sub.key === "myCourses" && (
                    <div className="my-1.5 mx-3 border-t border-black" />
                  )}
                  <DesktopNavItem
                    to={resolvePath(subPath)}
                    icon={SubIconComponent}
                    label={subLabel}
                    color={sub.color}
                    img={sub.img}
                    onClick={() => setIsMobileOpen?.(false)}
                  />
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default MobileNavItems
