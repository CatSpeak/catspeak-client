import { afterEach, describe, expect, it, vi } from "vitest"
import { flashcardReviewPath, notebookPaths, parseReviewParams, resultLines } from "./flashcardReview"
import { createReviewQueue, isRetryableError } from "./flashcardOfflineSync"
import {
  __resetOnlineStatus,
  isNetworkFailure,
  isOnlineNow,
  reportNetworkError,
  reportNetworkOk,
  subscribeOnline,
} from "./onlineStatus"

describe("đường dẫn phiên ôn (BUG-003, BUG-028)", () => {
  it("tiếp tục phiên đang dở và ôn các thẻ đã chọn", () => {
    expect(flashcardReviewPath("vi", { sessionId: "rev_1" })).toBe(
      "/vi/ai-tutor/vocabulary-notebook/review?mode=due&session=rev_1",
    )
    const path = flashcardReviewPath("zh", { mode: "free", cardIds: [3, 8] })
    expect(path).toBe("/zh/ai-tutor/vocabulary-notebook/review?mode=free&cards=3%2C8")
    const p = parseReviewParams(path.split("?")[1])
    expect(p).toMatchObject({ mode: "free", cardIds: [3, 8], sessionId: null })
  })

  it("card_ids lạ bị bỏ, tối đa 20 thẻ", () => {
    const many = Array.from({ length: 30 }, (_, i) => i + 1).join(",")
    expect(parseReviewParams(`mode=free&cards=a,-1,0,${many}`).cardIds).toHaveLength(20)
    expect(parseReviewParams("mode=free&cards=x").cardIds).toBeNull()
  })

  it("đường dẫn các màn sổ từ vựng", () => {
    const p = notebookPaths("vi")
    expect(p.deck("topic-hsk1_daily_02")).toBe("/vi/ai-tutor/vocabulary-notebook/decks/topic-hsk1_daily_02")
    expect(p.practice()).toBe("/vi/ai-tutor/vocabulary-notebook/practice?deck=recent-wrong")
    expect(p.search("学习")).toBe("/vi/ai-tutor/vocabulary-notebook/decks?search=%E5%AD%A6%E4%B9%A0")
  })
})

describe("fc03 dòng bộ nhớ dài hạn (BUG-011)", () => {
  it("đúng câu chữ của spec: N thẻ vào bộ nhớ dài hạn", () => {
    const lines = resultLines({ answered: 5, remembered: 4, improved: 3, need_review_soon: 1, entered_long_term: 2 })
    expect(lines.map((l) => l.text)).toContain("2 thẻ vào bộ nhớ dài hạn")
  })
})

describe("bộ đệm offline (BUG-007, BUG-008)", () => {
  it("hết phiên đăng nhập (401) thì giữ kết quả để gửi lại sau khi đăng nhập", () => {
    expect(isRetryableError({ status: 401 })).toBe(true)
    expect(isRetryableError({ status: 404 })).toBe(false)
    expect(isRetryableError({ status: "FETCH_ERROR" })).toBe(true)
  })

  it("hàng đợi trong bộ nhớ vẫn chạy khi không có localStorage", () => {
    const q = createReviewQueue({ storage: null })
    q.enqueue({ sessionId: "s", cardId: 1, exerciseType: "flip", isCorrect: true })
    expect(q.forSession("s")).toHaveLength(1)
  })
})

describe("trạng thái mạng dùng chung (BUG-006, BUG-009, BUG-018)", () => {
  afterEach(() => __resetOnlineStatus(true))

  it("request thất bại vì mất mạng thì chuyển offline, request thành công thì online lại", () => {
    __resetOnlineStatus(true)
    const seen = []
    const off = subscribeOnline((v) => seen.push(v))
    reportNetworkError()
    expect(isOnlineNow()).toBe(false)
    reportNetworkOk()
    expect(isOnlineNow()).toBe(true)
    expect(seen).toEqual([false, true])
    off()
  })

  it("nhận diện lỗi mạng của RTK Query", () => {
    expect(isNetworkFailure({ status: "FETCH_ERROR" })).toBe(true)
    expect(isNetworkFailure({ status: "TIMEOUT_ERROR" })).toBe(true)
    expect(isNetworkFailure({ status: 500 })).toBe(false)
  })

  it("đang offline thì thử kết nối định kỳ để phát hiện có mạng lại", async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("window", { location: { origin: "http://localhost:5175" }, addEventListener: () => {} })
    __resetOnlineStatus(true)
    reportNetworkError()
    await vi.advanceTimersByTimeAsync(4100)
    expect(fetchMock).toHaveBeenCalled()
    expect(isOnlineNow()).toBe(true)
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
})
