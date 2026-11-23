import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useOnlineStatus from "@/features/ai-tutor/hooks/useOnlineStatus"
import { flushQueue, nextBackoff } from "@/features/ai-tutor/utils/flashcardOfflineSync"
import { isNetworkFailure, reportNetworkError, reportNetworkOk } from "@/features/ai-tutor/utils/onlineStatus"
import { useGradePracticeCardMutation } from "../api/practiceApi"
import { createGradeQueue, GRADE_QUEUE_EVENT } from "../utils/gradeQueue"

const RETRY_TICK_MS = 5000

/**
 * Gửi nhãn FSRS qua hàng đợi offline (FE-05 S2).
 *
 *   submit(item)   ghi hàng đợi rồi gửi ngay nếu có mạng; trả clientReviewId
 *   schedules      { [clientReviewId]: phản hồi server (due_at, scheduled_days...) } để hiện lịch ôn
 *   pendingCount   số nhãn chưa lên server
 *   isOnline
 *
 * `enabled=false` (flag VITE_FF_PRACTICE_FSRS tắt): không gửi gì, Practice vẫn chạy như luyện tay.
 */
const usePracticeSync = ({ enabled = true } = {}) => {
  const [grade] = useGradePracticeCardMutation()
  const queue = useMemo(() => createGradeQueue(), [])
  const isOnline = useOnlineStatus()
  const [version, setVersion] = useState(0)
  const [schedules, setSchedules] = useState({})
  const busy = useRef(false)
  const attempt = useRef(0)
  const timer = useRef(null)

  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version báo localStorage đã đổi
  const pendingCount = useMemo(() => (enabled ? queue.size() : 0), [enabled, queue, version])

  const flush = useCallback(async () => {
    if (!enabled || busy.current || queue.size() === 0) return
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      reportNetworkError()
      return
    }
    busy.current = true
    clearTimeout(timer.current)
    try {
      const result = await flushQueue(queue, (item) => grade(item).unwrap(), {
        onSent: (item, response) =>
          setSchedules((s) => ({ ...s, [item.clientReviewId]: response || {} })),
      })
      if (result.sent > 0) reportNetworkOk()
      if (result.error) {
        if (isNetworkFailure(result.error)) reportNetworkError()
        const wait = nextBackoff(attempt.current)
        attempt.current += 1
        timer.current = setTimeout(() => flushRef.current(), wait)
      } else {
        attempt.current = 0
      }
    } finally {
      busy.current = false
      refresh()
    }
  }, [enabled, queue, grade, refresh])

  const flushRef = useRef(flush)
  useEffect(() => {
    flushRef.current = flush
  }, [flush])

  useEffect(() => {
    if (isOnline) {
      attempt.current = 0
      flushRef.current()
    }
  }, [isOnline])

  useEffect(() => {
    if (!enabled) return undefined
    const kick = () => flushRef.current()
    window.addEventListener("focus", kick)
    window.addEventListener(GRADE_QUEUE_EVENT, refresh)
    const tick = setInterval(() => queue.size() > 0 && kick(), RETRY_TICK_MS)
    kick() // nhãn còn sót từ lần trước
    return () => {
      window.removeEventListener("focus", kick)
      window.removeEventListener(GRADE_QUEUE_EVENT, refresh)
      clearInterval(tick)
      clearTimeout(timer.current)
    }
  }, [enabled, queue, refresh])

  const submit = useCallback(
    (item) => {
      if (!enabled) return null
      const entry = queue.enqueue(item)
      refresh()
      flushRef.current()
      return entry.clientReviewId
    },
    [enabled, queue, refresh],
  )

  return { submit, schedules, pendingCount, isOnline }
}

export default usePracticeSync
