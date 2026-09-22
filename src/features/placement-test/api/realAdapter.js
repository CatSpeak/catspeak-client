/**
 * REST API Adapter cho Placement Test Subsystem (catspeak-ai v2.0).
 *
 * Tích hợp trọn vẹn các endpoints:
 *   - createSessionReal:    POST /v1/placement/sessions/start
 *   - getQuestionReal:      GET  /v1/placement/sessions/{id}/question
 *   - submitTurnReal:       POST /v1/placement/sessions/{id}/score
 *   - getActiveSessionReal: GET  /v1/placement/sessions/active
 *   - getRetakeStatusReal:  GET  /v1/placement/profile
 *   - adjustLevelReal:      POST /v1/placement/sessions/{id}/adjust-level
 *   - scoreSessionReal:     Hoàn tất & đồng bộ kết quả
 */
import { SESSION_STATUS } from "../constants/session"
import { normalizeServerResult } from "../utils/result"
import {
  clearActiveSession,
  readActiveSession,
  readResult,
  saveActiveSession,
  saveResult,
} from "../utils/sessionStorage"
import { upsertTurn } from "../utils/turns"
import { getRetakeEligibility } from "../utils/cooldown"

/** Bật/tắt đường máy chủ. Đặt "0" trong .env để quay lại mock hoàn toàn. */
export const USE_REAL_ENGINE =
  import.meta.env.VITE_PLACEMENT_USE_REAL_ENGINE !== "0"

const SESSIONS_START_URL = "/v1/placement/sessions/start"
const SESSIONS_ACTIVE_URL = "/v1/placement/sessions/active"
const SESSIONS_PROFILE_URL = "/v1/placement/profile"

const notFound = () => ({
  error: { status: 404, data: { message: "placement_session_not_found" } },
})

const normalizeError = (error) => {
  const status = Number(error?.status)
  if (status === 401 || status === 403 || status === 409 || status === 410) {
    return { error }
  }
  return {
    error: {
      status: status === 500 ? 503 : status || 503,
      data: { message: "placement_request_failed", detail: error?.data },
    },
  }
}

export const parseSeedBand = (band) => {
  if (typeof band === "number") return Math.max(1, Math.min(6, band))
  if (band === "hsk1_2") return 1
  if (band === "hsk3_4") return 3
  if (band === "hsk5_6") return 5
  const parsed = parseInt(String(band || "").replace(/\D/g, ""), 10)
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 6 ? parsed : 1
}

/** 1. Khởi tạo phiên thi: POST /v1/placement/sessions/start */
export const createSessionReal = async (
  { targetBand = 1, seedBand, voiceConsentGranted = true, forceRetake = true, activeTabToken } = {},
  { baseQuery, api, extraOptions, persist = saveActiveSession } = {},
) => {
  const effectiveSeedBand = parseSeedBand(seedBand ?? targetBand)
  const body = {
    seed_band: effectiveSeedBand,
    voice_consent_granted: Boolean(voiceConsentGranted),
    force_retake: true,
    active_tab_token: activeTabToken ?? null,
  }

  const response = await baseQuery(
    { url: SESSIONS_START_URL, method: "POST", body },
    api,
    extraOptions,
  )
  if (response.error) return normalizeError(response.error)

  const data = response.data || {}
  const now = Date.now()
  const session = {
    id: data.session_id,
    code: data.session_id,
    status: SESSION_STATUS.IN_PROGRESS,
    currentOrder: data.current_turn || 1,
    targetBand: data.seed_band || effectiveSeedBand,
    finalBand: null,
    selfAdjusted: false,
    createdAt: now,
    updatedAt: now,
    expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : now + 24 * 3600 * 1000,
    turns: [],
    initialQuestion: data.question || null,
  }

  persist(session)
  return { data: session }
}

/** 2. Lấy câu hỏi hiện tại: GET /v1/placement/sessions/{id}/question */
export const getQuestionReal = async (
  { sessionId } = {},
  { baseQuery, api, extraOptions, read = readActiveSession } = {},
) => {
  const session = read()
  const activeSessionId = sessionId || session?.id
  if (!activeSessionId) return notFound()

  const response = await baseQuery(
    { url: `/v1/placement/sessions/${activeSessionId}/question`, method: "GET" },
    api,
    extraOptions,
  )
  if (response.error) return normalizeError(response.error)
  return { data: response.data }
}

