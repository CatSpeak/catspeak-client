import React from "react"

const colorVariants = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-700",
  dark: "bg-gray-900 text-white",
  "cath-red": "bg-cath-red-800 text-white",
}

const Badge = ({ children, color = "emerald", className = "" }) => {
  const colorClass = colorVariants[color] || colorVariants.gray

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full shadow-sm whitespace-nowrap ${colorClass} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
