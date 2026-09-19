import { describe, expect, it } from "vitest"
import {
  RETAKE_COOLDOWN_DAYS,
  RETAKE_COOLDOWN_MS,
} from "../constants/lifecycle"
import { getRetakeEligibility, getRoadmapProgress } from "./cooldown"

const DAY_MS = 24 * 60 * 60 * 1000
const LAST = 1700000000000

describe("getRetakeEligibility", () => {
  it("marks a student with no test history as eligible", () => {
    const result = getRetakeEligibility({ lastTestedAt: null, now: LAST })
    expect(result).toEqual({
      hasHistory: false,
      eligible: true,
      lastTestedAt: null,
      eligibleAt: null,
      daysElapsed: 0,
      daysRemaining: 0,
      progress: 0,
      totalDays: RETAKE_COOLDOWN_DAYS,
    })
  })

  it("counts elapsed and remaining days inside the cooldown window", () => {
    const result = getRetakeEligibility({
      lastTestedAt: LAST,
      now: LAST + 12 * DAY_MS,
    })
    expect(result.hasHistory).toBe(true)
    expect(result.eligible).toBe(false)
    expect(result.daysElapsed).toBe(12)
    expect(result.daysRemaining).toBe(2)
    expect(result.progress).toBe(85)
    expect(result.eligibleAt).toBe(LAST + RETAKE_COOLDOWN_MS)
  })

  it("becomes eligible exactly at the 14-day boundary", () => {
    const result = getRetakeEligibility({
      lastTestedAt: LAST,
      now: LAST + RETAKE_COOLDOWN_MS,
    })
    expect(result.eligible).toBe(true)
    expect(result.daysElapsed).toBe(14)
    expect(result.daysRemaining).toBe(0)
    expect(result.progress).toBe(100)
  })

  it("stays eligible after the window closes", () => {
    const result = getRetakeEligibility({
      lastTestedAt: LAST,
      now: LAST + 40 * DAY_MS,
    })
    expect(result.eligible).toBe(true)
    expect(result.daysElapsed).toBe(14)
    expect(result.daysRemaining).toBe(0)
    expect(result.progress).toBe(100)
  })

  it("clamps a clock that runs before the stored test", () => {
    const result = getRetakeEligibility({
      lastTestedAt: LAST,
      now: LAST - 5 * DAY_MS,
    })
    expect(result.eligible).toBe(false)
    expect(result.daysElapsed).toBe(0)
    expect(result.daysRemaining).toBe(14)
    expect(result.progress).toBe(0)
  })
})

describe("getRoadmapProgress", () => {
  it("maps a fresh cooldown to a 0/5 roadmap", () => {
    const progress = getRoadmapProgress({ eligible: false, progress: 0 })
    expect(progress.completed).toBe(0)
    expect(progress.percent).toBe(0)
    expect(progress.stages).toEqual([
      { key: "stage1", done: false, active: true },
      { key: "stage2", done: false, active: false },
      { key: "stage3", done: false, active: false },
    ])
  })

  it("maps a 12/14 cooldown to 4/5 days with stage 3 active", () => {
    const progress = getRoadmapProgress({ eligible: false, progress: 85 })
    expect(progress.completed).toBe(4)
    expect(progress.percent).toBe(80)
    expect(progress.stages).toEqual([
      { key: "stage1", done: true, active: false },
      { key: "stage2", done: true, active: false },
      { key: "stage3", done: false, active: true },
    ])
  })

  it("completes every stage when eligible", () => {
    const progress = getRoadmapProgress({ eligible: true, progress: 100 })
    expect(progress.completed).toBe(5)
    expect(progress.percent).toBe(100)
    expect(progress.stages.every((stage) => stage.done)).toBe(true)
    expect(progress.stages.some((stage) => stage.active)).toBe(false)
  })
})
