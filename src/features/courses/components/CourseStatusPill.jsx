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
    TEACHING: { bgClass: "bg-[#DCFCE7] dark:bg-emerald-950/40", textClass: "text-[#16A34A] dark:text-emerald-400" },
    OPEN: { bgClass: "bg-[#DBEAFE] dark:bg-blue-950/40", textClass: "text-[#2563EB] dark:text-blue-400" },
    OPEN_ENROLLMENT: { bgClass: "bg-[#DBEAFE] dark:bg-blue-950/40", textClass: "text-[#2563EB] dark:text-blue-400" },
    OPEN_FOR_ENROLLMENT: { bgClass: "bg-[#DBEAFE] dark:bg-blue-950/40", textClass: "text-[#2563EB] dark:text-blue-400" },
    LIVE: { bgClass: "bg-[#FEE2E2] dark:bg-red-950/40", textClass: "text-[#EF4444] dark:text-red-400" },
    ARCHIVED: { bgClass: "bg-[#F3F4F6] dark:bg-[#2A2A2A]", textClass: "text-[#6B7280] dark:text-gray-400" },
    FINISHED: { bgClass: "bg-[#F3F4F6] dark:bg-[#2A2A2A]", textClass: "text-[#6B7280] dark:text-gray-400" },
    NOT_STARTED: { bgClass: "bg-[#FEF3C7] dark:bg-amber-950/40", textClass: "text-[#D97706] dark:text-amber-400" },
    UPCOMING: { bgClass: "bg-[#EEF2FF] dark:bg-indigo-950/40", textClass: "text-[#4F46E5] dark:text-indigo-400" },
  }

  const config = statusConfigMap[upperStatus] || CLASS_STATUS_CONFIG[upperStatus] || {
    bgClass: "bg-[#F3F4F6] dark:bg-[#2A2A2A]",
    textClass: "text-[#6B7280] dark:text-gray-400",
  }

  return (
    <span className={`h-6 inline-flex items-center justify-center whitespace-nowrap shrink-0 w-fit text-xs font-semibold px-2.5 rounded-full leading-none ${config.bgClass} ${config.textClass} ${className}`}>
      {label || getCourseStatusLabel(upperStatus, localizedLabels)}
    </span>
  )
}

export default CourseStatusPill
