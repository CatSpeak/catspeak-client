import React from "react"

const IconButton = ({
  children,
  onClick,
  title,
  disabled = false,
  variant = "filled", // "filled" | "ghost" | "outline" | "primary" | "iconOnly" | "transparent" | "overlay"
  size = "sm", // "xs" | "sm" | "md"
  className = "",
  innerClassName = "",
  as,
  type = "button",
  ...props
}) => {
  const sizeClasses = {
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
    filled: "bg-[#F2F2F2] group-hover/icon:bg-[#C2C2C2]",
    ghost: "bg-transparent group-hover/icon:bg-[#CCCCCC]",
    iconOnly: "bg-transparent text-[#7A7574]",
    transparent: "bg-transparent",
    overlay:
      "bg-black/50 group-hover/icon:bg-black/80 text-white/70 group-hover/icon:text-white transition-all",
    outline:
      "bg-transparent group-hover/icon:bg-primaryBg group-active/icon:bg-[#e5e5e5] border-[1.5px] border-solid border-[#990011] text-[#990011]",
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
        className={`inline-flex items-center justify-center rounded-full transition-colors ${currentSize.inner} ${variantClasses[variant] || variantClasses.filled} ${innerClassName}`}
      >
        {children}
      </span>
    </Component>
  )
}

export default IconButton
