import { HSK_BAND_THRESHOLDS } from "../constants/hskBank"
import { clampHsk } from "./cat"
import {
  HSK_CEILING_LEVEL,
  HSK_MAX,
  HSK_MIN,
  TOTAL_TURNS,
  WEAKNESS_THRESHOLD,
} from "./constants"
import { computeAhi, matchGrammar } from "./matching"

const clamp01 = (value) => Math.min(1, Math.max(0, value))

export const clampScore = (value) =>
  Math.min(100, Math.max(0, Math.round(Number.isFinite(value) ? value : 0)))

const round1 = (value) => Math.round(value * 10) / 10

const average = (values) =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length

const finiteNumbers = (values) =>
  values.map((value) => Number(value)).filter(Number.isFinite)

const vocabBandForAhi = (ahi) => {
  if (!Number.isFinite(ahi) || ahi < 0) return HSK_MIN
  const match = HSK_BAND_THRESHOLDS.find(
    (threshold) => ahi >= threshold.min && ahi < threshold.max,
  )
  return match ? match.band : HSK_MAX
}

export const scoreSession = ({ turns = [], now = Date.now } = {}) => {
  const list = (Array.isArray(turns) ? turns : []).filter(Boolean)
  const answered = list.filter(
    (turn) => typeof turn.transcript === "string" && turn.transcript.trim().length > 0,
  )

  const vocabTotal = round1(computeAhi(list))
  const vocabBand = vocabBandForAhi(vocabTotal)

  const matchedGrammar = []
  for (const turn of answered) {
    for (const entry of matchGrammar(turn.transcript)) {
      if (!matchedGrammar.some((match) => match.id === entry.id)) {
        matchedGrammar.push({ id: entry.id, level: entry.level, label: entry.label })
      }
    }
  }
  const grammarFloor = matchedGrammar.reduce(
    (max, match) => Math.max(max, match.level),
    0,
  )

  const questionCeiling = list.reduce((max, turn) => {
    const level = Number(turn.level)
    return Number.isFinite(level) ? Math.max(max, level) : max
  }, 0)
  const ceiling = questionCeiling > 0 ? questionCeiling : HSK_CEILING_LEVEL
  const grammarCap = grammarFloor > 0 ? grammarFloor : HSK_MIN
  const band = clampHsk(Math.min(vocabBand, grammarCap, ceiling))

  const coverage = answered.length / TOTAL_TURNS
  const avgLevel = average(finiteNumbers(answered.map((turn) => turn.level)))
  const totalRetries = finiteNumbers(list.map((turn) => turn.retryCount)).reduce(
    (sum, value) => sum + value,
    0,
  )
  const retryPenalty = Math.min(totalRetries, 5) * 4

  const pronunciation = clampScore(
    Math.round(100 * (0.5 * coverage + 0.5 * (avgLevel / HSK_MAX))) -
      totalRetries * 5,
  )
  const vocabulary = clampScore(Math.round((vocabTotal / HSK_MAX) * 100))
  const grammar =
    grammarFloor === 0
      ? 0
      : clampScore(
          Math.round(
            (grammarFloor / HSK_MAX) * 70 +
              (Math.min(matchedGrammar.length, 5) / 5) * 30,
          ),
        )
  const avgDuration = average(
    finiteNumbers(answered.map((turn) => turn.durationMs)),
  )
  const durationScore = clamp01(avgDuration / 6000)
  const fluency = clampScore(
    Math.round(100 * (0.6 * coverage + 0.4 * durationScore)) - retryPenalty,
  )

  const dimensions = [
    { dimension: "pronunciation", score: pronunciation },
    { dimension: "vocabulary", score: vocabulary },
    { dimension: "grammar", score: grammar },
    { dimension: "fluency", score: fluency },
  ]
  const weaknesses = dimensions
    .filter((dimension) => dimension.score < WEAKNESS_THRESHOLD)
    .sort((a, b) => a.score - b.score)

  return {
    vocabTotal,
    vocabBand,
    grammarFloor,
    ceiling,
    band,
    pronunciation,
    vocabulary,
    grammar,
    fluency,
    matchedGrammar,
    weaknesses,
    scoredAt: typeof now === "function" ? now() : now,
  }
}

export const applySelfAdjust = ({ band, level } = {}) => {
  const current = clampHsk(band)
  const requested = Number(level)
  if (!Number.isFinite(requested)) {
    return { band: current, selfAdjusted: false, applied: false }
  }
  const delta = Math.max(-1, Math.min(1, Math.round(requested) - current))
  const next = clampHsk(current + delta)
  const applied = next !== current
  return { band: next, selfAdjusted: applied, applied }
}
