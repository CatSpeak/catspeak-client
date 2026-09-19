import { MLU_CAP } from "./constants"
import { matchGrammar, matchVocabulary } from "./matching"

const normalizeLevel = (level) => {
  const value = Number(level)
  return Number.isFinite(value) ? value : 0
}

export const evaluateTurn = ({ question, transcript, level } = {}) => {
  const targetLevel = normalizeLevel(level ?? question?.level)
  const matchedVocabulary = matchVocabulary(transcript).slice(0, MLU_CAP)
  const matchedGrammar = matchGrammar(transcript)
  const passed =
    matchedVocabulary.some((entry) => entry.level >= targetLevel) ||
    matchedGrammar.some((entry) => entry.level >= targetLevel)

  return {
    level: targetLevel,
    matchedVocabulary,
    matchedGrammar,
    mlu: matchedVocabulary.length,
    passed,
  }
}