/** 3. Nộp audio trả lời & chấm điểm: POST /v1/placement/sessions/{id}/score */
export const submitTurnReal = async (
  { sessionId, turnIndex, order, audioBlob, durationMs, retryCount, skipped } = {},
  {
    baseQuery,
    api,
    extraOptions,
    read = readActiveSession,
    persist = saveActiveSession,
    persistResult = saveResult,
  } = {},
) => {
  const session = read()
  const activeSessionId = sessionId || session?.id
  if (!session || (sessionId && session.id !== sessionId)) return notFound()

  const turnOrder = Number(turnIndex ?? order) || (session.turns?.length || 0) + 1
  const formData = new FormData()
  formData.append("turn_index", String(turnOrder))
  formData.append("speech_duration_ms", String(Math.max(0, Number(durationMs) || 0)))
  formData.append("retry_count", String(Number(retryCount) || 0))
  formData.append("skipped", String(Boolean(skipped)))

  if (audioBlob && !skipped) {
    const ext = audioBlob.type?.includes("wav")
      ? "wav"
      : audioBlob.type?.includes("mp4")
        ? "mp4"
        : "webm"
    formData.append("audio_file", audioBlob, `turn_${turnOrder}.${ext}`)
  }

  let effectiveTurn = turnOrder
  let response = await baseQuery(
    {
      url: `/v1/placement/sessions/${activeSessionId}/score`,
      method: "POST",
      body: formData,
    },
    api,
    extraOptions,
  )

  // Auto-heal turn index mismatch if server reported expected_turn
  if (
    response.error?.status === 409 &&
    response.error?.data?.detail?.code === "TURN_INDEX_MISMATCH"
  ) {
    const expectedTurn = Number(response.error.data?.detail?.expected_turn)
    if (
      Number.isFinite(expectedTurn) &&
      expectedTurn > 0 &&
      expectedTurn !== turnOrder
    ) {
      effectiveTurn = expectedTurn
      const retryFormData = new FormData()
      retryFormData.append("turn_index", String(expectedTurn))
      retryFormData.append(
        "speech_duration_ms",
        String(Math.max(0, Number(durationMs) || 0)),
      )
      retryFormData.append("retry_count", String(Number(retryCount) || 0))
      retryFormData.append("skipped", String(Boolean(skipped)))
      if (audioBlob && !skipped) {
        const ext = audioBlob.type?.includes("wav")
          ? "wav"
          : audioBlob.type?.includes("mp4")
            ? "mp4"
            : "webm"
        retryFormData.append(
          "audio_file",
          audioBlob,
          `turn_${expectedTurn}.${ext}`,
        )
      }
      response = await baseQuery(
        {
          url: `/v1/placement/sessions/${activeSessionId}/score`,
          method: "POST",
          body: retryFormData,
        },
        api,
        extraOptions,
      )
    }
  }

  if (response.error) return normalizeError(response.error)

  const payload = response.data || {}

  if (payload.speech_detected === false && payload.can_retry) {
    return {
      data: {
        accepted: false,
        speechDetected: false,
        canRetry: true,
        retryCount: payload.retry_count ?? (Number(retryCount) || 0) + 1,
        message:
          payload.message ||
          "Không phát hiện rõ giọng nói, vui lòng thử trả lời lại.",
        session,
        isCompleted: false,
      },
    }
  }

  const turnResult = payload.turn_result || {}
  const timestamp = Date.now()

  const turn = {
    order: effectiveTurn,
    questionId: `turn_${effectiveTurn}`,
    level: Number(turnResult.next_probe_hsk_level) || Number(session.targetBand) || 1,
    transcript: typeof turnResult.transcript === "string" ? turnResult.transcript : "",
    durationMs: Number(durationMs) || 0,
    retryCount: Number(retryCount) || 0,
    passed: Number(turnResult.accuracy_score || 0) >= 60,
    accuracyScore: turnResult.accuracy_score,
    fluencyScore: turnResult.fluency_score,
    pronunciationScore: turnResult.pronunciation_score,
    words: turnResult.words || [],
    submittedAt: timestamp,
  }

  const turns = upsertTurn(session.turns, turn)
  const isCompleted = Boolean(payload.is_completed)

  let finalResult = null
  if (isCompleted && payload.final_report) {
    finalResult = normalizeServerResult(
      { ...payload.final_report, session_id: activeSessionId },
      { session },
    )
    persistResult(finalResult)
  }

  const updatedSession = {
    ...session,
    turns,
    currentOrder: Math.max(session.currentOrder || 0, turn.order),
    runningFloor: turnResult.running_floor ?? session.runningFloor ?? null,
    runningCeiling: turnResult.running_ceiling ?? session.runningCeiling ?? null,
    status: isCompleted ? SESSION_STATUS.COMPLETED : SESSION_STATUS.IN_PROGRESS,
    finalBand: finalResult ? finalResult.band : session.finalBand,
    updatedAt: timestamp,
  }
  persist(updatedSession)

  return {
    data: {
      accepted: true,
      turn,
      turnResult,
      isCompleted,
      finalReport: payload.final_report || null,
      result: finalResult,
      session: updatedSession,
      status: updatedSession.status,
    },
  }
}

