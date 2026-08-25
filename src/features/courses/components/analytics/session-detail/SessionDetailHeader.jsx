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

  const classId = classData?.classId ?? classData?.id
  const className = classData?.className || classData?.courseName || "Chi tiết lớp học"
  const sessionNum = sessionData?.sessionNumber ?? 1

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
    { label: `Buổi ${sessionNum}` },
  ]

  const createdIso = sessionData?.createdAt || sessionData?.created_at
  const updatedIso = sessionData?.updatedAt || sessionData?.updated_at
  const dateDisplay = formatDate(createdIso)
  const startTime = formatTime(createdIso)
  const endTime = formatTime(updatedIso)
  const timeRange = [startTime, endTime].filter(Boolean).join(" – ")
  const subtitleParts = [
    dateDisplay,
    timeRange,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-3">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1 mt-1">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
          Buổi {sessionNum}
        </h1>
        {subtitleParts.length > 0 && (
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {subtitleParts.join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
}

export default SessionDetailHeader
