import React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  HelpCircle,
  MessageSquare,
  Mic,
  TrendingDown,
  TrendingUp,
  Volume2,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { STB_PRESETS, STB_STATUS } from "../../constants/learnerDashboardConstants"

const StbCircularScore = ({ score = 0, color = "#059669" }) => {
  const radius = 42
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth * 0.5
  const circumference = normalizedRadius * 2 * Math.PI
  const safeScore = Math.min(100, Math.max(0, score))
  const strokeDashoffset = circumference - (safeScore / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          stroke="#E7E9ED"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold leading-none tracking-tight text-[#14171F] tabular-nums sm:text-2xl">
          {score}%
        </span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#6E788C]">
          STB
        </span>
      </div>
    </div>
  )
}

const StbTrendTooltip = ({ active, payload, isEn }) => {
  if (!active || !payload?.length) return null
  const point = payload[0].payload

  return (
    <div className="rounded-lg border border-[#DEE0E5] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-[#14171F]">{point.label}</p>
      <p className="mt-0.5 font-bold text-[#72000D]">
        {isEn ? "STB score: " : "Điểm STB: "}
        <span className="tabular-nums">{point.value}%</span>
      </p>
      {point.tooltip && (
        <p className="mt-1 max-w-52 text-[11px] text-[#6E788C]">{point.tooltip}</p>
      )}
    </div>
  )
}

const StbSection = ({ stbData, stbPreset, onStbPresetChange }) => {
  const { language } = useLanguage()
  const isEn = language === "en"
  const presets = [
    { key: STB_PRESETS.TODAY, labelVi: "Hôm nay", labelEn: "Today" },
    { key: STB_PRESETS.WEEK, labelVi: "Tuần", labelEn: "Week" },
    { key: STB_PRESETS.MONTH, labelVi: "Tháng", labelEn: "Month" },
  ]
  const score = stbData?.stbScore || 0
  const trend = stbData?.trend || []
  const statusConfig = STB_STATUS[stbData?.statusKey] || STB_STATUS.EXCELLENT
  const statusLabel = isEn ? statusConfig.labelEn : statusConfig.labelVi
  const delta = stbData?.deltaPercent

  return (
    <section
      aria-labelledby="stb-heading"
      className="flex h-full min-w-0 flex-col rounded-xl border border-[#DEE0E5] bg-white p-4 shadow-2xs sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 shrink-0 text-[#72000D]" />
            <h2 id="stb-heading" className="text-sm font-bold text-[#14171F] sm:text-base">
              {isEn ? "Speaking Time Balance (STB)" : "Cân bằng thời gian nói (STB)"}
            </h2>
            <span
              className="shrink-0"
              title={
                isEn
                  ? "STB = 0.4 × Time% + 0.6 × WordCount%"
                  : "STB = 0,4 × Tỷ lệ thời gian + 0,6 × Tỷ lệ số từ"
              }
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#9AA2B1]" />
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#6E788C] sm:text-xs">
            {isEn
              ? "Your speaking participation across online classroom sessions"
              : "Mức độ tham gia phát biểu trong các phòng học trực tuyến"}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={isEn ? "Speaking balance period" : "Khoảng thời gian cân bằng nói"}
          className="flex w-full shrink-0 rounded-lg border border-[#DEE0E5] bg-[#F6F7F9] p-1 sm:w-auto"
        >
          {presets.map((tab) => {
            const isActive = stbPreset === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => onStbPresetChange(tab.key)}
                className={`min-h-7 flex-1 rounded-md px-3 py-1 text-[11px] font-semibold transition-colors sm:flex-none sm:text-xs ${
                  isActive
                    ? "bg-white text-[#72000D] shadow-xs ring-1 ring-black/5"
                    : "text-[#6E788C] hover:bg-white/60 hover:text-[#14171F]"
                }`}
              >
                {isEn ? tab.labelEn : tab.labelVi}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[132px_minmax(0,1fr)]">
        <div className="flex items-center justify-center gap-4 rounded-xl border border-[#E7E9ED] bg-[#FAFAFB] p-3 sm:flex-col sm:gap-1.5">
          <StbCircularScore score={score} color={statusConfig.color} />
          <div className="flex min-w-0 flex-col items-center gap-1.5">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusConfig.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
              <span>{statusLabel}</span>
            </div>
            {delta !== undefined && delta !== null && (
              <span
                className={`inline-flex items-center gap-0.5 whitespace-nowrap text-[10px] font-semibold ${
                  delta >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {delta >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {delta > 0 ? "+" : ""}{delta}% {isEn ? "vs previous" : "so kỳ trước"}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 min-[430px]:grid-cols-2">
          <article className="flex min-h-24 flex-col justify-between rounded-xl border border-[#E7E9ED] bg-[#FAFAFB] p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6E788C]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F7EFF0] text-[#72000D]">
                <Volume2 className="h-3.5 w-3.5" />
              </span>
              <span>{isEn ? "Speaking time" : "Thời gian nói"}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-[#14171F] tabular-nums">
              {stbData?.speakingTimeFormatted || "0m"}
            </p>
          </article>

          <article className="flex min-h-24 flex-col justify-between rounded-xl border border-[#E7E9ED] bg-[#FAFAFB] p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6E788C]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MessageSquare className="h-3.5 w-3.5" />
              </span>
              <span>{isEn ? "Words spoken" : "Số từ phát biểu"}</span>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-[#14171F] tabular-nums">
                {stbData?.wordsSpoken?.toLocaleString() || "0"}
                <span className="ml-1 text-xs font-semibold text-[#6E788C]">
                  {isEn ? "words" : "từ"}
                </span>
              </p>
              {stbData?.averagePaceWpm !== undefined &&
                stbData?.averagePaceWpm !== null && (
                  <p className="mt-1 text-[10px] text-[#6E788C]">
                    {isEn ? "Average pace" : "Tốc độ trung bình"}: {" "}
                    <span className="font-semibold text-[#14171F]">
                      {stbData.averagePaceWpm} WPM
                    </span>
                  </p>
                )}
            </div>
          </article>
        </div>
      </div>

      <div className="mt-4 flex min-h-[132px] flex-1 flex-col border-t border-[#E7E9ED] pt-3">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#6E788C] sm:text-[11px]">
            {isEn ? "Speaking balance trend" : "Xu hướng cân bằng thời gian nói"}
          </p>
          {trend.length > 0 && (
            <span className="text-[10px] font-semibold text-[#9AA2B1]">
              {isEn ? "Score / 100" : "Điểm / 100"}
            </span>
          )}
        </div>

        {trend.length > 0 ? (
          <div className="min-h-[96px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="stbTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={statusConfig.color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={statusConfig.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6E788C" }}
                  interval="preserveStartEnd"
                  minTickGap={18}
                />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<StbTrendTooltip isEn={isEn} />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={statusConfig.color}
                  strokeWidth={2.25}
                  fill="url(#stbTrendFill)"
                  dot={{ r: 3, fill: statusConfig.color, strokeWidth: 1.5, stroke: "#fff" }}
                  activeDot={{ r: 5, fill: statusConfig.color, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex min-h-[96px] flex-1 items-center justify-center rounded-lg bg-[#FAFAFB] px-4 text-center text-xs text-[#9AA2B1]">
            {isEn ? "No speaking-balance trend yet." : "Chưa có dữ liệu xu hướng cân bằng nói."}
          </div>
        )}
      </div>
    </section>
  )
}

export default StbSection
