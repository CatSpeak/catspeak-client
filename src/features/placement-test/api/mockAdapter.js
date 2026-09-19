import { SESSION_STATUS } from "../constants/session"
import { createSessionCode } from "../utils/session"
import { readActiveSession, saveActiveSession } from "../utils/sessionStorage"

export const MOCK_LATENCY_MS = 400

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const buildSession = ({
  targetBand,
  studentId = null,
  now = Date.now,
  random = Math.random,
  year,
} = {}) => {
  const timestamp = now()
  return {
    id: `pt-${timestamp}-${Math.floor(random() * 1e6)}`,
    code: createSessionCode({
      year: year ?? new Date(timestamp).getFullYear(),
      random: random(),
    }),
    studentId,
    status: SESSION_STATUS.IN_PROGRESS,
    currentOrder: 0,
    targetBand,
    finalBand: null,
    selfAdjusted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    turns: [],
  }
}

export const createSessionMock = async (
  { targetBand, studentId } = {},
  { delayMs = MOCK_LATENCY_MS, persist = saveActiveSession, ...sessionDeps } = {},
) => {
  await wait(delayMs)
  const session = buildSession({ targetBand, studentId, ...sessionDeps })
  persist(session)
  return { data: session }
}

export const submitTurnMock = async (
  {
    sessionId,
    order,
    questionId,
    level,
    transcript,
    durationMs,
    retryCount,
    passed,
  } = {},
  {
    delayMs = MOCK_LATENCY_MS,
    persist = saveActiveSession,
    read = readActiveSession,
    now = Date.now,
  } = {},
) => {
  await wait(delayMs)
  const session = read()
  if (!session || (sessionId && session.id !== sessionId)) {
    return { error: { status: 404, data: { message: "placement_session_not_found" } } }
  }

  const timestamp = typeof now === "function" ? now() : now
  const turn = {
    order: Number(order) || (session.turns?.length || 0) + 1,
    questionId: questionId || null,
    level: Number(level) || 1,
    transcript: typeof transcript === "string" ? transcript : "",
    durationMs: Number(durationMs) || 0,
    retryCount: Number(retryCount) || 0,
    passed: Boolean(passed),
    submittedAt: timestamp,
  }

  const turns = (Array.isArray(session.turns) ? session.turns : [])
    .filter((entry) => entry.order !== turn.order)
    .concat(turn)
    .sort((a, b) => a.order - b.order)

  const updated = {
    ...session,
    turns,
    currentOrder: Math.max(session.currentOrder || 0, turn.order),
    updatedAt: timestamp,
  }
  persist(updated)

  return {
    data: {
      accepted: true,
      turn,
      session: updated,
      status: SESSION_STATUS.IN_PROGRESS,
    },
  }
}
