/**
 * Bộ đệm offline cho kết quả ôn flashcard (E-FC-002, E-FC-006).
 *
 * Mỗi lượt chấm ghi vào localStorage TRƯỚC, rồi mới gửi lên server. Mất mạng giữa
 * phiên thì học viên vẫn ôn tiếp các thẻ đã tải; có mạng lại thì gửi bù theo đúng
 * thứ tự đã chấm. Tải lại trang hay đóng tab cũng không mất kết quả.
 *
 * Server idempotent theo (session_id, card_id) và "server thắng": gửi lại một kết
 * quả đã có trên server không đổi gì. Vì vậy:
 *
 *   lỗi mạng, 5xx, 408, 429   giữ lại, thử lại sau (backoff tới 30 giây)
 *   4xx khác (phiên đã đóng,   bỏ khỏi hàng đợi: gửi lại bao nhiêu lần cũng vậy,
 *   thẻ không thuộc phiên...)  và giữ lại thì hàng đợi kẹt mãi
 *
 * Hai lượt cho cùng một thẻ trong hàng đợi (lượt sai rồi bấm "Tôi đúng rồi" khi
 * đang offline) gộp làm một: lượt sau thay lượt trước, server nhận thẳng bản cuối.
 */

export const STORAGE_KEY = "catspeak.flashcard.pendingReviews.v1"
export const MAX_BACKOFF_MS = 30_000
export const BASE_BACKOFF_MS = 2_000

const keyOf = (item) => `${item.sessionId}:${item.cardId}`

const safeStorage = (storage) => {
  try {
    const s = storage ?? (typeof window !== "undefined" ? window.localStorage : null)
    if (!s) return null
    const probe = "__fc_probe__"
    s.setItem(probe, "1")
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

/**
 * Hàng đợi lưu trong localStorage. Không có localStorage (chế độ ẩn danh chặn,
 * test) thì chạy trong bộ nhớ: vẫn đúng trong phiên, chỉ không sống qua tải lại.
 */
export const createReviewQueue = ({ storage, key = STORAGE_KEY } = {}) => {
  const store = safeStorage(storage)
  let memory = []

  const read = () => {
    if (!store) return memory
    try {
      const parsed = JSON.parse(store.getItem(key) || "[]")
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const write = (items) => {
    memory = items
    if (!store) return
    try {
      if (items.length) store.setItem(key, JSON.stringify(items))
      else store.removeItem(key)
    } catch {
      // đầy bộ nhớ: vẫn giữ bản trong bộ nhớ cho phiên hiện tại
    }
  }

  return {
    list: () => read(),
    forSession: (sessionId) => read().filter((i) => i.sessionId === sessionId),
    size: () => read().length,
    enqueue(item) {
      const entry = {
        sessionId: item.sessionId,
        cardId: Number(item.cardId),
        exerciseType: item.exerciseType,
        isCorrect: Boolean(item.isCorrect),
        isOverride: Boolean(item.isOverride),
        queuedAt: item.queuedAt || new Date().toISOString(),
      }
      const items = read().filter((i) => keyOf(i) !== keyOf(entry))
      items.push(entry)
      write(items)
      return entry
    },
    remove(item) {
      write(read().filter((i) => keyOf(i) !== keyOf(item)))
    },
    clearSession(sessionId) {
      write(read().filter((i) => i.sessionId !== sessionId))
    },
  }
}

/** Lỗi tạm thời (thử lại) hay lỗi vĩnh viễn (bỏ)? */
export const isRetryableError = (error) => {
  if (!error) return true
  const status = error.status ?? error.originalStatus
  if (typeof status !== "number") return true // FETCH_ERROR, TIMEOUT_ERROR, PARSING_ERROR, mất mạng
  if (status === 408 || status === 429) return true
  return status >= 500
}

export const nextBackoff = (attempt) =>
  Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempt))

/**
 * Gửi lần lượt từng mục. Dừng ở lỗi tạm thời đầu tiên để giữ thứ tự.
 * `send(item)` trả Promise; reject với lỗi kiểu RTK Query ({ status, data }).
 * `onSent(item, response)` cho tầng gọi cập nhật giao diện.
 */
export const flushQueue = async (queue, send, { onSent, onDropped } = {}) => {
  let sent = 0
  let dropped = 0
  for (const item of queue.list()) {
    try {
      const response = await send(item)
      queue.remove(item)
      sent += 1
      onSent?.(item, response)
    } catch (error) {
      if (isRetryableError(error)) {
        return { sent, dropped, remaining: queue.size(), error }
      }
      queue.remove(item)
      dropped += 1
      onDropped?.(item, error)
    }
  }
  return { sent, dropped, remaining: queue.size(), error: null }
}
