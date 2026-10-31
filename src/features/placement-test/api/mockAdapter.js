import { SESSION_STATUS } from "../constants/session"
import {
  TOTAL_TURNS,
  applySelfAdjust,
  clampHsk,
  scoreSession,
  selectNextQuestion,
} from "../engine"
import { createSessionCode } from "../utils/session"
import { getRetakeEligibility } from "../utils/cooldown"
import { isUnfinishedSession } from "../utils/sessionLifecycle"
import { upsertTurn, countSubmittedTurns } from "../utils/turns"
import {
  clearActiveSession,
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
  {
    delayMs = MOCK_LATENCY_MS,
    persist = saveActiveSession,
    readResult: readStoredResult = readResult,
    now = Date.now,
    ...sessionDeps
  } = {},
) => {
  await wait(delayMs)
  const localResult = readStoredResult()
  const lastTestedAt =
    Number(localResult?.scoredAt) || Number(localResult?.adjustedAt) || null
  const eligibility = getRetakeEligibility({ lastTestedAt, now })

  if (eligibility.hasHistory && !eligibility.eligible) {
    return {
      error: {
        status: 403,
        data: {
          code: "COOLDOWN_ACTIVE",
          message: `Bạn cần đợi thêm ${eligibility.daysRemaining} ngày nữa để thi lại theo quy tắc 14 ngày Cooldown.`,
          days_remaining: eligibility.daysRemaining,
          eligible_at: eligibility.eligibleAt,
        },
      },
    }
  }

  const session = buildSession({ targetBand, studentId, now, ...sessionDeps })
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

export const getActiveSessionMock = async ({
  delayMs = MOCK_LATENCY_MS,
  read = readActiveSession,
  totalTurns = TOTAL_TURNS,
} = {}) => {
  await wait(delayMs)
  const session = read()
  if (!session || !isUnfinishedSession(session)) {
    return { data: null }
  }
  const answeredTurnCount = countSubmittedTurns(session.turns, totalTurns)
  if (answeredTurnCount >= totalTurns) {
    return { data: null }
  }
  return { data: session }
}

export const getQuestionMock = async ({
  sessionId,
  delayMs = MOCK_LATENCY_MS,
  read = readActiveSession,
  totalTurns = TOTAL_TURNS,
} = {}) => {
  await wait(delayMs)
  const session = read()
  if (!session || (sessionId && session.id !== sessionId)) {
    return {
      error: { status: 404, data: { message: "placement_session_not_found" } },
    }
  }

  const answeredTurnCount = countSubmittedTurns(session.turns, totalTurns)

  if (session.status === SESSION_STATUS.COMPLETED || !isUnfinishedSession(session) || answeredTurnCount >= totalTurns) {
    return {
      error: {
        status: 400,
        data: {
          code: "SESSION_ALREADY_COMPLETED",
          message: "Session is already completed.",
        },
      },
    }
  }

  const turnOrder = countSubmittedTurns(session.turns, totalTurns) + 1
  if (turnOrder > totalTurns) {
    return {
      error: {
        status: 400,
        data: {
          code: "SESSION_ALREADY_COMPLETED",
          message: "All questions have been answered.",
        },
      },
    }
  }

  const question = selectNextQuestion({
    targetBand: session.targetBand,
    turns: session.turns || [],
    order: turnOrder,
  })
  return {
    data: {
      session_id: session.id,
      turn_index: turnOrder,
      target_hsk_level: question?.level || 1,
      text: question?.hanzi || "",
      pinyin: question?.pinyin || "",
      audio_base64: null,
      audio_format: "audio/wav",
      source: "bank",
    },
  }
}

export const resumeSessionMock = async (
  { sessionId } = {},
  {
    delayMs = MOCK_LATENCY_MS,
    read = readActiveSession,
    readResult: readStoredResult = readResult,
    totalTurns = TOTAL_TURNS,
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

  const answeredTurnCount = countSubmittedTurns(session.turns, totalTurns)

  if (session.status === SESSION_STATUS.COMPLETED || !isUnfinishedSession(session) || answeredTurnCount >= totalTurns) {
    return {
      error: {
        status: 400,
        data: {
          code: "SESSION_ALREADY_COMPLETED",
          message: "Session is already completed.",
        },
      },
    }
  }

  const localResult = readStoredResult()
  const lastTestedAt =
    Number(localResult?.scoredAt) || Number(localResult?.adjustedAt) || null
  const eligibility = getRetakeEligibility({ lastTestedAt, now })
  if (eligibility.hasHistory && !eligibility.eligible) {
    return {
      error: {
        status: 403,
        data: {
          code: "COOLDOWN_ACTIVE",
          message: `Bạn cần đợi thêm ${eligibility.daysRemaining} ngày nữa để thi lại theo quy tắc 14 ngày Cooldown.`,
          days_remaining: eligibility.daysRemaining,
        },
      },
    }
  }

  const answeredCount = countSubmittedTurns(session.turns)
  return {
    data: {
      session,
      remainingTurns: Math.max(0, totalTurns - answeredCount),
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
    random = Math.random,
  } = {},
) => {
  await wait(delayMs)
  const session = read()
  if (!session || (sessionId && session.id !== sessionId)) {
    return {
      error: { status: 404, data: { message: "placement_session_not_found" } },
    }
  }

  if (session.status === SESSION_STATUS.COMPLETED) {
    return {
      error: {
        status: 400,
        data: {
          code: "SESSION_ALREADY_COMPLETED",
          message: "Session is already completed.",
        },
      },
    }
  }

  const effectiveTurn = order ?? countSubmittedTurns(session.turns) + 1
  const timestamp = typeof now === "function" ? now() : now

  const turn = {
    order: effectiveTurn,
    questionId: questionId || `q-${effectiveTurn}`,
    level: level ?? 1,
    transcript: transcript ?? "",
    durationMs: durationMs ?? 0,
    retryCount: retryCount ?? 0,
    passed: passed ?? true,
    submittedAt: timestamp,
  }

  const turns = upsertTurn(session.turns, turn)
  const isCompleted = turns.length >= TOTAL_TURNS
  const updatedSession = {
    ...session,
    turns,
    currentOrder: effectiveTurn,
    status: isCompleted ? SESSION_STATUS.COMPLETED : SESSION_STATUS.IN_PROGRESS,
    updatedAt: timestamp,
  }

  persist(updatedSession)

  const nextQuestion = isCompleted
    ? null
    : selectNextQuestion({
        targetBand: session.targetBand,
        turns,
        order: effectiveTurn + 1,
        random,
      })

  return {
    data: {
      accepted: true,
      turn,
      turns,
      isCompleted,
      nextQuestion,
      session: updatedSession,
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
    clear = clearActiveSession,
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
    answeredCount: countSubmittedTurns(turns),
  }
  persistResult(result)

  const completed = {
    ...session,
    status: SESSION_STATUS.COMPLETED,
    finalBand: result.band,
    updatedAt: timestamp,
  }
  persist(completed)
  clear()

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
  const result = readStoredResult()
  const activeSessionId = sessionId || session?.id || result?.sessionId
  if (!activeSessionId) {
    return {
      error: { status: 404, data: { message: "placement_session_not_found" } },
    }
  }

  if (!result || (sessionId && result.sessionId !== sessionId)) {
    return {
      error: { status: 404, data: { message: "placement_result_not_found" } },
    }
  }

  if (session?.selfAdjusted || result.selfAdjusted) {
    return {
      error: { status: 409, data: { message: "placement_adjust_locked" } },
    }
  }

  const aiBand = clampHsk(session?.finalBand ?? result.band)
  const { band: finalBand, applied } = applySelfAdjust({ band: aiBand, level })
  const timestamp = typeof now === "function" ? now() : now

  const updatedSession = session
    ? {
        ...session,
        finalBand,
        selfAdjusted: true,
        updatedAt: timestamp,
      }
    : null
  if (updatedSession) persist(updatedSession)

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

export const cancelSessionMock = async (
  { sessionId } = {},
  {
    delayMs = MOCK_LATENCY_MS,
    read = readActiveSession,
    clear = clearActiveSession,
  } = {},
) => {
  await wait(delayMs)
  const session = read()
  if (session && (!sessionId || session.id === sessionId)) {
    clear()
  }
  return {
    data: {
      session_id: sessionId || session?.id,
      status: SESSION_STATUS.CANCELLED,
    },
  }
}
