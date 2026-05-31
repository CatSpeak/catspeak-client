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

  const heightClass = className && className.match(/\bh-\S+/) ? "" : "h-12"
  const textClass = className && className.match(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl)\b/) ? "" : "text-base"
  const baseStyles = `${heightClass} ${textClass} px-4 rounded-full font-medium flex items-center justify-center gap-2 transition whitespace-nowrap`

  // Default variant styles
  const variantStyles = isOutline
    ? "bg-transparent hover:bg-[#f3f3f3] active:bg-[#e5e5e5]"
    : isSecondary
    ? "bg-white text-black hover:bg-[#E5E5E5] active:bg-[#e0e0e0]"
    : "bg-cath-red-700 text-white hover:brightness-90 active:brightness-75"

  const disabledStyles =
    "disabled:bg-[#BFBFBF] disabled:text-white disabled:brightness-100 disabled:border-transparent"

  // Inline styles for custom colors, but only when not disabled
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

  return (
    <button
      onClick={onClick}
      disabled={isActuallyDisabled}
      style={customStyle}
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin w-4 h-4" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {startIcon}
          {children}
          {endIcon}
        </>
      )}
    </button>
  )
}

export default PillButton
