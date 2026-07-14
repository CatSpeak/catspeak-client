import React from "react"

const ProgressBar = ({
  progress = 0,
  heightClass = "h-1",
  colorClass = "bg-[#990011]",
  trackColorClass = "bg-gray-200",
  className = "",
}) => {
  return (
    <div className={`w-full ${trackColorClass} rounded-full overflow-hidden flex items-center ${heightClass} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  )
}

export default ProgressBar
