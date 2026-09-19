import { describe, expect, it } from "vitest"
import { SCORING_STEP_STATUS, computeScoringProgress } from "./scoring"

const statuses = (steps) => steps.map((step) => step.status)

describe("computeScoringProgress", () => {
  it("starts with the first step active and the rest pending", () => {
    const steps = computeScoringProgress(0)
    expect(statuses(steps)).toEqual([
      SCORING_STEP_STATUS.ACTIVE,
      SCORING_STEP_STATUS.PENDING,
      SCORING_STEP_STATUS.PENDING,
    ])
    expect(steps[0].percent).toBe(0)
  })

  it("completes the first step and animates the second at the midpoint", () => {
    const steps = computeScoringProgress(900, { durationMs: 1800 })
    expect(steps[0]).toMatchObject({ status: SCORING_STEP_STATUS.DONE, percent: 100 })
    expect(steps[1].status).toBe(SCORING_STEP_STATUS.ACTIVE)
    expect(steps[1].percent).toBeGreaterThan(0)
    expect(steps[1].percent).toBeLessThan(100)
    expect(steps[2].status).toBe(SCORING_STEP_STATUS.PENDING)
  })

  it("activates the last step after the second completes", () => {
    const steps = computeScoringProgress(1620, { durationMs: 1800 })
    expect(statuses(steps)).toEqual([
      SCORING_STEP_STATUS.DONE,
      SCORING_STEP_STATUS.DONE,
      SCORING_STEP_STATUS.ACTIVE,
    ])
  })

  it("marks every step done once the duration elapses", () => {
    const steps = computeScoringProgress(5000, { durationMs: 1800 })
    expect(
      steps.every(
        (step) =>
          step.status === SCORING_STEP_STATUS.DONE && step.percent === 100,
      ),
    ).toBe(true)
  })

  it("treats invalid elapsed input as zero", () => {
    expect(statuses(computeScoringProgress(Number.NaN))).toEqual([
      SCORING_STEP_STATUS.ACTIVE,
      SCORING_STEP_STATUS.PENDING,
      SCORING_STEP_STATUS.PENDING,
    ])
  })
})
