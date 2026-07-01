import React from "react"
import DesktopCommunityDropdown from "./DesktopCommunityDropdown"
import DesktopNavItem from "./DesktopNavItem"
import { navLinks } from "@/features/navigation/config/navigation"

const DesktopNav = () => {
  return (
    <nav className="hidden items-center justify-center p-1 gap-2 text-black lg:flex">
      {navLinks.map(({ key, hasDropdown, noActive }) => {
        if (hasDropdown && key === "community") {
          return <DesktopCommunityDropdown key={key} navKey={key} />
        }
        return <DesktopNavItem key={key} navKey={key} noActive={noActive} />
      })}
    </nav>
  )
}

export default DesktopNav