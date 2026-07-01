import React, { useState, useRef, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParams, useLocation } from "react-router-dom"
import { LANGUAGE_CONFIG } from "@/features/navigation"
import LanguageMenuItem from "./LanguageMenuItem"
import useClickOutside from "@/shared/hooks/useClickOutside"

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
    return t.header?.countries?.[config?.labelKey] || config?.fallbackLabel || "Community"
  }, [currentCommunity, t])

  const handleCommunitySelect = (newCode) => {
    if (newCode === currentCommunity) { setIsOpen(false); return }
    localStorage.setItem("communityLanguage", newCode)
    setIsOpen(false)
    
    if (location.pathname.startsWith(`/${currentCommunity}`)) {
      window.location.href = location.pathname.replace(`/${currentCommunity}`, `/${newCode}`)
    } else {
      // Trường hợp path không có lang prefix (rất hiếm)
      window.location.href = `/${newCode}`
    }
  }

  return (
    <div className="hidden sm:block relative ml-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 cursor-pointer focus:outline-none"
      >
        <span className="text-cath-red-700 font-medium text-[16px]">
          {selectedLabel}
        </span>
        <ChevronDown
          size={18}
          className={`text-cath-red-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 min-w-[220px] z-[200]">
            <FluentAnimation
              direction="down"
              exit
              className="rounded-xl border border-[#E5E5E5] shadow-xl bg-white overflow-hidden"
            >
              <div className="flex flex-col gap-0.5 p-1.5">
                {LANGUAGE_CONFIG.map((config) => {
                  if (config.code === "vi") return null
                  return (
                    <LanguageMenuItem
                      key={config.code}
                      {...config}
                      isActive={currentCommunity === config.code}
                      label={t.header?.countries?.[config.labelKey] || config.fallbackLabel}
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
