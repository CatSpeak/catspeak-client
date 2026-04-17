import React from "react"
import { HardDrive, AlertTriangle } from "lucide-react"

/**
 * StorageBar — displays the user's recording storage usage as a visual progress bar.
 *
 * @param {{ usedMb: number, limitMb: number, usagePercent: number, isQuotaExceeded: boolean, isLoading: boolean }} props
 */
const StorageBar = ({
  usedMb = 0,
  limitMb = 200,
  usagePercent = 0,
  isQuotaExceeded = false,
  isLoading = false,
  t,
}) => {
  // Clamp percentage to 0-100 for the bar width
  const clampedPercent = Math.min(Math.max(usagePercent, 0), 100)

  // Color coding based on usage
  const getBarColor = () => {
    if (isQuotaExceeded || clampedPercent >= 90) return "bg-red-500"
    if (clampedPercent >= 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getBarBgColor = () => {
    if (isQuotaExceeded || clampedPercent >= 90) return "bg-red-50"
    if (clampedPercent >= 70) return "bg-amber-50"
    return "bg-gray-100"
  }

  const getTextColor = () => {
    if (isQuotaExceeded || clampedPercent >= 90) return "text-red-700"
    if (clampedPercent >= 70) return "text-amber-700"
    return "text-gray-700"
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200" />
        <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <HardDrive className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">
            {t?.recordings?.storage?.title || "Storage"}
          </span>
        </div>
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {t?.recordings?.storage?.used?.replace("{{used}}", usedMb.toFixed(1)).replace("{{limit}}", limitMb.toFixed(0)) || `${usedMb.toFixed(1)} / ${limitMb.toFixed(0)} MB`}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`h-2.5 w-full rounded-full ${getBarBgColor()} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      {/* Footer info */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {t?.recordings?.storage?.percentUsed?.replace("{{percent}}", clampedPercent.toFixed(1)) || `${clampedPercent.toFixed(1)}% used`}
        </span>
        {isQuotaExceeded && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t?.recordings?.storage?.quotaExceeded || "Storage full — delete recordings to free space"}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StorageBar
