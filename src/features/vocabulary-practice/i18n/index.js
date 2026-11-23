import vi from "./vi"
import en from "./en"
import zh from "./zh"
import ja from "./ja"

export const vocabularyPracticeTranslations = { vi, en, zh, ja }

/** Thay {key} trong chuỗi dịch. */
export const fmt = (text, vars = {}) =>
  String(text ?? "").replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))

export default vocabularyPracticeTranslations
