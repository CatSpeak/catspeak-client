import { describe, expect, it } from "vitest"
import { MAX_RECONNECT_ATTEMPTS, PAUSE_BUDGET_MS } from "../constants/lifecycle"
import {
  advancePauseBudget,
  deadlineFromRemaining,
  remainingPauseBudget,
  remainingQuestionMs,
  startReconnect,
  tickReconnect,
} from "./lifecycle"

describe("remainingQuestionMs", () => {
  it("returns time left until the deadline", () => {
    expect(remainingQuestionMs(10000, 4000)).toBe(6000)
  })

  it("never returns a negative value", () => {
    expect(remainingQuestionMs(4000, 10000)).toBe(0)
  })

  it("treats missing values as zero", () => {
    expect(remainingQuestionMs(undefined, 1000)).toBe(0)
    expect(remainingQuestionMs(5000, undefined)).toBe(5000)
  })
})

describe("deadlineFromRemaining", () => {
  it("adds the remaining time to now", () => {
    expect(deadlineFromRemaining(1000, 5000)).toBe(6000)
  })

  it("clamps negative remaining time to now", () => {
    expect(deadlineFromRemaining(1000, -500)).toBe(1000)
  })
})

describe("remainingPauseBudget", () => {
  it("subtracts spent time from the budget", () => {
    expect(remainingPauseBudget(15000)).toBe(PAUSE_BUDGET_MS - 15000)
  })

  it("never drops below zero", () => {
    expect(remainingPauseBudget(PAUSE_BUDGET_MS + 1000)).toBe(0)
  })
})

describe("advancePauseBudget", () => {
  it("accumulates elapsed pause time", () => {
    expect(advancePauseBudget(1000, 2000)).toBe(3000)
  })

  it("caps at the budget", () => {
    expect(advancePauseBudget(PAUSE_BUDGET_MS - 500, 1000)).toBe(PAUSE_BUDGET_MS)
  })

  it("ignores negative deltas", () => {
    expect(advancePauseBudget(1000, -500)).toBe(1000)
  })
})

describe("startReconnect", () => {
  it("starts on attempt one with a full countdown", () => {
    expect(startReconnect()).toEqual({
      attempt: 1,
      remainingMs: 15000,
      exhausted: false,
    })
  })
})

describe("tickReconnect", () => {
  it("counts down without changing the attempt number", () => {
    const next = tickReconnect(
      { attempt: 1, remainingMs: 15000, exhausted: false },
      5000,
    )
    expect(next).toEqual({ attempt: 1, remainingMs: 10000, exhausted: false })
  })

  it("advances the attempt when the countdown reaches zero", () => {
    const next = tickReconnect(
      { attempt: 1, remainingMs: 1000, exhausted: false },
      1000,
    )
    expect(next).toEqual({ attempt: 2, remainingMs: 15000, exhausted: false })
  })

  it("marks the cycle exhausted after the final attempt", () => {
    const next = tickReconnect(
      { attempt: MAX_RECONNECT_ATTEMPTS, remainingMs: 1000, exhausted: false },
      1000,
    )
    expect(next).toEqual({
      attempt: MAX_RECONNECT_ATTEMPTS,
      remainingMs: 0,
      exhausted: true,
    })
  })
})
