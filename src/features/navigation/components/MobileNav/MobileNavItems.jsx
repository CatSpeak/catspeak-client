import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Home, Settings, ChevronRight, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DesktopNavItem from "../DesktopNav/DesktopNavItem"
import { navLinks, footerLinks } from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import MobileLanguageSwitcher from "./MobileLanguageSwitcher"
import MobileCommunitySwitcher from "./MobileCommunitySwitcher"
import { getNavItemClasses, getNavTextClasses } from "../../utils/navStyles"

const MobileNavItems = ({ isMobileOpen, setIsMobileOpen }) => {
  const { t } = useLanguage()
  const { isStudent } = useRoleOverride()
  const { resolvePath, checkIsActive, pathname } = useActiveLink()
  const [activeDrilldownItem, setActiveDrilldownItem] = useState(null)

  // Sync drilldown state when drawer opens or when navigating
  useEffect(() => {
    if (isMobileOpen) {
      const activeItem = navLinks.find(
        (item) =>
          item.hasDropdown && item.subItems?.length > 0 && checkIsActive(item),
      )
      setActiveDrilldownItem(activeItem || null)
    } else {
      // Optional: Wait for drawer close animation before resetting to prevent layout jump
      const timer = setTimeout(() => {
        const activeItem = navLinks.find(
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
          {navLinks
            .filter((item) => !item.hideInSidebar)
            .map((item) => {
              const label = t.nav?.[item.key] || item.key
              const IconComponent = item.icon || Home

              if (
                item.hasDropdown &&
                item.subItems &&
                item.subItems.length > 0
              ) {
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveDrilldownItem(item)}
                    className={getNavItemClasses(false, false)}
                  >
                    <IconComponent size={20} className="shrink-0" />
                    <span className={getNavTextClasses(true)}>{label}</span>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-gray-500"
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
                  onClick={() => setIsMobileOpen?.(false)}
                />
              )
            })}
        </div>

        <div className="p-3 flex flex-col gap-1 mt-auto border-t border-border shrink-0">
          <MobileLanguageSwitcher />

          {footerLinks.map((item) => {
            const label = t.nav?.[item.key] || item.key
            const IconComponent = item.icon || Settings

            return (
              <DesktopNavItem
                key={item.key}
                to={resolvePath(item.path)}
                icon={IconComponent}
                label={label}
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
          >
            <ChevronLeft size={20} className="absolute left-1" />
            {activeDrilldownItem && (
              <span className="font-semibold">
                {t.nav?.[activeDrilldownItem.key] || activeDrilldownItem.key}
              </span>
            )}
          </button>
        </div>

        {/* Drilldown Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 flex flex-col gap-1 scrollbar-none">
          {(activeDrilldownItem?.subItems || [])
            .filter((sub) => {
              if (sub.key === "myCourses" && isStudent) return false
              return true
            })
            .map((sub) => {
              const subLabel = t.nav?.[sub.key] || sub.key
              const SubIconComponent = sub.icon || Home
              return (
                <DesktopNavItem
                  key={sub.key}
                  to={resolvePath(sub.path)}
                  icon={SubIconComponent}
                  label={subLabel}
                  onClick={() => setIsMobileOpen?.(false)}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default MobileNavItems
