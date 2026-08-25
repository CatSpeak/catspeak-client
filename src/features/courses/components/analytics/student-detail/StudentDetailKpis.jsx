import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const StudentDetailKpis = ({ data }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sd = c.analytics?.studentDetail || {}

  const classExpectedText = sd.classExpected
    ? sd.classExpected.replace("{{rate}}", data?.classExpectedRate ?? 25)
    : `Kỳ vọng lớp: ${data?.classExpectedRate ?? 25}%`

  const showingRecentText = sd.showingRecentSessions
    ? sd.showingRecentSessions.replace("{{count}}", data?.recentTotal ?? 6)
    : `Hiển thị ${data?.recentTotal ?? 6} buổi gần nhất`

  const avgWordsText = sd.avgWordsPerSession
    ? sd.avgWordsPerSession.replace("{{avg}}", data?.avgWordsPerSession ?? 165)
    : `Trung bình ${data?.avgWordsPerSession ?? 165} từ/buổi`

  const isImproving = data?.trend === "improving"
  const isStable = data?.trend === "stable" || !data?.trend
  const trendIcon = isImproving ? "↗" : isStable ? "→" : "↘"
  const trendLabel = isImproving
    ? sd.trendImproving || "Cải thiện"
    : isStable
      ? sd.trendStable || "Ổn định"
      : sd.trendDeclining || "Giảm dần"

  const trendBg = isImproving
    ? "bg-[#eafaf1]"
    : isStable
      ? "bg-[#f3f4f6]"
      : "bg-[#ffeceb]"

  const trendHeaderColor = isImproving
    ? "text-[#168853]"
    : isStable
      ? "text-[#4b5563]"
      : "text-[#be123c]"

  const trendValueColor = isImproving
    ? "text-[#107c41]"
    : isStable
      ? "text-[#111827]"
      : "text-[#e11d48]"

  const trendSubColor = isImproving
    ? "text-[#2e7d32]"
    : isStable
      ? "text-[#6b7280]"
      : "text-[#be123c]"

  const recentResultText = data?.recentSessionNumber
    ? `Buổi ${data.recentSessionNumber}: đạt ${data.recentSessionPercent ?? 0}%`
    : `Buổi gần nhất: ${data?.avgSpeechPercent ?? 0}%`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. % Phát biểu TB */}
      <div className="bg-[#fff8e7] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-200">
        <span className="text-sm font-medium text-[#b45309]">
          {sd.avgSpeechPercent || "% Phát biểu TB"}
        </span>
        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-bold text-[#b45309] tracking-tight">
            {data?.avgSpeechPercent ?? 0}%
          </span>
        </div>
        <span className="text-xs text-[#92400e] font-normal">
          {classExpectedText}
        </span>
      </div>

      {/* 2. Buổi đạt ngưỡng */}
      <div className="bg-[#eafaf1] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-200">
        <span className="text-sm font-medium text-[#168853]">
          {sd.sessionsMetThreshold || "Buổi đạt ngưỡng"}
        </span>
        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-bold text-[#107c41] tracking-tight">
            {data?.metRecentCount ?? 0} / {data?.recentTotal ?? 0}
          </span>
        </div>
        <span className="text-xs text-[#2e7d32] font-normal">
          {showingRecentText}
        </span>
      </div>

      {/* 3. Tổng số từ đã nói */}
      <div className="bg-[#f3f4f6] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-200">
        <span className="text-sm font-medium text-[#4b5563]">
          {sd.totalWordsSpoken || "Tổng số từ đã nói"}
        </span>
        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
            {data?.totalWords?.toLocaleString() ?? "0"}
          </span>
        </div>
        <span className="text-xs text-[#6b7280] font-normal">
          {avgWordsText}
        </span>
      </div>

      {/* 4. Xu hướng gần đây */}
      <div className={`${trendBg} rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-200`}>
        <span className={`text-sm font-medium ${trendHeaderColor}`}>
          {sd.recentTrend || "Xu hướng gần đây"}
        </span>
        <div className="my-2">
          <span className={`text-2xl sm:text-3xl font-bold ${trendValueColor} tracking-tight`}>
            {trendIcon} {trendLabel}
          </span>
        </div>
        <span className={`text-xs ${trendSubColor} font-normal`}>
          {recentResultText}
        </span>
      </div>
    </div>
  )
}

export default StudentDetailKpis
