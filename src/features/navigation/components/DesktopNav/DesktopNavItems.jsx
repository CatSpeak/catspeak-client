import React, { useEffect } from "react"
import { Home, Settings, Globe } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DesktopNavItem from "./DesktopNavItem"
import DesktopNavDropdown from "./DesktopNavDropdown"
import DesktopNavSubItem from "./DesktopNavSubItem"
import { navLinks, footerLinks, settingNavLinks } from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useSidebar } from "@/shared/context/SidebarContext"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useAuth } from "@/features/auth"

const DesktopNavItems = ({ isHorizontal = false }) => {
  const { t } = useLanguage()
  const { isStudent } = useRoleOverride()
  const { resolvePath, checkIsActive, pathname, currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()

  const { openDropdownKeys, setOpenDropdownKeys, isDesktopSidebarDocked } =
    useSidebar()

  // Keep the active dropdown open when navigating via other means
  useEffect(() => {
    const activeItem = navLinks.find(
      (item) => item.hasDropdown && checkIsActive(item),
    )
    if (activeItem) {
      setOpenDropdownKeys((prev) =>
        prev.includes(activeItem.key) ? prev : [...prev, activeItem.key],
      )
    }
  }, [pathname])

  return (
    <>
      <div
        className={`flex-1 flex flex-col gap-1 px-4 ${isDesktopSidebarDocked ? "overflow-visible" : "overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200"}`}
      >
        {(pathname.startsWith("/setting") ? settingNavLinks : navLinks)
          .filter((item) => {
            if (item.hideInSidebar) return false
            if (item.lang && item.lang !== currentLang) return false
            if (isHorizontal && item.showOnHorizontalBar === false) return false
            if (item.isPrivate && !isAuthenticated) return false
            return true
          })
          .map((item) => {
            if (item.isHorizontalBar) {
              return (
                <div
                  key={item.key}
                  className={`my-2 border-t ${isDesktopSidebarDocked ? "border-white/20" : "border-border"} -mx-4`}
                />
              )
            }

            const label = t.nav?.[item.key] || item.label || item.key
            const IconComponent = item.icon || Globe

            if (item.hasDropdown && item.subItems && item.subItems.length > 0) {
              const filteredSubItems = (item.subItems || []).filter((sub) => {
                if (sub.key === "myCourses" && isStudent) return false
                if (sub.lang && sub.lang !== currentLang) return false
                if (isHorizontal && sub.showOnHorizontalBar === false) return false
                if (sub.isPrivate && !isAuthenticated) return false
                return true
              })

              return (
                <DesktopNavDropdown
                  key={item.key}
                  icon={IconComponent}
                  label={label}
                  color={item.color}
                  img={item.img}
                  isOpen={openDropdownKeys.includes(item.key)}
                  onToggle={() => {
                    setOpenDropdownKeys((prev) =>
                      prev.includes(item.key)
                        ? prev.filter((key) => key !== item.key)
                        : [...prev, item.key],
                    )
                  }}
                  isDocked={isDesktopSidebarDocked}
                >
                  {filteredSubItems.map((sub) => {
                    const subLabel = t.nav?.[sub.key] || sub.label || sub.key
                    const SubIconComponent = sub.icon || Globe
                    return (
                      <DesktopNavSubItem
                        key={sub.key}
                        to={resolvePath(sub.path)}
                        icon={SubIconComponent}
                        label={subLabel}
                        color={sub.color}
                        img={sub.img}
                        isFlyout={isDesktopSidebarDocked}
                      />
                    )
                  })}
                </DesktopNavDropdown>
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
                isDocked={isDesktopSidebarDocked}
              />
            )
          })}
      </div>

      <div className="p-3 flex flex-col gap-1 mt-auto border-t border-border">
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
              isDocked={isDesktopSidebarDocked}
            />
          )
        })}
      </div>
    </>
  )
}

export default DesktopNavItems
