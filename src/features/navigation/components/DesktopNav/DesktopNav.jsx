import React from "react"
import { navLinks } from "../../config/navigation"
import DesktopCommunityDropdown from "./DesktopCommunityDropdown"
import DesktopNavItem from "./DesktopNavItem"

const DesktopNav = () => {
  return (
    <nav className="hidden items-center justify-between rounded-full bg-[linear-gradient(180deg,#FAC126_0%,#990011_100%)] p-1 gap-2 text-white shadow-[0_4px_12px_rgba(194,19,26,0.2)] lg:flex">
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