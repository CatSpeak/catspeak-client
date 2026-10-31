import React, { useState, useRef, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParams, useLocation } from "react-router-dom"
import { LANGUAGE_CONFIG } from "@/features/navigation"
import LanguageMenuItem from "./LanguageMenuItem"
import useClickOutside from "@/shared/hooks/useClickOutside"

import { getSwitchCommunityPath } from "@/shared/utils/navigation"

const DEFAULT_COMMUNITY = "zh"

const CommunitySwitcher = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), [])

  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      localStorage.setItem("communityLanguage", lang)
      return lang
    }
    return localStorage.getItem("communityLanguage") || DEFAULT_COMMUNITY
  }, [lang, supportedCodes])

  const selectedLabel = useMemo(() => {
    const config = LANGUAGE_CONFIG.find((c) => c.code === currentCommunity)
    return (
      t.header?.countries?.[config?.labelKey] ||
      config?.fallbackLabel ||
      "Community"
    )
  }, [currentCommunity, t])

  const handleCommunitySelect = (newCode) => {
    if (newCode === currentCommunity) {
      setIsOpen(false)
      return
    }
    localStorage.setItem("communityLanguage", newCode)
    setIsOpen(false)

    const isInsideEcosystem =
      supportedCodes.includes(lang) ||
      location.pathname === `/${currentCommunity}` ||
      location.pathname.startsWith(`/${currentCommunity}/`)

    if (isInsideEcosystem) {
      window.location.href = getSwitchCommunityPath(
        location.pathname,
        currentCommunity,
        newCode,
      )
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="relative flex items-center h-12" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 px-4 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer focus:outline-none"
      >
        <span className="text-cath-red-700 dark:text-white text-sm font-semibold">
          {selectedLabel}
        </span>
        <ChevronDown
          size={20}
          className={`text-cath-red-700 dark:text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 min-w-[220px] z-50">
            <FluentAnimation
              direction="down"
              exit
              className="rounded-xl border border-border dark:border-[#3F3F3F] shadow-xl bg-white dark:bg-[#1A1A1A] overflow-hidden"
            >
              <div className="flex flex-col gap-1 p-1">
                {LANGUAGE_CONFIG.map((config) => {
                  // if (config.code === "vi") return null
                  return (
                    <LanguageMenuItem
                      key={config.code}
                      {...config}
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

export default CommunitySwitcher
