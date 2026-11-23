import React from "react"
import { CalendarClock, CloudOff } from "lucide-react"
import { fmt } from "../i18n"
import usePracticeText from "../hooks/usePracticeText"
import { formatInterval, nextDueMs } from "../utils/practiceModes"

/**
 * Lịch ôn của thẻ vừa chấm (FE-05 S2).
 *   schedule có    -> "Ôn lại sau 3 ngày"
 *   đang chờ gửi   -> "Đã lưu, sẽ đồng bộ khi có mạng"
 */
const ScheduleNote = ({ schedule, queued, word, className = "" }) => {
  const { p, language } = usePracticeText()
  const ms = nextDueMs(schedule)

  if (ms !== null) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-neutral-300 ${className}`}>
        <CalendarClock className="w-3.5 h-3.5" />
        {word && (
          <span lang="zh" className="font-semibold">
            {word} ·
          </span>
        )}
        {fmt(p.nextReview, { t: formatInterval(ms, language) })}
      </span>
    )
  }
  if (queued) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 ${className}`}>
        <CloudOff className="w-3.5 h-3.5" />
        {p.queued}
      </span>
    )
  }
  return null
}

export default ScheduleNote
