import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getActiveSessionReal, resumeSessionReal } from "./api/realAdapter"
import { resumeSessionMock } from "./api/mockAdapter"
import { SESSION_STATUS } from "./constants/session"
import { countSubmittedTurns } from "./utils/turns"
import { getResumeOrder, isRoomReload } from "./utils/sessionLifecycle"
import { readRoomMarker, writeRoomMarker } from "./utils/roomMarker"

// Oracle: the engine marks a turn complete only when `answered_at` is stamped
// (catspeak-ai/src/catspeak_ai/write/placement/service.py:504) and reports
// `current_turn = answered + 1` (read/placement/service.py:39-41). After Q1 the
// learner has 1 answer and turn 2 is pending.
const SESSION_ID = "psess_resume_intent"

const serverTurn = (turnIndex, extra = {}) => ({
  turn_index: turnIndex,
  question_text: "你是哪国人？",
  question_pinyin: "nǐ shì nǎ guó rén",
  question_hsk_level: 1,
  transcript: turnIndex === 1 ? "我是越南人" : "",
  speech_duration_ms: turnIndex === 1 ? 18000 : 0,
  retry_count: 0,
  asked_at: "2026-10-31T10:00:01Z",
  answered_at: null,
  ...extra,
})

const serverSession = () => ({
  session_id: SESSION_ID,
  status: "in_progress",
  seed_band: 1,
  current_turn: 2,
  total_turns: 5,
  started_at: "2026-10-31T10:00:00Z",
  expires_at: "2026-11-01T10:00:00Z",
  current_question: {
    turn_index: 2,
    hsk_level: 1,
    question_id: "turn_2",
    text: "你是哪国人？",
  },
  turns: [
    serverTurn(1, { answered_at: "2026-10-31T10:02:00Z" }),
    serverTurn(2),
  ],
})

const memoryStorage = () => {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

describe("dashboard resume enters the room without a second recovery modal", () => {
  let stored = null
  let sessionStorage

  const loadActive = async () => {
    await getActiveSessionReal({
      baseQuery: vi.fn().mockResolvedValue({
        data: { has_active_session: true, session: serverSession() },
      }),
      persist: (session) => {
        stored = session
      },
      read: () => stored,
    })
  }

  const clickContinue = async () => {
    const result = await resumeSessionReal(
      { sessionId: SESSION_ID, fromDashboard: true },
      {
        baseQuery: vi.fn().mockResolvedValue({ data: serverSession() }),
        persist: (session) => {
          stored = session
        },
        read: () => stored,
      },
    )
    expect(result.error).toBeUndefined()
  }

  beforeEach(() => {
    stored = null
    sessionStorage = memoryStorage()
    vi.stubGlobal("window", { sessionStorage })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("clears the stale room marker so the room does not prompt again", async () => {
    // The pre-expiry room left its tab marker behind: a hard reload/redirect
    // during re-login skips the room's unmount cleanup (useConversationLoop
    // writes it on mount and clears it only on a React unmount).
    writeRoomMarker(SESSION_ID)
    await loadActive()
    expect(isRoomReload(stored, readRoomMarker())).toBe(true)

    // "Tiếp Tục Làm Câu 2" on the dashboard recovery modal.
    await clickContinue()

    expect(isRoomReload(stored, readRoomMarker())).toBe(false)
    expect(countSubmittedTurns(stored.turns)).toBe(1)
    expect(
      getResumeOrder(stored, {
        answeredCount: countSubmittedTurns(stored.turns),
      }),
    ).toBe(2)
  })

  it("still treats a real reload as a reload while the marker matches", () => {
    stored = { id: SESSION_ID, turns: [] }
    writeRoomMarker(SESSION_ID)
    expect(isRoomReload(stored, readRoomMarker())).toBe(true)

    writeRoomMarker(null)
    expect(isRoomReload(stored, readRoomMarker())).toBe(false)
  })

  it("keeps the marker for the in-room F5 refresh so a further reload still warns", async () => {
    writeRoomMarker(SESSION_ID)
    await loadActive()

    await resumeSessionReal(
      { sessionId: SESSION_ID },
      {
        baseQuery: vi.fn().mockResolvedValue({ data: serverSession() }),
        persist: (session) => {
          stored = session
        },
        read: () => stored,
      },
    )

    expect(readRoomMarker()).toBe(SESSION_ID)
  })

  it("mock adapter follows the same explicit-resume contract", async () => {
    writeRoomMarker(SESSION_ID)
    const result = await resumeSessionMock(
      { sessionId: SESSION_ID, fromDashboard: true },
      {
        delayMs: 0,
        read: () => ({
          id: SESSION_ID,
          status: SESSION_STATUS.IN_PROGRESS,
          turns: [],
        }),
        readResult: () => null,
      },
    )

    expect(result.error).toBeUndefined()
    expect(readRoomMarker()).toBe(null)
  })
})
