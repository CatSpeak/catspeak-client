import React from "react"
import { CLASS_STATUS_CONFIG } from "../utils/courseUtils"

const STATUS_LABELS = {
  LIVE: "Live",
  TEACHING: "Teaching",
  OPEN: "Open Enrollment",
  OPEN_ENROLLMENT: "Open Enrollment",
  OPEN_FOR_ENROLLMENT: "Open Enrollment",
  UPCOMING: "Upcoming",
  ARCHIVED: "Archived",
  COMPLETED: "Completed",
}

const getCourseStatusLabel = (status, labels = {}) => {
  if (!status) return labels.default || ""
  return labels[status] || STATUS_LABELS[status] || status
}

const CourseStatusPill = ({ status, label, labels, className = "" }) => {
  const config = CLASS_STATUS_CONFIG[status] || {
    bgClass: "bg-[#F3F4F6]",
    textClass: "text-[#6B7280]",
  }

  return (
    <span className={`inline-flex items-center text-[10px] font-black px-3 py-1 rounded-full ${config.bgClass} ${config.textClass} ${className}`}>
      {label || getCourseStatusLabel(status, labels)}
    </span>
  )
}

export default CourseStatusPill
