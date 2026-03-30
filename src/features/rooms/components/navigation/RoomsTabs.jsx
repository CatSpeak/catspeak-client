import React from "react"
import { MessageCircle, Monitor, Users, Layers } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const RoomsTabs = ({ tab, setTab }) => {
  const { t } = useLanguage()

  const tabs = [
    {
      value: "communicate",
      icon: MessageCircle,
      label: t.rooms.tabs.communicate,
    },
    { value: "teaching", icon: Monitor, label: t.rooms.tabs.teaching },
    { value: "group", icon: Users, label: t.rooms.tabs.group },
    { value: "class", icon: Layers, label: t.rooms.tabs.class },
  ]

  return (
    <div className="flex gap-8 overflow-x-auto border-b border-gray-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {tabs.map((tItem) => {
        if (tItem.value !== "communicate") return null

        const isSelected = tab === tItem.value
        const isDisabled = tItem.value !== "communicate"
        // const isDisabled = false
        const Icon = tItem.icon
        return (
          <button
            key={tItem.value}
            onClick={() => !isDisabled && setTab(tItem.value)}
            disabled={isDisabled}
            className={`
              relative flex items-center gap-2 py-3 px-1 text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${
                isSelected
                  ? "text-[#990011]"
                  : isDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-500 hover:text-black"
              }
            `}
          >
            <Icon size={18} />
            <span>{tItem.label}</span>

            {/* Underline Indicator */}
            {isSelected && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#990011] rounded-t-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default RoomsTabs
