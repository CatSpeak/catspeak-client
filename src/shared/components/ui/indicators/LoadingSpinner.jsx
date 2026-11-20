import { Loader2 } from "lucide-react"
import React from "react"

/**
 * Standardized indicator size tokens.
 * Centralized default is 40x40px ('md' / 'h-10 w-10').
 * Existing tokens ('xs', 'sm', 'md', 'lg', 'xl') are preserved to avoid breaking usages across the application.
 */
const sizeClasses = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-10 w-10", // 40x40px (Design System centralized default)
  lg: "h-16 w-16",
  xl: "h-20 w-20",
}

/**
 * Standardized stroke thickness tokens:
 * - 4px (default standard thickness)
 * - 8px (bold / heavy emphasis thickness)
 * Restricted to 4px and 8px only to maintain design consistency without breaking existing usages.
 */
const resolveThickness = (thickness, strokeWidth) => {
  const val = Number(thickness ?? strokeWidth)
  return val === 8 ? 8 : 4
}

const LoadingSpinner = ({
  className = "flex flex-col items-center justify-center",
  text,
  size = "md",
  iconClassName = "",
  textClassName = "mt-2 text-sm text-neutral-600 dark:text-neutral-300",
  showTrack = true,
  thickness = 4,
  strokeWidth,
  variant = "mobile",
}) => {
  const resolvedSize = sizeClasses[size] || size
  const resolvedThickness = resolveThickness(thickness, strokeWidth)

  return (
    <div className={className}>
      {variant === "classic" ? (
        <Loader2
          className={`animate-spin text-cath-red-700 dark:text-red-400 ${resolvedSize || "h-10 w-10"} ${iconClassName}`}
        />
      ) : (
        <svg
          className={`animate-circular-rotate text-cath-red-700 dark:text-red-400 ${resolvedSize || "h-10 w-10"} ${iconClassName}`}
          viewBox="0 0 40 40"
          fill="none"
          role="status"
          aria-label="Loading"
        >
          {showTrack && (
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth={resolvedThickness}
              className="opacity-15 dark:opacity-20"
            />
          )}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth={resolvedThickness}
            strokeLinecap="round"
            className="animate-circular-dash"
          />
        </svg>
      )}
      {text && <span className={textClassName}>{text}</span>}
    </div>
  )
}

export default LoadingSpinner
