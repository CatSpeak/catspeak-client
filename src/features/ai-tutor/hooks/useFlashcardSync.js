import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useReviewFlashcardCardMutation } from "../api/flashcardReviewApi"
import { createReviewQueue, flushQueue, nextBackoff, REVIEW_QUEUE_EVENT } from "../utils/flashcardOfflineSync"
import { isNetworkFailure, reportNetworkError, reportNetworkOk } from "../utils/onlineStatus"
import useOnlineStatus from "./useOnlineStatus"

// Còn kết quả chưa lên server thì cứ chừng này thử gửi lại một lần, kể cả khi trình
// duyệt không bắn sự kiện "online" (CHK-064, CHK-066).
const RETRY_TICK_MS = 5000

/**
 * Gửi kết quả ôn qua bộ đệm offline (E-FC-002, E-FC-006).
 *
 *   submit(item)     ghi vào hàng đợi rồi gửi ngay nếu đang có mạng
 *   isOnline         để hiện banner "Đang offline"
 *   pendingCount     số kết quả CỦA PHIÊN NÀY chưa lên server
 *   isRetrying       đã có mạng nhưng gửi lỗi, đang thử lại ngầm (hiện toast đồng bộ)
 *
 * Gửi lỗi tạm thời thì thử lại với backoff 2s, 4s, 8s... tối đa 30s, cho tới khi xong.
 * Gửi lỗi vì mất mạng thì báo offline cho cả màn (banner), có mạng lại tự gửi bù.
 */
const useFlashcardSync = (sessionId) => {
  const [review] = useReviewFlashcardCardMutation()
  const queue = useMemo(() => createReviewQueue(), [])
  const isOnline = useOnlineStatus()
  // Đổi mỗi khi hàng đợi đổi; pendingCount tính lại từ localStorage theo nó.
  const [version, setVersion] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const busy = useRef(false)
  const attempt = useRef(0)
  const timer = useRef(null)

  const refreshCount = useCallback(() => setVersion((v) => v + 1), [])
  const pendingCount = useMemo(
    () => (sessionId ? queue.forSession(sessionId).length : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version báo hàng đợi trong localStorage đã đổi
    [queue, sessionId, version],
  )

  const flush = useCallback(async () => {
    if (busy.current || queue.size() === 0) return
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      reportNetworkError()
      return
    }
    busy.current = true
    clearTimeout(timer.current)
    try {
      const result = await flushQueue(queue, (item) =>
        review({
          sessionId: item.sessionId,
          cardId: item.cardId,
          exerciseType: item.exerciseType,
          isCorrect: item.isCorrect,
          isOverride: item.isOverride,
        }).unwrap(),
      )
      if (result.sent > 0) reportNetworkOk()
      if (result.error) {
        if (isNetworkFailure(result.error)) reportNetworkError()
        setIsRetrying(true)
        const wait = nextBackoff(attempt.current)
        attempt.current += 1
        timer.current = setTimeout(() => flushRef.current(), wait)
      } else {
        attempt.current = 0
        setIsRetrying(false)
      }
    } finally {
      busy.current = false
      refreshCount()
    }
  }, [queue, review, refreshCount])

  const flushRef = useRef(flush)
  useEffect(() => {
    flushRef.current = flush
  }, [flush])

  // Có mạng lại: gửi bù ngay.
  useEffect(() => {
    if (isOnline) {
      attempt.current = 0
      flushRef.current()
    }
  }, [isOnline])

  useEffect(() => {
    const kick = () => flushRef.current()
    const onVisible = () => {
      if (document.visibilityState === "visible") kick()
    }
    // Hàng đợi đổi ở tab/thành phần khác (màn kết quả đọc lại số chưa đồng bộ).
    const onQueue = () => refreshCount()
    window.addEventListener("focus", kick)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener(REVIEW_QUEUE_EVENT, onQueue)
    window.addEventListener("storage", onQueue)
    const tick = setInterval(() => {
      if (queue.size() > 0) kick()
    }, RETRY_TICK_MS)
    // Kết quả còn sót từ lần trước (tải lại trang, đóng tab khi offline).
    kick()
    return () => {
      window.removeEventListener("focus", kick)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener(REVIEW_QUEUE_EVENT, onQueue)
      window.removeEventListener("storage", onQueue)
      clearInterval(tick)
      clearTimeout(timer.current)
    }
  }, [queue, refreshCount])

  const submit = useCallback(
    (item) => {
      queue.enqueue({ ...item, sessionId: item.sessionId || sessionId })
      refreshCount()
      flushRef.current()
    },
    [queue, sessionId, refreshCount],
  )

  return { submit, flush, isOnline, pendingCount, isRetrying }
}

export default useFlashcardSync