/** 4. Kiểm tra phiên dang dở trong 24h: GET /v1/placement/sessions/active */
export const getActiveSessionReal = async ({
  baseQuery,
  api,
  extraOptions,
  persist = saveActiveSession,
  read = readActiveSession,
} = {}) => {
  const response = await baseQuery(
    { url: SESSIONS_ACTIVE_URL, method: "GET" },
    api,
    extraOptions,
  )
  if (response.error) {
    const local = read()
    return { data: local || null }
  }

  const data = response.data || {}
  if (!data.has_active_session || !data.session) {
    return { data: null }
  }

  const s = data.session
  const mappedSession = {
    id: s.session_id,
    code: s.session_id,
    status: s.status === "completed" ? SESSION_STATUS.COMPLETED : SESSION_STATUS.IN_PROGRESS,
    currentOrder: s.current_turn || 1,
    totalTurns: s.total_turns || 5,
    targetBand: s.seed_band || 1,
    finalBand: s.final_hsk_level ?? null,
    selfAdjusted: Boolean(s.self_adjusted),
    createdAt: s.started_at ? new Date(s.started_at).getTime() : Date.now(),
    updatedAt: Date.now(),
    expiresAt: s.expires_at ? new Date(s.expires_at).getTime() : Date.now() + 24 * 3600 * 1000,
    currentQuestion: s.current_question || null,
    turns: Array.isArray(s.turns)
      ? s.turns.map((t) => ({
          order: t.turn_index,
          questionId: `turn_${t.turn_index}`,
          level: t.question_hsk_level || 1,
          questionText: t.question_text,
          questionPinyin: t.question_pinyin,
          transcript: t.transcript || "",
          durationMs: t.speech_duration_ms || 0,
          retryCount: t.retry_count || 0,
          answeredAt: t.answered_at ? new Date(t.answered_at).getTime() : null,
          submittedAt: t.answered_at ? new Date(t.answered_at).getTime() : null,
        }))
      : [],
  }

  persist(mappedSession)
  return { data: mappedSession }
}

