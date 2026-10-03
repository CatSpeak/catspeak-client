import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useReviewFlashcardCardMutation } from "../api/flashcardReviewApi"
import { createReviewQueue, flushQueue, nextBackoff } from "../utils/flashcardOfflineSync"

const onlineNow = () => (typeof navigator === "undefined" ? true : navigator.onLine !== false)

/**
 * Gửi kết quả ôn qua bộ đệm offline (E-FC-002, E-FC-006).
 *
 *   submit(item)     ghi vào hàng đợi rồi gửi ngay nếu đang có mạng
 *   isOnline         để hiện banner "Đang offline"
 *   pendingCount     số kết quả CỦA PHIÊN NÀY chưa lên server
 *   isRetrying       đã có mạng nhưng gửi lỗi, đang thử lại ngầm (hiện toast đồng bộ)
 *
 * Gửi lỗi tạm thời thì thử lại với backoff 2s, 4s, 8s... tối đa 30s, cho tới khi xong.
 */
const useFlashcardSync = (sessionId) => {
  const [review] = useReviewFlashcardCardMutation()
  const queue = useMemo(() => createReviewQueue(), [])
  const [isOnline, setIsOnline] = useState(onlineNow)
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
    if (busy.current || !onlineNow() || queue.size() === 0) return
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
      if (result.error) {
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

  useEffect(() => {
    const up = () => {
      setIsOnline(true)
      attempt.current = 0
      flushRef.current()
    }
    const down = () => setIsOnline(false)
    window.addEventListener("online", up)
    window.addEventListener("offline", down)
    // Kết quả còn sót từ lần trước (tải lại trang, đóng tab khi offline).
    flushRef.current()
    return () => {
      window.removeEventListener("online", up)
      window.removeEventListener("offline", down)
      clearTimeout(timer.current)
    }
  }, [])

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
