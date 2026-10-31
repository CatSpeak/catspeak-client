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

export const RECONNECT_OUTCOME = {
  WAIT: "wait",
  RECOVER: "recover",
  EXIT: "exit",
}

/**
 * Một nhịp của chu kỳ kết nối lại. Hết lượt thử cuối mà mạng vẫn mất thì rời
 * phòng thi (EXIT) — lỗi nằm ở mạng của người học, không phải một phiên tạm dừng.
 */
export const nextReconnectStep = (
  state,
  { deltaMs = RECONNECT_INTERVAL_MS, online = true } = {},
) => {
  const attempt = Math.max(1, Number(state?.attempt) || 1)
  const next = tickReconnect(state, deltaMs)
  if (next.exhausted) {
    return {
      state: startReconnect(),
      outcome: online ? RECONNECT_OUTCOME.RECOVER : RECONNECT_OUTCOME.EXIT,
    }
  }
  if (next.attempt !== attempt && online) {
    return { state: startReconnect(), outcome: RECONNECT_OUTCOME.RECOVER }
  }
  return { state: next, outcome: RECONNECT_OUTCOME.WAIT }
}
