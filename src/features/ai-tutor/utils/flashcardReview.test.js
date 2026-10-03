import { describe, expect, it } from "vitest"
import {
  flashcardResultPath,
  flashcardReviewPath,
  isExactMatch,
  localSummary,
  multipleChoiceOptions,
  parseReviewParams,
  remainingCards,
  resultLines,
} from "./flashcardReview"
import { createReviewQueue, flushQueue, isRetryableError, nextBackoff } from "./flashcardOfflineSync"

describe("fc02 điền từ", () => {
  it("so khớp chính xác, bỏ khoảng trắng, dấu câu và ký tự toàn khổ", () => {
    expect(isExactMatch(" 苹果 ", "苹果")).toBe(true)
    expect(isExactMatch("苹果。", "苹果")).toBe(true)
    expect(isExactMatch("苹菓", "苹果")).toBe(false)
    expect(isExactMatch("", "苹果")).toBe(false)
  })
})

describe("fc02 trắc nghiệm", () => {
  it("4 đáp án ổn định theo thẻ, có đáp án đúng", () => {
    const card = { card_id: 7, word: "苹果", distractors: ["香蕉", "西瓜", "葡萄"] }
    const a = multipleChoiceOptions(card)
    expect(a).toHaveLength(4)
    expect(a).toContain("苹果")
    expect(multipleChoiceOptions(card)).toEqual(a)
  })
})

describe("hàng đợi phiên", () => {
  it("bỏ thẻ đã chấm trên server và thẻ đang chờ đồng bộ", () => {
    const cards = [1, 2, 3, 4].map((id) => ({ card_id: id }))
    expect(remainingCards(cards, [1], [3]).map((c) => c.card_id)).toEqual([2, 4])
  })

  it("đường dẫn fc02/fc03 và đọc lại tham số", () => {
    const path = flashcardReviewPath("vi", { mode: "free", deckId: "hsk-2" })
    expect(path).toBe("/vi/ai-tutor/vocabulary-notebook/review?mode=free&deck=hsk-2")
    expect(parseReviewParams(path.split("?")[1])).toMatchObject({ mode: "free", deckId: "hsk-2" })
    expect(parseReviewParams("mode=hack").mode).toBe("due")
    expect(flashcardResultPath("en", "rev_1")).toBe("/en/ai-tutor/vocabulary-notebook/review/rev_1/result")
  })
})

describe("fc03 ngôn ngữ người học", () => {
  it("không nhắc khái niệm hộp, chúc mừng thẻ vào bộ nhớ dài hạn", () => {
    const lines = resultLines({ answered: 10, remembered: 8, improved: 6, need_review_soon: 2, entered_long_term: 1 })
    const text = lines.map((l) => l.text).join(" | ")
    expect(text).toContain("8/10 thẻ nhớ được")
    expect(text).toContain("2 thẻ cần ôn lại sớm")
    expect(text).toContain("1 thẻ đã vào bộ nhớ dài hạn")
    expect(text.toLowerCase()).not.toContain("hộp")
  })

  it("tổng kết tạm khi offline tính cả lượt override", () => {
    const s = localSummary([
      { cardId: 1, word: "a", isCorrect: true },
      { cardId: 2, word: "b", isCorrect: false, isOverride: true },
      { cardId: 3, word: "c", isCorrect: false },
    ], 5)
    expect([s.answered, s.remembered, s.forgot]).toEqual([3, 2, 1])
    expect(s.forgot_words).toEqual([{ card_id: 3, word: "c" }])
  })
})

const memoryStorage = () => {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

describe("bộ đệm offline (E-FC-002, E-FC-006)", () => {
  it("lượt sau của cùng thẻ thay lượt trước (sai rồi bấm Tôi đúng rồi)", () => {
    const q = createReviewQueue({ storage: memoryStorage() })
    q.enqueue({ sessionId: "s", cardId: 1, exerciseType: "fill_blank", isCorrect: false })
    q.enqueue({ sessionId: "s", cardId: 2, exerciseType: "flip", isCorrect: true })
    q.enqueue({ sessionId: "s", cardId: 1, exerciseType: "fill_blank", isCorrect: false, isOverride: true })
    expect(q.list().map((i) => [i.cardId, i.isOverride])).toEqual([[2, false], [1, true]])
  })

  it("sống qua tải lại trang (cùng storage)", () => {
    const storage = memoryStorage()
    createReviewQueue({ storage }).enqueue({ sessionId: "s", cardId: 9, exerciseType: "flip", isCorrect: true })
    expect(createReviewQueue({ storage }).forSession("s")).toHaveLength(1)
  })

  it("mất mạng thì giữ và dừng đúng thứ tự, 4xx thì bỏ (server thắng)", async () => {
    const q = createReviewQueue({ storage: memoryStorage() })
    ;[1, 2, 3].forEach((cardId) => q.enqueue({ sessionId: "s", cardId, exerciseType: "flip", isCorrect: true }))
    const calls = []
    const send = async (item) => {
      calls.push(item.cardId)
      if (item.cardId === 1) throw { status: 409, data: { detail: { errorCode: "FLASHCARD_SESSION_CLOSED" } } }
      if (item.cardId === 2) throw { status: "FETCH_ERROR" }
      return { ok: true }
    }
    const r1 = await flushQueue(q, send)
    expect(calls).toEqual([1, 2])
    expect([r1.sent, r1.dropped, r1.remaining]).toEqual([0, 1, 2])

    const r2 = await flushQueue(q, async () => ({ ok: true }))
    expect([r2.sent, r2.remaining]).toEqual([2, 0])
  })

  it("phân loại lỗi và backoff tối đa 30 giây", () => {
    expect(isRetryableError({ status: "FETCH_ERROR" })).toBe(true)
    expect(isRetryableError({ status: 503 })).toBe(true)
    expect(isRetryableError({ status: 429 })).toBe(true)
    expect(isRetryableError({ status: 404 })).toBe(false)
    expect(nextBackoff(0)).toBe(2000)
    expect(nextBackoff(10)).toBe(30000)
  })
})
