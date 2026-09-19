import { describe, expect, it, vi } from "vitest"
import { SESSION_STATUS } from "../constants/session"
import { buildSession, createSessionMock } from "./mockAdapter"

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
