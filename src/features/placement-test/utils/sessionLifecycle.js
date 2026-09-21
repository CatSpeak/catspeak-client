import { RESUME_WINDOW_MS } from "../constants/lifecycle"
import { SESSION_STATUS } from "../constants/session"
import { TOTAL_TURNS } from "../engine"

export const RESUMABLE_STATUSES = [
  SESSION_STATUS.IN_PROGRESS,
  SESSION_STATUS.PAUSED,
]

export const SESSION_LIFECYCLE_KIND = {
  RESUME: "resume",
  EXPIRED: "expired",
}

export const isUnfinishedSession = (session) =>
  Boolean(session) && RESUMABLE_STATUSES.includes(session.status)

export const getSessionActivityAt = (session) =>
  Math.max(
    Number(session?.updatedAt) || 0,
    Number(session?.pausedAt) || 0,
    Number(session?.createdAt) || 0,
  )

export const getResumeDeadline = (
  session,
  { windowMs = RESUME_WINDOW_MS } = {},
) => getSessionActivityAt(session) + Math.max(0, Number(windowMs) || 0)

export const getSessionLifecycle = ({
  session,
  now = Date.now,
  windowMs = RESUME_WINDOW_MS,
  totalTurns = TOTAL_TURNS,
} = {}) => {
  if (!isUnfinishedSession(session)) return null

  const nowMs = typeof now === "function" ? Number(now()) : Number(now)
  const activityAt = getSessionActivityAt(session)
  const expiresAt = activityAt + Math.max(0, Number(windowMs) || 0)
  const remainingMs = Math.max(0, expiresAt - (Number.isFinite(nowMs) ? nowMs : 0))
  const turns = Array.isArray(session.turns) ? session.turns : []
  const answeredTurns = turns.filter(
    (t) => Boolean(t.answeredAt || t.submittedAt || (t.transcript && t.transcript.trim() !== ""))
  )
  const answeredCount = Math.min(answeredTurns.length, totalTurns)
  const nextOrder = Math.min(answeredCount + 1, totalTurns)

  return {
    kind:
      remainingMs > 0
        ? SESSION_LIFECYCLE_KIND.RESUME
        : SESSION_LIFECYCLE_KIND.EXPIRED,
    expired: remainingMs <= 0,
    session,
    answeredCount,
    totalTurns,
    nextOrder,
    activityAt,
    expiresAt,
    remainingMs,
  }
}