/** 5. Xem Profile HSK & Cooldown 14 ngày: GET /v1/placement/profile */
export const getRetakeStatusReal = async ({
  baseQuery,
  api,
  extraOptions,
  readResult: readStoredResult = readResult,
} = {}) => {
  const response = await baseQuery(
    { url: SESSIONS_PROFILE_URL, method: "GET" },
    api,
    extraOptions,
  )
  if (response.error) {
    const localResult = readStoredResult()
    const lastTestedAt = Number(localResult?.scoredAt) || Number(localResult?.adjustedAt) || null
    const eligibility = getRetakeEligibility({ lastTestedAt })
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
        currentHskLevel: localResult?.band ?? null,
      },
    }
  }

  const data = response.data || {}
  const cd = data.cooldown || {}
  const lastTestedAt = cd.last_tested_at ? new Date(cd.last_tested_at).getTime() : null
  const eligibleAt = cd.eligible_at ? new Date(cd.eligible_at).getTime() : null
  const eligibility = getRetakeEligibility({ lastTestedAt, eligibleAt, daysRemaining: cd.days_remaining })

  return {
    data: {
      eligible: Boolean(cd.can_retake),
      lastTestedAt,
      eligibleRetakeAt: eligibleAt,
      daysRemaining: cd.days_remaining ?? eligibility.daysRemaining,
      daysElapsed: eligibility.daysElapsed,
      progress: eligibility.progress,
      totalDays: 14,
      hasHistory: Boolean(lastTestedAt || data.current_hsk_level),
      currentHskLevel: data.current_hsk_level ?? null,
      evaluatedAt: data.evaluated_at ?? null,
    },
  }
}

/** 6. Tự điều chỉnh ±1 HSK level: POST /v1/placement/sessions/{id}/adjust-level */
export const adjustLevelReal = async (
  { sessionId, level, targetHskLevel } = {},
  {
    baseQuery,
    api,
    extraOptions,
    read = readActiveSession,
    persist = saveActiveSession,
    readResult: readStoredResult = readResult,
    persistResult = saveResult,
  } = {},
) => {
  const session = read()
  const activeSessionId = sessionId || session?.id
  const targetLevel = Number(targetHskLevel ?? level)
  if (!activeSessionId) return notFound()

  const response = await baseQuery(
    {
      url: `/v1/placement/sessions/${activeSessionId}/adjust-level`,
      method: "POST",
      body: { target_hsk_level: targetLevel },
    },
    api,
    extraOptions,
  )
  if (response.error) return normalizeError(response.error)

  const payload = response.data || {}
  const newLevel = payload.new_hsk_level ?? targetLevel
  const timestamp = Date.now()

  const currentResult = readStoredResult()
  const updatedResult = currentResult
    ? {
        ...currentResult,
        band: newLevel,
        selfAdjusted: true,
        adjustedAt: timestamp,
      }
    : null
  if (updatedResult) persistResult(updatedResult)

  const updatedSession = session
    ? {
        ...session,
        finalBand: newLevel,
        selfAdjusted: true,
        updatedAt: timestamp,
      }
    : null
  if (updatedSession) persist(updatedSession)

  return {
    data: {
      session: updatedSession,
      result: updatedResult,
      band: newLevel,
      applied: true,
      selfAdjusted: true,
      message: payload.message || "HSK level successfully adjusted.",
    },
  }
}

/** 7. Hoàn tất & đọc kết quả bài thi */
export const scoreSessionReal = async (
  { sessionId } = {},
  {
    read = readActiveSession,
    readResult: readStoredResult = readResult,
  } = {},
) => {
  const session = read()
  const result = readStoredResult()
  if (!session && !result) return notFound()

  return {
    data: {
      result: result || { band: session?.finalBand || 1, sessionId: session?.id },
      session,
    },
  }
}

/** 8. Hủy phiên thi: POST /v1/placement/sessions/{id}/cancel */
export const cancelSessionReal = async (
  { sessionId } = {},
  {
    baseQuery,
    api,
    extraOptions,
    read = readActiveSession,
    clear = clearActiveSession,
  } = {},
) => {
  const session = read()
  const activeSessionId = sessionId || session?.id
  if (!activeSessionId) {
    clear()
    return { data: { success: true, status: SESSION_STATUS.CANCELLED } }
  }

  const response = await baseQuery(
    {
      url: `/v1/placement/sessions/${activeSessionId}/cancel`,
      method: "POST",
    },
    api,
    extraOptions,
  )

  clear()

  if (response.error) {
    if (response.error.status === 404 || response.error.status === 410) {
      return {
        data: {
          session_id: activeSessionId,
          status: SESSION_STATUS.CANCELLED,
        },
      }
    }
    return normalizeError(response.error)
  }

  return { data: response.data }
}

