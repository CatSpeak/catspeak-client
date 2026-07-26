import React from "react"
import DesktopCommunityDropdown from "./DesktopCommunityDropdown"
import DesktopNavItem from "./DesktopNavItem"
import DesktopSubNavDropdown from "./DesktopSubNavDropdown"
import { navLinks } from "@/features/navigation/config/navigation"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { useAuth } from "@/features/auth"

const DesktopNav = ({ onRequestLogin }) => {
  const { currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()

  return (
    <nav className="hidden items-center justify-center p-1 gap-2 text-black lg:flex">
      {navLinks
        .filter((item) => {
          if (item.hideInSidebar) return false
          if (item.lang && item.lang !== currentLang) return false
          if (item.showOnHorizontalBar === false) return false
          if (item.isPrivate && !isAuthenticated) return false
          return true
        })
        .map((item) => {
          const { key, path, hasDropdown, subItems, noActive, color, img } = item

          // Community: language-picker dropdown
          if (hasDropdown && key === "community") {
            return <DesktopCommunityDropdown key={key} navKey={key} />
          }

          // Items with subroutes: hover dropdown
          if (subItems && subItems.length > 0) {
            return (
              <DesktopSubNavDropdown
                key={key}
                item={item}
                onRequestLogin={onRequestLogin}
              />
            )
          }

          // Plain nav link
          return (
            <DesktopNavItem
              key={key}
              navKey={key}
              path={path}
              noActive={noActive}
              color={color}
              img={img}
            />
          )
        })}
    </nav>
  )
}

export default DesktopNav