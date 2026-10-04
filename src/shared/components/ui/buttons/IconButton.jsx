import React from "react"

const IconButton = ({
  children,
  badge,
  onClick,
  title,
  disabled = false,
  variant = "filled", // "filled" | "ghost" | "outline" | "primary" | "iconOnly" | "transparent" | "overlay" | "secondary" | "cathRed" | "cathOutline" | "white" | "darkGhost" | "darkFilled" | "danger" | "success" | "darkMuted"
  size = "sm", // "xs" | "sm" | "md"
  className = "",
  innerClassName = "",
  as,
  type = "button",
  ...props
}) => {
  const sizeClasses = {
    xs: {
      button: "w-8 h-8",
      inner: "w-8 h-8 [&>svg]:!w-4 [&>svg]:!h-4",
    },
    sm: {
      button: "w-12 h-12",
      inner: "w-10 h-10 [&>svg]:!w-6 [&>svg]:!h-6",
    },
    md: {
      button: "w-14 h-14",
      inner: "w-14 h-14 [&>svg]:!w-6 [&>svg]:!h-6",
    },
  }

  const variantClasses = {
    primary: "bg-[#990011] group-hover/icon:bg-[#80000e] text-white",
    white:
      "bg-white border border-gray-200 text-gray-500 group-hover/icon:bg-gray-50 shadow-xs",
    secondary: "bg-white border border-border group-hover/icon:bg-primaryBg",
    filled: "bg-primaryBg group-hover/icon:bg-[#C2C2C2]",
    ghost: "bg-transparent group-hover/icon:bg-[#CCCCCC]",
    iconOnly:
      "bg-transparent text-white/60 group-hover/icon:text-white transition-colors duration-150",
    transparent: "bg-transparent",
    overlay:
      "bg-black/50 group-hover/icon:bg-black/80 text-white/70 group-hover/icon:text-white transition-all",
    outline:
      "bg-transparent group-hover/icon:bg-primaryBg group-active/icon:bg-[#e5e5e5] border-[1.5px] border-solid border-[#990011] text-[#990011]",
    cathRed:
      "bg-[#910B09] group-hover/icon:bg-[#7a0907] text-white transition-colors",
    cathOutline:
      "bg-white border border-[#910B09] text-[#910B09] group-hover/icon:bg-[#910B09] group-hover/icon:text-white transition-colors shadow-sm",
    darkGhost:
      "bg-transparent text-neutral-400 group-hover/icon:text-white group-hover/icon:bg-white/10 transition-colors",
    darkFilled:
      "bg-neutral-800 text-white group-hover/icon:bg-neutral-700 transition-colors",
    danger:
      "bg-red-600 text-white group-hover/icon:bg-red-700 shadow-md shadow-red-600/30 transition-colors",
    success:
      "bg-emerald-600 text-white group-hover/icon:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-colors",
    darkMuted:
      "bg-neutral-800/80 border border-white/10 text-neutral-400 group-hover/icon:text-white group-hover/icon:bg-neutral-700 transition-colors",
  }

  const currentSize = sizeClasses[size] || sizeClasses.sm
  const Component = as || (onClick ? "button" : "div")

  return (
    <Component
      {...(Component === "button" ? { onClick, disabled, type } : {})}
      title={title}
      className={`group/icon inline-flex items-center justify-center rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${currentSize.button} ${className}`}
      {...props}
    >
      <span
        className={`relative inline-flex items-center justify-center rounded-full transition-colors ${currentSize.inner} ${variantClasses[variant] || variantClasses.filled} ${innerClassName}`}
      >
        {children}
        {badge}
      </span>
    </Component>
  )
}

export default IconButton
