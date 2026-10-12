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
                ? "border-cath-red-700 bg-cath-red-700/[0.06] shadow-sm"
                : "border-border bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSelected
                  ? "bg-cath-red-700 text-white"
                  : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
              }`}
              aria-hidden="true"
            >
              {showLock ? <Lock size={18} /> : option.icon}
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2">
                {option.label}
                {option.badge && (
                  <span className="rounded-full bg-cath-red-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {option.badge}
                  </span>
                )}
              </span>
              <span className="text-sm text-secondary">
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
