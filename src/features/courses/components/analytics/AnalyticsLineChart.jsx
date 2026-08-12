import React from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { useLanguage } from "@/shared/context/LanguageContext"
import { numberVi } from "../../data/analyticsData"

const defaultColors = ["#e11d2e", "#f97316", "#2563eb", "#7c3aed", "#16a34a"]

const CustomTooltip = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white p-3 rounded-xl shadow-xl text-xs min-w-[180px] border border-gray-800">
        <strong className="block mb-1.5 text-xs text-gray-200">{label}</strong>
        {payload.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-0.5 gap-4">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-semibold text-white">
              {valueFormatter ? valueFormatter(item.value) : numberVi(item.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const AnalyticsLineChart = ({
  chartLabels = [],
  series = [],
  valueFormatter = (val) => numberVi(val),
  axisFormatter = (val) => numberVi(val),
  clickable = false,
  onDrillDown,
}) => {
  const { t } = useLanguage()
  const secT = t.courses?.analytics?.sections || {}
  const clickToDrillText = secT.clickToDrill || "Nhấp vào điểm dữ liệu để xem chi tiết ngày"

  // Transform labels and series into Recharts data format
  const chartData = chartLabels.map((lbl, idx) => {
    const pointObj = { label: lbl, rawIndex: idx }
    series.forEach((s) => {
      pointObj[s.name] = s.values[idx]
    })
    return pointObj
  })

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center rounded-xl border border-dashed border-border text-sm text-gray-400">
        {secT.noData || "No analytics data for this period."}
      </div>
    )
  }

  const handleChartClick = (state) => {
    if (clickable && onDrillDown && state && state.activeTooltipIndex !== undefined) {
      onDrillDown(state.activeTooltipIndex)
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Legend & Unit Label */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 font-medium px-1 mb-1">
        <div className="flex flex-wrap items-center gap-3">
          {series.map((s, idx) => {
            const color = s.color || defaultColors[idx % defaultColors.length]
            return (
              <div key={s.name} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-1 rounded-full inline-block"
                  style={{ backgroundColor: color }}
                />
                <span>{s.name}</span>
              </div>
            )
          })}
        </div>

        {clickable && (
          <span className="text-[11px] text-[#990011] font-semibold bg-[#ffecef] px-2.5 py-0.5 rounded-full">
            {clickToDrillText}
          </span>
        )}
      </div>

      {/* Recharts Container */}
      <div className="w-full h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
            onClick={handleChartClick}
            className={clickable ? "cursor-pointer" : ""}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e9edf2" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#718096" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#667085" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={axisFormatter}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={valueFormatter} />}
              cursor={{ stroke: "#98a2b3", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            {series.map((s, idx) => {
              const color = s.color || defaultColors[idx % defaultColors.length]
              return (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={color}
                  strokeWidth={3}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                  dot={{ r: 3, fill: color, stroke: "#fff", strokeWidth: 1.5 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AnalyticsLineChart
