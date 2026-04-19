import React from "react"
import { AlertTriangle } from "lucide-react"

/**
 * StorageBar — displays the user's recording storage usage as a visual progress bar.
 * Mimics Google Drive's storage UI.
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

  // Format storage helper
  const formatStorage = (mb) => {
    if (mb >= 1000) {
      const gb = mb / 1000
      return `${gb % 1 === 0 ? gb : gb.toFixed(1)} GB`
    }
    return `${Math.round(mb)} MB`
  }

  const usedFormatted = formatStorage(usedMb)
  const limitFormatted = formatStorage(limitMb)

  // Mimic Drive's primary blue. If quota exceeded, use red.
  const barColor = isQuotaExceeded ? "bg-red-500" : "bg-blue-500"

  if (isLoading) {
    return (
      <div className="w-full animate-pulse py-2">
        <div className="flex items-baseline mb-3">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200 ml-2" />
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full" />
        <div className="mt-3 flex gap-4">
          <div className="h-4 w-20 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-2">
      {/* Header text */}
      <div className="flex items-baseline mb-2">
        <span className="text-3xl text-gray-800">
          {usedFormatted}
        </span>
        <span className="text-sm text-gray-500 ml-1.5">
          {t?.recordings?.storage?.limit_used?.replace("{{limit}}", limitFormatted) || `of ${limitFormatted} used`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
            <span>{t?.recordings?.storage?.title || "Recordings"}</span>
          </div>
        </div>
        
        {isQuotaExceeded && (
          <div className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t?.recordings?.storage?.quotaExceeded || "Storage full"}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StorageBar
