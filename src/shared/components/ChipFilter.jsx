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
    : `flex items-center gap-2 overflow-x-auto scrollbar-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 ${
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
            className="shrink-0"
          >
            {item.label}
            {typeof item.count === "number" ? ` (${item.count})` : ""}
          </PillButton>
        )
      })}
    </div>
  )
}

export default ChipFilter
