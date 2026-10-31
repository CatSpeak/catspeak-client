import { beforeEach, describe, expect, it, vi } from "vitest"
import { getActiveSessionReal, submitTurnReal } from "./api/realAdapter"
import { getQuestionMock } from "./api/mockAdapter"
import {
  SESSION_LIFECYCLE_KIND,
  getSessionLifecycle,
} from "./utils/sessionLifecycle"

// Oracle: the server stamps `answered_at` only when a turn is submitted
// (catspeak-ai/src/catspeak_ai/write/placement/service.py:504); the read API
// counts exactly those turns (read/placement/service.py:39). A turn that was
// only asked (asked_at set, answered_at NULL) must never be reported as an
// answered turn, even if it carries a transcript.
describe("pending placement turn is not an answered turn", () => {
  let memorySession = null

  const activePayload = (turns) => ({
    data: {
      has_active_session: true,
      session: {
        session_id: "psess_pending",
        status: "in_progress",
        seed_band: 1,
        current_turn: 1,
        total_turns: 5,
        started_at: "2026-10-31T10:00:00Z",
        expires_at: "2026-11-01T10:00:00Z",
        turns,
      },
    },
  })

  const pendingTurn = (overrides = {}) => ({
    turn_index: 1,
    question_text: "你家有几口人？",
    question_hsk_level: 1,
    transcript: "",
    speech_duration_ms: 18000,
    retry_count: 0,
    asked_at: "2026-10-31T10:00:01Z",
    answered_at: null,
    ...overrides,
  })

  beforeEach(() => {
    memorySession = null
  })

  it("resume modal sees 0 answers for a recorded but unsubmitted turn", async () => {
    const response = activePayload([
      pendingTurn({ transcript: "我家有四口人", speech_duration_ms: 18000 }),
    ])
    const res = await getActiveSessionReal({
      baseQuery: vi.fn().mockResolvedValue(response),
      persist: (session) => {
        memorySession = session
      },
      read: () => memorySession,
    })

    const lifecycle = getSessionLifecycle({ session: res.data, now: Date.now() })

    expect(lifecycle.kind).toBe(SESSION_LIFECYCLE_KIND.RESUME)
    expect(lifecycle.answeredCount).toBe(0)
    expect(lifecycle.nextOrder).toBe(1)
  })

  it("resume modal counts only the submitted turn before the pending one", async () => {
    const response = activePayload([
      pendingTurn({ transcript: "我家有四口人", answered_at: "2026-10-31T10:02:00Z" }),
      pendingTurn({ turn_index: 2, question_text: "你周末喜欢做什么？" }),
    ])
    const res = await getActiveSessionReal({
      baseQuery: vi.fn().mockResolvedValue(response),
      persist: (session) => {
        memorySession = session
      },
      read: () => memorySession,
    })

    const lifecycle = getSessionLifecycle({ session: res.data, now: Date.now() })

    expect(lifecycle.answeredCount).toBe(1)
    expect(lifecycle.nextOrder).toBe(2)
  })

  it("submit without a turn index targets the first unanswered turn", async () => {
    memorySession = {
      id: "psess_pending",
      targetBand: 1,
      turns: [pendingTurn({ order: 1 })],
    }
    const mockBaseQuery = vi.fn().mockResolvedValue({
      data: {
        is_completed: false,
        turn_result: {
          turn_index: 1,
          transcript: "我家有四口人",
          accuracy_score: 90,
          speech_detected: true,
          next_probe_hsk_level: 2,
        },
      },
    })

    await submitTurnReal(
      { sessionId: "psess_pending" },
      {
        baseQuery: mockBaseQuery,
        read: () => memorySession,
        persist: (session) => {
          memorySession = session
        },
      },
    )

    const body = mockBaseQuery.mock.calls[0][0].body
    expect(body.get("turn_index")).toBe("1")
  })

  it("mock question loader asks the pending turn again instead of skipping it", async () => {
    memorySession = {
      id: "sess_mock",
      status: "in_progress",
      targetBand: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      turns: [pendingTurn({ order: 1, transcript: "我家有四口人" })],
    }

    const res = await getQuestionMock({
      sessionId: "sess_mock",
      delayMs: 0,
      read: () => memorySession,
    })

    expect(res.error).toBeUndefined()
    expect(res.data.turn_index).toBe(1)
  })
})
