import React from "react"

const EmptyState = ({
  message = "No items found",
  icon: Icon,
  className = "",
  variant = "simple", // "simple" | "detailed"
}) => {
  if (variant === "detailed" || Icon) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-20 text-[#606060] ${className}`}
      >
        {Icon && <Icon className="w-16 h-16 mb-3 text-[#606060]" />}
        <p className="font-medium">{message}</p>
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
