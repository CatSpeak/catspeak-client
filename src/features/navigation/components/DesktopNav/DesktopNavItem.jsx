import React from "react"
import { NavLink, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"

const MotionDiv = motion.div
const MotionSpan = motion.span

const navTap = { scale: 0.97 }
const navHover = { scale: 1.02 }

const DesktopNavItem = ({ navKey, noActive, isActive, onActivate }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const { isAuthenticated } = useAuth()
  const authModal = useAuthModal()

  if (navKey === "cart" || navKey === "connect") return null

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
    href = "/"
  }

  const handleClick = (e) => {
    if (navKey === "workspace" && !isAuthenticated) {
      e.preventDefault()
      authModal.openAuthModal("login", "/workspace")
      return
    }
    onActivate?.()
  }

  return (
    <MotionDiv whileHover={navHover} whileTap={navTap} className="flex shrink-0">
      <NavLink
        to={href}
        onClick={handleClick}
        className={`
          relative flex min-w-max h-9 flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-5 text-sm font-semibold tracking-wide no-underline transition-colors duration-200
          ${noActive
            ? "text-headingColor/80 hover:bg-black/[0.05] hover:text-headingColor"
            : isActive
              ? "text-white"
              : "text-headingColor hover:bg-cath-red-700/[0.08] hover:text-cath-red-700"
          }
        `}
      >
        {!noActive && isActive ? (
          <MotionSpan
            layoutId="desktopNavActiveBg"
            className="pointer-events-none absolute inset-0 rounded-full bg-cath-red-700 shadow-[0_1px_6px_rgba(153,0,17,0.35)]"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        ) : null}
        <span className="relative z-10">
          {t.nav?.[navKey] || (navKey === "workspace" ? "My Workspace" : navKey)}
        </span>
      </NavLink>
    </MotionDiv>
  )
}

export default DesktopNavItem
