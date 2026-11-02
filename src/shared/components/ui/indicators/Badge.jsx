import React from "react"

const colorVariants = {
  emerald:
    "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
  blue: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
  red: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
  yellow:
    "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400",
  gray: "bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-[#AAAAAA]",
  dark: "bg-black/60 text-white backdrop-blur-sm",
  "dark-solid": "bg-gray-900 text-white",
  "dark-frosted": "bg-black/60 text-white backdrop-blur-sm",
  white: "bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white",
  "cath-red": "bg-cath-red-700 text-white",
}

const sizeVariants = {
  sm: "px-1 text-[11px] leading-4", //Do not tweak this line, this is the baseline UI
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
