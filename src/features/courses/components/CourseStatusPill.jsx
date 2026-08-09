import React from "react"
import { CLASS_STATUS_CONFIG } from "../utils/courseUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

const getCourseStatusLabel = (status, labels = {}) => {
  if (!status) return labels.default || ""
  return labels[status] || labels.default || ""
}

const CourseStatusPill = ({ status, label, labels, className = "" }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const localizedLabels = {
    LIVE: c.liveStatus,
    TEACHING: c.teachingStatus,
    OPEN: c.openEnrollmentStatus,
    OPEN_ENROLLMENT: c.openEnrollmentStatus,
    OPEN_FOR_ENROLLMENT: c.openEnrollmentStatus,
    UPCOMING: c.upcomingStatus,
    NOT_STARTED: c.notStartedStatus,
    ARCHIVED: c.archivedStatus || c.archive,
    COMPLETED: c.completedStatus || c.student?.completed,
    default: c.statusUnknown,
    ...labels,
  }
  const config = CLASS_STATUS_CONFIG[status] || {
    bgClass: "bg-[#F3F4F6]",
    textClass: "text-[#6B7280]",
  }

  return (
    <span className={`inline-flex items-center text-[10px] font-black px-3 py-1 rounded-full ${config.bgClass} ${config.textClass} ${className}`}>
      {label || getCourseStatusLabel(status, localizedLabels)}
    </span>
  )
}

export default CourseStatusPill
