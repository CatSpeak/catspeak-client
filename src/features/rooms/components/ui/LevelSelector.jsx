import React from "react"
import { colors } from "@/shared/utils/colors"

const LevelSelector = ({ selectedLevel, onSelect, levels, t }) => {
  return (
    <div className="text-left flex flex-col gap-3">
      <label className="text-base">{t.rooms.createRoom.requiredLevel}</label>
      <div className="flex flex-wrap justify-start gap-2">
        {levels?.map((level) => {
          const isSelected = selectedLevel === level.value
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onSelect(isSelected ? "" : level.value)}
              className={`inline-flex min-h-[48px] h-12 items-center rounded-full px-4 text-base border transition-colors ${
                isSelected
                  ? "bg-cath-red-700 border-cath-red-700 text-white hover:bg-cath-red-800 hover:border-cath-red-800"
                  : "border-[#C6C6C6] hover:bg-[#F2F2F2]"
              }`}
            >
              {level.labelKey ? t.rooms?.filters?.levels?.[level.labelKey] || level.label : level.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LevelSelector
