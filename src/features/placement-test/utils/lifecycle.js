import {
  MAX_RECONNECT_ATTEMPTS,
  PAUSE_BUDGET_MS,
  RECONNECT_INTERVAL_MS,
} from "../constants/lifecycle"

export const remainingQuestionMs = (deadline, now) =>
  Math.max(0, (Number(deadline) || 0) - (Number(now) || 0))

export const deadlineFromRemaining = (now, remainingMs) =>
  (Number(now) || 0) + Math.max(0, Number(remainingMs) || 0)

export const remainingPauseBudget = (spentMs, budgetMs = PAUSE_BUDGET_MS) =>
  Math.max(0, budgetMs - Math.max(0, Number(spentMs) || 0))

export const advancePauseBudget = (
  spentMs,
  deltaMs,
  budgetMs = PAUSE_BUDGET_MS,
) =>
  Math.min(
    budgetMs,
    Math.max(0, Number(spentMs) || 0) + Math.max(0, Number(deltaMs) || 0),
  )

export const startReconnect = ({ intervalMs = RECONNECT_INTERVAL_MS } = {}) => ({
  attempt: 1,
  remainingMs: intervalMs,
  exhausted: false,
})

export const tickReconnect = (
  state,
  deltaMs,
  {
    intervalMs = RECONNECT_INTERVAL_MS,
    maxAttempts = MAX_RECONNECT_ATTEMPTS,
  } = {},
) => {
  const attempt = Math.max(1, Number(state?.attempt) || 1)
  const remainingMs = Math.max(
    0,
    (Number(state?.remainingMs) || 0) - Math.max(0, Number(deltaMs) || 0),
  )
  if (remainingMs > 0) return { attempt, remainingMs, exhausted: false }
  if (attempt >= maxAttempts) return { attempt, remainingMs: 0, exhausted: true }
  return { attempt: attempt + 1, remainingMs: intervalMs, exhausted: false }
}
