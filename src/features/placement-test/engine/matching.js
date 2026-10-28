import { HSK_BANK, HSK_LEVELS } from "../constants/hskBank"
import { MLU_CAP } from "./constants"

const ALL_VOCABULARY = HSK_LEVELS.flatMap(
  (level) => HSK_BANK[level].vocabulary,
)

const ALL_GRAMMAR = HSK_LEVELS.flatMap((level) => HSK_BANK[level].grammar)

const VOCABULARY_BY_LENGTH = [...ALL_VOCABULARY].sort(
  (a, b) => b.word.length - a.word.length,
)

export const matchVocabulary = (transcript) => {
  if (typeof transcript !== "string" || transcript.length === 0) return []
  const matches = []
  let index = 0
  while (index < transcript.length) {
    const hit = VOCABULARY_BY_LENGTH.find(
      (entry) => entry.word.length > 0 && transcript.startsWith(entry.word, index),
    )
    if (hit) {
      matches.push(hit)
      index += hit.word.length
    } else {
      index += 1
    }
  }
  return matches
}

export const matchGrammar = (transcript) => {
  if (typeof transcript !== "string" || transcript.length === 0) return []
  return ALL_GRAMMAR.filter((entry) => entry.pattern.test(transcript))
}

export const computeAhi = (turns) => {
  const list = Array.isArray(turns) ? turns.filter(Boolean) : []
  let weightSum = 0
  let levelWeightSum = 0
  for (const turn of list) {
    const matched = matchVocabulary(turn.transcript).slice(0, MLU_CAP)
    for (const entry of matched) {
      weightSum += entry.difficulty
      levelWeightSum += entry.level * entry.difficulty
    }
  }
  return weightSum > 0 ? levelWeightSum / weightSum : 0
}
