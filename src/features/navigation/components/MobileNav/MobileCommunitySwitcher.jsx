import React, { useMemo } from "react"
import { Users, ChevronDown } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParams, useLocation } from "react-router-dom"
import { LANGUAGE_CONFIG } from "@/features/navigation"
import { getNavItemClasses, getNavTextClasses } from "../../utils/navStyles"
import Dropdown from "@/shared/components/ui/Dropdown"

const DEFAULT_COMMUNITY = "zh"

const MobileCommunitySwitcher = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()

  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), [])

  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      return lang
    }
    return localStorage.getItem("communityLanguage") || DEFAULT_COMMUNITY
  }, [lang, supportedCodes])

  const handleCommunitySelect = (newCode) => {
    if (newCode === currentCommunity) {
      return
    }
    localStorage.setItem("communityLanguage", newCode)
    
    if (location.pathname.startsWith(`/${currentCommunity}`)) {
      window.location.href = location.pathname.replace(`/${currentCommunity}`, `/${newCode}`)
    } else {
      window.location.href = `/${newCode}`
    }
  }

  const options = LANGUAGE_CONFIG
    .filter(config => config.code !== "vi") // Community không có VN
    .map(config => ({
      ...config,
      value: config.code,
      label: t.header?.countries?.[config.labelKey] || config.fallbackLabel
    }))

  return (
    <div className="relative w-full">
      <Dropdown
        options={options}
        value={currentCommunity}
        onChange={handleCommunitySelect}
        dropdownClassName="!min-w-full w-full p-2"
        trigger={(isOpen, selectedOption, toggle) => (
          <button 
            className={`${getNavItemClasses(false, false)} ${isOpen ? "bg-[#F2F2F2]" : ""}`}
            onClick={toggle}
            title={t.header?.community || "Cộng đồng"}
          >
            <Users size={20} className="shrink-0" />
            <span className={getNavTextClasses(true)}>{t.header?.community || "Cộng đồng"}</span>
            
            <ChevronDown 
              size={18} 
              className={`shrink-0 transition-transform duration-200 text-gray-500 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
        renderOption={(option, isSelected) => (
          <div
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-colors ${
              isSelected ? "bg-gray-50/80" : "hover:bg-gray-50"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm border border-gray-100">
              <img
                src={option.flag}
                alt={option.label}
                className="block h-full w-full object-cover scale-[1.15]"
                draggable={false}
              />
            </span>
            <span className={`text-[15px] flex-1 text-left ${isSelected ? "text-cath-red-800 font-medium" : "text-gray-700"}`}>
              {option.label}
            </span>
            
            {/* Radio Button */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-cath-red-800 ml-auto">
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-cath-red-800" />}
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default MobileCommunitySwitcher
