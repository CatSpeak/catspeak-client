import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

const StudentDetailHeader = ({ data }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}
  const sd = c.analytics?.studentDetail || {}

  const breadcrumbItems = [
    { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
    {
      label: cd.breadcrumbAnalytics || c.analytics?.title || "Phân tích",
      onClick: () => navigate("/workspace/analytics?tab=courses"),
    },
    {
      label: data?.className || "Chi tiết lớp học",
      onClick: () => {
        const targetId = data?.classId ?? data?.id
        if (targetId) {
          navigate(`/workspace/analytics/class/${encodeURIComponent(targetId)}`)
        }
      },
    },
    { label: data?.studentName || "Học viên" },
  ]

  const titleText = sd.historyTitle
    ? sd.historyTitle.replace("{{name}}", data?.studentName || "Lê C")
    : `Lịch sử phát biểu — ${data?.studentName || "Lê C"}`

  const subtitleParts = [
    data?.className,
    `${data?.totalSessions ?? 0} ${sd.sessionsCount ? sd.sessionsCount.replace("{{count}}", "") : "buổi tham gia"}`,
  ].filter(Boolean)

  const subtitleText = subtitleParts.join(" · ") || `${data?.className || "Lớp học"} · ${data?.totalSessions || 0} buổi tham gia`

  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1 mt-1">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
          {titleText}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          {subtitleText}
        </p>
      </div>
    </div>
  )
}

export default StudentDetailHeader
