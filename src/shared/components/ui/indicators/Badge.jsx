import React from "react"

const colorVariants = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-700",
  dark: "bg-black/60 text-white backdrop-blur-sm",
  "dark-solid": "bg-gray-900 text-white",
  "dark-frosted": "bg-black/60 text-white backdrop-blur-sm",
  white: "bg-white text-neutral-900",
  "cath-red": "bg-cath-red-800 text-white",
}

const sizeVariants = {
  sm: "h-4 px-1 text-xs",
  md: "h-6.5 sm:h-7 px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold",
  lg: "h-7 sm:h-8 px-3 text-xs font-semibold",
}

const Badge = ({
  children,
  color = "emerald",
  size = "sm",
  className = "",
  ...props
}) => {
  const colorClass = colorVariants[color] || colorVariants.gray
  const sizeClass = sizeVariants[size] || sizeVariants.sm

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center gap-1 font-medium rounded-full shadow-sm whitespace-nowrap cursor-default ${sizeClass} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
