import React from "react"
import { NavLink, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "../../hooks/useActiveLink"

const MobileNavItem = ({ navKey, onClose }) => {
  if (navKey === "cart" || navKey === "connect") return null;
  const { t } = useLanguage()
  const { lang } = useParams()

  const currentLang = lang || localStorage.getItem("communityLanguage") || "en"

  let href
  if (navKey === "catSpeak") {
    href = `/${currentLang}/cat-speak/news`
  } else if (navKey === "cart") {
    href = "/cart"
  } else if (navKey === "connect") {
    href = "/connect"
  } else {
    href = "/"
  }

  const isActive = useActiveLink(navKey)

  return (
    <NavLink
      to={href}
      onClick={onClose}
      className={`flex items-center px-3 h-10 text-sm rounded-[5px] transition-colors ${
        isActive
          ? "text-[#990011] bg-[#F2F2F2] hover:bg-[#E6E6E6]"
          : "hover:bg-[#F2F2F2]"
      }`}
    >
      {t.nav[navKey]}
    </NavLink>
  )
}

export default MobileNavItem
