import React from "react"
import { NavLink, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "../../hooks/useActiveLink"

const DesktopNavItem = ({ navKey, noActive }) => {
  if (navKey === "cart" || navKey === "connect") return null
  const { t } = useLanguage()
  const { lang } = useParams()

  // Determine href based on key
  let href
  if (navKey === "catSpeak") {
    const currentLang =
      lang || localStorage.getItem("communityLanguage") || "zh"
    href = `/${currentLang}/cat-speak/news`
  } else if (navKey === "cart") {
    href = "/cart"
  } else if (navKey === "connect") {
    href = "/connect"
  } else if (navKey === "workspace") {
    href = "/workspace"
  } else {
    // Default fallback
    href = "/"
  }

  // Active state check
  const isActive = useActiveLink(navKey)

  return (
    <NavLink
      to={href}
      className={`
        flex min-w-max h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full px-6 text-sm font-semibold tracking-wide transition-colors duration-200 no-underline hover:bg-white/10
        ${
          noActive
            ? "text-white/70 hover:text-white"
            : isActive
              ? "text-white hover:text-white"
              : "text-white/70 hover:text-white"
        }
      `}
    >
      {t.nav?.[navKey] || (navKey === "workspace" ? "My Workspace" : navKey)}
    </NavLink>
  )
}

export default DesktopNavItem
