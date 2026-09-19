import { describe, expect, it } from "vitest"
import { PLACEMENT_TEST_PATHS } from "./routes"

describe("placement test routes", () => {
  it("exposes the five feature route paths", () => {
    expect(PLACEMENT_TEST_PATHS).toEqual([
      "/placement-test",
      "/placement-test/session",
      "/placement-test/scoring",
      "/placement-test/result",
      "/placement-test/profile",
    ])
  })
})
