import React, { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { navLinks } from "../../config/navigation"
import { getActiveDesktopNavKey } from "../../hooks/useActiveLink"
import DesktopCommunityDropdown from "./DesktopCommunityDropdown"
import DesktopNavItem from "./DesktopNavItem"

const DesktopNav = () => {
  const location = useLocation()
  const routeActiveKey = useMemo(
    () => getActiveDesktopNavKey(location.pathname),
    [location.pathname],
  )
  const [activeKey, setActiveKey] = useState(routeActiveKey)

  useEffect(() => {
    setActiveKey(routeActiveKey)
  }, [routeActiveKey])

  return (
    <nav
      role="navigation"
      aria-label="Main"
      className="flex items-center gap-0.5 rounded-full border border-cath-red-700/12 bg-white/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md supports-[backdrop-filter]:bg-white/45"
    >
      {navLinks.map(({ key, hasDropdown, noActive }) => {
        if (key === "cart" || key === "connect") return null

        if (hasDropdown && key === "community") {
          return (
            <DesktopCommunityDropdown
              key={key}
              navKey={key}
              isActive={activeKey === key}
              onActivate={() => setActiveKey(key)}
            />
          )
        }

        return (
          <DesktopNavItem
            key={key}
            navKey={key}
            noActive={noActive}
            isActive={!noActive && activeKey === key}
            onActivate={() => setActiveKey(key)}
          />
        )
      })}
    </nav>
  )
}

export default DesktopNav
