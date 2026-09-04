import React from "react"
import { Percent, Users, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const toneStyles = {
  red: "bg-[#FFEBED] text-[#E11D2E]",
  green: "bg-[#E8FAED] text-[#0D9E3D]",
  blue: "bg-[#E5F0FF] text-[#2563EB]",
  purple: "bg-[#F0E5FF] text-[#7C3AED]",
  orange: "bg-[#FFF2E0] text-[#F97316]",
}

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "00:00"
  const totalSecs = Math.round(seconds)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

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

  const avgDurationText = sd.avgDurationPerSession
    ? sd.avgDurationPerSession.replace("{{avg}}", formatDuration(data?.avgDurationPerSession ?? 0))
    : `Trung bình ${formatDuration(data?.avgDurationPerSession ?? 0)}/buổi`

  const isImproving = data?.trend === "improving"
  const isStable = data?.trend === "stable" || !data?.trend
  const trendLabel = isImproving
    ? sd.trendImproving || "Cải thiện"
    : isStable
      ? sd.trendStable || "Ổn định"
      : sd.trendDeclining || "Giảm dần"

  const trendTone = isImproving ? "green" : isStable ? "blue" : "red"
  const TrendIcon = isImproving ? TrendingUp : isStable ? Minus : TrendingDown

  const isRecentMet =
    (data?.recentSessionPercent ?? data?.avgSpeechPercent ?? 0) >=
    (data?.classExpectedRate ?? 25)

  let recentResultText = ""
  if (data?.recentSessionDate) {
    const template = isRecentMet
      ? (sd.recentSessionResultGood || "Buổi {{session}}: đạt {{rate}}%")
      : (sd.recentSessionResult || "Buổi {{session}}: chỉ đạt {{rate}}%")
    recentResultText = template
      .replace("{{session}}", data.recentSessionDate)
      .replace("{{rate}}", data.recentSessionPercent ?? 0)
  } else if (data?.recentSessionNumber) {
    const template = isRecentMet
      ? (sd.recentSessionResultGood || "Buổi {{session}}: đạt {{rate}}%")
      : (sd.recentSessionResult || "Buổi {{session}}: chỉ đạt {{rate}}%")
    recentResultText = template
      .replace("{{session}}", data.recentSessionNumber)
      .replace("{{rate}}", data.recentSessionPercent ?? 0)
  } else {
    const template = isRecentMet
      ? (sd.latestSessionResultGood || sd.latestSessionAvg || "Buổi gần nhất: đạt {{rate}}%")
      : (sd.latestSessionResult || sd.latestSessionAvg || "Buổi gần nhất: chỉ đạt {{rate}}%")
    recentResultText = template
      .replace("{{rate}}", data?.recentSessionPercent ?? data?.avgSpeechPercent ?? 0)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. % Phát biểu TB */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.orange}`}>
          <Percent size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{sd.avgSpeechPercent || "% Phát biểu TB"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={`${data?.avgSpeechPercent ?? 0}%`}>
            {data?.avgSpeechPercent ?? 0}%
          </strong>
          <small className="block text-[11px] text-[#667085] truncate font-normal">{classExpectedText}</small>
        </div>
      </article>

      {/* 2. Buổi đạt ngưỡng */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.green}`}>
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{sd.sessionsMetThreshold || "Buổi đạt ngưỡng"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={`${data?.metRecentCount ?? 0} / ${data?.recentTotal ?? 0}`}>
            {data?.metRecentCount ?? 0} / {data?.recentTotal ?? 0}
          </strong>
          <small className="block text-[11px] text-[#667085] truncate font-normal">{showingRecentText}</small>
        </div>
      </article>

      {/* 3. Tổng thời lượng phát biểu */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.blue}`}>
          <Clock size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{sd.totalSpeakingDuration || "Tổng thời lượng phát biểu"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={formatDuration(data?.totalDurationSeconds ?? 0)}>
            {formatDuration(data?.totalDurationSeconds ?? 0)}
          </strong>
          <small className="block text-[11px] text-[#667085] truncate font-normal">{avgDurationText}</small>
        </div>
      </article>

      {/* 4. Xu hướng gần đây */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles[trendTone]}`}>
          <TrendIcon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{sd.recentTrend || "Xu hướng gần đây"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={trendLabel}>
            {trendLabel}
          </strong>
          <small className="block text-[11px] text-[#667085] truncate font-normal">{recentResultText}</small>
        </div>
      </article>
    </div>
  )
}

export default StudentDetailKpis
