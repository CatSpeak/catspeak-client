import React, { useEffect, useState, useRef, useMemo } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"

import LanguageMenuItem from "@/shared/components/Header/LanguageMenuItem"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages"

import { getSwitchCommunityPath } from "@/shared/utils/navigation"

const DEFAULT_COMMUNITY = "zh"

const DesktopCommunityDropdown = ({ navKey }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = useActiveLink(navKey)

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const closeTimer = useRef(null)

  const [overrideCommunity, setOverrideCommunity] = useState(null)

  // ---- Supported codes (dynamic, scalable) ----
  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), [])

  // ---- Determine current community (URL first, then localStorage) ----
  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      localStorage.setItem("communityLanguage", lang)
      return lang
    }

    return overrideCommunity || localStorage.getItem("communityLanguage") || DEFAULT_COMMUNITY
  }, [lang, supportedCodes, overrideCommunity])

  // ---- Derive label (no state needed) ----
  const selectedLabel = useMemo(() => {
    const config = LANGUAGE_CONFIG.find((c) => c.code === currentCommunity)

    return (
      t.header?.countries?.[config?.labelKey] ||
      config?.fallbackLabel ||
      "Community"
    )
  }, [currentCommunity, t])

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setIsOpen(false), 150)
  }

  // ---- Close dropdown on outside click ----
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ---- Switch community ----
  const handleCommunitySelect = (newCode) => {
    localStorage.setItem("communityLanguage", newCode)
    setIsOpen(false)
    navigate(`/${newCode}/community`)
  }

  // ---- Navigate to current/default community on trigger click ----
  const handleCommunityClick = (e) => {
    e.stopPropagation()
    const activeCommunity = supportedCodes.includes(lang) ? lang : (localStorage.getItem("communityLanguage") || "zh")
    navigate(`/${activeCommunity}/community`)
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Unified Trigger Pill */}
      <button
        type="button"
        onClick={handleCommunityClick}
        className={`h-10 flex items-center justify-center gap-1.5 px-4 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-[#E5E5E5] active:bg-[#e0e0e0] whitespace-nowrap cursor-pointer ${
          isOpen || isActive
            ? "text-[#990011]"
            : "text-black hover:text-[#990011]"
        }`}
      >
        <span>{t.nav?.[navKey] || "Community"}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex shrink-0 items-center justify-center"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] z-50">
            <FluentAnimation
              direction="down"
              distance={10}
              duration={0.22}
              exit
              className="rounded-2xl border border-border shadow-2xl bg-white overflow-hidden"
            >
              <div className="flex flex-col gap-1 p-1 whitespace-nowrap">
                {LANGUAGE_CONFIG.map((config) => {
                  if (config.code === "vi") return null
                  return (
                    <LanguageMenuItem
                      key={config.code}
                      {...config}
                      flagSize={20}
                      variant="landing"
                      isActive={currentCommunity === config.code}
                      label={
                        t.header?.countries?.[config.labelKey] ||
                        config.fallbackLabel
                      }
                      soonLabel={t.header?.soon || "Soon"}
                      onSelect={() => handleCommunitySelect(config.code)}
                    />
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

export default DesktopCommunityDropdown
