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
import { Sparkles, Trophy, TrendingUp, Info } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const AiScoreTooltip = ({ active, payload, label, isEn }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-white border border-[#DEE0E5] rounded-lg p-2.5 shadow-md text-xs space-y-1">
        <p className="font-bold text-[#14171F] border-b border-gray-100 pb-1">
          {isEn && item.weekEn ? item.weekEn : label}
        </p>
        <p className="text-emerald-700 font-bold">
          {isEn ? "Overall Score: " : "Điểm tổng: "}
          <span className="tabular-nums">{item.score} / 100</span>
        </p>
        {item.fluency && (
          <div className="text-[11px] text-[#6E788C] grid grid-cols-2 gap-x-2 pt-0.5">
            <span>{isEn ? "Fluency:" : "Lưu loát:"} {item.fluency}</span>
            <span>{isEn ? "Pronunc.:" : "Phát âm:"} {item.pronunciation}</span>
            <span>{isEn ? "Vocab:" : "Từ vựng:"} {item.vocabulary}</span>
            <span>{isEn ? "Grammar:" : "Ngữ pháp:"} {item.grammar}</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

const AiSpeakingScoreSection = ({ data }) => {
  const { language } = useLanguage()
  const isEn = language === "en"

  const currentScore = data?.currentScore
  const gradeLevel = data?.gradeLevel
  const trend = data?.trend || []
  const delta = data?.deltaPercent

  return (
    <section
      aria-labelledby="ai-score-heading"
      className="bg-white border border-[#DEE0E5] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 id="ai-score-heading" className="text-base font-bold text-[#14171F]">
              {isEn ? "AI Speaking Score Evaluation" : "Đánh giá điểm nói AI"}
            </h2>
          </div>
          <p className="text-xs text-[#6E788C] mt-0.5">
            {isEn
              ? "Comprehensive scoring on 0–100 scale across speech dimensions"
              : "Thang điểm 0–100 đánh giá độ trôi chảy, phát âm, từ vựng và ngữ pháp"}
          </p>
        </div>

        {/* Current Score Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-right shrink-0">
          <Trophy className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold text-emerald-800 tabular-nums">
                {currentScore ?? "N/A"}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">/ 100</span>
            </div>
            {gradeLevel && (
              <p className="text-[10px] font-bold text-emerald-700">{gradeLevel}</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[200px] sm:h-[220px] pt-1">
        {trend && trend.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
              <XAxis
                dataKey={(item) => (isEn && item.weekEn ? item.weekEn : item.week)}
                tick={{ fontSize: 11, fill: "#6E788C" }}
                axisLine={{ stroke: "#DEE0E5" }}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 11, fill: "#6E788C" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<AiScoreTooltip isEn={isEn} />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#059669", strokeWidth: 1.5, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#047857", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-1 text-xs">
            <Info className="w-5 h-5 text-gray-300" />
            <span>{isEn ? "No AI assessments yet." : "Chưa có bài đánh giá AI nào hoàn thành."}</span>
          </div>
        )}
      </div>

      {/* Footer delta note */}
      <div className="mt-2 pt-2 border-t border-[#DEE0E5]/60 flex items-center justify-between text-xs text-[#6E788C]">
        <span>{isEn ? "AI Scoring Standard: CEFR & IELTS" : "Tiêu chuẩn đánh giá: CEFR & IELTS Speaking"}</span>
        {delta !== undefined && delta !== null && (
          <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>{delta > 0 ? "+" : ""}{delta}% {isEn ? "growth" : "tiến bộ"}</span>
          </span>
        )}
      </div>
    </section>
  )
}

export default AiSpeakingScoreSection
