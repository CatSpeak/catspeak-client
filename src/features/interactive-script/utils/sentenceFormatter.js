/**
 * Normalizes and splits an example sentence string into original and translated parts.
 *
 * Handles common inconsistencies from APIs/AI:
 * 1. Newlines: "English\nVietnamese"
 * 2. Parentheses: "English (Vietnamese)"
 * 3. Dash separators: "English – Vietnamese" or "English - Vietnamese"
 * 4. Punctuation followed by translated text: "English. Cô ấy là..."
 *
 * @param {string} raw
 * @returns {{ original: string, translation: string | null }}
 */
export const parseExampleSentence = (raw) => {
  if (!raw || typeof raw !== "string") {
    return { original: "", translation: null }
  }

  const text = raw.trim()
  if (!text) {
    return { original: "", translation: null }
  }

  // 1. Newline separator
  if (text.includes("\n")) {
    const parts = text
      .split(/\r?\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length >= 2) {
      return {
        original: parts[0],
        translation: parts.slice(1).join(" "),
      }
    }
  }

  // 2. Parentheses at the end: "Original sentence. (Translated sentence)"
  const parenMatch = text.match(/^(.*?)\s*[(（]([^)）]+)[)）]\s*$/)
  if (parenMatch && parenMatch[1] && parenMatch[2]) {
    return {
      original: parenMatch[1].trim(),
      translation: parenMatch[2].trim(),
    }
  }

  // 3. Dash separator: "Original sentence. – Translated sentence"
  // Note: requires whitespace around the dash so hyphenated words like "twenty-one" are ignored.
  const dashMatch = text.match(/^(.*?)\s+[–—–-]\s+(.+)$/)
  if (dashMatch && dashMatch[1] && dashMatch[2]) {
    return {
      original: dashMatch[1].trim(),
      translation: dashMatch[2].trim(),
    }
  }

  // 4. Punctuation followed by translation (e.g. Vietnamese or CJK text):
  // Checks if the trailing sentence contains non-Latin / diacritic characters
  const VI_OR_CJK_REGEX =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/i
  const sentenceMatch = text.match(/^(.*?[.!?])\s+([A-ZÀ-Ỹ\u4e00-\u9fff].*)$/)
  if (sentenceMatch && sentenceMatch[1] && sentenceMatch[2]) {
    if (VI_OR_CJK_REGEX.test(sentenceMatch[2])) {
      return {
        original: sentenceMatch[1].trim(),
        translation: sentenceMatch[2].trim(),
      }
    }
  }

  return { original: text, translation: null }
}
