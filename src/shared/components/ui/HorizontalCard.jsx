import React from "react"

const HorizontalCard = ({
  leftContent,
  rightContent,
  children,
  onClick,
  className = "",
  variant = "default",
  ...props
}) => {
  const baseClasses =
    "flex flex-row items-center justify-between gap-4 rounded-xl px-4 min-h-[80px] transition-all"

  const variantClasses = {
    default: "border border-[#E5E5E5] bg-white",
    glass: "border border-[#E5E5E5] bg-white/40 backdrop-blur-xl shadow-sm",
  }

  const interactionClasses = onClick
    ? "cursor-pointer hover:border-cath-red-700"
    : ""

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${interactionClasses} ${className}`}
      {...props}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {leftContent && (
          <div className="shrink-0 flex items-center">{leftContent}</div>
        )}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      {rightContent && (
        <div className="flex items-center gap-2 shrink-0">{rightContent}</div>
      )}
    </div>
  )
}

export default HorizontalCard
