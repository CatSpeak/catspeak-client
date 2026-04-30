import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useUrlFilter } from "../../hooks/useUrlFilter"
import { LEVELS } from "../../config/constants"
import { ChevronDown } from "lucide-react"

const LevelFilter = () => {
  const { lang } = useParams()
  const { t } = useLanguage()
  const { toggleValue, isSelected, clearAll } = useUrlFilter("requiredLevels")
  const [isOpen, setIsOpen] = useState(true)

  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
  }
  const currentLanguage = lang ? langMap[lang] : "English"
  const baseLevels = LEVELS[currentLanguage] || LEVELS.English

  const additionalLevels = [
    {
      label: t.rooms?.filters?.levels?.beginner || "Beginner",
      value: "Beginner",
    },
    {
      label: t.rooms?.filters?.levels?.intermediate || "Intermediate",
      value: "Intermediate",
    },
    {
      label: t.rooms?.filters?.levels?.advanced || "Advanced",
      value: "Advanced",
    },
  ]

  const currentLevels = [
    ...baseLevels,
    ...additionalLevels.filter(
      (level) => !baseLevels.some((bl) => bl.value === level.value),
    ),
  ]

  const selectedCount = currentLevels.filter((levelObj) =>
    isSelected(levelObj.value),
  ).length

  return (
    <div className="w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between h-10 px-2 text-sm font-semibold text-gray-800 hover:text-[#990011] transition-colors duration-200 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2">
          <span>{t.rooms?.filters?.levelsHeading || "Levels"}</span>
          {selectedCount > 0 && (
            <span className="flex items-center justify-center bg-[#990011] text-white text-xs rounded-full min-w-[20px] h-5 px-1">
              {selectedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clearAll()
              }}
              className="px-3 h-10 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-[#990011] rounded-md transition-colors"
            >
              {t.rooms?.filters?.clear || "Clear"}
            </button>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="flex flex-col gap-0.5 pt-1 pb-2 max-h-[200px] overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5 pr-1">
          {currentLevels.map((levelObj) => {
            const isChecked = isSelected(levelObj.value)

            return (
              <label
                key={levelObj.value}
                className={`h-10 shrink-0 flex items-center gap-3 cursor-pointer rounded-md px-2 transition-colors ${isChecked ? "bg-[#F2F2F2] hover:bg-[#E5E5E5]" : "hover:bg-[#F2F2F2]"}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    toggleValue(levelObj.value, e.target.checked)
                  }
                  className="w-4 h-4 text-[#990011] bg-white accent-[#990011] cursor-pointer"
                />
                <span className="text-sm">{levelObj.label}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LevelFilter
