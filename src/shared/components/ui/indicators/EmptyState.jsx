import React from "react"

/**
 * EmptyState — Shared component for empty state feedback across pages and components.
 *
 * @param {string} message - Primary title / message text
 * @param {string} title - Alias for message
 * @param {string|ReactNode} description - Secondary description text
 * @param {string|ReactNode} subtext - Alias for description
 * @param {React.ComponentType} icon - Optional Lucide or custom SVG icon component
 * @param {string} variant - Layout style variant ("simple" | "component" | "page" | "detailed")
 * @param {string} className - Optional container CSS classes
 * @param {ReactNode} children - Optional extra action buttons / elements
 */
const EmptyState = ({
  message = "No items found",
  title,
  description = null,
  subtext,
  icon: Icon,
  iconClassName,
  action,
  children,
  fullPage = false,
  className = "",
  variant = "simple", // "simple" | "component" | "page" | "detailed"
}) => {
  const displayTitle = title || message
  const displaySubtext = subtext || description

  const renderTextContent = () => {
    return (
      <div className="flex flex-col items-center gap-1 text-center max-w-md">
        <div className="text-base font-bold text-gray-900 dark:text-white">
          {displayTitle}
        </div>
        {renderDescription()}
      </div>
    )
  }

  const renderDescription = () => {
    if (!displaySubtext) return null
    if (typeof displaySubtext === "string") {
      return (
        <p className="text-sm font-normal text-[#606060] dark:text-[#AAAAAA]">
          {displaySubtext}
        </p>
      )
    }
    return displaySubtext
  }

  if (variant === "component") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 py-8 px-4 text-center text-[#606060] dark:text-[#AAAAAA] ${className}`}
      >
        {Icon && (
          <Icon
            className={
              iconClassName || "w-6 h-6 text-[#606060] dark:text-[#AAAAAA]"
            }
          />
        )}
        {renderTextContent()}
        {action}
        {children}
      </div>
    )
  }

  if (variant === "page") {
    return (
      <div
        className={`flex-1 w-full flex flex-col items-center justify-center gap-4 ${
          fullPage ? "min-h-[50vh] py-12" : "py-12"
        } px-4 text-center text-[#606060] dark:text-[#AAAAAA] ${className}`}
      >
        {Icon && (
          <Icon
            className={
              iconClassName || "w-6 h-6 text-[#606060] dark:text-[#AAAAAA]"
            }
          />
        )}
        {renderTextContent()}
        {action}
        {children}
      </div>
    )
  }

  if (variant === "detailed" || Icon) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 ${
          fullPage ? "min-h-[50vh] py-12" : "py-12"
        } px-4 text-center text-[#606060] dark:text-[#AAAAAA] ${className}`}
      >
        {Icon && (
          <Icon
            className={
              iconClassName || "w-6 h-6 text-[#606060] dark:text-[#AAAAAA]"
            }
          />
        )}
        {renderTextContent()}
        {action}
        {children}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-[#7A7574] dark:text-[#AAAAAA] ${className || "p-10"}`}
    >
      {Icon && (
        <Icon
          className={
            iconClassName || "w-6 h-6 text-[#606060] dark:text-[#AAAAAA]"
          }
        />
      )}
      {renderTextContent()}
      {action}
      {children}
    </div>
  )
}

export default EmptyState
