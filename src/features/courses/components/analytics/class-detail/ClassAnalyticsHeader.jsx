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

  const subtitleText = cd.metaSubtitle
    ? cd.metaSubtitle
        .replace("{{term}}", classData?.term || "Kỳ Hè 2026")
        .replace("{{students}}", classData?.totalStudents || 4)
        .replace("{{sessions}}", classData?.totalSessions || 24)
    : `STB Chi tiết · ${classData?.term || "Kỳ Hè 2026"} · ${classData?.totalStudents || 4} học viên · ${classData?.totalSessions || 24} buổi`

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
