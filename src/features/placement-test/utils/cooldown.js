import {
  RETAKE_COOLDOWN_DAYS,
  RETAKE_COOLDOWN_MS,
} from "../constants/lifecycle"

const DAY_MS = 24 * 60 * 60 * 1000

export const ROADMAP_TOTAL_DAYS = 5

export const getRetakeEligibility = ({ lastTestedAt, now = Date.now } = {}) => {
  const nowMs = typeof now === "function" ? Number(now()) : Number(now)
  const last = Number(lastTestedAt)
  const hasHistory = Number.isFinite(last) && last > 0

  if (!hasHistory) {
    return {
      hasHistory: false,
      eligible: true,
      lastTestedAt: null,
      eligibleAt: null,
      daysElapsed: 0,
      daysRemaining: 0,
      progress: 0,
      totalDays: RETAKE_COOLDOWN_DAYS,
    }
  }

  const elapsed = Math.max(
    0,
    (Number.isFinite(nowMs) ? nowMs : Date.now()) - last,
  )
  const eligibleAt = last + RETAKE_COOLDOWN_MS
  const eligible = elapsed >= RETAKE_COOLDOWN_MS
  const daysElapsed = Math.min(
    RETAKE_COOLDOWN_DAYS,
    Math.floor(elapsed / DAY_MS),
  )
  const daysRemaining = eligible ? 0 : RETAKE_COOLDOWN_DAYS - daysElapsed
  const progress = Math.min(
    100,
    Math.floor((elapsed / RETAKE_COOLDOWN_MS) * 100),
  )

  return {
    hasHistory: true,
    eligible,
    lastTestedAt: last,
    eligibleAt,
    daysElapsed,
    daysRemaining,
    progress,
    totalDays: RETAKE_COOLDOWN_DAYS,
  }
}

export const getRoadmapProgress = (eligibility = {}) => {
  const total = ROADMAP_TOTAL_DAYS
  const ratio = Math.min(1, Math.max(0, (Number(eligibility.progress) || 0) / 100))
  const completed = eligibility.eligible
    ? total
    : Math.min(total - 1, Math.floor(ratio * total))
  const percent = Math.round((completed / total) * 100)

  const stages = [
    { key: "stage1", done: completed >= 2 },
    { key: "stage2", done: completed >= 4 },
    { key: "stage3", done: Boolean(eligibility.eligible) },
  ]
  const activeIndex = eligibility.eligible
    ? -1
    : stages.findIndex((stage) => !stage.done)

  return {
    total,
    completed,
    percent,
    stages: stages.map((stage, index) => ({
      ...stage,
      active: index === activeIndex,
    })),
  }
}
