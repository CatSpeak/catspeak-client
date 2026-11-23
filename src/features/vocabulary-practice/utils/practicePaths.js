import { isPracticeMode, PRACTICE_MODES } from "./practiceModes"

export const PRACTICE_SOURCES = ["due", "recent-wrong", "all"]

/**
 * Nguồn thẻ -> tham số GET /v1/flashcards/decks/{id}/cards.
 * "due" là deck tổng lọc status=due (cùng bộ lọc "Cần ôn" ở màn duyệt deck).
 */
export const sourceQuery = (source) => {
  if (source === "due") return { deckId: "all", status: "due" }
  if (source === "recent-wrong") return { deckId: "recent-wrong" }
  return { deckId: "all" }
}

/** Đường dẫn trang Practice; dùng ở banner nhắc ôn và lối vào từ Galaxy. */
export const PRACTICE_ROUTE = "/workspace/vocabulary-practice"

export const practicePath = ({ mode, source, autostart } = {}) => {
  const q = new URLSearchParams()
  if (mode) q.set("mode", mode)
  if (source) q.set("source", source)
  if (autostart) q.set("autostart", "1")
  const qs = q.toString()
  return `${PRACTICE_ROUTE}${qs ? `?${qs}` : ""}`
}

export const parsePracticeParams = (searchParams) => {
  const mode = searchParams.get("mode")
  const source = searchParams.get("source")
  return {
    mode: isPracticeMode(mode) ? mode : PRACTICE_MODES.WORD,
    source: PRACTICE_SOURCES.includes(source) ? source : null,
    autostart: searchParams.get("autostart") === "1",
  }
}
