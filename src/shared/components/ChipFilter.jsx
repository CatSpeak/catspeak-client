import React from "react"

/**
 * ChipFilter — A reusable, responsive filter chip toolbar adhering to Material Design 3 Chip specs:
 * - Height: 32dp (h-8)
 * - Shape: 8dp corner radius (rounded-lg)
 * - Icon size: 18dp (w-[18px] h-[18px])
 * - Vertical alignment: Center-aligned (items-center)
 * - Horizontal alignment: Start-aligned (justify-start text-left)
 * - Padding: 16dp (px-4) without icon, 8dp (px-2 / pl-2) with icon
 * - Spacing between elements: 8dp (gap-2)
 *
 * Zero Layout Shift (CLS):
 * Keeps constant font-weight (font-medium), consistent 1px border box-sizing,
 * and identical padding across both unselected and selected states.
 *
 * @param {Array} options - Array of objects: { key?: string, value?: string, id?: string, label: ReactNode, icon?: ReactNode, startIcon?: ReactNode, endIcon?: ReactNode, count?: number } or primitives
 * @param {Array} items - Alias for options
 * @param {string|Array|Set} value - Currently active value(s)
 * @param {string|Array|Set} activeKey - Alias for value
 * @param {function} onChange - Callback when a chip is clicked: (newKey) => void
 * @param {boolean} wrap - Whether chips wrap on all screens
 * @param {boolean} wrapDesktop - Whether chips wrap on lg screens (default true)
 * @param {string} className - Optional wrapper CSS classes
 * @param {string} buttonClassName - Optional CSS classes for each chip button
 * @param {string} selectedVariant - Selected styling: "contrast" | "subtle" | "primary" (defaults to "contrast")
 */
const ChipFilter = ({
  options,
  items,
  value,
  activeKey,
  onChange,
  wrap = false,
  wrapDesktop = true,
  className = "",
  buttonClassName = "",
  selectedVariant = "contrast",
}) => {
  const chipItems = items || options || []
  const currentActive = activeKey !== undefined ? activeKey : value

  const checkSelected = (key) => {
    if (Array.isArray(currentActive)) {
      return currentActive.includes(key)
    }
    if (currentActive instanceof Set) {
      return currentActive.has(key)
    }
    return currentActive === key
  }

  const containerClasses = className
    ? className
    : wrap
    ? "flex flex-wrap items-center gap-2"
    : `flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 ${
        wrapDesktop ? "lg:flex-wrap" : ""
      }`

  const getVariantClasses = (isSelected, variant) => {
    if (!isSelected) {
      return "bg-white dark:bg-[#272727] text-gray-700 dark:text-[#AAAAAA] border border-border dark:border-[#3F3F3F] hover:bg-gray-50 dark:hover:bg-[#333333] hover:text-gray-900 dark:hover:text-white"
    }

    switch (variant) {
      case "contrast":
        return "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white"
      case "subtle":
        return "bg-[#FFF0F2] dark:bg-[#2D0A0E] text-cath-red-700 dark:text-[#FF8599] border border-cath-red-700/40 dark:border-[#66111E]"
      case "primary":
        return "bg-cath-red-700 dark:bg-cath-red-700 text-white border border-cath-red-700 dark:border-cath-red-700"
      default:
        return "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white"
    }
  }

  return (
    <div className={containerClasses}>
      {chipItems.map((item) => {
        const isPrimitive = typeof item === "string" || typeof item === "number"
        const itemKey = isPrimitive ? item : (item.key ?? item.value ?? item.id)
        const itemLabel = isPrimitive ? item : (item.label ?? itemKey)
        const isSelected = checkSelected(itemKey)

        const hasLeadingIcon = !isPrimitive && Boolean(item.icon || item.startIcon)
        const hasTrailingIcon = !isPrimitive && Boolean(item.endIcon)

        // Padding: 16dp (px-4) without icon, 8dp (pl-2 / pr-2) on side with icon
        const paddingClass =
          hasLeadingIcon && hasTrailingIcon
            ? "px-2"
            : hasLeadingIcon
            ? "pl-2 pr-4"
            : hasTrailingIcon
            ? "pl-4 pr-2"
            : "px-4"

        const stateClasses = getVariantClasses(isSelected, selectedVariant)

        return (
          <button
            key={itemKey}
            type="button"
            onClick={() => onChange?.(itemKey)}
            className={`h-8 rounded-lg inline-flex items-center justify-start text-left gap-2 text-sm font-medium transition-colors duration-150 cursor-pointer select-none shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/50 ${paddingClass} ${stateClasses} ${buttonClassName}`}
          >
            {hasLeadingIcon && (
              <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px] [&>svg]:w-[18px] [&>svg]:h-[18px]">
                {item.startIcon || item.icon}
              </span>
            )}

            <span className="whitespace-nowrap shrink-0">{itemLabel}</span>

            {hasTrailingIcon && (
              <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px] [&>svg]:w-[18px] [&>svg]:h-[18px]">
                {item.endIcon}
              </span>
            )}

            {typeof item?.count === "number" && (
              <span
                className={`min-w-[18px] h-[18px] px-1 text-[11px] font-semibold rounded-full inline-flex items-center justify-center transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-black/10 dark:bg-black/20 text-current"
                    : "bg-slate-100 dark:bg-[#3F3F3F] text-slate-600 dark:text-gray-300"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ChipFilter
