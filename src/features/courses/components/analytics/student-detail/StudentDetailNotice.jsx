import React from "react"
import { AlertTriangle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const StudentDetailNotice = ({ message, unmet = 0, total = 0 }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sd = c.analytics?.studentDetail || {}

  // Only display notice if there is an explicit warning message OR multiple recent unmet sessions
  const shouldShow = Boolean(message) || (unmet >= 2 && total >= 2)
  if (!shouldShow) {
    return null
  }

  const bannerText = message || (
    sd.warningBanner
      ? sd.warningBanner
          .replace("{{unmet}}", unmet)
          .replace("{{total}}", total)
      : `Học viên này có ${unmet}/${total} buổi gần đây chưa đạt ngưỡng và đang có xu hướng giảm — cân nhắc hỗ trợ thêm.`
  )

  return (
    <div className="bg-[#ffeceb] dark:bg-rose-950/30 border border-[#fecdd3]/80 dark:border-rose-900/40 rounded-xl px-4 py-3 flex items-center gap-2.5 text-[#9f1239] dark:text-[#FF6B6B] text-xs sm:text-sm font-medium shadow-2xs">
      <AlertTriangle size={17} className="text-[#be123c] dark:text-[#FF6B6B] shrink-0 fill-[#ffe4e6] dark:fill-rose-950/60" />
      <span>{bannerText}</span>
    </div>
  )
}

export default StudentDetailNotice
