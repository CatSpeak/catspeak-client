import { SESSION_STATUS } from "../constants/session"
import { applySelfAdjust, clampHsk, scoreSession } from "../engine"
import { createSessionCode } from "../utils/session"
import { getRetakeEligibility } from "../utils/cooldown"
import {
  readActiveSession,
  readResult,
  saveActiveSession,
  saveResult,
} from "../utils/sessionStorage"

export const MOCK_LATENCY_MS = 400
export const MOCK_SCORING_LATENCY_MS = 1800
export const SCORING_FAILURE_FLAG_KEY = "catspeak_pt_force_scoring_failure"

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const isScoringFailureForced = ({ storage } = {}) => {
  const target =
    storage ?? (typeof window !== "undefined" ? window.localStorage : null)
  if (!target) return false
  try {
    return target.getItem(SCORING_FAILURE_FLAG_KEY) === "1"
  } catch {
    return false
  }
}

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

export const getRetakeStatusMock = async ({
  delayMs = MOCK_LATENCY_MS,
  readResult: readStoredResult = readResult,
  now = Date.now,
} = {}) => {
  await wait(delayMs)
  const result = readStoredResult()
  const lastTestedAt =
    Number(result?.scoredAt) || Number(result?.adjustedAt) || null
  const eligibility = getRetakeEligibility({ lastTestedAt, now })

  return {
    data: {
      eligible: eligibility.eligible,
      lastTestedAt: eligibility.lastTestedAt,
      eligibleRetakeAt: eligibility.eligibleAt,
      daysRemaining: eligibility.daysRemaining,
      daysElapsed: eligibility.daysElapsed,
      progress: eligibility.progress,
      totalDays: eligibility.totalDays,
      hasHistory: eligibility.hasHistory,
    },
  }
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

export const scoreSessionMock = async (
  { sessionId, fail } = {},
  {
    delayMs = MOCK_SCORING_LATENCY_MS,
    read = readActiveSession,
    persist = saveActiveSession,
    persistResult = saveResult,
    forcedFailure = isScoringFailureForced,
    now = Date.now,
  } = {},
) => {
  await wait(delayMs)
  const session = read()
  if (!session || (sessionId && session.id !== sessionId)) {
    return {
      error: { status: 404, data: { message: "placement_session_not_found" } },
    }
  }
  if (fail || forcedFailure()) {
    return {
      error: { status: 503, data: { message: "placement_scoring_failed" } },
    }
  }

  const timestamp = typeof now === "function" ? now() : now
  const turns = Array.isArray(session.turns) ? session.turns : []
  const result = {
    ...scoreSession({ turns, now }),
    sessionId: session.id,
    code: session.code,
    answeredCount: turns.length,
  }
  persistResult(result)

  const completed = {
    ...session,
    status: SESSION_STATUS.COMPLETED,
    finalBand: result.band,
    updatedAt: timestamp,
  }
  persist(completed)

  return { data: { result, session: completed } }
}

export const adjustLevelMock = async (
  { sessionId, level } = {},
  {
    delayMs = MOCK_LATENCY_MS,
    read = readActiveSession,
    persist = saveActiveSession,
    readResult: readStoredResult = readResult,
    persistResult = saveResult,
    now = Date.now,
  } = {},
) => {
  await wait(delayMs)
  const session = read()
  if (!session || (sessionId && session.id !== sessionId)) {
    return {
      error: { status: 404, data: { message: "placement_session_not_found" } },
    }
  }

  const result = readStoredResult()
  if (!result || (sessionId && result.sessionId !== sessionId)) {
    return {
      error: { status: 404, data: { message: "placement_result_not_found" } },
    }
  }

  if (session.selfAdjusted || result.selfAdjusted) {
    return {
      error: { status: 409, data: { message: "placement_adjust_locked" } },
    }
  }

  const aiBand = clampHsk(session.finalBand ?? result.band)
  const { band: finalBand, applied } = applySelfAdjust({ band: aiBand, level })
  const timestamp = typeof now === "function" ? now() : now

  const updatedSession = {
    ...session,
    finalBand,
    selfAdjusted: true,
    updatedAt: timestamp,
  }
  persist(updatedSession)

  const updatedResult = {
    ...result,
    band: finalBand,
    aiBand: result.aiBand ?? aiBand,
    selfAdjusted: true,
    adjustedAt: timestamp,
  }
  persistResult(updatedResult)

  return {
    data: {
      session: updatedSession,
      result: updatedResult,
      band: finalBand,
      applied,
      selfAdjusted: true,
    },
  }
}
