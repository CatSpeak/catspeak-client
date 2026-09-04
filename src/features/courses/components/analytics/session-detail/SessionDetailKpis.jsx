import React from "react"
import { Percent, Users, Clock } from "lucide-react"
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

const SessionDetailKpis = ({ sessionData, teacherName = "Giảng viên" }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sessT = c.analytics?.sessionDetail || {}

  const teacherPercent = sessionData?.teacherSpeechPercent ?? 0
  const studentPercent = sessionData?.studentSpeechPercent ?? 0
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* 1. Tỷ lệ phát biểu (GV / HV) */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.blue}`}>
          <Percent size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{sessT.kpiSpeechRatio || "Tỷ lệ phát biểu (GV / HV)"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={`${sessT.teacherTag || "GV"} ${teacherPercent}% · ${sessT.studentTag || "HV"} ${studentPercent}%`}>
            {sessT.teacherTag || "GV"} {teacherPercent}% · {sessT.studentTag || "HV"} {studentPercent}%
          </strong>
          {/* Split progress mini bar + status */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex shrink-0">
              <div
                style={{ width: `${Math.min(100, Math.max(0, teacherPercent))}%` }}
                className="bg-sky-500 h-full"
              />
              <div
                style={{ width: `${Math.min(100, Math.max(0, studentPercent))}%` }}
                className="bg-emerald-500 h-full"
              />
            </div>
            <small className="block text-[11px] text-[#667085] truncate font-normal">
              {getTeacherStatusText(sessionData?.teacherStatus)}
            </small>
          </div>
        </div>
      </article>

      {/* 2. Tổng thời lượng phát biểu */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.purple}`}>
          <Clock size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{sessT.kpiTotalDuration || "Tổng thời lượng phát biểu"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={formatDuration(durationSeconds)}>
            {formatDuration(durationSeconds)}
          </strong>
          <small className="block text-[11px] text-[#667085] truncate font-normal">{sessT.durationHint || "Thời gian học viên thảo luận"}</small>
        </div>
      </article>

      {/* 3. Học viên tham gia */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.green}`}>
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{sessT.kpiParticipatingStudents || "Học viên tham gia"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={`${studentCount} ${sessT.studentsUnit || "học viên"}`}>
            {studentCount} <span className="text-xs font-semibold text-[#667085]">{sessT.studentsUnit || "học viên"}</span>
          </strong>
          <small className={`block text-[11px] truncate font-normal ${lowSpeakingCount > 0 ? "text-[#b45309]" : "text-[#667085]"}`}>
            {belowThresholdText}
          </small>
        </div>
      </article>
    </div>
  )
}

export default SessionDetailKpis
