/**
 * Chuẩn hoá đáp án cho Practice (FE-02). Hàm thuần, test bằng vitest.
 *
 * Học viên được trả lời bằng chữ Hán hoặc pinyin:
 *   - pinyin dấu thanh (nǐ hǎo), pinyin số (ni3 hao3) và "v" thay "ü" (lv4) là như nhau
 *   - thanh nhẹ: "ma", "ma5", "ma0" là như nhau
 *   - gõ pinyin đúng chữ nhưng thiếu/sai thanh điệu -> "partial" (vẫn tính nhớ, nhưng chấm Hard)
 */
import { normalizeAnswer } from "@/features/ai-tutor/utils/flashcardReview"

export { normalizeAnswer }

// Nguyên âm mang dấu -> [chữ gốc, thanh]. "v" đại diện cho ü.
const TONE_MARKS = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4],
  ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4],
  ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4],
  ǖ: ["v", 1], ǘ: ["v", 2], ǚ: ["v", 3], ǜ: ["v", 4],
  ü: ["v", 0],
}

const HAN = /\p{Script=Han}/u

/** Có chữ Hán trong chuỗi không (để biết học viên đang gõ chữ hay gõ pinyin). */
export const hasHan = (text) => HAN.test(String(text ?? ""))

/**
 * Đưa pinyin về dạng so sánh được: { letters, tones }.
 *   "Nǐ hǎo" -> { letters: "nihao", tones: "33" }
 *   "ni3hao3" -> { letters: "nihao", tones: "33" }
 * Thanh nhẹ (0, 5, không dấu) không ghi vào `tones`.
 */
export const parsePinyin = (text) => {
  const src = String(text ?? "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/u:/g, "v")
  let letters = ""
  let tones = ""
  for (const ch of src) {
    const mark = TONE_MARKS[ch]
    if (mark) {
      letters += mark[0]
      if (mark[1]) tones += String(mark[1])
    } else if (ch >= "a" && ch <= "z") {
      letters += ch
    } else if (ch >= "1" && ch <= "4") {
      tones += ch
    }
    // khoảng trắng, dấu nháy, gạch nối, số 0/5 (thanh nhẹ): bỏ qua
  }
  return { letters, tones }
}

/**
 * Chấm một đáp án gõ tay so với thẻ { word, pinyin }.
 * @returns {"correct" | "partial" | "wrong" | "blank"}
 *   partial = pinyin đúng mặt chữ nhưng thiếu/sai thanh điệu
 */
export const checkTypedAnswer = (input, { word, pinyin } = {}) => {
  const raw = String(input ?? "").trim()
  if (!raw) return "blank"

  if (hasHan(raw)) {
    const a = normalizeAnswer(raw)
    return a.length > 0 && a === normalizeAnswer(word) ? "correct" : "wrong"
  }
  if (!pinyin) return "wrong"

  const got = parsePinyin(raw)
  const want = parsePinyin(pinyin)
  if (!got.letters || got.letters !== want.letters) return "wrong"
  return got.tones === want.tones ? "correct" : "partial"
}

const isSkippable = (ch) => normalizeAnswer(ch) === ""

/**
 * So từng ký tự khi chép câu (chế độ Gõ câu). Dấu câu và khoảng trắng của câu mẫu
 * không bắt gõ, để bộ gõ nửa khổ/toàn khổ không làm học viên "sai".
 *
 * @returns {{ chars: Array<{ ch: string, state: "ok"|"bad"|"todo"|"caret"|"skip" }>,
 *            done: boolean, correct: number, typed: number }}
 */
export const alignTyped = (target, typed) => {
  const input = Array.from(normalizeAnswer(typed))
  let k = 0
  let correct = 0
  let caretPlaced = false
  const chars = Array.from(String(target ?? "")).map((ch) => {
    if (isSkippable(ch)) return { ch, state: "skip" }
    const t = input[k]
    k += 1
    if (t === undefined) {
      if (caretPlaced) return { ch, state: "todo" }
      caretPlaced = true
      return { ch, state: "caret" }
    }
    const ok = normalizeAnswer(t) === normalizeAnswer(ch)
    if (ok) correct += 1
    return { ch, state: ok ? "ok" : "bad" }
  })
  const required = chars.filter((c) => c.state !== "skip").length
  return { chars, done: required > 0 && correct === required && input.length === required, correct, typed: input.length }
}

/**
 * Câu ví dụ có chỗ trống cho chế độ Nghe và điền. Ưu tiên `example_blank` server trả;
 * không có thì tự khoét từ đầu tiên khớp trong câu.
 */
export const blankSentence = ({ example_blank: blank, example_sentence: sentence, word } = {}) => {
  if (blank) return blank
  if (!sentence || !word || !sentence.includes(word)) return null
  return sentence.replace(word, "＿".repeat(Array.from(word).length))
}
