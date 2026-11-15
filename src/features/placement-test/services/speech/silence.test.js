import { describe, expect, it } from "vitest"
import {
  NOT_HEARING_BANNER_MS,
  NOT_HEARING_EXIT_MS,
} from "../../constants/conversation"
import { createNoHearingWatcher, createSilenceTracker } from "./silence"

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

describe("createNoHearingWatcher", () => {
  const buildWatcher = (clock) =>
    createNoHearingWatcher({
      bannerMs: NOT_HEARING_BANNER_MS,
      exitMs: NOT_HEARING_EXIT_MS,
      now: clock.now,
      threshold: 0.01,
    })

  it("warns after 3 s of silence and asks to leave after 10 s", () => {
    const clock = buildClock()
    const watcher = buildWatcher(clock)
    watcher.reset(0)

    clock.set(1000)
    expect(watcher.push(0)).toMatchObject({
      showBanner: false,
      shouldExit: false,
    })

    clock.set(NOT_HEARING_BANNER_MS)
    expect(watcher.push(0)).toMatchObject({
      showBanner: true,
      shouldExit: false,
    })

    clock.set(NOT_HEARING_EXIT_MS - 1)
    expect(watcher.push(0).shouldExit).toBe(false)

    clock.set(NOT_HEARING_EXIT_MS)
    expect(watcher.push(0)).toMatchObject({
      showBanner: true,
      shouldExit: true,
    })
  })

  it("closes the warning and restarts the countdown when the user speaks", () => {
    const clock = buildClock()
    const watcher = buildWatcher(clock)
    watcher.reset(0)

    clock.set(NOT_HEARING_BANNER_MS + 1000)
    expect(watcher.push(0).showBanner).toBe(true)

    clock.set(NOT_HEARING_BANNER_MS + 2000)
    expect(watcher.push(0.5)).toMatchObject({
      showBanner: false,
      shouldExit: false,
    })

    // Countdown restarts from the last voice sample, not the recording start.
    clock.set(NOT_HEARING_BANNER_MS + 3000)
    expect(watcher.push(0).showBanner).toBe(false)
    clock.set(NOT_HEARING_BANNER_MS + 5000)
    expect(watcher.push(0).showBanner).toBe(true)
    clock.set(NOT_HEARING_BANNER_MS + 2000 + NOT_HEARING_EXIT_MS)
    expect(watcher.push(0).shouldExit).toBe(true)
  })
})
