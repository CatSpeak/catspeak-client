import React from "react"
import PillButton from "@/shared/components/ui/buttons/PillButton"

/**
 * ChipFilter — A reusable, responsive filter chip toolbar.
 * Supports horizontal scrolling on mobile/tablet and optional wrapping on desktop.
 *
 * @param {Array} options - Array of objects: { key?: string, value?: string, id?: string, label: ReactNode, count?: number }
 * @param {Array} items - Alias for options
 * @param {string} value - Currently active value/key
 * @param {string} activeKey - Alias for value
 * @param {function} onChange - Callback when a chip is clicked: (newKey) => void
 * @param {boolean} wrapDesktop - Whether chips wrap on lg screens (default true)
 * @param {string} className - Optional wrapper CSS classes
 */
const ChipFilter = ({
  options,
  items,
  value,
  activeKey,
  onChange,
  wrapDesktop = true,
  className = "",
}) => {
  const chipItems = items || options || []
  const currentActive = activeKey !== undefined ? activeKey : value

  const containerClasses = className
    ? className
    : `flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 ${
        wrapDesktop ? "lg:flex-wrap" : ""
      }`

  return (
    <div className={containerClasses}>
      {chipItems.map((item) => {
        const itemKey = item.key ?? item.value ?? item.id
        const isSelected = currentActive === itemKey

        return (
          <PillButton
            key={itemKey}
            variant={isSelected ? "primary" : "secondary"}
            onClick={() => onChange?.(itemKey)}
            className="shrink-0 flex-nowrap whitespace-nowrap"
          >
            <span className="whitespace-nowrap shrink-0">{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={`ml-1 min-w-5 h-5 px-1.5 shrink-0 inline-flex items-center justify-center text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}
              >
                {item.count}
              </span>
            )}
          </PillButton>
        )
      })}
    </div>
  )
}

export default ChipFilter
