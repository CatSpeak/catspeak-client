import React, { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { useAuth } from "@/features/auth"
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages"

/**
 * Trigger pill component for desktop sub-nav dropdowns (e.g. catSpeak, workspace, community).
 */
const DesktopSubNavDropdown = React.forwardRef(
  ({ item, onRequestLogin, isOpen }, ref) => {
    const { key, path, requiresAuth } = item
    const { t } = useLanguage()
    const { lang } = useParams()
    const navigate = useNavigate()
    const { checkIsActive } = useActiveLink()
    const { isAuthenticated } = useAuth()
    const isActive = checkIsActive(item)

    const isLocked = requiresAuth && !isAuthenticated

    const primaryHref = useMemo(() => {
      const currentLang =
        lang || localStorage.getItem("communityLanguage") || "zh"
      if (key === "catSpeak") {
        return `/${currentLang}/cat-speak/news`
      }
      if (key === "community") {
        return `/${currentLang}/community`
      }
      if (key === "workspace") return "/workspace"
      return path || "/"
    }, [key, path, lang])

    const handleLabelClick = (e) => {
      e.stopPropagation()
      if (isLocked) {
        onRequestLogin?.()
        return
      }
      navigate(primaryHref)
    }

    const displayLabel = t.nav?.[key] || (key === "community" ? "Community" : key)

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleLabelClick}
        className={`h-10 flex items-center justify-center gap-1.5 px-4 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-[#E5E5E5] active:bg-[#e0e0e0] whitespace-nowrap ${
          isOpen || isActive
            ? "text-[#990011]"
            : "text-black hover:text-[#990011]"
        } ${isLocked ? "cursor-pointer opacity-70" : "cursor-pointer"}`}
      >
        <span>{displayLabel}</span>

        {!isLocked && (
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex shrink-0 items-center justify-center"
          >
            <ChevronDown size={16} />
          </motion.span>
        )}
      </button>
    )
  }
)

DesktopSubNavDropdown.displayName = "DesktopSubNavDropdown"

export default DesktopSubNavDropdown
