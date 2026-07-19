import React from "react"

const EmptyState = ({
  message = "No items found",
  icon: Icon,
  className = "",
  variant = "simple", // "simple" | "component" | "page" | "detailed"
  children,
}) => {
  if (variant === "component") {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-[#606060] ${className}`}
      >
        {Icon && <Icon className="w-8 h-8 mb-2 text-[#606060]" />}
        <div className="text-sm text-center">{message}</div>
        {children}
      </div>
    )
  }

  if (variant === "detailed" || variant === "page" || Icon) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-20 text-[#606060] ${className}`}
      >
        {Icon && <Icon className="w-16 h-16 mb-3 text-[#606060]" />}
        <div className="font-medium">{message}</div>
        {children}
      </div>
    )
  }

  return (
    <div className={`flex justify-center ${className || "p-10"}`}>
      <div className="text-[#7A7574] text-base">{message}</div>
    </div>
  )
}

export default EmptyState
