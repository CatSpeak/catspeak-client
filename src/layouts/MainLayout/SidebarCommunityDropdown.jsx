import React, { useState, useRef, useMemo } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { ChevronDown, Globe } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages"
import LanguageMenuItem from "@/features/navigation/components/DesktopNav/LanguageMenuItem"
import useClickOutside from "@/shared/hooks/useClickOutside"

const DEFAULT_COMMUNITY = "zh"

const SidebarCommunityDropdown = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const handleCommunitySelect = (newCode) => {
    if (newCode === currentCommunity) {
      setIsOpen(false)
      return
    }

    localStorage.setItem("communityLanguage", newCode)
    setIsOpen(false)

    const isInsideEcosystem =
      location.pathname.startsWith(`/${currentCommunity}/community`) ||
      location.pathname.startsWith(`/${currentCommunity}/cat-speak`)

    if (isInsideEcosystem) {
      const newPath = location.pathname.replace(
        `/${currentCommunity}`,
        `/${newCode}`,
      )
      navigate(newPath)
    } else {
      navigate(`/${newCode}/community`)
    }
  }

  return (
    <div className="relative mb-4 w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full relative flex items-center justify-between px-4 h-10 rounded-lg transition-colors overflow-hidden ${
          isOpen ? "bg-[#F2F2F2]" : "hover:bg-[#F2F2F2]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Globe size={20} />
          <span className="text-sm truncate">
            {t.nav?.community || "Community"}: {selectedLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <FluentAnimation
              direction="down"
              exit
              className="rounded-lg border border-gray-100 shadow-lg bg-white overflow-hidden max-h-[300px] overflow-y-auto"
            >
              <div className="flex flex-col">
                {LANGUAGE_CONFIG.map((config) => {
                  if (config.code === "vi") return null
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

export default SidebarCommunityDropdown
