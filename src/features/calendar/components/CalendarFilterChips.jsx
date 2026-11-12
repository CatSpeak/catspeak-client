import React from "react"
import { X } from "lucide-react"

/**
 * CalendarFilterChips — Active/dismissible filter chips.
 * Entire chip is clickable to remove the filter for optimal touch target & UX.
 *
 * @param {Array<{ key: string, label: string }>} chips - Active filter chips
 * @param {function} onRemove - Callback invoked with chip.key when chip is clicked
 * @param {string} className - Optional wrapper container CSS classes
 * @param {string} variant - "amber" (default) | "primary" | "contrast"
 */
const CalendarFilterChips = ({
  chips = [],
  onRemove,
  className = "",
  variant = "amber",
}) => {
  if (!chips || chips.length === 0) return null

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        // Exact styling from ChipFilter selected primary
        return "h-8 rounded-lg bg-primary text-white border border-primary hover:bg-primary/90 dark:bg-primary dark:text-white dark:border-primary text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/50"
      case "contrast":
        // Exact styling from ChipFilter contrast
        return "h-8 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white hover:opacity-90 text-sm font-medium focus-visible:ring-2 focus-visible:ring-gray-400"
      case "amber":
      default:
        // Original amber accent (#F4AB1B)
        return "h-8 rounded-full bg-[#F4AB1B] hover:bg-[#e09b15] active:bg-[#cc8b10] text-black text-sm font-semibold shadow-xs focus-visible:ring-2 focus-visible:ring-black/40"
    }
  }

  const chipClasses = getVariantStyles()
  // Padding rule: px-3 for text-only, pl-3 pr-2 when close icon is on the right
  const hasTrailingIcon = Boolean(onRemove)
  const paddingClass = hasTrailingIcon ? "pl-3 pr-2" : "px-3"

  return (
    <div
      className={`flex flex-wrap items-center gap-2 mb-4 justify-end ${className}`}
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove?.(chip.key)}
          aria-label={`Remove filter ${chip.label}`}
          className={`inline-flex items-center gap-2 select-none shrink-0 transition-colors duration-150 cursor-pointer outline-none ${paddingClass} ${chipClasses}`}
        >
          <span className="whitespace-nowrap">{chip.label}</span>
          <X size={18} className="shrink-0" />
        </button>
      ))}
    </div>
  )
}

export default CalendarFilterChips
