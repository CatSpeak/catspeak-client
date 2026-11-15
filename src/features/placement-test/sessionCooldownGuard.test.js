import { beforeEach, describe, expect, it, vi } from "vitest"
import { SESSION_STATUS } from "./constants/session"
import {
  createSessionMock,
  getQuestionMock,
  resumeSessionMock,
  scoreSessionMock,
} from "./api/mockAdapter"
import { resumeSessionReal, scoreSessionReal } from "./api/realAdapter"
import { isUnfinishedSession } from "./utils/sessionLifecycle"

describe("Placement Test Cooldown & Completed Session Guards", () => {
  let memoryStorage = {}

  const mockRead = () => memoryStorage.activeSession || null
  const mockPersist = (s) => {
    memoryStorage.activeSession = s
  }
  const mockClear = () => {
    delete memoryStorage.activeSession
  }
  const mockReadResult = () => memoryStorage.result || null
  const mockPersistResult = (r) => {
    memoryStorage.result = r
  }

  beforeEach(() => {
    memoryStorage = {}
  })

  describe("Bug Repro: Completed session in cooldown must not allow re-entering or continuing room", () => {
    it("1. completed session should be recognized as NOT unfinished/resumable", () => {
      const completedSession = {
        id: "sess_done",
        status: SESSION_STATUS.COMPLETED,
        currentOrder: 5,
        turns: [
          { order: 1, transcript: "t1" },
          { order: 2, transcript: "t2" },
          { order: 3, transcript: "t3" },
          { order: 4, transcript: "t4" },
          { order: 5, transcript: "t5" },
        ],
      }
      expect(isUnfinishedSession(completedSession)).toBe(false)
    })

    it("2. resumeSessionMock must reject completed session with HTTP 4xx, not 200 OK", async () => {
      const completedSession = {
        id: "sess_done",
        status: SESSION_STATUS.COMPLETED,
        currentOrder: 5,
        turns: [
          { order: 1, transcript: "t1" },
          { order: 2, transcript: "t2" },
          { order: 3, transcript: "t3" },
          { order: 4, transcript: "t4" },
          { order: 5, transcript: "t5" },
        ],
      }

      const res = await resumeSessionMock(
        { sessionId: "sess_done" },
        { delayMs: 0, read: () => completedSession },
      )

      // Expected: rejects with HTTP 400 or 403
      expect(res.error).toBeDefined()
      expect([400, 403]).toContain(res.error?.status)
    })

    it("3. createSessionMock must reject with 403 COOLDOWN_ACTIVE when user is cooling down", async () => {
      const scoredAt = 1710000000000
      const now = scoredAt + 2 * 24 * 60 * 60 * 1000 // 2 days later, 12 days remaining

      const res = await createSessionMock(
        { targetBand: "hsk3_4", studentId: "std_1" },
        {
          delayMs: 0,
          readResult: () => ({ scoredAt, band: 3 }),
          now: () => now,
        },
      )

      // Expected: HTTP 403 COOLDOWN_ACTIVE
      expect(res.error).toBeDefined()
      expect(res.error?.status).toBe(403)
      expect(res.error?.data?.code).toBe("COOLDOWN_ACTIVE")
    })

    it("4. getQuestionMock must reject with 400 SESSION_ALREADY_COMPLETED when session is completed", async () => {
      const completedSession = {
        id: "sess_done",
        status: SESSION_STATUS.COMPLETED,
        turns: [{ order: 1 }, { order: 2 }, { order: 3 }, { order: 4 }, { order: 5 }],
      }

      const res = await getQuestionMock({
        sessionId: "sess_done",
        delayMs: 0,
        read: () => completedSession,
      })

      // Expected: HTTP 400 SESSION_ALREADY_COMPLETED
      expect(res.error).toBeDefined()
      expect(res.error?.status).toBe(400)
    })

    it("5. scoreSessionReal and scoreSessionMock should clear active session on completion", async () => {
      memoryStorage.activeSession = {
        id: "sess_done",
        status: SESSION_STATUS.COMPLETED,
        finalBand: 3,
      }
      memoryStorage.result = {
        sessionId: "sess_done",
        band: 3,
        scoredAt: Date.now(),
      }

      await scoreSessionReal({
        read: mockRead,
        clear: mockClear,
        readResult: mockReadResult,
      })

      // Active session in storage should be cleared once scoring is finalized
      expect(mockRead()).toBeNull()

      memoryStorage.activeSession = {
        id: "sess_done_2",
        status: SESSION_STATUS.IN_PROGRESS,
        turns: [],
      }
      await scoreSessionMock(
        { sessionId: "sess_done_2" },
        {
          delayMs: 0,
          read: mockRead,
          clear: mockClear,
          persist: mockPersist,
          persistResult: mockPersistResult,
          now: () => 12345,
        },
      )
      expect(mockRead()).toBeNull()
    })

    it("6. resumeSessionReal rejects completed session with HTTP 400", async () => {
      memoryStorage.activeSession = { id: "psess_completed" }
      const mockBaseQuery = vi.fn().mockResolvedValue({
        data: {
          session_id: "psess_completed",
          status: "completed",
          current_turn: 5,
        },
      })

      const res = await resumeSessionReal(
        { sessionId: "psess_completed" },
        {
          baseQuery: mockBaseQuery,
          read: mockRead,
          clear: mockClear,
        },
      )

      expect(res.error).toBeDefined()
      expect(res.error?.status).toBe(400)
      expect(res.error?.data?.code).toBe("SESSION_ALREADY_COMPLETED")
      expect(mockRead()).toBeNull()
    })
  })
})
