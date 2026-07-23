import React from "react"
import colors from "@/shared/utils/colors"

/**
 * A reusable segmented buttons control tab selector.
 * @param {Object} props
 * @param {Array<{ value: string, label: string, icon?: React.ReactNode, startIcon?: React.ReactNode, endIcon?: React.ReactNode }>} props.options - List of option objects
 * @param {string} props.value - Currently active value
 * @param {Function} props.onChange - Callback fired with selected option value
 * @param {number} [props.segments=2] - Number of segments to display (default 2)
 * @param {string} [props.className] - Additional container styling
 */
const SegmentedButtons = ({
  options = [],
  value,
  onChange,
  segments = 2,
  className = "",
}) => {
  const visibleOptions = options.slice(0, segments)
  const total = visibleOptions.length

  const renderIcon = (icon) => {
    if (!icon) return null
    return (
      <span className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full shrink-0">
        {icon}
      </span>
    )
  }

  return (
    <div
      className={`flex items-center w-full shrink-0 select-none ${className}`}
    >
      {visibleOptions.map((option, index) => {
        const isSelected = option.value === value
        const isFirst = index === 0
        const isLast = index === total - 1

        const roundedClasses =
          isFirst && isLast
            ? "rounded-full"
            : isFirst
            ? "rounded-l-full"
            : isLast
            ? "rounded-r-full"
            : "rounded-none"

        const startIcon = option.startIcon || option.icon

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`group relative flex-1 flex items-center justify-center h-12 focus:outline-none ${
              !isFirst ? "-ml-[1px]" : ""
            } ${isSelected ? "z-10" : "z-0"}`}
          >
            <div
              className={`w-full h-10 px-4 text-sm font-medium flex items-center justify-center gap-2 transition whitespace-nowrap border ${roundedClasses} ${
                isSelected
                  ? "bg-cath-red-700 border-cath-red-700 text-white shadow-sm"
                  : "bg-white dark:bg-neutral-800 border-[#e5e5e5] dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 group-hover:bg-[#f3f3f3] dark:group-hover:bg-neutral-700 group-hover:text-neutral-900 dark:group-hover:text-white"
              }`}
            >
              {renderIcon(startIcon)}
              <span>{option.label}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedButtons
