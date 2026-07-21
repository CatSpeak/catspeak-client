import React from "react"
import { Loader2 } from "lucide-react"

/**
 * A reusable control button for the video call control bar.
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
  activeClassOverride = "bg-cath-red-600 hover:bg-cath-red-700 text-white",
  inactiveClassOverride = "bg-[#F2F2F2] hover:bg-[#D9D9D9] text-black",
  children, // For custom content overlays, like ping animations
}) => {
  const buttonBaseClass =
    "flex items-center justify-center rounded-full transition-colors shadow-sm w-11 h-11 relative overflow-hidden"

  const buttonStateClass = isLoading
    ? "cursor-not-allowed opacity-70 bg-[#F2F2F2] text-black"
    : isActive
      ? activeClassOverride
      : inactiveClassOverride

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`${buttonBaseClass} ${buttonStateClass} ${className}`}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin origin-center w-6 h-6" />
        </div>
      ) : (
        isActive ? iconActive : iconInactive
      )}
      {children}
    </button>
  )
}

export default ControlButton
