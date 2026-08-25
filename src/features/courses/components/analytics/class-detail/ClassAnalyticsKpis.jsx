import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ClassAnalyticsKpis = ({ classData }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}

  const overSessionsText = cd.overSessions
    ? cd.overSessions.replace("{{count}}", classData?.totalSessions || 24)
    : `Trên ${classData?.totalSessions || 24} buổi học`

  const belowThresholdTitle = cd.belowThreshold
    ? cd.belowThreshold.replace("{{rate}}", "30")
    : "HV dưới ngưỡng (< 30%)"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. STB Trung bình cả lớp */}
      <div className="bg-[#eafaf1] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs">
        <span className="text-sm font-medium text-[#168853]">
          {cd.avgClassStb || "STB Trung bình cả lớp"}
        </span>
        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-bold text-[#107c41] tracking-tight">
            {classData?.avgClassStb ?? 78}%
          </span>
        </div>
        <span className="text-xs text-[#2e7d32] font-normal">
          {overSessionsText}
        </span>
      </div>

      {/* 2. HV dưới ngưỡng (< 30%) */}
      <div className="bg-[#fef9e7] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs">
        <span className="text-sm font-medium text-[#b45309]">
          {belowThresholdTitle}
        </span>
        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-bold text-[#b45309] tracking-tight">
            {classData?.belowThresholdCount ?? 1} / {classData?.totalStudents ?? 4} HV
          </span>
        </div>
        <span className="text-xs text-[#92400e] font-normal">
          {cd.needsAttention || "Cần được chú ý thêm"}
        </span>
      </div>

      {/* 3. Tổng buổi đã học */}
      <div className="bg-[#f3f4f6] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs">
        <span className="text-sm font-medium text-[#4b5563]">
          {cd.totalSessionsLearned || "Tổng buổi đã học"}
        </span>
        <div className="my-2">
          <span className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
            {classData?.totalSessions ?? 24}
          </span>
        </div>
        <span className="text-xs text-[#6b7280] font-normal">
          {classData?.courseName || cd.allSessionsRecorded || "Dữ liệu toàn bộ buổi học"}
        </span>
      </div>
    </div>
  )
}

export default ClassAnalyticsKpis
