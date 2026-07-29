import React from "react"
import { Loader2 } from "lucide-react"

/**
 * A reusable control button for the video call control bar.
 * Clickable area: w-12 h-12 (48px x 48px)
 * Visible background: w-10 h-10 (40px x 40px)
 * Icon size: 24px x 24px
 */
const ControlButton = ({
  isActive,
  isLoading,
  onClick,
  title,
  iconActive,
  iconInactive,
  disabled,
  className = "",
  innerClassName = "",
  activeClassOverride = "bg-cath-red-600 hover:bg-cath-red-700 text-white",
  inactiveClassOverride = "bg-[#F2F2F2] hover:bg-[#E6E6E6] text-black",
  children, // For custom content overlays, like ping animations
}) => {
  const innerStateClass = isLoading
    ? "cursor-not-allowed opacity-70 bg-[#F2F2F2] text-black"
    : isActive
      ? activeClassOverride
      : inactiveClassOverride

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`inline-flex items-center justify-center w-12 h-12 rounded-full focus:outline-none shrink-0 ${className}`}
    >
      <span
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors shadow-sm overflow-hidden [&>svg]:!w-6 [&>svg]:!h-6 ${innerStateClass} ${innerClassName}`}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin origin-center w-6 h-6" />
          </div>
        ) : isActive ? (
          iconActive
        ) : (
          iconInactive
        )}
        {children}
      </span>
    </button>
  )
}

export default ControlButton

