import React from "react"
import { Lock } from "lucide-react"

/**
 * Descriptive two-up choice cards used in place of tabs.
 * A plain button with `aria-pressed` keeps the semantics measurable
 * (see UI Pro Max: "Compact Control Semantics").
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
        const showLock = option.locked && !isSelected

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`group relative flex w-full items-center gap-4 rounded-md border px-4 h-[72px] text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cath-red-700 focus-visible:ring-offset-2 ${
              isSelected
                ? "border-cath-red-700 dark:border-[#FF0033] bg-cath-red-700/[0.06] dark:bg-[#370006] shadow-sm"
                : "border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#272727]"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSelected
                  ? "bg-cath-red-700 dark:bg-[#FF0033] text-white"
                  : "bg-gray-100 dark:bg-[#272727] text-gray-500 dark:text-[#AAAAAA] group-hover:bg-gray-200 dark:group-hover:bg-[#3D3D3D]"
              }`}
              aria-hidden="true"
            >
              {showLock ? <Lock size={18} /> : option.icon}
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                {option.label}
                {option.badge && (
                  <span className="rounded-full bg-cath-red-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {option.badge}
                  </span>
                )}
              </span>
              <span className="text-sm text-secondary dark:text-[#AAAAAA]">
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
