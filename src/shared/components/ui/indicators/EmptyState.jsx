import React from "react"

/**
 * EmptyState — Shared component for empty state feedback across pages and components.
 *
 * @param {string} message - Primary title / message text
 * @param {string|ReactNode} description - Secondary description text
 * @param {React.ComponentType} icon - Optional Lucide or custom SVG icon component
 * @param {string} variant - Layout style variant ("simple" | "component" | "page" | "detailed")
 * @param {string} className - Optional container CSS classes
 * @param {ReactNode} children - Optional extra action buttons / elements
 */
const EmptyState = ({
  message = "No items found",
  description = null,
  icon: Icon,
  className = "",
  variant = "simple", // "simple" | "component" | "page" | "detailed"
  children,
}) => {
  const renderDescription = () => {
    if (!description) return null
    if (typeof description === "string") {
      return (
        <p className="text-sm text-[#606060] mt-1 text-center max-w-sm">
          {description}
        </p>
      )
    }
    return description
  }

  if (variant === "component") {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-[#606060] ${className}`}
      >
        {Icon && <Icon className="w-8 h-8 mb-2 text-[#606060]" />}
        <div className="text-sm text-center font-medium">{message}</div>
        {renderDescription()}
        {children}
      </div>
    )
  }

  if (variant === "page") {
    return (
      <div
        className={`flex-1 w-full flex flex-col items-center justify-center py-12 text-[#606060] ${className}`}
      >
        {Icon && <Icon className="w-16 h-16 mb-3 text-[#606060]" />}
        <div className="font-semibold text-lg text-center">{message}</div>
        {renderDescription()}
        {children}
      </div>
    )
  }

  if (variant === "detailed" || Icon) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-16 text-[#606060] ${className}`}
      >
        {Icon && <Icon className="w-14 h-14 mb-3 text-[#606060]" />}
        <div className="font-semibold text-base text-center">{message}</div>
        {renderDescription()}
        {children}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className || "p-10"}`}>
      <div className="text-[#7A7574] text-base text-center">{message}</div>
      {renderDescription()}
      {children}
    </div>
  )
}

export default EmptyState

