import React from "react"
import { AlertTriangle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ClassAnalyticsNotice = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}

  const disclaimerText =
    cd.teacherDisclaimer ||
    "Giáo viên không được tính vào STB — chỉ thời gian phát biểu của học viên được thống kê."

  return (
    <div className="bg-[#fff6e9] border border-[#fed7aa]/60 rounded-xl px-4 py-3 flex items-center gap-2.5 text-[#9a5518] text-xs sm:text-sm font-medium shadow-2xs">
      <AlertTriangle size={17} className="text-[#c2410c] shrink-0 fill-[#ffedd5]" />
      <span>{disclaimerText}</span>
    </div>
  )
}

export default ClassAnalyticsNotice
