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
import { Clock, Info } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { TIME_GRANULARITY } from "../../constants/learnerDashboardConstants"

const CustomTooltip = ({ active, payload, label, isEn }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-white border border-[#DEE0E5] rounded-lg p-2.5 shadow-md text-xs">
        <p className="font-bold text-[#14171F] mb-1">{isEn && item.labelEn ? item.labelEn : label}</p>
        <p className="text-[#72000D] font-semibold">
          {isEn ? "Study Time: " : "Thời gian học: "}
          <span className="tabular-nums">{payload[0].value} {isEn ? "hours" : "giờ"}</span>
        </p>
        {item.sessions && (
          <p className="text-[#6E788C] mt-0.5">
            {isEn ? "Sessions: " : "Số buổi: "}
            <span className="tabular-nums">{item.sessions}</span>
          </p>
        )}
      </div>
    )
  }
  return null
}

const LearningTimeSection = ({
  data = [],
  timeGranularity,
  onGranularityChange,
}) => {
  const { language } = useLanguage()
  const isEn = language === "en"

  const granularityTabs = [
    { key: TIME_GRANULARITY.DAY, labelVi: "Ngày", labelEn: "Day" },
    { key: TIME_GRANULARITY.WEEK, labelVi: "Tuần", labelEn: "Week" },
    { key: TIME_GRANULARITY.MONTH, labelVi: "Tháng", labelEn: "Month" },
    { key: TIME_GRANULARITY.YEAR, labelVi: "Năm", labelEn: "Year" },
  ]

  return (
    <section
      aria-labelledby="learning-time-heading"
      className="bg-white border border-[#DEE0E5] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
    >
      {/* Header & Granularity Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#72000D]" />
            <h2 id="learning-time-heading" className="text-base font-bold text-[#14171F]">
              {isEn ? "Learning Time Trend" : "Thời gian học tập"}
            </h2>
          </div>
          <p className="text-xs text-[#6E788C] mt-0.5">
            {isEn
              ? "Track your cumulative learning duration and pace"
              : "Thống kê tổng số giờ học tích lũy theo các mốc thời gian"}
          </p>
        </div>

        {/* Granularity Button Group */}
        <div
          role="tablist"
          aria-label={isEn ? "Time Granularity" : "Độ chia thời gian"}
          className="inline-flex p-0.5 bg-[#F5F5F7] border border-[#DEE0E5] rounded-lg self-start sm:self-auto"
        >
          {granularityTabs.map((tab) => {
            const isActive = timeGranularity === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => onGranularityChange(tab.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-[#72000D] shadow-2xs"
                    : "text-[#6E788C] hover:text-[#14171F]"
                }`}
              >
                {isEn ? tab.labelEn : tab.labelVi}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[220px] sm:h-[260px] pt-2">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
              <XAxis
                dataKey={(item) => (isEn && item.labelEn ? item.labelEn : item.label)}
                tick={{ fontSize: 11, fill: "#6E788C" }}
                axisLine={{ stroke: "#DEE0E5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6E788C" }}
                axisLine={false}
                tickLine={false}
                unit="h"
              />
              <Tooltip content={<CustomTooltip isEn={isEn} />} />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#72000D"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#72000D", strokeWidth: 1.5, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#B80514", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-1 text-xs">
            <Info className="w-5 h-5 text-gray-300" />
            <span>{isEn ? "No learning session data available." : "Chưa có dữ liệu phiên học trong khoảng này."}</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default LearningTimeSection
