import React, { useState, useRef, useMemo } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages"
import LanguageMenuItem from "./LanguageMenuItem"
import useClickOutside from "@/shared/hooks/useClickOutside"

const MotionDiv = motion.div
const MotionSpan = motion.span

const DEFAULT_COMMUNITY = "zh"

const navTap = { scale: 0.97 }
const navHover = { scale: 1.02 }

const DesktopCommunityDropdown = ({ navKey, isActive, onActivate }) => {
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
      window.location.href = newPath
    } else {
      window.location.href = `/${newCode}/community`
    }
  }

  const handleCommunityClick = () => {
    onActivate?.()
    navigate(`/${currentCommunity}/community`)
  }

  const inactiveRow =
    "text-headingColor hover:bg-cath-red-700/[0.06] hover:text-cath-red-700"
  const activeRow = "text-white"
  const rowTone = isActive ? activeRow : inactiveRow

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <MotionDiv whileHover={navHover} whileTap={navTap}>
        <div
          className={`relative flex h-9 items-center rounded-full ${rowTone}`}
        >
          {isActive ? (
            <MotionSpan
              layoutId="desktopNavActiveBg"
              className="pointer-events-none absolute inset-0 rounded-full bg-cath-red-700 shadow-[0_1px_6px_rgba(153,0,17,0.35)]"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          ) : null}

          <div className="relative z-10 flex h-full w-full items-center">
            <button
              type="button"
              onClick={handleCommunityClick}
              className={`flex h-full items-center pl-5 pr-2 text-sm font-semibold tracking-wide transition-colors ${isActive ? "" : "hover:bg-transparent"
                }`}
            >
              {selectedLabel || t.nav?.[navKey]}
            </button>

            <div className="relative flex h-full items-center pr-1">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen((prev) => !prev)
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isActive ? "hover:bg-white/15" : "hover:bg-black/[0.06]"
                  }`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <div className="absolute top-full right-0 z-50 mt-2 min-w-[240px]">
                    <FluentAnimation
                      direction="down"
                      exit
                      className="rounded-lg border border-[#E5E5E5] shadow-lg bg-white overflow-hidden"
                    >
                      <div className="flex flex-col gap-1 p-1 whitespace-nowrap">
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
          </div>
        </div>
      </MotionDiv>
    </div>
  )
}

export default DesktopCommunityDropdown
