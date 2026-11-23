/**
 * Bốn chế độ ôn (FE-02) và quy tắc đổi tín hiệu trả lời -> nhãn FSRS (FE-05).
 * Bám theo word-atlas (store/session.ts gradeFor), chỉnh ngưỡng cho chữ Hán.
 */

export const PRACTICE_MODES = {
  WORD: "word", // nhìn nghĩa, gõ từ (chữ Hán hoặc pinyin)
  SENTENCE: "sentence", // chép câu ví dụ, luyện tay
  LISTEN: "listen", // nghe câu, điền từ còn thiếu
  FLASHCARD: "flashcard", // lật thẻ, tự chấm 1-4
}

export const MODE_LIST = [
  PRACTICE_MODES.WORD,
  PRACTICE_MODES.SENTENCE,
  PRACTICE_MODES.LISTEN,
  PRACTICE_MODES.FLASHCARD,
]

/**
 * Chép câu chỉ luyện tay, không phải nhớ lại -> không gửi nhãn FSRS (giống word-atlas:
 * "打字只练拼写和手感，不会改动记忆进度"). Ba chế độ còn lại là gợi nhớ chủ động.
 */
export const GRADED_MODES = new Set([PRACTICE_MODES.WORD, PRACTICE_MODES.LISTEN, PRACTICE_MODES.FLASHCARD])

/** Nhãn FSRS, cùng giá trị với ts-fsrs Rating. */
export const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 }

export const isPracticeMode = (mode) => MODE_LIST.includes(mode)

/** Thẻ có đủ dữ liệu cho chế độ này không. */
export const supportsMode = (item, mode) => {
  if (!item?.word) return false
  if (mode === PRACTICE_MODES.SENTENCE) return Boolean(item.example_sentence)
  return true // LISTEN thiếu câu ví dụ thì nghe từ và gõ lại từ
}

// Nhanh/chậm theo kiểu bài (ms). Gõ chữ Hán qua bộ gõ chậm hơn chọn đáp án.
const THRESHOLDS = {
  [PRACTICE_MODES.WORD]: { fast: 5000, slow: 20000 },
  [PRACTICE_MODES.LISTEN]: { fast: 6000, slow: 25000 },
}

/**
 * Nhãn FSRS cho chế độ gõ (word/listen).
 * @param {{ mode: string, result: "correct"|"partial"|"wrong"|"blank", elapsedMs: number, hintsUsed: number }} s
 */
export const gradeFor = ({ mode, result, elapsedMs = 0, hintsUsed = 0 }) => {
  if (result !== "correct" && result !== "partial") return RATING.AGAIN
  if (result === "partial" || hintsUsed > 0) return RATING.HARD
  const t = THRESHOLDS[mode] || THRESHOLDS[PRACTICE_MODES.WORD]
  if (elapsedMs > t.slow) return RATING.HARD
  if (elapsedMs > 0 && elapsedMs < t.fast) return RATING.EASY
  return RATING.GOOD
}

/** Khoảng thời gian tới lần ôn sau, dạng ngắn theo ngôn ngữ giao diện. */
export const formatInterval = (ms, lang = "vi") => {
  if (!Number.isFinite(ms)) return ""
  const minutes = Math.max(1, Math.round(ms / 60000))
  const unit = (value, u) => {
    try {
      return new Intl.NumberFormat(lang, { style: "unit", unit: u, unitDisplay: "long" }).format(value)
    } catch {
      return `${value} ${u}`
    }
  }
  if (minutes < 60) return unit(minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (hours < 24) return unit(hours, "hour")
  const days = Math.round(hours / 24)
  if (days < 31) return unit(days, "day")
  const months = Math.round(days / 30)
  if (months < 12) return unit(months, "month")
  return unit(Math.round((days / 365) * 10) / 10, "year")
}

/** Thời điểm ôn tiếp theo từ phản hồi BE-02 (due_at ISO, hoặc scheduled_days). */
export const nextDueMs = (schedule, now = Date.now()) => {
  if (!schedule) return null
  const due = schedule.due_at ? Date.parse(schedule.due_at) : NaN
  if (Number.isFinite(due)) return Math.max(0, due - now)
  if (Number.isFinite(schedule.scheduled_days)) return schedule.scheduled_days * 86_400_000
  return null
}
