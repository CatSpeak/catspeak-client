import React, { useRef, useState } from "react"
import { NavLink, useNavigate, useParams } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { useAuth } from "@/features/auth"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"

/**
 * Hover-triggered dropdown for nav items that have subItems (e.g. catSpeak, workspace).
 * - Clicking the label navigates to the primary route.
 * - Hovering the whole pill reveals subroute links.
 * - If item.requiresAuth and user is not authenticated:
 *     • Hover dropdown is suppressed
 *     • Click opens the login modal instead of navigating
 */
const DesktopSubNavDropdown = ({ item, onRequestLogin }) => {
  const { key, subItems = [], path, requiresAuth } = item
  const { t } = useLanguage()
  const { lang } = useParams()
  const navigate = useNavigate()
  const { checkIsActive, resolvePath, currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()
  const { isStudent } = useRoleOverride()
  const isActive = checkIsActive(item)

  // Gate: show dropdown & allow navigation only when authenticated (if requiresAuth)
  const isLocked = requiresAuth && !isAuthenticated

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const closeTimer = useRef(null)

  // For catSpeak the primary link is lang-prefixed
  const primaryHref =
    key === "catSpeak"
      ? `/${lang || localStorage.getItem("communityLanguage") || "zh"}/cat-speak/news`
      : path || `/${key}`

  const handleMouseEnter = () => {
    if (isLocked) return
    clearTimeout(closeTimer.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 120)
  }

  const handleLabelClick = () => {
    if (isLocked) {
      onRequestLogin?.()
      return
    }
    navigate(primaryHref)
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger pill */}
      <div
        className={`flex items-center justify-center text-base tracking-wide font-bold transition-colors duration-200 ${isOpen || isActive
          ? "text-[#990011]"
          : "text-black hover:text-[#990011]"
          }`}
      >
        {/* Clickable label */}
        <div
          onClick={handleLabelClick}
          className={`h-10 flex items-center pl-4 pr-1 rounded-l-full transition-colors whitespace-nowrap hover:bg-gray-100/50 ${isLocked ? "cursor-pointer opacity-70" : "cursor-pointer"
            }`}
        >
          {t.nav?.[key] || key}
        </div>

        {/* Chevron — only shown for authenticated or non-locked items */}
        {!isLocked && (
          <div className="h-10 w-8 flex items-center justify-center rounded-r-full hover:bg-gray-100/50 transition-colors cursor-default">
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                }`}
            />
          </div>
        )}
      </div>

      {/* Dropdown panel — only for authenticated users */}
      <AnimatePresence>
        {isOpen && !isLocked && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] z-50">
            <FluentAnimation
              direction="down"
              distance={12}
              duration={0.22}
              exit
              className="rounded-xl border border-[#E5E5E5] shadow-xl bg-white overflow-hidden"
            >
              <div className="flex flex-col gap-0.5 p-1.5">
                {subItems
                  .filter((sub) => {
                    if (sub.lang && sub.lang !== currentLang) return false
                    if (sub.isPrivate && !isAuthenticated) return false

                    const teacherTabs = ["myCourses", "myClass", "analytics", "schedule", "teachingTasks"]
                    if (teacherTabs.includes(sub.key) && isStudent) return false

                    return true
                  })
                  .map((sub) => {
                    const Icon = sub.icon
                    const href = resolvePath(sub.path) || sub.path
                    return (
                      <React.Fragment key={sub.key}>
                        {sub.key === "myCourses" && (
                          <div className="my-1 mx-2 border-t border-black" />
                        )}
                        <NavLink
                          to={href}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive: linkActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 no-underline whitespace-nowrap ${linkActive
                              ? "bg-[#990011]/8 text-[#990011]"
                              : "text-gray-700 hover:bg-gray-100 hover:text-[#990011]"
                            }`
                          }
                        >
                          {Icon && (
                            <Icon size={15} className="shrink-0 opacity-70" />
                          )}
                          <span>{t.nav?.[sub.key] || sub.key}</span>
                        </NavLink>
                      </React.Fragment>
                    )
                  })}
              </div>
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DesktopSubNavDropdown

