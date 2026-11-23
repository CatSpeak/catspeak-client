import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, BellOff, BellRing, X } from "lucide-react"
import { useGetFlashcardHomeQuery } from "@/features/ai-tutor/api/flashcardApi"
import { fmt } from "../i18n"
import usePracticeText from "../hooks/usePracticeText"
import { PRACTICE_MODES } from "../utils/practiceModes"
import { practicePath } from "../utils/practicePaths"

const DISMISS_KEY = "catspeak.practice.reminderDismissed"
// Ngày theo giờ máy (YYYY-MM-DD), không theo UTC: ẩn "hôm nay" phải hết vào nửa đêm giờ địa phương.
const today = () => new Date().toLocaleDateString("sv-SE")

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === today()
  } catch {
    return false
  }
}

const readPermission = () =>
  typeof window !== "undefined" && "Notification" in window ? window.Notification.permission : "unsupported"

/**
 * Nhắc ôn trong app (FE-03): số thẻ đến hạn, nút "Ôn ngay", trạng thái quyền thông báo.
 * Chỉ in-app: chưa gửi Web Push khi trình duyệt đóng (ngoài scope BE-04).
 * Số thẻ lấy từ /v1/flashcards/home (due_today_count, overdue_count).
 */
const DueReminderBanner = ({ className = "" }) => {
  const { p } = usePracticeText()
  const r = p.reminder
  const { data } = useGetFlashcardHomeQuery()
  const [dismissed, setDismissed] = useState(readDismissed)
  const [permission, setPermission] = useState(readPermission)

  const due = data?.due_today_count || 0
  const overdue = data?.overdue_count || 0
  if (!data || dismissed || due <= 0) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, today())
    } catch {
      // không lưu được thì chỉ ẩn trong lần mở trang này
    }
  }

  const askPermission = async () => {
    try {
      setPermission(await window.Notification.requestPermission())
    } catch {
      setPermission(readPermission())
    }
  }

  const PermIcon = permission === "granted" ? BellRing : permission === "denied" ? BellOff : Bell

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 ${className}`}
    >
      <div className="min-w-0 basis-full sm:basis-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {fmt(r.due, { n: due })}
          {overdue > 0 && (
            <span className="ml-2 font-normal text-rose-700 dark:text-rose-400">· {fmt(r.overdue, { n: overdue })}</span>
          )}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400">
          <PermIcon className="w-3.5 h-3.5" />
          {r.notif[permission] || r.notif.unsupported}
          {permission === "default" && (
            <button
              type="button"
              onClick={askPermission}
              className="ml-1 font-semibold text-[#990011] dark:text-red-400 underline underline-offset-2 cursor-pointer"
            >
              {r.notif.enable}
            </button>
          )}
        </p>
      </div>
      <Link
        to={practicePath({ mode: PRACTICE_MODES.FLASHCARD, source: "due", autostart: true })}
        className="inline-flex h-10 items-center rounded-full bg-[#990011] px-5 text-sm font-semibold text-white hover:brightness-95"
      >
        {r.reviewNow}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label={r.dismiss}
        title={r.dismiss}
        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:bg-rose-100 dark:hover:bg-rose-950/60"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default DueReminderBanner
