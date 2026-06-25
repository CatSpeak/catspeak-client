import React, { useState, useEffect, useRef, useMemo } from "react"
import { Menu, Search, Filter, ChevronDown, SlidersHorizontal } from "lucide-react"
import HeaderUserControls from "./HeaderUserControls"
import HeaderGuestControls from "./HeaderGuestControls"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalPresence } from "@/shared/context/GlobalPresenceContext"
import { useParams, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages"
import LanguageMenuItem from "@/features/navigation/components/DesktopNav/LanguageMenuItem"
import useClickOutside from "@/shared/hooks/useClickOutside"
import { createPortal } from "react-dom"
import RoomFilterModal from "@/features/rooms/components/navigation/RoomFilterModal"
import { X } from "lucide-react"

const DEFAULT_COMMUNITY = "zh"

const CommunityHeader = ({ onGetStarted, onMenuClick }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  const { t } = useLanguage()
  const { onlineCounts, activeLanguageCode } = useGlobalPresence()
  const { lang } = useParams()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    const isInsideEcosystem =
      location.pathname.startsWith(`/${currentCommunity}/community`) ||
      location.pathname.startsWith(`/${currentCommunity}/cat-speak`)
    if (isInsideEcosystem) {
      window.location.href = location.pathname.replace(`/${currentCommunity}`, `/${newCode}`)
    } else {
      window.location.href = `/${newCode}/community`
    }
  }

  const getLanguageString = (code) => {
    switch (code) {
      case "en": return "english"
      case "vi": return "vietnamese"
      case "zh": return "chinese"
      default: return "english"
    }
  }

  const currentLang = lang || activeLanguageCode || "zh"
  const currentOnlineCount = onlineCounts[getLanguageString(currentLang)] || 0

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="flex w-full h-[64px] items-center justify-between px-6">
        
        {/* Left Section: Mobile Menu + Community Switcher + Online count */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md shrink-0"
            >
              <Menu size={24} />
            </button>
          )}

          {/* Community Switcher - text style trigger + dropdown */}
          <div className="hidden sm:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen((p) => !p)}
              className="flex items-center gap-2 cursor-pointer focus:outline-none "
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

          <div className="hidden sm:flex items-center gap-2">
            <div className="relative flex h-3 w-3 items-center justify-center shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <span className="text-[13px] text-gray-600 font-medium">
              {currentOnlineCount} {t.welcomeSection?.presence?.onlineIn || "đang trực tuyến"}
            </span>
          </div>
        </div>

        {/* Right Section: Search + Filter + Lang + User */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="hidden md:flex items-center relative w-[260px]">
            <Search className="w-[17px] h-[17px] text-gray-500 absolute left-4" strokeWidth={2.5} />
            <input
              type="text"
              placeholder={t.header?.searchPlaceholder || "Tìm kiếm phòng hoặc chủ đề"}
              className="w-full h-10 pl-11 pr-4 bg-[#F0F0F0] border-transparent focus:bg-white focus:border-cath-red-700 focus:ring-1 focus:ring-cath-red-700 rounded-full text-[14px] outline-none transition-all placeholder-gray-500"
            />
          </div>

          {/* Filter */}
          <button 
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#F0F0F0] hover:bg-gray-200 text-gray-700 transition-colors shrink-0"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal size={20} strokeWidth={2} />
          </button>

          {/* Language flag */}
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          {isLoggedIn ? (
            <HeaderUserControls />
          ) : (
            <HeaderGuestControls onGetStarted={onGetStarted} />
          )}
        </div>
      </div>

      {/* Professional Filter Modal */}
      <RoomFilterModal 
        open={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
    </header>
  )
}

export default CommunityHeader
