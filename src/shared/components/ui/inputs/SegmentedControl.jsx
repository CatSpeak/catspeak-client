import React, { memo, useId } from "react"
import { motion, LayoutGroup } from "framer-motion"

/**
 * Reusable SegmentedControl component.
 * Uses Framer Motion's shared layout spring animation for a fluid, natural slide
 * transition with momentum deceleration (without jelly/stretching volume distortion).
 *
 * Specifications:
 * - Wrapper height: 48px (`h-12`)
 * - Button height: 40px (`h-10`)
 * - Balanced gap: 4px symmetrically on all sides
 * - Typography: `text-sm font-semibold`
 * - Icon: 20x20 (`w-5 h-5` / `size={20}`)
 * - Gap: `gap-2` between icon and label
 * - Shape: Fully rounded (`rounded-full`)
 * - Dark mode: Fully supported with dark theme tokens
 *
 * @param {Object} props
 * @param {Array<{ value: string|number, label?: React.ReactNode, icon?: React.ComponentType|React.ReactNode, iconClassName?: string, disabled?: boolean }>} props.options - Items to display
 * @param {string|number} props.value - Currently selected value
 * @param {Function} props.onChange - Callback fired with selected value
 * @param {string} [props.id] - Optional custom layout ID for scoped animations
 * @param {string} [props.className] - Additional classes for wrapper container
 * @param {string} [props.buttonClassName] - Additional classes for each button
 * @param {string} [props.activeClassName] - Text style when active
 * @param {string} [props.inactiveClassName] - Text style when inactive
 * @param {string} [props.indicatorClassName] - Styling for the animated active pill
 * @param {number} [props.iconSize=20] - Icon size in px (default: 20)
 * @param {boolean} [props.fullWidth=false] - Whether buttons stretch equally across container
 * @param {boolean} [props.disabled=false] - Whether the entire control is disabled
 * @param {Object} [props.transition] - Custom Framer Motion transition config
 */
const SegmentedControl = memo(
  ({
    options = [],
    value,
    onChange,
    id,
    className = "",
    buttonClassName = "",
    activeClassName = "text-gray-900 dark:text-white",
    inactiveClassName = "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white",
    indicatorClassName = "bg-white dark:bg-[#323232] shadow-xs",
    iconSize = 20,
    fullWidth = false,
    disabled = false,
    transition,
    "aria-label": ariaLabel,
  }) => {
    const generatedId = useId()
    const layoutGroupId = id || `segmented-group-${generatedId.replace(/:/g, "")}`
    const pillLayoutId = `segmented-pill-${generatedId.replace(/:/g, "")}`

    // Smooth glide transition: direct ease with zero spring bounce, overshoot, or jiggle
    const smoothTransition = transition || {
      type: "tween",
      ease: [0.25, 1, 0.5, 1],
      duration: 0.22,
    }

    return (
      <LayoutGroup id={layoutGroupId}>
        <div
          role="radiogroup"
          aria-label={ariaLabel}
          className={`relative ${
            fullWidth ? "flex w-full" : "inline-flex"
          } items-center gap-1 px-1 py-[3px] h-12 rounded-full bg-gray-100 dark:bg-[#242424] border border-border dark:border-[#3F3F3F] select-none ${className}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            const isItemDisabled = disabled || option.disabled
            const Icon = option.icon

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isItemDisabled}
                onClick={() => {
                  if (!isItemDisabled && onChange && option.value !== value) {
                    onChange(option.value)
                  }
                }}
                className={`relative h-10 px-4 rounded-full flex items-center justify-center text-sm font-semibold select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/50 dark:focus-visible:ring-cath-red-1000/50 transition-colors duration-150 ${
                  fullWidth ? "flex-1" : ""
                } ${
                  isItemDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : isSelected
                      ? activeClassName
                      : inactiveClassName
                } ${buttonClassName}`}
              >
                {/* Active pill background sliding via Framer Motion layoutId */}
                {isSelected && (
                  <motion.div
                    layoutId={pillLayoutId}
                    className={`absolute inset-0 rounded-full pointer-events-none z-0 ${indicatorClassName}`}
                    transition={smoothTransition}
                  />
                )}

                {/* Content layer above the sliding pill */}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {Icon && (
                    <span className="shrink-0 flex items-center justify-center">
                      {React.isValidElement(Icon) ? (
                        Icon
                      ) : (
                        <Icon
                          size={iconSize}
                          className={`w-5 h-5 shrink-0 ${option.iconClassName || ""}`}
                        />
                      )}
                    </span>
                  )}
                  {option.label && (
                    <span className="whitespace-nowrap">{option.label}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    )
  },
)

SegmentedControl.displayName = "SegmentedControl"

export { SegmentedControl }
export default SegmentedControl
