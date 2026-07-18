import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { Home, Settings } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DesktopNavItem from "./DesktopNavItem"
import DesktopNavDropdown from "./DesktopNavDropdown"
import DesktopNavSubItem from "./DesktopNavSubItem"
import { navLinks, footerLinks } from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useSidebar } from "@/shared/context/SidebarContext"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"

const DesktopNavItems = () => {
  const { t } = useLanguage()
  const { isStudent } = useRoleOverride()
  const { resolvePath, checkIsActive, pathname } = useActiveLink()

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
        {navLinks
          .filter((item) => !item.hideInSidebar)
          .map((item) => {
            // Use key mapping for translations, falling back to capitalized key if not found
            const label = t.nav?.[item.key] || item.key
            const IconComponent = item.icon || Home

            if (item.hasDropdown && item.subItems && item.subItems.length > 0) {
              return (
                <DesktopNavDropdown
                  key={item.key}
                  icon={IconComponent}
                  label={label}
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
                  {(item.subItems || [])
                    .filter((sub) => {
                      if (sub.key === "myCourses" && isStudent) return false
                      return true
                    })
                    .map((sub, idx) => {
                      const subLabel = t.nav?.[sub.key] || sub.key
                      const SubIconComponent = sub.icon || Home
                      return (
                        <DesktopNavSubItem
                          key={sub.key}
                          to={resolvePath(sub.path)}
                          icon={SubIconComponent}
                          label={subLabel}
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
                isDocked={isDesktopSidebarDocked}
              />
            )
          })}
      </div>

      <div className="p-3 flex flex-col gap-1 mt-auto border-t border-border">
        {footerLinks.map((item) => {
          const label = t.nav?.[item.key] || item.key
          const IconComponent = item.icon || Settings

          return (
            <DesktopNavItem
              key={item.key}
              to={resolvePath(item.path)}
              icon={IconComponent}
              label={label}
              isDocked={isDesktopSidebarDocked}
            />
          )
        })}
      </div>
    </>
  )
}

export default DesktopNavItems
