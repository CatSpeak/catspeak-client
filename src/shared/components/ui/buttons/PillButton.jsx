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
  variant = "primary", // "primary" | "secondary" | "subtle" | "contrast" | "outline" | "secondary-no-outline" | "transparent" | "snackbar"
  bgColor,
  textColor,
  borderColor,
  className = "",
  roundedClass = "rounded-full",
  ...props
}) => {
  const isSecondary = variant === "secondary"
  const isSecondaryNoOutline = variant === "secondary-no-outline"
  const isSubtle = variant === "subtle"
  const isContrast = variant === "contrast"
  const isOutline = variant === "outline"
  const isSnackbar = variant === "snackbar"
  const isTransparent = variant === "transparent"
  const isActuallyDisabled = disabled || loading

  // Default variant styles applied to inner div
  const variantStyles = isSnackbar
    ? "bg-transparent border-none text-[#FF6B6B] group-hover/pill:text-[#FF9999] hover:text-[#FF9999] hover:bg-transparent active:bg-transparent p-0 h-auto font-semibold cursor-pointer transition-colors duration-150"
    : isTransparent
      ? "bg-black/30 backdrop-blur-md border border-white/10 text-white group-hover/pill:bg-black/50 group-active/pill:bg-black/60 shadow-sm transition-all duration-300"
      : isContrast
        ? "bg-gray-900 dark:bg-white border border-transparent text-white dark:text-gray-900 font-semibold group-hover/pill:bg-gray-800 dark:group-hover/pill:bg-gray-100 group-active/pill:bg-gray-700 dark:group-active/pill:bg-gray-200"
      : isSubtle
        ? "bg-[#FFF0F2] dark:bg-[#2D0A0E] border border-cath-red-700/40 dark:border-[#66111E] text-cath-red-700 dark:text-[#FF8599] group-hover/pill:bg-[#FFE5E8] dark:group-hover/pill:bg-[#3D1016]"
      : isOutline
        ? "bg-transparent border border-cath-red-700 dark:border-cath-red-700 text-cath-red-700 dark:text-cath-red-700 group-hover/pill:bg-primaryBg dark:group-hover/pill:bg-[#272727] group-active/pill:bg-[#e5e5e5] dark:group-active/pill:bg-[#3D3D3D]"
        : isSecondary
          ? "bg-white dark:bg-[#272727] border border-[#e5e5e5] dark:border-[#3F3F3F] text-black dark:text-[#AAAAAA] hover:text-black dark:hover:text-white group-hover/pill:bg-primaryBg dark:group-hover/pill:bg-[#3D3D3D] group-active/pill:bg-[#e0e0e0] dark:group-active/pill:bg-[#333333]"
          : isSecondaryNoOutline
            ? "bg-transparent border border-transparent text-black dark:text-gray-200 group-hover/pill:bg-[#E5E5E5] dark:group-hover/pill:bg-[#272727] group-active/pill:bg-[#e0e0e0] dark:group-active/pill:bg-[#3D3D3D]"
            : "bg-cath-red-700 dark:bg-cath-red-700 border border-transparent text-white hover:bg-cath-red-800 dark:hover:bg-cath-red-800 group-hover/pill:brightness-90 group-active/pill:brightness-75"

  const disabledStyles = isTransparent
    ? "group-disabled/pill:opacity-50 group-disabled/pill:cursor-not-allowed cursor-pointer"
    : "group-disabled/pill:bg-[#BFBFBF] group-disabled/pill:text-white group-disabled/pill:brightness-100 group-disabled/pill:border-transparent group-disabled/pill:cursor-not-allowed cursor-pointer"

  const variantCustomStyle = isOutline
    ? {
        // Outline styles driven by Tailwind classes for dark mode support
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
      <span className="flex items-center justify-center shrink-0">
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
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">{children}</span>
            {renderIcon(endIcon)}
          </>
        )}
      </div>
    </button>
  )
}

export default PillButton
