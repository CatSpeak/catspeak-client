import { useCallback, useEffect, useRef, useState } from "react"

// Một câu treo lâu (bỏ đi pha trà) không được kéo lệch FSRS.
export const MAX_ELAPSED_MS = 120_000

/**
 * Tín hiệu trả lời của một thẻ (FE-05): thời gian trả lời và số lần dùng gợi ý.
 *
 *   elapsed()   ms từ lúc hiện thẻ tới giờ, KHÔNG tính lúc tab bị ẩn, chặn trần 2 phút
 *   stop()      chốt thời gian (gọi khi học viên nộp/lật thẻ); elapsed() giữ nguyên sau đó
 *   hints, addHint()
 *
 * Đổi `key` (id thẻ) là đếm lại từ đầu.
 */
const usePracticeSignals = (key) => {
  const startedAt = useRef(0)
  const hiddenAt = useRef(null)
  const hiddenTotal = useRef(0)
  const frozen = useRef(null)
  const [hints, setHints] = useState(0)

  useEffect(() => {
    startedAt.current = performance.now()
    hiddenAt.current = typeof document !== "undefined" && document.hidden ? performance.now() : null
    hiddenTotal.current = 0
    frozen.current = null
    // `hints` không cần reset: mỗi thẻ là một component mới (key = card_id).
  }, [key])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) hiddenAt.current = performance.now()
      else if (hiddenAt.current !== null) {
        hiddenTotal.current += performance.now() - hiddenAt.current
        hiddenAt.current = null
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const elapsed = useCallback(() => {
    if (frozen.current !== null) return frozen.current
    const now = performance.now()
    const hiddenNow = hiddenAt.current !== null ? now - hiddenAt.current : 0
    return Math.min(MAX_ELAPSED_MS, Math.max(0, now - startedAt.current - hiddenTotal.current - hiddenNow))
  }, [])

  const stop = useCallback(() => {
    if (frozen.current === null) frozen.current = elapsed()
    return frozen.current
  }, [elapsed])

  const addHint = useCallback(() => setHints((h) => h + 1), [])

  return { elapsed, stop, hints, addHint }
}

export default usePracticeSignals
