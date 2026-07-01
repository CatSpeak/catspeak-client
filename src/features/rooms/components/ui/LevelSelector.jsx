import React from "react"
import { colors } from "@/shared/utils/colors"

const LevelSelector = ({ selectedLevel, onSelect, levels, t }) => {
  return (
    <div className="text-left flex flex-col gap-3">
      <label className="text-base font-semibold text-gray-800">{t.rooms.createRoom.requiredLevel}</label>
      <div className="flex flex-wrap justify-start gap-2">
        {levels?.map((level) => {
          const isSelected = selectedLevel === level.value
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onSelect(isSelected ? "" : level.value)}
              className={`inline-flex min-h-[48px] h-12 w-12 sm:w-auto items-center justify-center rounded-full sm:px-6 text-sm sm:text-base font-semibold transition-all duration-200 ease-out border ${
                isSelected
                  ? "bg-gradient-to-r from-cath-red-500 to-cath-red-700 border-transparent text-white shadow-md shadow-cath-red-500/20 transform scale-[1.05]"
                  : "bg-white border-gray-200 text-gray-700 hover:border-cath-red-300 hover:bg-red-50 hover:text-cath-red-700 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              }`}
            >
              {level.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LevelSelector
