import { describe, expect, it } from "vitest"
import { PLACEMENT_TEST_PATHS } from "./routes"

describe("placement test routes", () => {
  it("exposes the five feature route paths", () => {
    expect(PLACEMENT_TEST_PATHS).toEqual([
      "/zh/ai-tutor/level-assessment",
      "/zh/ai-tutor/level-assessment/session",
      "/zh/ai-tutor/level-assessment/scoring",
      "/zh/ai-tutor/level-assessment/result",
      "/zh/ai-tutor/level-assessment/profile",
    ])
  })
})
