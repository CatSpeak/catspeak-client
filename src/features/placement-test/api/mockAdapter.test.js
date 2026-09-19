import { describe, expect, it, vi } from "vitest"
import { SESSION_STATUS } from "../constants/session"
import {
  SCORING_FAILURE_FLAG_KEY,
  adjustLevelMock,
  buildSession,
  createSessionMock,
  isScoringFailureForced,
  scoreSessionMock,
  submitTurnMock,
} from "./mockAdapter"

describe("buildSession", () => {
  it("builds the persisted session shape", () => {
    const session = buildSession({
      targetBand: "hsk3_4",
      studentId: "student-1",
      now: () => 1710000000000,
      random: () => 0.8891,
      year: 2026,
    })

    expect(session).toMatchObject({
      studentId: "student-1",
      status: SESSION_STATUS.IN_PROGRESS,
      currentOrder: 0,
      targetBand: "hsk3_4",
      finalBand: null,
      selfAdjusted: false,
      turns: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    })
    expect(session.code).toBe("CS-PT-2026-8891")
    expect(typeof session.id).toBe("string")
  })
})

describe("createSessionMock", () => {
  it("resolves with the session and persists it", async () => {
    const persist = vi.fn()

    const result = await createSessionMock(
      { targetBand: "hsk5_6", studentId: "student-2" },
      { delayMs: 0, persist, now: () => 42, random: () => 0.5, year: 2026 },
    )

    expect(result.data.targetBand).toBe("hsk5_6")
    expect(result.data.studentId).toBe("student-2")
    expect(persist).toHaveBeenCalledTimes(1)
    expect(persist).toHaveBeenCalledWith(result.data)
  })
})

describe("submitTurnMock", () => {
  const baseSession = () => ({
    ...buildSession({ targetBand: "hsk3_4", now: () => 1, random: () => 0.5 }),
    id: "session-1",
  })

  it("appends the turn, updates currentOrder and persists the session", async () => {
    const session = baseSession()
    const persist = vi.fn()

    const result = await submitTurnMock(
      {
        sessionId: "session-1",
        order: 1,
        questionId: "q1-name",
        level: 1,
        transcript: "我叫小明",
        durationMs: 3200,
        retryCount: 1,
      },
      { delayMs: 0, persist, read: () => session, now: () => 999 },
    )

    expect(result.data.accepted).toBe(true)
    expect(result.data.turn).toMatchObject({
      order: 1,
      questionId: "q1-name",
      level: 1,
      transcript: "我叫小明",
      durationMs: 3200,
      retryCount: 1,
    })
    expect(result.data.session.currentOrder).toBe(1)
    expect(result.data.session.turns).toHaveLength(1)
    expect(persist).toHaveBeenCalledWith(result.data.session)
  })

  it("replaces an existing turn with the same order", async () => {
    const session = {
      ...baseSession(),
      turns: [
        { order: 1, transcript: "第一个答案" },
        { order: 2, transcript: "第二个答案" },
      ],
    }

    const result = await submitTurnMock(
      { sessionId: "session-1", order: 2, transcript: "更新后的答案" },
      { delayMs: 0, persist: vi.fn(), read: () => session, now: () => 5 },
    )

    expect(result.data.session.turns).toHaveLength(2)
    expect(result.data.session.turns[1].transcript).toBe("更新后的答案")
  })

  it("rejects when there is no active session", async () => {
    const result = await submitTurnMock(
      { sessionId: "missing", order: 1 },
      { delayMs: 0, persist: vi.fn(), read: () => null, now: () => 5 },
    )

    expect(result.error.status).toBe(404)
  })
})

describe("isScoringFailureForced", () => {
  it("reads the forced-failure flag from storage", () => {
    expect(
      isScoringFailureForced({ storage: { getItem: () => "1" } }),
    ).toBe(true)
    expect(
      isScoringFailureForced({ storage: { getItem: () => null } }),
    ).toBe(false)
  })

  it("uses the documented storage key", () => {
    const getItem = vi.fn(() => "1")
    isScoringFailureForced({ storage: { getItem } })
    expect(getItem).toHaveBeenCalledWith(SCORING_FAILURE_FLAG_KEY)
  })
})

