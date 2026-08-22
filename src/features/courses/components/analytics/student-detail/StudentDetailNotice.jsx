import React from "react"
import { AlertTriangle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const StudentDetailNotice = ({ message, unmet = 3, total = 6 }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sd = c.analytics?.studentDetail || {}

  const bannerText = message || (
    sd.warningBanner
      ? sd.warningBanner
          .replace("{{unmet}}", unmet)
          .replace("{{total}}", total)
      : `Học viên này có ${unmet}/${total} buổi gần đây chưa đạt ngưỡng và đang có xu hướng giảm — cân nhắc hỗ trợ thêm.`
  )

  return (
    <div className="bg-[#ffeceb] border border-[#fecdd3]/80 rounded-xl px-4 py-3 flex items-center gap-2.5 text-[#9f1239] text-xs sm:text-sm font-medium shadow-2xs">
      <AlertTriangle size={17} className="text-[#be123c] shrink-0 fill-[#ffe4e6]" />
      <span>{bannerText}</span>
    </div>
  )
}

export default StudentDetailNotice
