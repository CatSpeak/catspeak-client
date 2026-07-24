import React from "react"

const EmptyState = ({
  message = "No items found",
  title,
  description,
  subtext,
  icon: Icon,
  iconClassName = "w-12 h-12 mb-4 text-gray-400",
  action,
  children,
  fullPage = false,
  className = "",
  variant = "simple", // "simple" | "component" | "page" | "detailed"
}) => {
  const displayTitle = title || message
  const displaySubtext = subtext || description

  if (variant === "component") {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-[#606060] ${className}`}
      >
        {Icon && <Icon className="w-8 h-8 mb-2 text-[#606060]" />}
        <div className="text-sm text-center">{displayTitle}</div>
        {children}
      </div>
    )
  }

  if (variant === "detailed" || variant === "page" || Icon || displaySubtext || action || children) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center text-[#606060] ${
          fullPage ? "min-h-[50vh] py-12" : "py-16"
        } ${className}`}
      >
        {Icon && <Icon className={iconClassName} />}
        <p className="text-lg font-semibold text-gray-800 mb-1">
          {displayTitle}
        </p>
        {displaySubtext && (
          <p className="text-sm text-[#606060] max-w-[360px] mb-4">
            {displaySubtext}
          </p>
        )}
        {action}
        {children}
      </div>
    )
  }

  return (
    <div className={`flex justify-center ${className || "p-10"}`}>
      <div className="text-[#7A7574] text-base">{displayTitle}</div>
    </div>
  )
}

export default EmptyState
