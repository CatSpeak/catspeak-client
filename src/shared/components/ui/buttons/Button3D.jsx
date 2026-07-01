import { Loader2 } from "lucide-react"
import colors from "@/shared/utils/colors"

const Button3D = ({
  children,
  onClick,
  startIcon,
  endIcon,
  loading = false,
  disabled = false,
  loadingText,
  className = "",
  roundedClass = "rounded-xl",
  ...props
}) => {
  const isActuallyDisabled = disabled || loading

  // Creating a 3D edge effect using project colors (red palette)
  // In the project's color palette, lower numbers (e.g., 200, 400) are darker shades of red.
  // This creates the proper 3D depth below the primary red (700) face.
  const edgeBackground = `linear-gradient(to left, ${colors.red[200]} 0%, ${colors.red[400]} 8%, ${colors.red[400]} 92%, ${colors.red[200]} 100%)`

  return (
    <button
      onClick={onClick}
      disabled={isActuallyDisabled}
      className={`relative border-none bg-transparent p-0 cursor-pointer outline-offset-4 transition-[filter] duration-250 select-none touch-manipulation focus:not(:focus-visible):outline-none ${
        !isActuallyDisabled ? "group hover:brightness-110" : "opacity-70 cursor-not-allowed grayscale-[30%]"
      } ${className}`}
      {...props}
    >
      {/* Shadow */}
      <span
        className={`absolute top-0 left-0 w-full h-full ${roundedClass} bg-black/25 will-change-transform translate-y-[2px] transition-transform duration-[600ms] ease-[cubic-bezier(.3,.7,.4,1)] ${
          !isActuallyDisabled
            ? "group-hover:translate-y-[4px] group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(.3,.7,.4,1.5)] group-active:translate-y-[1px] group-active:duration-[34ms]"
            : ""
        }`}
      ></span>
      
      {/* Edge */}
      <span
        className={`absolute top-0 left-0 w-full h-full ${roundedClass}`}
        style={{ background: edgeBackground }}
      ></span>
      
      {/* Front */}
      <span
        className={`block relative py-2.5 px-6 ${roundedClass} text-sm sm:text-base font-medium text-white will-change-transform -translate-y-[4px] transition-transform duration-[600ms] ease-[cubic-bezier(.3,.7,.4,1)] flex items-center justify-center gap-2 ${
          !isActuallyDisabled
            ? "group-hover:-translate-y-[6px] group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(.3,.7,.4,1.5)] group-active:-translate-y-[2px] group-active:duration-[34ms]"
            : ""
        }`}
        style={{ backgroundColor: colors.primaryRed }}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {startIcon}
            {children}
            {endIcon}
          </>
        )}
      </span>
    </button>
  )
}

export default Button3D
