import React from "react"

const colorVariants = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-700",
}

const Badge = ({ children, color = "emerald", className = "" }) => {
  const colorClass = colorVariants[color] || colorVariants.gray

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorClass} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
