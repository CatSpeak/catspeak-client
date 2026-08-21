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
  const upperStatus = String(status || "").toUpperCase()
  const localizedLabels = {
    LIVE: c.liveStatus || "Live",
    TEACHING: c.teachingStatus || "Teaching",
    OPEN: c.openEnrollmentStatus || "Open Enrollment",
    OPEN_ENROLLMENT: c.openEnrollmentStatus || "Open Enrollment",
    OPEN_FOR_ENROLLMENT: c.openEnrollmentStatus || "Open Enrollment",
    UPCOMING: c.upcomingStatus || "Upcoming",
    NOT_STARTED: c.notStartedStatus || "Not Started",
    ARCHIVED: c.archivedStatus || c.archive || "Archived",
    COMPLETED: c.completedStatus || c.student?.completed || "Completed",
    default: c.statusUnknown || "Status",
    ...labels,
  }

  const statusConfigMap = {
    TEACHING: { bgClass: "bg-[#DCFCE7]", textClass: "text-[#16A34A]" },
    OPEN: { bgClass: "bg-[#DBEAFE]", textClass: "text-[#2563EB]" },
    OPEN_ENROLLMENT: { bgClass: "bg-[#DBEAFE]", textClass: "text-[#2563EB]" },
    OPEN_FOR_ENROLLMENT: { bgClass: "bg-[#DBEAFE]", textClass: "text-[#2563EB]" },
    LIVE: { bgClass: "bg-[#FEE2E2]", textClass: "text-[#EF4444]" },
    ARCHIVED: { bgClass: "bg-[#F3F4F6]", textClass: "text-[#6B7280]" },
    FINISHED: { bgClass: "bg-[#F3F4F6]", textClass: "text-[#6B7280]" },
    NOT_STARTED: { bgClass: "bg-[#FEF3C7]", textClass: "text-[#D97706]" },
    UPCOMING: { bgClass: "bg-[#EEF2FF]", textClass: "text-[#4F46E5]" },
  }

  const config = statusConfigMap[upperStatus] || CLASS_STATUS_CONFIG[upperStatus] || {
    bgClass: "bg-[#F3F4F6]",
    textClass: "text-[#6B7280]",
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-3 py-0.5 rounded-full ${config.bgClass} ${config.textClass} ${className}`}>
      {label || getCourseStatusLabel(upperStatus, localizedLabels)}
    </span>
  )
}

export default CourseStatusPill
