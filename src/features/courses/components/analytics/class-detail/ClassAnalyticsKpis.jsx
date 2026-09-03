import React from "react"
import { Percent, Users, BookOpen } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const toneStyles = {
  red: "bg-[#FFEBED] text-[#E11D2E]",
  green: "bg-[#E8FAED] text-[#0D9E3D]",
  blue: "bg-[#E5F0FF] text-[#2563EB]",
  purple: "bg-[#F0E5FF] text-[#7C3AED]",
  orange: "bg-[#FFF2E0] text-[#F97316]",
}

const ClassAnalyticsKpis = ({ classData }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}

  const overSessionsText = cd.overSessions
    ? cd.overSessions.replace("{{count}}", classData?.totalSessions || 24)
    : `Trên ${classData?.totalSessions || 24} buổi học`

  const belowThresholdTitle = cd.belowThreshold
    ? cd.belowThreshold.replace("{{rate}}", classData?.thresholdRate ?? 25)
    : `Học viên dưới ngưỡng (< ${classData?.thresholdRate ?? 25}%)`

  const hasBelowThreshold = (classData?.belowThresholdCount ?? 0) > 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* 1. STB Trung bình cả lớp */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.green}`}>
          <Percent size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{cd.avgClassStb || "STB Trung bình cả lớp"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={`${classData?.avgClassStb ?? 78}%`}>
            {classData?.avgClassStb ?? 78}%
          </strong>
          <small className="block text-[11px] text-[#667085] truncate font-normal">{overSessionsText}</small>
        </div>
      </article>

      {/* 2. Học viên dưới ngưỡng */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasBelowThreshold ? toneStyles.orange : toneStyles.green}`}>
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{belowThresholdTitle}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={`${classData?.belowThresholdCount ?? 0} / ${classData?.totalStudents ?? 0} ${cd.studentsUnit || "học viên"}`}>
            {classData?.belowThresholdCount ?? 0} / {classData?.totalStudents ?? 0} {cd.studentsUnit || "học viên"}
          </strong>
          <small className={`block text-[11px] truncate font-normal ${hasBelowThreshold ? "text-[#b45309]" : "text-[#667085]"}`}>
            {cd.needsAttention || "Cần được chú ý thêm"}
          </small>
        </div>
      </article>

      {/* 3. Tổng buổi đã học */}
      <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles.blue}`}>
          <BookOpen size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[#667085] text-xs font-normal truncate">{cd.totalSessionsLearned || "Tổng buổi đã học"}</p>
          <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={`${classData?.completedSessions ?? 0} / ${classData?.totalSessions ?? 0}`}>
            {classData?.completedSessions ?? 0} / {classData?.totalSessions ?? 0}
          </strong>
          <small className="block text-[11px] text-[#667085] truncate font-normal">{classData?.courseName || cd.allSessionsRecorded || "Dữ liệu toàn bộ buổi học"}</small>
        </div>
      </article>
    </div>
  )
}

export default ClassAnalyticsKpis
