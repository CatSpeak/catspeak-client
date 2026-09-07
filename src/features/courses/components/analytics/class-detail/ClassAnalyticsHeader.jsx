import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

const ClassAnalyticsHeader = ({ classData }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}

  const breadcrumbItems = [
    { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
    {
      label: cd.breadcrumbAnalytics || c.analytics?.title || "Phân tích",
      onClick: () => navigate("/workspace/analytics?tab=courses"),
    },
    { label: classData?.className || "Chi tiết lớp học" },
  ]

  const subtitleParts = [
    classData?.courseName,
    `${classData?.totalStudents ?? 0} ${cd.studentsCount ? cd.studentsCount.replace("{{count}}", "") : "học viên"}`,
    `${classData?.totalSessions ?? 0} ${cd.sessionsCount ? cd.sessionsCount.replace("{{count}}", "") : "buổi"}`,
  ].filter(Boolean)

  const subtitleText = subtitleParts.length > 0
    ? `STB Chi tiết · ${subtitleParts.join(" · ")}`
    : `STB Chi tiết · ${classData?.totalStudents || 0} học viên · ${classData?.totalSessions || 0} buổi`

  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title & Subtitle */}
      <div className="flex flex-col gap-1 mt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {classData?.className || "Tiếng Anh B2 — Nhóm sáng"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          {subtitleText}
        </p>
      </div>
    </div>
  )
}

export default ClassAnalyticsHeader
