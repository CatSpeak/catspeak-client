import React, { useState, useMemo } from "react"
import { Users, ChevronRight, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParams, useLocation } from "react-router-dom"
import { LANGUAGE_CONFIG } from "@/features/navigation"
import ListItem from "@/shared/components/ui/ListItem"
import { getSwitchCommunityPath } from "@/shared/utils/navigation"

const DEFAULT_COMMUNITY = "zh"

export const useCommunitySwitcher = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()
  const [overrideCommunity] = useState(null)

  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), [])

  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      return lang
    }
    return (
      overrideCommunity ||
      localStorage.getItem("communityLanguage") ||
      DEFAULT_COMMUNITY
    )
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
      window.location.href = getSwitchCommunityPath(
        location.pathname,
        currentCommunity,
        newCode,
      )
    } else {
      window.location.reload()
    }
  }

  const options = useMemo(
    () =>
      LANGUAGE_CONFIG.filter((config) => config.code !== "vi").map(
        (config) => ({
          ...config,
          value: config.code,
          label: t.header?.countries?.[config.labelKey] || config.fallbackLabel,
        }),
      ),
    [t],
  )

  const currentOption = useMemo(
    () => options.find((opt) => opt.value === currentCommunity),
    [options, currentCommunity],
  )

  return {
    t,
    currentCommunity,
    currentOption,
    options,
    handleCommunitySelect,
  }
}

export const MobileCommunityContent = ({ onSelect }) => {
  const { options, currentCommunity, handleCommunitySelect } =
    useCommunitySwitcher()

  return (
    <div className="flex flex-col w-full">
      {options.map((option) => {
        const isSelected = option.value === currentCommunity

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onSelect?.()
              handleCommunitySelect(option.value)
            }}
            className={`h-14 flex items-center gap-4 px-4 w-full transition-colors cursor-pointer ${
              isSelected
                ? "bg-itemActive hover:bg-itemActiveHover"
                : "hover:bg-itemHover"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-xs border border-border">
              <img
                src={option.flag}
                alt={option.label}
                className="block h-full w-full object-cover"
                draggable={false}
              />
            </span>
            <span
              className={`text-base flex-1 text-left ${isSelected ? "" : ""}`}
            >
              {option.label}
            </span>

            {/* Radio Button */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-cath-red-800 ml-auto">
              {isSelected && (
                <div className="h-3 w-3 rounded-full bg-cath-red-800" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

const MobileCommunitySwitcher = ({ onOpen }) => {
  const { t, currentOption } = useCommunitySwitcher()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof onOpen === "function"

  const handleOpen = () => {
    if (isControlled) {
      onOpen()
    } else {
      setInternalOpen(true)
    }
  }

  return (
    <div className="relative w-full">
      <ListItem
        onClick={handleOpen}
        leftContent={<Users size={24} strokeWidth={1.5} className="shrink-0" />}
        rightContent={
          <div className="flex items-center gap-2">
            {currentOption && (
              <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border">
                <img
                  src={currentOption.flag}
                  alt={currentOption.label}
                  className="block h-full w-full object-cover"
                  draggable={false}
                />
              </span>
            )}
            <ChevronRight className="shrink-0 text-gray-500" />
          </div>
        }
        className="transition-all duration-200 w-full"
        contentClassName="transition-all duration-200 px-4 hover:bg-itemHover"
        title={t.header?.community || "Cộng đồng"}
      >
        <span className="text-base font-normal text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate">
          {t.header?.community || "Cộng đồng"}
        </span>
      </ListItem>

      {/* Standalone fallback if not controlled by parent drawer */}
      {!isControlled && (
        <div
          className={`fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ${
            internalOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center px-3 shrink-0">
            <button
              type="button"
              onClick={() => setInternalOpen(false)}
              className="relative flex items-center justify-center w-full px-1 h-12 hover:bg-itemHover active:bg-itemActiveHover rounded-lg transition-colors"
            >
              <ChevronLeft
                size={20}
                strokeWidth={1.5}
                className="absolute left-1"
              />
              <span className="font-semibold truncate max-w-[80%]">
                {t.header?.community || "Cộng đồng"}
              </span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <MobileCommunityContent onSelect={() => setInternalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

MobileCommunitySwitcher.Content = MobileCommunityContent

export default MobileCommunitySwitcher
