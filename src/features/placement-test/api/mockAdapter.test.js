import { describe, expect, it, vi } from "vitest"
import { SESSION_STATUS } from "../constants/session"
import { buildSession, createSessionMock, submitTurnMock } from "./mockAdapter"

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
