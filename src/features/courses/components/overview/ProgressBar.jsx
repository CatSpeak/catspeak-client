import React from "react"

const ProgressBar = ({ progress, label, className = "max-w-[220px]" }) => {
  const numericProgress = Number(progress)
  const hasProgress = Number.isFinite(numericProgress) && numericProgress >= 0
  const percent = hasProgress
    ? Math.min(100, Math.max(0, numericProgress))
    : null
  return (
    <div className={`flex flex-col gap-0.5 mt-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-[9px] font-bold text-gray-400 leading-none">
          <span>{label}</span>
          <span>{percent == null ? "—" : `${percent}%`}</span>
        </div>
      )}
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${percent === 100 ? "bg-green-500" : "bg-[#990011]"
            }`}
          style={{ width: `${percent ?? 0}%` }}
          {...(percent == null ? {} : {
            role: "progressbar",
            "aria-label": label || "Progress",
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": percent,
          })}
        />
      </div>
    </div>
  )
}

export default ProgressBar
