import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  adjustLevelReal,
  cancelSessionReal,
  createSessionReal,
  getActiveSessionReal,
  getQuestionReal,
  getRetakeStatusReal,
  resumeSessionReal,
  scoreSessionReal,
  submitTurnReal,
} from "./realAdapter"

describe("realAdapter", () => {
  let inMemorySession = null
  let inMemoryResult = null

  const mockRead = () => inMemorySession
  const mockPersist = (s) => {
    inMemorySession = s
  }
  const mockReadResult = () => inMemoryResult
  const mockPersistResult = (r) => {
    inMemoryResult = r
  }

  beforeEach(() => {
    inMemorySession = null
    inMemoryResult = null
  })

  it("createSessionReal makes POST /v1/placement/sessions/start and persists session", async () => {
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_12345",
        status: "in_progress",
        account_id: 101,
        seed_band: 2,
        current_turn: 1,
        total_turns: 5,
        expires_at: "2026-09-21T12:00:00Z",
        question: {
          turn_index: 1,
          target_hsk_level: 2,
          text: "你喜欢晴天还是雨天？",
          pinyin: "Nǐ xǐhuan qíngtiān háishi yǔtiān?",
          audio_base64: "UklGRiQAAABXQVZF",
          audio_format: "audio/wav",
          source: "bank",
        },
      },
    })

    const res = await createSessionReal(
      { seedBand: 2, voiceConsentGranted: true },
      { baseQuery: mockBaseQuery, persist: mockPersist },
    )

    expect(mockBaseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/placement/sessions/start",
        method: "POST",
        body: expect.objectContaining({ seed_band: 2, voice_consent_granted: true }),
      }),
      undefined,
      undefined,
    )
    expect(res.data.id).toBe("psess_12345")
    expect(res.data.initialQuestion.text).toBe("你喜欢晴天还是雨天？")
    expect(inMemorySession.id).toBe("psess_12345")
  })

  it("getQuestionReal fetches question for active session", async () => {
    inMemorySession = { id: "psess_12345" }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_12345",
        turn_index: 2,
        target_hsk_level: 3,
        text: "周末你一般喜欢做什么？",
        pinyin: "Zhōumò nǐ yìbān xǐhuan zuò shénme?",
        audio_base64: "BASE64WAV",
        audio_format: "audio/wav",
      },
    })

    const res = await getQuestionReal(
      { sessionId: "psess_12345" },
      { baseQuery: mockBaseQuery, read: mockRead },
    )

    expect(mockBaseQuery).toHaveBeenCalledWith(
      { url: "/v1/placement/sessions/psess_12345/question", method: "GET" },
      undefined,
      undefined,
    )
    expect(res.data.turn_index).toBe(2)
    expect(res.data.text).toBe("周末你一般喜欢做什么？")
  })

  it("submitTurnReal sends Multipart FormData to /score and handles intermediate turn", async () => {
    inMemorySession = { id: "psess_12345", targetBand: 1, turns: [] }
    const audioBlob = new Blob(["fake-audio-bytes"], { type: "audio/webm" })
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_12345",
        is_completed: false,
        turn_result: {
          turn_index: 1,
          transcript: "我喜欢学中文",
          accuracy_score: 85.0,
          fluency_score: 80.0,
          pronunciation_score: 82.0,
          next_probe_hsk_level: 2,
          running_floor: 1,
          running_ceiling: 2,
          speech_detected: true,
          words: [],
        },
      },
    })

    const res = await submitTurnReal(
      {
        sessionId: "psess_12345",
        turnIndex: 1,
        audioBlob,
        durationMs: 3200,
        retryCount: 0,
        skipped: false,
      },
      {
        baseQuery: mockBaseQuery,
        read: mockRead,
        persist: mockPersist,
        persistResult: mockPersistResult,
      },
    )

    expect(mockBaseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/placement/sessions/psess_12345/score",
        method: "POST",
      }),
      undefined,
      undefined,
    )
    expect(res.data.accepted).toBe(true)
    expect(res.data.turn.transcript).toBe("我喜欢学中文")
    expect(res.data.isCompleted).toBe(false)
    expect(inMemorySession.turns).toHaveLength(1)
  })

  it("submitTurnReal returns canRetry when speech_detected is false", async () => {
    inMemorySession = { id: "psess_12345", targetBand: 1, turns: [] }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_12345",
        speech_detected: false,
        can_retry: true,
        retry_count: 1,
        message: "Không phát hiện rõ giọng nói, vui lòng thử trả lời lại.",
      },
    })

    const res = await submitTurnReal(
      {
        sessionId: "psess_12345",
        turnIndex: 1,
        durationMs: 1500,
        retryCount: 0,
        skipped: false,
      },
      {
        baseQuery: mockBaseQuery,
        read: mockRead,
        persist: mockPersist,
      },
    )

    expect(res.data.accepted).toBe(false)
    expect(res.data.canRetry).toBe(true)
    expect(res.data.speechDetected).toBe(false)
    expect(res.data.retryCount).toBe(1)
    expect(inMemorySession.turns).toHaveLength(0)
  })

  it("submitTurnReal auto-heals when server returns 409 TURN_INDEX_MISMATCH", async () => {
    inMemorySession = { id: "psess_12345", targetBand: 1, turns: [] }
    const mockBaseQuery = vi
      .fn()
      .mockResolvedValueOnce({
        error: {
          status: 409,
          data: {
            detail: {
              code: "TURN_INDEX_MISMATCH",
              message: "Turn index mismatch",
              expected_turn: 1,
              provided_turn: 2,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          session_id: "psess_12345",
          is_completed: false,
          turn_result: {
            turn_index: 1,
            transcript: "我喜欢学中文",
            accuracy_score: 85.0,
          },
        },
      })

    const res = await submitTurnReal(
      {
        sessionId: "psess_12345",
        turnIndex: 2,
        durationMs: 2000,
        retryCount: 0,
      },
      {
        baseQuery: mockBaseQuery,
        read: mockRead,
        persist: mockPersist,
        persistResult: mockPersistResult,
      },
    )

    expect(mockBaseQuery).toHaveBeenCalledTimes(2)
    expect(res.data.accepted).toBe(true)
    expect(res.data.turn.order).toBe(1)
  })

  it("submitTurnReal completes session on turn 5 and normalizes final report", async () => {
    inMemorySession = { id: "psess_12345", targetBand: 2, turns: [] }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_12345",
        is_completed: true,
        turn_result: {
          turn_index: 5,
          transcript: "最后一句回答",
          accuracy_score: 90.0,
          fluency_score: 88.0,
          pronunciation_score: 89.0,
          next_probe_hsk_level: 3,
        },
        final_report: {
          final_hsk_level: 3,
          scores: {
            ahi_total: 3.2,
            pronunciation: 88.0,
            vocabulary: 80.0,
            grammar: 85.0,
            fluency: 82.0,
          },
          weaknesses: [],
          turn_count: 5,
        },
      },
    })

    const res = await submitTurnReal(
      { sessionId: "psess_12345", turnIndex: 5, durationMs: 4000, skipped: false },
      {
        baseQuery: mockBaseQuery,
        read: mockRead,
        persist: mockPersist,
        persistResult: mockPersistResult,
      },
    )

    expect(res.data.isCompleted).toBe(true)
    expect(res.data.result.band).toBe(3)
    expect(inMemorySession.status).toBe("completed")
    expect(inMemoryResult.band).toBe(3)
  })

  it("getActiveSessionReal maps active session correctly", async () => {
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        has_active_session: true,
        session: {
          session_id: "psess_active_999",
          status: "in_progress",
          seed_band: 2,
          current_turn: 3,
          total_turns: 5,
          turns: [
            { turn_index: 1, transcript: "answer 1", speech_duration_ms: 2000, answered_at: "2026-09-21T10:00:00Z" },
            { turn_index: 2, transcript: "", speech_duration_ms: 0, answered_at: null },
          ],
        },
      },
    })

    const res = await getActiveSessionReal({
      baseQuery: mockBaseQuery,
      persist: mockPersist,
      read: mockRead,
    })

    expect(res.data.id).toBe("psess_active_999")
    expect(res.data.currentOrder).toBe(3)
    expect(res.data.turns).toHaveLength(2)
    expect(res.data.turns[0].answeredAt).toBe(new Date("2026-09-21T10:00:00Z").getTime())
    expect(res.data.turns[0].submittedAt).toBe(new Date("2026-09-21T10:00:00Z").getTime())
    expect(res.data.turns[1].answeredAt).toBeNull()
    expect(res.data.turns[1].submittedAt).toBeNull()
  })

  // `useConversationLoop` loads turn 1 from `initialQuestion`
  // (hooks/useConversationLoop.js:407). Dropping it here makes the room call
  // GET /question and re-synthesise TTS (~1 s) before "Câu 1/5" can render.
  it("getActiveSessionReal keeps the first question of the same session", async () => {
    const initialQuestion = {
      turn_index: 1,
      text: "你好！请问你叫什么名字？",
      audio_base64: "Q1AUDIO",
    }
    inMemorySession = {
      id: "psess_active_999",
      turns: [],
      initialQuestion,
    }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        has_active_session: true,
        session: {
          session_id: "psess_active_999",
          status: "in_progress",
          seed_band: 2,
          current_turn: 1,
          total_turns: 5,
          turns: [],
        },
      },
    })

    await getActiveSessionReal({
      baseQuery: mockBaseQuery,
      persist: mockPersist,
      read: mockRead,
    })

    expect(inMemorySession.initialQuestion).toEqual(initialQuestion)
  })

  it("getActiveSessionReal does not carry the first question across sessions", async () => {
    inMemorySession = {
      id: "psess_old",
      turns: [],
      initialQuestion: { turn_index: 1, text: "旧问题" },
    }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        has_active_session: true,
        session: {
          session_id: "psess_new",
          status: "in_progress",
          seed_band: 2,
          current_turn: 1,
          total_turns: 5,
          turns: [],
        },
      },
    })

    await getActiveSessionReal({
      baseQuery: mockBaseQuery,
      persist: mockPersist,
      read: mockRead,
    })

    expect(inMemorySession.initialQuestion).toBeUndefined()
  })

  // Oracle: the resume button must reopen the server's pending turn, not the
  // locally cached position. GET /v1/placement/sessions/{id} returns
  // current_turn + current_question + turns[].answered_at
  // (catspeak-ai/src/catspeak_ai/read/placement/service.py:39-90); the client
  // used to discard that payload and navigate with the stale local session.
  it("resumeSessionReal adopts the server session into the local store", async () => {
    inMemorySession = {
      id: "psess_resume_2",
      status: "in_progress",
      currentOrder: 1,
      turns: [],
      initialQuestion: { turn_index: 1, text: "你昨天去哪儿了？" },
    }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_resume_2",
        status: "in_progress",
        seed_band: 3,
        current_turn: 2,
        total_turns: 5,
        current_question: { turn_index: 2, text: "你是哪国人？" },
        turns: [
          {
            turn_index: 1,
            question_text: "你昨天去哪儿了？",
            transcript: "我昨天去学校了",
            speech_duration_ms: 4000,
            answered_at: "2026-10-31T10:02:00Z",
          },
          {
            turn_index: 2,
            question_text: "你是哪国人？",
            transcript: "",
            speech_duration_ms: 0,
            answered_at: null,
          },
        ],
      },
    })

    await resumeSessionReal(
      { sessionId: "psess_resume_2" },
      { baseQuery: mockBaseQuery, read: mockRead, persist: mockPersist },
    )

    expect(inMemorySession.currentOrder).toBe(2)
    expect(inMemorySession.currentQuestion).toMatchObject({
      turn_index: 2,
      text: "你是哪国人？",
    })
    expect(inMemorySession.turns[0].submittedAt).toBe(
      new Date("2026-10-31T10:02:00Z").getTime(),
    )
    expect(inMemorySession.turns[1].submittedAt).toBeNull()
    expect(inMemorySession.initialQuestion).toEqual({
      turn_index: 1,
      text: "你昨天去哪儿了？",
    })
  })

  // Oracle: user ruling 2026-10-31 (work/placement-pause-expiry/state.md) —
  // F5 inside a paused room must keep the 30-minute pause deadline, otherwise
  // the reload silently resets the budget and the session stays resumable.
  it("resumeSessionReal keeps the local pause deadline across F5", async () => {
    const pauseStartedAt = Date.now() - 10 * 60 * 1000
    inMemorySession = {
      id: "psess_pause",
      status: "in_progress",
      pauseStartedAt,
      pauseSpentMs: 60_000,
      turns: [],
    }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_pause",
        status: "in_progress",
        seed_band: 3,
        current_turn: 2,
        total_turns: 5,
        turns: [],
      },
    })

    await resumeSessionReal(
      { sessionId: "psess_pause" },
      { baseQuery: mockBaseQuery, read: mockRead, persist: mockPersist },
    )

    expect(inMemorySession.pauseStartedAt).toBe(pauseStartedAt)
    expect(inMemorySession.pauseSpentMs).toBe(60_000)
  })

  it("getActiveSessionReal returns null when no active session", async () => {
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: { has_active_session: false, session: null },
    })

    const res = await getActiveSessionReal({
      baseQuery: mockBaseQuery,
      persist: mockPersist,
      read: mockRead,
    })

    expect(res.data).toBeNull()
  })

  it("getRetakeStatusReal queries /v1/placement/profile and returns cooldown", async () => {
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        account_id: 101,
        current_hsk_level: 3,
        cooldown: {
          can_retake: false,
          days_remaining: 10,
          eligible_at: "2026-10-01T12:00:00Z",
          last_tested_at: "2026-09-17T12:00:00Z",
        },
      },
    })

    const res = await getRetakeStatusReal({
      baseQuery: mockBaseQuery,
      readResult: mockReadResult,
    })

    expect(mockBaseQuery).toHaveBeenCalledWith(
      { url: "/v1/placement/profile", method: "GET" },
      undefined,
      undefined,
    )
    expect(res.data.eligible).toBe(false)
    expect(res.data.daysRemaining).toBe(10)
    expect(res.data.currentHskLevel).toBe(3)
  })

  it("adjustLevelReal calls POST /adjust-level and updates result", async () => {
    inMemorySession = { id: "psess_12345", finalBand: 3 }
    inMemoryResult = { sessionId: "psess_12345", band: 3, selfAdjusted: false }

    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        session_id: "psess_12345",
        original_hsk_level: 3,
        new_hsk_level: 4,
        self_adjusted: true,
        message: "Adjusted to 4",
      },
    })

    const res = await adjustLevelReal(
      { sessionId: "psess_12345", targetHskLevel: 4 },
      {
        baseQuery: mockBaseQuery,
        read: mockRead,
        persist: mockPersist,
        readResult: mockReadResult,
        persistResult: mockPersistResult,
      },
    )

    expect(mockBaseQuery).toHaveBeenCalledWith(
      {
        url: "/v1/placement/sessions/psess_12345/adjust-level",
        method: "POST",
        body: { target_hsk_level: 4 },
      },
      undefined,
      undefined,
    )
    expect(res.data.band).toBe(4)
    expect(res.data.selfAdjusted).toBe(true)
    expect(inMemoryResult.band).toBe(4)
    expect(inMemorySession.finalBand).toBe(4)
  })

  it("scoreSessionReal reads completed session and result", async () => {
    inMemorySession = { id: "psess_12345", finalBand: 3 }
    inMemoryResult = { sessionId: "psess_12345", band: 3 }

    const res = await scoreSessionReal({
      read: mockRead,
      readResult: mockReadResult,
    })

    expect(res.data.result.band).toBe(3)
  })

  it("cancelSessionReal makes POST /v1/placement/sessions/{id}/cancel and clears session", async () => {
    inMemorySession = { id: "psess_12345" }
    let cleared = false
    const mockClear = () => {
      cleared = true
      inMemorySession = null
    }

    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: { session_id: "psess_12345", status: "cancelled" },
    })

    const res = await cancelSessionReal(
      { sessionId: "psess_12345" },
      { baseQuery: mockBaseQuery, read: mockRead, clear: mockClear },
    )

    expect(mockBaseQuery).toHaveBeenCalledWith(
      { url: "/v1/placement/sessions/psess_12345/cancel", method: "POST" },
      undefined,
      undefined,
    )
    expect(res.data.status).toBe("cancelled")
    expect(cleared).toBe(true)
    expect(inMemorySession).toBeNull()
  })
})

