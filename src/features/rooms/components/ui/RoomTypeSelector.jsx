import React from "react"
import Radio from "@/shared/components/ui/inputs/Radio"

/**
 * Descriptive two-up choice cards used in place of tabs.
 * Features a built-in Radio indicator for unambiguous selection state.
 */
const RoomTypeSelector = ({ value, onChange, options = [], ariaLabel }) => {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {options.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`group relative flex w-full items-center gap-4 rounded border border-border dark:border-[#3F3F3F] px-4 h-[72px] text-left outline-none transition-colors duration-150 cursor-pointer ${
              isSelected
                ? "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D]"
                : "bg-white dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#272727]"
            } active:bg-itemActiveHover dark:active:bg-[#3D3D3D]`}
          >
            {/* Selection indicator: Radio button */}
            <div className="shrink-0 flex items-center justify-center pointer-events-none">
              <Radio checked={isSelected} />
            </div>

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                {option.label}
                {option.badge && (
                  <span className="rounded-full bg-cath-red-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {option.badge}
                  </span>
                )}
              </span>
              <span className="text-sm text-secondary dark:text-[#AAAAAA] line-clamp-1">
                {option.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default RoomTypeSelector
