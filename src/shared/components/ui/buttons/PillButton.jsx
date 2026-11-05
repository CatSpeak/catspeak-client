import React from "react"
import { Loader2 } from "lucide-react"

const VARIANT_CLASSES = {
  primary:
    "bg-cath-red-700 hover:bg-cath-red-800 active:bg-cath-red-900 group-hover/pill:bg-cath-red-800 group-active/pill:bg-cath-red-900 text-white border-transparent",
  secondary:
    "bg-white dark:bg-[#272727] hover:bg-primaryBg dark:hover:bg-[#3D3D3D] active:bg-[#e0e0e0] dark:active:bg-[#333333] group-hover/pill:bg-primaryBg dark:group-hover/pill:bg-[#3D3D3D] group-active/pill:bg-[#e0e0e0] dark:group-active/pill:bg-[#333333] text-black dark:text-[#AAAAAA] hover:text-black dark:hover:text-white group-hover/pill:text-black dark:group-hover/pill:text-white border-[#e5e5e5] dark:border-[#3F3F3F]",
  outline:
    "bg-transparent hover:bg-primaryBg dark:hover:bg-red-950/20 active:bg-[#e5e5e5] dark:active:bg-red-950/40 group-hover/pill:bg-primaryBg dark:group-hover/pill:bg-red-950/20 group-active/pill:bg-[#e5e5e5] dark:group-active/pill:bg-red-950/40 text-cath-red-700 dark:text-[#FF6B6B] border-cath-red-700 dark:border-[#FF6B6B]/70 border-[1.5px] hover:border-cath-red-800 dark:hover:border-[#FF6B6B] group-hover/pill:border-cath-red-800 dark:group-hover/pill:border-[#FF6B6B]",
  subtle:
    "bg-[#FFF0F2] dark:bg-[#2D0A0E] hover:bg-[#FFE5E8] dark:hover:bg-[#3D1016] active:bg-[#FFD6DC] dark:active:bg-[#4D151D] group-hover/pill:bg-[#FFE5E8] dark:group-hover/pill:bg-[#3D1016] group-active/pill:bg-[#FFD6DC] dark:group-active/pill:bg-[#4D151D] text-cath-red-700 dark:text-[#FF8599] border-cath-red-700/40 dark:border-[#66111E] hover:border-cath-red-700/70 group-hover/pill:border-cath-red-700/70",
  contrast:
    "bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 dark:active:bg-gray-200 group-hover/pill:bg-gray-800 dark:group-hover/pill:bg-gray-100 group-active/pill:bg-gray-700 dark:group-active/pill:bg-gray-200 text-white dark:text-gray-900 font-semibold border-transparent",
  ghost:
    "bg-transparent hover:bg-neutral-200/80 dark:hover:bg-[#3D3D3D] active:bg-neutral-300 dark:active:bg-[#4D4D4D] group-hover/pill:bg-neutral-200/80 dark:group-hover/pill:bg-[#3D3D3D] group-active/pill:bg-neutral-300 dark:group-active/pill:bg-[#4D4D4D] text-slate-700 dark:text-[#AAAAAA] hover:text-black dark:hover:text-white group-hover/pill:text-black dark:group-hover/pill:text-white border-transparent",
  "secondary-no-outline":
    "bg-transparent hover:bg-[#E5E5E5] dark:hover:bg-[#272727] active:bg-[#e0e0e0] dark:active:bg-[#3D3D3D] group-hover/pill:bg-[#E5E5E5] dark:group-hover/pill:bg-[#272727] group-active/pill:bg-[#e0e0e0] dark:group-active/pill:bg-[#3D3D3D] text-black dark:text-gray-200 border-transparent",
  transparent:
    "bg-black/30 hover:bg-black/50 active:bg-black/60 group-hover/pill:bg-black/50 group-active/pill:bg-black/60 text-white backdrop-blur-md border-white/10 shadow-sm",
  snackbar:
    "bg-transparent hover:text-[#FF9999] active:text-[#FF4D4D] group-hover/pill:text-[#FF9999] group-active/pill:text-[#FF4D4D] text-[#FF6B6B] border-none p-0 h-auto font-semibold",
  control:
    "bg-primaryBg hover:bg-[#E6E6E6] text-black dark:bg-[#272727] dark:hover:bg-[#3D3D3D] dark:text-white border-transparent transition-colors",
  controlActive:
    "bg-cath-red-600 hover:bg-cath-red-700 active:bg-cath-red-800 text-white border-transparent transition-colors",
}

/**
 * PillButton component.
 *
 * NOTE FOR DEVELOPERS & AI AGENTS:
 * Do NOT add smaller sizes (e.g. "xs", "sm") or reduce default dimensions (h-12 wrapper, h-10 inner).
 * PillButton enforces the minimum touch target standards and visual weight of the CatSpeak design system.
 * If developers or AI agents need a smaller button or chip, code a new component or use a different component.
 */
const PillButton = ({
  children,
  onClick,
  startIcon,
  endIcon,
  loading = false,
  disabled = false,
  loadingText,
  variant = "primary",
  bgColor,
  textColor,
  borderColor,
  className = "",
  roundedClass = "rounded-full",
  type = "button",
  style,
  ...props
}) => {
  const isActuallyDisabled = disabled || loading
  const isTransparent = variant === "transparent"
  const isSnackbar = variant === "snackbar"
  const isSecondary =
    variant === "secondary" ||
    variant === "secondary-no-outline" ||
    variant === "ghost" ||
    variant === "outline" ||
    variant === "control"

  const variantStyle = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
  const disabledStyle = isActuallyDisabled
    ? isTransparent || isSecondary
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "bg-[#BFBFBF] text-white border-transparent cursor-not-allowed pointer-events-none"
    : ""

  const customStyle = !isActuallyDisabled
    ? {
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(textColor ? { color: textColor } : {}),
        ...(borderColor ? { borderColor } : {}),
        ...style,
      }
    : style

  const wrapperHeight = isSnackbar ? "h-auto" : "h-12"
  const innerDimensions = isSnackbar ? "" : "h-10 px-4"

  const renderIcon = (icon) => {
    if (!icon) return null
    return (
      <span className="flex items-center justify-center shrink-0">
        {React.isValidElement(icon)
          ? React.cloneElement(icon, {
              size: icon.props.size || 20,
            })
          : icon}
      </span>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isActuallyDisabled}
      className={`group/pill relative outline-none flex items-center justify-center ${wrapperHeight} ${
        isActuallyDisabled ? "cursor-not-allowed" : "cursor-pointer"
      } touch-manipulation ${className}`}
      {...props}
    >
      <div
        style={customStyle}
        className={`w-full ${innerDimensions} ${roundedClass} border text-sm transition-colors duration-150 flex items-center justify-center gap-2 whitespace-nowrap select-none ${variantStyle} ${disabledStyle}`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-5 h-5 shrink-0" />
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
