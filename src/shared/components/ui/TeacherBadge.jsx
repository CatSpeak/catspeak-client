import React from "react"
import { GraduationCap } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const TeacherBadge = ({ label, className = "" }) => {
  const { t } = useLanguage()
  const displayLabel = label || t.profile?.friends?.teacher || "Giảng viên"

  return (
    <span
      title={displayLabel}
      aria-label={displayLabel}
      className={`inline-flex items-center justify-center shrink-0 w-4 h-4 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 select-none cursor-default transition-transform hover:scale-110 ${className}`}
    >
      <GraduationCap size={11} className="shrink-0 text-amber-600" />
    </span>
  )
}

export default TeacherBadge
