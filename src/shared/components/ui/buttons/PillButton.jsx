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
  variant = "primary", // "primary" | "secondary" | "outline" | "secondary-no-outline"
  bgColor,
  textColor,
  borderColor,
  className = "",
  roundedClass = "rounded-full",
  ...props
}) => {
  const isSecondary = variant === "secondary"
  const isSecondaryNoOutline = variant === "secondary-no-outline"
  const isOutline = variant === "outline"
  const isSnackbar = variant === "snackbar"
  const isActuallyDisabled = disabled || loading

  // Default variant styles applied to inner div
  const variantStyles = isSnackbar
    ? "bg-transparent border-none text-[#FF6B6B] group-hover/pill:text-[#FF9999] hover:text-[#FF9999] hover:bg-transparent active:bg-transparent p-0 h-auto font-semibold cursor-pointer transition-colors duration-150"
    : isOutline
      ? "bg-transparent group-hover/pill:bg-primaryBg group-active/pill:bg-[#e5e5e5]"
      : isSecondary
        ? "bg-white border border-[#e5e5e5] text-black group-hover/pill:bg-primaryBg group-active/pill:bg-[#e0e0e0]"
        : isSecondaryNoOutline
          ? "bg-transparent border border-transparent text-black group-hover/pill:bg-[#E5E5E5] group-active/pill:bg-[#e0e0e0]"
          : "bg-cath-red-700 border border-transparent text-white group-hover/pill:brightness-90 group-active/pill:brightness-75"

  const disabledStyles =
    "group-disabled/pill:bg-[#BFBFBF] group-disabled/pill:text-white group-disabled/pill:brightness-100 group-disabled/pill:border-transparent group-disabled/pill:cursor-not-allowed cursor-pointer"

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
        ...(borderColor ? { borderColor: borderColor } : {}),
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
      className={`group/pill relative outline-none flex items-center justify-center h-12 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <div
        style={customStyle}
        className={`w-full h-10 px-4 text-sm font-medium flex items-center justify-center gap-2 transition whitespace-nowrap ${roundedClass} ${variantStyles} ${disabledStyles}`}
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
