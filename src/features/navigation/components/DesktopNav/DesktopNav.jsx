import React from "react"
import DesktopCommunityDropdown from "@/features/landing/components/LandingDesktopNav/DesktopCommunityDropdown"
import DesktopNavItem from "@/features/landing/components/LandingDesktopNav/DesktopNavItem"
import { navLinks } from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useAuth } from "@/features/auth"

const DesktopNav = () => {
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
        .map(({ key, hasDropdown, noActive, color, img }) => {
          if (hasDropdown && key === "community") {
            return <DesktopCommunityDropdown key={key} navKey={key} />
          }
          return (
            <DesktopNavItem
              key={key}
              navKey={key}
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
