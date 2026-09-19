import { HSK_BANK } from "../../constants/hskBank"
import { HSK_MIN } from "../../engine/constants"

export const pickFallbackTranscript = ({
  level = HSK_MIN,
  random = Math.random,
  bank = HSK_BANK,
} = {}) => {
  const levelBank = bank[level] || bank[HSK_MIN]
  const answers = levelBank?.fallbackAnswers || []
  if (answers.length === 0) return ""
  const value = typeof random === "function" ? random() : Number(random)
  const safe = Number.isFinite(value) ? Math.min(0.999999, Math.max(0, value)) : 0
  const index = Math.floor(safe * answers.length)
  return answers[index].hanzi
}
