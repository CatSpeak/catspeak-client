/**
 * Hàm thuần cho fc02 (phiên ôn) và fc03 (kết quả). Không React, test bằng vitest.
 */

const PUNCT = /[\s\u3000，。！？、；：“”‘’（）《》【】…—·,.!?;:'"()[\]{}<>~\-_/\\]/g

/** Chuẩn hoá đáp án điền từ: bỏ khoảng trắng và dấu câu, đổi ký tự toàn khổ về nửa khổ. */
export const normalizeAnswer = (text) => String(text ?? "").normalize("NFKC").replace(PUNCT, "")

/** So khớp chính xác chữ Hán (E-FC-005). Sai thì học viên còn nút "Tôi đúng rồi". */
export const isExactMatch = (input, word) => {
  const a = normalizeAnswer(input)
  return a.length > 0 && a === normalizeAnswer(word)
}

/** Xáo ổn định theo seed: cùng thẻ luôn ra cùng thứ tự đáp án, kể cả khi tải lại trang. */
export const seededShuffle = (items, seed) => {
  let h = 2166136261
  for (const ch of String(seed)) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 16777619)
  }
  const rand = () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 4 đáp án trắc nghiệm: 1 đúng + 3 nhiễu do server chọn (cùng cấp HSK, cùng loại từ). */
export const multipleChoiceOptions = (card) =>
  seededShuffle([card.word, ...(card.distractors || [])], `${card.card_id}:${card.word}`)

/** Mặt trước thẻ Phát âm ẩn chữ Hán; thẻ Nghĩa hiện chữ Hán. */
export const isPronunciationCard = (card) => card?.card_type === "pronunciation"

/** Thẻ còn phải ôn: bỏ thẻ server đã có kết quả và thẻ đang chờ đồng bộ. */
export const remainingCards = (cards, answeredIds = [], pendingIds = []) => {
  const done = new Set([...answeredIds, ...pendingIds].map(Number))
  return (cards || []).filter((c) => !done.has(Number(c.card_id)))
}

/** Tổng kết tạm khi chưa gọi được /finish (đang offline). */
export const localSummary = (results, totalCards) => {
  const answered = results.length
  const remembered = results.filter((r) => r.isCorrect || r.isOverride).length
  return {
    total_cards: totalCards,
    answered,
    remembered,
    forgot: answered - remembered,
    improved: null,
    need_review_soon: answered - remembered,
    entered_long_term: null,
    forgot_words: results.filter((r) => !(r.isCorrect || r.isOverride)).map((r) => ({ card_id: r.cardId, word: r.word })),
    long_term_words: [],
    next_batch_due: null,
  }
}

/**
 * Câu tổng kết fc03 bằng ngôn ngữ người học: không nhắc "hộp", "Leitner".
 * Trả danh sách { key, text, tone } để giao diện chọn màu.
 */
export const resultLines = (m) => {
  if (!m) return []
  const total = m.answered ?? 0
  const lines = [{ key: "remembered", tone: "main", text: `${m.remembered ?? 0}/${total} thẻ nhớ được` }]
  if (m.improved) lines.push({ key: "improved", tone: "good", text: `${m.improved} thẻ nhớ tốt hơn lần trước` })
  if (m.need_review_soon) lines.push({ key: "soon", tone: "warn", text: `${m.need_review_soon} thẻ cần ôn lại sớm` })
  if (m.entered_long_term)
    lines.push({ key: "longterm", tone: "celebrate", text: `${m.entered_long_term} thẻ đã vào bộ nhớ dài hạn` })
  return lines
}

/** Múi giờ gửi kèm khi mở phiên: Profile trước, rồi trình duyệt, cuối cùng giờ Việt Nam. */
export const resolveTimezone = (user) => {
  const fromProfile = user?.timeZone || user?.timezone
  if (fromProfile) return fromProfile
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh"
  } catch {
    return "Asia/Ho_Chi_Minh"
  }
}

/**
 * Đường dẫn vào fc02/fc03. Thái dùng hàm này ở nút "Bắt đầu ôn" (fc01), "Ôn tập"
 * (fc05, ôn tự do), "Ôn ngay" (ss11, ôn sớm) và thông báo nhắc ôn (fc06).
 *
 *   flashcardReviewPath("vi")                                     ôn thẻ đến hạn
 *   flashcardReviewPath("vi", { mode: "free", deckId: "hsk-2" })  ôn tự do một deck
 *   flashcardReviewPath("vi", { mode: "early", sourceSessionId })  ôn sớm sau buổi nói
 */
export const flashcardReviewPath = (lang = "vi", { mode = "due", deckId, sourceSessionId } = {}) => {
  const q = new URLSearchParams({ mode })
  if (deckId) q.set("deck", deckId)
  if (sourceSessionId) q.set("source", sourceSessionId)
  return `/${lang}/ai-tutor/vocabulary-notebook/review?${q.toString()}`
}

export const flashcardResultPath = (lang = "vi", sessionId) =>
  `/${lang}/ai-tutor/vocabulary-notebook/review/${encodeURIComponent(sessionId)}/result`

/** Đọc mode/deck/source từ query string của fc02. Giá trị lạ thì về "due". */
export const parseReviewParams = (search) => {
  const q = new URLSearchParams(search || "")
  const mode = ["due", "early", "free"].includes(q.get("mode")) ? q.get("mode") : "due"
  return {
    mode,
    deckId: q.get("deck") || null,
    sourceSessionId: q.get("source") || null,
    sessionId: q.get("session") || null,
  }
}
