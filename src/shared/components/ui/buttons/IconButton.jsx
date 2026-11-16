import React from "react"

/**
 * IconButton component.
 *
 * NOTE FOR DEVELOPERS & AI AGENTS:
 * Do NOT re-add an "xs" size. Sizes below "sm" (such as 32x32px) violate minimum touch target
 * requirements (WCAG 2.5.5 / 2.5.8 and Material Design require at least 44x44px or 48x48px).
 * If developers or AI agents need a different size, code a new component or use a different component.
 */
const IconButton = ({
  children,
  badge,
  onClick,
  title,
  disabled = false,
  variant = "filled", // "filled" | "ghost" | "outline" | "primary" | "iconOnly" | "transparent" | "overlay" | "secondary" | "cathRed" | "cathOutline" | "white" | "darkGhost" | "darkFilled" | "danger" | "success" | "darkMuted" | "control" | "controlActive"
  size = "sm", // "sm" | "md"
  className = "",
  innerClassName = "",
  as,
  type = "button",
  ...props
}) => {
  // NOTE: Do not add "xs" — it violates minimum touch requirements.
  // If a different size is required, code a new component or use a different component.
  const sizeClasses = {
    sm: {
      button: "w-12 h-12",
      inner: "w-10 h-10 [&>svg]:!w-6 [&>svg]:!h-6 [&>svg]:pointer-events-none",
    },
    md: {
      button: "w-14 h-14",
      inner: "w-14 h-14 [&>svg]:!w-6 [&>svg]:!h-6 [&>svg]:pointer-events-none",
    },
  }

  const variantClasses = {
    primary:
      "bg-[#990011] hover:bg-[#80000e] active:bg-[#6b000c] group-hover/icon:bg-[#80000e] group-active/icon:bg-[#6b000c] text-white border border-transparent",
    secondary:
      "bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] text-gray-700 dark:text-gray-200 hover:bg-[#F2F2F2] dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] group-hover/icon:bg-[#F2F2F2] dark:group-hover/icon:bg-[#272727] group-active/icon:bg-[#E6E6E6] dark:group-active/icon:bg-[#3D3D3D]",
    white:
      "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 group-hover/icon:bg-gray-50 shadow-xs",
    filled:
      "bg-primaryBg dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 hover:bg-[#E6E6E6] dark:hover:bg-[#272727] active:bg-[#D9D9D9] dark:active:bg-[#3D3D3D] group-hover/icon:bg-[#E6E6E6] dark:group-hover/icon:bg-[#272727] group-active/icon:bg-[#D9D9D9] dark:group-active/icon:bg-[#3D3D3D] transition-colors duration-200 ease-m3-expressive-default-effects",
    ghost:
      "bg-transparent hover:bg-neutral-200/80 dark:hover:bg-[#3D3D3D] active:bg-neutral-300 dark:active:bg-[#4D4D4D] group-hover/icon:bg-neutral-200/80 dark:group-hover/icon:bg-[#3D3D3D] group-active/icon:bg-neutral-300 dark:group-active/icon:bg-[#4D4D4D] text-gray-700 dark:text-[#AAAAAA] hover:text-gray-900 dark:hover:text-white group-hover/icon:text-gray-900 dark:group-hover/icon:text-white",
    iconOnly:
      "bg-transparent text-white/60 hover:text-white group-hover/icon:text-white",
    transparent:
      "bg-transparent hover:bg-[#F2F2F2] dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] group-hover/icon:bg-[#F2F2F2] dark:group-hover/icon:bg-[#272727] group-active/icon:bg-[#E6E6E6] dark:group-active/icon:bg-[#3D3D3D]",
    overlay:
      "bg-black/50 hover:bg-black/80 group-hover/icon:bg-black/80 text-white/70 hover:text-white group-hover/icon:text-white",
    outline:
      "bg-transparent hover:bg-primaryBg dark:hover:bg-[#272727] active:bg-[#e5e5e5] dark:active:bg-[#3D3D3D] group-hover/icon:bg-primaryBg dark:group-hover/icon:bg-[#272727] group-active/icon:bg-[#e5e5e5] dark:group-active/icon:bg-[#3D3D3D] border-[1.5px] border-solid border-[#990011] dark:border-[#FF0033] text-[#990011] dark:text-[#FF0033]",
    cathRed:
      "bg-[#910B09] hover:bg-[#7a0907] group-hover/icon:bg-[#7a0907] text-white",
    cathOutline:
      "bg-white border border-[#910B09] text-[#910B09] hover:bg-[#910B09] group-hover/icon:bg-[#910B09] hover:text-white group-hover/icon:text-white shadow-sm",
    darkGhost:
      "bg-transparent text-neutral-400 hover:text-white group-hover/icon:text-white hover:bg-white/10 group-hover/icon:bg-white/10",
    darkFilled:
      "bg-neutral-800 text-white hover:bg-neutral-700 group-hover/icon:bg-neutral-700",
    danger:
      "bg-red-600 text-white hover:bg-red-700 group-hover/icon:bg-red-700 shadow-md shadow-red-600/30",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 group-hover/icon:bg-emerald-700 shadow-md shadow-emerald-600/30",
    darkMuted:
      "bg-neutral-800/80 border border-white/10 text-neutral-400 hover:text-white group-hover/icon:text-white hover:bg-neutral-700 group-hover/icon:bg-neutral-700",
    control:
      "bg-primaryBg hover:bg-[#E6E6E6] group-hover/icon:bg-[#E6E6E6] text-black dark:bg-[#272727] dark:hover:bg-[#3D3D3D] dark:group-hover/icon:bg-[#3D3D3D] dark:text-white shadow-sm",
    controlActive:
      "bg-cath-red-600 hover:bg-cath-red-700 group-hover/icon:bg-cath-red-700 text-white shadow-sm",
  }

  const currentSize = sizeClasses[size] || sizeClasses.sm
  const Component = as || "button"

  return (
    <Component
      {...(Component === "button" ? { onClick, disabled, type } : {})}
      title={title}
      className={`group/icon inline-flex items-center justify-center rounded-full focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shrink-0 ${currentSize.button} ${className}`}
      {...props}
    >
      <span
        className={`pointer-events-none relative inline-flex items-center justify-center rounded-full shrink-0 ${currentSize.inner} ${variantClasses[variant] || variantClasses.filled} ${innerClassName}`}
      >
        {children}
        {badge}
      </span>
    </Component>
  )
}

export default IconButton
