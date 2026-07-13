import { Loader2 } from "lucide-react"
import colors from "@/shared/utils/colors"

const PillButton = ({
  children,
  onClick,
  startIcon,
  endIcon,
  loading = false,
  disabled = false,
  loadingText,
  variant = "primary", // "primary" | "secondary" | "outline"
  bgColor,
  textColor,
  className = "",
  ...props
}) => {
  const isSecondary = variant === "secondary"
  const isOutline = variant === "outline"
  const isActuallyDisabled = disabled || loading

  // Default variant styles applied to inner div
  const variantStyles = isOutline
    ? "bg-transparent group-hover:bg-[#f3f3f3] group-active:bg-[#e5e5e5]"
    : isSecondary
      ? "bg-white border border-[#C6c6c6] text-black group-hover:bg-[#E5E5E5] group-active:bg-[#e0e0e0]"
      : "bg-cath-red-700 text-white group-hover:brightness-90 group-active:brightness-75"

  const disabledStyles =
    "group-disabled:bg-[#BFBFBF] group-disabled:text-white group-disabled:brightness-100 group-disabled:border-transparent"

  const variantCustomStyle = isOutline
    ? {
        color: colors.primaryRed,
        borderColor: colors.primaryRed,
        borderWidth: "1.5px",
        borderStyle: "solid",
      }
    : {}

  const customStyle = !isActuallyDisabled
    ? {
        ...variantCustomStyle,
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(textColor ? { color: textColor } : {}),
      }
    : {}

  const renderIcon = (icon) => {
    if (!icon) return null
    return (
      <span className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full shrink-0">
        {icon}
      </span>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={isActuallyDisabled}
      className={`group relative outline-none flex items-center justify-center h-12 ${className}`}
      {...props}
    >
      <div
        style={customStyle}
        className={`w-full h-10 px-4 text-sm rounded-full font-medium flex items-center justify-center gap-2 transition whitespace-nowrap ${variantStyles} ${disabledStyles}`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {renderIcon(startIcon)}
            {children}
            {renderIcon(endIcon)}
          </>
        )}
      </div>
    </button>
  )
}

export default PillButton
