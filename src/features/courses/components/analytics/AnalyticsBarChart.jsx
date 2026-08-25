import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { numberVi } from "../../data/analyticsData"

const AnalyticsBarChart = ({ rows = [], formatter = (val) => numberVi(val) }) => {
  const { t } = useLanguage()
  const noDataText = t.courses?.analytics?.sections?.noData || "No analytics data for this period."
  const max = Math.max(...rows.map((r) => r.value), 1)

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-gray-400">
        {noDataText}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 py-1 w-full min-w-0">
      {rows.map((row, idx) => {
        const val = row.value ?? 0
        const pct = Math.min(Math.max((val / max) * 100, 2), 100)
        return (
          <div
            key={idx}
            className="grid grid-cols-[16px_minmax(50px,1.2fr)_minmax(40px,1.5fr)_minmax(36px,auto)] gap-2 items-center text-xs w-full min-w-0"
          >
            {/* Rank badge */}
            <span className="font-semibold text-[#B25905] text-xs text-center">
              {idx + 1}
            </span>

            {/* Label */}
            <span className="font-medium text-[#14171F] truncate min-w-0" title={row.label}>
              {row.label}
            </span>

            {/* Track & Bar Fill */}
            <div className="h-2 rounded-full bg-[#EDEDF0] overflow-hidden w-full min-w-0">
              <div
                className="h-full rounded-full bg-[#E51A33] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Formatted Value */}
            <strong className="text-right font-semibold text-[#14171F] tabular-nums whitespace-nowrap text-[11px] sm:text-xs min-w-0">
              {formatter(val)}
            </strong>
          </div>
        )
      })}
    </div>
  )
}

export default AnalyticsBarChart
