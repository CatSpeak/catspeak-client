import { clampHsk, clampScore } from "../engine"

export const DIMENSION_KEYS = ["pronunciation", "vocabulary", "grammar", "fluency"]

const TIER_BY_BAND = {
  1: "tierBeginner",
  2: "tierBeginner",
  3: "tierIntermediate",
  4: "tierIntermediate",
  5: "tierAdvanced",
  6: "tierAdvanced",
}

const CEFR_BY_BAND = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
  6: "C2",
}

const ADJUST_DELTAS = { down: -1, keep: 0, up: 1 }

export const ADJUST_OPTION_KEYS = ["down", "keep", "up"]

export const getTierKey = (band) => TIER_BY_BAND[clampHsk(band)]

export const getCefr = (band) => CEFR_BY_BAND[clampHsk(band)]

export const getBandDescriptor = (band) => ({
  band: clampHsk(band),
  tierKey: getTierKey(band),
  cefr: getCefr(band),
})

export const getDimensionScores = (result = {}) =>
  DIMENSION_KEYS.map((key) => ({ key, score: clampScore(result[key]) }))

export const computeOverallScore = (result = {}) => {
  const scores = getDimensionScores(result)
  const total = scores.reduce((sum, item) => sum + item.score, 0)
  return Math.round(total / scores.length)
}

export const getStrengthDimension = (result = {}) => {
  const scores = getDimensionScores(result)
  return scores.reduce(
    (best, item) => (item.score > best.score ? item : best),
    scores[0],
  )
}

export const getWeaknessDimension = (result = {}) => {
  const listed = Array.isArray(result.weaknesses)
    ? result.weaknesses.find((item) => DIMENSION_KEYS.includes(item?.dimension))
    : null
  if (listed) return { key: listed.dimension, score: clampScore(listed.score) }

  const scores = getDimensionScores(result)
  return scores.reduce(
    (worst, item) => (item.score < worst.score ? item : worst),
    scores[0],
  )
}

export const getTargetRoadmapBand = (band) => {
  const current = clampHsk(band)
  return current >= 6 ? 6 : current + 1
}

export const buildAdjustOptions = (band) => {
  const current = clampHsk(band)
  return ADJUST_OPTION_KEYS.map((key) => ({
    key,
    level: clampHsk(current + ADJUST_DELTAS[key]),
  }))
}
