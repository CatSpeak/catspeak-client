import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "00:00"
  const totalSecs = Math.round(seconds)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

const SessionDetailKpis = ({ sessionData, teacherName = "Giảng viên" }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sessT = c.analytics?.sessionDetail || {}

  const teacherPercent = sessionData?.teacherSpeechPercent ?? 0
  const studentPercent = sessionData?.studentSpeechPercent ?? 0
  const totalWords =
    sessionData?.totalStudentWords ??
    sessionData?.totalWords ??
    0
  const durationSeconds =
    sessionData?.totalStudentDurationSeconds ??
    sessionData?.durationSeconds ??
    sessionData?.totalDurationSeconds ??
    0
  const studentCount = sessionData?.studentCount ?? (sessionData?.participants?.length || 0)
  const lowSpeakingCount = sessionData?.lowSpeakingCount ?? 0

  const getTeacherStatusText = (status) => {
    switch (status) {
      case "ideal":
        return sessT.statusIdeal || "Trạng thái: Lý tưởng"
      case "talked_too_much":
        return sessT.statusTooMuch || "Trạng thái: Nói nhiều"
      case "talked_too_little":
        return sessT.statusTooLittle || "Trạng thái: Nói ít"
      default:
        return sessT.statusNormal || "Trạng thái: Bình thường"
    }
  }

  const belowThresholdText = lowSpeakingCount > 0
    ? (sessT.belowThresholdCount ? sessT.belowThresholdCount.replace("{{count}}", lowSpeakingCount) : `${lowSpeakingCount} học viên dưới ngưỡng`)
    : (sessT.zeroBelowThreshold || "0 học viên dưới ngưỡng")

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Tỷ lệ phát biểu (GV / HV) */}
      <div className="bg-[#f0f9ff] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-200 border border-sky-100/60">
        <span className="text-sm font-medium text-[#0369a1]">
          {sessT.kpiSpeechRatio || "Tỷ lệ phát biểu (GV / HV)"}
        </span>
        <div className="my-2 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#0c4a6e] tracking-tight">
              {sessT.teacherTag || "GV"} {teacherPercent}% · {sessT.studentTag || "HV"} {studentPercent}%
            </span>
          </div>
          {/* Split Progress Bar */}
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, Math.max(0, teacherPercent))}%` }}
              className="bg-sky-500 h-full transition-all duration-500"
              title={`${sessT.teacherTag || "GV"}: ${teacherPercent}%`}
            />
            <div
              style={{ width: `${Math.min(100, Math.max(0, studentPercent))}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`${sessT.studentTag || "HV"}: ${studentPercent}%`}
            />
          </div>
        </div>
        <span className="text-xs text-[#0284c7] font-medium">
          {getTeacherStatusText(sessionData?.teacherStatus)}
        </span>
      </div>

      {/* 2. Tổng số từ & Thời lượng */}
      <div className="bg-[#f3f4f6] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-200 border border-gray-200/50">
        <span className="text-sm font-medium text-[#4b5563]">
          {sessT.kpiTotalWordsDuration || "Tổng từ & Thời lượng"}
        </span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            {totalWords.toLocaleString()} <span className="text-lg font-semibold text-gray-500">{sessT.wordsUnit || "từ"}</span>
          </span>
        </div>
        <span className="text-xs text-[#6b7280] font-normal">
          {sessT.durationPrefix || "Thời gian:"} <strong className="font-semibold text-gray-700">{formatDuration(durationSeconds)}</strong>
        </span>
      </div>

      {/* 3. Học viên tham gia */}
      <div className="bg-[#eafaf1] rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-200 border border-emerald-100/60">
        <span className="text-sm font-medium text-[#168853]">
          {sessT.kpiParticipatingStudents || "Học viên tham gia"}
        </span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#107c41] tracking-tight">
            {studentCount} <span className="text-lg font-semibold text-emerald-700">{sessT.studentsUnit || "học viên"}</span>
          </span>
        </div>
        <span className="text-xs text-[#2e7d32] font-normal">
          {lowSpeakingCount > 0 ? (
            <span className="text-amber-700 font-semibold">{belowThresholdText}</span>
          ) : (
            belowThresholdText
          )}
        </span>
      </div>
    </div>
  )
}

export default SessionDetailKpis
