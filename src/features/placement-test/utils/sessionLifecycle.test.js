import { describe, expect, it } from "vitest"
import { RESUME_WINDOW_MS } from "../constants/lifecycle"
import { SESSION_STATUS } from "../constants/session"
import {
  SESSION_LIFECYCLE_KIND,
  getResumeDeadline,
  getSessionActivityAt,
  getSessionLifecycle,
  isUnfinishedSession,
} from "./sessionLifecycle"

const HOUR_MS = 60 * 60 * 1000
const ACTIVITY = 1710000000000

const buildSession = (overrides = {}) => ({
  id: "pt-1",
  status: SESSION_STATUS.PAUSED,
  targetBand: "hsk3_4",
  createdAt: ACTIVITY,
  updatedAt: ACTIVITY,
  turns: [],
  ...overrides,
})

describe("isUnfinishedSession", () => {
  it("accepts in-progress and paused sessions", () => {
    expect(isUnfinishedSession(buildSession({ status: SESSION_STATUS.IN_PROGRESS }))).toBe(true)
    expect(isUnfinishedSession(buildSession({ status: SESSION_STATUS.PAUSED }))).toBe(true)
  })

  it("rejects completed, scoring and missing sessions", () => {
    expect(isUnfinishedSession(buildSession({ status: SESSION_STATUS.COMPLETED }))).toBe(false)
    expect(isUnfinishedSession(buildSession({ status: SESSION_STATUS.SCORING }))).toBe(false)
    expect(isUnfinishedSession(null)).toBe(false)
  })
})

describe("getSessionActivityAt", () => {
  it("uses the latest activity timestamp", () => {
    expect(getSessionActivityAt({ updatedAt: 3, pausedAt: 2, createdAt: 1 })).toBe(3)
    expect(getSessionActivityAt({ updatedAt: 0, pausedAt: 2, createdAt: 1 })).toBe(2)
    expect(getSessionActivityAt({ updatedAt: 2, pausedAt: 5, createdAt: 1 })).toBe(5)
    expect(getSessionActivityAt({ createdAt: 1 })).toBe(1)
    expect(getSessionActivityAt(null)).toBe(0)
  })
})

describe("getResumeDeadline", () => {
  it("adds the 24h window to the last activity", () => {
    expect(getResumeDeadline(buildSession())).toBe(ACTIVITY + RESUME_WINDOW_MS)
  })
})

describe("getSessionLifecycle", () => {
  it("returns null when there is no unfinished session", () => {
    expect(getSessionLifecycle({ session: null, now: ACTIVITY })).toBeNull()
    expect(
      getSessionLifecycle({
        session: buildSession({ status: SESSION_STATUS.COMPLETED }),
        now: ACTIVITY,
      }),
    ).toBeNull()
  })

  it("classifies a recent session as resumable with the next order", () => {
    const lifecycle = getSessionLifecycle({
      session: buildSession({
        turns: [{ order: 1 }, { order: 2 }],
      }),
      now: ACTIVITY + 6 * HOUR_MS,
    })

    expect(lifecycle.kind).toBe(SESSION_LIFECYCLE_KIND.RESUME)
    expect(lifecycle.expired).toBe(false)
    expect(lifecycle.answeredCount).toBe(2)
    expect(lifecycle.nextOrder).toBe(3)
    expect(lifecycle.totalTurns).toBe(5)
    expect(lifecycle.remainingMs).toBe(18 * HOUR_MS)
    expect(lifecycle.expiresAt).toBe(ACTIVITY + RESUME_WINDOW_MS)
  })

  it("expires exactly at the 24h boundary", () => {
    const lifecycle = getSessionLifecycle({
      session: buildSession(),
      now: ACTIVITY + RESUME_WINDOW_MS,
    })
    expect(lifecycle.kind).toBe(SESSION_LIFECYCLE_KIND.EXPIRED)
    expect(lifecycle.expired).toBe(true)
    expect(lifecycle.remainingMs).toBe(0)
  })

  it("stays expired past the window", () => {
    const lifecycle = getSessionLifecycle({
      session: buildSession(),
      now: ACTIVITY + RESUME_WINDOW_MS + HOUR_MS,
    })
    expect(lifecycle.kind).toBe(SESSION_LIFECYCLE_KIND.EXPIRED)
  })

  it("clamps the next order to the total number of questions", () => {
    const lifecycle = getSessionLifecycle({
      session: buildSession({
        turns: [{ order: 1 }, { order: 2 }, { order: 3 }, { order: 4 }, { order: 5 }],
      }),
      now: ACTIVITY,
    })
    expect(lifecycle.answeredCount).toBe(5)
    expect(lifecycle.nextOrder).toBe(5)
  })

  it("accepts an overridden window", () => {
    const lifecycle = getSessionLifecycle({
      session: buildSession(),
      now: ACTIVITY + 2 * HOUR_MS,
      windowMs: HOUR_MS,
    })
    expect(lifecycle.kind).toBe(SESSION_LIFECYCLE_KIND.EXPIRED)
  })
})
