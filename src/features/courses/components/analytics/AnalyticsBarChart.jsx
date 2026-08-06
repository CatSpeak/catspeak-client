import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { numberVi } from "../../data/analyticsData"

const AnalyticsBarChart = ({ rows = [], formatter = (val) => numberVi(val) }) => {
  const { t } = useLanguage()
  const noDataText = t.courses?.analytics?.sections?.noData || "No analytics data for this period."
  const max = Math.max(...rows.map((r) => r.value), 1)

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
        {noDataText}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      {rows.map((row, idx) => {
        const pct = Math.min(Math.max((row.value / max) * 100, 2), 100)
        return (
          <div
            key={idx}
            className="grid grid-cols-[24px_minmax(120px,1.2fr)_minmax(100px,2fr)_minmax(80px,auto)] gap-2.5 items-center text-xs"
          >
            {/* Rank badge */}
            <span className="w-5 h-5 rounded-full bg-[#fff0d7] text-[#9a5a00] font-bold flex items-center justify-center text-[11px]">
              {idx + 1}
            </span>

            {/* Label */}
            <span className="font-medium text-gray-800 truncate" title={row.label}>
              {row.label}
            </span>

            {/* Track & Bar Fill */}
            <div className="h-2.5 rounded-md bg-[#f0f1f3] overflow-hidden w-full">
              <div
                className="h-full rounded-md bg-gradient-to-r from-[#e11d2e] to-[#f06a77] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Formatted Value */}
            <strong className="text-right font-semibold text-gray-900 truncate">
              {formatter(row.value)}
            </strong>
          </div>
        )
      })}
    </div>
  )
}

export default AnalyticsBarChart
