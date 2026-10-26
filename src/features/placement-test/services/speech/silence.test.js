import { describe, expect, it } from "vitest"
import { createSilenceTracker } from "./silence"

const buildClock = () => {
  let value = 0
  return {
    now: () => value,
    set: (next) => {
      value = next
    },
  }
}

describe("createSilenceTracker", () => {
  it("never auto-submits before the user has spoken", () => {
    const clock = buildClock()
    const tracker = createSilenceTracker({ now: clock.now, threshold: 0.01 })
    tracker.reset(0)
    clock.set(10000)
    expect(tracker.push(0).shouldSubmit).toBe(false)
  })

  it("does not auto-submit while inside the grace period", () => {
    const clock = buildClock()
    const tracker = createSilenceTracker({
      now: clock.now,
      threshold: 0.01,
      silenceMs: 2000,
      graceMs: 3000,
    })
    tracker.reset(0)
    clock.set(500)
    tracker.push(0.5)
    clock.set(2600)
    const state = tracker.push(0)
    expect(state.silentMs).toBe(2100)
    expect(state.withinGrace).toBe(true)
    expect(state.shouldSubmit).toBe(false)
  })

  it("auto-submits after enough silence once the grace period passed", () => {
    const clock = buildClock()
    const tracker = createSilenceTracker({
      now: clock.now,
      threshold: 0.01,
      silenceMs: 2000,
      graceMs: 3000,
    })
    tracker.reset(0)
    clock.set(1000)
    tracker.push(0.5)
    clock.set(2900)
    expect(tracker.push(0).shouldSubmit).toBe(false)
    clock.set(3000)
    const state = tracker.push(0)
    expect(state.silentMs).toBe(2000)
    expect(state.shouldSubmit).toBe(true)
  })

  it("resets voice memory when restarted", () => {
    const clock = buildClock()
    const tracker = createSilenceTracker({ now: clock.now, threshold: 0.01 })
    tracker.reset(0)
    clock.set(1000)
    tracker.push(0.5)
    expect(tracker.push(0).hasSpoken).toBe(true)
    tracker.reset(5000)
    clock.set(9000)
    expect(tracker.push(0).hasSpoken).toBe(false)
  })
})
