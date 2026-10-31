import { PAUSE_BUDGET_MS, RESUME_WINDOW_MS } from "../constants/lifecycle"
import { remainingPauseBudget } from "./lifecycle"
import { SESSION_STATUS } from "../constants/session"
import { TOTAL_TURNS } from "../engine"
import { countSubmittedTurns } from "./turns"

export const RESUMABLE_STATUSES = [
  SESSION_STATUS.IN_PROGRESS,
  SESSION_STATUS.PAUSED,
]

export const SESSION_LIFECYCLE_KIND = {
  RESUME: "resume",
  EXPIRED: "expired",
  PAUSE_EXPIRED: "pause_expired",
}

export const isUnfinishedSession = (session) =>
  Boolean(session) && RESUMABLE_STATUSES.includes(session.status)

export const getSessionActivityAt = (session) =>
  Math.max(
    Number(session?.updatedAt) || 0,
    Number(session?.pausedAt) || 0,
    Number(session?.createdAt) || 0,
  )

const positiveOrder = (value) => {
  const order = Number(value)
  return Number.isFinite(order) && order > 0 ? order : 0
}

// Resume position = the server's pending question when it has one. The answered
// count alone rewinds to turn 1 when the locally stored turns are stale, even
// though `current_question` (read/placement/service.py:44-56) is still turn 2.
export const getResumeOrder = (
  session,
  { answeredCount = 0, totalTurns = TOTAL_TURNS } = {},
) =>
  Math.min(
    totalTurns,
    Math.max(
      positiveOrder(answeredCount) + 1,
      positiveOrder(session?.currentQuestion?.turn_index),
      positiveOrder(session?.currentOrder),
    ),
  )

export const getResumeDeadline = (
  session,
  { windowMs = RESUME_WINDOW_MS } = {},
) => getSessionActivityAt(session) + Math.max(0, Number(windowMs) || 0)

// The pause budget starts when the learner opens the pause modal; `pauseSpentMs`
// carries time already spent in earlier pauses. Returns 0 when not paused.
const getPauseDeadline = (
  session,
  { budgetMs = PAUSE_BUDGET_MS } = {},
) => {
  const startedAt = Number(session?.pauseStartedAt) || 0
  if (startedAt <= 0) return 0
  return startedAt + remainingPauseBudget(session?.pauseSpentMs, budgetMs)
}

export const isPauseExpired = (
  session,
  { now = Date.now, budgetMs = PAUSE_BUDGET_MS } = {},
) => {
  const deadline = getPauseDeadline(session, { budgetMs })
  if (!deadline) return false
  const nowMs = typeof now === "function" ? Number(now()) : Number(now)
  return (Number.isFinite(nowMs) ? nowMs : 0) >= deadline
}

export const getSessionLifecycle = ({
  session,
  now = Date.now,
  windowMs = RESUME_WINDOW_MS,
  pauseBudgetMs = PAUSE_BUDGET_MS,
  totalTurns = TOTAL_TURNS,
} = {}) => {
  if (!isUnfinishedSession(session)) return null

  const nowMs = typeof now === "function" ? Number(now()) : Number(now)
  const activityAt = getSessionActivityAt(session)
  const expiresAt = activityAt + Math.max(0, Number(windowMs) || 0)
  const remainingMs = Math.max(0, expiresAt - (Number.isFinite(nowMs) ? nowMs : 0))
  const answeredCount = countSubmittedTurns(session.turns, totalTurns)
  const nextOrder = getResumeOrder(session, { answeredCount, totalTurns })
  const pauseExpired = isPauseExpired(session, {
    now: Number.isFinite(nowMs) ? nowMs : 0,
    budgetMs: pauseBudgetMs,
  })

  return {
    kind: pauseExpired
      ? SESSION_LIFECYCLE_KIND.PAUSE_EXPIRED
      : remainingMs > 0
        ? SESSION_LIFECYCLE_KIND.RESUME
        : SESSION_LIFECYCLE_KIND.EXPIRED,
    expired: pauseExpired || remainingMs <= 0,
    session,
    answeredCount,
    totalTurns,
    nextOrder,
    activityAt,
    expiresAt,
    remainingMs,
  }
}