describe("scoreSessionMock", () => {
  const scoredSession = () => ({
    ...buildSession({ targetBand: "hsk3_4", now: () => 1, random: () => 0.5 }),
    id: "session-1",
    code: "CS-PT-2026-8891",
    turns: [
      {
        order: 1,
        questionId: "q1-name",
        level: 3,
        transcript: "我喜欢学习中文",
        durationMs: 4200,
        retryCount: 0,
      },
    ],
  })

  it("scores the session, persists the result and completes the session", async () => {
    const persist = vi.fn()
    const persistResult = vi.fn()

    const result = await scoreSessionMock(
      { sessionId: "session-1" },
      {
        delayMs: 0,
        read: () => scoredSession(),
        persist,
        persistResult,
        forcedFailure: () => false,
        now: () => 123,
      },
    )

    expect(result.data.result).toMatchObject({
      sessionId: "session-1",
      code: "CS-PT-2026-8891",
      answeredCount: 1,
      scoredAt: 123,
    })
    expect(typeof result.data.result.band).toBe("number")
    expect(persistResult).toHaveBeenCalledWith(result.data.result)
    expect(result.data.session.status).toBe(SESSION_STATUS.COMPLETED)
    expect(result.data.session.finalBand).toBe(result.data.result.band)
    expect(persist).toHaveBeenCalledWith(result.data.session)
  })

  it("rejects when there is no active session", async () => {
    const result = await scoreSessionMock(
      { sessionId: "missing" },
      { delayMs: 0, read: () => null, persistResult: vi.fn() },
    )

    expect(result.error.status).toBe(404)
  })

  it("fails with 503 when an explicit fail flag is passed", async () => {
    const persistResult = vi.fn()

    const result = await scoreSessionMock(
      { sessionId: "session-1", fail: true },
      {
        delayMs: 0,
        read: () => scoredSession(),
        persist: vi.fn(),
        persistResult,
        forcedFailure: () => false,
        now: () => 1,
      },
    )

    expect(result.error.status).toBe(503)
    expect(persistResult).not.toHaveBeenCalled()
  })

  it("fails with 503 when forced failure is set", async () => {
    const result = await scoreSessionMock(
      { sessionId: "session-1" },
      {
        delayMs: 0,
        read: () => scoredSession(),
        persist: vi.fn(),
        persistResult: vi.fn(),
        forcedFailure: () => true,
        now: () => 1,
      },
    )

    expect(result.error.status).toBe(503)
  })
})

describe("adjustLevelMock", () => {
  const adjustedSession = (extra = {}) => ({
    ...buildSession({ targetBand: "hsk3_4", now: () => 1, random: () => 0.5 }),
    id: "session-1",
    status: SESSION_STATUS.COMPLETED,
    finalBand: 3,
    selfAdjusted: false,
    ...extra,
  })

  const scoredResult = (extra = {}) => ({
    sessionId: "session-1",
    code: "CS-PT-2026-8891",
    band: 3,
    ...extra,
  })

  it("applies the delta clamped to ±1 and persists both records", async () => {
    const session = adjustedSession()
    const result = scoredResult()
    const persist = vi.fn()
    const persistResult = vi.fn()

    const response = await adjustLevelMock(
      { sessionId: "session-1", level: 6 },
      {
        delayMs: 0,
        read: () => session,
        persist,
        readResult: () => result,
        persistResult,
        now: () => 1710000000000,
      },
    )

    expect(response.data.band).toBe(4)
    expect(response.data.applied).toBe(true)
    expect(response.data.session).toMatchObject({
      finalBand: 4,
      selfAdjusted: true,
      updatedAt: 1710000000000,
    })
    expect(response.data.result).toMatchObject({
      band: 4,
      aiBand: 3,
      selfAdjusted: true,
      adjustedAt: 1710000000000,
    })
    expect(persist).toHaveBeenCalledWith(response.data.session)
    expect(persistResult).toHaveBeenCalledWith(response.data.result)
  })

  it("clamps the result to HSK 1-6", async () => {
    const response = await adjustLevelMock(
      { sessionId: "session-1", level: 0 },
      {
        delayMs: 0,
        read: () => adjustedSession({ finalBand: 1 }),
        persist: vi.fn(),
        readResult: () => scoredResult({ band: 1 }),
        persistResult: vi.fn(),
        now: () => 1,
      },
    )

    expect(response.data.band).toBe(1)
    expect(response.data.applied).toBe(false)
    expect(response.data.selfAdjusted).toBe(true)
  })

  it("locks after the one-time adjustment and rejects a second call", async () => {
    const persist = vi.fn()
    const persistResult = vi.fn()

    const response = await adjustLevelMock(
      { sessionId: "session-1", level: 4 },
      {
        delayMs: 0,
        read: () => adjustedSession({ selfAdjusted: true }),
        persist,
        readResult: () => scoredResult(),
        persistResult,
        now: () => 1,
      },
    )

    expect(response.error.status).toBe(409)
    expect(persist).not.toHaveBeenCalled()
    expect(persistResult).not.toHaveBeenCalled()
  })

  it("locks even when the keep option leaves the band unchanged", async () => {
    const response = await adjustLevelMock(
      { sessionId: "session-1", level: 3 },
      {
        delayMs: 0,
        read: () => adjustedSession(),
        persist: vi.fn(),
        readResult: () => scoredResult(),
        persistResult: vi.fn(),
        now: () => 1,
      },
    )

    expect(response.data.band).toBe(3)
    expect(response.data.applied).toBe(false)
    expect(response.data.result.selfAdjusted).toBe(true)
  })

  it("rejects when there is no persisted result", async () => {
    const response = await adjustLevelMock(
      { sessionId: "session-1", level: 4 },
      {
        delayMs: 0,
        read: () => adjustedSession(),
        persist: vi.fn(),
        readResult: () => null,
        persistResult: vi.fn(),
      },
    )

    expect(response.error.status).toBe(404)
  })

  it("rejects when there is no active session", async () => {
    const response = await adjustLevelMock(
      { sessionId: "missing", level: 4 },
      {
        delayMs: 0,
        read: () => null,
        persist: vi.fn(),
        readResult: () => scoredResult(),
        persistResult: vi.fn(),
      },
    )

    expect(response.error.status).toBe(404)
  })
})
