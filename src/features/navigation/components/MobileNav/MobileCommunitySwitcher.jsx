import React, { useState, useMemo } from "react"
import { Users, ChevronDown } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { LANGUAGE_CONFIG } from "@/features/navigation"
import Dropdown from "@/shared/components/ui/Dropdown"
import ListItem from "@/shared/components/ui/ListItem"

import { getSwitchCommunityPath } from "@/shared/utils/navigation"

const DEFAULT_COMMUNITY = "zh"

const MobileCommunitySwitcher = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [overrideCommunity, setOverrideCommunity] = useState(null)

  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), [])

  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      return lang
    }
    return overrideCommunity || localStorage.getItem("communityLanguage") || DEFAULT_COMMUNITY
  }, [lang, supportedCodes, overrideCommunity])

  const handleCommunitySelect = (newCode) => {
    if (newCode === currentCommunity) {
      return
    }
    localStorage.setItem("communityLanguage", newCode)

    const isInsideEcosystem =
      supportedCodes.includes(lang) ||
      location.pathname === `/${currentCommunity}` ||
      location.pathname.startsWith(`/${currentCommunity}/`)

    if (isInsideEcosystem) {
      window.location.href = getSwitchCommunityPath(location.pathname, currentCommunity, newCode)
    } else {
      window.location.reload()
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
          <ListItem
            onClick={toggle}
            leftContent={<Users size={24} strokeWidth={1.5} className="shrink-0" />}
            rightContent={
              <ChevronDown
                size={24}
                strokeWidth={1.5}
                className={`shrink-0 transition-transform duration-200 text-gray-500 ${isOpen ? "rotate-180" : ""
                  }`}
              />
            }
            className="rounded-xl transition-all duration-200 w-full"
            contentClassName={`rounded-xl transition-all duration-200 px-4 ${isOpen ? "bg-primaryBg" : "hover:bg-primaryBg"
              }`}
            title={t.header?.community || "Cộng đồng"}
          >
            <span className="text-base font-normal text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate">
              {t.header?.community || "Cộng đồng"}
            </span>
          </ListItem>
        )}
        renderOption={(option, isSelected) => (
          <div
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-colors ${isSelected ? "bg-gray-50/80" : "hover:bg-gray-50"
              }`}
          >
            <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm border border-border">
              <img
                src={option.flag}
                alt={option.label}
                className="block h-full w-full object-cover"
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
