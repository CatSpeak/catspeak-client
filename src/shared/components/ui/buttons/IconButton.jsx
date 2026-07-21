import React from "react"

const IconButton = ({
  children,
  onClick,
  disabled = false,
  variant = "filled", // "filled" | "ghost" | "primary"
  size = "sm", // "sm" | "md"
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: {
      button: "w-12 h-12",
      inner: "w-10 h-10",
    },
    md: {
      button: "w-14 h-14",
      inner: "w-14 h-14",
    },
  }

  const variantClasses = {
    primary: "bg-[#990011] group-hover/icon:bg-[#80000e] text-white",
    filled: "bg-[#F2F2F2] group-hover/icon:bg-[#C2C2C2]",
    ghost: "bg-transparent group-hover/icon:bg-[#CCCCCC]",
    transparent: "bg-transparent",
    overlay:
      "bg-black/50 group-hover/icon:bg-black/80 text-white/70 group-hover/icon:text-white transition-all",
  }

  const currentSize = sizeClasses[size] || sizeClasses.sm

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group/icon inline-flex items-center justify-center rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${currentSize.button} ${className}`}
      {...props}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full transition-colors ${currentSize.inner} ${variantClasses[variant] || variantClasses.filled}`}
      >
        {children}
      </span>
    </button>
  )
}

export default IconButton
