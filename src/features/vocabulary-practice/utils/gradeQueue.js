/**
 * Hàng đợi offline cho nhãn chấm Practice (FE-05 S2).
 *
 * Ghi localStorage trước rồi mới gửi; mất mạng vẫn ôn tiếp, có mạng lại gửi bù đúng thứ tự.
 * Mỗi mục có client_review_id nên gửi lặp không chấm hai lần ở server.
 * Cách thử lại / bỏ lỗi vĩnh viễn dùng chung flushQueue của sổ từ vựng.
 */
export const GRADE_QUEUE_KEY = "catspeak.practice.pendingGrades.v1"
export const GRADE_QUEUE_EVENT = "catspeak:practice-queue"
const MAX_ITEMS = 500

const openStorage = (storage) => {
  try {
    const s = storage ?? (typeof window !== "undefined" ? window.localStorage : null)
    if (!s) return null
    s.setItem("__pq_probe__", "1")
    s.removeItem("__pq_probe__")
    return s
  } catch {
    return null
  }
}

export const newClientReviewId = () => {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch {
    // http không an toàn: rơi xuống cách dưới
  }
  return `pr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const createGradeQueue = ({ storage, key = GRADE_QUEUE_KEY } = {}) => {
  const store = openStorage(storage)
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
    if (store) {
      try {
        if (items.length) store.setItem(key, JSON.stringify(items))
        else store.removeItem(key)
      } catch {
        // đầy bộ nhớ: giữ bản trong RAM
      }
    }
    try {
      window.dispatchEvent(new Event(GRADE_QUEUE_EVENT))
    } catch {
      // không có window (test node)
    }
  }

  return {
    list: read,
    size: () => read().length,
    enqueue(item) {
      const entry = {
        clientReviewId: item.clientReviewId || newClientReviewId(),
        cardId: item.cardId,
        rating: item.rating,
        mode: item.mode,
        isCorrect: Boolean(item.isCorrect),
        elapsedMs: Math.max(0, Math.round(item.elapsedMs || 0)),
        hintsUsed: item.hintsUsed || 0,
        reviewedAt: item.reviewedAt || new Date().toISOString(),
      }
      const items = read().filter((i) => i.clientReviewId !== entry.clientReviewId)
      items.push(entry)
      write(items.slice(-MAX_ITEMS))
      return entry
    },
    remove(item) {
      write(read().filter((i) => i.clientReviewId !== item.clientReviewId))
    },
  }
}
