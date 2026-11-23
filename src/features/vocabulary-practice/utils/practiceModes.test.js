import { describe, expect, it } from "vitest"
import { formatInterval, gradeFor, PRACTICE_MODES, RATING, supportsMode } from "./practiceModes"
import { parsePracticeParams, practicePath, sourceQuery } from "./practicePaths"

const { WORD, LISTEN, SENTENCE, FLASHCARD } = PRACTICE_MODES

describe("gradeFor: tín hiệu -> nhãn FSRS", () => {
  it("sai, để trống -> Again", () => {
    expect(gradeFor({ mode: WORD, result: "wrong", elapsedMs: 3000 })).toBe(RATING.AGAIN)
    expect(gradeFor({ mode: WORD, result: "blank" })).toBe(RATING.AGAIN)
  })
  it("dùng gợi ý hoặc sai thanh -> Hard dù trả lời nhanh", () => {
    expect(gradeFor({ mode: WORD, result: "correct", elapsedMs: 1000, hintsUsed: 1 })).toBe(RATING.HARD)
    expect(gradeFor({ mode: WORD, result: "partial", elapsedMs: 1000 })).toBe(RATING.HARD)
  })
  it("nhanh -> Easy, vừa -> Good, chậm -> Hard", () => {
    expect(gradeFor({ mode: WORD, result: "correct", elapsedMs: 3000 })).toBe(RATING.EASY)
    expect(gradeFor({ mode: WORD, result: "correct", elapsedMs: 10000 })).toBe(RATING.GOOD)
    expect(gradeFor({ mode: WORD, result: "correct", elapsedMs: 30000 })).toBe(RATING.HARD)
  })
  it("Nghe và điền được nhiều thời gian hơn", () => {
    expect(gradeFor({ mode: LISTEN, result: "correct", elapsedMs: 22000 })).toBe(RATING.GOOD)
  })
  it("không đo được thời gian -> Good, không phải Easy", () => {
    expect(gradeFor({ mode: WORD, result: "correct", elapsedMs: 0 })).toBe(RATING.GOOD)
  })
})

describe("supportsMode", () => {
  it("Gõ câu cần câu ví dụ, các chế độ khác chỉ cần từ", () => {
    const bare = { word: "你好" }
    expect(supportsMode(bare, SENTENCE)).toBe(false)
    expect(supportsMode({ ...bare, example_sentence: "你好！" }, SENTENCE)).toBe(true)
    expect(supportsMode(bare, LISTEN)).toBe(true)
    expect(supportsMode(bare, FLASHCARD)).toBe(true)
    expect(supportsMode({}, WORD)).toBe(false)
  })
})

describe("formatInterval", () => {
  it("chọn đơn vị phù hợp", () => {
    expect(formatInterval(10 * 60000, "en")).toMatch(/10 minutes/)
    expect(formatInterval(3 * 86400000, "en")).toMatch(/3 days/)
    expect(formatInterval(90 * 86400000, "en")).toMatch(/3 months/)
    expect(formatInterval(NaN, "en")).toBe("")
  })
})

describe("practicePaths", () => {
  it("nguồn due lọc status=due trên deck tổng", () => {
    expect(sourceQuery("due")).toEqual({ deckId: "all", status: "due" })
    expect(sourceQuery("recent-wrong")).toEqual({ deckId: "recent-wrong" })
  })
  it("dựng và đọc lại tham số Ôn ngay", () => {
    const url = practicePath({ mode: FLASHCARD, source: "due", autostart: true })
    expect(url).toBe("/workspace/vocabulary-practice?mode=flashcard&source=due&autostart=1")
    const parsed = parsePracticeParams(new URL(url, "http://x").searchParams)
    expect(parsed).toEqual({ mode: FLASHCARD, source: "due", autostart: true })
  })
  it("tham số lạ thì về mặc định", () => {
    expect(parsePracticeParams(new URLSearchParams("mode=hack&source=evil"))).toEqual({
      mode: WORD,
      source: null,
      autostart: false,
    })
  })
})
