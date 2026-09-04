import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

const formatDate = (isoStr) => {
  if (!isoStr) return ""
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return isoStr
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

const formatTime = (isoStr) => {
  if (!isoStr) return ""
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ""
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${min}`
}

const SessionDetailHeader = ({ sessionData, classData }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}
  const sessT = c.analytics?.sessionDetail || {}

  const classId = classData?.classId ?? classData?.id
  const className = classData?.className || classData?.courseName || (cd.breadcrumbClass || "Chi tiết lớp học")

  const createdIso = sessionData?.createdAt || sessionData?.created_at
  const dateDisplay = formatDate(createdIso)
  const timeDisplay = formatTime(createdIso)
  const sessionName = [dateDisplay, timeDisplay].filter(Boolean).join(" · ") || (sessT.sessionDetail || "Chi tiết buổi học")

  const breadcrumbItems = [
    { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
    {
      label: cd.breadcrumbAnalytics || c.analytics?.title || "Phân tích",
      onClick: () => navigate("/workspace/analytics?tab=courses"),
    },
    {
      label: className,
      onClick: () => {
        if (classId) {
          navigate(`/workspace/analytics/class/${encodeURIComponent(classId)}`)
        }
      },
    },
    { label: sessionName },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Title */}
      <div className="flex flex-col gap-1 mt-1">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
          {sessionName}
        </h1>
      </div>
    </div>
  )
}

export default SessionDetailHeader
