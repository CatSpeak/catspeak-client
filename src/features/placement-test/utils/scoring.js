import { SCORING_DURATION_MS } from "../constants/scoring"

export const SCORING_STEP_STATUS = {
  DONE: "done",
  ACTIVE: "active",
  PENDING: "pending",
}

export const SCORING_STEPS = [
  { key: "pronunciation", from: 0, to: 0.3 },
  { key: "vocabulary", from: 0.3, to: 0.75 },
  { key: "ranking", from: 0.75, to: 1 },
]

const clamp01 = (value) => Math.min(1, Math.max(0, value))

export const computeScoringProgress = (
  elapsedMs = 0,
  { durationMs = SCORING_DURATION_MS } = {},
) => {
  const total = durationMs > 0 ? durationMs : SCORING_DURATION_MS
  const fraction = clamp01((Number(elapsedMs) || 0) / total)

  return SCORING_STEPS.map((step) => {
    if (fraction >= step.to) {
      return { key: step.key, status: SCORING_STEP_STATUS.DONE, percent: 100 }
    }
    if (fraction >= step.from) {
      const within = (fraction - step.from) / (step.to - step.from)
      return {
        key: step.key,
        status: SCORING_STEP_STATUS.ACTIVE,
        percent: Math.round(clamp01(within) * 100),
      }
    }
    return { key: step.key, status: SCORING_STEP_STATUS.PENDING, percent: 0 }
  })
}
